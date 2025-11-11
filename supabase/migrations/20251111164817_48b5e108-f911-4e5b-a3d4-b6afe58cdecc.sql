-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create donors table
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_type TEXT NOT NULL,
  age INTEGER NOT NULL,
  weight NUMERIC NOT NULL,
  last_donation_date DATE,
  medical_conditions TEXT,
  is_available BOOLEAN DEFAULT true,
  availability_status TEXT DEFAULT 'Available Now',
  visibility_public BOOLEAN DEFAULT true,
  visibility_verified_only BOOLEAN DEFAULT true,
  visibility_show_contact BOOLEAN DEFAULT true,
  visibility_location_sharing BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donors
CREATE POLICY "Donors can view their own data"
  ON public.donors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view available donors"
  ON public.donors FOR SELECT
  USING (is_available = true AND visibility_public = true);

CREATE POLICY "Donors can update their own data"
  ON public.donors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Donors can insert their own data"
  ON public.donors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create blood_requests table
CREATE TABLE public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  units_needed INTEGER NOT NULL,
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  urgency_level TEXT NOT NULL,
  required_by DATE NOT NULL,
  medical_reason TEXT,
  status TEXT DEFAULT 'active',
  visibility_public BOOLEAN DEFAULT true,
  visibility_verified_only BOOLEAN DEFAULT true,
  visibility_show_contact BOOLEAN DEFAULT true,
  visibility_location_sharing BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blood_requests
CREATE POLICY "Requestors can view their own requests"
  ON public.blood_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active requests"
  ON public.blood_requests FOR SELECT
  USING (status = 'active' AND visibility_public = true);

CREATE POLICY "Requestors can update their own requests"
  ON public.blood_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Requestors can insert their own requests"
  ON public.blood_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create donation_history table
CREATE TABLE public.donation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  blood_type TEXT NOT NULL,
  units INTEGER NOT NULL,
  donation_date DATE NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donation_history
CREATE POLICY "Donors can view their own donation history"
  ON public.donation_history FOR SELECT
  USING (donor_id IN (SELECT id FROM public.donors WHERE user_id = auth.uid()));

CREATE POLICY "Donors can insert their own donation history"
  ON public.donation_history FOR INSERT
  WITH CHECK (donor_id IN (SELECT id FROM public.donors WHERE user_id = auth.uid()));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON public.donors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();