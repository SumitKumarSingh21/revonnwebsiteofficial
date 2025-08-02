-- Add unique constraint to garage_time_slots table if it doesn't exist
ALTER TABLE garage_time_slots 
ADD CONSTRAINT garage_time_slots_unique 
UNIQUE (garage_id, day_of_week, start_time);

-- Copy predefined time slots to garage_time_slots for all garages
INSERT INTO garage_time_slots (garage_id, day_of_week, start_time, end_time, is_available, created_at)
SELECT 
  garage_id,
  day_of_week,
  start_time,
  end_time,
  is_available,
  created_at
FROM predefined_time_slots
ON CONFLICT (garage_id, day_of_week, start_time) DO NOTHING;