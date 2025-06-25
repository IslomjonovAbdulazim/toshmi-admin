import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import { NOTIFICATION_TYPES } from '../utils/constants';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ApiService.getNotifications();
      setNotifications(data);
      
      // Calculate unread count
      const unread = data.filter(notification => !notification.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      setError(err.message || 'Xabarlarni yuklashda xatolik');
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load unread count only
  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await ApiService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await ApiService.markNotificationRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      setError(err.message || 'Xabarni o\'qilgan deb belgilashda xatolik');
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await ApiService.markAllNotificationsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      setError(err.message || 'Barcha xabarlarni o\'qilgan deb belgilashda xatolik');
      console.error('Failed to mark all notifications as read:', err);
      return false;
    }
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.is_read);
  }, [notifications]);

  // Get recent notifications (last 10)
  const getRecentNotifications = useCallback((limit = 10) => {
    return notifications
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }, [notifications]);

  // Auto-refresh notifications
  const startAutoRefresh = useCallback((interval = 30000) => {
    const intervalId = setInterval(() => {
      loadUnreadCount();
    }, interval);
    
    return () => clearInterval(intervalId);
  }, [loadUnreadCount]);

  // Check if there are new notifications
  const hasNewNotifications = useCallback(() => {
    return unreadCount > 0;
  }, [unreadCount]);

  // Get notification icon based on type
  const getNotificationIcon = useCallback((type) => {
    const icons = {
      [NOTIFICATION_TYPES.SUCCESS]: '✅',
      [NOTIFICATION_TYPES.ERROR]: '❌',
      [NOTIFICATION_TYPES.WARNING]: '⚠️',
      [NOTIFICATION_TYPES.INFO]: 'ℹ️',
      homework: '📝',
      exam: '📊',
      payment: '💰',
      attendance: '👥',
      news: '📰',
      system: '⚙️'
    };
    return icons[type] || 'ℹ️';
  }, []);

  // Get notification color based on type
  const getNotificationColor = useCallback((type) => {
    const colors = {
      [NOTIFICATION_TYPES.SUCCESS]: '#10B981',
      [NOTIFICATION_TYPES.ERROR]: '#EF4444',
      [NOTIFICATION_TYPES.WARNING]: '#F59E0B',
      [NOTIFICATION_TYPES.INFO]: '#3B82F6',
      homework: '#8B5CF6',
      exam: '#F59E0B',
      payment: '#10B981',
      attendance: '#6366F1',
      news: '#EC4899',
      system: '#6B7280'
    };
    return colors[type] || '#6B7280';
  }, []);

  // Create a local notification (for immediate feedback)
  const createLocalNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(), // Temporary ID
      title: notification.title,
      message: notification.message,
      type: notification.type || NOTIFICATION_TYPES.INFO,
      is_read: false,
      created_at: new Date().toISOString(),
      isLocal: true // Mark as local notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-remove local notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(n => n.id !== newNotification.id)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }, 5000);

    return newNotification.id;
  }, []);

  // Remove local notification
  const removeLocalNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && notification.isLocal && !notification.is_read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Initialize notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Setup auto-refresh
  useEffect(() => {
    const cleanup = startAutoRefresh();
    return cleanup;
  }, [startAutoRefresh]);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,

    // Actions
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    createLocalNotification,
    removeLocalNotification,

    // Getters
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications,
    hasNewNotifications,
    getNotificationIcon,
    getNotificationColor,

    // Utils
    startAutoRefresh
  };
};

export default useNotifications;