@echo off
cd /d "%~dp0"
echo Actualizando dev desde GitHub...
git checkout dev
if errorlevel 1 goto :fail
git pull origin dev
if errorlevel 1 goto :fail
echo.
echo Deten Nest y Next (Ctrl+C) y arrancalos de nuevo.
echo En el navegador: Ctrl+Shift+R
pause
exit /b 0
:fail
echo Fallo git. Si hay archivos locales, no hagas reset sin preguntar.
pause
exit /b 1
