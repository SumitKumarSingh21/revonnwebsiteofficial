
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void;
}

const FollowButton = ({ targetUserId, onFollowChange }: FollowButtonProps) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && targetUserId !== user.id) {
      checkFollowStatus();
    }
  }, [user, targetUserId]);

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error: any) {
      console.error('Error checking follow status:', error);
    }
  };

  const getFollowerCount = async () => {
    const { count } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);
    
    return count || 0;
  };

  const handleFollow = async () => {
    if (!user || targetUserId === user.id) return;

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
        
        setIsFollowing(false);
        const newCount = await getFollowerCount();
        onFollowChange?.(false, newCount);
        
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user.",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;
        
        setIsFollowing(true);
        const newCount = await getFollowerCount();
        onFollowChange?.(true, newCount);
        
        toast({
          title: "Following",
          description: "You are now following this user.",
        });
      }
    } catch (error: any) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || targetUserId === user.id) {
    return null;
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={isFollowing ? "text-gray-600 border-gray-300" : "bg-red-600 hover:bg-red-700"}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
