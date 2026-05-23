@echo off
title Enso Collateral Platform Launcher
color 0A
echo ===================================================================
echo     INICIANDO PLATAFORMA ENSO COLLATERAL AGENT GATEWAY (CYBERPUNK)
echo ===================================================================
echo.

echo [+] Iniciando Servidor API Gateway (Puerto 3000)...
start "Enso API Gateway" cmd /k "cd apps\api && npm run dev"

echo [+] Iniciando Dashboard Web (Puerto 5173)...
start "Enso Dashboard" cmd /k "cd apps\dashboard && npm run dev"

echo [+] Esperando que los servidores carguen...
timeout /t 4 >nul

echo [+] Abriendo el Dashboard en tu navegador...
start http://localhost:5173

echo.
echo ===================================================================
echo   ¡Todo listo, Capo! Los servidores estan corriendo en segundo plano.
echo   Para detenerlos, simplemente cierra los terminales abiertos.
echo ===================================================================
echo.
pause
