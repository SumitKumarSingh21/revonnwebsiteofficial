
-- Make the post_image column nullable to allow posts without images
ALTER TABLE public.posts ALTER COLUMN post_image DROP NOT NULL;
