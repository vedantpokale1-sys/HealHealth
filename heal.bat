@echo off
title HEALHEALTH Localhost Launcher
cd /d "c:\HEAL HEALTH WEB APP"
echo =====================================================
echo   Opening HEALHEALTH Web App on Localhost...
echo   Backend Server:  http://localhost:5000
echo   Frontend Web:    http://localhost:5173
echo =====================================================
start http://localhost:5173
npm run heal
