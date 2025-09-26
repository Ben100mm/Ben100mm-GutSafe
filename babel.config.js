module.exports = {
  presets: ['react-app', '@babel/preset-flow'],
  plugins: ['@babel/plugin-syntax-flow'],
  env: {
    development: {
      plugins: [
        // Explicitly exclude React Refresh
        ['@babel/plugin-syntax-flow']
      ]
    },
    production: {
      plugins: ['@babel/plugin-syntax-flow']
    }
  }
};
