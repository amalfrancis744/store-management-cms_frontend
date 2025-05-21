import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage } from '@/service/firebaseMessaging';
import axiosInstance from '@/api/axios-config'; // Update with your path

// VAPID key should be provided by Firebase
// You can get this from Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration -> Web Push certificates
const VAPID_KEY = "BLhxG221hi7OLGxREEwnCWAwIvVlsBBL1WwQe77TY5HtHK2k5QFl6LIzGXr-EifCafZKd_g9IKON2gVb-kFVbFs"; // Replace with your VAPID key

interface UseNotificationsResult {
  notificationPermission: NotificationPermission | null;
  fcmToken: string | null;
  requestPermission: () => Promise<void>;
  lastNotification: any | null;
}

export function useNotifications(): UseNotificationsResult {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [fcmToken, setNotificationToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<any | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return;
    }

    // Get current permission status
    setNotificationPermission(Notification.permission);

    // Listen for incoming messages when the app is in the foreground
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        setLastNotification(payload);
        
        // Display a notification if needed
        if (Notification.permission === 'granted') {
          const title = payload.notification?.title || 'New Notification';
          const options = {
            body: payload.notification?.body || 'You have a new notification',
            icon: '/logo.png',
          };
          
          new Notification(title, options);
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, []);

  // Save the FCM token to your backend
  const saveTokenToServer = async (token: string) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
      
      if (userId) {
        await axiosInstance.post('/notifications/register-device', {
          userId,
          token,
          deviceType: 'web'
        });
        console.log('FCM token registered with backend');
      }
    } catch (error) {
      console.error('Error saving token to server:', error);
    }
  };

  // Request notification permission and get FCM token
  const requestPermission = async () => {
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted' && messaging) {
        // Get FCM token
        const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          setNotificationToken(fcmToken);
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  return {
    notificationPermission,
    fcmToken,
    requestPermission,
    lastNotification
  };
}