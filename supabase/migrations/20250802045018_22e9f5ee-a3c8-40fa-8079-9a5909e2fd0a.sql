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