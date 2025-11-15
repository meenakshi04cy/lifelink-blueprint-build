-- Add hospital location columns to blood_requests table
ALTER TABLE public.blood_requests ADD COLUMN IF NOT EXISTS hospital_latitude DECIMAL(10, 8);
ALTER TABLE public.blood_requests ADD COLUMN IF NOT EXISTS hospital_longitude DECIMAL(11, 8);

-- Add index for faster geospatial queries
CREATE INDEX IF NOT EXISTS blood_requests_location_idx 
ON public.blood_requests (hospital_latitude, hospital_longitude) 
WHERE status = 'active';
