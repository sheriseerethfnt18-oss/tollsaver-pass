-- Create an admin user for testing
-- Insert a default admin profile (you'll need to create the corresponding auth user manually)
INSERT INTO public.profiles (user_id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@travelpass.ie', 'Admin User', 'admin')
ON CONFLICT (user_id) DO NOTHING;