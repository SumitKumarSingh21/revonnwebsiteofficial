
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, UserPlus, Calendar, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Sample notifications data
  const sampleNotifications = [
    {
      id: 1,
      type: 'like',
      user: { name: 'Car Enthusiast', username: 'carEnthusiast', avatar: '' },
      content: 'liked your post about AutoCare Hub service',
      timestamp: '2h ago',
      isRead: false
    },
    {
      id: 2,
      type: 'comment',
      user: { name: 'Speed Demon', username: 'speedDemon', avatar: '' },
      content: 'commented on your post: "Great recommendation! I\'ll definitely try them."',
      timestamp: '4h ago',
      isRead: false
    },
    {
      id: 3,
      type: 'follow',
      user: { name: 'Professional Mechanic', username: 'mechanic_pro', avatar: '' },
      content: 'started following you',
      timestamp: '1d ago',
      isRead: true
    },
    {
      id: 4,
      type: 'booking',
      content: 'Your booking at AutoCare Hub is confirmed for tomorrow at 10:00 AM',
      timestamp: '2d ago',
      isRead: true
    },
    {
      id: 5,
      type: 'mention',
      user: { name: 'Speed Demon', username: 'speedDemon', avatar: '' },
      content: 'mentioned you in a post about performance modifications',
      timestamp: '3d ago',
      isRead: true
    }
  ];

  useEffect(() => {
    // Load notifications from localStorage or use sample data
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      setNotifications(sampleNotifications);
      localStorage.setItem('notifications', JSON.stringify(sampleNotifications));
    }
  }, []);

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => 
      ({ ...notification, isRead: true })
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'booking':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'mention':
        return <Bell className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            {unreadCount === 0 && <div className="w-20"></div>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {notification.user ? (
                        <Avatar>
                          <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="mt-1">
                        {notification.user && (
                          <Link 
                            to={`/profile/${notification.user.username}`}
                            className="font-semibold text-gray-900 hover:underline"
                          >
                            {notification.user.name}
                          </Link>
                        )}
                        
                        <p className={`text-sm ${notification.user ? 'inline ml-1' : ''} ${
                          !notification.isRead ? 'font-medium text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.content}
                        </p>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500 mb-6">
              You'll see notifications here when people interact with your posts or book services.
            </p>
            <Button asChild>
              <Link to="/community">Go to Community</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
