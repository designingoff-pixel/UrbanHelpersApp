# UrbanHelpersApp APK Builder Script
# Usage: ./build-apk.ps1 -type "release" (or "debug", "eas")

param(
    [string]$type = "release",
    [switch]$help
)

if ($help) {
    Write-Host @"
UrbanHelpersApp APK Build Script

Usage:
  .\build-apk.ps1 -type release      # Build release APK (default)
  .\build-apk.ps1 -type debug        # Build debug APK (faster)
  .\build-apk.ps1 -type eas          # Build via Expo EAS (cloud)
  .\build-apk.ps1 -help              # Show this help

Requirements:
  - Node.js v18+ (have v24.18.0)
  - Java 17 LTS (have Java 17)
  - Android SDK (for local builds)
  - Gradle (bundled with Android project)

Output:
  - Release APK: android/app/build/outputs/apk/release/app-release.apk
  - Debug APK: android/app/build/outputs/apk/debug/app-debug.apk

"@
    exit
}

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommandPath
$StartTime = Get-Date

Write-Host "================================" -ForegroundColor Cyan
Write-Host "UrbanHelpersApp APK Builder" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to check prerequisites
function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    $checks = @{
        "Node.js" = { node --version }
        "npm" = { npm --version }
        "Java" = { java -version 2>&1 | Select-Object -First 1 }
    }
    
    foreach ($tool in $checks.Keys) {
        try {
            $version = & $checks[$tool]
            Write-Host "  ✓ $tool : $version" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ $tool : NOT FOUND" -ForegroundColor Red
            return $false
        }
    }
    return $true
}

# Function to set Android SDK environment
function Set-AndroidEnvironment {
    Write-Host "Setting Android environment..." -ForegroundColor Yellow
    
    if (-not $env:ANDROID_HOME) {
        $sdk = "$env:LOCALAPPDATA\Android\sdk"
        if (Test-Path $sdk) {
            $env:ANDROID_HOME = $sdk
            $env:ANDROID_SDK_ROOT = $sdk
            Write-Host "  ✓ ANDROID_HOME set to: $sdk" -ForegroundColor Green
        } else {
            Write-Host "  ! Android SDK not found at $sdk" -ForegroundColor Yellow
            Write-Host "    For local builds, install Android SDK first" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✓ ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
    }
}

# Function to generate native project
function Invoke-Prebuild {
    Write-Host ""
    Write-Host "Generating native Android project..." -ForegroundColor Yellow
    Write-Host "This may take 2-5 minutes on first run..." -ForegroundColor Cyan
    
    try {
        Push-Location $ProjectRoot
        expo prebuild --clean --non-interactive
        Write-Host "✓ Prebuild complete" -ForegroundColor Green
        Pop-Location
    }
    catch {
        Write-Host "✗ Prebuild failed: $_" -ForegroundColor Red
        Pop-Location
        return $false
    }
    return $true
}

# Function to build with Gradle
function Invoke-GradleBuild {
    param([string]$buildType)
    
    Write-Host ""
    Write-Host "Building $buildType APK with Gradle..." -ForegroundColor Yellow
    Write-Host "This may take 5-15 minutes..." -ForegroundColor Cyan
    
    $AndroidDir = Join-Path $ProjectRoot "android"
    
    if (-not (Test-Path $AndroidDir)) {
        Write-Host "! Android project not found. Running prebuild first..." -ForegroundColor Yellow
        if (-not (Invoke-Prebuild)) {
            return $false
        }
    }
    
    try {
        Push-Location $AndroidDir
        
        if ($buildType -eq "release") {
            Write-Host "Building release APK (optimized, smaller size)..." -ForegroundColor Cyan
            & ".\gradlew.bat" assembleRelease
        } else {
            Write-Host "Building debug APK (faster, for testing)..." -ForegroundColor Cyan
            & ".\gradlew.bat" assembleDebug
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Build complete" -ForegroundColor Green
            Pop-Location
            return $true
        } else {
            Write-Host "✗ Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
            Pop-Location
            return $false
        }
    }
    catch {
        Write-Host "✗ Build error: $_" -ForegroundColor Red
        Pop-Location
        return $false
    }
}

# Function to build with EAS
function Invoke-EASBuild {
    Write-Host ""
    Write-Host "Building APK with Expo EAS (cloud-based)..." -ForegroundColor Yellow
    
    try {
        Push-Location $ProjectRoot
        
        # Check if EAS CLI is installed
        $easVersion = eas --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Installing EAS CLI..." -ForegroundColor Cyan
            npm install -g eas-cli
        }
        
        Write-Host "Initiating EAS build..." -ForegroundColor Cyan
        eas build --platform android
        
        Write-Host "✓ Build submitted to EAS" -ForegroundColor Green
        Pop-Location
        return $true
    }
    catch {
        Write-Host "✗ EAS build error: $_" -ForegroundColor Red
        Pop-Location
        return $false
    }
}

# Function to locate APK
function Get-APKLocation {
    param([string]$buildType)
    
    if ($buildType -eq "release") {
        return Join-Path $ProjectRoot "android\app\build\outputs\apk\release\app-release.apk"
    } else {
        return Join-Path $ProjectRoot "android\app\build\outputs\apk\debug\app-debug.apk"
    }
}

# Function to show APK info
function Show-APKInfo {
    param([string]$apkPath)
    
    if (Test-Path $apkPath) {
        $file = Get-Item $apkPath
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        
        Write-Host ""
        Write-Host "✓ APK successfully generated!" -ForegroundColor Green
        Write-Host ""
        Write-Host "APK Details:" -ForegroundColor Cyan
        Write-Host "  Path: $apkPath"
        Write-Host "  Size: $sizeMB MB"
        Write-Host "  Modified: $($file.LastWriteTime)"
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Connect Android phone via USB"
        Write-Host "  2. Enable USB Debugging on phone (Settings > Developer Options)"
        Write-Host "  3. Run: adb install -r '$apkPath'"
        Write-Host "  4. Or: copy file to phone manually and tap to install"
        Write-Host ""
    } else {
        Write-Host "✗ APK not found at: $apkPath" -ForegroundColor Red
        return $false
    }
    return $true
}

# Main execution
try {
    # Verify prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Host ""
        Write-Host "✗ Prerequisites check failed" -ForegroundColor Red
        exit 1
    }
    
    # Set Android environment
    Set-AndroidEnvironment
    
    # Build based on type
    $success = $false
    
    switch ($type.ToLower()) {
        "release" {
            $success = Invoke-GradleBuild "release"
            if ($success) {
                Show-APKInfo (Get-APKLocation "release")
            }
        }
        "debug" {
            $success = Invoke-GradleBuild "debug"
            if ($success) {
                Show-APKInfo (Get-APKLocation "debug")
            }
        }
        "eas" {
            $success = Invoke-EASBuild
        }
        default {
            Write-Host "Unknown build type: $type" -ForegroundColor Red
            Write-Host "Valid types: release, debug, eas" -ForegroundColor Yellow
            exit 1
        }
    }
    
    # Show total time
    $endTime = Get-Date
    $duration = $endTime - $StartTime
    
    Write-Host "Build time: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Cyan
    Write-Host ""
    
    if ($success) {
        Write-Host "================================" -ForegroundColor Green
        Write-Host "Build Successful!" -ForegroundColor Green
        Write-Host "================================" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "================================" -ForegroundColor Red
        Write-Host "Build Failed" -ForegroundColor Red
        Write-Host "================================" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    exit 1
}
