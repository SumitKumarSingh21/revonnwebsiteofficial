
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Heart, MessageCircle, Repeat2, MoreHorizontal, Share, Bookmark, Flag, Copy, Image, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [user] = useState({ id: 1, username: 'currentuser', name: 'Current User', avatar: '' });

  // Sample posts data
  const samplePosts = [
    {
      id: 1,
      user: { id: 2, username: 'carEnthusiast', name: 'Car Enthusiast', avatar: '' },
      content: 'Just got my car serviced at AutoCare Hub! Amazing service and great pricing. Highly recommend for anyone in Ranchi! 🚗✨',
      image: null,
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3,
      reposts: 1,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      user: { id: 3, username: 'speedDemon', name: 'Speed Demon', avatar: '' },
      content: 'Looking for recommendations for performance modifications. Anyone know good places in Ranchi? @carEnthusiast',
      image: null,
      timestamp: '4 hours ago',
      likes: 8,
      comments: 7,
      reposts: 2,
      isLiked: true,
      isBookmarked: false
    },
    {
      id: 3,
      user: { id: 4, username: 'mechanic_pro', name: 'Professional Mechanic', avatar: '' },
      content: 'Quick tip: Always check your oil levels before long drives! Prevention is better than costly repairs. Stay safe on the road! 🔧',
      image: null,
      timestamp: '1 day ago',
      likes: 25,
      comments: 5,
      reposts: 8,
      isLiked: false,
      isBookmarked: true
    }
  ];

  useEffect(() => {
    // Load posts from localStorage or use sample data
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(samplePosts);
      localStorage.setItem('communityPosts', JSON.stringify(samplePosts));
    }
  }, []);

  const handlePost = () => {
    if (!newPost.trim() && !selectedImage) {
      toast({
        title: "Empty Post",
        description: "Please add some content to your post.",
        variant: "destructive"
      });
      return;
    }

    const post = {
      id: Date.now(),
      user: user,
      content: newPost,
      image: selectedImage,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      reposts: 0,
      isLiked: false,
      isBookmarked: false
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    
    setNewPost('');
    setSelectedImage(null);
    
    toast({
      title: "Post Shared!",
      description: "Your post has been shared with the community.",
    });
  };

  const handleLike = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  const handleBookmark = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    
    const post = posts.find(p => p.id === postId);
    toast({
      title: post?.isBookmarked ? "Removed from Saved" : "Post Saved",
      description: post?.isBookmarked ? "Post removed from your saved posts." : "Post saved to your collection.",
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyPostLink = (postId) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast({
      title: "Link Copied",
      description: "Post link copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Community</h1>
            <Button size="sm" asChild>
              <Link to="/notifications">
                Notifications
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Create Post */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar>
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] resize-none border-none shadow-none text-lg"
                />
                
                {selectedImage && (
                  <div className="relative">
                    <img src={selectedImage} alt="Selected" className="rounded-lg max-h-64 w-full object-cover" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setSelectedImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Image className="h-5 w-5 text-blue-600 hover:text-blue-700" />
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <Button onClick={handlePost} disabled={!newPost.trim() && !selectedImage}>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <Link to={`/profile/${post.user.username}`}>
                    <Avatar className="cursor-pointer hover:opacity-80">
                      <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  
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
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem onClick={() => handleBookmark(post.id)}>
                            <Bookmark className="h-4 w-4 mr-2" />
                            {post.isBookmarked ? 'Remove from Saved' : 'Save Post'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyPostLink(post.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            Report Post
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
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.comments}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-green-600"
                      >
                        <Repeat2 className="h-4 w-4 mr-2" />
                        {post.reposts}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${post.isLiked ? 'text-red-600' : 'text-gray-500'} hover:text-red-600`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 md:hidden">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-between">
              <label htmlFor="mobile-image-upload" className="cursor-pointer">
                <Image className="h-6 w-6 text-blue-600" />
                <input
                  id="mobile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <Button onClick={handlePost}>Post</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
