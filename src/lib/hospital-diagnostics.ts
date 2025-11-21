import { supabase } from "@/integrations/supabase/client";

// Direct test of hospital applications insert
export async function testHospitalInsert() {
  const sb = supabase as any;
  
  console.log("\n🧪 === HOSPITAL INSERT TEST ===");
  console.log("🔐 Auth status check...");
  
  try {
    const { data: { user }, error: authError } = await sb.auth.getUser();
    console.log("👤 Current user:", user?.email || "NOT LOGGED IN (unauthenticated)");
    console.log("🔓 Auth role:", user ? "authenticated" : "anon");
    
    if (authError) {
      console.warn("⚠️ Auth error:", authError);
    }
  } catch (e) {
    console.error("❌ Auth check failed:", e);
  }

  // Test INSERT (should work with unauthenticated user)
  console.log("\n📝 Attempting INSERT (unauthenticated)...");
  
  const testPayload = {
    representative_first_name: "DiagTest",
    representative_last_name: "Hospital",
    representative_role: "Director",
    representative_phone: "9999999999",
    representative_email: "test@example.com",
    hospital_name: `Diag Test ${Date.now()}`,
    type: "private",
    official_phone: "9999999999",
    emergency_number: "9999999999",
    address: "123 Test St",
    city: "Test City",
    state: "Test State",
    zip_code: "12345",
    status: "pending",
    license_document_url: "https://example.com/license.pdf",
    proof_document_url: "https://example.com/proof.pdf",
    documents: [
      { kind: "license", fileName: "test.pdf", url: "https://example.com/license.pdf", path: "applications/license.pdf" }
    ]
  };

  console.log("📋 Payload keys:", Object.keys(testPayload));
  console.log("📋 Full payload:", testPayload);

  const { data: insertResult, error: insertError } = await sb
    .from("hospital_applications")
    .insert([testPayload])
    .select();

  console.log("📤 Response received");
  console.log("   Data:", insertResult);
  console.log("   Error object:", insertError);

  if (insertError) {
    console.error("❌ INSERT FAILED!");
    console.error("   Message:", insertError.message);
    console.error("   Code:", insertError.code);
    console.error("   Details:", insertError.details);
    console.error("   Hint:", insertError.hint);
    console.error("   Full error:", JSON.stringify(insertError, null, 2));
    
    // Additional diagnostics
    if (insertError.message && insertError.message.includes("permission")) {
      console.error("\n🔒 RLS POLICY ERROR - Possible causes:");
      console.error("   1. RLS policies haven't been applied to Supabase");
      console.error("   2. INSERT policy requires authentication but user is anon");
      console.error("   3. Old conflicting policies still exist");
      console.error("\n💡 SOLUTION: Run the SQL from SUPABASE_RLS_FIX.sql in your Supabase dashboard");
    }
    
    if (insertError.message && insertError.message.includes("column")) {
      console.error("\n❌ COLUMN ERROR - Database schema mismatch");
      console.error("   The table may not have all expected columns");
    }
    
    return { success: false, error: insertError };
  }

  if (insertResult && insertResult.length > 0) {
    console.log("✅ INSERT SUCCESSFUL!");
    console.log("   Record ID:", insertResult[0].id);
    console.log("   Hospital Name:", insertResult[0].hospital_name);
    return { success: true, recordId: insertResult[0].id };
  } else {
    console.error("❌ INSERT returned no data");
    return { success: false, error: "No data returned" };
  }
}

// Test READ (should work for authenticated users)
export async function testHospitalRead() {
  const sb = supabase as any;
  
  console.log("\n🧪 === HOSPITAL READ TEST ===");
  console.log("📖 Attempting SELECT...");

  const { data: readResult, error: readError } = await sb
    .from("hospital_applications")
    .select("*")
    .limit(5);

  console.log("📥 Response received");
  console.log("   Count:", readResult?.length || 0);
  console.log("   Error:", readError);

  if (readError) {
    console.error("❌ SELECT FAILED!");
    console.error("   Message:", readError.message);
    console.error("   Code:", readError.code);
    return { success: false, error: readError };
  }

  if (readResult) {
    console.log("✅ SELECT SUCCESSFUL!");
    console.log("   Records found:", readResult.length);
    if (readResult.length > 0) {
      console.log("   First record:", readResult[0].hospital_name);
    }
    return { success: true, count: readResult.length };
  }
}

// Main test runner
export async function runDiagnostics() {
  console.log("🔧 Starting Hospital Registration Diagnostics");
  console.log("╔" + "═".repeat(58) + "╗");
  
  const insertTest = await testHospitalInsert();
  const readTest = await testHospitalRead();
  
  console.log("\n╔" + "═".repeat(58) + "╗");
  console.log("📊 SUMMARY:");
  console.log("   INSERT:", insertTest.success ? "✅ PASS" : "❌ FAIL");
  console.log("   READ:  ", readTest.success ? "✅ PASS" : "❌ FAIL");
  
  if (!insertTest.success) {
    console.error("\n❌ PROBLEM IDENTIFIED:");
    console.error("   Hospital registrations cannot be saved to database");
    console.error("   Check RLS policies in Supabase dashboard");
    console.error("   See instructions in /fix-hospital-rls.js");
  } else {
    console.log("\n✅ Database is working correctly!");
  }
}
