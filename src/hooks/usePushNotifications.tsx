import { useState, useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (user) {
      initializePushNotifications();
    }
  }, [user]);

  const initializePushNotifications = async () => {
    if (Capacitor.isNativePlatform()) {
      // Mobile app push notifications
      await initializeMobilePush();
    } else {
      // Web push notifications
      await initializeWebPush();
    }
  };

  const initializeMobilePush = async () => {
    try {
      // Request permission to use push notifications
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        await PushNotifications.register();
        setIsRegistered(true);
      } else {
        console.log('Push notification permission not granted');
        return;
      }

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ', token.value);
        await savePushToken(token.value, 'mobile');
      });

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ', JSON.stringify(error));
      });

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
        toast({
          title: notification.title || 'New Notification',
          description: notification.body,
        });
      });

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        // Handle notification tap - navigate to relevant screen
        handleNotificationTap(notification.notification.data);
      });
    } catch (error) {
      console.error('Error initializing mobile push notifications:', error);
    }
  };

  const initializeWebPush = async () => {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
      }

      // Check if push notifications are supported
      if (!('PushManager' in window)) {
        console.log('Push notifications not supported');
        return;
      }

      // Request permission for notifications first
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      // Only then register the Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', {});

      // Validate VAPID key before subscribing (must be a base64-url string ~80-90 chars)
      const VAPID_KEY = 'BKKhvQW4sUHyrbJZnPotdBjCr82GcDqeC7-7L9y0C7GM8CyYP6k3-g8LfOQGRGGFdP4z-uJ7JcY8rGONlHNNJzE';
      const isLikelyValid = typeof VAPID_KEY === 'string' && VAPID_KEY.length > 80;
      if (!isLikelyValid) {
        console.warn('Skipping push subscription: missing/invalid VAPID key');
        return;
      }

      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
        });
        console.log('Push subscription created');
        await savePushToken(JSON.stringify(subscription), 'web');
        setIsRegistered(true);
      } catch (subErr) {
        console.error('Push subscription failed:', subErr);
      }
    } catch (error) {
      console.error('Error initializing web push notifications:', error);
    }
  };

  const savePushToken = async (token: string, platform: 'web' | 'mobile') => {
    if (!user) return;

    try {
      // Call our edge function to save the token
      await supabase.functions.invoke('save-push-token', {
        body: {
          token,
          platform
        }
      });
      console.log('Push token saved successfully');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  const handleNotificationTap = (data: any) => {
    // Navigate based on notification type
    if (data?.type === 'booking' && data?.booking_id) {
      window.location.href = `/booking/${data.booking_id}`;
    } else if (data?.type === 'like' || data?.type === 'comment') {
      window.location.href = '/community';
    } else {
      window.location.href = '/notifications';
    }
  };

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    isRegistered,
    permission,
    initializePushNotifications
  };
};