# FitDash → Google Play (Capacitor Android)

FitDash is a static web app (no build step). [Capacitor](https://capacitorjs.com/) wraps it in a native Android shell so it can ship on Google Play as `com.sazidabdullah.fitdash`.

`npm run build` copies only the shipped files (`index.html`, `privacy.html`, `manifest.webmanifest`, `service-worker.js`, `css/`, `js/`, `icons/`) into `www/`, which is the Capacitor `webDir`. `dev-tools/` and docs are never bundled.

## 1. One-time setup (your computer)

Install:

- **Node.js 20 LTS** (includes npm) — https://nodejs.org
- **Android Studio** (latest stable) with the Android SDK, SDK Platform 34+ and Build-Tools — https://developer.android.com/studio
- **JDK 17** (bundled with Android Studio as "JetBrains Runtime"; set `JAVA_HOME` to it if Gradle complains)

Then, from the repo root:

```bash
npm install                 # installs @capacitor/cli, core, android
npm run build               # creates www/
npx cap add android         # creates the android/ project (run once, commit it)
npx cap sync android        # copies www/ into android/ and updates plugins
```

> `npx cap add android` only needs to run once. Commit the generated `android/` folder so signing settings and icons are kept.

## 2. Every time the web code changes

```bash
npm run cap:sync            # = npm run build && npx cap sync android
npm run cap:open            # opens android/ in Android Studio
```

Test on a device/emulator with the green **Run ▶** button in Android Studio.

## 3. App icon and splash screen (optional, recommended)

```bash
npm install -D @capacitor/assets
mkdir -p assets && cp icons/icon-512.png assets/icon-only.png
npx capacitor-assets generate --android
npx cap sync android
```

## 4. Create an upload key (once — keep it safe!)

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore fitdash-upload.jks -alias fitdash \
  -keyalg RSA -keysize 2048 -validity 10000
```

Store `fitdash-upload.jks` and its passwords **outside the repo** (e.g. a password manager). Never commit them. With Play App Signing (default), Google holds the real app-signing key and this is only your upload key.

## 5. Build a signed release bundle (.aab) for Google Play

In Android Studio:

1. **Build → Generate Signed App Bundle / APK…**
2. Choose **Android App Bundle** → Next.
3. **Key store path:** `fitdash-upload.jks`, enter the store password, alias `fitdash`, key password → Next.
4. Build variant **release** → **Create**.
5. Output: `android/app/release/app-release.aab` (Android Studio shows a "locate" link).

Command-line alternative (after adding a `signingConfigs.release` block to `android/app/build.gradle` that reads the keystore path and passwords from `~/.gradle/gradle.properties`):

```bash
cd android
./gradlew bundleRelease     # → app/build/outputs/bundle/release/app-release.aab
./gradlew assembleRelease   # → app/build/outputs/apk/release/app-release.apk (for sideloading/testing)
```

Bump `versionCode` (integer, +1 every upload) and `versionName` in `android/app/build.gradle` before each Play upload.

## 6. Firebase setup for the Android app

Cloud sync is optional; without a Firebase config the app runs in Local Guest Mode.

1. Firebase Console → create/select a project → **Build → Authentication** → enable **Email/Password** and **Google**.
2. **Build → Firestore Database** → create database → **Rules** tab → paste `firestore.rules` from this repo → **Publish** (or `firebase deploy --only firestore:rules` with the Firebase CLI).
3. **Project settings → Your apps → Web app** → copy the `firebaseConfig` object.
4. Provide it to the app, either:
   - In the app: **Settings → Account & Cloud Sync → Firebase config** → paste → Save (stored on that device only), or
   - For everyone: add before the other scripts in `index.html`:
     ```html
     <script>window.FITDASH_FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." };</script>
     ```
     (A Firebase web config is not a secret; access is protected by `firestore.rules`.)
5. **Authentication → Settings → Authorized domains** → add `localhost` (Capacitor serves the app from `https://localhost`) and `sazid-abdullah.github.io`.

**Google Sign-In inside the Android app:** FitDash uses Firebase's redirect flow in the Capacitor WebView. Google may block OAuth inside embedded WebViews ("disallowed_useragent"). If that happens, Email/Password sign-in still works; for native Google Sign-In add the community plugin [`@capacitor-firebase/authentication`](https://github.com/capawesome-team/capacitor-firebase/tree/main/packages/authentication) and register the app's SHA-1 (Play Console → App integrity → App signing key certificate) in Firebase → Project settings → Android app.

## 7. Google Play Console checklist

- **App content → Privacy policy:** `https://sazid-abdullah.github.io/Fit-Dash/privacy.html`
- **Data safety:** declare *Personal info (email, name)* and *Health and fitness* data, collected only when the user signs in, encrypted in transit, user can request deletion. No data shared with third parties for ads/analytics. AI Coach requests go directly to the user-chosen provider with the user's own key.
- **Account deletion:** in-app at *Settings → Account & Cloud Sync → Delete Account & All Cloud/Local Data*; web link for the deletion form: the privacy policy's "Deleting your data" section.
- **Health apps declaration:** fitness/nutrition tracking, **not a medical device** (disclaimer shown in-app and in the privacy policy).
- **Target audience:** 13+ (or 18+), not designed for children.
- Upload `app-release.aab` to **Testing → Internal testing** first, then promote to Production.
