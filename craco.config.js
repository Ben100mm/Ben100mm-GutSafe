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
    configure: (webpackConfig) => {
      // Completely disable React Refresh
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => {
          const pluginName = plugin.constructor.name;
          return pluginName !== 'ReactRefreshPlugin' && 
                 pluginName !== 'ReactRefreshWebpackPlugin' &&
                 !pluginName.includes('Refresh');
        }
      );
      
      // Remove all React Refresh related code from babel loaders
      webpackConfig.module.rules.forEach(rule => {
        if (rule.oneOf) {
          rule.oneOf.forEach(loader => {
            if (loader.use && Array.isArray(loader.use)) {
              loader.use.forEach(use => {
                if (use.loader && use.loader.includes('babel-loader')) {
                  use.options = use.options || {};
                  use.options.plugins = (use.options.plugins || []).filter(
                    plugin => {
                      if (!plugin || !plugin[0]) return true;
                      const pluginPath = plugin[0];
                      return !pluginPath.includes('react-refresh') &&
                             !pluginPath.includes('ReactRefresh');
                    }
                  );
                }
              });
            }
          });
        }
      });
      
      // Add environment variable to completely disable React Refresh
      webpackConfig.plugins.push(
        new webpackConfig.constructor.DefinePlugin({
          'process.env.FAST_REFRESH': JSON.stringify('false'),
          'process.env.REACT_REFRESH': JSON.stringify('false')
        })
      );
      
      return webpackConfig;
    },
  },
};
