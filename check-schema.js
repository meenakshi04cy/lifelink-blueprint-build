import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mlytesijtutltkqfcrrk.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1seXRlc2lqdXR0bHRrcWZjcnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzkxNjMsImV4cCI6MjA3ODU1NTE2M30.VdJclVEdbh0wU9ahwCU6_WXL8WehEo2OrASoHRF554o";

async function checkSchema() {
  try {
    const supabase = createClient(SUPABASE_URL, ANON_KEY);
    
    console.log("🔍 Checking if hospital_applications table exists...");
    
    const { data, error } = await supabase
      .from("hospital_applications")
      .select("*")
      .limit(1);
    
    if (error) {
      console.error("❌ Error accessing hospital_applications:");
      console.error("   Message:", error.message);
      console.error("   Code:", error.code);
      console.error("   Status:", error.status);
      
      if (error.message.includes("does not exist")) {
        console.log("\n⚠️  TABLE DOESN'T EXIST - You need to run the migration:");
        console.log("   1. Go to Supabase Dashboard");
        console.log("   2. SQL Editor");
        console.log("   3. Copy content from: supabase/migrations/20251120_hospital_applications.sql");
        console.log("   4. Run it");
      } else if (error.message.includes("permission")) {
        console.log("\n⚠️  PERMISSION DENIED - RLS policy issue");
        console.log("   Run the simplify_rls.sql migration");
      }
    } else {
      console.log("✅ Table exists!");
      console.log("   Records found:", data.length);
    }
    
    // Also check hospitals table
    console.log("\n🔍 Checking if hospitals table exists...");
    const { data: hospitals, error: hospError } = await supabase
      .from("hospitals")
      .select("*")
      .limit(1);
    
    if (hospError) {
      console.error("❌ Error accessing hospitals:", hospError.message);
    } else {
      console.log("✅ Hospitals table exists!");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkSchema();
