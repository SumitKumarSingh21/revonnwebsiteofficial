import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Repeat2, Share, MoreHorizontal, Bell, Search, X, Bookmark, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CommentsSection from '@/components/CommentsSection';
import LikeButton from '@/components/LikeButton';

interface Post {
  id: string;
  caption: string;
  post_image?: string | null;
  likes: number;
  comments: number;
  username: string;
  user_image?: string;
  user_id: string;
  created_at: string;
  is_saved?: boolean;
}

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchProfiles();
    }
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which posts are saved by current user
      if (user) {
        const { data: savedPosts } = await supabase
          .from('saved_posts')
          .select('post_id')
          .eq('user_id', user.id);

        const savedPostIds = new Set(savedPosts?.map((sp: any) => sp.post_id) || []);
        
        const postsWithSaveStatus = (data || []).map(post => ({
          ...post,
          is_saved: savedPostIds.has(post.id)
        }));

        setPosts(postsWithSaveStatus);
      } else {
        setPosts(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) {
      toast({
        title: "Error",
        description: "Please enter some text for your post",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPost(true);
    
    try {
      const userProfile = profiles.find(p => p.id === user.id);
      
      const postData = {
        caption: newPost.trim(),
        post_image: selectedImage, // Can be null now that the column is nullable
        user_id: user.id,
        username: userProfile?.username || user.email?.split('@')[0] || 'User',
        user_image: userProfile?.avatar_url || null,
        likes: 0,
        comments: 0
      };

      console.log('Creating post with data:', postData);

      const { error } = await supabase
        .from('posts')
        .insert(postData);

      if (error) {
        console.error('Post creation error:', error);
        throw error;
      }

      setNewPost('');
      setSelectedImage(null);
      setShowNewPostDialog(false);
      
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community.",
      });

      // Refresh posts
      await fetchPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleSavePost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_saved) {
        // Unsave post
        await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        toast({
          title: "Post unsaved",
          description: "Post removed from your saved posts.",
        });
      } else {
        // Save post
        await supabase
          .from('saved_posts')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        toast({
          title: "Post saved",
          description: "Post added to your saved posts.",
        });
      }

      // Update local state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, is_saved: !p.is_saved }
          : p
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    }
  };

  const handleSharePost = async (postId: string, platform?: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const shareText = `Check out this post by ${post.username}: ${post.caption}`;
    const shareUrl = `${window.location.origin}/community`;

    if (platform) {
      let url = '';
      switch (platform) {
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
          break;
        case 'whatsapp':
          url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
          break;
        case 'linkedin':
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          break;
      }
      
      if (url) {
        window.open(url, '_blank', 'width=600,height=400');
        return;
      }
    }

    // Fallback to copying link
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleCommentsUpdate = (postId: string, newCount: number) => {
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, comments: newCount }
        : p
    ));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  const filteredContent = searchQuery.trim() === '' ? posts : [
    ...posts.filter(post => 
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    ...profiles.filter(profile =>
      profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(profile => ({ ...profile, type: 'profile' }))
  ];

  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove the post from local state
      setPosts(posts.filter(p => p.id !== postId));

      toast({
        title: "Post Deleted",
        description: "Your post has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Fixed Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-3 flex-1">
              <img src="/lovable-uploads/5917b996-fa5e-424e-929c-45aab08219a5.png" alt="Revonn Logo" className="h-8 w-8" />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-red-600">Revonn</h1>
                <p className="text-xs text-gray-500">Beyond Class</p>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Community</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="What's on your mind?"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[100px] border-none resize-none focus:ring-0 p-0"
                        disabled={isCreatingPost}
                      />
                    </div>
                  </div>
                  
                  {selectedImage && (
                    <div className="relative">
                      <img src={selectedImage} alt="Selected" className="max-w-full h-auto rounded-lg" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                        onClick={() => setSelectedImage(null)}
                        disabled={isCreatingPost}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isCreatingPost}
                      />
                      <label htmlFor="image-upload">
                        <Button variant="ghost" size="sm" asChild>
                          <span className={`cursor-pointer ${isCreatingPost ? 'pointer-events-none opacity-50' : ''}`}>📷 Photo</span>
                        </Button>
                      </label>
                    </div>
                    <Button 
                      onClick={handleCreatePost} 
                      disabled={!newPost.trim() || isCreatingPost} 
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isCreatingPost ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b sticky top-28 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search posts or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredContent.length > 0 ? (
          <div className="space-y-4">
            {filteredContent.map((item: any) => (
              item.type === 'profile' ? (
                
                <Card key={`profile-${item.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link to={`/profile/${item.username}`} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{item.full_name?.charAt(0) || item.username?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{item.full_name || item.username}</p>
                        <p className="text-gray-500">@{item.username}</p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="flex-shrink-0">
                          <AvatarFallback>{item.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <Link to={`/profile/${item.username}`} className="font-semibold hover:underline truncate text-gray-900">
                                {item.username}
                              </Link>
                              <span className="text-gray-400 text-sm">·</span>
                              <span className="text-gray-500 text-sm flex-shrink-0">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-shrink-0 h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleSavePost(item.id)}>
                                  <Bookmark className={`h-4 w-4 mr-2 ${item.is_saved ? 'fill-current' : ''}`} />
                                  {item.is_saved ? 'Unsave Post' : 'Save Post'}
                                </DropdownMenuItem>
                                {user && item.user_id === user.id && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Post
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this post? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeletePost(item.id)} className="bg-red-600 hover:bg-red-700">
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                                <DropdownMenuItem onClick={() => handleSharePost(item.id)}>
                                  Copy Link
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-gray-900 whitespace-pre-wrap break-words">{item.caption}</p>
                            {item.post_image && (
                              <img src={item.post_image} alt="Post content" className="mt-3 rounded-lg max-w-full h-auto" />
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-1 sm:space-x-4">
                              <CommentsSection 
                                postId={item.id}
                                commentsCount={item.comments}
                                onCommentsUpdate={(count) => handleCommentsUpdate(item.id, count)}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-500 hover:text-green-600 h-8 px-2 sm:px-3"
                              >
                                <Repeat2 className="h-4 w-4 mr-1" />
                                <span className="text-xs sm:text-sm">0</span>
                              </Button>
                              <LikeButton 
                                postId={item.id}
                                initialLikes={item.likes}
                                onLikeChange={(newCount) => {
                                  setPosts(posts.map(p => 
                                    p.id === item.id ? { ...p, likes: newCount } : p
                                  ));
                                }}
                              />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 h-8 w-8 p-0">
                                    <Share className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleSharePost(item.id, 'twitter')}>
                                    Share on Twitter
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSharePost(item.id, 'facebook')}>
                                    Share on Facebook
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSharePost(item.id, 'whatsapp')}>
                                    Share on WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSharePost(item.id)}>
                                    Copy Link
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No posts or users found matching your search.' : 'No posts yet. Be the first to share!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
