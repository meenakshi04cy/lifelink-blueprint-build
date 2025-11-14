-- Create hospitals table for hospital registration and verification
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'government', 'private', 'blood-bank', 'ngo'
  official_phone TEXT NOT NULL,
  emergency_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Verification status
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  rejection_date TIMESTAMP WITH TIME ZONE,
  
  -- Documents
  license_document_url TEXT, -- Required
  hospital_proof_document_url TEXT, -- Optional
  license_number TEXT,
  registration_number TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospitals
CREATE POLICY "Hospitals can view their own record"
  ON public.hospitals FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM public.hospitals WHERE id = public.hospitals.id
  ));

CREATE POLICY "Admins can view all hospitals"
  ON public.hospitals FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'user_type' = 'admin')
  );

CREATE POLICY "Hospitals can update their own record"
  ON public.hospitals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Hospitals can insert their own record"
  ON public.hospitals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create hospital_verification_audit table
CREATE TABLE public.hospital_verification_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'submitted', 'approved', 'rejected', 'info_requested', 'resubmitted'
  notes TEXT,
  previous_status TEXT,
  new_status TEXT,
  metadata JSONB, -- Store additional data like IP, user agent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.hospital_verification_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit
CREATE POLICY "Admins can view audit logs"
  ON public.hospital_verification_audit FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'user_type' = 'admin')
  );

CREATE POLICY "Hospital staff can view their own audit"
  ON public.hospital_verification_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hospitals 
      WHERE public.hospitals.id = hospital_id AND public.hospitals.user_id = auth.uid()
    )
  );

-- Create hospital_staff table (for multiple staff members per hospital)
CREATE TABLE public.hospital_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'staff', 'viewer'
  phone TEXT,
  is_representative BOOLEAN DEFAULT false,
  otp_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospital_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their own record"
  ON public.hospital_staff FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Hospital admin can view staff"
  ON public.hospital_staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hospital_staff hs2
      WHERE hs2.hospital_id = hospital_id 
      AND hs2.user_id = auth.uid() 
      AND hs2.role = 'admin'
    )
  );

-- Create otp_verification table for phone verification
CREATE TABLE public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trigger to update hospitals.updated_at
CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for verification status lookups
CREATE INDEX idx_hospitals_verification_status ON public.hospitals(verification_status);
CREATE INDEX idx_hospitals_user_id ON public.hospitals(user_id);
CREATE INDEX idx_hospital_staff_hospital_id ON public.hospital_staff(hospital_id);
CREATE INDEX idx_hospital_audit_hospital_id ON public.hospital_verification_audit(hospital_id);
