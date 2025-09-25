module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Allow unused vars in test files
    '@typescript-eslint/no-unused-vars': ['warn', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],
    // Allow unnecessary escape characters in regex
    'no-useless-escape': 'warn'
  },
  overrides: [
    {
      // Disable await-async-utils rule for e2e test files
      files: ['**/__tests__/e2e/**/*.ts', '**/__tests__/e2e/**/*.tsx'],
      rules: {
        'testing-library/await-async-utils': 'off'
      }
    },
    {
      // More lenient rules for test files
      files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }]
      }
    }
  ]
};
