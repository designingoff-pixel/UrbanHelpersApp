# UrbanHelpersApp - APK Build & Deployment Guide

## Overview
This guide explains how to build the UrbanHelpersApp APK using **Expo EAS Build** (recommended, cloud-based) or **local Gradle build** (requires Android SDK setup).

---

## Option 1: Expo EAS Build (Easiest - No Android SDK Required)

### Prerequisites
- Node.js v18+ (✓ You have v24.18.0)
- npm (✓ You have v11.16.0)
- Expo CLI
- EAS CLI

### Step 1: Install EAS CLI
```powershell
npm install -g eas-cli
```

### Step 2: Login to Expo
```powershell
eas login
# or
eas login --non-interactive
```

### Step 3: Build APK in Cloud
```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp
eas build --platform android --local
```

The `--local` flag builds on your machine using local Android SDK if available. Without it, it builds in the cloud.

### Step 4: Download APK
Once built, EAS will provide a download link. The APK will be saved locally.

**Advantages:**
- ✅ No Android SDK installation needed (cloud-based)
- ✅ Automatic signing with Expo's certificates
- ✅ Works from any machine
- ✅ Automatic optimizations applied

---

## Option 2: Local Gradle Build (Recommended if you have Android SDK)

### Prerequisites
- Java 17 LTS (✓ You have this)
- Android SDK (need to install)
- Gradle (bundled with Expo/Android)

### Step 1: Install Android SDK

#### Quick Install via Android Command-Line Tools:

```powershell
# Create SDK directory
New-Item -ItemType Directory -Path "$env:LOCALAPPDATA\Android\sdk" -Force

# Download Android Command-line Tools
# Go to: https://developer.android.com/studio/command-line-tools
# Download "cmdline-tools-windows-VERSION.zip"
# Extract to: C:\Users\Vichu\AppData\Local\Android\sdk\cmdline-tools\latest

# Set environment variable
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\sdk", "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", "$env:LOCALAPPDATA\Android\sdk", "User")

# Refresh environment
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\sdk"
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\sdk"

# Accept licenses and install SDK packages
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager" --sdk_root="$env:ANDROID_HOME" "platforms;android-34" "build-tools;34.0.0" "platform-tools"
```

### Step 2: Generate Native Android Project

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp

# Install Expo CLI globally
npm install -g expo-cli

# Generate Android native project
expo prebuild --clean
```

This creates an `android/` directory with Gradle-compatible project files.

### Step 3: Build APK with Gradle

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android

# Build release APK
.\gradlew.bat assembleRelease

# OR build debug APK (faster)
.\gradlew.bat assembleDebug
```

### Step 4: Locate Generated APK

**Release APK:** `android/app/build/outputs/apk/release/app-release.apk` (Size: ~50-70 MB)
**Debug APK:** `android/app/build/outputs/apk/debug/app-debug.apk` (Size: ~80-100 MB)

---

## Option 3: One-Command Local Build (Simplest Gradle Approach)

If you have Android SDK installed:

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp
npm install -g eas-cli
eas build --platform android --local
```

This uses your local Android SDK and Gradle automatically.

---

## USB Deployment to Android Phone

### Prerequisites
- Android phone with USB debugging enabled
- USB cable
- ADB (Android Debug Bridge) - installed with Android SDK

### Step 1: Enable USB Debugging on Phone
1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times (enable Developer Options)
3. Go back to **Settings → Developer Options**
4. Enable **USB Debugging**
5. Connect phone to PC via USB

### Step 2: Verify ADB Connection
```powershell
adb devices
# Output should show your device with status "device"
```

### Step 3: Install APK via ADB
```powershell
# For release APK
adb install -r c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android\app\build\outputs\apk\release\app-release.apk

# OR for debug APK
adb install -r c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android\app\build\outputs\apk\debug\app-debug.apk
```

The `-r` flag reinstalls if already present.

### Step 4: Launch App
```powershell
# App launches automatically, or manually from phone home screen
adb shell am start -n com.urbanhelpers.app/com.urbanhelpers.app.MainActivity
```

### Alternative: Manual USB File Transfer
1. Connect phone via USB
2. Copy APK file to phone storage
3. Use file manager app on phone to locate and tap APK
4. Follow install prompts

---

## Build Size & Performance Notes

| Build Type | Size | Speed | Best For |
|-----------|------|-------|----------|
| Debug APK | 80-100 MB | Fast (2-3 min) | Testing, development |
| Release APK | 50-70 MB | Slower (5-10 min) | Production, sharing |
| Cloud EAS | Varies | 10-15 min | CI/CD pipelines |

---

## Troubleshooting

### Issue: "Android SDK not found"
**Solution:**
```powershell
# Set environment variables
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\sdk"
$env:ANDROID_SDK_ROOT = "$env:LOCALAPPDATA\Android\sdk"

# Verify
echo $env:ANDROID_HOME
```

### Issue: "JAVA_HOME not set"
**Solution:**
```powershell
# Find Java installation
Get-Command java

# Set JAVA_HOME (example)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

### Issue: Gradle build timeout
**Solution:**
```powershell
# Increase memory allocation
$env:GRADLE_OPTS = "-Xmx2g"
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android
.\gradlew.bat assembleRelease
```

### Issue: ADB device not recognized
**Solution:**
1. Disconnect and reconnect USB cable
2. Tap "Allow" on phone USB debugging prompt
3. Restart ADB daemon:
   ```powershell
   adb kill-server
   adb start-server
   adb devices
   ```

### Issue: App crashes on launch
**Solution:**
- Check logs: `adb logcat | Select-String "UrbanHelpers"`
- Ensure permissions are granted (location, camera, etc.)
- Rebuild with latest dependencies: `npm install`

---

## Quick Command Reference

### Build Commands
```powershell
# Prebuild native Android project
expo prebuild --clean

# Build with Gradle (local)
cd android
.\gradlew.bat assembleRelease      # Release APK
.\gradlew.bat assembleDebug        # Debug APK
.\gradlew.bat clean                # Clean build

# Build with EAS (cloud)
eas build --platform android
```

### Deployment Commands
```powershell
# Check connected devices
adb devices

# Install APK
adb install -r app-release.apk

# View logs
adb logcat

# Launch app
adb shell am start -n com.urbanhelpers.app/.MainActivity

# Uninstall app
adb uninstall com.urbanhelpers.app
```

### Development
```powershell
# Start dev server
npm start

# Run in Android emulator
npm run android

# Clear cache
npm run android -- --clear
```

---

## Recommended Build Path

1. **First time?** → Use **Option 1 (Expo EAS Build)** - no setup needed
2. **Prefer local builds?** → Use **Option 2 (Local Gradle)** - full control
3. **Production release?** → Use **Release APK + Code Signing** (see Firebase App Distribution)

---

## Next Steps

- 📦 Build APK
- 📱 Deploy to phone via USB
- 🧪 Test all screens
- 📤 Distribute via Firebase App Distribution, TestFlight, or Google Play

---

## Resources

- [Expo Prebuild Docs](https://docs.expo.dev/guides/local-app-development/#local-app-development-workflow)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Android Gradle Build System](https://developer.android.com/studio/build)
- [ADB Commands](https://developer.android.com/studio/command-line/adb)
