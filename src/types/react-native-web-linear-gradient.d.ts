/**
 * @fileoverview react-native-web-linear-gradient.d.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

declare module 'react-native-web-linear-gradient' {
  import { Component } from 'react';
  
  interface LinearGradientProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
    style?: any;
    children?: React.ReactNode;
  }
  
  export default class LinearGradient extends Component<LinearGradientProps> {}
}
