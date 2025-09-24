import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import NotificationService from '../services/NotificationService';

export const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [settings, setSettings] = useState({
    mealReminders: true,
    newSafeFoods: true,
    scanReminders: false,
    weeklyReports: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const [stats, setStats] = useState({
    totalScheduled: 0,
    mealReminders: 0,
    newSafeFoods: 0,
    scanReminders: 0,
    weeklyReports: 0,
  });

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = notificationService.getSettings();
      setSettings(currentSettings);
      setIsEnabled(notificationService.isEnabled());
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const notificationStats = await notificationService.getNotificationStats();
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await notificationService.updateSettings(newSettings);
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to update setting:', error);
      Alert.alert('Error', 'Failed to update notification setting. Please try again.');
    }
  };

  const updateQuietHours = async (key: string, value: any) => {
    try {
      const newQuietHours = { ...settings.quietHours, [key]: value };
      const newSettings = { ...settings, quietHours: newQuietHours };
      setSettings(newSettings);
      await notificationService.updateSettings(newSettings);
    } catch (error) {
      console.error('Failed to update quiet hours:', error);
      Alert.alert('Error', 'Failed to update quiet hours. Please try again.');
    }
  };

  const requestPermission = async () => {
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setIsEnabled(true);
        Alert.alert('Success', 'Notification permission granted!');
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive reminders.'
        );
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      Alert.alert('Error', 'Failed to request notification permission.');
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.showImmediateNotification(
        'Test Notification',
        'This is a test notification from GutSafe!',
        { type: 'test' }
      );
    } catch (error) {
      console.error('Failed to show test notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.cancelAllNotifications();
              await loadStats();
              Alert.alert('Success', 'All notifications cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications.');
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    disabled = false 
  }: {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || !isEnabled}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={value ? Colors.white : colors.textSecondary}
      />
    </View>
  );

  const TimePicker = ({ 
    label, 
    value, 
    onValueChange 
  }: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <View style={styles.timePickerContainer}>
      <Text style={[styles.timePickerLabel, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.timePicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => {
          // In a real app, you would show a time picker modal
          Alert.prompt(
            'Set Time',
            'Enter time in HH:MM format',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Set',
                onPress: (time) => {
                  if (time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                    onValueChange(time);
                  } else {
                    Alert.alert('Invalid Time', 'Please enter time in HH:MM format.');
                  }
                },
              },
            ],
            'plain-text',
            value
          );
        }}
      >
        <Text style={[styles.timePickerText, { color: colors.text }]}>{value}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.accent }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testNotification}
            disabled={!isEnabled}
          >
            <Text style={[styles.testButtonText, { color: colors.accent }]}>Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              {isEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
            </Text>
            <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
              {isEnabled 
                ? 'You will receive meal reminders and other notifications.'
                : 'Enable notifications to receive meal reminders and updates.'
              }
            </Text>
          </View>
          {!isEnabled && (
            <TouchableOpacity
              style={[styles.enableButton, { backgroundColor: colors.accent }]}
              onPress={requestPermission}
            >
              <Text style={[styles.enableButtonText, { color: Colors.white }]}>
                Enable
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Statistics */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Scheduled Notifications</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{stats.totalScheduled}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{stats.mealReminders}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Meals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{stats.newSafeFoods}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>New Foods</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{stats.weeklyReports}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reports</Text>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Types</Text>
          
          <SettingRow
            title="Meal Reminders"
            subtitle="Remind me to scan my food at meal times"
            value={settings.mealReminders}
            onValueChange={(value) => updateSetting('mealReminders', value)}
            disabled={!isEnabled}
          />
          
          <SettingRow
            title="New Safe Foods"
            subtitle="Notify me when new safe foods are discovered"
            value={settings.newSafeFoods}
            onValueChange={(value) => updateSetting('newSafeFoods', value)}
            disabled={!isEnabled}
          />
          
          <SettingRow
            title="Scan Reminders"
            subtitle="Remind me to scan food if I haven't in a while"
            value={settings.scanReminders}
            onValueChange={(value) => updateSetting('scanReminders', value)}
            disabled={!isEnabled}
          />
          
          <SettingRow
            title="Weekly Reports"
            subtitle="Send weekly gut health summary reports"
            value={settings.weeklyReports}
            onValueChange={(value) => updateSetting('weeklyReports', value)}
            disabled={!isEnabled}
          />
        </View>

        {/* Quiet Hours */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quiet Hours</Text>
          
          <SettingRow
            title="Enable Quiet Hours"
            subtitle="Disable notifications during specified hours"
            value={settings.quietHours.enabled}
            onValueChange={(value) => updateQuietHours('enabled', value)}
            disabled={!isEnabled}
          />
          
          {settings.quietHours.enabled && (
            <View style={[styles.quietHoursContainer, { backgroundColor: colors.surface }]}>
              <TimePicker
                label="Start Time"
                value={settings.quietHours.start}
                onValueChange={(value) => updateQuietHours('start', value)}
              />
              <TimePicker
                label="End Time"
                value={settings.quietHours.end}
                onValueChange={(value) => updateQuietHours('end', value)}
              />
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={clearAllNotifications}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Clear All Notifications
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  testButton: {
    padding: Spacing.xs,
  },
  testButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xs,
  },
  statusSubtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.body,
  },
  enableButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  enableButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  statsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  statsTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  settingsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  settingSubtitle: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.bodySmall,
  },
  quietHoursContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  timePickerContainer: {
    marginBottom: Spacing.md,
  },
  timePickerLabel: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.sm,
  },
  timePicker: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  timePickerText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
  },
  actionsSection: {
    marginBottom: Spacing.xl,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
});
