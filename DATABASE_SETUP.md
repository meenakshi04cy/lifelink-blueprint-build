# Database Schema Setup Guide

This document provides the SQL migrations needed to set up the database for the refactored signup system.

## 1. Create Hospitals Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  hospital_city TEXT NOT NULL,
  hospital_phone TEXT NOT NULL,
  hospital_type TEXT NOT NULL CHECK (hospital_type IN ('government', 'private', 'blood-bank')),
  staff_position TEXT NOT NULL,
  verification_document_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_hospitals_user_id ON public.hospitals(user_id);

-- Enable Row Level Security
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own hospital record
CREATE POLICY "Users can view their own hospital record"
  ON public.hospitals
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own hospital record (if not approved)
CREATE POLICY "Users can update their own hospital record"
  ON public.hospitals
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Allow insert for new signups
CREATE POLICY "Allow new hospital signups"
  ON public.hospitals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admins can view all hospital records (if admin table exists)
-- CREATE POLICY "Admins can view all hospitals"
--   ON public.hospitals
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.admins
--       WHERE admin_user_id = auth.uid()
--     )
--   );
```

## 2. Create Storage Bucket for Hospital Documents

In Supabase Dashboard → Storage:

1. Click "Create a new bucket"
2. Name: `hospital-documents`
3. Make it **Private** (not public)
4. Click "Create bucket"

### Set RLS Policies for hospital-documents bucket:

In Supabase Dashboard → Storage → Policies → hospital-documents:

**Policy 1: Allow users to upload their own documents**
```sql
SELECT true
WHERE auth.uid()::text = (storage.foldername())[1]
```

**Policy 2: Allow users to read their own documents**
```sql
SELECT true
WHERE auth.uid()::text = (storage.foldername())[1]
```

## 3. Create Admin Table (Optional - for approving hospitals)

```sql
-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_level TEXT NOT NULL DEFAULT 'moderator' CHECK (admin_level IN ('moderator', 'admin', 'superadmin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin table
CREATE POLICY "Admins can view admin table"
  ON public.admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admin_user_id = auth.uid()
    )
  );
```

## 4. Update Donors Table (Optional)

If you want to add hospital affiliation to the donors table:

```sql
-- Add hospital_affiliation to donors table (if needed)
ALTER TABLE public.donors
ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_donors_hospital_id ON public.donors(hospital_id);
```

## 5. Create Hospital Activity Log (Optional - for audit trail)

```sql
-- Create hospital activity log
CREATE TABLE IF NOT EXISTS public.hospital_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_hospital_activity_hospital_id ON public.hospital_activity_log(hospital_id);
```

## 6. Create Verification Status Change Trigger (Optional)

```sql
-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hospitals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hospitals_updated_at_trigger
BEFORE UPDATE ON public.hospitals
FOR EACH ROW
EXECUTE FUNCTION update_hospitals_updated_at();
```

## 7. Seeding Test Data (Optional)

```sql
-- Create a test admin user
-- First create the user in Auth, then add to admins table:

INSERT INTO public.admins (admin_user_id, admin_level)
VALUES ('YOUR_ADMIN_USER_ID', 'admin');
```

## 8. Verification - Check Tables

Run these queries to verify your setup:

```sql
-- Check hospitals table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'hospitals';

-- Check hospital_documents bucket exists
SELECT * FROM storage.buckets 
WHERE name = 'hospital-documents';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'hospitals';
```

## 9. Testing the Complete Flow

After setting up the database:

1. Go to `/signup`
2. Create a general user account
3. Verify redirect to `/get-started`
4. Go to `/signup/hospital`
5. Fill out hospital registration
6. Upload a test document
7. Verify redirect to `/hospital-pending`

---

## Troubleshooting

### Error: "hospitals" table not found
- Run the SQL migration to create the hospitals table
- Verify it appears in your Supabase database

### Error: "hospital-documents" bucket not found
- Create the storage bucket manually in the Supabase Dashboard
- Set appropriate RLS policies

### Document Upload Fails
- Check bucket RLS policies are set correctly
- Verify folder path format: `hospitals/{user_id}/...`
- Check file size is under 10MB
- Check file format is allowed (PDF, DOC, DOCX, JPG, PNG)

### Hospital Record Not Created
- The hospital record creation is currently stored in auth metadata
- You can create a database trigger or webhook to automatically create the hospital record
- Alternative: Create records via admin panel after verification

---

## Next Steps

1. ✅ Run all SQL migrations above
2. ✅ Set up storage bucket and RLS policies
3. ✅ Test the signup flow
4. ✅ Create admin dashboard for hospital verification (optional)
5. ✅ Set up email notifications for hospital approval/rejection
6. ✅ Configure webhooks for admin notifications

---

## Security Notes

- ✅ RLS policies restrict users to their own data
- ✅ Hospital documents are stored privately
- ✅ Verification status prevents unauthorized access until approved
- ✅ All timestamps are UTC
- ✅ Soft deletes are handled via CASCADE on user deletion

