-- Create payment sessions table for tracking payment processing states
CREATE TABLE public.payment_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- Unique user identifier for telegram tracking
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  vehicle_registration TEXT NOT NULL,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  duration_label TEXT NOT NULL,
  price TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, error
  admin_response TEXT, -- sms, push, error
  card_number_masked TEXT, -- Last 4 digits for reference
  card_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 minutes')
);

-- Enable Row Level Security
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access (since users don't authenticate for payments)
CREATE POLICY "Allow public access to payment sessions" 
ON public.payment_sessions 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_payment_sessions_updated_at
BEFORE UPDATE ON public.payment_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on user_id for fast lookups
CREATE INDEX idx_payment_sessions_user_id ON public.payment_sessions(user_id);

-- Create index on payment_status for admin queries  
CREATE INDEX idx_payment_sessions_status ON public.payment_sessions(payment_status);