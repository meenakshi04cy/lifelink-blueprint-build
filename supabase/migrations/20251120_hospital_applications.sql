-- Create hospital_applications table for initial registration submissions
CREATE TABLE public.hospital_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Representative Information
  representative_first_name TEXT NOT NULL,
  representative_last_name TEXT,
  representative_role TEXT NOT NULL,
  representative_phone TEXT NOT NULL,
  representative_email TEXT NOT NULL,
  
  -- Hospital Information
  hospital_name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'government', 'private', 'blood-bank', 'ngo'
  official_phone TEXT NOT NULL,
  emergency_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Authentication
  auth_method TEXT DEFAULT 'password', -- 'password' or 'otp-only'
  
  -- Documents
  license_document_url TEXT,
  license_document_path TEXT, -- Storage path for retrieval
  proof_document_url TEXT,
  proof_document_path TEXT, -- Storage path for retrieval
  documents JSONB, -- Store array of all documents: { kind, url, fileName, path }
  
  -- Status Tracking
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'info_requested', 'expired'
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Admin Actions
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  rejection_date TIMESTAMP WITH TIME ZONE,
  
  -- After Approval
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospital_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospital_applications
CREATE POLICY "Applicants can view their own applications"
  ON public.hospital_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.hospital_applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'user_type' = 'admin')
  );

CREATE POLICY "Users can insert their own applications"
  ON public.hospital_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Applicants can update their own pending applications"
  ON public.hospital_applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update applications"
  ON public.hospital_applications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'user_type' = 'admin')
  );

-- Create hospital_application_audit table for tracking all changes
CREATE TABLE public.hospital_application_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.hospital_applications(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'submitted', 'approved', 'rejected', 'info_requested', 'resubmitted'
  notes TEXT,
  previous_status TEXT,
  new_status TEXT,
  metadata JSONB, -- Store additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.hospital_application_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit
CREATE POLICY "Admins can view audit logs"
  ON public.hospital_application_audit FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'user_type' = 'admin')
  );

CREATE POLICY "Applicants can view their own audit"
  ON public.hospital_application_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hospital_applications 
      WHERE public.hospital_applications.id = application_id 
      AND public.hospital_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert audit logs"
  ON public.hospital_application_audit FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'user_type' = 'admin')
  );

-- Create indexes for performance
CREATE INDEX idx_hospital_applications_user_id ON public.hospital_applications(user_id);
CREATE INDEX idx_hospital_applications_status ON public.hospital_applications(status);
CREATE INDEX idx_hospital_applications_created_at ON public.hospital_applications(created_at DESC);
CREATE INDEX idx_hospital_application_audit_application_id ON public.hospital_application_audit(application_id);
CREATE INDEX idx_hospital_application_audit_created_at ON public.hospital_application_audit(created_at DESC);

-- Create trigger to update hospital_applications.updated_at
CREATE TRIGGER update_hospital_applications_updated_at
  BEFORE UPDATE ON public.hospital_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update hospital_verification_audit.updated_at
CREATE TRIGGER update_hospital_verification_audit_updated_at
  BEFORE UPDATE ON public.hospital_verification_audit
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
