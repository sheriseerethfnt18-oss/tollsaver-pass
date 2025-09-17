-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create settings table for admin configuration
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access settings
CREATE POLICY "Only admins can manage settings" 
ON public.settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  vehicle_registration TEXT NOT NULL,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  duration_days INTEGER NOT NULL,
  duration_label TEXT NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  savings DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sms_sent', 'sms_verified', 'push_sent', 'completed', 'cancelled')),
  sms_code TEXT,
  sms_verified_at TIMESTAMP WITH TIME ZONE,
  push_confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  pdf_generated BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view own orders" 
ON public.orders 
FOR SELECT 
USING (user_id = auth.uid() OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for email templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
CREATE POLICY "Only admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES 
('smtp', '{"host": "", "port": 587, "username": "", "password": "", "from_email": "", "from_name": "Travel Pass"}', 'SMTP configuration for sending emails'),
('payment', '{"stripe_publishable_key": "", "stripe_secret_key": "", "test_mode": true}', 'Payment gateway configuration'),
('app', '{"company_name": "Travel Pass Ireland", "support_email": "support@travelpass.ie", "support_phone": "+353 1 234 5678"}', 'Application settings');

-- Insert default email template
INSERT INTO public.email_templates (name, subject, html_content, variables) VALUES 
('pass_confirmation', 'Your Travel Pass is Active — Order #{{order_id}}', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Travel Pass is Active</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Your Travel Pass is Active!</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0;">You''re all set to save 30% on Irish toll roads</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1e293b; margin-top: 0;">Pass Details</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Order Number:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">{{order_id}}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Vehicle:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">{{vehicle_details}}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Duration:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">{{duration}}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>Amount Charged:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #059669; font-weight: bold;">€{{amount}}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>You Saved:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #059669; font-weight: bold;">€{{savings}}</td>
            </tr>
            <tr>
                <td style="padding: 10px;"><strong>Valid Until:</strong></td>
                <td style="padding: 10px;">{{valid_until}}</td>
            </tr>
        </table>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">What''s Next?</h3>
            <ol style="color: #475569;">
                <li>Your pass is automatically applied at all Irish toll roads</li>
                <li>Keep this email for your records</li>
                <li>Download your pass PDF (attached) for backup</li>
            </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{download_link}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Download Pass PDF</a>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center; color: #64748b; font-size: 14px;">
            <p>Need help? Contact us at {{support_email}} or call {{support_phone}}</p>
            <p>© {{company_name}} - Saving you money on Irish toll roads</p>
        </div>
    </div>
</body>
</html>', 
'["order_id", "vehicle_details", "duration", "amount", "savings", "valid_until", "download_link", "support_email", "support_phone", "company_name"]');