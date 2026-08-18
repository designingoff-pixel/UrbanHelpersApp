# UrbanHelpersApp - USB Deployment Guide

Complete guide to transfer and install the APK on your Android phone via USB.

---

## Overview

| Method | Time | Difficulty | When to Use |
|--------|------|-----------|-----------|
| ADB (Direct install) | 1-2 min | Easy | Fast testing |
| File transfer + manual | 2-3 min | Medium | Backup method |
| Share via email | 5 min | Easy | Non-technical users |

---

## Method 1: ADB Direct Installation (Recommended)

### Prerequisites
- APK file ready (`android/app/build/outputs/apk/debug/app-debug.apk`)
- USB cable
- Android phone with USB debugging enabled

### Step 1: Enable USB Debugging on Phone

**Samsung/Android (most devices):**
1. Open **Settings**
2. Scroll to **About phone**
3. Find **Build number** (usually at bottom)
4. Tap it **7 times** quickly
5. You'll see: "You are now a developer!"
6. Go back to **Settings**
7. Look for **Developer options** (now visible)
8. Tap **Developer options**
9. Enable **USB Debugging**
10. Enable **Install apps from unknown sources** (if needed)

**Screenshot hints:**
- Build Number: Usually says "Build Number: [some value]"
- Developer Options: Appears after tapping Build Number 7 times
- USB Debugging: Toggle it ON

### Step 2: Connect Phone to PC via USB

1. Use a **data USB cable** (not just charging)
2. Connect to PC
3. Wait for phone to recognize (1-2 seconds)
4. You should see a prompt on phone: **"Allow USB debugging?"**
5. Tap **Allow** (or check "Always allow from this computer")
6. Wait for phone status bar to show "USB debugging enabled"

### Step 3: Verify Connection in PowerShell

Open PowerShell and run:

```powershell
adb devices
```

**Expected output:**
```
List of attached devices
yourdeviceid    device
```

If device shows as `offline` or `unauthorized`:
- Tap **Allow** on phone again
- Or run: `adb kill-server` then `adb devices` again

### Step 4: Install APK

```powershell
# Navigate to APK location
cd "c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp"

# Install debug APK
adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"

# OR install release APK (smaller, optimized)
adb install -r "android\app\build\outputs\apk\release\app-release.apk"
```

**The `-r` flag** means "reinstall if already exists"

### Step 5: Watch Installation Progress

```
[100%] Package installed.
Success
```

If you see `Success`, app is installed! ✓

### Step 6: Launch App on Phone

Either:
- Tap the **Urban Helpers** icon on home screen
- Or from PowerShell:
  ```powershell
  adb shell am start -n com.urbanhelpers.app/.MainActivity
  ```

---

## Method 2: Manual File Transfer (Alternative)

### When to use:
- ADB not working
- Share with non-technical user
- Offline transfer needed

### Steps:

1. **Keep USB connected** (from Step 2 above)
2. Open **File Explorer** on PC
3. Your phone should appear as a storage device
4. Copy APK file:
   ```
   From: c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android\app\build\outputs\apk\debug\app-debug.apk
   To: Phone\Downloads\
   ```
5. **Disconnect USB cable**
6. **On phone:**
   - Open **Files** or **My Files** app
   - Go to **Downloads**
   - Tap **app-debug.apk**
   - Tap **Install**
   - Follow prompts
7. Once installed, app appears on home screen

---

## Method 3: Email/Cloud Transfer

### For sharing with others:

1. **Compress APK** (optional, saves space):
   ```powershell
   cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android\app\build\outputs\apk\debug
   Compress-Archive -Path "app-debug.apk" -DestinationPath "UrbanHelpersApp-debug.zip"
   ```

2. **Upload to file service:**
   - Google Drive
   - OneDrive
   - Dropbox
   - SendAnywhere

3. **Share link** with others

4. **Recipient:**
   - Downloads file
   - Opens **Files** app
   - Taps APK
   - Installs

---

## Troubleshooting

### "adb: command not found"

