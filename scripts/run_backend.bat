@echo off
setlocal
cd /d "%~dp0\.."
set "PYTHONPATH=%CD%\.python-packages"
"C:\Users\NITRO 5\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m uvicorn api:app --host 127.0.0.1 --port 8000
