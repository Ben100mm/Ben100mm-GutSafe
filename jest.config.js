module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/*.test.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|expo|@expo|react-native-web|react-native-linear-gradient|@react-native-community)/)'
  ]
};
