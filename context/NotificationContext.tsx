
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { ApiError } from '../types'; // Assuming you have an ApiError type

interface AddNotificationPayload {
    userId: number;
    message: string;
    productId: number;
}

interface MarkAsReadPayload {
    notificationId: number; // Assuming notifications have IDs for individual marking
    userId: number;
}

interface NotificationContextType {
  notifications: Notification[];
  isLoadingNotifications: boolean;
  notificationError: ApiError | null;
  unreadCount: number;
  addNotification: (payload: AddNotificationPayload) => void;
  markAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);
  const [notificationError, setNotificationError] = useState<ApiError | null>(null);

  const { currentUser } = useAuth();

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (payload: AddNotificationPayload) => {
    try {
      const newNotification: Notification = {
        id: Date.now(),
        userId: payload.userId,
        message: payload.message,
        productId: payload.productId,
        read: false,
        date: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
    } catch (error: any) {
      console.error("Error adding notification:", error);
      setNotificationError({ message: error.message || 'An unknown error occurred' });
    }
  };

  const markAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  const userNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const value = { 
    notifications: userNotifications,
    isLoadingNotifications,
    notificationError,
    unreadCount,
    addNotification,
    markAsRead,
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

