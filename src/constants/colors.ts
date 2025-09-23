// GutSafe Design System - Color Palette (Apple Health App Style)
export const Colors = {
  // Primary Colors
  primary: '#0F5257', // Petrol Blue-Teal
  primaryLight: '#56CFE1', // Aqua
  primaryGradient: ['#0F5257', '#56CFE1'], // Teal → Aqua gradient
  
  // Status Colors
  safe: '#4ADE80', // Safe Green
  caution: '#FACC15', // Caution Amber
  avoid: '#F87171', // Avoid Red
  
  // Light Mode Colors
  light: {
    background: '#F8F9FB', // Off-white
    surface: '#FFFFFF', // White cards
    cardBackground: '#FFFFFF',
    text: '#000000', // Black text
    textSecondary: '#8E8E93', // Gray text
    textTertiary: '#C7C7CC', // Light gray text
    border: '#E5E5EA', // Light border
    shadow: 'rgba(0, 0, 0, 0.1)',
    accent: '#0F5257', // Primary for accents
  },
  
  // Dark Mode Colors
  dark: {
    background: '#000000', // Black background
    surface: '#1C1C1E', // Dark gray cards
    cardBackground: '#1C1C1E',
    text: '#FFFFFF', // White text
    textSecondary: '#8E8E93', // Gray text
    textTertiary: '#48484A', // Dark gray text
    border: '#38383A', // Dark border
    shadow: 'rgba(0, 0, 0, 0.3)',
    accent: '#56CFE1', // Light accent for dark mode
  },
  
  // Legacy colors for backward compatibility
  background: '#F8F9FB',
  surface: '#E5E7EB',
  heading: '#1E293B',
  body: '#64748B',
  white: '#FFFFFF',
  black: '#000000',
  border: '#E2E8F0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorKey = keyof typeof Colors;
