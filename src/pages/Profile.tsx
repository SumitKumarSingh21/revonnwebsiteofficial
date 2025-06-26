
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Settings, Calendar, MapPin, Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock current user
  const currentUser = { id: 1, username: 'currentuser', name: 'Current User' };

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    const profileData = savedProfile ? JSON.parse(savedProfile) : null;
    
    // Determine if this is the current user's profile
    const profileUsername = username || currentUser.username;
    const isOwn = !username || username === currentUser.username;
    setIsOwnProfile(isOwn);

    // Set user data
    if (isOwn) {
      setUser({
        id: 1,
        username: 'currentuser',
        name: profileData?.name || 'Current User',
        bio: profileData?.bio || 'Car enthusiast from Ranchi. Love sharing car care tips and experiences!',
        location: profileData?.location || 'Ranchi, Jharkhand',
        email: profileData?.email || 'user@example.com',
        joinDate: 'Joined December 2023',
        followers: 142,
        following: 87,
        posts: 24
      });
    } else {
      // Mock other user data
      setUser({
        id: 2,
        username: profileUsername,
        name: 'Car Enthusiast',
        bio: 'Passionate about cars and modifications. Always ready to help fellow car owners!',
        location: 'Ranchi, Jharkhand',
        joinDate: 'Joined January 2024',
        followers: 89,
        following: 134,
        posts: 18
      });
      setIsFollowing(false);
    }

    // Load user's posts
    const savedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const userPosts = savedPosts.filter(post => 
      isOwn ? post.user.id === currentUser.id : post.user.username === profileUsername
    );
    setPosts(userPosts);

    // Load saved posts if it's own profile
    if (isOwn) {
      const userSavedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      const savedPostsData = savedPosts.filter(post => 
        userSavedPosts.includes(post.id)
      );
      setSavedPosts(savedPostsData);
    }

    // Load bookings if it's own profile
    if (isOwn) {
      const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      setBookings(savedBookings);
    }
  }, [username]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setUser(prev => ({
      ...prev,
      followers: isFollowing ? prev.followers - 1 : prev.followers + 1
    }));
  };

  const handlePostInteraction = (postId, action) => {
    const updatePosts = (postsList) => {
      return postsList.map(post => {
        if (post.id === postId) {
          switch (action) {
            case 'like':
              return {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
              };
            case 'comment':
              return { ...post, comments: post.comments + 1 };
            case 'repost':
              return { ...post, reposts: post.reposts + 1 };
            default:
              return post;
          }
        }
        return post;
      });
    };

    // Update posts
    setPosts(updatePosts);
    setSavedPosts(updatePosts);
    
    // Update in localStorage
    const allPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const updatedAllPosts = updatePosts(allPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedAllPosts));
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">Loading...</div>;
  }

  const renderPost = (post) => (
    <Card key={post.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar>
            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link to={`/profile/${post.user.username}`} className="font-semibold hover:underline">
                {post.user.name}
              </Link>
              <span className="text-gray-500">@{post.user.username}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-sm">{post.timestamp}</span>
            </div>
            
            <div className="mt-2">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
              {post.image && (
                <img src={post.image} alt="Post content" className="mt-3 rounded-lg max-w-full h-auto" />
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4 max-w-md">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-blue-600"
                onClick={() => handlePostInteraction(post.id, 'comment')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {post.comments}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-green-600"
                onClick={() => handlePostInteraction(post.id, 'repost')}
              >
                <Repeat2 className="h-4 w-4 mr-2" />
                {post.reposts}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}
                onClick={() => handlePostInteraction(post.id, 'like')}
              >
                <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
              <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.posts} posts</p>
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
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>
                  
                  {!isOwnProfile && (
                    <Button 
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className="mt-2 sm:mt-0"
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
                
                <p className="mt-2 text-gray-700">{user.bio}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {user.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {user.joinDate}
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-3">
                  <span className="text-sm">
                    <strong>{user.following}</strong> <span className="text-gray-500">Following</span>
                  </span>
                  <span className="text-sm">
                    <strong>{user.followers}</strong> <span className="text-gray-500">Followers</span>
                  </span>
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
            {!isOwnProfile && <TabsTrigger value="media">Media</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4 mt-6">
            {posts.length > 0 ? (
              posts.map(renderPost)
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
            <TabsContent value="saved" className="space-y-4 mt-6">
              {savedPosts.length > 0 ? (
                savedPosts.map(renderPost)
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No saved posts yet</p>
                  <Button className="mt-4" asChild>
                    <Link to="/community">Explore posts to save</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
          
          {isOwnProfile && (
            <TabsContent value="bookings" className="space-y-4 mt-6">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{booking.garageName}</h3>
                          <p className="text-gray-600">{booking.carBrand} {booking.carModel}</p>
                          <p className="text-sm text-gray-500">{booking.serviceDate} at {booking.serviceTime}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {booking.services.map((serviceId, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {serviceId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                          <p className="font-semibold mt-1">₹{booking.totalCost}</p>
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
