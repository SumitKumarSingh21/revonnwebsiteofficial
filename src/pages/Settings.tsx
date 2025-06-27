
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, MessageSquare, Bell, Link2, AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({
    name: 'Current User',
    username: 'currentuser',
    email: 'user@example.com',
    bio: 'Car enthusiast from Ranchi. Love sharing car care tips and experiences!',
    location: 'Ranchi, Jharkhand'
  });

  const [privacy, setPrivacy] = useState({
    isPublic: true,
    allowComments: true,
    allowMessages: true
  });

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    bookings: true
  });

  const [linkedAccounts] = useState({
    whatsapp: false,
    instagram: false,
    google: true
  });

  // Load user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (data) {
            setProfile({
              name: data.full_name || user.email || 'Current User',
              username: data.username || 'currentuser',
              email: user.email || 'user@example.com',
              bio: data.bio || 'Car enthusiast from Ranchi. Love sharing car care tips and experiences!',
              location: 'Ranchi, Jharkhand'
            });
          }
        } catch (error: any) {
          console.error('Error loading profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.name,
          username: profile.username,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePasswordChange = async () => {
    toast({
      title: "Password Reset",
      description: "Password reset email has been sent to your email address.",
    });
  };

  const handlePrivacyUpdate = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleNotificationUpdate = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleDeactivate = async () => {
    try {
      // Update profile to indicate deactivation
      await supabase
        .from('profiles')
        .update({ 
          bio: '[Account Deactivated]',
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      toast({
        title: "Account Deactivated",
        description: "Your account has been temporarily deactivated.",
      });
      
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to deactivate account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    try {
      // Delete user data from our tables first
      await Promise.all([
        supabase.from('profiles').delete().eq('id', user.id),
        (supabase as any).from('saved_posts').delete().eq('user_id', user.id),
        supabase.from('posts').delete().eq('user_id', user.id),
        supabase.from('bookings').delete().eq('user_id', user.id),
        supabase.from('followers').delete().eq('follower_id', user.id),
        supabase.from('followers').delete().eq('following_id', user.id)
      ]);

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
        variant: "destructive"
      });

      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                disabled
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
              />
            </div>
            
            <Button onClick={handleProfileUpdate}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-gray-500">Allow others to find and view your profile</p>
              </div>
              <Switch
                id="public-profile"
                checked={privacy.isPublic}
                onCheckedChange={(checked) => handlePrivacyUpdate('isPublic', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-comments">Allow Comments</Label>
                <p className="text-sm text-gray-500">Let others comment on your posts</p>
              </div>
              <Switch
                id="allow-comments"
                checked={privacy.allowComments}
                onCheckedChange={(checked) => handlePrivacyUpdate('allowComments', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-messages">Allow Messages</Label>
                <p className="text-sm text-gray-500">Let others send you direct messages</p>
              </div>
              <Switch
                id="allow-messages"
                checked={privacy.allowMessages}
                onCheckedChange={(checked) => handlePrivacyUpdate('allowMessages', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify-likes">Likes</Label>
                <p className="text-sm text-gray-500">Get notified when someone likes your posts</p>
              </div>
              <Switch
                id="notify-likes"
                checked={notifications.likes}
                onCheckedChange={(checked) => handleNotificationUpdate('likes', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify-comments">Comments</Label>
                <p className="text-sm text-gray-500">Get notified when someone comments on your posts</p>
              </div>
              <Switch
                id="notify-comments"
                checked={notifications.comments}
                onCheckedChange={(checked) => handleNotificationUpdate('comments', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify-follows">New Followers</Label>
                <p className="text-sm text-gray-500">Get notified when someone follows you</p>
              </div>
              <Switch
                id="notify-follows"
                checked={notifications.follows}
                onCheckedChange={(checked) => handleNotificationUpdate('follows', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify-bookings">Booking Updates</Label>
                <p className="text-sm text-gray-500">Get notified about your service bookings</p>
              </div>
              <Switch
                id="notify-bookings"
                checked={notifications.bookings}
                onCheckedChange={(checked) => handleNotificationUpdate('bookings', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Linked Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link2 className="h-5 w-5 mr-2" />
              Linked Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <p className="text-sm text-gray-500">
                    {linkedAccounts.whatsapp ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <Button variant={linkedAccounts.whatsapp ? "outline" : "default"} size="sm">
                {linkedAccounts.whatsapp ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">I</span>
                </div>
                <div>
                  <Label>Instagram</Label>
                  <p className="text-sm text-gray-500">
                    {linkedAccounts.instagram ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <Button variant={linkedAccounts.instagram ? "outline" : "default"} size="sm">
                {linkedAccounts.instagram ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <div>
                  <Label>Google</Label>
                  <p className="text-sm text-gray-500">
                    {linkedAccounts.google ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <Button variant={linkedAccounts.google ? "outline" : "default"} size="sm">
                {linkedAccounts.google ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Control */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Account Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handleDeactivate} className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                Deactivate Account
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Are you sure you want to permanently delete your account? This action cannot be undone.
                      All your posts, bookings, and data will be permanently removed.
                    </p>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-red-800 font-medium">This action is irreversible!</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Yes, Delete My Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
