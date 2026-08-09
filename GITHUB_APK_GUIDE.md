# How to Build an Android APK for Expo Projects using GitHub Actions

Expo's EAS Build service often has long queue times on the free tier, and building locally on your own machine can be slow and resource-heavy. 

Fortunately, you can use **GitHub Actions** to automatically build your `.apk` file for free every time you push to your repository!

Here is the complete guide to setting up an automated APK build pipeline using GitHub Actions.

---

## Prerequisites

1. Your Expo project must be pushed to a GitHub repository.
2. Your project should have a valid `app.json` configuration.
3. If you want a specific package name, ensure `android.package` is set in your `app.json`.

---

## Step 1: Create the GitHub Workflow File

In your project repository, you need to create a special folder structure for GitHub Actions.

1. At the root of your project, create a folder named `.github`.
2. Inside `.github`, create another folder named `workflows`.
3. Inside `workflows`, create a file named `build-apk.yml`.

The path should look like this:
`.github/workflows/build-apk.yml`

## Step 2: Add the Workflow Configuration

Copy and paste the following code into your `build-apk.yml` file. This script tells GitHub servers to install Node, set up Java and Android environments, prebuild the Expo project, and finally compile the APK.

```yaml
name: Build Android APK

on:
  push:
    branches:
      - main
  workflow_dispatch: # Allows you to trigger the build manually

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: ⚙️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: ☕ Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: 📦 Install dependencies
        run: npm install

      - name: 🏗️ Generate Android project (Prebuild)
        run: npx expo prebuild --platform android

      - name: 🔨 Build APK
        working-directory: android
        run: ./gradlew assembleRelease

      - name: 📤 Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: android/app/build/outputs/apk/release/app-release.apk
```

> [!TIP]
> **Using Yarn?** If your friend uses `yarn` instead of `npm`, they should change `cache: 'npm'` to `cache: 'yarn'` and change `npm install` to `yarn install`.

## Step 3: Push to GitHub

Once the file is saved, commit your changes and push them to your repository:

```bash
git add .
git commit -m "Add GitHub Action to build APK"
git push
```

## Step 4: Download Your APK!

1. Go to your repository page on GitHub.com.
2. Click on the **Actions** tab at the top.
3. You will see a workflow running named **"Build Android APK"**.
4. Click on the running workflow to watch the logs.
5. Once it finishes successfully (usually takes about 3 to 5 minutes), scroll to the bottom of the summary page to the **Artifacts** section.
6. Click on **app-release** to download the ZIP file containing your `.apk`.

---

## Troubleshooting

### "Execution failed for task ':app:signReleaseBundle'"
This action builds a universal, unsigned (debug-key signed) APK which is perfect for testing and sharing with friends. If you need a fully signed APK for the Google Play Store, you will need to add your Keystore file to GitHub Secrets and add the signing variables to the `./gradlew` command.

### Out of Memory Errors
If the Gradle build fails due to memory limitations, you can add a `gradle.properties` file to your root directory with:
`org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m`
