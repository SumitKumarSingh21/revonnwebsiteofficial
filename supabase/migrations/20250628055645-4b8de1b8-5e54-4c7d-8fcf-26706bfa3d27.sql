
-- Create a table for saved posts if it doesn't exist
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS on saved_posts
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_posts
CREATE POLICY "Users can view their own saved posts" 
  ON public.saved_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
  ON public.saved_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" 
  ON public.saved_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime for saved_posts table
ALTER TABLE public.saved_posts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_posts;

-- Add vehicle_type column to bookings table to support bikes
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'car';
