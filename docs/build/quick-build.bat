@echo off
REM Quick APK Build Script
REM This builds the Urban Helpers App APK using EAS

setlocal enabledelayedexpansion

cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp

echo.
echo ================================================================================
echo                    URBAN HELPERS APP - QUICK BUILD
echo ================================================================================
echo.

REM Check if logged in
eas whoami >nul 2>&1
if errorlevel 1 (
    echo Step 1: Login to Expo
    echo.
    echo Running: eas login
    echo.
    eas login
    if errorlevel 1 (
        echo ERROR: Login failed
        exit /b 1
    )
) else (
    echo Step 1: Already logged in
)

echo.
echo Step 2: Building APK with EAS
echo.
echo This will take 10-15 minutes
echo Check your email for download link
echo.

eas build --platform android --profile preview

if errorlevel 1 (
    echo.
    echo ERROR: Build failed
    echo.
    echo Troubleshooting:
    echo   - Check internet connection
    echo   - Run: eas build --status
    echo   - Check email for error details
    exit /b 1
)

echo.
echo ================================================================================
echo                      BUILD COMPLETE!
echo ================================================================================
echo.
echo APK should be ready soon. Check your email for download link.
echo.
echo Next steps:
echo   1. Download APK from email
echo   2. Connect phone via USB
echo   3. Run: adb install -r app.apk
echo.
