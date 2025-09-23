const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force platforms
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Completely disable Hermes
config.transformer = {
  ...config.transformer,
  hermesParser: false,
  minifierConfig: {
    keep_fnames: true,
    mangle: false,
  },
};

// Force JSC for web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Override the server middleware to fix MIME types
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Fix MIME type for web bundles
      if (req.url.includes('.bundle') && req.url.includes('platform=web')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
