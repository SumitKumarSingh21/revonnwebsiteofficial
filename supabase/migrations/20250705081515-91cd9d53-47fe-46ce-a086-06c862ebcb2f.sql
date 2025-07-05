
-- Create RPC functions for likes and comments operations

-- Function to check if user liked a post
CREATE OR REPLACE FUNCTION check_user_liked_post(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM likes 
    WHERE post_id = p_post_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to like a post
CREATE OR REPLACE FUNCTION like_post(p_post_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO likes (post_id, user_id)
  VALUES (p_post_id, p_user_id)
  ON CONFLICT (post_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlike a post
CREATE OR REPLACE FUNCTION unlike_post(p_post_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM likes 
  WHERE post_id = p_post_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get post comments with profile data
CREATE OR REPLACE FUNCTION get_post_comments(p_post_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  user_id UUID,
  profiles JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.content,
    c.created_at,
    c.user_id,
    jsonb_build_object(
      'full_name', p.full_name,
      'username', p.username,
      'avatar_url', p.avatar_url
    ) as profiles
  FROM comments c
  LEFT JOIN profiles p ON c.user_id = p.id
  WHERE c.post_id = p_post_id
  ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a comment
CREATE OR REPLACE FUNCTION add_comment(p_post_id UUID, p_user_id UUID, p_content TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO comments (post_id, user_id, content)
  VALUES (p_post_id, p_user_id, p_content);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
