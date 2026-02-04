@echo off
echo ========================================
echo    AGENTRADAR - Actualizando datos
echo ========================================
echo.

cd /d %~dp0

echo [1/3] Scrapeando noticias...
call npx ts-node scripts/fetch-complete.ts

echo.
echo [2/3] Mezclando datos...
call npx ts-node scripts/merge-data.ts

echo.
echo [3/3] Desplegando a Vercel...
call npx vercel --prod --yes

echo.
echo ========================================
echo    LISTO! Datos actualizados
echo ========================================
echo.
echo Ver en: https://agentradar.vercel.app
pause
