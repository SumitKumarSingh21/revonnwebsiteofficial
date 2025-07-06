
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllChannels();
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    // Subscribe to new notifications
    const notificationsChannel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          
          setNotifications(prev => 
            prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
          
          // Update unread count
          if (updatedNotification.read) {
            setUnreadCount(prev => Math.max(prev - 1, 0));
          }
        }
      )
      .subscribe();

    // Subscribe to activities that should trigger notifications
    const postsChannel = supabase
      .channel('posts-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes'
        },
        async (payload) => {
          const like = payload.new as any;
          
          // Check if this like is on current user's post
          const { data: post } = await supabase
            .from('posts')
            .select('user_id, username, caption')
            .eq('id', like.post_id)
            .single();

          if (post && post.user_id === user.id && like.user_id !== user.id) {
            // Get the liker's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', like.user_id)
              .single();

            // Create notification
            await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'like',
                title: 'New Like',
                message: `${profile?.username || 'Someone'} liked your post`,
                data: { post_id: like.post_id, liker_id: like.user_id }
              });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        async (payload) => {
          const comment = payload.new as any;
          
          // Check if this comment is on current user's post
          const { data: post } = await supabase
            .from('posts')
            .select('user_id, username, caption')
            .eq('id', comment.post_id)
            .single();

          if (post && post.user_id === user.id && comment.user_id !== user.id) {
            // Get the commenter's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', comment.user_id)
              .single();

            // Create notification
            await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'comment',
                title: 'New Comment',
                message: `${profile?.username || 'Someone'} commented on your post`,
                data: { post_id: comment.post_id, commenter_id: comment.user_id, comment_id: comment.id }
              });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'followers'
        },
        async (payload) => {
          const follow = payload.new as any;
          
          if (follow.following_id === user.id && follow.follower_id !== user.id) {
            // Get the follower's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', follow.follower_id)
              .single();

            // Create notification
            await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'follow',
                title: 'New Follower',
                message: `${profile?.username || 'Someone'} started following you`,
                data: { follower_id: follow.follower_id }
              });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const booking = payload.new as any;
          const oldBooking = payload.old as any;
          
          // Check if status changed or mechanic was assigned
          if (booking.status !== oldBooking.status || 
              (booking.assigned_mechanic_id && !oldBooking.assigned_mechanic_id)) {
            
            let title = 'Booking Update';
            let message = 'Your booking has been updated';
            
            if (booking.status !== oldBooking.status) {
              message = `Your booking status changed to ${booking.status}`;
            } else if (booking.assigned_mechanic_id && !oldBooking.assigned_mechanic_id) {
              title = 'Mechanic Assigned';
              message = `A mechanic has been assigned to your booking`;
            }

            // Create notification
            await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'booking',
                title,
                message,
                data: { booking_id: booking.id }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(postsChannel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
