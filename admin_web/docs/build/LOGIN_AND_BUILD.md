# 🚀 Quick Build - Login & Build APK in 5 Minutes

## Step 1: Create Free Expo Account (if needed)

Go to: https://expo.dev

Click "Sign up" and create free account

---

## Step 2: Login to EAS from Terminal

Run in PowerShell:

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp
eas login
```

### What happens:
1. Terminal asks for email
2. Enter your Expo account email
3. Terminal asks for password  
4. Enter your Expo account password
5. You're logged in!

---

## Step 3: Build APK

Run in PowerShell:

```powershell
eas build --platform android --profile preview
```

### What happens:
1. Build starts uploading project to Expo servers
2. Cloud build begins (takes 10-15 minutes)
3. You can close terminal and come back
4. You'll get email with APK download link

---

## Step 4: Deploy to Phone

When APK is ready:

```powershell
# Download APK from email link to your Downloads folder

# Then run:
adb install -r "C:\Users\Vichu\Downloads\app.apk"

# Or replace with your actual APK path
```

---

## ⚡ FASTEST PATH (Right Now)

### Terminal Commands:

```powershell
cd c:\Users\Vichu\OneDrive\Desktop\UrbanHelpersApp

# 1. Login (one-time)
eas login

# 2. Build
eas build --platform android --profile preview

# 3. Wait for email with download link (~15 min)

# 4. Download APK and deploy
adb install -r downloaded-apk-path
```

That's it! 🎉

---

## 📱 Troubleshooting

### "eas login" doesn't work
- Make sure you have internet connection
- Try: `eas login --username your-email@example.com`

### "Build failed"
- Check email for error details
- Run: `eas build --status` to check status
- Make sure dependencies are up to date: `npm install`

### Can't download APK
- Check spam folder for email
- Check your Expo account: https://expo.dev

---

## 🎯 Alternative: Use Existing Account

If you already have Expo account:

```powershell
eas login --username your-email@example.com
```

Or just run `eas login` and enter credentials

---

## Next Steps After APK Ready

1. Download APK from email
2. Connect phone via USB
3. Enable USB Debugging (Settings → Developer Options)
4. Run: `adb install -r app.apk`
5. Done! App on your phone!

---

Ready? Run:
```
eas login
```

Then:
```
eas build --platform android --profile preview
```

🎊 APK builds while you wait!
