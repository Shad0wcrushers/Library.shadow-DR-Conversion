#!/bin/bash

# Prepare package for publishing
# Runs all checks before publishing to npm

set -e

echo "🚀 Preparing package for publishing..."
echo ""

echo "1️⃣ Running linter..."
npm run lint

echo ""
echo "2️⃣ Checking code format..."
npm run format:check

echo ""
echo "3️⃣ Type checking..."
npm run typecheck

echo ""
echo "4️⃣ Running tests..."
npm run test:coverage

echo ""
echo "5️⃣ Building package..."
./scripts/build.sh

echo ""
echo "6️⃣ Checking package contents..."
npm pack --dry-run

echo ""
echo "✅ All checks passed!"
echo ""
echo "📦 Ready to publish!"
echo ""
echo "To publish:"
echo "  npm publish"
echo ""
echo "Or for beta/next releases:"
echo "  npm publish --tag beta"
echo "  npm publish --tag next"
