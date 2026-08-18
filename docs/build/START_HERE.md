# UrbanHelpersApp - Build & Deploy Starter Guide

## 🎯 You're Here Because...

You have the complete React Native + Expo + TypeScript Urban Helpers app and want to:
1. **Build an APK** from the source code
2. **Install it on your Android phone** via USB
3. **Test it on your device**

**Good news:** Everything is set up and ready. This guide will take you through it.

---

## 📦 What You Have

```
UrbanHelpersApp/
├── Complete React Native source code (44 screens)
├── Android project generated (via expo prebuild)
├── Build configuration ready (eas.json)
├── Dependencies installed (node_modules/)
├── All tools ready (Node.js, npm, Java, Expo CLI, EAS CLI)
└── Multiple build & deployment guides
```

**App Details:**
- Name: Urban Helpers
- Package: `com.urbanhelpers.app`
- Type: Health & Wellness tracker
- Screens: 44 (auth, dashboard, medical, fitness, daily health, daily care)
- Size: ~60-90 MB APK

---

## ⚡ Quick Start (5 Minutes)

### Option A: EAS Build (Cloud - Easiest)

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp

# 1. Login (creates free Expo account if needed)
eas login

# 2. Build APK
eas build --platform android --profile preview

# 3. Download when ready
# Follow link in terminal output
```

**Pros:** No setup, handles everything, works anywhere  
**Cons:** Takes 10-15 min, requires internet  
**Best for:** Quick testing, first-time builds

### Option B: Local Gradle Build (Faster Once Setup)

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp\android

# Build debug APK (faster)
.\gradlew.bat assembleDebug

# OR build release APK (smaller, optimized)
.\gradlew.bat assembleRelease
```

**Pros:** Takes 5-10 min, works offline, full control  
**Cons:** Requires Android SDK setup, more complex  
**Best for:** Repeated builds, CI/CD pipelines

---

## 📱 Deploy to Phone (2 Minutes)

### Prerequisites
1. **USB Cable** (data, not just charging)
2. **Android Phone** with USB Debugging enabled
3. **APK file** (from build above)

### Steps

```powershell
# 1. Enable USB debugging on phone (Settings → Developer Options)
# 2. Connect phone to PC via USB
# 3. Verify connection
adb devices

# 4. Install APK
adb install -r "path\to\app-debug.apk"

# 5. Done! App appears on home screen
```

**Details:** See [USB_DEPLOYMENT.md](USB_DEPLOYMENT.md)

---

## 📚 Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| **START_HERE.md** | This file | First |
| **QUICK_BUILD.md** | Step-by-step build guide | Building APK |
| **APK_BUILD_GUIDE.md** | Detailed all build methods | Need full details |
| **USB_DEPLOYMENT.md** | Phone installation guide | Deploying to device |
| **build-apk.ps1** | PowerShell build script | Automating builds |
| **build-apk.bat** | Batch build script | Quick builds |

---

## 🛠️ Build Decision Tree

```
Do you want to build an APK?
│
├─ YES, and I want it FAST with NO setup
│  └─ Use EAS Build
│     Command: eas build --platform android --profile preview
│     Time: 10-15 min
│     Go to: QUICK_BUILD.md
│
├─ YES, and I want to build LOCALLY with Android SDK
│  └─ Use Gradle (local)
│     Command: cd android && .\gradlew.bat assembleDebug
│     Time: 5-10 min (after setup)
│     Go to: APK_BUILD_GUIDE.md (Option 2)
│
└─ YES, and I want FULL CONTROL + CI/CD
   └─ Use Gradle with custom scripts
      Command: .\build-apk.ps1 -type release
      Time: Depends
      Go to: APK_BUILD_GUIDE.md (Option 3)
```

---

## ✅ Pre-Flight Checklist

- [x] Node.js v24.18.0 ✓
- [x] npm 11.16.0 ✓
- [x] Java 17 LTS ✓
- [x] Dependencies installed ✓
- [x] Android project generated ✓
- [x] Expo CLI installed ✓
- [x] EAS CLI installed ✓
- [x] eas.json configured ✓
- [x] app.json configured ✓

**Status: READY TO BUILD** 🚀

---

## 🎬 Workflow

### First Time (Complete)
```
1. Choose build method (EAS or Gradle)
2. Build APK (10-15 min or 5-10 min)
3. Download/locate APK file
4. Enable USB Debugging on phone
5. Connect phone via USB
6. Run: adb install app.apk
7. Open Urban Helpers on phone
8. Test features
```

### Subsequent Builds (Faster)
```
1. Make code changes
2. Run build command again
3. adb install -r app.apk (reinstall)
4. Test on phone
```

---

## 🚨 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "eas not found" | EAS not installed | `npm install -g eas-cli` |
| "adb not found" | ADB not in PATH | Add to PATH or use full path |
| "Device offline" | USB debugging not allowed | Tap "Allow" on phone |
| "Installation failed" | Corrupted APK | Rebuild and retry |
| "App crashes" | Missing permissions | Check phone logs with `adb logcat` |
| "Gradle timeout" | First build is slow | Be patient, it gets faster |

**Detailed fixes:** See [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md) Troubleshooting section

