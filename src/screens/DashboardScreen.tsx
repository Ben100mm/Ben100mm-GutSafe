/**
 * @fileoverview DashboardScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

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
      <Text style={[styles.cardSubtitle, { color: subtitleColor }]}>{subtitle}</Text>
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
          title="Today's Scans"
          value="3"
          subtitle="Foods analyzed"
          icon="📱"
          onPress={() => console.log('Navigate to scan history')}
        />
        <HealthCard
          title="Safe Foods"
          value="12"
          subtitle="In your list"
          icon="✅"
          onPress={() => console.log('Navigate to safe foods')}
        />
        <HealthCard
          title="Gut Score"
          value="85%"
          subtitle="Excellent"
          icon="💚"
          onPress={() => console.log('Navigate to gut profile')}
        />
        <HealthCard
          title="Streak"
          value="7 days"
          subtitle="Tracking daily"
          icon="🔥"
          onPress={() => console.log('Navigate to analytics')}
        />
      </View>

      {/* Debug: Force visible test content */}
      <View style={{ padding: 20, backgroundColor: '#EEE', margin: 10, borderRadius: 8 }}>
        <Text style={{ color: textColor, fontSize: 16, textAlign: 'center' }}>
          🔍 DEBUG: Content should be visible here!
        </Text>
        <Text style={{ color: subtitleColor, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
          If you can see this, the dashboard is working!
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
          Quick Actions
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: cardColor }]}>
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={[styles.actionText, { color: textColor }]}>Scan Food</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: cardColor }]}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={[styles.actionText, { color: textColor }]}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: cardColor }]}>
            <Text style={styles.actionIcon}>🍎</Text>
            <Text style={[styles.actionText, { color: textColor }]}>Safe Foods</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  healthCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
  recentActivity: {
    padding: 16,
    paddingBottom: 100, // Space for bottom navigation
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default DashboardScreen;