@echo off
echo ========================================
echo  JEICOX CHEMICAL STUDIO - DEPLOYMENT
echo ========================================
echo.
echo Este script te ayudara a subir tu proyecto
echo.
pause

echo.
echo Paso 1: Abre tu navegador en:
echo https://github.com/new
echo.
echo Configura asi:
echo - Repository name: jeicox-chemical-studio
echo - Public
echo - NO marques README, .gitignore, ni license
echo.
pause

echo.
echo Paso 2: Ingresa tu nombre de usuario de GitHub:
set /p GITHUB_USER="Tu usuario GitHub: "

echo.
echo Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/jeicox-chemical-studio.git
git branch -M main

echo.
echo Paso 3: Subiendo a GitHub...
echo (Te pedira tus credenciales)
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  GitHub: EXITOSO!
    echo  URL: https://github.com/%GITHUB_USER%/jeicox-chemical-studio
    echo ========================================
    echo.
    echo Paso 4: Deploy a Vercel
    echo Opcion A - Automatico:
    echo   1. Ve a https://vercel.com/new
    echo   2. Importa tu repo de GitHub
    echo   3. Click en Deploy
    echo.
    echo Opcion B - CLI:
    echo   vercel login
    echo   vercel --prod
    echo.
) else (
    echo.
    echo ERROR: No se pudo subir a GitHub
    echo Verifica que creaste el repositorio en GitHub primero
)

pause
