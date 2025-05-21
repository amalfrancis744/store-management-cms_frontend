'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNotifications } from '@/hooks/firebaseNotification/use-notifications';
import { useAuth } from '@/hooks/use-auth';

// Define the context type
interface NotificationContextType {
  requestNotificationPermission: () => Promise<void>;
  notificationPermission: NotificationPermission | null;
  lastNotification: any | null;
  fcmToken: string | null;
  

}

// Create the context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Define provider props type
interface NotificationProviderProps {
  children: ReactNode;
}

// Export the provider component
export default function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const { 
    notificationPermission, 
    fcmToken, 
    requestPermission,
    lastNotification 
  } = useNotifications();

  // Check if user is logged in and show permission prompt
  useEffect(() => {
    if (user && Notification.permission === 'default') {
      // Optional: Show a custom UI to explain why you need notifications
      // before calling requestPermission()
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    await requestPermission();
  };

  // Context value
  const contextValue: NotificationContextType = {
    requestNotificationPermission,
    notificationPermission,
    lastNotification,
    fcmToken
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use the notification context
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}