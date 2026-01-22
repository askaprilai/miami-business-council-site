-- Miami Business Council - Supabase Auth Migration
-- This migration adds magic link authentication support
-- Run this in your Supabase SQL editor AFTER the main supabase-setup.sql

-- Step 1: Add auth_user_id column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Step 2: Create index for auth_user_id for better performance
CREATE INDEX IF NOT EXISTS idx_members_auth_user_id ON members(auth_user_id);

-- Step 3: Create function to automatically create/link member profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update member record when auth user is created
  INSERT INTO public.members (
    auth_user_id,
    email,
    first_name,
    last_name,
    company_name,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    true
  )
  ON CONFLICT (email)
  DO UPDATE SET
    auth_user_id = NEW.id,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger to call function when new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Update RLS policies to use auth.uid() instead of member id
-- Drop old policies
DROP POLICY IF EXISTS "Members can update own profile" ON members;

-- Create new auth-based policies
CREATE POLICY "Members can update own profile" ON members
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Allow members to read own profile even when not active
CREATE POLICY "Members can read own profile" ON members
  FOR SELECT
  USING (auth.uid() = auth_user_id OR is_active = true);

-- Update business opportunities policies to use auth_user_id
DROP POLICY IF EXISTS "Members can manage own opportunities" ON business_opportunities;
CREATE POLICY "Members can manage own opportunities" ON business_opportunities
  FOR ALL
  USING (
    auth.uid() = (
      SELECT auth_user_id FROM members WHERE members.id = business_opportunities.member_id
    )
  );

-- Update connection policies to use auth_user_id
DROP POLICY IF EXISTS "Members can view their connections" ON member_connections;
CREATE POLICY "Members can view their connections" ON member_connections
  FOR SELECT
  USING (
    auth.uid() = (SELECT auth_user_id FROM members WHERE members.id = member_connections.requester_id) OR
    auth.uid() = (SELECT auth_user_id FROM members WHERE members.id = member_connections.recipient_id)
  );

DROP POLICY IF EXISTS "Members can create connection requests" ON member_connections;
CREATE POLICY "Members can create connection requests" ON member_connections
  FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT auth_user_id FROM members WHERE members.id = member_connections.requester_id)
  );

DROP POLICY IF EXISTS "Recipients can update connection status" ON member_connections;
CREATE POLICY "Recipients can update connection status" ON member_connections
  FOR UPDATE
  USING (
    auth.uid() = (SELECT auth_user_id FROM members WHERE members.id = member_connections.recipient_id)
  );

-- Update event registration policies to use auth_user_id
DROP POLICY IF EXISTS "Members can view own registrations" ON event_registrations;
CREATE POLICY "Members can view own registrations" ON event_registrations
  FOR SELECT
  USING (
    auth.uid() = (SELECT auth_user_id FROM members WHERE members.id = event_registrations.member_id)
  );

DROP POLICY IF EXISTS "Members can register for events" ON event_registrations;
CREATE POLICY "Members can register for events" ON event_registrations
  FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT auth_user_id FROM members WHERE members.id = event_registrations.member_id)
  );

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Add helpful comment
COMMENT ON COLUMN members.auth_user_id IS 'Links member profile to Supabase Auth user for magic link authentication';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Supabase Auth migration completed successfully!';
  RAISE NOTICE '📧 Next steps:';
  RAISE NOTICE '1. Enable Email Auth provider in Supabase Dashboard → Authentication → Providers';
  RAISE NOTICE '2. Enable magic link sign-in in Email provider settings';
  RAISE NOTICE '3. Run the member migration script to link existing members';
  RAISE NOTICE '4. Update frontend code to use Supabase Auth';
END $$;
