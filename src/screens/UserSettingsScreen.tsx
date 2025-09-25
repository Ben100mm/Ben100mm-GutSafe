/**
 * @fileoverview UserSettingsScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { userSettingsService, UserSettings } from '../services/UserSettingsService';
// import { GutCondition, SeverityLevel } from '../types';

export const UserSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'scanning' | 'notifications' | 'privacy' | 'advanced'>('profile');

  useEffect(() => {
    // Load settings
    const loadSettings = async () => {
      await userSettingsService.initialize();
      setSettings(userSettingsService.getSettings());
    };
    loadSettings();

    // Listen for settings changes
    const unsubscribe = userSettingsService.addListener((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const handleSettingChange = async (section: keyof UserSettings, key: string, value: any) => {
    try {
      if (section === 'preferences' && key === 'notifications') {
        // Handle nested notifications updates
        await userSettingsService.updatePreferences({ notifications: value });
      } else {
        await userSettingsService.setSettingValue(section, key as keyof UserSettings[typeof section], value);
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleExportSettings = async () => {
    try {
      const settingsJson = userSettingsService.exportSettings();
      await Share.share({
        message: settingsJson,
        title: 'GutSafe Settings Export',
      });
    } catch (error) {
      console.error('Failed to export settings:', error);
      Alert.alert('Error', 'Failed to export settings. Please try again.');
    }
  };

  const handleImportSettings = () => {
    Alert.alert(
      'Import Settings',
      'This will replace your current settings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          style: 'destructive',
          onPress: () => {
            // In a real app, you would open a file picker here
            Alert.alert('Import', 'File picker would open here in a real app');
          }
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await userSettingsService.resetSettings();
              Alert.alert('Success', 'Settings have been reset to default values.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings. Please try again.');
            }
          }
        },
      ]
    );
  };

  const getSectionIcon = (section: string) => {
    const icons = {
      profile: '👤',
      preferences: '⚙️',
      scanning: '📱',
      notifications: '🔔',
      privacy: '🔒',
      advanced: '🔧',
    };
    return icons[section as keyof typeof icons];
  };

  if (!settings) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Section Navigation */}
      <View style={[styles.sectionNav, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'profile', label: 'Profile' },
            { key: 'preferences', label: 'Preferences' },
            { key: 'scanning', label: 'Scanning' },
            { key: 'notifications', label: 'Notifications' },
            { key: 'privacy', label: 'Privacy' },
            { key: 'advanced', label: 'Advanced' },
          ].map((section) => (
            <TouchableOpacity
              key={section.key}
              style={[
                styles.sectionTab,
                {
                  backgroundColor: activeSection === section.key ? colors.accent : 'transparent',
                },
              ]}
              onPress={() => setActiveSection(section.key as any)}
            >
              <Text style={styles.sectionIcon}>
                {getSectionIcon(section.key)}
              </Text>
              <Text
                style={[
                  styles.sectionTabText,
                  {
                    color: activeSection === section.key ? Colors.white : colors.text,
                  },
                ]}
              >
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeSection === 'profile' && (
          <ProfileSection settings={settings} onSettingChange={handleSettingChange} />
        )}
        {activeSection === 'preferences' && (
          <PreferencesSection settings={settings} onSettingChange={handleSettingChange} />
        )}
        {activeSection === 'scanning' && (
          <ScanningSection settings={settings} onSettingChange={handleSettingChange} />
        )}
        {activeSection === 'notifications' && (
          <NotificationsSection settings={settings} onSettingChange={handleSettingChange} />
        )}
        {activeSection === 'privacy' && (
          <PrivacySection settings={settings} onSettingChange={handleSettingChange} />
        )}
        {activeSection === 'advanced' && (
          <AdvancedSection 
            settings={settings} 
            onSettingChange={handleSettingChange}
            onExport={handleExportSettings}
            onImport={handleImportSettings}
            onReset={handleResetSettings}
          />
        )}
      </ScrollView>
    </View>
  );
};

