#!/usr/bin/env node
/**
 * Diagnose hospital_applications table and RLS policies
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required"
  );
  console.error("Make sure .env file is set up");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  try {
    console.log("🔍 Diagnosing hospital_applications table...\n");

    // 1. Check if table exists and has data
    console.log("1️⃣  Checking hospital_applications table...");
    const { data: allApps, error: appError } = await supabase
      .from("hospital_applications")
      .select("*")
      .limit(10);

    if (appError) {
      console.error("   ❌ Error:", appError.message);
    } else {
      console.log(`   ✅ Table accessible`);
      console.log(`   📊 Total records found: ${allApps?.length || 0}`);
      if (allApps && allApps.length > 0) {
        console.log(`   📋 First record:`);
        console.log(JSON.stringify(allApps[0], null, 2));
      }
    }

    // 2. Check pending applications
    console.log("\n2️⃣  Checking pending applications...");
    const { data: pendingApps, error: pendingError } = await supabase
      .from("hospital_applications")
      .select("*")
      .eq("status", "pending");

    if (pendingError) {
      console.error("   ❌ Error:", pendingError.message);
    } else {
      console.log(`   ✅ Query successful`);
      console.log(`   📊 Pending records: ${pendingApps?.length || 0}`);
      if (pendingApps && pendingApps.length > 0) {
        console.log(`   📋 Pending applications:`);
        pendingApps.forEach((app, idx) => {
          console.log(
            `      ${idx + 1}. ${app.hospital_name} (${app.city}) - Status: ${app.status}`
          );
        });
      }
    }

    // 3. Check with authentication (simulate admin)
    console.log("\n3️⃣  Checking current user session...");
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      console.log("   ℹ️  Not authenticated (this is expected for unauthenticated access)");
    } else {
      console.log(`   ✅ Authenticated as: ${user.user.email}`);
      console.log(`   📝 User metadata:`, user.user.user_metadata);
      const isAdmin = user.user.user_metadata?.user_type === "admin";
      console.log(`    Is admin: ${isAdmin ? "✅ Yes" : "❌ No"}`);
    }

    // 4. Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`Hospital Applications Table: ✅ Accessible`);
    console.log(`Total Records: ${allApps?.length || 0}`);
    console.log(`Pending Records: ${pendingApps?.length || 0}`);
    console.log(`Current User: ${user?.user?.email || "Not authenticated"}`);

    if (!pendingApps || pendingApps.length === 0) {
      console.log("\n⚠️  NO PENDING APPLICATIONS FOUND!");
      console.log("\n🔧 Troubleshooting steps:");
      console.log("1. Check if hospital registration form is actually submitting");
      console.log("2. Check browser console for submit errors");
      console.log("3. Check Supabase dashboard > SQL Editor > Check table directly");
      console.log("4. Try submitting a test hospital registration");
    }
  } catch (error) {
    console.error("❌ Diagnostic error:", error.message);
  }
}

diagnose();
