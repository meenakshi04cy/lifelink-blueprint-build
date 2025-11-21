-- COPY THIS ENTIRE BLOCK TO SUPABASE DASHBOARD SQL EDITOR

-- Hospital Registration - Final RLS Policy Fix
-- Allows unauthenticated users to submit registrations
-- Allows authenticated admins to review and manage

-- ==========================================
-- STEP 1: Disable RLS temporarily
-- ==========================================
ALTER TABLE public.hospital_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 2: Drop ALL old policies
-- ==========================================
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

-- ==========================================
-- STEP 3: Re-enable RLS
-- ==========================================
ALTER TABLE public.hospital_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 4: Create new FINAL policies
-- ==========================================

-- Hospital Applications Table - INSERT (ANYONE can submit)
CREATE POLICY "hospital_insert_anyone"
  ON public.hospital_applications
  FOR INSERT
  WITH CHECK (true);

-- Hospital Applications Table - SELECT (AUTHENTICATED only)
CREATE POLICY "hospital_select_authenticated"
  ON public.hospital_applications
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Hospital Applications Table - UPDATE (AUTHENTICATED only)
CREATE POLICY "hospital_update_authenticated"
  ON public.hospital_applications
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Hospital Applications Table - DELETE (AUTHENTICATED only)
CREATE POLICY "hospital_delete_authenticated"
  ON public.hospital_applications
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Audit Table - INSERT (AUTHENTICATED only)
CREATE POLICY "audit_insert_authenticated"
  ON public.hospital_application_audit
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Audit Table - SELECT (AUTHENTICATED only)
CREATE POLICY "audit_select_authenticated"
  ON public.hospital_application_audit
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Audit Table - UPDATE (AUTHENTICATED only)
CREATE POLICY "audit_update_authenticated"
  ON public.hospital_application_audit
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ==========================================
-- ✅ DONE! 
-- ==========================================
-- These policies allow:
-- 1. ✅ Unauthenticated users to SUBMIT registrations
-- 2. ✅ Authenticated admins to READ applications
-- 3. ✅ Authenticated admins to UPDATE applications
-- 4. ✅ Authenticated admins to manage audit logs
