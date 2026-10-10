@echo off
cd /d "%~dp0"
title Mission Cosmos - deploiement
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-production.ps1" %*
echo.
echo Appuyez sur une touche pour fermer.
pause
