@echo off
setlocal

cd /d "%~dp0"
title DaiDai Hub Desktop

where pnpm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] pnpm was not found.
  echo Install Node.js and pnpm, then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\.pnpm" (
  echo Installing workspace dependencies...
  call pnpm install
  if errorlevel 1 (
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting DaiDai Hub desktop app...
call pnpm --dir apps\desktop-hub desktop:dev

if errorlevel 1 (
  echo.
  echo [ERROR] DaiDai Hub stopped with an error.
  pause
)

endlocal
