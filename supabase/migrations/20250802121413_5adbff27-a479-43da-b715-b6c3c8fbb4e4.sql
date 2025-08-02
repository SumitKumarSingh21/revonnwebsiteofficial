-- Modify bookings table to support grouped service bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_details JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_names TEXT;

-- Update existing bookings to include service details
UPDATE bookings 
SET service_details = jsonb_build_array(
  jsonb_build_object(
    'id', service_id,
    'name', COALESCE(services.name, 'Unknown Service'),
    'price', COALESCE(services.price, total_amount)
  )
),
service_names = COALESCE(services.name, 'Unknown Service')
FROM services 
WHERE bookings.service_id = services.id 
AND bookings.service_details = '[]'::jsonb;