import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { AnimatedButton } from '../components/AnimatedButton';

export const ScanScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handleBarcodeScan = () => {
    (navigation as any).navigate('Scanner');
  };

  const handleMenuScan = () => {
    // TODO: Implement menu scanning
    console.log('Menu scan pressed');
  };

  const handleRecipeScan = () => {
    // TODO: Implement recipe scanning
    console.log('Recipe scan pressed');
  };

  const handleRecentScans = () => {
    (navigation as any).navigate('ScanHistory');
  };

  const handleSafeFoods = () => {
    (navigation as any).navigate('SafeFoods');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Scan</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.scanOptions}>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Choose how you'd like to scan
          </Text>
          
          {/* Barcode Scanner */}
          <TouchableOpacity
            style={[styles.scanCard, { backgroundColor: colors.surface }]}
            onPress={handleBarcodeScan}
          >
            <View style={styles.scanCardContent}>
              <View style={[styles.scanIcon, { backgroundColor: colors.accent }]}>
                <Text style={styles.scanIconText}>📱</Text>
              </View>
              <View style={styles.scanText}>
                <Text style={[styles.scanTitle, { color: colors.text }]}>
                  Barcode Scanner
                </Text>
                <Text style={[styles.scanDescription, { color: colors.textSecondary }]}>
                  Scan packaged foods and products
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Menu Scanner */}
          <TouchableOpacity
            style={[styles.scanCard, { backgroundColor: colors.surface }]}
            onPress={handleMenuScan}
          >
            <View style={styles.scanCardContent}>
              <View style={[styles.scanIcon, { backgroundColor: colors.accent }]}>
                <Text style={styles.scanIconText}>📋</Text>
              </View>
              <View style={styles.scanText}>
                <Text style={[styles.scanTitle, { color: colors.text }]}>
                  Menu Scanner
                </Text>
                <Text style={[styles.scanDescription, { color: colors.textSecondary }]}>
                  Scan restaurant menus and dishes
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Recipe Scanner */}
          <TouchableOpacity
            style={[styles.scanCard, { backgroundColor: colors.surface }]}
            onPress={handleRecipeScan}
          >
            <View style={styles.scanCardContent}>
              <View style={[styles.scanIcon, { backgroundColor: colors.accent }]}>
                <Text style={styles.scanIconText}>👨‍🍳</Text>
              </View>
              <View style={styles.scanText}>
                <Text style={[styles.scanTitle, { color: colors.text }]}>
                  Recipe Scanner
                </Text>
                <Text style={[styles.scanDescription, { color: colors.textSecondary }]}>
                  Analyze recipes and ingredients
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.quickActionsTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.actionButtons}>
            <AnimatedButton
              title="Recent Scans"
              onPress={handleRecentScans}
              variant="outline"
              size="medium"
              style={styles.actionButton}
            />
            <AnimatedButton
              title="Safe Foods"
              onPress={handleSafeFoods}
              variant="outline"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.h1,
    fontFamily: Typography.fontFamily.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  scanOptions: {
    flex: 1,
  },
  subtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  scanCard: {
    borderRadius: 12,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  scanCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  scanIconText: {
    fontSize: 20,
  },
  scanText: {
    flex: 1,
  },
  scanTitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  scanDescription: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
  },
  chevron: {
    fontSize: 16,
    color: Colors.body,
    fontWeight: '300',
  },
  quickActions: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  quickActionsTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
});
