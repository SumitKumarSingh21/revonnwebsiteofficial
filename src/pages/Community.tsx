
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Bell, Search, X, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  const currentUser = { id: 1, name: 'Current User', username: 'currentuser' };

  const samplePosts = [
    {
      id: 1,
      user: { id: 2, name: 'Car Enthusiast', username: 'carEnthusiast' },
      content: 'Just got my car serviced at AutoCare Hub. Excellent service and transparent pricing! Highly recommend them for brake service.',
      timestamp: '2h ago',
      likes: 12,
      comments: 3,
      reposts: 1,
      isLiked: false,
      image: null
    },
    {
      id: 2,
      user: { id: 3, name: 'Speed Demon', username: 'speedDemon' },
      content: 'Looking for recommendations for performance modifications in Ranchi. Any suggestions for trusted garages? @carEnthusiast',
      timestamp: '4h ago',
      likes: 8,
      comments: 5,
      reposts: 2,
      isLiked: true,
      image: null
    },
    {
      id: 3,
      user: { id: 4, name: 'Professional Mechanic', username: 'mechanic_pro' },
      content: 'Pro tip: Always check your oil level monthly. Regular maintenance saves thousands in repair costs!',
      timestamp: '1d ago',
      likes: 25,
      comments: 8,
      reposts: 6,
      isLiked: false,
      image: null
    }
  ];

  useEffect(() => {
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(samplePosts);
      localStorage.setItem('communityPosts', JSON.stringify(samplePosts));
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  const handleCreatePost = () => {
    if (newPost.trim() === '') return;

    const post = {
      id: Date.now(),
      user: currentUser,
      content: newPost,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      reposts: 0,
      isLiked: false,
      image: selectedImage
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    
    setNewPost('');
    setSelectedImage(null);
    setShowNewPostDialog(false);
    
    toast({
      title: "Post Created",
      description: "Your post has been shared with the community.",
    });
  };

  const handlePostInteraction = (postId, action) => {
    const updatedPosts = posts.map(post => {
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

    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  const handleSavePost = (postId) => {
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    if (!savedPosts.includes(postId)) {
      savedPosts.push(postId);
      localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
      toast({
        title: "Post Saved",
        description: "Post has been saved to your profile.",
      });
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
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
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex space-x-3">
                    <Avatar>
                      <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Link to={`/profile/${post.user.username}`} className="font-semibold hover:underline">
                            {post.user.name}
                          </Link>
                          <span className="text-gray-500">@{post.user.username}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500 text-sm">{post.timestamp}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSavePost(post.id)}>
                              <Bookmark className="h-4 w-4 mr-2" />
                              Save Post
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="h-4 w-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No posts found matching your search.' : 'No posts yet. Be the first to share!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
