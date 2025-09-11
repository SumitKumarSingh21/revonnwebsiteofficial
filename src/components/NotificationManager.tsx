import React, { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';

const NotificationManager: React.FC = () => {
  const { user } = useAuth();
  const { initializePushNotifications, permission } = usePushNotifications();

  useEffect(() => {
    if (user) {
      initializePushNotifications();
    }
  }, [user, initializePushNotifications]);

  // This component doesn't render anything visible
  return null;
};

export default NotificationManager;