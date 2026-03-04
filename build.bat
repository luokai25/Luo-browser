@echo off
echo.
echo ========================================
echo   Luo Desktop - Build Installer
echo ========================================
echo.

REM Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not installed!
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
echo.

REM Build the app
echo Building Luo Desktop...
call npm run build
echo.

echo ========================================
echo Build complete!
echo.
echo Your installer is in: dist\Luo-Desktop-1.0.0.exe
echo.
pause
