-- ============================================================================
-- FIX RLS POLICIES FOR USER REGISTRATION
-- Execute this SQL in Supabase SQL Editor to fix registration issues
-- ============================================================================

-- ============================================================================
-- STEP 1: Create function to handle new user registration
-- ============================================================================

-- This function will automatically create a user_profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, interests, preferred_budget, language)
  VALUES (
    NEW.id,
    '{}',
    'medio',
    'es'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 2: Create trigger on auth.users
-- ============================================================================

-- Drop trigger if it exists (in case you run this multiple times)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that runs after a new user is inserted
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 3: Update RLS policies for user_profiles (more permissive for inserts)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Recreate policies with correct permissions
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- This policy allows inserting if the user_id matches the authenticated user
-- OR if there's no existing profile (for the trigger to work)
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR NOT EXISTS (
      SELECT 1 FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 4: Grant necessary permissions
-- ============================================================================

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify everything is set up correctly:

-- 1. Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 3. Check RLS policies on user_profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- ============================================================================
-- OPTIONAL: Clean up existing profiles without proper data
-- ============================================================================

-- If you have test users with incomplete profiles, you can clean them up:
-- UNCOMMENT ONLY IF YOU WANT TO RESET

-- DELETE FROM user_profiles WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ============================================================================
-- END OF FIX
-- ============================================================================
