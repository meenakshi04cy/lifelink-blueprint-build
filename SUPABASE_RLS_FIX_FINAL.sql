-- HOSPITAL RLS FIX - ULTIMATE - Drops EVERYTHING including partially created policies
-- This is the nuclear option that ensures a clean slate before recreating policies

-- Step 1: Disable RLS to allow policy drops
ALTER TABLE public.hospital_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL possible policy names (comprehensive list from all attempts)
DROP POLICY IF EXISTS "allow_insert_all" ON public.hospital_applications;
DROP POLICY IF EXISTS "allow_select_authenticated" ON public.hospital_applications;
DROP POLICY IF EXISTS "allow_update_authenticated" ON public.hospital_applications;
DROP POLICY IF EXISTS "audit_allow_insert" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "audit_allow_select" ON public.hospital_application_audit;

DROP POLICY IF EXISTS "Anyone can submit hospital application" ON public.hospital_applications;
DROP POLICY IF EXISTS "Authenticated users can read applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Authenticated can read audit logs" ON public.hospital_application_audit;

DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Admins can view all applications v2" ON public.hospital_applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Anyone can insert applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow insert for all" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.hospital_applications;
DROP POLICY IF EXISTS "Applicants can update their own pending applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Applicants can update their own pending applications v2" ON public.hospital_applications;
DROP POLICY IF EXISTS "Applicants can update their own applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Admins can update applications v2" ON public.hospital_applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow anyone to submit application" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow authenticated to read applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow authenticated to update applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow authenticated to delete applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "hospital_app_insert_policy" ON public.hospital_applications;
DROP POLICY IF EXISTS "hospital_app_select_policy" ON public.hospital_applications;
DROP POLICY IF EXISTS "hospital_app_update_policy" ON public.hospital_applications;
DROP POLICY IF EXISTS "hospital_app_delete_policy" ON public.hospital_applications;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Applicants can view their own audit" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Allow all for authenticated on audit" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Allow insert on audit" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Allow authenticated to insert audit" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Allow authenticated to read audit" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Allow authenticated to update audit" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "audit_insert_policy" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "audit_select_policy" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "audit_update_policy" ON public.hospital_application_audit;

-- Step 3: Re-enable RLS with clean policies using UNIQUE names
ALTER TABLE public.hospital_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE: Anyone can INSERT (unauthenticated form submissions)
CREATE POLICY "hospital_insert_permissive_2025"
  ON public.hospital_applications
  FOR INSERT
  WITH CHECK (true);

-- PERMISSIVE: Only authenticated users (admins/staff) can SELECT
CREATE POLICY "hospital_select_authenticated_2025"
  ON public.hospital_applications
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- PERMISSIVE: Only authenticated users can UPDATE
CREATE POLICY "hospital_update_authenticated_2025"
  ON public.hospital_applications
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- DELETE: Only authenticated users (restrictive)
CREATE POLICY "hospital_delete_authenticated_2025"
  ON public.hospital_applications
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Audit table policies - authenticated only
CREATE POLICY "audit_insert_authenticated_2025"
  ON public.hospital_application_audit
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "audit_select_authenticated_2025"
  ON public.hospital_application_audit
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "audit_update_authenticated_2025"
  ON public.hospital_application_audit
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "audit_delete_authenticated_2025"
  ON public.hospital_application_audit
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Verify RLS is enabled
ALTER TABLE public.hospital_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit ENABLE ROW LEVEL SECURITY;

-- Done!
-- Now hospital registration form submissions should work
-- Test by:
-- 1. Fill out /hospital/register form
-- 2. Go to /admin/hospitals/pending
-- 3. Click Refresh
-- 4. New hospital should appear
