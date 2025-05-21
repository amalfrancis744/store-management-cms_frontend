'use client';

import React from 'react';
import { useNotificationContext } from '@/provider/NotificationProvider';

interface NotificationButtonProps {
  className?: string;
}

export default function NotificationButton({ className = '' }: NotificationButtonProps) {
  const { requestNotificationPermission, notificationPermission } = useNotificationContext();

  if (notificationPermission === 'granted') {
    return null; // Don't show button if already granted
  }

  return (
    <button
      onClick={requestNotificationPermission}
      className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${className}`}
    >
      {notificationPermission === 'denied'
        ? 'Notifications Blocked (Check Browser Settings)'
        : 'Enable Notifications'}
    </button>
  );
}