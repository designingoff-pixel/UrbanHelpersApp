@echo off
REM UrbanHelpersApp APK Builder Batch Script
REM Usage: build-apk.bat release (or debug, eas)

setlocal enabledelayedexpansion

set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=release

if "%BUILD_TYPE%"=="help" (
    echo.
    echo UrbanHelpersApp APK Build Script
    echo.
    echo Usage:
    echo   build-apk.bat release    - Build release APK (default)
    echo   build-apk.bat debug      - Build debug APK (faster)
    echo   build-apk.bat eas        - Build via Expo EAS (cloud)
    echo   build-apk.bat help       - Show this help
    echo.
    echo Requirements:
    echo   - Node.js v18+
    echo   - Java 17 LTS
    echo   - Android SDK (for local builds)
    echo.
    goto :eof
)

echo.
echo ================================
echo UrbanHelpersApp APK Builder
echo ================================
echo.
echo Build Type: %BUILD_TYPE%
echo.

REM Check prerequisites
echo Checking prerequisites...
node --version >nul 2>&1 || (echo ERROR: Node.js not found && exit /b 1)
echo   OK: Node.js
npm --version >nul 2>&1 || (echo ERROR: npm not found && exit /b 1)
echo   OK: npm
java -version >nul 2>&1 || (echo ERROR: Java not found && exit /b 1)
echo   OK: Java

echo.

REM Build based on type
if /i "%BUILD_TYPE%"=="release" (
    echo Building release APK with Gradle...
    echo This may take 5-15 minutes...
    echo.
    
    if not exist "android\" (
        echo Android project not found. Running prebuild...
        call npm run prebuild || goto :error
    )
    
    cd android
    call gradlew.bat assembleRelease || (cd .. && goto :error)
    cd ..
    
    if exist "android\app\build\outputs\apk\release\app-release.apk" (
        echo.
        echo ========== SUCCESS ==========
        echo APK Path: android\app\build\outputs\apk\release\app-release.apk
        echo.
        echo Next: adb install -r android\app\build\outputs\apk\release\app-release.apk
        echo ==============================
        exit /b 0
    ) else (
        echo ERROR: APK not found
        exit /b 1
    )
) else if /i "%BUILD_TYPE%"=="debug" (
    echo Building debug APK with Gradle...
    echo This may take 3-8 minutes...
    echo.
    
    if not exist "android\" (
        echo Android project not found. Running prebuild...
        call npm run prebuild || goto :error
    )
    
    cd android
    call gradlew.bat assembleDebug || (cd .. && goto :error)
    cd ..
    
    if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
        echo.
        echo ========== SUCCESS ==========
        echo APK Path: android\app\build\outputs\apk\debug\app-debug.apk
        echo.
        echo Next: adb install -r android\app\build\outputs\apk\debug\app-debug.apk
        echo ==============================
        exit /b 0
    ) else (
        echo ERROR: APK not found
        exit /b 1
    )
) else if /i "%BUILD_TYPE%"=="eas" (
    echo Building with Expo EAS (cloud)...
    echo.
    
    where eas >nul 2>&1 || (
        echo Installing EAS CLI...
        call npm install -g eas-cli || goto :error
    )
    
    call eas build --platform android
    exit /b !ERRORLEVEL!
) else (
    echo ERROR: Unknown build type "%BUILD_TYPE%"
    echo Valid types: release, debug, eas
    exit /b 1
)

:error
echo.
echo ========== BUILD FAILED ==========
exit /b 1
