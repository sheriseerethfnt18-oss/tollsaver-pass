-- Check and fix RLS on orders table to protect customer data
-- This ensures only authenticated users can access orders data

-- First, let's make sure RLS is enabled on the orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Check if there are any permissive policies that might be allowing public access
-- We'll drop any existing policies and recreate them to ensure security

-- Drop existing policies (they will be recreated with proper security)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- Recreate admin policy - only authenticated admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Recreate user policy - only authenticated users can view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR customer_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- Add policy for inserting orders (for when orders are created)
CREATE POLICY "Allow order creation"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add policy for updating orders (for order processing)
CREATE POLICY "Allow order updates for processing"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  -- Allow admins to update any order
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
  OR
  -- Allow users to update their own orders
  user_id = auth.uid()
  OR 
  customer_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
);