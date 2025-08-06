
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Notification } from '../types';
import { useAuth } from './AuthContext';

interface AddNotificationPayload {
    userId: number;
    message: string;
    productId: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (payload: AddNotificationPayload) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_KEY = 'belleza-notifications';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
      return storedNotifications ? JSON.parse(storedNotifications) : [];
    } catch (error) {
      console.error("Failed to load notifications from local storage.", error);
      return [];
    }
  });

  const { currentUser } = useAuth();

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (payload: AddNotificationPayload) => {
    const newNotification: Notification = {
        id: Date.now(),
        userId: payload.userId,
        message: payload.message,
        productId: payload.productId,
        read: false,
        date: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const markAllAsRead = () => {
      if (!currentUser) return;
      setNotifications(prev => 
        prev.map(n => (n.userId === currentUser.id && !n.read) ? { ...n, read: true } : n)
      );
  };

  const userNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const value = { 
      notifications: userNotifications, 
      unreadCount, 
      addNotification, 
      markAllAsRead 
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
