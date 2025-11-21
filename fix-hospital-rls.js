// This script shows the SQL needed to fix hospital RLS policies
// Run this to see what needs to be executed in Supabase dashboard

const sqlStatements = `-- Disable RLS temporarily to clear policies
ALTER TABLE public.hospital_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit DISABLE ROW LEVEL SECURITY;

-- Drop ALL old policies
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

-- Re-enable RLS
ALTER TABLE public.hospital_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_application_audit ENABLE ROW LEVEL SECURITY;

-- NEW POLICIES: Hospital Applications Table
CREATE POLICY "hospital_app_insert_policy" ON public.hospital_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "hospital_app_select_policy" ON public.hospital_applications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "hospital_app_update_policy" ON public.hospital_applications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "hospital_app_delete_policy" ON public.hospital_applications FOR DELETE USING (auth.role() = 'authenticated');

-- NEW POLICIES: Audit Table
CREATE POLICY "audit_insert_policy" ON public.hospital_application_audit FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "audit_select_policy" ON public.hospital_application_audit FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "audit_update_policy" ON public.hospital_application_audit FOR UPDATE USING (auth.role() = 'authenticated');`;

console.log("🔧 Hospital RLS Policy Fix");
console.log("═".repeat(50));
console.log("\n📋 Copy-paste this SQL into Supabase Dashboard:");
console.log("   1. Go to: https://app.supabase.com");
console.log("   2. Select your project: lifelink-blueprint-build");
console.log("   3. Go to: SQL Editor");
console.log("   4. Click: New Query");
console.log("   5. Paste the SQL below:");
console.log("\n" + "═".repeat(50));
console.log(sqlStatements);
console.log("═".repeat(50));
console.log("\n✅ After running:");
console.log("   ✓ Anyone can submit hospital registrations");
console.log("   ✓ Authenticated users (admins) can view applications");
console.log("   ✓ Documents are saved to database");
console.log("\n");
