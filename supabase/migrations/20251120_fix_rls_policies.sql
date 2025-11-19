-- Fix RLS policies to allow admins to view hospital_applications
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all applications" ON public.hospital_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.hospital_applications;

-- Create new admin policies that work correctly
CREATE POLICY "Admins can view all applications v2"
  ON public.hospital_applications FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update applications v2"
  ON public.hospital_applications FOR UPDATE
  USING (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Fix hospital_applications INSERT policy to allow NULL user_id
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.hospital_applications;

CREATE POLICY "Anyone can insert applications"
  ON public.hospital_applications FOR INSERT
  WITH CHECK (true);

-- Fix hospital_applications UPDATE policy to allow update without user_id requirement
DROP POLICY IF EXISTS "Applicants can update their own pending applications" ON public.hospital_applications;

CREATE POLICY "Applicants can update their own pending applications v2"
  ON public.hospital_applications FOR UPDATE
  USING (
    (auth.uid() = user_id AND status = 'pending') 
    OR (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Fix hospital_applications DELETE policy for admins (if needed)
CREATE POLICY "Admins can delete applications"
  ON public.hospital_applications FOR DELETE
  USING (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
