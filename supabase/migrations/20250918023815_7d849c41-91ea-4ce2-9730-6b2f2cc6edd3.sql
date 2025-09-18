-- Update RLS policies for settings table to allow admin operations without Supabase auth
-- Since we're using hardcoded admin authentication, we need to disable RLS for settings table
-- or create a more permissive policy

-- Drop existing RLS policy that requires Supabase auth
DROP POLICY IF EXISTS "Only admins can manage settings" ON public.settings;

-- Disable RLS for settings table to allow operations with hardcoded admin auth
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Add a comment explaining this is for hardcoded admin access
COMMENT ON TABLE public.settings IS 'Settings table with RLS disabled for hardcoded admin authentication';