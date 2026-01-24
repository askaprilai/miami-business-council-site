-- Step 1: Create the trigger to auto-link auth users to member records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.members
  SET auth_user_id = NEW.id
  WHERE email = NEW.email
  AND auth_user_id IS NULL;

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
    ON CONFLICT (email) DO UPDATE SET auth_user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 2: Link any existing auth users to their member records
UPDATE members
SET auth_user_id = auth.users.id
FROM auth.users
WHERE members.email = auth.users.email
AND members.auth_user_id IS NULL;

-- Step 3: Check status of Atiba, Lubna, and Thomas
SELECT
    m.email,
    m.first_name,
    m.last_name,
    m.auth_user_id,
    CASE
        WHEN m.auth_user_id IS NOT NULL THEN '✅ READY - Can log in'
        ELSE '❌ NEEDS FIX - No auth account'
    END as status,
    CASE
        WHEN m.auth_user_id IS NOT NULL THEN 'User can request magic link at login page'
        ELSE 'Admin needs to re-invite this member'
    END as action_needed
FROM members m
WHERE m.email IN (
    'atiba@themadyungroup.com',
    'lubna@thelubnanajjar.com',
    'thomasmcclureofficial@gmail.com'
)
ORDER BY m.email;

-- Step 4: Show all auth users (to see who has auth accounts)
SELECT
    email,
    id as auth_user_id,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email IN (
    'atiba@themadyungroup.com',
    'lubna@thelubnanajjar.com',
    'thomasmcclureofficial@gmail.com'
)
ORDER BY email;
