const path = require('path');
const webpack = require('webpack');

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
    configure: (webpackConfig) => {
      // Environment variables
      const isProduction = process.env.NODE_ENV === 'production';
      
      // Remove React Refresh and HMR for production builds
      if (isProduction) {
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          const pluginName = plugin.constructor.name;
          return !pluginName.includes('Refresh') && 
                 !pluginName.includes('HotModuleReplacement');
        });
        
        webpackConfig.optimization = webpackConfig.optimization || {};
        webpackConfig.optimization.runtimeChunk = false;
      }
      
      // Add environment variables
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'process.env.FAST_REFRESH': JSON.stringify(isProduction ? 'false' : 'true'),
          'process.env.REACT_REFRESH': JSON.stringify(isProduction ? 'false' : 'true'),
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
          'process.env.WEBPACK_HOT_RELOAD': JSON.stringify(isProduction ? 'false' : 'true'),
        })
      );
      
      return webpackConfig;
    },
  },
};
