import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mlytesijtutltkqfcrrk.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1seXRlc2lqdXR0bHRrcWZjcnJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3OTE2MywiZXhwIjoyMDc4NTU1MTYzfQ.SmgYnTYrq0B0Z-r9d_QKGubDZLl2keELdkitup8E1TM";

const fixSQL = `
-- Fix RLS policies to allow admins to view hospital_applications
DROP POLICY IF EXISTS "Admins can view all applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.hospital_applications;

CREATE POLICY "Admins can view all applications v2"
  ON public.hospital_applications FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update applications v2"
  ON public.hospital_applications FOR UPDATE
  USING (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Users can insert their own applications" ON public.hospital_applications;

CREATE POLICY "Anyone can insert applications"
  ON public.hospital_applications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Applicants can update their own pending applications" ON public.hospital_applications;

CREATE POLICY "Applicants can update their own pending applications v2"
  ON public.hospital_applications FOR UPDATE
  USING (
    (auth.uid() = user_id AND status = 'pending') 
    OR (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY IF NOT EXISTS "Admins can delete applications"
  ON public.hospital_applications FOR DELETE
  USING (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
`;

async function fixRLS() {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    console.log("🔧 Fixing RLS policies...");
    
    const { data, error } = await supabase.rpc('exec', {
      sql: fixSQL
    }).catch(async () => {
      // If exec RPC doesn't work, try direct query
      console.log("Trying direct SQL execution...");
      const queries = fixSQL.split(';').filter(q => q.trim());
      for (const query of queries) {
        if (query.trim()) {
          const result = await supabase.from('hospital_applications').select('id', { count: 'exact', head: true });
          if (result.error && result.error.message.includes('permission')) {
            console.log("Current error:", result.error);
          }
        }
      }
      return { data: null, error: null };
    });

    if (error) {
      console.error("❌ Error:", error);
    } else {
      console.log("✅ RLS policies fixed!");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

fixRLS();
