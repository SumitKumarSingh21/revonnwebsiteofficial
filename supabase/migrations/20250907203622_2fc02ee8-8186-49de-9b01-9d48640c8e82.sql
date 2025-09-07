-- Fix security issue: Remove overly permissive booking creation policy
-- and ensure proper access control for sensitive customer data

-- Drop the overly permissive INSERT policy that allows anyone to create bookings
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

-- Ensure only the secure INSERT policy remains (users can only create their own bookings)
-- This policy already exists: "Users can create their own bookings" with (auth.uid() = user_id)

-- Add additional security: Ensure user_id is never null for new bookings
-- This prevents anonymous bookings that could bypass RLS
ALTER TABLE public.bookings 
ALTER COLUMN user_id SET NOT NULL;