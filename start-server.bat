@echo off
echo ===================================================
echo Starting SecureBank Backend Server (Port 5000)...
echo ===================================================
cd /d "%~dp0server"
node index.js
pause
