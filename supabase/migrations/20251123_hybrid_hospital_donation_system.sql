-- ============================================================================
-- HYBRID HOSPITAL DONATION SYSTEM
-- Supports: Hospital-bound + Alternate Partner Hospital donations
-- ============================================================================

-- 1. Extend blood_requests table with hospital selection and visibility fields
ALTER TABLE public.blood_requests
ADD COLUMN IF NOT EXISTS hospital_preference TEXT DEFAULT 'preferred', -- 'preferred', 'any'
ADD COLUMN IF NOT EXISTS request_visibility TEXT DEFAULT 'public', -- 'public', 'nearby_only', 'private'
ADD COLUMN IF NOT EXISTS doctor_note_url TEXT,
ADD COLUMN IF NOT EXISTS prescription_url TEXT,
ADD COLUMN IF NOT EXISTS admission_slip_url TEXT,
ADD COLUMN IF NOT EXISTS consent_share_contact BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_donor_contact_hospital BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recipient_name TEXT,
ADD COLUMN IF NOT EXISTS recipient_phone TEXT,
ADD COLUMN IF NOT EXISTS units_matched INTEGER DEFAULT 0;

-- Create indexes for visibility and filtering
CREATE INDEX IF NOT EXISTS idx_blood_requests_visibility ON public.blood_requests(request_visibility);
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_preference ON public.blood_requests(hospital_preference);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency_status ON public.blood_requests(urgency_level, status);

-- 2. Create donation_commitments table to track donor-request matches at specific hospitals
CREATE TABLE IF NOT EXISTS public.donation_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core relationships
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  preferred_hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  donation_hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  
  -- Status and lifecycle
  status TEXT DEFAULT 'committed', -- 'committed', 'scheduled', 'checked_in', 'completed', 'cancelled', 'no_show'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Donation details (filled by hospital staff)
  units_donated INTEGER,
  bag_id TEXT, -- Blood bag identifier
  hemoglobin_reading DECIMAL(5, 2), -- g/dL reading
  
  -- Alternate hospital flag and notes
  is_alternate_hospital BOOLEAN DEFAULT false,
  logistics_notes TEXT, -- For admin/hospital staff about transfer arrangements
  donor_notes TEXT, -- Donor's reason for choosing alternate hospital
  
  -- Hospital staff verification
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on donation_commitments
ALTER TABLE public.donation_commitments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donation_commitments
CREATE POLICY "Donors can view their commitments"
  ON public.donation_commitments FOR SELECT
  USING (auth.uid() = donor_id);

CREATE POLICY "Requestors can view commitments for their requests"
  ON public.donation_commitments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blood_requests
      WHERE public.blood_requests.id = blood_request_id
      AND public.blood_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Hospital staff can view commitments for their hospital"
  ON public.donation_commitments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'hospital_id' = donation_hospital_id::text
        OR auth.users.raw_user_meta_data->>'hospital_id' = preferred_hospital_id::text
      )
    )
  );

CREATE POLICY "Donors can create commitments"
  ON public.donation_commitments FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Hospital staff can update commitments"
  ON public.donation_commitments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'hospital_id' = donation_hospital_id::text
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donation_commitments_donor_id ON public.donation_commitments(donor_id);
CREATE INDEX IF NOT EXISTS idx_donation_commitments_blood_request_id ON public.donation_commitments(blood_request_id);
CREATE INDEX IF NOT EXISTS idx_donation_commitments_donation_hospital_id ON public.donation_commitments(donation_hospital_id);
CREATE INDEX IF NOT EXISTS idx_donation_commitments_status ON public.donation_commitments(status);
CREATE INDEX IF NOT EXISTS idx_donation_commitments_is_alternate ON public.donation_commitments(is_alternate_hospital);
CREATE INDEX IF NOT EXISTS idx_donation_commitments_created_at ON public.donation_commitments(created_at DESC);

-- 3. Create partner_hospitals table to define hospital partnerships
CREATE TABLE IF NOT EXISTS public.partner_hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  partner_hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  
  -- Partnership details
  partnership_type TEXT NOT NULL, -- 'full_partner', 'blood_transfer', 'coordination'
  is_active BOOLEAN DEFAULT true,
  
  -- Admin management
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent self-partnerships and duplicates
  UNIQUE(hospital_id, partner_hospital_id),
  CHECK (hospital_id != partner_hospital_id)
);

