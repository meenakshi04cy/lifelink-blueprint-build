-- Fix RLS policies to allow unauthenticated hospital registrations
-- Unauthenticated users should be able to submit hospital applications
-- Admins (authenticated) should be able to read all and update

-- DISABLE RLS temporarily to drop old policies cleanly
ALTER TABLE public.hospital_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Applicants can update their own pending applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow insert for all" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.hospital_applications;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.hospital_applications;
DROP POLICY IF EXISTS "Anyone can submit hospital application" ON public.hospital_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.hospital_applications;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Applicants can view their own audit" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Allow all for authenticated on audit" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Allow insert on audit" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.hospital_application_audit;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.hospital_application_audit;

-- RE-ENABLE RLS
ALTER TABLE public.hospital_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SIMPLE & PERMISSIVE POLICIES
-- ========================================

-- Policy 1: ANYONE can INSERT hospital applications (no authentication required)
CREATE POLICY "Allow anyone to submit application"
  ON public.hospital_applications
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: AUTHENTICATED users can SELECT (READ) 
-- This allows both admins and authenticated users to read
-- The frontend will handle admin-specific filtering
CREATE POLICY "Allow authenticated to read applications"
  ON public.hospital_applications
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 3: AUTHENTICATED users can UPDATE applications
CREATE POLICY "Allow authenticated to update applications"
  ON public.hospital_applications
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy 4: AUTHENTICATED users can DELETE applications
CREATE POLICY "Allow authenticated to delete applications"
  ON public.hospital_applications
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ========================================
-- AUDIT TABLE POLICIES
-- ========================================

-- Policy 1: AUTHENTICATED users can INSERT audit logs
CREATE POLICY "Allow authenticated to insert audit"
  ON public.hospital_application_audit
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy 2: AUTHENTICATED users can SELECT (READ) audit logs
CREATE POLICY "Allow authenticated to read audit"
  ON public.hospital_application_audit
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy 3: AUTHENTICATED users can UPDATE audit logs
CREATE POLICY "Allow authenticated to update audit"
  ON public.hospital_application_audit
  FOR UPDATE
  USING (auth.role() = 'authenticated');

