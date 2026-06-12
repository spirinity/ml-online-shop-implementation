@echo off
setlocal
cd /d "%~dp0\..\frontend"

set "NODE_EXE="
where node.exe >nul 2>nul && set "NODE_EXE=node.exe"
if not defined NODE_EXE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not defined NODE_EXE (
  echo Node.js was not found. Install Node.js 20+ or run this from Codex with its bundled runtime.
  exit /b 1
)

if exist "node_modules\next\dist\bin\next" (
  "%NODE_EXE%" "node_modules\next\dist\bin\next" dev --webpack
) else (
  where npm.cmd >nul 2>nul
  if errorlevel 1 (
    echo Frontend dependencies are missing and npm was not found. Install Node.js with npm, then run npm install in frontend.
    exit /b 1
  )
  npm.cmd install
  npm.cmd run dev
)
