-- Quick diagnostic query to check what's in the hospital_applications table
-- Run this in Supabase SQL Editor to see:
-- 1. How many records exist
-- 2. Which records are from the form (status = 'pending', not from test data)
-- 3. The current RLS policies

-- Check all records
SELECT 
  id,
  hospital_name,
  city,
  created_at,
  status,
  representative_email
FROM public.hospital_applications
ORDER BY created_at DESC
LIMIT 20;

-- Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('hospital_applications', 'hospital_application_audit')
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_class
JOIN pg_tables ON pg_class.relname = pg_tables.tablename
WHERE schemaname = 'public' 
AND tablename IN ('hospital_applications', 'hospital_application_audit');
