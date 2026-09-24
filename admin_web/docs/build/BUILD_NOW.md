# BUILD APK NOW - Two Methods

## Method 1: EAS Build (Cloud) - RECOMMENDED ✅

### Why Use EAS?
- No Android SDK needed
- Handles all Expo module compatibility automatically
- Works perfectly for this project
- Takes 10-15 minutes
- Free tier: 30 builds/month

### Steps to Build:

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp

# Step 1: Login to Expo (one-time only)
eas login
```

When prompted:
- Email: Enter your email
- Password: Create a password (or use existing Expo account)

```powershell
# Step 2: Build the APK
eas build --platform android --profile preview
```

This starts a cloud build. Your build will:
1. Upload project to Expo servers
2. Build APK on their infrastructure (~10-15 min)
3. Give you a download link
4. Save APK to your Downloads folder

**Output:** APK file (~60-70 MB)

### After Build:
```powershell
# Deploy to phone
adb install -r "path-to-downloaded-apk"
```

---

## Method 2: Download Pre-built APK Option

If you don't want to set up Expo account, you can:

1. Use a pre-configured build service (Firebase App Distribution)
2. Contact the developer for a pre-built APK
3. Use alternative tools like Cordova or React Native CLI

---

## Manual Build Option (Advanced)

If you want to build locally WITHOUT EAS:

### Requirements:
- Android SDK installed (~5 GB)
- Gradle configured
- Java JDK

### Note:
The current gradle configuration has Expo module compatibility issues that require:
1. Downgrading or updating Expo packages
2. Configuring native build parameters
3. Manual dependency resolution

**This is complex.** EAS Build (Method 1) handles all of this automatically.

---

## Recommended Path:

### 🚀 FASTEST (10-15 min):
1. Run: `eas login`
2. Run: `eas build --platform android --profile preview`
3. Download APK
4. Deploy with ADB

### ⏳ ALTERNATIVE (if no Expo account):
Use online APK builders or request pre-built APK

---

## Troubleshooting EAS Build

### "eas not found"
```powershell
npm install -g eas-cli
```

### "Not logged in"
```powershell
eas login
```

### "Build failed"
- Check email for error details
- Run: `eas build --status` to check status
- Common fix: `npm install` (update dependencies)

### "Build takes too long"
- Normal on busy days (server queue)
- You'll get email when done
- Check status: `eas build --status`

---

## After You Have the APK:

```powershell
# Verify phone is connected
adb devices

# Install APK
adb install -r "C:\path\to\app.apk"

# If already installed, force reinstall
adb install -r app.apk

# Launch app
adb shell am start -n com.urbanhelpers.app/.MainActivity
```

---

## Next Steps:

1. **Choose Method 1 (EAS):**
   ```powershell
   eas login
   eas build --platform android --profile preview
   ```

2. **Wait for build** (you'll get email with download link)

3. **Deploy to phone:**
   ```powershell
   adb install -r downloaded-apk-path
   ```

4. **Test on device** - All 44 screens ready!

---

**Ready? Open terminal and run:**
```
eas login
```

Then follow the prompts!
