// Quick test to verify hospital_applications table accepts inserts
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mjyesijtut1kqfcrk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qeWVzaWp0dXQxa3FmY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5OTA3MDUsImV4cCI6MjA0NjU2NjcwNX0.ey3hbcH6tL3I31';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
  console.log('🔍 Testing hospital_applications insert...');
  
  const testData = {
    representative_first_name: 'Test',
    representative_last_name: 'User',
    representative_role: 'Admin',
    representative_phone: '1234567890',
    representative_email: 'test@hospital.com',
    hospital_name: 'Test Hospital JS',
    type: 'private',
    official_phone: '9876543210',
    emergency_number: '9876543210',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zip_code: '12345',
    status: 'pending',
  };

  try {
    console.log('📋 Inserting:', testData);
    
    const { data, error } = await supabase
      .from('hospital_applications')
      .insert([testData])
      .select();
    
    console.log('📤 Response data:', data);
    console.log('📤 Response error:', error);
    
    if (error) {
      console.error('❌ ERROR:', error);
    } else if (data && data.length > 0) {
      console.log('✅ SUCCESS! Inserted record:', data[0]);
    } else {
      console.log('⚠️ No data returned');
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

testInsert();