// Profile Section Component
const ProfileSection: React.FC<{
  settings: UserSettings;
  onSettingChange: (section: keyof UserSettings, key: string, value: any) => void;
}> = ({ settings, onSettingChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const enabledConditions = Object.entries(settings.profile.gutProfile.conditions)
    .filter(([_, condition]) => condition.enabled);

  return (
    <View style={styles.sectionContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>
      
      {/* Basic Info */}
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Basic Information</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Name</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {settings.profile.name || 'Not set'}
          </Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Email</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {settings.profile.email || 'Not set'}
          </Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Age</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {settings.profile.age || 'Not set'}
          </Text>
        </View>
      </View>

      {/* Gut Profile Summary */}
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Gut Health Profile</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Active Conditions</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {enabledConditions.length} condition{enabledConditions.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Dietary Restrictions</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {settings.profile.gutProfile.preferences.dietaryRestrictions.length} restriction{settings.profile.gutProfile.preferences.dietaryRestrictions.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.accent }]}
          onPress={() => {/* Navigate to gut profile */}}
        >
          <Text style={[styles.actionButtonText, { color: Colors.white }]}>
            Edit Gut Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Preferences Section Component
const PreferencesSection: React.FC<{
  settings: UserSettings;
  onSettingChange: (section: keyof UserSettings, key: string, value: any) => void;
}> = ({ settings, onSettingChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.sectionContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>App Preferences</Text>
      
      {/* Theme */}
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
          <View style={styles.themeButtons}>
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: settings.preferences.theme === theme ? colors.accent : 'transparent',
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onSettingChange('preferences', 'theme', theme)}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    {
                      color: settings.preferences.theme === theme ? Colors.white : colors.text,
                      textTransform: 'capitalize',
                    },
                  ]}
                >
                  {theme}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Notifications */}
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Enable Notifications</Text>
          <Switch
            value={settings.preferences.notifications.enabled}
            onValueChange={(value) => onSettingChange('preferences', 'notifications', { ...settings.preferences.notifications, enabled: value })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.preferences.notifications.enabled ? colors.accent : colors.textTertiary}
          />
        </View>
        
        {settings.preferences.notifications.enabled && (
          <>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Meal Reminders</Text>
              <Switch
                value={settings.preferences.notifications.mealReminders}
                onValueChange={(value) => onSettingChange('preferences', 'notifications', { ...settings.preferences.notifications, mealReminders: value })}
                trackColor={{ false: colors.border, true: colors.accent + '40' }}
                thumbColor={settings.preferences.notifications.mealReminders ? colors.accent : colors.textTertiary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>New Safe Foods</Text>
              <Switch
                value={settings.preferences.notifications.newSafeFoods}
                onValueChange={(value) => onSettingChange('preferences', 'notifications', { ...settings.preferences.notifications, newSafeFoods: value })}
                trackColor={{ false: colors.border, true: colors.accent + '40' }}
                thumbColor={settings.preferences.notifications.newSafeFoods ? colors.accent : colors.textTertiary}
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Weekly Reports</Text>
              <Switch
                value={settings.preferences.notifications.weeklyReports}
                onValueChange={(value) => onSettingChange('preferences', 'notifications', { ...settings.preferences.notifications, weeklyReports: value })}
                trackColor={{ false: colors.border, true: colors.accent + '40' }}
                thumbColor={settings.preferences.notifications.weeklyReports ? colors.accent : colors.textTertiary}
              />
            </View>
          </>
        )}
      </View>

      {/* Haptics */}
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Haptics</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Enable Haptics</Text>
          <Switch
            value={settings.preferences.haptics.enabled}
            onValueChange={(value) => onSettingChange('preferences', 'haptics', { ...settings.preferences.haptics, enabled: value })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.preferences.haptics.enabled ? colors.accent : colors.textTertiary}
          />
        </View>
        
        {settings.preferences.haptics.enabled && (
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Intensity</Text>
            <View style={styles.intensityButtons}>
              {(['light', 'medium', 'strong'] as const).map((intensity) => (
                <TouchableOpacity
                  key={intensity}
                  style={[
                    styles.intensityButton,
                    {
                      backgroundColor: settings.preferences.haptics.intensity === intensity ? colors.accent : 'transparent',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => onSettingChange('preferences', 'haptics', { ...settings.preferences.haptics, intensity })}
                >
                  <Text
                    style={[
                      styles.intensityButtonText,
                      {
                        color: settings.preferences.haptics.intensity === intensity ? Colors.white : colors.text,
                        textTransform: 'capitalize',
                      },
                    ]}
                  >
                    {intensity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Accessibility */}
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Accessibility</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>VoiceOver Support</Text>
          <Switch
            value={settings.preferences.accessibility.voiceOver}
            onValueChange={(value) => onSettingChange('preferences', 'accessibility', { ...settings.preferences.accessibility, voiceOver: value })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.preferences.accessibility.voiceOver ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Large Text</Text>
          <Switch
            value={settings.preferences.accessibility.largeText}
            onValueChange={(value) => onSettingChange('preferences', 'accessibility', { ...settings.preferences.accessibility, largeText: value })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.preferences.accessibility.largeText ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>High Contrast</Text>
          <Switch
            value={settings.preferences.accessibility.highContrast}
            onValueChange={(value) => onSettingChange('preferences', 'accessibility', { ...settings.preferences.accessibility, highContrast: value })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.preferences.accessibility.highContrast ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Reduce Motion</Text>
          <Switch
            value={settings.preferences.accessibility.reducedMotion}
            onValueChange={(value) => onSettingChange('preferences', 'accessibility', { ...settings.preferences.accessibility, reducedMotion: value })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.preferences.accessibility.reducedMotion ? colors.accent : colors.textTertiary}
          />
        </View>
      </View>
    </View>
  );
};

// Scanning Section Component
const ScanningSection: React.FC<{
  settings: UserSettings;
  onSettingChange: (section: keyof UserSettings, key: string, value: any) => void;
}> = ({ settings, onSettingChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.sectionContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Scanning Preferences</Text>
      
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Analysis Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Auto-Analyze</Text>
          <Switch
            value={settings.scanning.autoAnalyze}
            onValueChange={(value) => onSettingChange('scanning', 'autoAnalyze', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.scanning.autoAnalyze ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Show Detailed Analysis</Text>
          <Switch
            value={settings.scanning.showDetailedAnalysis}
            onValueChange={(value) => onSettingChange('scanning', 'showDetailedAnalysis', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.scanning.showDetailedAnalysis ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Include Alternatives</Text>
          <Switch
            value={settings.scanning.includeAlternatives}
            onValueChange={(value) => onSettingChange('scanning', 'includeAlternatives', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.scanning.includeAlternatives ? colors.accent : colors.textTertiary}
          />
        </View>
      </View>

      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Data Management</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Cache Results</Text>
          <Switch
            value={settings.scanning.cacheResults}
            onValueChange={(value) => onSettingChange('scanning', 'cacheResults', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.scanning.cacheResults ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Offline Mode</Text>
          <Switch
            value={settings.scanning.offlineMode}
            onValueChange={(value) => onSettingChange('scanning', 'offlineMode', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.scanning.offlineMode ? colors.accent : colors.textTertiary}
          />
        </View>
      </View>
    </View>
  );
};

// Notifications Section Component
const NotificationsSection: React.FC<{
  settings: UserSettings;
  onSettingChange: (section: keyof UserSettings, key: string, value: any) => void;
}> = ({ settings, onSettingChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.sectionContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Settings</Text>
      
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Notification Types</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Meal Reminders</Text>
          <Switch
            value={settings?.preferences?.notifications?.mealReminders ?? true}
            onValueChange={(value) => onSettingChange('preferences', 'notifications', { 
              ...settings?.preferences?.notifications, 
              mealReminders: value 
            })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings?.preferences?.notifications?.mealReminders ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>New Safe Foods</Text>
          <Switch
            value={settings?.preferences?.notifications?.newSafeFoods ?? true}
            onValueChange={(value) => onSettingChange('preferences', 'notifications', { 
              ...settings?.preferences?.notifications, 
              newSafeFoods: value 
            })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings?.preferences?.notifications?.newSafeFoods ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Scan Reminders</Text>
          <Switch
            value={settings?.preferences?.notifications?.scanReminders ?? false}
            onValueChange={(value) => onSettingChange('preferences', 'notifications', { 
              ...settings?.preferences?.notifications, 
              scanReminders: value 
            })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings?.preferences?.notifications?.scanReminders ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Weekly Reports</Text>
          <Switch
            value={settings?.preferences?.notifications?.weeklyReports ?? true}
            onValueChange={(value) => onSettingChange('preferences', 'notifications', { 
              ...settings?.preferences?.notifications, 
              weeklyReports: value 
            })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings?.preferences?.notifications?.weeklyReports ? colors.accent : colors.textTertiary}
          />
        </View>
      </View>

      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Quiet Hours</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Enable Quiet Hours</Text>
          <Switch
            value={settings?.preferences?.notifications?.quietHours?.enabled ?? false}
            onValueChange={(value) => onSettingChange('preferences', 'notifications', { 
              ...settings?.preferences?.notifications, 
              quietHours: {
                ...settings?.preferences?.notifications?.quietHours,
                enabled: value 
              }
            })}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings?.preferences?.notifications?.quietHours?.enabled ? colors.accent : colors.textTertiary}
          />
        </View>
        
        {settings?.preferences?.notifications?.quietHours?.enabled && (
          <>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Start Time</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {settings?.preferences?.notifications?.quietHours?.start || '22:00'}
              </Text>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>End Time</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {settings?.preferences?.notifications?.quietHours?.end || '08:00'}
              </Text>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.accent }]}
        onPress={() => {/* Navigate to detailed notification settings */}}
      >
        <Text style={[styles.actionButtonText, { color: Colors.white }]}>
          Advanced Notification Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Privacy Section Component
const PrivacySection: React.FC<{
  settings: UserSettings;
  onSettingChange: (section: keyof UserSettings, key: string, value: any) => void;
}> = ({ settings, onSettingChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.sectionContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Data</Text>
      
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Data Sharing</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Share Data for Research</Text>
          <Switch
            value={settings.privacy.dataSharing}
            onValueChange={(value) => onSettingChange('privacy', 'dataSharing', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.privacy.dataSharing ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Analytics</Text>
          <Switch
            value={settings.privacy.analytics}
            onValueChange={(value) => onSettingChange('privacy', 'analytics', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.privacy.analytics ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Crash Reporting</Text>
          <Switch
            value={settings.privacy.crashReporting}
            onValueChange={(value) => onSettingChange('privacy', 'crashReporting', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.privacy.crashReporting ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Personalized Ads</Text>
          <Switch
            value={settings.privacy.personalizedAds}
            onValueChange={(value) => onSettingChange('privacy', 'personalizedAds', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.privacy.personalizedAds ? colors.accent : colors.textTertiary}
          />
        </View>
      </View>
    </View>
  );
};

// Advanced Section Component
const AdvancedSection: React.FC<{
  settings: UserSettings;
  onSettingChange: (section: keyof UserSettings, key: string, value: any) => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}> = ({ settings, onSettingChange, onExport, onImport, onReset }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.sectionContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Advanced Settings</Text>
      
      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Debug & Logging</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Debug Mode</Text>
          <Switch
            value={settings.advanced.debugMode}
            onValueChange={(value) => onSettingChange('advanced', 'debugMode', value)}
            trackColor={{ false: colors.border, true: colors.accent + '40' }}
            thumbColor={settings.advanced.debugMode ? colors.accent : colors.textTertiary}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Log Level</Text>
          <View style={styles.logLevelButtons}>
            {(['error', 'warn', 'info', 'debug'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.logLevelButton,
                  {
                    backgroundColor: settings.advanced.logLevel === level ? colors.accent : 'transparent',
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onSettingChange('advanced', 'logLevel', level)}
              >
                <Text
                  style={[
                    styles.logLevelButtonText,
                    {
                      color: settings.advanced.logLevel === level ? Colors.white : colors.text,
                      textTransform: 'uppercase',
                    },
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.settingGroup, { backgroundColor: colors.surface }]}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>Data Management</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.accent }]}
          onPress={onExport}
        >
          <Text style={[styles.actionButtonText, { color: Colors.white }]}>
            Export Settings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          onPress={onImport}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            Import Settings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.avoid }]}
          onPress={onReset}
        >
          <Text style={[styles.actionButtonText, { color: Colors.white }]}>
            Reset to Defaults
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 82, 87, 0.1)',
  },
  backButton: {
    padding: Spacing.sm,
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
  headerSpacer: {
    width: 60, // Same width as back button for centering
  },
  sectionNav: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 82, 87, 0.1)',
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  sectionTabText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.lg,
  },
  settingGroup: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  groupTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 82, 87, 0.1)',
  },
  settingLabel: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.medium,
    flex: 1,
  },
  settingValue: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.medium,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  intensityButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  intensityButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.medium,
  },
  logLevelButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  logLevelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  logLevelButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.medium,
  },
  actionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  loadingText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
});
