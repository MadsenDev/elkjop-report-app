#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

console.log(`🚀 Publishing version ${version}...`);

try {
  // Build the app
  console.log('📦 Building app...');
  execSync('npm run electron:build', { stdio: 'inherit' });

  // Create a new git tag
  console.log('🏷️  Creating git tag...');
  execSync(`git tag -a v${version} -m "Release version ${version}"`, { stdio: 'inherit' });

  // Push the tag
  console.log('📤 Pushing tag to GitHub...');
  execSync(`git push origin v${version}`, { stdio: 'inherit' });

  // Publish to GitHub releases
  console.log('📋 Publishing to GitHub releases...');
  execSync('npx electron-builder --publish=always', { stdio: 'inherit' });

  console.log(`✅ Successfully published version ${version}!`);
  console.log('🔗 Check your GitHub releases page for the new release.');
  
} catch (error) {
  console.error('❌ Failed to publish update:', error.message);
  process.exit(1);
} 