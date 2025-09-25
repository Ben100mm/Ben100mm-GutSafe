const path = require('path');

module.exports = {
  babel: {
    presets: ['@babel/preset-flow'],
    plugins: ['@babel/plugin-syntax-flow'],
  },
  webpack: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      'expo-linear-gradient': 'react-native-web-linear-gradient',
      'expo-haptics': path.resolve(__dirname, 'src/utils/haptics.web.js'),
      'expo-status-bar': path.resolve(__dirname, 'src/utils/status-bar.web.js'),
      'expo-camera': path.resolve(__dirname, 'src/utils/camera.web.js'),
      '@react-native-community/blur': path.resolve(__dirname, 'src/utils/blur.web.js'),
    },
    resolve: {
      extensions: ['.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json'],
    },
  },
};
