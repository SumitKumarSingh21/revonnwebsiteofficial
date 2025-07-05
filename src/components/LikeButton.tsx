
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  onLikeChange?: (newCount: number) => void;
}

const LikeButton = ({ postId, initialLikes, onLikeChange }: LikeButtonProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [postId, user]);

  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('check_user_liked_post', {
        p_post_id: postId,
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking like status:', error);
        return;
      }

      setIsLiked(data === true);
    } catch (error: any) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to like posts.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLiked) {
        // Unlike using RPC function
        const { error } = await supabase.rpc('unlike_post', {
          p_post_id: postId,
          p_user_id: user.id
        });

        if (error) throw error;

        setIsLiked(false);
        const newCount = Math.max(likeCount - 1, 0);
        setLikeCount(newCount);
        onLikeChange?.(newCount);
      } else {
        // Like using RPC function
        const { error } = await supabase.rpc('like_post', {
          p_post_id: postId,
          p_user_id: user.id
        });

        if (error) throw error;

        setIsLiked(true);
        const newCount = likeCount + 1;
        setLikeCount(newCount);
        onLikeChange?.(newCount);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLikeToggle}
      disabled={loading}
      className={`${isLiked ? 'text-red-600' : 'text-gray-500'} hover:text-red-600`}
    >
      <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
      {likeCount}
    </Button>
  );
};

export default LikeButton;
