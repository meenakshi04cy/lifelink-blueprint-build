-- Add location fields to donors table for nearby donations feature
ALTER TABLE public.donors 
ADD COLUMN IF NOT EXISTS donor_hospital_name TEXT,
ADD COLUMN IF NOT EXISTS donor_city TEXT,
ADD COLUMN IF NOT EXISTS donor_state TEXT,
ADD COLUMN IF NOT EXISTS donor_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS donor_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS willing_distance_km INTEGER DEFAULT 25; -- Distance willing to travel in km

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_donors_latitude_longitude ON public.donors(donor_latitude, donor_longitude);
CREATE INDEX IF NOT EXISTS idx_donors_city ON public.donors(donor_city);
CREATE INDEX IF NOT EXISTS idx_donors_hospital_name ON public.donors(donor_hospital_name);
