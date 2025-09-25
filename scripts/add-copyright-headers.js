#!/usr/bin/env node

/**
 * Copyright Header Addition Script
 * Adds standardized copyright headers to all source files
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 */

const fs = require('fs');
const path = require('path');

const COPYRIGHT_HEADER = `/**
 * @fileoverview {FILENAME}
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

`;

const EXCLUDED_FILES = [
  'node_modules',
  '.git',
  'build',
  'dist',
  '.expo',
  'coverage',
  '*.test.ts',
  '*.test.tsx',
  '*.spec.ts',
  '*.spec.tsx'
];

const EXCLUDED_EXTENSIONS = ['.md', '.json', '.lock', '.log', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.svg'];

function shouldExcludeFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);
  
  return EXCLUDED_EXTENSIONS.includes(ext) || 
         EXCLUDED_FILES.some(pattern => fileName.includes(pattern)) ||
         filePath.includes('node_modules') ||
         filePath.includes('.git') ||
         filePath.includes('build') ||
         filePath.includes('dist');
}

function hasCopyrightHeader(content) {
  return content.includes('@copyright') || content.includes('Copyright (c) 2024');
}

function addCopyrightHeader(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (hasCopyrightHeader(content)) {
      console.log(`✓ Already has copyright header: ${filePath}`);
      return;
    }
    
    const fileName = path.basename(filePath);
    const header = COPYRIGHT_HEADER.replace('{FILENAME}', fileName);
    
    // Add header at the beginning of the file
    const newContent = header + content;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Added copyright header to: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldExcludeFile(fullPath)) {
          processDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        if (!shouldExcludeFile(fullPath)) {
          const ext = path.extname(fullPath);
          if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            addCopyrightHeader(fullPath);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
console.log('Adding copyright headers to source files...');
console.log('Processing directory:', srcDir);

if (fs.existsSync(srcDir)) {
  processDirectory(srcDir);
  console.log('✓ Copyright header addition completed');
} else {
  console.error('✗ Source directory not found:', srcDir);
  process.exit(1);
}
