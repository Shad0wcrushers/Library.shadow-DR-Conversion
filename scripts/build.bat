@echo off
REM Build script for Library.DR-Conversion (Windows)
REM Ensures clean build and validates output

echo 🧹 Cleaning previous build...
call npm run clean

echo 🔍 Checking TypeScript types...
call npm run typecheck

echo 🔨 Building project...
call npm run build

echo ✅ Validating build output...
if not exist "dist" (
  echo ❌ dist directory not found
  exit /b 1
)

if not exist "dist\index.js" (
  echo ❌ dist\index.js not found
  exit /b 1
)

if not exist "dist\index.d.ts" (
  echo ❌ dist\index.d.ts not found
  exit /b 1
)

echo ✅ Build successful!
echo 📦 Build artifacts created

echo.
echo 🎉 Build complete!
echo.
echo Next steps:
echo   - Run tests: npm test
echo   - Try examples: npm run example:simple
echo   - Publish: npm publish
