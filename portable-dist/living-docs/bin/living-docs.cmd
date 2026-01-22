@echo off
REM Living Docs Launcher for Windows

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js from: https://nodejs.org
    exit /b 1
)

SET APP_DIR=%~dp0..

if not exist "%APP_DIR%\node_modules" (
    echo Installing dependencies...
    cd "%APP_DIR%"
    npm install --production
)

node "%APP_DIR%\src\cli.js" %*
