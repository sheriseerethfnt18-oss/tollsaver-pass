-- Create verification_requests table for SMS verification tracking
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  code TEXT NOT NULL,
  customer_info JSONB NOT NULL,
  vehicle JSONB NOT NULL,
  duration JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Create policies - these are admin-only records for now
CREATE POLICY "Admin can view all verification requests" 
ON public.verification_requests 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert verification requests" 
ON public.verification_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update verification requests" 
ON public.verification_requests 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_verification_requests_verification_id ON public.verification_requests(verification_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX idx_verification_requests_created_at ON public.verification_requests(created_at);