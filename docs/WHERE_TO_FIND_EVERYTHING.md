# 📁 Where to Find Everything

Quick reference guide to the Label mobile app codebase.

---

## 🔑 API Keys & Configuration

### WHERE TO ADD YOUR API KEYS:

```
src/config/api.ts
```

**This is the ONLY file you need to edit to add API keys!**

See `API_KEY_SETUP.md` for detailed instructions.

---

## 📂 Project Structure

```
label-mobile/
├── src/
│   ├── config/
│   │   └── api.ts                    ← 🔑 INSERT API KEYS HERE
│   │
│   ├── services/
│   │   ├── aiService.ts              ← AI template generation (OpenAI/Gemini)
│   │   ├── smsService.ts             ← SMS sending (Twilio)
│   │   ├── emailService.ts           ← Email sending (SendGrid)
│   │   ├── mockData.ts               ← Mock data for testing
│   │   └── firebase.ts               ← Firebase initialization (TODO)
│   │
│   ├── types/
│   │   └── index.ts                  ← TypeScript type definitions
│   │
│   ├── theme/
│   │   ├── colors.ts                 ← Theme colors & logo switching
│   │   └── index.ts                  ← Theme configuration
│   │
│   ├── store/
│   │   └── index.ts                  ← Global state (Zustand)
│   │
│   ├── components/
│   │   ├── AppLogo.tsx               ← Logo component (auto switches)
│   │   ├── LeadCard.tsx              ← Lead list item
│   │   └── ...                       ← Reusable components
│   │
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
│   │   ├── notifications/
│   │   │   └── NotificationsScreen.tsx
│   │   ├── settings/
│   │   │   └── SettingsScreen.tsx
│   │   └── admin/
│   │       └── AdminPanelScreen.tsx
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx         ← Main navigation
│   │   ├── AuthStack.tsx             ← Login/Register stack
│   │   └── MainTabs.tsx              ← Bottom tabs
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                ← Auth hook
│   │   ├── useTheme.ts               ← Theme hook
│   │   └── useLeads.ts               ← Leads data hook
│   │
│   ├── utils/
│   │   └── helpers.ts                ← Utility functions
│   │
│   └── assets/
│       └── images/
│           └── logos/
│               ├── label-logo.png           ← Light mode full logo
│               ├── label-white-logo.png     ← Dark mode full logo
│               ├── label-favicon.png        ← Light mode icon
│               └── label-white-favicon.png  ← Dark mode icon
│
├── android/
│   └── app/
│       ├── google-services.json      ← 🔥 Firebase Android config
│       └── ...
│
├── ios/
│   └── LabelApp/
│       ├── GoogleService-Info.plist  ← 🔥 Firebase iOS config
│       └── ...
│
├── App.tsx                           ← Main app entry point
├── app.json                          ← App configuration
├── package.json                      ← Dependencies
└── API_KEY_SETUP.md                  ← API key instructions
```

---

## 🎯 Where to Make Common Changes

### Add/Update API Keys
```
File: src/config/api.ts
Action: Replace empty strings with your keys
```

### Change App Theme Colors
```
File: src/theme/colors.ts
Action: Edit lightTheme and darkTheme objects
```

### Add New Screen
```
Files:
  1. Create screen in src/screens/[category]/[ScreenName].tsx
  2. Add route in src/navigation/[StackName].tsx
```

### Modify Mock Data
```
File: src/services/mockData.ts
Action: Edit MOCK_LEADS, MOCK_TEMPLATES, etc.
```

### Add Firebase Integration
```
File: src/services/firebase.ts (TODO - needs creation)
Action: Initialize Firebase and export auth, firestore, etc.
```

### Change Logo
```
Directory: src/assets/images/logos/
Action: Replace PNG files (keep same names)
```

### Update User Permissions
```
File: src/types/index.ts
Action: Edit Permission interface
```

### Modify State Management
```
File: src/store/index.ts
Action: Edit or add Zustand stores
```

---

