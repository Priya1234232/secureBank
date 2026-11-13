@echo off
echo ===================================================
echo Launching Complete SecureBank System...
echo 1. Full Stack Web Development
echo 2. Computer Networks
echo 3. Formal Languages and Automata Theory (FLAT)
echo ===================================================
start "SecureBank Backend API (Port 5000)" cmd /c "cd /d %~dp0server && node index.js"
timeout /t 2 /nobreak >nul
start "SecureBank React Client (Port 5173)" cmd /c "cd /d %~dp0client && npm run dev"
echo Both services launched!
echo Open your browser at http://localhost:5173
pause
