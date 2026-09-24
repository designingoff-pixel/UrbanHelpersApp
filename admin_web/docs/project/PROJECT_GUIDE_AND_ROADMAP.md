# Urban Helpers — Comprehensive Build, Progress & Roadmap Guide

---

## 📌 1. Project Overview

**Urban Helpers** is a flagship "Super-App" designed around the **Samsung Health 2026 (Luminous Nocturne `#081826`)** aesthetic. It seamlessly connects personal digital healthcare monitoring (vitals, sleep, nutrition, family care, medical records vault) with professional household management services.

* **Repository:** `https://github.com/designingoff-pixel/UrbanHelpersApp`
* **Target OS:** Android (Primary), iOS
* **Core Tech Stack:** React Native (0.73.6), Expo SDK 50, NativeWind / Tailwind CSS, React Navigation v6, GitHub Actions CI/CD.

---

## 🛠️ 2. How We Build This & See The Result

We established an automated, cloud-based build system using **GitHub Actions** so you never have to deal with complex local Android SDK setups, Gradle memory errors, or long EAS queue wait times.

### 2.1. Cloud Build Flow (GitHub Actions)
1. **Push to `main` branch:** Any code edit pushed to GitHub automatically triggers `.github/workflows/build-apk.yml`.
2. **Environment Setup:** GitHub's cloud runner provisions Node.js 20, Zulu Java 17, and Android SDK 34.
3. **Expo Prebuild & Offline JS Bundling:** 
   - Runs `npx expo prebuild --platform android --clean` to generate the native Android container.
   - Bundles the JavaScript code into `android/app/src/main/assets/index.android.bundle` so the app runs standalone without requiring a local Metro dev server.
4. **Gradle Compilation:** Compiles `app-debug.apk` using `./gradlew assembleDebug`.
5. **Artifact Upload:** Uploads the compiled APK artifact (`app-debug.apk`) to the GitHub Actions run summary page.

### 2.2. Installation & Verification Methods

#### Method A: Direct USB Installation via ADB (Automated / Fast)
Connect your mobile phone to your PC with USB Debugging enabled, then run:
```powershell
# 1. Check connected device
C:\Users\Vichu\platform-tools\adb.exe devices

# 2. Install / Update APK on connected phone
C:\Users\Vichu\platform-tools\adb.exe install -r "C:\Users\Vichu\Downloads\app-debug-36\app-debug.apk"
```

#### Method B: Manual Download from GitHub Actions
1. Navigate to: `https://github.com/designingoff-pixel/UrbanHelpersApp/actions`
2. Log in to your GitHub account (`designingoff-pixel`).
3. Click the latest successful workflow run (marked with a green checkmark ✅).
4. Scroll down to **Artifacts** and click **`app-debug`** to download the ZIP file.
5. Extract `app-debug.apk`, transfer it to your phone, and install!

---

## 📋 3. What Has Been Done So Far

### 3.1. Infrastructure & Build Pipeline Fixes
- ✅ **Fixed Destructive Postinstall Script:** Removed `rm -rf node_modules/expo*` which previously broke Expo prebuilding.
- ✅ **Added Missing Native Dependencies:** Added `expo`, `expo-status-bar`, `expo-linear-gradient`, and `expo-font` required by `@expo/vector-icons` and custom screens.
- ✅ **Offline JavaScript Bundling:** Added an automated bundling step to place `index.android.bundle` inside the APK assets directory, resolving the red *"Unable to load script"* Metro error.
- ✅ **Official Launcher Icon & Splash Screen:** Integrated your official **Urban Helpers City Skyline Emblem** (`urbanhelpers logo.jpg`) as the launcher icon (`assets/icon.png`, `assets/adaptive-icon.png`) and dark splash screen (`assets/splash.png`).
- ✅ **ADB Tools Setup:** Downloaded and configured Google Android Platform Tools (`platform-tools/adb.exe`) locally for 1-click phone deployments.

### 3.2. UI Design System & Screen Flow Implementation
- ✅ **Samsung Health 2026 Aesthetic:** Rebuilt UI elements with the **Luminous Nocturne (`#081826`)** dark theme, solid high-contrast cards, rich linear gradients, and a curved dark bottom navigation bar.
- ✅ **44 Production Screens Across 6 Core Modules:**
  1. **Module 1 — Auth & Onboarding:** Splash, Welcome, Sign In, Create Account, OTP Verification, Create Profile, Forgot Password, System Permissions, Onboarding Health, Onboarding Home Services, Onboarding Family.
  2. **Module 2 — Main Dashboard Hub:** Samsung Health styled Home Dashboard, Health Hub, Discover Marketplace, Fitness Dashboard, Family Dashboard, Medical Records Vault, Medication Center, Emergency Assistance (1-Tap SOS), AI Health Coach, Sleep Dashboard, Nutrition Dashboard.
  3. **Module 3 — Medical Records Vault:** Health Data Analytics (Vitals trends), Lab Reports Hub, Doctor Advice (Teleconsultation), Blood Test Reports, Prescription Management, Vaccination Center.
  4. **Module 4 — Fitness Hub:** Steps Counter (10k gauge), Calories Dashboard, Yoga Sessions, Gym Tracker, Meditation Audio Timer, Physiotherapy Dashboard.
  5. **Module 5 — Daily Health:** Hydration Glass Counter (2.1L/3.0L), Weight Log & BMI, Wellness & Mood Tracker, Advanced Nutrition Breakdown.
  6. **Module 6 — Daily Care:** Medicine Alarm & Snooze, Medicine Adherence History, Smart Reminders, Personal Hygiene Checklist, Health Precautions, Health Companion.
- ✅ **Full Button Navigation Graph:** All cards, banners, header shortcuts, quick tiles, and bottom nav icons are connected to their respective screens.

---

## 🚀 4. How We Move Forward (Roadmap)

To elevate Urban Helpers into a complete, market-ready flagship application, here are the recommended next phases:

### Phase 1: Real-time Data & State Management
- [ ] **Global State (Zustand / Redux Toolkit):** Connect user profile state, health metrics (heart rate, step counts, water intake), and active appointments across all screens dynamically.
- [ ] **Local Persistence (AsyncStorage):** Save logged hydration, medication adherence, and weight logs locally so data persists across app restarts.

### Phase 2: Live Backend & API Integrations
- [ ] **Authentication Services (Firebase / Supabase):** Replace mock auth with real SMS OTP verification, Google Sign-In, and secure user session management.
- [ ] **AI Health Coach Integration (OpenAI API):** Wire the `AICoach` screen to real LLM APIs for live health tips and conversational Q&A.
- [ ] **Emergency SOS Location Tracking:** Integrate `react-native-geolocation` to send real GPS coordinates via SMS to emergency contacts upon tapping the SOS button.

### Phase 3: Service Marketplace (Modules 7 & 8)
- [ ] **Universal Booking Flow:** Re-enable and refine service booking screens for Home Cleaning, RO Maintenance, and Appliance Repair with date/time pickers and payment gateway integration (Stripe / Razorpay).
- [ ] **Live Technician Tracking:** Add interactive maps (`react-native-maps`) to show live technician arrival times.

### Phase 4: Production Release & Store Deployment
- [ ] **Keystore Signing:** Set up an Android Release Keystore (`.jks`) to build a signed production AAB (`.aab`) file.
- [ ] **Play Store & App Store Deployment:** Automate deployment to Google Play Console and Apple TestFlight via GitHub Actions.

---

*Guide generated for Urban Helpers App — Version 1.0.0*
