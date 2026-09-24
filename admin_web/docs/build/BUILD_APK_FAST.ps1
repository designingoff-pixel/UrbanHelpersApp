# Fast APK Build Script for UrbanHelpersApp
# This script automates the build process using EAS

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       URBAN HELPERS APP - FAST APK BUILD                   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp"
Set-Location $projectPath

Write-Host "Step 1: Verify EAS is installed..." -ForegroundColor Yellow
$easVersion = eas --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ EAS $easVersion" -ForegroundColor Green
} else {
    Write-Host "❌ EAS not found. Installing..." -ForegroundColor Red
    npm install -g eas-cli
}

Write-Host ""
Write-Host "Step 2: Check login status..." -ForegroundColor Yellow
$loginStatus = eas whoami 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Already logged in" -ForegroundColor Green
    Write-Host "   User: $loginStatus" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not logged in. You'll need to login..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "When prompted:" -ForegroundColor Cyan
    Write-Host "  1. Press 'o' to open browser" -ForegroundColor Cyan
    Write-Host "  2. Sign in or create free Expo account" -ForegroundColor Cyan
    Write-Host "  3. Authorize the request" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Starting login..." -ForegroundColor Yellow
    eas login --web
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed. Try: eas login" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 3: Starting APK build..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📦 Building with EAS (cloud-based)" -ForegroundColor Cyan
Write-Host "   Time: 10-15 minutes" -ForegroundColor Cyan
Write-Host "   You'll receive email with download link" -ForegroundColor Cyan
Write-Host ""

$buildStartTime = Get-Date

# Build the APK
eas build --platform android --profile preview

if ($LASTEXITCODE -eq 0) {
    $buildEndTime = Get-Date
    $duration = $buildEndTime - $buildStartTime
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                   ✅ BUILD SUCCESSFUL!                      ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Build completed in: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 Check your email for download link" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Download APK from email" -ForegroundColor Cyan
    Write-Host "2. Connect phone via USB" -ForegroundColor Cyan
    Write-Host "3. Run: adb install -r app.apk" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these fixes:" -ForegroundColor Yellow
    Write-Host "1. Check internet connection" -ForegroundColor Yellow
    Write-Host "2. Verify login: eas whoami" -ForegroundColor Yellow
    Write-Host "3. Check status: eas build --status" -ForegroundColor Yellow
    exit 1
}
