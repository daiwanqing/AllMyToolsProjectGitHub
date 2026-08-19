@echo off
setlocal EnableExtensions

cd /d "%~dp0"

where pnpm.cmd >nul 2>nul
if not errorlevel 1 set "PNPM_MODE=direct"
if defined PNPM_MODE goto :package_manager_ready

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Node.js with npm was not found. Install Node.js 20 or later, then run this file again.
  pause
  exit /b 1
)

call npm.cmd exec --yes --package=pnpm@9.15.5 -- pnpm --version >nul 2>nul
if errorlevel 1 (
  echo npm could not download the bundled pnpm runner. Check your network connection, then try again.
  pause
  exit /b 1
)
set "PNPM_MODE=npm"

:package_manager_ready

if not exist "package.json" (
  echo package.json was not found. Run this file from the AllMyTools repository root.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing project dependencies...
  if "%PNPM_MODE%"=="direct" (
    call pnpm.cmd install --frozen-lockfile
  ) else if "%PNPM_MODE%"=="npm" (
    call npm.cmd exec --yes --package=pnpm@9.15.5 -- pnpm install --frozen-lockfile
  )
  if errorlevel 1 (
    echo Dependency installation failed. The desktop app was not started.
    pause
    exit /b 1
  )
)

netstat -ano | findstr /r /c:":1420 .*LISTENING" >nul
if not errorlevel 1 (
  echo Port 1420 is already in use. Stop the existing AllMyTools development server, then start again.
  pause
  exit /b 1
)

echo Starting the AllMyTools desktop development environment...
if "%PNPM_MODE%"=="direct" (
  call pnpm.cmd desktop dev
) else if "%PNPM_MODE%"=="npm" (
  call npm.cmd exec --yes --package=pnpm@9.15.5 -- pnpm desktop dev
)
set "exitCode=%errorlevel%"

if not "%exitCode%"=="0" (
  echo The development environment exited with code %exitCode%.
  pause
)

exit /b %exitCode%
