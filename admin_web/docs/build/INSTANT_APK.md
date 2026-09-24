# Get APK in 2 Ways - Pick Your Speed

## 🚀 WAY 1: Instant - Use Expo Go (No Build Needed!)

### What is Expo Go?
Pre-built app that loads your React Native code directly.
- No APK building needed
- Test in 2 minutes
- Perfect for development/testing

### Steps:

1. **Download Expo Go on phone:**
   - Google Play Store: Search "Expo Go"
   - iOS App Store: Search "Expo Go"
   - Install it

2. **Start dev server:**
   ```powershell
   cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp
   npm start
   ```

3. **Connect phone to same WiFi as PC**

4. **Scan QR code** that appears in terminal with Expo Go app

5. **App loads instantly!** 🎉

**Advantage:** No building, instant updates, perfect for testing  
**Disadvantage:** Only works with Expo Go (not standalone APK)

---

## 📦 WAY 2: Production APK - Build & Deploy

### Option A: Cloud Build (Recommended)

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp

# Create free Expo account and login
eas login

# Build APK in cloud
eas build --platform android --profile preview
```

**Time:** 10-15 minutes  
**Result:** Standalone APK that works everywhere

### Option B: Local Build (Requires Android SDK)

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android

# Build debug APK
.\gradlew.bat assembleDebug

# OR release APK
.\gradlew.bat assembleRelease
```

**Note:** Local builds may have module compatibility issues. We've added fixes, but cloud build is safer.

---

## 🎯 My Recommendation:

### For Quick Testing (Next 5 min):
**→ Use Expo Go (Way 1)**
- Download Expo Go
- Run: `npm start`
- Scan QR code
- Done!

### For Standalone APK (10-15 min):
**→ Use EAS Build (Way 2 - Option A)**
- Run: `eas login`
- Run: `eas build --platform android --profile preview`
- Download APK
- Deploy with: `adb install`

### For Local Build (Advanced):
**→ Use Gradle (Way 2 - Option B)**
- Requires Android SDK setup
- May need troubleshooting
- Faster builds once working

---

## Quick Start Commands:

### EXPO GO (Fastest - Try This First!):
```powershell
npm start
# Then scan QR code with Expo Go app on phone
```

### EAS BUILD (Standalone APK):
```powershell
eas login
eas build --platform android --profile preview
# Check email for download link
```

### GRADLE BUILD (Local - Advanced):
```powershell
cd android
.\gradlew.bat assembleDebug
```

---

## Comparison Table:

| Method | Time | Setup | Result | Best For |
|--------|------|-------|--------|----------|
| **Expo Go** | 2 min | None | Live app in Expo Go | Quick testing |
| **EAS Build** | 15 min | Free account | Standalone APK | Distribution |
| **Gradle** | 5-10 min | Android SDK | Standalone APK | Development |

---

## RECOMMENDED PATH:

### Step 1: Quick Test (2 minutes)
```powershell
npm start
```
Scan QR code with Expo Go app → App loads!

### Step 2: Standalone APK (15 minutes)
```powershell
eas login
eas build --platform android --profile preview
```
Check email for download → Deploy with ADB

### Step 3: Deploy (2 minutes)
```powershell
adb install -r downloaded-apk.apk
```

---

## What Next?

### Choose Based on Your Need:

**"I just want to see the app running now"**
→ Use Expo Go: `npm start`

**"I want a standalone APK to share"**
→ Use EAS: `eas login` then `eas build --platform android --profile preview`

**"I want to build locally"**
→ Use Gradle: Read APK_BUILD_GUIDE.md for troubleshooting

---

## Troubleshooting:

### Expo Go not working?
- Make sure phone and PC on same WiFi
- Restart dev server: `npm start`
- Clear app cache: Expo Go → Settings → Clear cache

### EAS login not working?
- Create free Expo account at https://expo.dev
- Use: `eas login --username your-username`

### ADB not found?
- Check: `adb devices`
- If not found: Add to PATH or use full path to adb

---

**READY? Start with:**

```powershell
npm start
```

Scan the QR code with Expo Go app and see your app in 2 minutes!

Or go straight to EAS for standalone APK:

```powershell
eas login
eas build --platform android --profile preview
```
