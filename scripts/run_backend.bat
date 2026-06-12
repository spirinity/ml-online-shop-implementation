@echo off
setlocal
cd /d "%~dp0\.."

set "PYTHON_EXE="
where python.exe >nul 2>nul && set "PYTHON_EXE=python.exe"
if not defined PYTHON_EXE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" set "PYTHON_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if not defined PYTHON_EXE (
  echo Python was not found. Install Python 3.12+ or run this from Codex with its bundled runtime.
  exit /b 1
)

"%PYTHON_EXE%" -m uvicorn api:app --host 127.0.0.1 --port 8000
