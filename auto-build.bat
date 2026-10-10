@echo off
cd /d "%~dp0"
title Mission Cosmos - auto-build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto-build.ps1"
echo.
echo La surveillance est arretee.
pause
