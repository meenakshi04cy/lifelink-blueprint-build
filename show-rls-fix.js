// Display the required SQL fix for hospital registration RLS policies
// Run this to see the exact SQL needed in Supabase dashboard

const requiredSql = `-- CRITICAL FIX: Replace restrictive RLS policies with permissive ones
-- The old migration required auth.uid() = user_id which blocked unauthenticated inserts

-- Step 1: Disable RLS on both tables to clear old policies
ALTER TABLE public.hospital_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL old conflicting policies
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

-- Audit table cleanup
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

-- Step 3: Re-enable RLS with PERMISSIVE policies only
ALTER TABLE public.hospital_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE: Anyone (authenticated or unauthenticated) can INSERT
-- This uses WITH CHECK (true) which always evaluates to true
CREATE POLICY "Anyone can submit hospital application"
  ON public.hospital_applications
  FOR INSERT
  WITH CHECK (true);

-- PERMISSIVE: Authenticated users (admins, hospital staff) can read
CREATE POLICY "Authenticated users can read applications"
  ON public.hospital_applications
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- PERMISSIVE: Authenticated users can update (for admin actions)
CREATE POLICY "Authenticated users can update applications"
  ON public.hospital_applications
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Audit table policies - authenticated only
CREATE POLICY "Authenticated can insert audit logs"
  ON public.hospital_application_audit
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can read audit logs"
  ON public.hospital_application_audit
  FOR SELECT
  USING (auth.role() = 'authenticated');
`;

console.clear();
console.log("\n" + "═".repeat(70));
console.log("🚨 HOSPITAL REGISTRATION - CRITICAL RLS FIX REQUIRED");
console.log("═".repeat(70));

console.log("\n📋 PROBLEM:");
console.log("  ❌ The original RLS policy blocks unauthenticated form submissions");
console.log("  ❌ Only test data is showing in the admin dashboard");
console.log("  ❌ New hospital registrations fail silently");

console.log("\n✅ SOLUTION:");
console.log("  1. Go to: https://app.supabase.com");
console.log("  2. Select project: lifelink-blueprint-build");
console.log("  3. Go to: SQL Editor → New Query");
console.log("  4. Copy-paste the SQL below");
console.log("  5. Execute it");

console.log("\n" + "═".repeat(70));
console.log("🔧 COPY THIS SQL AND RUN IN SUPABASE:");
console.log("═".repeat(70));
console.log("\n");
console.log(requiredSql);
console.log("\n" + "═".repeat(70));
console.log("✅ AFTER RUNNING SQL:");
console.log("═".repeat(70));
console.log("  1. Test the form at /hospital/register");
console.log("  2. Go to /admin/hospitals/pending");
console.log("  3. Click Refresh button");
console.log("  4. New hospital should appear with documents");
console.log("\n");
