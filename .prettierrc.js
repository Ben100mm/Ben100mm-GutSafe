/**
 * @fileoverview Prettier configuration for consistent code formatting
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  
  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // End of line
  endOfLine: 'lf',
  
  // HTML/JSX
  htmlWhitespaceSensitivity: 'css',
  jsxSingleQuote: true,
  
  // Prose
  proseWrap: 'preserve',
  
  // Range formatting
  rangeStart: 0,
  rangeEnd: Infinity,
  
  // Parser
  parser: undefined,
  
  // File path
  filepath: undefined,
  
  // Require pragma
  requirePragma: false,
  
  // Insert pragma
  insertPragma: false,
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.css',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.scss',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.html',
      options: {
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: '*.tsx',
      options: {
        jsxSingleQuote: true,
      },
    },
    {
      files: '*.jsx',
      options: {
        jsxSingleQuote: true,
      },
    },
  ],
};
