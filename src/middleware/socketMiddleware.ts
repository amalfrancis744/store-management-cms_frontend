// src/middleware/socketMiddleware.ts
import { Middleware } from 'redux';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import {
  setConnected,
  incrementConnectionAttempts,
  resetConnectionAttempts,
  addNotification,
  setLastError,
  Notification,
} from '@/store/slices/socket/socketSlice';
import { getSocket } from '@/lib/socket';

// Configuration constants
const MAX_CONNECTION_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const RECONNECT_DELAY_MULTIPLIER = 2;

export const socketMiddleware: Middleware = (store) => {
  let socket: Socket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let currentReconnectDelay = INITIAL_RECONNECT_DELAY;
  let isExplicitDisconnect = false;

  // Cleanup timer
  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  // Calculate next reconnect delay with exponential backoff
  const calculateReconnectDelay = () => {
    currentReconnectDelay = Math.min(
      currentReconnectDelay * RECONNECT_DELAY_MULTIPLIER,
      MAX_RECONNECT_DELAY
    );
    return currentReconnectDelay;
  };

  // Reset delay when connection is successful
  const resetReconnectDelay = () => {
    currentReconnectDelay = INITIAL_RECONNECT_DELAY;
  };

  // Main connection function
  const connectSocket = () => {
    isExplicitDisconnect = false;
    
    if (!socket) {
      try {
        socket = getSocket();
        if (socket) {
          setupSocketListeners(socket);
          socket.connect();
        }
      } catch (error) {
        console.error('Socket initialization error:', error);
        store.dispatch(setLastError('Failed to initialize socket'));
      }
    } else if (!socket.connected) {
      socket.connect();
    }
  };

  // Setup all socket event listeners
  const setupSocketListeners = (socket: Socket) => {
    // Clear existing listeners to prevent duplicates
    socket.removeAllListeners();

    // Connection established
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      store.dispatch(setConnected(true));
      store.dispatch(resetConnectionAttempts());
      store.dispatch(setLastError(null));
      resetReconnectDelay();
      clearReconnectTimer();
      
      toast.success('Connected to real-time server', { autoClose: 2000 });
    });

    // Connection lost
    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      store.dispatch(setConnected(false));
      
      if (!isExplicitDisconnect) {
        toast.warning(`Disconnected: ${reason}`, { autoClose: 3000 });
        attemptReconnect();
      }
    });

    // Connection error
    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
      store.dispatch(setConnected(false));
      store.dispatch(setLastError(error.message));
      store.dispatch(incrementConnectionAttempts());
      
      const state = store.getState().socket;
      if (state.connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
        attemptReconnect();
      } else {
        toast.error('Failed to connect to server. Please refresh the page.', {
          autoClose: false,
          toastId: 'connection-failed'
        });
      }
    });

    // Ping/Pong for connection health
    socket.on('pong', () => {
      console.debug('Server pong received');
    });

    // Order events
    socket.on('order:new', (data: any) => {
      console.log('New order received:', data);
      const notification: Notification = {
        id: `order-new-${Date.now()}`,
        title: 'New Order',
        message: `New order from ${data.user?.name || 'customer'} - $${data.totalAmount}`,
        type: 'INFO',
        createdAt: new Date().toISOString(),
        workspaceId: data.workspaceId || 0,
        read: false,
      };
      handleNewNotification(notification);
    });

    socket.on('order:statusUpdated', (payload: any) => {
      console.log('Order status updated:', payload);
      const notification: Notification = {
        id: `order-status-${Date.now()}`,
        title: 'Order Updated',
        message: `Order #${payload.orderId} is now ${payload.status}`,
        type: 'INFO',
        createdAt: new Date().toISOString(),
        workspaceId: payload.workspaceId || 0,
        read: false,
      };
      handleNewNotification(notification);
    });

    // Custom notifications
    socket.on('notification', (notification: Omit<Notification, 'read'>) => {
      console.log('Received notification:', notification);
      const completeNotification: Notification = {
        ...notification,
        id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        read: false,
      };
      handleNewNotification(completeNotification);
    });

    // Error events
    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      toast.error(`Server error: ${error.message}`);
    });
  };

  // Handle new notifications consistently
  const handleNewNotification = (notification: Notification) => {
    store.dispatch(addNotification(notification));
    
    switch (notification.type) {
      case 'SUCCESS':
        toast.success(notification.message, { autoClose: 5000 });
        break;
      case 'WARNING':
        toast.warning(notification.message, { autoClose: 5000 });
        break;
      case 'ERROR':
        toast.error(notification.message, { autoClose: false });
        break;
      default:
        toast.info(notification.message, { autoClose: 5000 });
    }
  };

  // Attempt to reconnect with backoff
  const attemptReconnect = () => {
    clearReconnectTimer();
    
    const state = store.getState().socket;
    if (state.connectionAttempts >= MAX_CONNECTION_ATTEMPTS || !socket || isExplicitDisconnect) {
      return;
    }

    const delay = calculateReconnectDelay();
    console.log(`Attempting reconnect in ${delay}ms...`);
    
    reconnectTimer = setTimeout(() => {
      if (socket && !socket.connected && !isExplicitDisconnect) {
        console.log('Attempting to reconnect...');
        socket.connect();
      }
    }, delay);
  };

  // Cleanly disconnect socket
  const disconnectSocket = () => {
    isExplicitDisconnect = true;
    clearReconnectTimer();
    
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
    
    store.dispatch(setConnected(false));
    console.log('Socket intentionally disconnected');
  };

  // Middleware entry point
  return (next) => (action: { type: string; payload?: any }) => {
    switch (action.type) {
      case 'socket/connect/fulfilled':
        connectSocket();
        break;
        
      case 'socket/disconnect/fulfilled':
        disconnectSocket();
        break;
        
      case 'socket/send':
        if (socket?.connected && action.payload) {
          socket.emit(action.payload.event, action.payload.data);
        }
        break;
        
      default:
        // Handle other actions if needed
        break;
    }

    return next(action);
  };
};

export default socketMiddleware;