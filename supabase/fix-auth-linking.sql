-- Fix: Link auth users to member records automatically
-- This trigger ensures that when someone logs in with a magic link,
-- their auth account is linked to their member record

-- Step 1: Create function to link auth users to existing member records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to link auth user to existing member record by email
  UPDATE public.members
  SET auth_user_id = NEW.id
  WHERE email = NEW.email
  AND auth_user_id IS NULL;

  -- If no existing member record, create a new one
  IF NOT FOUND THEN
    INSERT INTO public.members (auth_user_id, email, first_name, last_name, company_name, is_active)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'To be completed'),
      true
    )
    ON CONFLICT (email) DO UPDATE
    SET auth_user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Fix existing members who already logged in but aren't linked
-- This will link any auth users to their member records retroactively
UPDATE members
SET auth_user_id = auth.users.id
FROM auth.users
WHERE members.email = auth.users.email
AND members.auth_user_id IS NULL;

-- Step 4: Verify the fix
SELECT
    m.email,
    m.first_name,
    m.last_name,
    m.auth_user_id,
    CASE
        WHEN m.auth_user_id IS NOT NULL THEN '✅ Linked'
        ELSE '❌ Not linked'
    END as status
FROM members m
ORDER BY m.email;
