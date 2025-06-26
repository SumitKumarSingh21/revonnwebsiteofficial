
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Settings, Calendar, MapPin, Heart, MessageCircle, Repeat2, Share, Users, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url?: string;
  created_at: string;
}

interface Post {
  id: string;
  caption: string;
  post_image: string;
  likes: number;
  comments: number;
  created_at: string;
  username: string;
  user_id: string;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  status: string;
  customer_name: string;
  vehicle_make: string;
  vehicle_model: string;
  garages: {
    name: string;
  };
  services: {
    name: string;
  };
}

interface FollowerData {
  follower_id: string;
  following_id: string;
  profiles: UserProfile;
}

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [followers, setFollowers] = useState<FollowerData[]>([]);
  const [following, setFollowing] = useState<FollowerData[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);

  const isOwnProfile = !username || (profile && user && profile.id === user.id);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [username, user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      let profileId = user?.id;

      if (username) {
        // Find user by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        profileId = profileData.id;
        setProfile(profileData);
      } else {
        // Load current user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
      }

      // Load posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);

      // Load bookings if own profile
      if (isOwnProfile) {
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            garages (name),
            services (name)
          `)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        setBookings(bookingsData || []);
      }

      // Load followers and following
      const { data: followersData } = await supabase
        .from('followers')
        .select(`
          follower_id,
          following_id,
          profiles!followers_follower_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', profileId);

      const { data: followingData } = await supabase
        .from('followers')
        .select(`
          follower_id,
          following_id,
          profiles!followers_following_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', profileId);

      setFollowers(followersData || []);
      setFollowing(followingData || []);

      // Check if current user is following this profile
      if (!isOwnProfile && user) {
        const { data: followCheck } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileId)
          .single();

        setIsFollowing(!!followCheck);
      }

    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
        
        setIsFollowing(false);
        setFollowers(prev => prev.filter(f => f.follower_id !== user.id));
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${profile.full_name}`,
        });
      } else {
        // Follow
        await supabase
          .from('followers')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          });
        
        setIsFollowing(true);
        // Reload followers to get updated list
        loadProfile();
        toast({
          title: "Following",
          description: `You are now following ${profile.full_name}`,
        });
      }
    } catch (error: any) {
      console.error('Error following/unfollowing:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">{profile.full_name}</h1>
              <p className="text-sm text-gray-500">{posts.length} posts</p>
            </div>
            {isOwnProfile && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {!isOwnProfile && <div className="w-10"></div>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Avatar className="w-20 h-20">
                {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
                <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                    <p className="text-gray-600">@{profile.username}</p>
                  </div>
                  
                  {!isOwnProfile && (
                    <Button 
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className="mt-2 sm:mt-0"
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                <p className="mt-2 text-gray-700">{profile.bio}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-3">
                  <Dialog open={followingDialogOpen} onOpenChange={setFollowingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto">
                        <span className="text-sm">
                          <strong>{following.length}</strong> <span className="text-gray-500">Following</span>
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Following</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {following.map((follow) => (
                          <div key={follow.following_id} className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              {follow.profiles.avatar_url && <AvatarImage src={follow.profiles.avatar_url} />}
                              <AvatarFallback>{follow.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Link 
                                to={`/profile/${follow.profiles.username}`}
                                className="font-semibold hover:underline"
                                onClick={() => setFollowingDialogOpen(false)}
                              >
                                {follow.profiles.full_name}
                              </Link>
                              <p className="text-sm text-gray-500">@{follow.profiles.username}</p>
                            </div>
                          </div>
                        ))}
                        {following.length === 0 && (
                          <p className="text-gray-500 text-center py-4">Not following anyone yet</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={followersDialogOpen} onOpenChange={setFollowersDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto">
                        <span className="text-sm">
                          <strong>{followers.length}</strong> <span className="text-gray-500">Followers</span>
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Followers</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {followers.map((follower) => (
                          <div key={follower.follower_id} className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              {follower.profiles.avatar_url && <AvatarImage src={follower.profiles.avatar_url} />}
                              <AvatarFallback>{follower.profiles.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Link 
                                to={`/profile/${follower.profiles.username}`}
                                className="font-semibold hover:underline"
                                onClick={() => setFollowersDialogOpen(false)}
                              >
                                {follower.profiles.full_name}
                              </Link>
                              <p className="text-sm text-gray-500">@{follower.profiles.username}</p>
                            </div>
                          </div>
                        ))}
                        {followers.length === 0 && (
                          <p className="text-gray-500 text-center py-4">No followers yet</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="bookings">Bookings</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4 mt-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <Avatar>
                        {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
                        <AvatarFallback>{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{profile.full_name}</span>
                          <span className="text-gray-500">@{profile.username}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-gray-900 whitespace-pre-wrap">{post.caption}</p>
                          {post.post_image && (
                            <img src={post.post_image} alt="Post content" className="mt-3 rounded-lg max-w-full h-auto" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 max-w-md">
                          <Button variant="ghost" size="sm" className="text-gray-500">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500">
                            <Repeat2 className="h-4 w-4 mr-2" />
                            0
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500">
                            <Heart className="h-4 w-4 mr-2" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts yet</p>
                {isOwnProfile && (
                  <Button className="mt-4" asChild>
                    <Link to="/community">Share your first post</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          {isOwnProfile && (
            <TabsContent value="bookings" className="space-y-4 mt-6">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{booking.garages?.name || 'Unknown Garage'}</h3>
                          <p className="text-gray-600">{booking.vehicle_make} {booking.vehicle_model}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {booking.services?.name || 'Service'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                          <p className="font-semibold mt-1">₹{booking.total_amount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No bookings yet</p>
                  <Button className="mt-4" asChild>
                    <Link to="/services">Book your first service</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
