import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, MapPin, Calendar, Users, Heart, MessageCircle, Share, ArrowLeft, RefreshCw, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CommentsSection from '@/components/CommentsSection';
import ReviewModal from '@/components/ReviewModal';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import FollowButton from '@/components/FollowButton';
import LikeButton from '@/components/LikeButton';
import FollowersList from '@/components/FollowersList';
import FollowingList from '@/components/FollowingList';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Post {
  id: string;
  caption: string;
  post_image?: string;
  likes: number;
  comments: number;
  username: string;
  user_image?: string;
  user_id: string;
  created_at: string;
}

interface Booking {
  id: string;
  garage_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  vehicle_make: string;
  vehicle_model: string;
  notes: string;
  created_at: string;
}

interface Review {
  id: string;
  booking_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url?: string;
  created_at: string;
}

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isOwnProfile = !username || user?.email?.split('@')[0] === username;

  useEffect(() => {
    fetchProfile();
  }, [username, user]);

  useEffect(() => {
    if (profile?.id || (isOwnProfile && user?.id)) {
      fetchPosts();
      fetchSavedPosts();
      fetchBookings();
      fetchReviews();
      fetchStats();
    }
  }, [profile, user, isOwnProfile]);

  // Real-time updates for all relevant tables
  useEffect(() => {
    const targetUserId = isOwnProfile ? user?.id : profile?.id;
    if (!targetUserId) return;

    const channels: any[] = [];

    // Posts real-time updates
    const postsChannel = supabase
      .channel('profile-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `user_id=eq.${targetUserId}`
        },
        () => {
          fetchPosts();
          fetchStats();
        }
      )
      .subscribe();
    channels.push(postsChannel);

    // Followers real-time updates
    const followersChannel = supabase
      .channel('profile-followers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `following_id=eq.${targetUserId}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();
    channels.push(followersChannel);

    // Following real-time updates
    const followingChannel = supabase
      .channel('profile-following')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${targetUserId}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();
    channels.push(followingChannel);

    if (isOwnProfile && user) {
      // Bookings real-time updates
      const bookingsChannel = supabase
        .channel('profile-bookings')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchBookings();
          }
        )
        .subscribe();
      channels.push(bookingsChannel);

      // Reviews real-time updates
      const reviewsChannel = supabase
        .channel('profile-reviews')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reviews',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchReviews();
          }
        )
        .subscribe();
      channels.push(reviewsChannel);

      // Saved posts real-time updates
      const savedPostsChannel = supabase
        .channel('profile-saved-posts')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'saved_posts',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchSavedPosts();
          }
        )
        .subscribe();
      channels.push(savedPostsChannel);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, profile, isOwnProfile]);

  const fetchProfile = async () => {
    try {
      let profileData;
      
      if (isOwnProfile && user) {
        // Fetch current user's profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        profileData = data;
      } else if (username) {
        // Fetch other user's profile by username
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
          
        if (error) throw error;
        profileData = data;
      }

      if (profileData) {
        setProfile(profileData);
      } else if (isOwnProfile && user) {
        // Create profile if it doesn't exist
        const defaultProfile = {
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          full_name: user.email?.split('@')[0] || 'User',
          bio: 'Car enthusiast & weekend racer 🏁',
          created_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('profiles')
          .insert(defaultProfile);
          
        if (!error) {
          setProfile(defaultProfile);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const targetUserId = isOwnProfile ? user?.id : profile?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchSavedPosts = async () => {
    if (!isOwnProfile || !user) return;

    try {
      // Get saved post IDs
      const { data: savedPostIds, error: savedError } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      if (savedPostIds && savedPostIds.length > 0) {
        // Get the actual posts
        const postIds = savedPostIds.map((sp: any) => sp.post_id);
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .in('id', postIds)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setSavedPosts(postsData || []);
      } else {
        setSavedPosts([]);
      }
    } catch (error: any) {
      console.error('Error fetching saved posts:', error);
    }
  };

  const fetchBookings = async () => {
    if (!isOwnProfile || !user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchReviews = async () => {
    if (!isOwnProfile || !user) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const targetUserId = isOwnProfile ? user?.id : profile?.id;
      if (!targetUserId) return;

      // Get posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);

      // Get followers count
      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);

      // Get following count
      const { count: followingCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId);

      setStats({
        posts: postsCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProfile(),
      fetchPosts(),
      fetchSavedPosts(),
      fetchBookings(),
      fetchReviews(),
      fetchStats()
    ]);
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Profile data has been updated.",
    });
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
    fetchBookings();
  };

  const getReviewForBooking = (bookingId: string) => {
    return reviews.find(review => review.booking_id === bookingId);
  };

  const handleSavePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId
        });

      if (error) throw error;

      toast({
        title: "Post Saved",
        description: "Post has been saved to your collection.",
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already Saved",
          description: "This post is already in your saved collection.",
        });
      } else {
        console.error('Error saving post:', error);
        toast({
          title: "Error",
          description: "Failed to save post.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUnsavePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;

      toast({
        title: "Post Unsaved",
        description: "Post has been removed from your collection.",
      });
    } catch (error: any) {
      console.error('Error unsaving post:', error);
      toast({
        title: "Error",
        description: "Failed to unsave post.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (post: Post, platform?: string) => {
    const shareText = `Check out this post: ${post.caption}`;
    const shareUrl = window.location.href;

    if (platform) {
      let url = '';
      switch (platform) {
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        case 'whatsapp':
          url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
          break;
        case 'linkedin':
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          break;
      }
      if (url) {
        window.open(url, '_blank');
      }
    } else {
      // Native share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Revonn Post',
            text: shareText,
            url: shareUrl,
          });
        } catch (error) {
          // Fallback to clipboard
          navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link Copied",
            description: "Post link has been copied to clipboard.",
          });
        }
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Post link has been copied to clipboard.",
        });
      }
    }
  };

  const handleCommentsUpdate = (postId: string, newCount: number) => {
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, comments: newCount }
        : p
    ));
    setSavedPosts(savedPosts.map(p => 
      p.id === postId 
        ? { ...p, comments: newCount }
        : p
    ));
  };

  const handleAvatarUpdate = (url: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: url });
    }
  };

  const handleFollowChange = (isFollowing: boolean, followerCount: number) => {
    setStats(prev => ({ 
      ...prev, 
      followers: followerCount 
    }));
  };

  const renderPost = (post: Post) => (
    <Card key={post.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar>
            <AvatarFallback>{post.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{post.username}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-sm">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-gray-900 whitespace-pre-wrap">{post.caption}</p>
              {post.post_image && (
                <img src={post.post_image} alt="Post content" className="mt-3 rounded-lg max-w-full h-auto" />
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4 max-w-md">
              <CommentsSection 
                postId={post.id}
                commentsCount={post.comments}
                onCommentsUpdate={(count) => handleCommentsUpdate(post.id, count)}
              />
              <LikeButton 
                postId={post.id}
                initialLikes={post.likes}
                onLikeChange={(newCount) => {
                  setPosts(posts.map(p => 
                    p.id === post.id ? { ...p, likes: newCount } : p
                  ));
                }}
              />
              {isOwnProfile && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-red-600"
                  onClick={() => handleSavePost(post.id)}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                    <Share className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare(post, 'twitter')}>
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(post, 'facebook')}>
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(post, 'whatsapp')}>
                    Share on WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(post, 'linkedin')}>
                    Share on LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(post)}>
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSavedPost = (post: Post) => (
    <Card key={post.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar>
            <AvatarFallback>{post.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{post.username}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-sm">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-gray-900 whitespace-pre-wrap">{post.caption}</p>
              {post.post_image && (
                <img src={post.post_image} alt="Post content" className="mt-3 rounded-lg max-w-full h-auto" />
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4 max-w-md">
              <CommentsSection 
                postId={post.id}
                commentsCount={post.comments}
                onCommentsUpdate={(count) => handleCommentsUpdate(post.id, count)}
              />
              <LikeButton 
                postId={post.id}
                initialLikes={post.likes}
                onLikeChange={(newCount) => {
                  setSavedPosts(savedPosts.map(p => 
                    p.id === post.id ? { ...p, likes: newCount } : p
                  ));
                }}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600"
                onClick={() => handleUnsavePost(post.id)}
              >
                <Bookmark className="h-4 w-4 fill-current" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                    <Share className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare(post, 'twitter')}>
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(post, 'facebook')}>
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(post, 'whatsapp')}>
                    Share on WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(post, 'linkedin')}>
                    Share on LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(post)}>
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/community">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Profile</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              {isOwnProfile && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {isOwnProfile ? (
                <ProfilePictureUpload
                  currentAvatarUrl={profile?.avatar_url}
                  onAvatarUpdate={handleAvatarUpdate}
                />
              ) : (
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile?.full_name || profile?.username || 'User'}
                    </h1>
                    <p className="text-gray-600">@{profile?.username || 'user'}</p>
                  </div>
                  {!isOwnProfile && profile && (
                    <FollowButton 
                      targetUserId={profile.id} 
                      onFollowChange={handleFollowChange}
                    />
                  )}
                </div>

                {profile?.bio && (
                  <p className="text-gray-700 mt-2">{profile.bio}</p>
                )}
                
                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profile?.created_at || '').toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 mt-4">
                  <div className="text-center">
                    <div className="font-bold text-lg">{stats.posts}</div>
                    <div className="text-gray-500 text-sm">Posts</div>
                  </div>
                  <FollowersList 
                    userId={profile?.id || user?.id || ''} 
                    count={stats.followers} 
                    isOwnProfile={isOwnProfile}
                  />
                  <FollowingList 
                    userId={profile?.id || user?.id || ''} 
                    count={stats.following} 
                    isOwnProfile={isOwnProfile}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="saved">Saved</TabsTrigger>}
            {isOwnProfile && <TabsTrigger value="bookings">Bookings</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map(renderPost)
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No posts yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {isOwnProfile && (
            <TabsContent value="saved" className="mt-6">
              <div className="space-y-4">
                {savedPosts.length > 0 ? (
                  savedPosts.map(renderSavedPost)
                ) : (
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No saved posts yet.</p>
                    <p className="text-gray-400 text-sm">Posts you save will appear here.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
          
          {isOwnProfile && (
            <TabsContent value="bookings" className="mt-6">
              <div className="space-y-4">
                {bookings.length > 0 ? (
                  bookings.map((booking) => {
                    const existingReview = getReviewForBooking(booking.id);
                    
                    return (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold">Service Booking</h3>
                              <p className="text-gray-600">
                                {booking.vehicle_make} {booking.vehicle_model}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>📅 {new Date(booking.booking_date).toLocaleDateString()}</span>
                                <span>🕐 {booking.booking_time}</span>
                              </div>
                              {booking.notes && (
                                <p className="text-gray-600 text-sm mt-2">{booking.notes}</p>
                              )}
                            </div>
                            <div className="text-right flex flex-col items-end space-y-2">
                              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                {booking.status}
                              </Badge>
                              <div className="font-bold text-lg">
                                ₹{booking.total_amount}
                              </div>
                              {booking.status === 'confirmed' && (
                                <ReviewModal
                                  booking={booking}
                                  existingReview={existingReview}
                                  onReviewSubmitted={handleReviewSubmitted}
                                />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No bookings yet.</p>
                    <p className="text-gray-400 text-sm">Your service bookings will appear here.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
