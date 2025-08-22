
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
  notificationError: ApiError | null; // Use ApiError for consistency
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  addNotification: (payload: AddNotificationPayload) => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>; // Changed to mark single notification
  markAllNotificationsAsRead: () => Promise<void>; // Added for marking all
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);
  const [notificationError, setNotificationError] = useState<ApiError | null>(null);

  const { currentUser } = useAuth();

  // Fetch notifications when the user changes
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    } else {
      setNotifications([]); // Clear notifications if user logs out
    }
  }, [currentUser]); // Depend on currentUser

  // Function to fetch notifications from the backend for the current user
  const fetchNotifications = async () => {
    if (!currentUser) return;

    setIsLoadingNotifications(true);
    setNotificationError(null);
    try {
      // Assuming an API endpoint like /api/notifications?userId=...
      const response = await fetch(`/api/notifications?userId=${currentUser.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }
      const data: Notification[] = await response.json();
      setNotifications(data);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      setNotificationError({ message: error.message || 'An unknown error occurred' });
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Function to add a new notification via backend API
  const addNotification = async (payload: AddNotificationPayload) => {
     // This might be triggered server-side, but if needed client-side:
     setIsLoadingNotifications(true);
     setNotificationError(null);
     try {
       // Assuming an API endpoint like POST /api/notifications
       const response = await fetch('/api/notifications', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
       });
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to add notification');
       }
       const newNotification: Notification = await response.json(); // Assuming backend returns the created notification
       // Add the new notification to the state and refetch to be sure (or update state optimistically)
       setNotifications(prev => [newNotification, ...prev]);
       // Or simpler: fetchNotifications();
     } catch (error: any) {
       console.error("Error adding notification:", error);
       setNotificationError({ message: error.message || 'An unknown error occurred' });
     } finally {
       setIsLoadingNotifications(false);
     }
  };

  // Function to mark a single notification as read via backend API
  const markNotificationAsRead = async (notificationId: number) => {
      if (!currentUser) return;

      setIsLoadingNotifications(true);
      setNotificationError(null);
      try {
        // Assuming an API endpoint like PUT /api/notifications/:id/read
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        });
        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || `Failed to mark notification ${notificationId} as read`);
        }
        // Update the local state for the specific notification
        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );
      } catch (error: any) {
        console.error(`Error marking notification ${notificationId} as read:`, error);
        setNotificationError({ message: error.message || 'An unknown error occurred' });
      } finally {
        setIsLoadingNotifications(false);
      }
    };

  // Function to mark all notifications for the current user as read via backend API
  const markAllNotificationsAsRead = async () => {
      if (!currentUser) return;

      setIsLoadingNotifications(true);
      setNotificationError(null);
      try {
        // Assuming an API endpoint like PUT /api/notifications/mark-all-read?userId=...
        const response = await fetch(`/api/notifications/mark-all-read?userId=${currentUser.id}`, {
          method: 'PUT',
        });
        if (!response.ok) {
            const errorData = await response.json();
           throw new Error(errorData.message || 'Failed to mark all notifications as read');
        }
        // Update the local state for all notifications of the current user
         setNotifications(prev =>
            prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
        );
      } catch (error: any) {
         console.error("Error marking all notifications as read:", error);
        setNotificationError({ message: error.message || 'An unknown error occurred' });
      } finally {
         setIsLoadingNotifications(false);
      }
  };

  const userNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const value = { 
    notifications: userNotifications,
    isLoadingNotifications,
    notificationError,
    unreadCount,
    fetchNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
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

