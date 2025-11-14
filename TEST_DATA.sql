-- Insert test blood requests with real hospital addresses
-- Replace YOUR_USER_ID with an actual user UUID from your auth.users table

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
),
(
  'YOUR_USER_ID',
  'Priya Sharma',
  'AB+',
  1,
  'AIIMS Hospital',
  'Hyderabad, India',
  '+91-9876543213',
  'normal',
  CURRENT_DATE + INTERVAL '5 days',
  'Planned procedure',
  'active',
  true
),
(
  'YOUR_USER_ID',
  'Amit Patel',
  'O-',
  5,
  'Manipal Hospital',
  'Pune, India',
  '+91-9876543214',
  'critical',
  CURRENT_DATE + INTERVAL '1 day',
  'Emergency transfusion needed',
  'active',
  true
);
