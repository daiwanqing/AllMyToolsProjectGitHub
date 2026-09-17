@echo off
chcp 65001 >nul
setlocal

call "%~dp0启动AllMyTools.bat" mobile
exit /b %errorlevel%
