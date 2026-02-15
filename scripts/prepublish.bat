@echo off
REM Prepare package for publishing (Windows)
REM Runs all checks before publishing to npm

echo 🚀 Preparing package for publishing...
echo.

echo 1️⃣ Running linter...
call npm run lint
if errorlevel 1 exit /b 1

echo.
echo 2️⃣ Checking code format...
call npm run format:check
if errorlevel 1 exit /b 1

echo.
echo 3️⃣ Type checking...
call npm run typecheck
if errorlevel 1 exit /b 1

echo.
echo 4️⃣ Running tests...
call npm run test:coverage
if errorlevel 1 exit /b 1

echo.
echo 5️⃣ Building package...
call scripts\build.bat
if errorlevel 1 exit /b 1

echo.
echo 6️⃣ Checking package contents...
call npm pack --dry-run

echo.
echo ✅ All checks passed!
echo.
echo 📦 Ready to publish!
echo.
echo To publish:
echo   npm publish
echo.
echo Or for beta/next releases:
echo   npm publish --tag beta
echo   npm publish --tag next
