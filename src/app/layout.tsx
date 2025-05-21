'use client';

import NotificationProvider from '@/provider/NotificationProvider';
import './globals.css';
import { Providers } from './providers';
import { useNotificationContext } from '@/provider/NotificationProvider';
import NotificationButton from '@/components/notifications/NotificationButton';
import React from 'react';
import NotificationProviderSocket from '@/provider/SocketTestingProvider';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <NotificationProvider>
            <NotificationProviderSocket>
            <NotificationBanner />
            {children}
            </NotificationProviderSocket>
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}

function NotificationBanner() {
  const { notificationPermission, lastNotification } = useNotificationContext();

  // You can handle notifications here if needed
  React.useEffect(() => {
    if (lastNotification) {
      console.log('New notification received:', lastNotification);
    }
  }, [lastNotification]);

  if (notificationPermission === 'granted') return null;

  return (
    <div className="bg-blue-50 p-4 rounded-md mb-6 flex items-center justify-between">
      <div>
        <h3 className="font-medium">Stay Updated</h3>
        <p className="text-sm text-gray-600">
          Enable notifications to receive updates about new orders and important announcements.
        </p>
      </div>
      <NotificationButton />
    </div>
  );
}