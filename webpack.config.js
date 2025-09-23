const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Force web platform to use standard bundling
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };
  
  // Ensure proper MIME types
  config.devServer = {
    ...config.devServer,
    headers: {
      'Content-Type': 'application/javascript',
    },
  };
  
  return config;
};