-- Enable RLS on partner_hospitals
ALTER TABLE public.partner_hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active partnerships"
  ON public.partner_hospitals FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage partnerships"
  ON public.partner_hospitals FOR ALL
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'user_type' = 'admin')
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_partner_hospitals_hospital_id ON public.partner_hospitals(hospital_id);
CREATE INDEX IF NOT EXISTS idx_partner_hospitals_partner_id ON public.partner_hospitals(partner_hospital_id);
CREATE INDEX IF NOT EXISTS idx_partner_hospitals_active ON public.partner_hospitals(is_active);

-- 4. Create donation_audit table for complete audit trail
CREATE TABLE IF NOT EXISTS public.donation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  commitment_id UUID NOT NULL REFERENCES public.donation_commitments(id) ON DELETE CASCADE,
  blood_request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  
  -- Action and actor
  action TEXT NOT NULL, -- 'scheduled', 'checked_in', 'completed', 'cancelled', 'no_show'
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Details
  bag_id TEXT,
  units_collected INTEGER,
  hemoglobin_reading DECIMAL(5, 2),
  notes TEXT,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on donation_audit
ALTER TABLE public.donation_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.donation_audit FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'user_type' = 'admin')
  );

CREATE POLICY "Hospital staff can view their hospital audit"
  ON public.donation_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'hospital_id' = hospital_id::text
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_donation_audit_commitment_id ON public.donation_audit(commitment_id);
CREATE INDEX IF NOT EXISTS idx_donation_audit_hospital_id ON public.donation_audit(hospital_id);
CREATE INDEX IF NOT EXISTS idx_donation_audit_donor_id ON public.donation_audit(donor_id);
CREATE INDEX IF NOT EXISTS idx_donation_audit_action ON public.donation_audit(action);
CREATE INDEX IF NOT EXISTS idx_donation_audit_created_at ON public.donation_audit(created_at DESC);

-- 5. Create triggers for updated_at columns
CREATE TRIGGER update_donation_commitments_updated_at
  BEFORE UPDATE ON public.donation_commitments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_hospitals_updated_at
  BEFORE UPDATE ON public.partner_hospitals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Create function to get partner hospitals for a given hospital
CREATE OR REPLACE FUNCTION public.get_partner_hospitals(hospital_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  partnership_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.city,
    h.address,
    h.official_phone,
    h.latitude,
    h.longitude,
    ph.partnership_type
  FROM public.partner_hospitals ph
  JOIN public.hospitals h ON (
    (ph.hospital_id = hospital_id AND ph.partner_hospital_id = h.id) OR
    (ph.partner_hospital_id = hospital_id AND ph.hospital_id = h.id)
  )
  WHERE ph.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to calculate distance between hospitals (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  earth_radius DECIMAL := 6371; -- km
  lat1_rad DECIMAL;
  lat2_rad DECIMAL;
  delta_lat DECIMAL;
  delta_lon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  lat1_rad := RADIANS(lat1);
  lat2_rad := RADIANS(lat2);
  delta_lat := RADIANS(lat2 - lat1);
  delta_lon := RADIANS(lon2 - lon1);
  
  a := SIN(delta_lat/2) * SIN(delta_lat/2) + 
       COS(lat1_rad) * COS(lat2_rad) * SIN(delta_lon/2) * SIN(delta_lon/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- 8. Add comments for documentation
COMMENT ON TABLE public.donation_commitments IS 'Tracks confirmed donor-request matches at specific hospitals (primary or alternate)';
COMMENT ON COLUMN public.donation_commitments.is_alternate_hospital IS 'TRUE if donor chose partner hospital instead of preferred hospital';
COMMENT ON COLUMN public.donation_commitments.logistics_notes IS 'Administrative notes about blood transfer logistics if alternate hospital used';
COMMENT ON TABLE public.partner_hospitals IS 'Defines which hospitals can partner for alternate hospital donations';
COMMENT ON TABLE public.donation_audit IS 'Complete audit trail of all donation actions for compliance and tracking';
