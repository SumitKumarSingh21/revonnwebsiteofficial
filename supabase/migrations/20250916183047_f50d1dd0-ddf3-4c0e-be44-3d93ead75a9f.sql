-- Add payment_status column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cash_on_service'));

-- Update existing cash bookings to have cash_on_service status
UPDATE public.bookings 
SET payment_status = 'cash_on_service' 
WHERE payment_method = 'cash';

-- Add payment reference columns for online payments
ALTER TABLE public.bookings 
ADD COLUMN payment_reference TEXT,
ADD COLUMN payment_gateway_response JSONB;