# Label App - Complete Deployment Guide

## Overview

This guide covers complete deployment of the Label mobile application for both Android and iOS platforms using React Native and Expo.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Logo Integration](#logo-integration)
4. [Firebase Configuration](#firebase-configuration)
5. [Build Configuration](#build-configuration)
6. [Android Deployment](#android-deployment)
7. [iOS Deployment](#ios-deployment)
8. [Cloud Functions Deployment](#cloud-functions-deployment)
9. [Testing](#testing)
10. [CI/CD Setup](#cicd-setup)
11. [Production Checklist](#production-checklist)

---

## Prerequisites

### Development Environment

**Required Tools:**

```bash
# Node.js 18+
node --version  # Should be v18.x or higher

# npm or yarn
npm --version   # 9.x or higher

# Git
git --version

# Firebase CLI
npm install -g firebase-tools
firebase --version  # 13.x or higher

# Expo CLI
npm install -g expo-cli
expo --version

# EAS CLI (Expo Application Services)
npm install -g eas-cli
eas --version
```

**Platform-Specific:**

**For iOS Development:**
- macOS (required for iOS builds)
- Xcode 15+ (from Mac App Store)
- iOS Simulator
- Apple Developer Account ($99/year)
- CocoaPods: `sudo gem install cocoapods`

**For Android Development:**
- Android Studio
- Android SDK (API 33+)
- Java Development Kit (JDK 11+)
- Android Emulator or physical device
- Google Play Developer Account ($25 one-time)

---

## Project Setup

### 1. Initialize React Native Project with Expo

```bash
# Navigate to project directory
cd C:\wamp64\www\label-app

# Initialize Expo project
npx create-expo-app label-mobile --template blank-typescript

cd label-mobile

# Install dependencies
npm install
```

### 2. Install Required Packages

```bash
# Firebase
npm install @react-native-firebase/app \
  @react-native-firebase/auth \
  @react-native-firebase/firestore \
  @react-native-firebase/messaging \
  @react-native-firebase/functions

# Navigation
npm install @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context

# UI Components
npm install react-native-paper \
  react-native-vector-icons

# State Management
npm install zustand \
  @tanstack/react-query

# Utilities
npm install axios \
  date-fns \
  libphonenumber-js

# Storage
npm install @react-native-async-storage/async-storage

# Biometrics
npm install react-native-biometrics

# Dev Dependencies
npm install --save-dev @types/react-native-vector-icons
```

### 3. Project Structure

```
label-mobile/
├── app.json
├── package.json
├── tsconfig.json
├── eas.json
├── firebase.json
├── .firebaserc
├── src/
│   ├── assets/
│   │   └── images/
│   │       └── logos/
│   │           ├── label-logo.png
│   │           ├── label-white-logo.png
│   │           ├── label-favicon.png
│   │           └── label-white-favicon.png
│   ├── components/
│   │   ├── AppLogo.tsx
│   │   ├── LeadCard.tsx
│   │   └── ...
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ResetPasswordScreen.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardScreen.tsx
│   │   │   └── LeadDetailScreen.tsx
│   │   ├── templates/
│   │   │   └── TemplatesScreen.tsx
│   │   ├── settings/
│   │   │   └── SettingsScreen.tsx
│   │   └── admin/
│   │       └── AdminPanelScreen.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   └── MainTabs.tsx
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── messaging.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useLeads.ts
│   ├── store/
│   │   └── index.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
├── android/
│   └── app/
│       ├── build.gradle
│       ├── google-services.json
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml
│               └── res/
│                   ├── mipmap-*/
│                   └── values/
│                       └── strings.xml
├── ios/
│   └── LabelApp/
│       ├── GoogleService-Info.plist
│       ├── Info.plist
│       └── Images.xcassets/
│           └── AppIcon.appiconset/
└── functions/
    ├── src/
    │   └── index.ts
    └── package.json
```

---

## Logo Integration

### 1. Prepare Logo Files

Move logo files from `/logo` to proper locations:

```bash
# Create assets directory
mkdir -p src/assets/images/logos

# Copy logos
cp ../logo/label-logo.png src/assets/images/logos/
cp ../logo/label-white-logo.png src/assets/images/logos/
cp ../logo/label-favicon.png src/assets/images/logos/
cp ../logo/label-white-favicon.png src/assets/images/logos/
```

### 2. Generate App Icons

**Install Image Processing Tool:**

```bash
npm install -g @expo/image-utils
```

**Generate Icons:**

```bash
# Use label-favicon.png as base (1024x1024)
npx expo-optimize

# Or use expo-cli
expo customize:schema
```

**Manually Configure in app.json:**

```json
{
  "expo": {
    "icon": "./src/assets/images/logos/label-favicon.png",
    "splash": {
      "image": "./src/assets/images/logos/label-logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "icon": "./src/assets/images/logos/label-favicon.png"
    },
    "android": {
      "icon": "./src/assets/images/logos/label-favicon.png",
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/images/logos/label-favicon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

### 3. Android Icon Setup

**Generate all densities:**

```bash
# Install sharp for image processing
npm install sharp

# Create script: scripts/generate-icons.js
node scripts/generate-icons.js
```

**generate-icons.js:**

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const inputFile = 'src/assets/images/logos/label-favicon.png';

Object.entries(sizes).forEach(([folder, size]) => {
  const outputDir = `android/app/src/main/res/${folder}`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  sharp(inputFile)
    .resize(size, size)
    .toFile(`${outputDir}/ic_launcher.png`)
    .then(() => console.log(`Generated ${folder}/ic_launcher.png`));

  sharp(inputFile)
    .resize(size, size)
    .toFile(`${outputDir}/ic_launcher_round.png`)
    .then(() => console.log(`Generated ${folder}/ic_launcher_round.png`));
});
```

**Run:**
```bash
node scripts/generate-icons.js
```

### 4. iOS Icon Setup

**Add to Assets.xcassets:**

1. Open Xcode
2. Navigate to `ios/LabelApp/Images.xcassets`
3. Right-click > New iOS App Icon
4. Drag & drop label-favicon.png
5. Xcode auto-generates all sizes

**Or use command:**

```bash
# Install iconset tool
npm install -g app-icon

# Generate iconset
app-icon generate -i src/assets/images/logos/label-favicon.png -o ios/LabelApp/Images.xcassets/AppIcon.appiconset
```

### 5. Splash Screen

**Android:**

Edit `android/app/src/main/res/values/styles.xml`:

```xml
<style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
  <item name="android:windowBackground">@drawable/splash_screen</item>
</style>
```

Create `android/app/src/main/res/drawable/splash_screen.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@android:color/white"/>
  <item>
    <bitmap
      android:src="@drawable/splash_logo"
      android:gravity="center"/>
  </item>
</layer-list>
```

**iOS:**

Use Storyboard or configure in Info.plist:

```xml
<key>UILaunchStoryboardName</key>
<string>SplashScreen</string>
```

---

## Firebase Configuration

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Name: "Label App"
4. Enable Google Analytics (recommended)
5. Create project

### 2. Add Android App

1. Project Overview > **Add app** > **Android**
2. Android package name: `com.labelapp.mobile`
3. App nickname: "Label Android"
4. Download **google-services.json**
5. Place in: `android/app/google-services.json`

### 3. Add iOS App

1. Project Overview > **Add app** > **iOS**
2. iOS bundle ID: `com.labelapp.mobile`
3. App nickname: "Label iOS"
4. Download **GoogleService-Info.plist**
5. Place in: `ios/LabelApp/GoogleService-Info.plist`

### 4. Firebase SDK Setup

**Android gradle configuration:**

`android/build.gradle`:
```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

`android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
  implementation platform('com.google.firebase:firebase-bom:32.7.0')
}
```

**iOS CocoaPods:**

`ios/Podfile`:
```ruby
platform :ios, '13.0'

target 'LabelApp' do
  use_react_native!

  pod 'Firebase/Core'
  pod 'Firebase/Auth'
  pod 'Firebase/Firestore'
  pod 'Firebase/Messaging'
  pod 'Firebase/Functions'
end
```

Install:
```bash
cd ios
pod install
cd ..
```

### 5. Initialize Firebase in App

`src/services/firebase.ts`:

```typescript
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';

// Auto-configured from google-services.json and GoogleService-Info.plist

// Enable Firestore offline persistence
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
});

// Connect to emulators in development
if (__DEV__) {
  auth().useEmulator('http://localhost:9099');
  firestore().useEmulator('localhost', 8080);
  functions().useEmulator('localhost', 5001);
}

export { auth, firestore, messaging, functions };
```

---

## Build Configuration

### 1. Configure app.json

```json
{
  "expo": {
    "name": "Label",
    "slug": "label-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/images/logos/label-favicon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./src/assets/images/logos/label-logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "bundleIdentifier": "com.labelapp.mobile",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "Allow Label to access your camera for profile photos.",
        "NSPhotoLibraryUsageDescription": "Allow Label to access your photos.",
        "UIBackgroundModes": [
          "remote-notification"
        ]
      },
      "config": {
        "googleSignIn": {
          "reservedClientId": "com.googleusercontent.apps.YOUR_CLIENT_ID"
        }
      }
    },
    "android": {
      "package": "com.labelapp.mobile",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/images/logos/label-favicon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "INTERNET",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "VIBRATE",
        "USE_FINGERPRINT",
        "USE_BIOMETRIC"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/firestore",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          },
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

### 2. Configure EAS Build

```bash
# Initialize EAS
eas build:configure
```

**eas.json:**

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildType": "archive"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      }
    }
  }
}
```

---

## Android Deployment

### 1. Development Build

```bash
# Run on emulator
npx expo run:android

# Or with EAS
eas build --profile development --platform android
```

### 2. Generate Signing Key

```bash
cd android/app

# Generate keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore label-release-key.keystore \
  -alias label-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000

# Save password securely!
```

### 3. Configure Signing

**android/gradle.properties:**

```properties
MYAPP_RELEASE_STORE_FILE=label-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=label-key-alias
MYAPP_RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

**android/app/build.gradle:**

```gradle
android {
  signingConfigs {
    release {
      if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
        storeFile file(MYAPP_RELEASE_STORE_FILE)
        storePassword MYAPP_RELEASE_STORE_PASSWORD
        keyAlias MYAPP_RELEASE_KEY_ALIAS
        keyPassword MYAPP_RELEASE_KEY_PASSWORD
      }
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
  }
}
```

### 4. Build Production APK/AAB

**Using EAS (Recommended):**

```bash
# Build App Bundle (for Play Store)
eas build --platform android --profile production

# Build APK (for testing)
eas build --platform android --profile preview
```

**Using Gradle:**

```bash
cd android

# Build AAB
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab

# Build APK
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### 5. Test Release Build

```bash
# Install APK on device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or with bundle
bundletool build-apks --bundle=app-release.aab --output=app.apks
bundletool install-apks --apks=app.apks
```

### 6. Google Play Console Setup

1. Go to https://play.google.com/console
2. Create app: **Label**
3. Fill app details:
   - App name: Label
   - Default language: English (US)
   - App/Game: App
   - Free/Paid: Free

**Store Listing:**
- Short description (80 chars)
- Full description (4000 chars)
- Screenshots (2-8 images)
- Feature graphic (1024x500)
- App icon (already configured)

**Content Rating:**
- Complete questionnaire
- Get rating certificate

**App Content:**
- Privacy policy URL
- Data safety form
- Target audience

**Release:**
1. Production > Create new release
2. Upload AAB file
3. Add release notes
4. Review and publish

---

## iOS Deployment

### 1. Development Build

```bash
# Run on simulator
npx expo run:ios

# Or with EAS
eas build --profile development --platform ios
```

### 2. Apple Developer Account Setup

1. Visit https://developer.apple.com
2. Enroll in Apple Developer Program ($99/year)
3. Create App ID:
   - Identifier: `com.labelapp.mobile`
   - Name: Label
   - Capabilities: Push Notifications

### 3. Certificates & Provisioning

**Using EAS (Automatic):**

```bash
eas build --platform ios --profile production

# EAS handles certificates automatically
```

**Manual Setup:**

1. **Create Certificate:**
   - Keychain Access > Certificate Assistant > Request Certificate
   - Save CSR file
   - Upload to developer.apple.com
   - Download certificate
   - Install in Keychain

2. **Create Provisioning Profile:**
   - developer.apple.com > Profiles
   - Create new (Distribution)
   - Select App ID
   - Select certificate
   - Download and install

### 4. Configure Xcode

Open `ios/LabelApp.xcworkspace` in Xcode:

1. **General Tab:**
   - Bundle Identifier: `com.labelapp.mobile`
   - Version: 1.0.0
   - Build: 1
   - Team: Select your team

2. **Signing & Capabilities:**
   - Automatically manage signing: ON
   - Team: Your team
   - Add capabilities:
     - Push Notifications
     - Background Modes > Remote notifications

3. **Build Settings:**
   - Code Signing Identity: iOS Distribution
   - Provisioning Profile: Match profile

### 5. Build Production IPA

**Using EAS (Recommended):**

```bash
# Build for App Store
eas build --platform ios --profile production

# Download IPA when complete
eas build:download --platform ios
```

**Using Xcode:**

1. Product > Archive
2. Wait for build to complete
3. Organizer opens with archive
4. Click **Distribute App**
5. Choose **App Store Connect**
6. Follow wizard

### 6. App Store Connect Setup

1. Go to https://appstoreconnect.apple.com
2. My Apps > **+ New App**
3. Fill details:
   - Name: Label
   - Bundle ID: com.labelapp.mobile
   - SKU: label-app-001
   - Primary Language: English (US)

**App Information:**
- Category: Business
- Privacy Policy URL
- Copyright

**Pricing & Availability:**
- Price: Free
- Availability: All countries

**App Store Listing:**
- Screenshots (Required for each device size)
- Description (4000 chars)
- Keywords (100 chars)
- Support URL
- Marketing URL

**Build:**
1. TestFlight > Add build
2. Upload IPA via EAS or Xcode
3. Wait for processing (~10 mins)
4. Add to TestFlight (optional internal testing)
5. Submit for App Review

**App Review Information:**
- Contact info
- Demo account credentials (if login required)
- Notes for reviewer

### 7. Submit for Review

1. Complete all sections
2. Add for review
3. Wait for approval (typically 24-48 hours)
4. Address any feedback
5. Once approved, manually release or auto-release

---

## Cloud Functions Deployment

### 1. Initialize Firebase Functions

```bash
cd label-app
firebase init functions

# Select:
# - JavaScript or TypeScript (choose TypeScript)
# - Install dependencies: Yes
```

### 2. Set Secrets

```bash
# Set all API keys (see API Integration Guide)
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_PHONE_NUMBER
firebase functions:secrets:set SENDGRID_API_KEY
firebase functions:secrets:set SENDGRID_FROM_EMAIL
firebase functions:secrets:set SENDGRID_FROM_NAME
```

### 3. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:generateTemplate

# View deployment
firebase functions:log
```

### 4. Deploy Firestore Rules

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 5. Set Up Scheduled Functions (if needed)

```typescript
// functions/src/scheduled/cleanupOldData.ts
import * as functions from 'firebase-functions/v2';

export const cleanupOldNotifications = functions.scheduler
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Clean up old notifications
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    // Delete logic...
  });
```

Deploy:
```bash
firebase deploy --only functions:cleanupOldNotifications
```

---

## Testing

### 1. Unit Tests

```bash
# Install testing libraries
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

### 2. Integration Tests

Use Firebase Emulators:

```bash
# Start emulators
firebase emulators:start

# Run tests against emulators
npm run test:integration
```

### 3. E2E Tests

```bash
# Install Detox
npm install --save-dev detox

# Configure and run
detox test --configuration ios.sim.debug
```

### 4. Beta Testing

**Android (Firebase App Distribution):**

```bash
# Upload APK
firebase appdistribution:distribute \
  app-release.apk \
  --app YOUR_ANDROID_APP_ID \
  --groups "beta-testers"
```

**iOS (TestFlight):**

1. Upload build via EAS or Xcode
2. App Store Connect > TestFlight
3. Add internal testers (up to 100)
4. Add external testers (needs Apple review)
5. Send invites

---

## CI/CD Setup

### GitHub Actions

**.github/workflows/build.yml:**

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android
        run: eas build --platform android --non-interactive --no-wait

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build iOS
        run: eas build --platform ios --non-interactive --no-wait

  deploy-functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## Production Checklist

### Pre-Launch

- [ ] All API keys configured and tested
- [ ] Firebase security rules deployed
- [ ] Cloud Functions deployed and working
- [ ] App icons and splash screens configured
- [ ] Privacy Policy and Terms published
- [ ] Test on multiple devices (iOS & Android)
- [ ] Performance optimization complete
- [ ] Crash reporting enabled (Firebase Crashlytics)
- [ ] Analytics configured
- [ ] Push notifications tested
- [ ] Deep linking configured
- [ ] App Store and Play Store listings complete
- [ ] Beta testing complete with feedback addressed
- [ ] Legal compliance verified (GDPR, CCPA, etc.)
- [ ] Backup and disaster recovery plan

### Post-Launch

- [ ] Monitor crash reports
- [ ] Review user feedback
- [ ] Track analytics
- [ ] Monitor API usage and costs
- [ ] Set up alerts for critical errors
- [ ] Plan OTA (Over-The-Air) updates via Expo
- [ ] Schedule regular security audits
- [ ] Monitor app store reviews and ratings

---

This completes the deployment guide. Your Label app is ready for production launch on both iOS and Android platforms.
