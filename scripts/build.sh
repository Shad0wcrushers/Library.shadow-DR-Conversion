#!/bin/bash

# Build script for Library.DR-Conversion
# Ensures clean build and validates output

set -e

echo "🧹 Cleaning previous build..."
npm run clean

echo "🔍 Checking TypeScript types..."
npm run typecheck

echo "🔨 Building project..."
npm run build

echo "✅ Validating build output..."
if [ ! -d "dist" ]; then
  echo "❌ dist directory not found"
  exit 1
fi

if [ ! -f "dist/index.js" ]; then
  echo "❌ dist/index.js not found"
  exit 1
fi

if [ ! -f "dist/index.d.ts" ]; then
  echo "❌ dist/index.d.ts not found"
  exit 1
fi

echo "✅ Build successful!"
echo "📦 Build artifacts:"
du -sh dist/*

echo "
🎉 Build complete!

Next steps:
  - Run tests: npm test
  - Try examples: npm run example:simple
  - Publish: npm publish
"
