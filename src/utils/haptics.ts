import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export enum HapticType {
  // Light feedback
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  
  // Selection feedback
  SELECTION = 'selection',
  
  // Success/Error feedback
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  
  // Impact feedback
  IMPACT_LIGHT = 'impact_light',
  IMPACT_MEDIUM = 'impact_medium',
  IMPACT_HEAVY = 'impact_heavy',
  
  // Notification feedback
  NOTIFICATION_SUCCESS = 'notification_success',
  NOTIFICATION_WARNING = 'notification_warning',
  NOTIFICATION_ERROR = 'notification_error',
}

class HapticService {
  private isEnabled: boolean = true;
  private isSupported: boolean = Platform.OS === 'ios' || Platform.OS === 'android';

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Check if haptic feedback is supported and enabled
   */
  isHapticSupported(): boolean {
    return this.isSupported && this.isEnabled;
  }

  /**
   * Trigger haptic feedback based on type
   */
  trigger(type: HapticType): void {
    if (!this.isHapticSupported()) {
      return;
    }

    try {
      switch (type) {
        case HapticType.LIGHT:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticType.MEDIUM:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticType.HEAVY:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticType.SELECTION:
          Haptics.selectionAsync();
          break;
        case HapticType.SUCCESS:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticType.WARNING:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticType.ERROR:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case HapticType.IMPACT_LIGHT:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticType.IMPACT_MEDIUM:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticType.IMPACT_HEAVY:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticType.NOTIFICATION_SUCCESS:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticType.NOTIFICATION_WARNING:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticType.NOTIFICATION_ERROR:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Trigger haptic feedback for button interactions
   */
  buttonPress(): void {
    this.trigger(HapticType.LIGHT);
  }

  /**
   * Trigger haptic feedback for successful actions
   */
  success(): void {
    this.trigger(HapticType.SUCCESS);
  }

  /**
   * Trigger haptic feedback for errors
   */
  error(): void {
    this.trigger(HapticType.ERROR);
  }

  /**
   * Trigger haptic feedback for warnings
   */
  warning(): void {
    this.trigger(HapticType.WARNING);
  }

  /**
   * Trigger haptic feedback for selection changes
   */
  selection(): void {
    this.trigger(HapticType.SELECTION);
  }

  /**
   * Trigger haptic feedback for navigation
   */
  navigation(): void {
    this.trigger(HapticType.LIGHT);
  }

  /**
   * Trigger haptic feedback for scanning actions
   */
  scanStart(): void {
    this.trigger(HapticType.MEDIUM);
  }

  /**
   * Trigger haptic feedback for scan completion
   */
  scanComplete(): void {
    this.trigger(HapticType.SUCCESS);
  }

  /**
   * Trigger haptic feedback for scan errors
   */
  scanError(): void {
    this.trigger(HapticType.ERROR);
  }

  /**
   * Trigger haptic feedback for food safety results
   */
  foodSafe(): void {
    this.trigger(HapticType.SUCCESS);
  }

  /**
   * Trigger haptic feedback for food caution results
   */
  foodCaution(): void {
    this.trigger(HapticType.WARNING);
  }

  /**
   * Trigger haptic feedback for food avoid results
   */
  foodAvoid(): void {
    this.trigger(HapticType.ERROR);
  }

  /**
   * Trigger haptic feedback for long press actions
   */
  longPress(): void {
    this.trigger(HapticType.HEAVY);
  }

  /**
   * Trigger haptic feedback for swipe actions
   */
  swipe(): void {
    this.trigger(HapticType.MEDIUM);
  }

  /**
   * Trigger haptic feedback for toggle actions
   */
  toggle(): void {
    this.trigger(HapticType.SELECTION);
  }
}

export const HapticFeedback = new HapticService();
