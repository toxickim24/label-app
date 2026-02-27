# Firebase Setup Guide for Beginners

A complete step-by-step guide to set up Firebase in your Label App.

## 📚 Table of Contents

1. [What is Firebase?](#what-is-firebase)
2. [Prerequisites](#prerequisites)
3. [Creating a Firebase Project](#creating-a-firebase-project)
4. [Setting Up Android](#setting-up-android)
5. [Setting Up iOS](#setting-up-ios)
6. [Testing Your Setup](#testing-your-setup)
7. [Using Firebase in Your App](#using-firebase-in-your-app)
8. [Troubleshooting](#troubleshooting)

---

## What is Firebase?

Firebase is Google's platform for building mobile and web applications. It provides:

- **Authentication** - User login/signup with email, Google, Facebook, etc.
- **Firestore Database** - Store and sync data in real-time
- **Cloud Functions** - Run backend code without managing servers
- **Cloud Messaging** - Send push notifications to users
- **Storage** - Store images, videos, and files
- **Analytics** - Track user behavior

**In simple terms:** Firebase is like a ready-made backend for your app, so you don't have to build everything from scratch!

---

## Prerequisites

Before you start, make sure you have:

- ✅ A Google account (Gmail)
- ✅ Your Label App project set up
- ✅ Node.js and npm installed
- ✅ Expo CLI installed

---

## Creating a Firebase Project

### Step 1: Go to Firebase Console

1. Open your web browser
2. Go to: https://console.firebase.google.com
3. Click **"Get Started"** or **"Add Project"**

### Step 2: Create Your Project

1. **Enter project name**: `Label App` (or any name you prefer)
2. Click **"Continue"**

3. **Google Analytics**:
   - Choose "Enable Google Analytics" (recommended)
   - Click **"Continue"**

4. **Analytics Account**:
   - Select "Default Account for Firebase" or create a new one
   - Click **"Create Project"**

5. **Wait** for Firebase to set up your project (30-60 seconds)

6. Click **"Continue"** when ready

🎉 **Congratulations!** Your Firebase project is created!

---

## Setting Up Android

### Step 1: Add Android App to Firebase

1. In Firebase Console, click the **Android icon** (looks like a robot)
2. You'll see "Add Firebase to your Android app" page

### Step 2: Register Your App

Fill in these details:

**Android package name**: `com.labelapp.mobile`
- ⚠️ **IMPORTANT**: This must match EXACTLY the package name in your `app.json`
- In your app, it's: `com.labelapp.mobile`
- Copy and paste it to avoid typos!

**App nickname** (optional): `Label App Android`

**Debug signing certificate** (optional): Leave empty for now

Click **"Register app"**

### Step 3: Download Config File

1. Click **"Download google-services.json"**
2. A file will download to your computer

### Step 4: Add Config File to Your Project

**Using File Explorer (Windows):**

1. Open File Explorer
2. Navigate to your project folder: `C:\wamp64\www\label-app`
3. Open the `android` folder
4. Open the `app` folder
5. **Copy** the downloaded `google-services.json` file here
6. The final path should be: `C:\wamp64\www\label-app\android\app\google-services.json`

**OR using Command Line:**

```bash
# From your project root
cd C:\wamp64\www\label-app
mv ~/Downloads/google-services.json android/app/
```

### Step 5: Skip Firebase SDK Steps

Firebase Console will show you some code to add. **You can skip this!**

Why? Because we've already added all the necessary packages to your app.

Click **"Next"** → **"Continue to Console"**

✅ **Android setup complete!**

---

## Setting Up iOS

### Step 1: Add iOS App to Firebase

1. In Firebase Console, click the **iOS icon** (looks like an apple)
2. You'll see "Add Firebase to your Apple app" page

### Step 2: Register Your App

Fill in these details:

**iOS bundle ID**: `com.labelapp.mobile`
- ⚠️ **IMPORTANT**: Must match your Android package name
- In your app, it's: `com.labelapp.mobile`

**App nickname** (optional): `Label App iOS`

**App Store ID** (optional): Leave empty for now

Click **"Register app"**

### Step 3: Download Config File

1. Click **"Download GoogleService-Info.plist"**
2. A file will download to your computer

### Step 4: Generate iOS Folder

**First, generate the iOS native folder:**

```bash
# Make sure you're in your project directory
cd C:\wamp64\www\label-app

# Generate iOS folder
npx expo prebuild
```

This will create an `ios` folder in your project.

### Step 5: Add Config File to Your Project

1. Open File Explorer
2. Navigate to: `C:\wamp64\www\label-app\ios`
3. **Copy** the downloaded `GoogleService-Info.plist` file here
4. The final path should be: `C:\wamp64\www\label-app\ios\GoogleService-Info.plist`

### Step 6: Skip Firebase SDK Steps

Click **"Next"** → **"Continue to Console"**

✅ **iOS setup complete!**

---

## Testing Your Setup

### Test 1: Verify Configuration Files

Run this command to check your setup:

```bash
node test-firebase.js
```

You should see:

```
✅ android/app/google-services.json found
✅ Firebase plugins configured in app.json
✅ Firebase packages installed
```

### Test 2: Build and Run on Android

**Option A: Using Android Emulator**

1. Open Android Studio
2. Start an Android emulator
3. Run:
   ```bash
   npx expo run:android
   ```

**Option B: Using Physical Android Device**

1. Enable Developer Mode on your phone
2. Connect phone to computer via USB
3. Enable USB Debugging
4. Run:
   ```bash
   npx expo run:android
   ```

**Look for Firebase logs:**

When the app starts, check the terminal for:
```
✅ Firebase connected successfully!
```

### Test 3: Build and Run on iOS (Mac only)

```bash
npx expo run:ios
```

---

## Using Firebase in Your App

### Authentication Example

```typescript
import { auth } from './src/config/firebase';

// Sign up a new user
const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    console.log('User created:', userCredential.user.uid);
  } catch (error) {
    console.error('Sign up error:', error);
  }
};

// Sign in existing user
const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    console.log('User signed in:', userCredential.user.uid);
  } catch (error) {
    console.error('Sign in error:', error);
  }
};

// Sign out
const signOut = async () => {
  try {
    await auth().signOut();
    console.log('User signed out');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};
```

### Firestore Database Example

```typescript
import { firestore } from './src/config/firebase';

// Add a document
const addLead = async (leadData: any) => {
  try {
    const docRef = await firestore().collection('leads').add({
      ...leadData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log('Lead added with ID:', docRef.id);
  } catch (error) {
    console.error('Error adding lead:', error);
  }
};

// Get all documents
const getLeads = async () => {
  try {
    const snapshot = await firestore().collection('leads').get();
    const leads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('Leads:', leads);
    return leads;
  } catch (error) {
    console.error('Error getting leads:', error);
  }
};

// Real-time listener
const listenToLeads = () => {
  const unsubscribe = firestore()
    .collection('leads')
    .onSnapshot(snapshot => {
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Leads updated:', leads);
    });

  // Call unsubscribe() when you want to stop listening
  return unsubscribe;
};
```

### Cloud Messaging (Push Notifications) Example

```typescript
import { messaging, initializeMessaging } from './src/config/firebase';

// Get FCM token
const setupNotifications = async () => {
  const token = await initializeMessaging();
  console.log('FCM Token:', token);
  // Save this token to your database for sending notifications
};

// Listen for messages
messaging().onMessage(async remoteMessage => {
  console.log('Message received:', remoteMessage);
  // Show notification to user
});
```

---

## Troubleshooting

### Problem: "google-services.json not found"

**Solution:**
1. Make sure the file is in the correct location: `android/app/google-services.json`
2. The filename must be exactly `google-services.json` (lowercase, with hyphen)
3. Re-download from Firebase Console if needed

### Problem: "Package name doesn't match"

**Solution:**
1. Check `app.json` - look for `"package": "com.labelapp.mobile"`
2. Go to Firebase Console → Project Settings → Your Apps
3. Make sure the package name matches exactly
4. If wrong, delete the app in Firebase and create a new one with correct package name

### Problem: "Firebase not connecting"

**Solution:**
1. Make sure you ran `npx expo run:android` (not just `npx expo start`)
2. Firebase only works in native builds, not in Expo Go
3. Check your internet connection
4. Rebuild the app: `npx expo run:android --clear`

### Problem: "Module not found: @react-native-firebase/app"

**Solution:**
```bash
# Reinstall Firebase packages
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore

# Rebuild
npx expo run:android
```

### Problem: "iOS build fails"

**Solution:**
1. Make sure you ran `npx expo prebuild` first
2. Check that `GoogleService-Info.plist` is in the `ios` folder (not `ios/YourAppName/`)
3. Try cleaning and rebuilding:
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   npx expo run:ios
   ```

### Problem: "Permission denied" on Android

**Solution:**

Some Firebase features need permissions. Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ]
    }
  }
}
```

---

## Next Steps

Now that Firebase is set up, you can:

1. **Enable Authentication**:
   - Go to Firebase Console → Authentication
   - Click "Get Started"
   - Enable Email/Password sign-in method

2. **Create Firestore Database**:
   - Go to Firebase Console → Firestore Database
   - Click "Create Database"
   - Start in "Test Mode" (for development)

3. **Set Up Cloud Functions**:
   - Follow the [Cloud Functions Guide](./CLOUD_FUNCTIONS.md)

4. **Enable Push Notifications**:
   - Go to Firebase Console → Cloud Messaging
   - Follow setup wizard

---

## Useful Resources

### Official Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io)
- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)

### Video Tutorials
- [Firebase for Beginners](https://www.youtube.com/results?search_query=firebase+tutorial+react+native)
- [React Native Firebase Tutorial](https://www.youtube.com/results?search_query=react+native+firebase+authentication)

### Get Help
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow - Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)
- [React Native Firebase GitHub Issues](https://github.com/invertase/react-native-firebase/issues)

---

## Summary Checklist

Before moving forward, make sure you have:

- ✅ Created Firebase project in Firebase Console
- ✅ Added Android app with package name `com.labelapp.mobile`
- ✅ Downloaded and placed `google-services.json` in `android/app/`
- ✅ (Optional) Added iOS app and placed `GoogleService-Info.plist` in `ios/`
- ✅ Ran `node test-firebase.js` successfully
- ✅ Built and tested app with `npx expo run:android`
- ✅ Saw "Firebase connected successfully!" in logs

🎉 **You're ready to build amazing features with Firebase!**

---

**Need help?** Check the [Troubleshooting](#troubleshooting) section or ask your team!
