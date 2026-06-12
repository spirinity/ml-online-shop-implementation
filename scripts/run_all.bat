@echo off
setlocal
cd /d "%~dp0\.."

start "backend :8000" cmd /k scripts\run_backend.bat
start "frontend :3000" cmd /k scripts\run_frontend.bat

echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
