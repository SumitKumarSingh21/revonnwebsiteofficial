
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, Repeat2, Share, MoreHorizontal, Bell, Search, X, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CommentsSection from '@/components/CommentsSection';

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
        const { data: savedPosts } = await (supabase as any)
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
    if (!newPost.trim() || !user) return;

    try {
      const userProfile = profiles.find(p => p.id === user.id);
      
      const { error } = await supabase
        .from('posts')
        .insert({
          caption: newPost,
          post_image: selectedImage,
          user_id: user.id,
          username: userProfile?.username || user.email?.split('@')[0] || 'User',
          user_image: userProfile?.avatar_url,
          likes: 0,
          comments: 0
        });

      if (error) throw error;

      setNewPost('');
      setSelectedImage(null);
      setShowNewPostDialog(false);
      
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handlePostInteraction = async (postId: string, action: 'like') => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const updateData = { likes: post.likes + 1 };

      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, ...updateData }
          : p
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const handleSavePost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_saved) {
        // Unsave post
        await (supabase as any)
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
        await (supabase as any)
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

  if (loading) {
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
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>
              <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
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
                        />
                        <label htmlFor="image-upload">
                          <Button variant="ghost" size="sm" asChild>
                            <span className="cursor-pointer">📷 Photo</span>
                          </Button>
                        </label>
                      </div>
                      <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                        Post
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b sticky top-16 z-10">
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
                    <div className="flex space-x-3">
                      <Avatar>
                        <AvatarFallback>{item.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Link to={`/profile/${item.username}`} className="font-semibold hover:underline">
                              {item.username}
                            </Link>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-500 text-sm">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSavePost(item.id)}>
                                <Bookmark className={`h-4 w-4 mr-2 ${item.is_saved ? 'fill-current' : ''}`} />
                                {item.is_saved ? 'Unsave Post' : 'Save Post'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-gray-900 whitespace-pre-wrap">{item.caption}</p>
                          {item.post_image && (
                            <img src={item.post_image} alt="Post content" className="mt-3 rounded-lg max-w-full h-auto" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 max-w-md">
                          <CommentsSection 
                            postId={item.id}
                            commentsCount={item.comments}
                            onCommentsUpdate={(count) => handleCommentsUpdate(item.id, count)}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-green-600"
                          >
                            <Repeat2 className="h-4 w-4 mr-2" />
                            0
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-red-600"
                            onClick={() => handlePostInteraction(item.id, 'like')}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            {item.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                            <Share className="h-4 w-4" />
                          </Button>
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
