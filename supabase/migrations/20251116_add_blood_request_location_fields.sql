-- Add hospital and patient location fields to blood_requests table
ALTER TABLE public.blood_requests 
ADD COLUMN IF NOT EXISTS hospital_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS hospital_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS patient_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS patient_longitude DECIMAL(11, 8);

-- Create indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_location ON public.blood_requests(hospital_latitude, hospital_longitude);
CREATE INDEX IF NOT EXISTS idx_blood_requests_patient_location ON public.blood_requests(patient_latitude, patient_longitude);