## 🔧 Key Files for API Integration

### AI Template Generation
```typescript
// Service implementation
src/services/aiService.ts

// API keys configuration
src/config/api.ts
  - OPENAI_API_KEY
  - GEMINI_API_KEY

// Usage in screens
src/screens/templates/TemplatesScreen.tsx
```

### SMS (Twilio)
```typescript
// Service implementation
src/services/smsService.ts

// API keys configuration
src/config/api.ts
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_PHONE_NUMBER

// Usage in screens
src/screens/dashboard/LeadDetailScreen.tsx
```

### Email (SendGrid)
```typescript
// Service implementation
src/services/emailService.ts

// API keys configuration
src/config/api.ts
  - SENDGRID_API_KEY
  - SENDGRID_FROM_EMAIL
  - SENDGRID_FROM_NAME

// Usage in screens
src/screens/dashboard/LeadDetailScreen.tsx
```

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run tests
npm test

# Type check
npx tsc --noEmit

# Lint code
npx eslint src/
```

---

## 📱 Build Commands

```bash
# Development build
eas build --profile development --platform android
eas build --profile development --platform ios

# Production build
eas build --profile production --platform android
eas build --profile production --platform ios
```

---

## 🔥 Firebase Setup Files

### Android Firebase Config
```
android/app/google-services.json
```

**How to get:**
1. Go to Firebase Console
2. Add Android app
3. Download google-services.json
4. Place in android/app/

### iOS Firebase Config
```
ios/LabelApp/GoogleService-Info.plist
```

**How to get:**
1. Go to Firebase Console
2. Add iOS app
3. Download GoogleService-Info.plist
4. Place in ios/LabelApp/

---

## 📚 Documentation Files

```
/label-mobile/
  API_KEY_SETUP.md               ← How to add API keys (READ THIS FIRST!)
  WHERE_TO_FIND_EVERYTHING.md    ← This file
  README.md                      ← Project overview

/label-app/
  LABEL_APP_ARCHITECTURE.md      ← Complete architecture
  SECURITY_RULES.md              ← Firebase security rules
  CLOUD_FUNCTIONS.md             ← Backend functions
  USER_GUIDE.md                  ← User documentation
  MASTER_ADMIN_GUIDE.md          ← Admin documentation
  API_INTEGRATION_GUIDE.md       ← Detailed API setup
  DEPLOYMENT_GUIDE.md            ← How to deploy
  MVP_ROADMAP.md                 ← Development roadmap
```

---

## 💡 Quick Tips

### 1. Testing Without API Keys

The app works with mock data! Just run it:
```bash
npm start
```

All features will use simulated responses.

### 2. Adding Real APIs

Edit ONE file:
```
src/config/api.ts
```

Paste your keys, save, restart app. Done!

### 3. Changing Logo

Replace files in:
```
src/assets/images/logos/
```

Keep the same filenames. Logo switches automatically based on theme!

### 4. Theme Switching

Theme is controlled by:
```
src/store/index.ts (useThemeStore)
src/theme/colors.ts (theme definitions)
```

### 5. Mock Data

All mock data is in:
```
src/services/mockData.ts
```

Edit this to test different scenarios.

---

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Logo not showing
```bash
# Check files exist
ls src/assets/images/logos/

# Files should be:
# - label-logo.png
# - label-white-logo.png
# - label-favicon.png
# - label-white-favicon.png
```

### API not working
```
1. Check src/config/api.ts has keys
2. Check keys are valid (no spaces, correct format)
3. Check console logs for errors
4. Verify API service has credit/billing
```

### Type errors
```bash
# Run type check
npx tsc --noEmit

# Check src/types/index.ts
```

---

## 📞 Need Help?

1. Check `API_KEY_SETUP.md` for API configuration
2. Check console logs for specific errors
3. Verify file paths match this guide
4. Review documentation in `/label-app/` folder

---

**Remember**: The app works perfectly with mock data. Add API keys only when you're ready to go live!
