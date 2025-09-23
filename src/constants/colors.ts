// GutSafe Design System - Color Palette
export const Colors = {
  // Primary Colors
  primary: '#0F5257', // Petrol Blue-Teal
  primaryLight: '#56CFE1', // Aqua
  primaryGradient: ['#0F5257', '#56CFE1'], // Teal → Aqua gradient
  
  // Status Colors
  safe: '#4ADE80', // Safe Green
  caution: '#FACC15', // Caution Amber
  avoid: '#F87171', // Avoid Red
  
  // Neutrals
  background: '#F8F9FB', // Off-white
  surface: '#E5E7EB', // Soft gray
  heading: '#1E293B', // Slate
  body: '#64748B', // Muted
  
  // Luxury Highlight (Pro tier)
  luxury: '#D4AF37', // Subtle gold
  
  // Additional UI Colors
  white: '#FFFFFF',
  black: '#000000',
  border: '#E2E8F0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorKey = keyof typeof Colors;
