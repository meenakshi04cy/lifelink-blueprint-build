import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mlytesijtutltkqfcrrk.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1seXRlc2lqdXR0bHRrcWZjcnJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk3OTE2MywiZXhwIjoyMDc4NTU1MTYzfQ.SmgYnTYrq0B0Z-r9d_QKGubDZLl2keELdkitup8E1TM";
const EMAIL = "meenakshi31032004@gmail.com";

async function makeAdmin() {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    console.log(`🔍 Looking for user with email: ${EMAIL}`);
    
    // Get the user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError);
      return;
    }
    
    const user = users.users.find(u => u.email === EMAIL);
    
    if (!user) {
      console.error(`❌ User with email ${EMAIL} not found`);
      console.log("Available users:");
      users.users.forEach(u => console.log(`  - ${u.email}`));
      return;
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    
    // Update user to be admin
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          user_type: "admin"
        }
      }
    );
    
    if (updateError) {
      console.error("❌ Error updating user:", updateError);
      return;
    }
    
    console.log("✅ SUCCESS! You are now admin!");
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`👤 User Type: ${updatedUser.user_metadata?.user_type}`);
    console.log("\n🎉 Next steps:");
    console.log("1. Log in at: http://localhost:5173/login");
    console.log("2. Go to: http://localhost:5173/admin/hospitals/pending");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

makeAdmin();
