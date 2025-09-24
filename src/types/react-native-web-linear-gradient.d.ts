declare module 'react-native-web-linear-gradient' {
  import { Component, ReactNode } from 'react';
  import { ViewStyle } from 'react-native';

  interface LinearGradientProps {
    colors: readonly string[];
    style?: ViewStyle;
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
    children?: ReactNode;
  }

  export default class LinearGradient extends Component<LinearGradientProps> {}
}
