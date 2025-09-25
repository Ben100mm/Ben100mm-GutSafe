/**
 * @fileoverview NotificationService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform, Alert } from 'react-native';
import AsyncStorage from '../utils/AsyncStorage';
import { SafeFood } from '../types';

/**
 * NotificationService - Handles push notifications and local notifications
 * Provides meal reminders, new safe foods alerts, and other notifications
 */
class NotificationService {
  private static instance: NotificationService;
  private notificationPermission: boolean = false;
  private scheduledNotifications: Map<string, any> = new Map();
  private notificationSettings = {
    mealReminders: true,
    newSafeFoods: true,
    scanReminders: false,
    weeklyReports: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  };

  // Storage keys
  private readonly KEYS = {
    NOTIFICATION_SETTINGS: 'gut_safe_notification_settings',
    SCHEDULED_NOTIFICATIONS: 'gut_safe_scheduled_notifications',
    NOTIFICATION_HISTORY: 'gut_safe_notification_history',
  };

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadSettings();
      await this.requestPermission();
      await this.setupDefaultNotifications();
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      // In a real React Native app, you would use:
      // import { requestPermissions, scheduleNotificationAsync } from 'expo-notifications';
      
      // For web, we'll use the Web Notifications API
      if (Platform.OS === 'web') {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          this.notificationPermission = permission === 'granted';
        } else {
          console.warn('This browser does not support notifications');
          this.notificationPermission = false;
        }
      } else {
        // React Native implementation would go here
        this.notificationPermission = true; // Simulate permission granted
      }

      return this.notificationPermission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.notificationPermission;
  }

  /**
   * Schedule meal reminder notification
   */
  async scheduleMealReminder(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    time: string,
    customMessage?: string
  ): Promise<string> {
    if (!this.notificationPermission || !this.notificationSettings.mealReminders) {
      return '';
    }

    const notificationId = `meal_${mealType}_${Date.now()}`;
    const [hours, minutes] = time.split(':').map(Number);
    
    const mealMessages = {
      breakfast: 'Good morning! Time for breakfast. Remember to scan your food for gut health.',
      lunch: 'Lunch time! Don\'t forget to check your food before eating.',
      dinner: 'Dinner time! Scan your meal to ensure it\'s safe for your gut.',
      snack: 'Snack time! Quick scan to keep your gut happy.',
    };

    const message = customMessage || mealMessages[mealType];
    
    // Schedule notification
    const notification = {
      id: notificationId,
      title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Reminder`,
      body: message,
      data: {
        type: 'meal_reminder',
        mealType,
        time,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    };

    await this.scheduleNotification(notification);
    return notificationId;
  }

  /**
   * Schedule new safe foods notification
   */
  async scheduleNewSafeFoodsNotification(safeFoods: SafeFood[]): Promise<string> {
    if (!this.notificationPermission || !this.notificationSettings.newSafeFoods) {
      return '';
    }

    const notificationId = `new_safe_foods_${Date.now()}`;
    const foodNames = safeFoods.slice(0, 3).map(food => food.foodItem.name).join(', ');
    const moreCount = safeFoods.length - 3;
    
    const message = moreCount > 0 
      ? `New safe foods available: ${foodNames} and ${moreCount} more!`
      : `New safe foods available: ${foodNames}!`;

    const notification = {
      id: notificationId,
      title: 'New Safe Foods Found!',
      body: message,
      data: {
        type: 'new_safe_foods',
        safeFoods: safeFoods.map(food => food.id),
      },
      trigger: {
        seconds: 5, // Show immediately for demo
      },
    };

    await this.scheduleNotification(notification);
    return notificationId;
  }

  /**
   * Schedule scan reminder notification
   */
  async scheduleScanReminder(delayMinutes: number = 30): Promise<string> {
    if (!this.notificationPermission || !this.notificationSettings.scanReminders) {
      return '';
    }

    const notificationId = `scan_reminder_${Date.now()}`;
    
    const notification = {
      id: notificationId,
      title: 'Don\'t Forget to Scan!',
      body: 'Remember to scan your food to track your gut health.',
      data: {
        type: 'scan_reminder',
      },
      trigger: {
        seconds: delayMinutes * 60,
      },
    };

    await this.scheduleNotification(notification);
    return notificationId;
  }

  /**
   * Schedule weekly report notification
   */
  async scheduleWeeklyReport(dayOfWeek: number = 1, time: string = '09:00'): Promise<string> {
    if (!this.notificationPermission || !this.notificationSettings.weeklyReports) {
      return '';
    }

    const notificationId = `weekly_report_${Date.now()}`;
    const [hours, minutes] = time.split(':').map(Number);
    
    const notification = {
      id: notificationId,
      title: 'Weekly Gut Health Report',
      body: 'Your weekly gut health summary is ready! Check your progress and insights.',
      data: {
        type: 'weekly_report',
      },
      trigger: {
        weekday: dayOfWeek,
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    };

    await this.scheduleNotification(notification);
    return notificationId;
  }

  /**
   * Schedule custom notification
   */
  async scheduleCustomNotification(
    title: string,
    body: string,
    trigger: any,
    data?: any
  ): Promise<string> {
    if (!this.notificationPermission) {
      return '';
    }

    const notificationId = `custom_${Date.now()}`;
    
    const notification = {
      id: notificationId,
      title,
      body,
      data: {
        type: 'custom',
        ...data,
      },
      trigger,
    };

    await this.scheduleNotification(notification);
    return notificationId;
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      // In a real app, you would use:
      // await cancelScheduledNotificationAsync(notificationId);
      
      this.scheduledNotifications.delete(notificationId);
      await this.saveScheduledNotifications();
      console.log(`Cancelled notification: ${notificationId}`);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      // In a real app, you would use:
      // await cancelAllScheduledNotificationsAsync();
      
      this.scheduledNotifications.clear();
      await this.saveScheduledNotifications();
      console.log('Cancelled all notifications');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Get scheduled notifications
   */
  getScheduledNotifications(): any[] {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * Update notification settings
   */
  async updateSettings(newSettings: Partial<typeof this.notificationSettings>): Promise<void> {
    try {
      this.notificationSettings = { ...this.notificationSettings, ...newSettings };
      await this.saveSettings();
      
      // Reschedule notifications based on new settings
      await this.rescheduleNotifications();
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  /**
   * Get notification settings
   */
  getSettings(): typeof this.notificationSettings {
    return { ...this.notificationSettings };
  }

  /**
   * Show immediate notification (for testing)
   */
  async showImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    if (!this.notificationPermission) {
      Alert.alert(title, body);
      return;
    }

    try {
      // In a real app, you would use:
      // await scheduleNotificationAsync({
      //   content: { title, body, data },
      //   trigger: null, // Show immediately
      // });
      
      // For web, show browser notification
      if (Platform.OS === 'web' && 'Notification' in window) {
        new Notification(title, {
          body,
          icon: '/icon.png', // Add your app icon
          data,
        });
      } else {
        // Fallback to alert
        Alert.alert(title, body);
      }
    } catch (error) {
      console.error('Failed to show immediate notification:', error);
      Alert.alert(title, body);
    }
  }

  /**
   * Setup default notifications based on user profile
   */
  private async setupDefaultNotifications(): Promise<void> {
    try {
      // Schedule default meal reminders
      await this.scheduleMealReminder('breakfast', '08:00');
      await this.scheduleMealReminder('lunch', '12:30');
      await this.scheduleMealReminder('dinner', '19:00');
      
      // Schedule weekly report
      await this.scheduleWeeklyReport(1, '09:00'); // Monday at 9 AM
    } catch (error) {
      console.error('Failed to setup default notifications:', error);
    }
  }

  /**
   * Schedule notification (internal method)
   */
  private async scheduleNotification(notification: any): Promise<void> {
    try {
      // In a real app, you would use:
      // await scheduleNotificationAsync(notification);
      
      this.scheduledNotifications.set(notification.id, notification);
      await this.saveScheduledNotifications();
      
      console.log(`Scheduled notification: ${notification.id}`);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  /**
   * Reschedule notifications based on current settings
   */
  private async rescheduleNotifications(): Promise<void> {
    try {
      // Cancel all existing notifications
      await this.cancelAllNotifications();
      
      // Reschedule based on current settings
      if (this.notificationSettings.mealReminders) {
        await this.setupDefaultNotifications();
      }
      
      if (this.notificationSettings.weeklyReports) {
        await this.scheduleWeeklyReport(1, '09:00');
      }
    } catch (error) {
      console.error('Failed to reschedule notifications:', error);
    }
  }

  /**
   * Load notification settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.NOTIFICATION_SETTINGS);
      if (data) {
        this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  /**
   * Save notification settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.NOTIFICATION_SETTINGS,
        JSON.stringify(this.notificationSettings)
      );
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  /**
   * Save scheduled notifications to storage
   */
  private async saveScheduledNotifications(): Promise<void> {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      await AsyncStorage.setItem(
        this.KEYS.SCHEDULED_NOTIFICATIONS,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error('Failed to save scheduled notifications:', error);
    }
  }

  /**
   * Load scheduled notifications from storage
   */
  private async loadScheduledNotifications(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SCHEDULED_NOTIFICATIONS);
      if (data) {
        const notifications = JSON.parse(data);
        notifications.forEach((notification: any) => {
          this.scheduledNotifications.set(notification.id, notification);
        });
      }
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error);
    }
  }

  /**
   * Check if notification should be shown based on quiet hours
   */
  private isWithinQuietHours(): boolean {
    if (!this.notificationSettings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHours, startMinutes] = this.notificationSettings.quietHours.start.split(':').map(Number);
    const [endHours, endMinutes] = this.notificationSettings.quietHours.end.split(':').map(Number);
    
    const startTime = (startHours || 0) * 60 + (startMinutes || 0);
    const endTime = (endHours || 0) * 60 + (endMinutes || 0);
    
    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{
    totalScheduled: number;
    mealReminders: number;
    newSafeFoods: number;
    scanReminders: number;
    weeklyReports: number;
  }> {
    const notifications = this.getScheduledNotifications();
    
    return {
      totalScheduled: notifications.length,
      mealReminders: notifications.filter(n => n.data?.type === 'meal_reminder').length,
      newSafeFoods: notifications.filter(n => n.data?.type === 'new_safe_foods').length,
      scanReminders: notifications.filter(n => n.data?.type === 'scan_reminder').length,
      weeklyReports: notifications.filter(n => n.data?.type === 'weekly_report').length,
    };
  }
}

export default NotificationService;
