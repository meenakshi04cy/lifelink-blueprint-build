-- DELETE ALL TEST DATA from hospital_applications table
-- This removes all test hospitals so only real user submissions show

DELETE FROM public.hospital_applications 
WHERE hospital_name LIKE '%Test%' 
   OR hospital_name LIKE '%test%'
   OR hospital_name LIKE '%DIRECT%'
   OR hospital_name LIKE '%Diagnostic%'
   OR representative_email LIKE '%test%'
   OR representative_email LIKE '%@test%';

-- Show remaining records (should only be real submissions)
SELECT 
  id,
  hospital_name,
  representative_email,
  city,
  created_at,
  status
FROM public.hospital_applications
ORDER BY created_at DESC;
