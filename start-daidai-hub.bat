@echo off
setlocal

cd /d "%~dp0"
title DaiDai Hub Desktop

where pnpm >nul 2>nul
if errorlevel 1 (
  where npx >nul 2>nul
  if errorlevel 1 (
    echo [ERROR] Neither pnpm nor npx was found.
    echo Install Node.js, then run this file again.
    pause
    exit /b 1
  )
  echo pnpm was not found. Using pnpm 9 through npx...
  set "PNPM_CMD=npx --yes pnpm@9.15.9"
) else (
  set "PNPM_CMD=pnpm"
)

if not exist "apps\desktop-hub\node_modules\.bin\tauri.cmd" (
  echo Installing workspace dependencies...
  call %PNPM_CMD% install
  if errorlevel 1 (
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting DaiDai Hub desktop app...
call %PNPM_CMD% --dir apps\desktop-hub desktop:dev

if errorlevel 1 (
  echo.
  echo [ERROR] DaiDai Hub stopped with an error.
  pause
)

endlocal
