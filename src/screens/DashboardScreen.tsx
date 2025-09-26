/**
 * @fileoverview DashboardScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const DashboardScreen: React.FC = () => {
  console.log('🚀 DashboardScreen is rendering! - ENHANCED VERSION 6.1');
  // const colorScheme = useColorScheme();
  // const isDark = colorScheme === 'dark';

  // Force light mode styles for visibility
  const backgroundColor = '#FFFFFF';
  const textColor = '#000000';
  const cardColor = '#F8F9FA';
  const subtitleColor = '#666666';
  const sectionTitleColor = '#000000';

  const HealthCard = ({ title, value, subtitle, icon, onPress }: any) => (
    <TouchableOpacity
      style={[styles.healthCard, { backgroundColor: cardColor }]}
      onPress={onPress}
    >
      <Text style={[styles.cardIcon, { color: '#4CAF50' }]}>{icon}</Text>
      <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
      <Text style={[styles.cardValue, { color: '#4CAF50' }]}>{value}</Text>
      <Text style={[styles.cardSubtitle, { color: subtitleColor }]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardColor }]}>
        <Text style={[styles.title, { color: textColor }]}>
          🎉 GutSafe Dashboard
        </Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          Your gut health companion
        </Text>
      </View>

      {/* Health Cards Grid */}
      <View style={styles.cardsGrid}>
        <HealthCard
          icon="📱"
          subtitle="Foods analyzed"
          title="Today's Scans"
          value="3"
          onPress={() => console.log('Navigate to scan history')}
        />
        <HealthCard
          icon="✅"
          subtitle="In your list"
          title="Safe Foods"
          value="12"
          onPress={() => console.log('Navigate to safe foods')}
        />
        <HealthCard
          icon="💚"
          subtitle="Excellent"
          title="Gut Score"
          value="85%"
          onPress={() => console.log('Navigate to gut profile')}
        />
        <HealthCard
          icon="🔥"
          subtitle="Tracking daily"
          title="Streak"
          value="7 days"
          onPress={() => console.log('Navigate to analytics')}
        />
      </View>

      {/* Debug: Force visible test content */}
      <View
        style={{
          padding: 20,
          backgroundColor: '#EEE',
          margin: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: textColor, fontSize: 16, textAlign: 'center' }}>
          🔍 DEBUG: Content should be visible here!
        </Text>
        <Text
          style={{
            color: subtitleColor,
            fontSize: 14,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          If you can see this, the dashboard is working!
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          Quick Actions
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardColor }]}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={[styles.actionText, { color: textColor }]}>
              Scan Food
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardColor }]}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={[styles.actionText, { color: textColor }]}>
              Analytics
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardColor }]}
          >
            <Text style={styles.actionIcon}>🍎</Text>
            <Text style={[styles.actionText, { color: textColor }]}>
              Safe Foods
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          Recent Activity
        </Text>
        <View style={[styles.activityItem, { backgroundColor: cardColor }]}>
          <Text style={styles.activityIcon}>🍎</Text>
          <View style={styles.activityContent}>
            <Text style={[styles.activityTitle, { color: textColor }]}>
              Apple scanned
            </Text>
            <Text style={[styles.activityTime, { color: subtitleColor }]}>
              2 hours ago • Safe to eat
            </Text>
          </View>
        </View>
        <View style={[styles.activityItem, { backgroundColor: cardColor }]}>
          <Text style={styles.activityIcon}>🥛</Text>
          <View style={styles.activityContent}>
            <Text style={[styles.activityTitle, { color: textColor }]}>
              Milk scanned
            </Text>
            <Text style={[styles.activityTime, { color: subtitleColor }]}>
              5 hours ago • Caution advised
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    flex: 1,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityItem: {
    alignItems: 'center',
    borderRadius: 12,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    flexDirection: 'row',
    marginBottom: 8,
    padding: 16,
  },
  activityTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
    paddingTop: 60,
  },
  healthCard: {
    alignItems: 'center',
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: 16,
    width: '47%',
  },
  quickActions: {
    padding: 16,
  },
  recentActivity: {
    padding: 16,
    paddingBottom: 100, // Space for bottom navigation
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;
