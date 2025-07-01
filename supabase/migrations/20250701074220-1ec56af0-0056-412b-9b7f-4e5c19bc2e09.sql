
-- Fix the profiles table to handle duplicate username constraint
-- First, let's make username nullable and add a unique constraint that allows nulls
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;

-- Drop the existing unique constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Add a unique constraint that allows multiple null values
CREATE UNIQUE INDEX profiles_username_unique_idx ON public.profiles (username) WHERE username IS NOT NULL;

-- Update the handle_new_user function to handle username generation better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    base_username text;
    final_username text;
    counter integer := 1;
BEGIN
    -- Generate base username from email or use a default
    base_username := COALESCE(
        split_part(NEW.email, '@', 1),
        'user'
    );
    
    -- Clean the username (remove non-alphanumeric characters)
    base_username := regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g');
    
    -- Ensure it's not empty
    IF base_username = '' THEN
        base_username := 'user';
    END IF;
    
    final_username := base_username;
    
    -- Find a unique username
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        final_username := base_username || counter::text;
        counter := counter + 1;
    END LOOP;

    INSERT INTO public.profiles (id, full_name, username, bio)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        final_username,
        COALESCE(NEW.raw_user_meta_data->>'bio', 'Car enthusiast & weekend racer 🏁')
    );
    
    RETURN NEW;
END;
$$;

-- Create a table for available time slots
CREATE TABLE IF NOT EXISTS public.garage_time_slots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    garage_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT garage_time_slots_garage_id_fkey FOREIGN KEY (garage_id) REFERENCES public.garages(id) ON DELETE CASCADE
);

-- Insert sample time slots for existing garages (fixed approach)
INSERT INTO public.garage_time_slots (garage_id, day_of_week, start_time, end_time)
SELECT 
    g.id as garage_id,
    generate_series(1, 6) as day_of_week, -- Monday to Saturday
    (ts.slot_hour || ':00')::TIME as start_time,
    (ts.slot_hour || ':00')::TIME + INTERVAL '1 hour' as end_time
FROM 
    public.garages g,
    (VALUES (9), (10), (11), (12), (13), (14), (15), (16), (17)) AS ts(slot_hour)
WHERE 
    EXISTS (SELECT 1 FROM public.garages WHERE id = g.id);

-- Enable RLS on the new table
ALTER TABLE public.garage_time_slots ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing time slots
CREATE POLICY "Anyone can view garage time slots" 
    ON public.garage_time_slots 
    FOR SELECT 
    TO public
    USING (true);
