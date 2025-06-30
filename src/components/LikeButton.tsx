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
    // For now, we'll keep the like state in localStorage until database types are updated
    if (user) {
      const likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${user.id}`) || '[]');
      setIsLiked(likedPosts.includes(postId));
    }
  }, [postId, user]);

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
      const likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${user.id}`) || '[]');
      
      if (isLiked) {
        // Unlike
        const updatedLikedPosts = likedPosts.filter((id: string) => id !== postId);
        localStorage.setItem(`liked_posts_${user.id}`, JSON.stringify(updatedLikedPosts));
        
        setIsLiked(false);
        const newCount = Math.max(likeCount - 1, 0);
        setLikeCount(newCount);
        onLikeChange?.(newCount);
        
        toast({
          title: "Unlike",
          description: "Post unliked (feature in development)",
        });
      } else {
        // Like
        const updatedLikedPosts = [...likedPosts, postId];
        localStorage.setItem(`liked_posts_${user.id}`, JSON.stringify(updatedLikedPosts));
        
        setIsLiked(true);
        const newCount = likeCount + 1;
        setLikeCount(newCount);
        onLikeChange?.(newCount);
        
        toast({
          title: "Like",
          description: "Post liked (feature in development)",
        });
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
