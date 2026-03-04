@echo off
echo.
echo ========================================
echo   Luo Desktop - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo   1. Go to https://nodejs.org
    echo   2. Download the LTS version
    echo   3. Run the installer
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

REM Check if express is installed
if not exist "node_modules\express" (
    echo Installing dependencies...
    call npm install express
    echo.
)

echo Starting Luo Desktop server...
echo.
echo Once started, open your browser to:
echo   http://localhost:3000/desktop
echo.
echo Press CTRL+C to stop the server
echo.

REM Start the server
node src\index.js

pause
