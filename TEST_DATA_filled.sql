-- TEST DATA (fill YOUR_USER_ID with a real Supabase auth user id)
-- Copy this into Supabase SQL Editor and execute to seed test blood requests

-- Replace 'YOUR_USER_ID' with a real user UUID from Supabase Auth -> Users

INSERT INTO public.blood_requests (
  user_id,
  patient_name,
  blood_type,
  units_needed,
  hospital_name,
  hospital_address,
  contact_number,
  urgency_level,
  required_by,
  medical_reason,
  status,
  visibility_public
) VALUES
(
  'YOUR_USER_ID',
  'John Doe',
  'O+',
  3,
  'Apollo Hospital',
  'Delhi, India',
  '+91-9876543210',
  'urgent',
  CURRENT_DATE + INTERVAL '2 days',
  'Accident trauma',
  'active',
  true
),
(
  'YOUR_USER_ID',
  'Jane Smith',
  'B+',
  2,
  'Fortis Hospital',
  'Bangalore, India',
  '+91-9876543211',
  'critical',
  CURRENT_DATE + INTERVAL '1 day',
  'Surgery preparation',
  'active',
  true
),
(
  'YOUR_USER_ID',
  'Raj Kumar',
  'A-',
  4,
  'Max Healthcare',
  'Mumbai, India',
  '+91-9876543212',
  'urgent',
  CURRENT_DATE + INTERVAL '3 days',
  'Post-operative transfusion',
  'active',
  true
);
