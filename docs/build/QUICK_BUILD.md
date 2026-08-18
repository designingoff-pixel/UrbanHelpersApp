# UrbanHelpersApp - Quick APK Build & Deploy (5 Minutes)

## Status: READY TO BUILD ✓
- ✅ Node.js v24.18.0 installed
- ✅ npm 11.16.0 installed  
- ✅ Java 17 LTS installed
- ✅ Dependencies installed
- ✅ Android project generated (via expo prebuild)
- ✅ Expo CLI installed
- ✅ EAS CLI installed

---

## Fastest Path: Use Expo EAS Build (Cloud-Based)

### Why EAS?
- **No Android SDK needed**
- **Handles all compatibility issues automatically**
- **Works from any machine**
- **Build runs on Expo's servers**
- **APK ready in 10-15 minutes**

### Build Steps:

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp

# 1. Login to Expo (creates free account if needed)
eas login
# Enter email, create password

# 2. Build APK
eas build --platform android --profile preview

# 3. Download APK when ready
# Follow the link in terminal output
```

**Output:** APK file (~60 MB) saved to your Downloads

---

## Alternative: Local Gradle Build (Advanced)

The local Gradle build encountered Expo module compatibility issues. **To fix:**

### Step 1: Install Android SDK (One-time setup)

```powershell
# Download from: https://developer.android.com/studio/command-line-tools-latest-windows.zip
# Extract to: C:\Users\Vichu\AppData\Local\Android\sdk\cmdline-tools\latest

# Then run:
$env:ANDROID_HOME = "C:\Users\Vichu\AppData\Local\Android\sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $env:ANDROID_HOME, "User")

# Install SDK components:
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager" --sdk_root="$env:ANDROID_HOME" `
  "platforms;android-34" "build-tools;34.0.0" "platform-tools"
```

### Step 2: Fix Expo Module Issues

Edit `android/build.gradle` - Add this at the top level:

```gradle
subprojects {
  project.configurations.all {
    resolutionStrategy.eachDependency { details ->
      if (details.requested.group == 'com.facebook.react') {
        details.useVersion "0.74.5"
      }
    }
  }
}
```

### Step 3: Build

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android

# Clean build
.\gradlew.bat clean

# Build debug APK (faster)
.\gradlew.bat assembleDebug

# OR build release APK (optimized)
.\gradlew.bat assembleRelease
```

**Output:**
- Debug: `app/build/outputs/apk/debug/app-debug.apk` (~90 MB)
- Release: `app/build/outputs/apk/release/app-release.apk` (~65 MB)

---

## Deploy APK to Phone via USB

### Prerequisites
- Android phone with USB debugging enabled
- USB cable

### Step 1: Enable USB Debugging on Phone

1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings → Developer Options**
4. Enable **USB Debugging**
5. Connect phone to PC via USB
6. Tap **Allow** on the "Allow USB debugging?" prompt

### Step 2: Install APK via ADB

```powershell
# Verify phone is connected
adb devices
# Should show: "device name    device"

# Install APK
adb install -r "c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android\app\build\outputs\apk\debug\app-debug.apk"

# Or if using release APK:
adb install -r "c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android\app\build\outputs\apk\release\app-release.apk"
```

### Step 3: Launch App

App launches automatically, or find **"Urban Helpers"** on phone home screen.

---

## Troubleshooting

### "adb not found"
```powershell
# If using local Gradle build, ADB is automatically available
# If not, add to PATH:
$env:PATH += ";C:\Users\Vichu\AppData\Local\Android\sdk\platform-tools"
```

### "Device not recognized"
```powershell
adb kill-server
adb start-server
adb devices
# Tap "Allow" on phone again
```

### "eas login fails"
```powershell
# Create free Expo account at https://expo.dev
# Then run:
eas login --non-interactive
# And enter credentials when prompted
```

### EAS Build takes too long
- Check build status: `eas build --status`
- Builds typically queue for 5-15 minutes depending on server load

---

## Comparison: EAS vs Local Gradle

| Feature | EAS Build | Local Gradle |
|---------|-----------|--------------|
| Setup time | 2 min | 30 min |
| Build time | 10-15 min | 5-10 min |
| Android SDK required | No | Yes |
| Compatibility issues | None | Possible |
| Free tier | Yes (30 builds/month) | Yes |
| Best for | Quick testing | CI/CD pipelines |

---

## Recommended Approach

**For Testing/Development:**
1. Use **EAS Build** (cloud)
2. Takes 15 minutes but no setup needed
3. Run: `eas build --platform android --profile preview`

**For Production/Recurring Builds:**
1. Set up local Gradle
2. Then use: `.\gradlew.bat assembleRelease`
3. Takes 5-10 minutes after setup

---

## File Locations

```
UrbanHelpersApp/
├── eas.json                          # EAS build config
├── app.json                          # App metadata (Android package set)
├── APK_BUILD_GUIDE.md               # Detailed guide
├── QUICK_BUILD.md                   # This file
├── build-apk.ps1                    # PowerShell build script
├── build-apk.bat                    # Batch build script
├── android/                         # Generated Android project
│   ├── app/build/outputs/apk/
│   │   ├── debug/app-debug.apk      # Debug APK
│   │   └── release/app-release.apk  # Release APK
│   ├── gradlew.bat                  # Gradle wrapper
│   └── settings.gradle
└── src/                             # React Native source code
```

---

## Next Steps

1. **Choose your build method** (EAS = easier, Local Gradle = faster once setup)
2. **Build APK** using commands above
3. **Connect phone via USB** and enable debugging
4. **Deploy** using `adb install`
5. **Test on device**

---

## Support

- EAS Docs: https://docs.expo.dev/eas/
- Gradle Docs: https://docs.gradle.org/
- Android Debug Bridge: https://developer.android.com/studio/command-line/adb
