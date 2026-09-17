@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "DEV_PORT=1420"
set "DEV_TARGET=desktop"

if /i "%~1"=="mobile" (
  set "DEV_PORT=1422"
  set "DEV_TARGET=mobile"
)

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

rem 工作区新增工具后可能只剩不完整的 node_modules 链接。
if not exist "apps\desktop\node_modules\@allmytools\tools-calendar-todos\package.json" (
  echo Refreshing workspace dependencies...
  if "%PNPM_MODE%"=="direct" (
    call pnpm.cmd install --frozen-lockfile
  ) else if "%PNPM_MODE%"=="npm" (
    call npm.cmd exec --yes --package=pnpm@9.15.5 -- pnpm install --frozen-lockfile
  )
  if errorlevel 1 (
    echo Dependency refresh failed. The desktop app was not started.
    pause
    exit /b 1
  )
)

set "PORT_PIDS="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":%DEV_PORT% .*LISTENING"') do (
  set "PORT_PIDS=!PORT_PIDS! %%P"
)

if defined PORT_PIDS (
  echo Port %DEV_PORT% is already in use by:
  for %%P in (!PORT_PIDS!) do tasklist /fi "PID eq %%P" /fo table /nh
  choice /c YN /n /m "Terminate the listening process and restart AllMyTools? [Y/N] "
  if errorlevel 2 (
    echo Existing process was left running. The desktop app was not started.
    pause
    exit /b 1
  )

  for %%P in (!PORT_PIDS!) do taskkill /pid %%P /t /f >nul 2>nul
  timeout /t 1 /nobreak >nul
  netstat -ano | findstr /r /c:":%DEV_PORT% .*LISTENING" >nul
  if not errorlevel 1 (
    echo Port %DEV_PORT% is still in use. The existing process could not be stopped.
    pause
    exit /b 1
  )
  echo Port %DEV_PORT% was released.
)

if "%DEV_TARGET%"=="mobile" (
  echo Starting the AllMyTools mobile preview on the local network...
  if "%PNPM_MODE%"=="direct" (
    call pnpm.cmd --filter @allmytools/desktop dev:mobile
  ) else if "%PNPM_MODE%"=="npm" (
    call npm.cmd exec --yes --package=pnpm@9.15.5 -- pnpm --filter @allmytools/desktop dev:mobile
  )
) else (
  echo Starting the AllMyTools desktop development environment...
  if "%PNPM_MODE%"=="direct" (
    call pnpm.cmd desktop dev
  ) else if "%PNPM_MODE%"=="npm" (
    call npm.cmd exec --yes --package=pnpm@9.15.5 -- pnpm desktop dev
  )
)
set "exitCode=%errorlevel%"

if not "%exitCode%"=="0" (
  echo The development environment exited with code %exitCode%.
  pause
)

exit /b %exitCode%
