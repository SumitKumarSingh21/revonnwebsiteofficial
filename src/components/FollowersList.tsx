
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import FollowButton from './FollowButton';

interface Follower {
  id: string;
  follower_id: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

interface FollowersListProps {
  userId: string;
  count: number;
  isOwnProfile: boolean;
}

const FollowersList = ({ userId, count, isOwnProfile }: FollowersListProps) => {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchFollowers = async () => {
    if (!open) return;
    
    setLoading(true);
    try {
      // First get followers
      const { data: followerData, error: followerError } = await supabase
        .from('followers')
        .select('id, follower_id, created_at')
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (followerError) throw followerError;

      if (followerData && followerData.length > 0) {
        // Then get profiles for each follower
        const followerIds = followerData.map(f => f.follower_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', followerIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const followersWithProfiles = followerData.map(follower => ({
          ...follower,
          profiles: profilesData?.find(p => p.id === follower.follower_id) || null
        }));

        setFollowers(followersWithProfiles);
      } else {
        setFollowers([]);
      }
    } catch (error: any) {
      console.error('Error fetching followers:', error);
      toast({
        title: "Error",
        description: "Failed to load followers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchFollowers();
    }
  }, [open, userId]);

  // Real-time updates
  useEffect(() => {
    if (!open) return;

    const channel = supabase
      .channel('followers-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `following_id=eq.${userId}`
        },
        () => {
          fetchFollowers();
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
            <div className="text-gray-500 text-sm">Followers</div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-96">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Followers ({count})
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            </div>
          ) : followers.length > 0 ? (
            followers.map((follower) => (
              <div key={follower.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={follower.profiles?.avatar_url} />
                    <AvatarFallback>
                      {follower.profiles?.full_name?.charAt(0) || follower.profiles?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{follower.profiles?.full_name || follower.profiles?.username}</p>
                    <p className="text-sm text-gray-500">@{follower.profiles?.username}</p>
                  </div>
                </div>
                {!isOwnProfile && follower.profiles && (
                  <FollowButton targetUserId={follower.follower_id} />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No followers yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersList;
