-- Create database triggers to automatically send push notifications for booking updates
CREATE OR REPLACE FUNCTION notify_booking_update()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  notification_type TEXT := 'booking';
BEGIN
  -- Check if status changed
  IF NEW.status != OLD.status THEN
    notification_title := 'Booking Status Update';
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_body := 'Your booking has been confirmed!';
      WHEN 'in_progress' THEN
        notification_body := 'Your service is now in progress.';
      WHEN 'completed' THEN
        notification_body := 'Your service has been completed!';
      WHEN 'cancelled' THEN
        notification_body := 'Your booking has been cancelled.';
      ELSE
        notification_body := 'Your booking status has been updated to ' || NEW.status;
    END CASE;

    -- Create notification record
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id, 
      notification_type, 
      notification_title, 
      notification_body,
      jsonb_build_object('booking_id', NEW.id, 'status', NEW.status)
    );

    -- Call edge function to send push notification
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'user_id', NEW.user_id,
        'title', notification_title,
        'body', notification_body,
        'data', jsonb_build_object(
          'type', notification_type,
          'booking_id', NEW.id,
          'status', NEW.status
        ),
        'url', '/notifications'
      )
    );
  END IF;

  -- Check if mechanic was assigned
  IF NEW.assigned_mechanic_id IS NOT NULL AND OLD.assigned_mechanic_id IS NULL THEN
    notification_title := 'Mechanic Assigned';
    notification_body := 'A mechanic has been assigned to your booking: ' || COALESCE(NEW.assigned_mechanic_name, 'Mechanic');

    -- Create notification record
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id, 
      notification_type, 
      notification_title, 
      notification_body,
      jsonb_build_object('booking_id', NEW.id, 'mechanic_id', NEW.assigned_mechanic_id)
    );

    -- Call edge function to send push notification
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'user_id', NEW.user_id,
        'title', notification_title,
        'body', notification_body,
        'data', jsonb_build_object(
          'type', notification_type,
          'booking_id', NEW.id,
          'mechanic_id', NEW.assigned_mechanic_id
        ),
        'url', '/notifications'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for booking updates
CREATE TRIGGER booking_update_notifications
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_update();

-- Create function to send push notification for likes
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  liker_username TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if user liked their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get liker username
  SELECT username INTO liker_username FROM profiles WHERE id = NEW.user_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    post_owner_id,
    'like',
    'New Like',
    COALESCE(liker_username, 'Someone') || ' liked your post',
    jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id)
  );

  -- Send push notification
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'user_id', post_owner_id,
      'title', 'New Like',
      'body', COALESCE(liker_username, 'Someone') || ' liked your post',
      'data', jsonb_build_object(
        'type', 'like',
        'post_id', NEW.post_id,
        'liker_id', NEW.user_id
      ),
      'url', '/community'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for post likes
CREATE TRIGGER post_like_notifications
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_like();

-- Create function to send push notification for comments
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  commenter_username TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if user commented on their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter username
  SELECT username INTO commenter_username FROM profiles WHERE id = NEW.user_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    post_owner_id,
    'comment',
    'New Comment',
    COALESCE(commenter_username, 'Someone') || ' commented on your post',
    jsonb_build_object('post_id', NEW.post_id, 'commenter_id', NEW.user_id, 'comment_id', NEW.id)
  );

  -- Send push notification
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'user_id', post_owner_id,
      'title', 'New Comment',
      'body', COALESCE(commenter_username, 'Someone') || ' commented on your post',
      'data', jsonb_build_object(
        'type', 'comment',
        'post_id', NEW.post_id,
        'commenter_id', NEW.user_id,
        'comment_id', NEW.id
      ),
      'url', '/community'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for post comments
CREATE TRIGGER post_comment_notifications
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_comment();

-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;