**Solution:**
```powershell
# Add ADB to PATH
$env:PATH += ";C:\Users\Vichu\AppData\Local\Android\sdk\platform-tools"

# Verify
adb version
```

### "List of attached devices" shows nothing

**Try:**
```powershell
# Restart ADB daemon
adb kill-server
adb start-server

# Check again
adb devices

# If phone shows "unauthorized":
# - Tap "Allow" on phone USB debugging prompt
# - Might need to disconnect/reconnect USB
```

### "Device offline"

```powershell
# Kill and restart ADB
adb kill-server
adb devices

# Or unplug/plug USB again
```

### "Installation failed: [INSTALL_FAILED_INVALID_APK]"

**Causes:**
- Corrupted APK file (download again)
- Wrong Android version (check phone's Android version)
- Storage full on phone (clear space)

**Fix:**
```powershell
# Uninstall old version first
adb uninstall com.urbanhelpers.app

# Then reinstall
adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
```

### "Permission denied" on Windows

```powershell
# Run PowerShell as Administrator
# Start → PowerShell → Run as Administrator
# Then retry adb install
```

### App crashes immediately on launch

```powershell
# View crash logs
adb logcat | Select-String "UrbanHelpers"

# Clear app data and try again
adb shell pm clear com.urbanhelpers.app

# Reinstall
adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
```

---

## Useful ADB Commands

```powershell
# List all connected devices
adb devices

# Install APK
adb install -r <path-to-apk>

# Uninstall app
adb uninstall com.urbanhelpers.app

# Launch app
adb shell am start -n com.urbanhelpers.app/.MainActivity

# View live logs
adb logcat

# View logs for specific app
adb logcat | Select-String "UrbanHelpers"

# Stop logs (Ctrl+C)

# Clear app data
adb shell pm clear com.urbanhelpers.app

# Get app info
adb shell pm list packages | Select-String "urbanhelpers"

# Reboot device
adb reboot

# Pull file from phone
adb pull /sdcard/path/file.txt .

# Push file to phone
adb push file.txt /sdcard/path/

# Screenshot from phone
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png .
```

---

## Device Info You Need

To troubleshoot, you might need:

```powershell
# Get Android version
adb shell getprop ro.build.version.release

# Get device model
adb shell getprop ro.product.model

# Get API level
adb shell getprop ro.build.version.sdk

# Get all device properties
adb shell getprop
```

---

## Installation Walkthrough

### Desktop (Windows PowerShell)
```powershell
cd "c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp"
adb devices                    # Check phone connected
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

### Phone Screen Progression
1. **USB connection prompt** → Tap "Allow"
2. **Detecting device...** (a few seconds)
3. **Installing...** (progress bar)
4. **Install complete** ✓
5. App launches or shows on home screen

---

## Verify Installation

```powershell
# After successful install, run:
adb shell pm list packages | Select-String "urbanhelpers"

# Output should show:
# package:com.urbanhelpers.app
```

---

## Next Steps

1. ✅ Enable USB Debugging on phone
2. ✅ Connect phone via USB
3. ✅ Verify with `adb devices`
4. ✅ Run `adb install` command
5. ✅ Launch app on phone
6. ✅ Test all screens

---

## Quick Reference Card

```
QUICK COMMANDS:

Connect Phone:
  1. Settings → About → Build Number (tap 7x)
  2. Settings → Developer Options → USB Debugging ON
  3. Connect via USB → Tap "Allow"

Verify Connection:
  adb devices

Install:
  adb install -r android\app\build\outputs\apk\debug\app-debug.apk

Launch:
  adb shell am start -n com.urbanhelpers.app/.MainActivity

Logs:
  adb logcat | Select-String "UrbanHelpers"

Uninstall:
  adb uninstall com.urbanhelpers.app
```

---

## Support Resources

- [ADB Documentation](https://developer.android.com/studio/command-line/adb)
- [USB Debugging Guide](https://developer.android.com/studio/debug/dev-options)
- [Android Emulator Setup](https://developer.android.com/studio/run/emulator)
