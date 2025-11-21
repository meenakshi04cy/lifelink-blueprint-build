import { createClient } from "@supabase/supabase-js";

// This script applies the hospital application RLS policies directly
// Usage: npx ts-node fix-hospital-rls.ts

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   VITE_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", SERVICE_ROLE_KEY ? "✓" : "✗");
  console.error(
    "\nSet these in your .env file or pass as environment variables"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fixRLS() {
  console.log("🔧 Starting RLS policy fix...\n");

  const policies = [
    // DROP old policies
    `DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Admins can view all applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Admins can view all applications v2" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Users can insert their own applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Anyone can insert applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Allow insert for all" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Allow update for authenticated" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Applicants can update their own pending applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Applicants can update their own applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Admins can update applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Admins can delete applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Allow anyone to submit application" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Allow authenticated to read applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Allow authenticated to update applications" ON public.hospital_applications;`,
    `DROP POLICY IF EXISTS "Allow authenticated to delete applications" ON public.hospital_applications;`,

    // Disable RLS temporarily
    `ALTER TABLE public.hospital_applications DISABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.hospital_application_audit DISABLE ROW LEVEL SECURITY;`,

    // Re-enable RLS
    `ALTER TABLE public.hospital_applications ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.hospital_application_audit ENABLE ROW LEVEL SECURITY;`,

    // CREATE new clean policies
    `CREATE POLICY "hospital_app_insert_policy" ON public.hospital_applications FOR INSERT WITH CHECK (true);`,
    `CREATE POLICY "hospital_app_select_policy" ON public.hospital_applications FOR SELECT USING (auth.role() = 'authenticated');`,
    `CREATE POLICY "hospital_app_update_policy" ON public.hospital_applications FOR UPDATE USING (auth.role() = 'authenticated');`,
    `CREATE POLICY "hospital_app_delete_policy" ON public.hospital_applications FOR DELETE USING (auth.role() = 'authenticated');`,

    // Audit table policies
    `CREATE POLICY "audit_insert_policy" ON public.hospital_application_audit FOR INSERT WITH CHECK (auth.role() = 'authenticated');`,
    `CREATE POLICY "audit_select_policy" ON public.hospital_application_audit FOR SELECT USING (auth.role() = 'authenticated');`,
    `CREATE POLICY "audit_update_policy" ON public.hospital_application_audit FOR UPDATE USING (auth.role() = 'authenticated');`,
  ];

  try {
    // We can't run raw SQL via the JS client with this complexity
    // Instead, provide instructions to run manually
    console.log(
      "⚠️  The JavaScript Supabase client doesn't support raw SQL execution."
    );
    console.log("\n📋 Please run these SQL commands in your Supabase dashboard:\n");
    console.log("Navigate to: SQL Editor → New Query → Paste the SQL below:\n");
    console.log("---START SQL---\n");

    console.log(
      `-- Disable RLS temporarily to clear policies
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
CREATE POLICY "audit_update_policy" ON public.hospital_application_audit FOR UPDATE USING (auth.role() = 'authenticated');`
    );

    console.log("\n---END SQL---\n");
    console.log("✅ After running this SQL:");
    console.log("   1. Anyone can submit hospital forms");
    console.log("   2. Admins can view applications in the dashboard");
    console.log("   3. Document uploads are saved to the database");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixRLS();
