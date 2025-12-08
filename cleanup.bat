@echo off
echo Killing all Node and Electron processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM electron.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo Cleanup complete!
echo.
echo Starting Literaturfinder...
cd /d "%~dp0"
call npm start
