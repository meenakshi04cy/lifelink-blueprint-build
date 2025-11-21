#!/usr/bin/env node
/**
 * Apply the hospital RLS fix to Supabase
 * Usage: node apply-hospital-rls-fix.js
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFix() {
  try {
    console.log("🔧 Applying hospital RLS fix...\n");

    // Read the SQL file
    const fs = require("fs");
    const sqlPath = "./supabase/migrations/20251120_fix_hospital_rls.sql";

    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ Error: Could not find migration file at ${sqlPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, "utf-8");

    // Execute the SQL
    // Note: Using rpc to execute raw SQL doesn't work with anon key
    // Instead, we'll use the service role key approach or manual steps

    console.log("⚠️  Manual Step Required:");
    console.log("============================");
    console.log(
      "1. Go to https://app.supabase.com/project/[your-project-id]/sql/new"
    );
    console.log("2. Copy and paste the following SQL:");
    console.log("3. Click 'Run'");
    console.log("\n" + "=".repeat(60));
    console.log(sql);
    console.log("=".repeat(60) + "\n");

    console.log("✅ Instructions displayed");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

applyFix();
