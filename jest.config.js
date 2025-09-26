module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.e2e.ts',
    '**/__tests__/**/*.integration.ts',
    '**/__tests__/**/*.performance.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.e2e.{ts,tsx}',
    '!src/**/*.integration.{ts,tsx}',
    '!src/**/*.performance.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|expo|@expo|react-native-web|react-native-linear-gradient|@react-native-community)/)'
  ],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/setupTests.js'],
  testTimeout: 10000,
  maxWorkers: '50%'
};
