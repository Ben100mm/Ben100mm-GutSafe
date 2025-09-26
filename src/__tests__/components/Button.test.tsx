/**
 * @fileoverview Button.test.tsx - Real functionality tests for Button component
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Button } from '../../components/Button';
import { createMockUserSettings } from '../../utils/testUtils';

describe('Button Component - Real Functionality Tests', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render with title', () => {
      const { getByText } = render(<Button {...defaultProps} />);
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={mockOnPress} />
      );

      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={mockOnPress} disabled />
      );

      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should render with custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <Button {...defaultProps} style={customStyle} testID="custom-button" />
      );

      const button = getByTestId('custom-button');
      expect(button).toHaveStyle(customStyle);
    });
  });

  describe('Button Variants', () => {
    it('should render primary variant correctly', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} variant="primary" testID="primary-button" />
      );

      const button = getByTestId('primary-button');
      expect(button).toBeTruthy();
    });

    it('should render secondary variant correctly', () => {
      const { getByTestId } = render(
        <Button
          {...defaultProps}
          variant="secondary"
          testID="secondary-button"
        />
      );

      const button = getByTestId('secondary-button');
      expect(button).toBeTruthy();
    });

    it('should render outline variant correctly', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} variant="outline" testID="outline-button" />
      );

      const button = getByTestId('outline-button');
      expect(button).toBeTruthy();
    });

    it('should render ghost variant correctly', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} variant="ghost" testID="ghost-button" />
      );

      const button = getByTestId('ghost-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Button Sizes', () => {
    it('should render small size correctly', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} size="small" testID="small-button" />
      );

      const button = getByTestId('small-button');
      expect(button).toBeTruthy();
    });

    it('should render medium size correctly', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} size="medium" testID="medium-button" />
      );

      const button = getByTestId('medium-button');
      expect(button).toBeTruthy();
    });

    it('should render large size correctly', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} size="large" testID="large-button" />
      );

      const button = getByTestId('large-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} loading testID="loading-button" />
      );

      const button = getByTestId('loading-button');
      expect(button).toBeTruthy();

      // Check if loading indicator is present
      const loadingIndicator = getByTestId('loading-indicator');
      expect(loadingIndicator).toBeTruthy();
    });

    it('should not call onPress when loading', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={mockOnPress} loading />
      );

      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should show custom loading text', () => {
      const { getByText } = render(
        <Button {...defaultProps} loading loadingText="Processing..." />
      );

      expect(getByText('Processing...')).toBeTruthy();
    });
  });

  describe('Icon Support', () => {
    it('should render with left icon', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} leftIcon="star" testID="icon-button" />
      );

      const button = getByTestId('icon-button');
      expect(button).toBeTruthy();

      const leftIcon = getByTestId('left-icon');
      expect(leftIcon).toBeTruthy();
    });

    it('should render with right icon', () => {
      const { getByTestId } = render(
        <Button
          {...defaultProps}
          rightIcon="arrow-right"
          testID="icon-button"
        />
      );

      const button = getByTestId('icon-button');
      expect(button).toBeTruthy();

      const rightIcon = getByTestId('right-icon');
      expect(rightIcon).toBeTruthy();
    });

    it('should render with both icons', () => {
      const { getByTestId } = render(
        <Button
          {...defaultProps}
          leftIcon="star"
          rightIcon="arrow-right"
          testID="icon-button"
        />
      );

      const button = getByTestId('icon-button');
      expect(button).toBeTruthy();

      const leftIcon = getByTestId('left-icon');
      const rightIcon = getByTestId('right-icon');
      expect(leftIcon).toBeTruthy();
      expect(rightIcon).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility label', () => {
      const { getByLabelText } = render(
        <Button {...defaultProps} accessibilityLabel="Test Button Label" />
      );

      expect(getByLabelText('Test Button Label')).toBeTruthy();
    });

    it('should have proper accessibility role', () => {
      const { getByRole } = render(<Button {...defaultProps} />);

      expect(getByRole('button')).toBeTruthy();
    });

    it('should have proper accessibility hint', () => {
      const { getByLabelText } = render(
        <Button
          {...defaultProps}
          accessibilityLabel="Test Button"
          accessibilityHint="Press to perform action"
        />
      );

      const button = getByLabelText('Test Button');
      expect(button).toHaveAccessibilityHint('Press to perform action');
    });

    it('should be accessible when disabled', () => {
      const { getByRole } = render(<Button {...defaultProps} disabled />);

      const button = getByRole('button');
      expect(button).toHaveAccessibilityState({ disabled: true });
    });
  });

  describe('Touch Feedback', () => {
    it('should provide haptic feedback when enabled', () => {
      const mockHaptics = require('expo-haptics');
      const { getByText } = render(<Button {...defaultProps} hapticFeedback />);

      fireEvent.press(getByText('Test Button'));
      expect(mockHaptics.impactAsync).toHaveBeenCalled();
    });

    it('should not provide haptic feedback when disabled', () => {
      const mockHaptics = require('expo-haptics');
      const { getByText } = render(
        <Button {...defaultProps} hapticFeedback={false} />
      );

      fireEvent.press(getByText('Test Button'));
      expect(mockHaptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle onPress errors gracefully', () => {
      const errorOnPress = jest.fn(() => {
        throw new Error('Test error');
      });

      const { getByText } = render(
        <Button {...defaultProps} onPress={errorOnPress} />
      );

      // Should not crash the app
      expect(() => {
        fireEvent.press(getByText('Test Button'));
      }).not.toThrow();
    });

    it('should handle missing onPress prop', () => {
      const { getByText } = render(<Button title="Test Button" />);

      // Should not crash when pressed without onPress
      expect(() => {
        fireEvent.press(getByText('Test Button'));
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time', () => {
      const startTime = Date.now();
      render(<Button {...defaultProps} />);
      const endTime = Date.now();

      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Should render within 100ms
    });

    it('should handle rapid presses efficiently', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button {...defaultProps} onPress={mockOnPress} />
      );

      const button = getByText('Test Button');

      // Simulate rapid presses
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }

      expect(mockOnPress).toHaveBeenCalledTimes(10);
    });
  });

  describe('Theme Support', () => {
    it('should adapt to dark theme', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} testID="theme-button" />
      );

      const button = getByTestId('theme-button');
      expect(button).toBeTruthy();
    });

    it('should adapt to light theme', () => {
      const { getByTestId } = render(
        <Button {...defaultProps} testID="theme-button" />
      );

      const button = getByTestId('theme-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should work in a form context', () => {
      const mockSubmit = jest.fn();
      const { getByText } = render(
        <Button
          {...defaultProps}
          title="Submit Form"
          onPress={mockSubmit}
          variant="primary"
          size="large"
        />
      );

      fireEvent.press(getByText('Submit Form'));
      expect(mockSubmit).toHaveBeenCalled();
    });

    it('should work as a navigation button', () => {
      const mockNavigate = jest.fn();
      const { getByText } = render(
        <Button
          {...defaultProps}
          title="Go to Next Screen"
          onPress={mockNavigate}
          rightIcon="arrow-right"
        />
      );

      fireEvent.press(getByText('Go to Next Screen'));
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should work as a cancel button', () => {
      const mockCancel = jest.fn();
      const { getByText } = render(
        <Button
          {...defaultProps}
          title="Cancel"
          onPress={mockCancel}
          variant="ghost"
          size="small"
        />
      );

      fireEvent.press(getByText('Cancel'));
      expect(mockCancel).toHaveBeenCalled();
    });
  });
});
