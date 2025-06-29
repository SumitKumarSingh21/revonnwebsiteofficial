
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import FollowButton from './FollowButton';

interface Following {
  id: string;
  following_id: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface FollowingListProps {
  userId: string;
  count: number;
  isOwnProfile: boolean;
}

const FollowingList = ({ userId, count, isOwnProfile }: FollowingListProps) => {
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchFollowing = async () => {
    if (!open) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('followers')
        .select(`
          id,
          following_id,
          created_at,
          profiles!followers_following_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFollowing(data || []);
    } catch (error: any) {
      console.error('Error fetching following:', error);
      toast({
        title: "Error",
        description: "Failed to load following",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchFollowing();
    }
  }, [open, userId]);

  // Real-time updates
  useEffect(() => {
    if (!open) return;

    const channel = supabase
      .channel('following-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${userId}`
        },
        () => {
          fetchFollowing();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-center p-0 h-auto">
          <div>
            <div className="font-bold text-lg">{count}</div>
            <div className="text-gray-500 text-sm">Following</div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-96">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Following ({count})
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            </div>
          ) : following.length > 0 ? (
            following.map((follow) => (
              <div key={follow.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={follow.profiles?.avatar_url} />
                    <AvatarFallback>
                      {follow.profiles?.full_name?.charAt(0) || follow.profiles?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{follow.profiles?.full_name || follow.profiles?.username}</p>
                    <p className="text-sm text-gray-500">@{follow.profiles?.username}</p>
                  </div>
                </div>
                {!isOwnProfile && (
                  <FollowButton targetUserId={follow.following_id} />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Not following anyone yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowingList;
