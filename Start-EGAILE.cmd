@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Install Node.js 24 LTS, then run this file again.
 pause
 exit /b 1
)
if not exist .env.local copy .env.example .env.local >nul
if not exist node_modules (
 call npm ci
 if errorlevel 1 (
  echo Dependency installation failed. See the message above.
  pause
  exit /b 1
 )
)
echo Open http://127.0.0.1:3010 in your browser.
echo Keep this terminal open while reviewing the website.
call npm run dev
pause
