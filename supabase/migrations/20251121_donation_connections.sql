-- Create donation_connections table to track donor-request matches and hospital verification
CREATE TABLE public.donation_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Connection details
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  
  -- Status tracking
  status TEXT DEFAULT 'pending', -- 'pending', 'verified_by_hospital', 'accepted', 'rejected', 'completed', 'cancelled'
  
  -- Hospital verification
  verified_by_hospital_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  hospital_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donation_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donation_connections
-- Donors can view their own connections
CREATE POLICY "Donors can view their connections"
  ON public.donation_connections FOR SELECT
  USING (auth.uid() = donor_id);

-- Requestors can view connections for their requests
CREATE POLICY "Requestors can view connections for their requests"
  ON public.donation_connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blood_requests
      WHERE public.blood_requests.id = blood_request_id
      AND public.blood_requests.user_id = auth.uid()
    )
  );

-- Hospital staff can view connections for their hospital
CREATE POLICY "Hospital staff can view their hospital connections"
  ON public.donation_connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'hospital_id' = hospital_id::text
    )
  );

-- Donors can insert connections (express interest)
CREATE POLICY "Donors can create connections"
  ON public.donation_connections FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

-- Hospital staff can update connections (verify and accept)
CREATE POLICY "Hospital staff can update connections"
  ON public.donation_connections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'hospital_id' = hospital_id::text
    )
  );

-- Create indexes for performance
CREATE INDEX idx_donation_connections_donor_id ON public.donation_connections(donor_id);
CREATE INDEX idx_donation_connections_blood_request_id ON public.donation_connections(blood_request_id);
CREATE INDEX idx_donation_connections_hospital_id ON public.donation_connections(hospital_id);
CREATE INDEX idx_donation_connections_status ON public.donation_connections(status);
CREATE INDEX idx_donation_connections_created_at ON public.donation_connections(created_at DESC);

-- Create trigger to update updated_at
CREATE TRIGGER update_donation_connections_updated_at
  BEFORE UPDATE ON public.donation_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