---

## 📋 Project Structure

```
c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp/
│
├── 📄 Configuration Files
│   ├── package.json          # NPM dependencies
│   ├── app.json             # Expo/Android config
│   ├── eas.json             # EAS build config
│   ├── babel.config.js      # Babel config
│   ├── nativewind-env.d.ts  # NativeWind types
│   └── tsconfig.json        # TypeScript config
│
├── 📱 Source Code (src/)
│   ├── components/          # Shared UI components
│   ├── navigation/          # Navigation setup
│   ├── screens/             # 44 app screens
│   │   ├── auth/           # Authentication screens
│   │   ├── dashboard/      # Main dashboards
│   │   ├── medical/        # Medical records
│   │   ├── fitness/        # Fitness tracking
│   │   ├── dailyhealth/    # Daily health
│   │   └── dailycare/      # Daily care
│   └── theme/              # Design tokens
│
├── 🤖 Android Project (android/)
│   ├── app/                 # Main app module
│   ├── build.gradle         # Gradle build config
│   ├── gradlew.bat          # Gradle wrapper
│   └── settings.gradle      # Gradle settings
│
├── 📚 Documentation
│   ├── START_HERE.md        # You are here
│   ├── QUICK_BUILD.md       # Quick build guide
│   ├── APK_BUILD_GUIDE.md   # Detailed build guide
│   ├── USB_DEPLOYMENT.md    # Deployment guide
│   └── README.md            # Original project README
│
├── 🔧 Build Scripts
│   ├── build-apk.ps1        # PowerShell build script
│   ├── build-apk.bat        # Batch build script
│   └── node_modules/        # Dependencies (installed)
│
└── 📦 Generated
    └── dist/                # Built APK goes here
```

---

## 🎓 Learning Resources

- **Expo Docs:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/
- **EAS Build:** https://docs.expo.dev/eas/build/
- **Android Debug Bridge:** https://developer.android.com/studio/command-line/adb
- **Gradle Docs:** https://docs.gradle.org/

---

## 🆘 Getting Help

### If EAS Build fails:
1. Check internet connection
2. Verify Expo login: `eas whoami`
3. Check build status: `eas build --status`
4. Read: [QUICK_BUILD.md](QUICK_BUILD.md)

### If Gradle fails:
1. Ensure Android SDK is installed
2. Run: `cd android && .\gradlew.bat clean`
3. Retry build
4. Read: [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md)

### If ADB/phone issues:
1. Enable USB Debugging on phone
2. Try: `adb kill-server` then `adb devices`
3. Reconnect USB cable
4. Read: [USB_DEPLOYMENT.md](USB_DEPLOYMENT.md)

---

## 🎯 Next Steps (Choose One)

### I want to build NOW (EAS - Cloud)
→ Go to: [QUICK_BUILD.md](QUICK_BUILD.md)  
Command: `eas build --platform android --profile preview`

### I want to build LOCALLY (Gradle)
→ Go to: [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md)  
Command: `cd android && .\gradlew.bat assembleDebug`

### I want to deploy to phone
→ Go to: [USB_DEPLOYMENT.md](USB_DEPLOYMENT.md)  
Command: `adb install -r app.apk`

### I want to automate builds
→ Use: `.\build-apk.ps1 -type release`

---

## ✨ What You Can Do With This App

**Screens Included (44 total):**
- 🔐 Authentication (Sign in, Sign up, OTP, Password reset)
- 📊 Dashboards (Home, Health, Fitness, Family, etc.)
- 📋 Medical Records (Lab reports, Blood tests, Prescriptions)
- 💪 Fitness (Gym, Yoga, Steps, Calories, Meditation)
- 🏥 Daily Health (Nutrition, Hydration, Weight, Wellness)
- 🧼 Daily Care (Medicine alarms, Hygiene, Smart reminders)

**Features:**
- Full navigation wired
- Design system applied
- UI-only (no backend yet)
- Ready for API integration

---

## 📈 What's Next?

After building and testing:

1. **Connect Backend:** Add API calls in `src/`
2. **Add Authentication:** Implement real auth
3. **Add Data Persistence:** SQLite or Firebase
4. **Publish to Play Store:** Follow Google Play guidelines
5. **Add iOS:** Use same React Native code
6. **Beta Testing:** Share APK with testers

---

## 🏁 Summary

You have:
- ✅ Complete React Native app source
- ✅ Android project ready
- ✅ Two build methods configured
- ✅ Deployment guides included
- ✅ All tools installed

To build & deploy:
1. Pick a build method (EAS or Gradle)
2. Run the build command
3. Enable USB Debugging on phone
4. Connect via USB
5. Run `adb install app.apk`
6. Test on phone

**Estimated time:** 15-20 minutes for first build, 5-10 min for subsequent

---

## 📞 Support

- **Stuck on build?** → [QUICK_BUILD.md](QUICK_BUILD.md)
- **Stuck on deploy?** → [USB_DEPLOYMENT.md](USB_DEPLOYMENT.md)
- **Need details?** → [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md)
- **Getting technical?** → [README.md](README.md)

---

**Ready? Pick a method above and get started! 🚀**
