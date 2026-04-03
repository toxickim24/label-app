# Label App - Comprehensive Testing Guide

**Last Updated**: April 3, 2026

This guide covers all testing procedures for the Label App across web, iOS, and Android platforms.

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Web Testing](#web-testing)
3. [iOS Testing](#ios-testing)
4. [Android Testing](#android-testing)
5. [Feature Testing Checklist](#feature-testing-checklist)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Accessibility Testing](#accessibility-testing)
9. [Regression Testing](#regression-testing)
10. [Known Issues](#known-issues)

---

## Testing Overview

### Testing Environments

- **Development**: `http://localhost:8082` (Web)
- **Staging**: Firebase Hosting staging channel
- **Production**: App Store, Google Play, Production web

### Testing Tools

- **Web**: Chrome DevTools, Firefox DevTools, React DevTools
- **iOS**: Xcode Simulator, TestFlight, Physical devices
- **Android**: Android Emulator, Physical devices
- **Automation**: Jest, React Native Testing Library
- **Performance**: Lighthouse, React DevTools Profiler
- **Analytics**: Firebase Analytics, Crashlytics

---

## Web Testing

### Browser Compatibility

Test on the following browsers:

- [x] **Chrome** (v120+) - Primary browser
- [ ] **Firefox** (v120+)
- [ ] **Safari** (v17+)
- [ ] **Edge** (v120+)

### Viewport Testing

- [x] **Mobile** (375px - 480px)
- [x] **Tablet** (768px - 1024px)
- [x] **Desktop** (1280px+)

### Web-Specific Features

#### Theme Switching
- [x] Dark mode displays correctly
- [x] Light mode displays correctly
- [x] Theme persists on refresh
- [x] No flash of wrong theme on load

#### Responsive Design
- [x] Dashboard adapts to screen size
- [x] Lead cards stack properly on mobile
- [x] Navigation is accessible on all sizes
- [x] Touch targets are adequate (44px minimum)

#### Performance
- [x] Initial load < 3 seconds
- [x] React components properly memoized
- [x] No memory leaks
- [ ] Bundle size optimized
- [ ] Images lazy loaded

---

## iOS Testing

### Device Compatibility

Test on the following devices:

- [ ] **iPhone SE** (4.7" - 1334x750)
- [ ] **iPhone 12/13/14** (6.1" - 2532x1170)
- [ ] **iPhone 14 Pro Max** (6.7" - 2796x1290)
- [ ] **iPad** (10.2" - 2160x1620)
- [ ] **iPad Pro** (12.9" - 2732x2048)

### iOS Version Support

- [ ] iOS 15.0+
- [ ] iOS 16.0+
- [ ] iOS 17.0+ (Latest)

### iOS-Specific Features

#### Push Notifications
- [ ] Notification permission prompt appears
- [ ] Daily notification at 8 AM works
- [ ] Stale lead notifications trigger correctly
- [ ] Tapping notification opens app
- [ ] Badge count updates properly
- [ ] Sound plays on notification

#### Biometrics
- [ ] Face ID works (if implemented)
- [ ] Touch ID works (if implemented)

#### App Lifecycle
- [ ] App resumes from background correctly
- [ ] Data syncs when returning to foreground
- [ ] Offline data persists
- [ ] App handles memory warnings

#### Deep Linking
- [ ] Universal links work
- [ ] URL scheme opens app
- [ ] Navigation to correct screen

### TestFlight Beta Testing

1. **Upload Build**
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

2. **Invite Testers**
   - Internal testers (up to 100)
   - External testers (requires review)

3. **Collect Feedback**
   - Use TestFlight feedback form
   - Monitor crash reports
   - Review analytics

---

## Android Testing

### Device Compatibility

Test on various screen sizes and manufacturers:

- [ ] **Pixel 7** (6.3" - 1080x2400)
- [ ] **Samsung Galaxy S23** (6.1" - 1080x2340)
- [ ] **Samsung Galaxy Tab** (10.5" - 1920x1200)
- [ ] **OnePlus 11** (6.7" - 1440x3216)
- [ ] **Budget device** (<$200 - test performance)

### Android Version Support

- [ ] Android 10 (API 29)+
- [ ] Android 11 (API 30)+
- [ ] Android 12 (API 31)+
- [ ] Android 13 (API 33)+
- [ ] Android 14 (API 34)+ (Latest)

### Android-Specific Features

#### Push Notifications
- [ ] FCM notifications work
- [ ] Notification channels configured
- [ ] Notifications display properly
- [ ] Tapping opens correct screen
- [ ] Badge count works (launcher dependent)

#### Permissions
- [ ] Camera permission handled
- [ ] Storage permission handled
- [ ] Notification permission handled
- [ ] All permissions have clear rationale

#### App Lifecycle
- [ ] Back button navigation works
- [ ] App handles low memory
- [ ] Background processes work
- [ ] Battery optimization doesn't break features

#### Material Design
- [ ] Follows Material Design 3 guidelines
- [ ] Ripple effects work
- [ ] Bottom navigation works
- [ ] Floating action buttons work

### Firebase App Distribution

```bash
# Build APK for testing
eas build --platform android --profile preview

# Distribute via Firebase
firebase appdistribution:distribute app-release.apk \
  --app YOUR_ANDROID_APP_ID \
  --groups "qa-team"
```

---

## Feature Testing Checklist

### Authentication

- [x] **Login**
  - [x] Valid credentials work
  - [x] Invalid credentials show error
  - [x] Password visibility toggle works
  - [x] "Remember me" persists session
  - [x] Error messages are clear

- [ ] **Registration**
  - [ ] New user can register
  - [ ] Validation works (email format, password strength)
  - [ ] Terms/Privacy acceptance required
  - [ ] Duplicate email shows error

- [ ] **Password Reset**
  - [ ] Email sent successfully
  - [ ] Reset link works
  - [ ] Password updates correctly

- [x] **Logout**
  - [x] User logged out successfully
  - [x] Session cleared
  - [x] Redirects to login

### Dashboard

- [x] **Lead List**
  - [x] Leads display correctly
  - [x] Status badges show proper colors
  - [x] Stale leads have warning banner
  - [x] Quick actions work (Call, Text, Email)
  - [x] Press animation on cards
  - [x] Navigation to detail screen

- [x] **Statistics**
  - [x] "New today" count accurate
  - [x] "Need follow-up" count accurate
  - [x] "Total pipeline" count accurate
  - [x] Stats update in real-time

- [x] **Filtering**
  - [x] Filter by status works
  - [x] Filter by stale/fresh works
  - [x] Multiple filters combine correctly
  - [x] Clear filters works

- [x] **Search**
  - [x] Search by name works
  - [x] Search by address works
  - [x] Search by phone works
  - [x] Search by email works
  - [x] Search is case-insensitive

- [x] **Sorting**
  - [x] Sort by newest works
  - [x] Sort by oldest works
  - [x] Sort by priority works

### Lead Detail Screen

- [x] **Lead Information**
  - [x] All fields display correctly
  - [x] Status badge shows current status
  - [x] Contact info formatted properly
  - [x] Permit details visible

- [x] **Copy-to-Clipboard**
  - [x] Copy phone number works
  - [x] Copy email works
  - [x] Copy homeowner address works
  - [x] Copy contractor address works
  - [x] Copy contractor license works
  - [x] Success snackbar appears

- [x] **Status Updates**
  - [x] All 6 statuses available
  - [x] Status change saves to Firestore
  - [x] Status history tracks changes
  - [x] Timestamp records correctly
  - [x] Changed by user tracked

- [x] **Contact Tracking**
  - [x] "Mark as Contacted" button works
  - [x] lastContactedAt updates
  - [x] contactedCount increments
  - [x] Appears in activity timeline

- [x] **Notes**
  - [x] Add note dialog opens
  - [x] Note saves correctly
  - [x] Notes display in order
  - [x] Long notes handled properly

- [x] **Activity Timeline**
  - [x] Shows status changes
  - [x] Shows contact attempts
  - [x] Shows notes
  - [x] Chronological order
  - [x] Timestamps formatted correctly

### Notifications

- [ ] **Push Notifications**
  - [ ] Permission request appears
  - [ ] Daily notification (8 AM) triggers
  - [ ] Stale lead notification triggers
  - [ ] New lead notification triggers
  - [ ] Tapping opens app
  - [ ] Navigation to correct screen

- [ ] **Notification Preferences**
  - [ ] Enable/disable all notifications
  - [ ] Toggle daily notifications
  - [ ] Toggle stale lead reminders
  - [ ] Toggle new lead alerts
  - [ ] Custom time selection works

- [ ] **In-App Notifications**
  - [ ] Notification center displays
  - [ ] Mark as read works
  - [ ] Badge count updates
  - [ ] Notifications load on scroll

### Settings

- [x] **Theme**
  - [x] Dark mode toggle works
  - [x] Light mode toggle works
  - [x] System theme follows OS
  - [x] Theme persists

- [ ] **Profile**
  - [ ] Display name updates
  - [ ] Email updates
  - [ ] Phone updates
  - [ ] Photo upload works

- [ ] **Notifications**
  - [ ] Preferences save correctly
  - [ ] Changes take effect immediately

- [ ] **About**
  - [ ] Version number displays
  - [ ] Links work (Privacy, Terms)

### Offline Functionality

- [x] **Firestore Persistence**
  - [x] Data cached locally
  - [x] App works offline
  - [x] Changes queued for sync
  - [x] Syncs when back online

- [x] **Offline Indicator**
  - [x] Banner appears when offline
  - [x] Banner disappears when online
  - [x] User informed of offline state

### Error Handling

- [x] **Error Boundary**
  - [x] Catches runtime errors
  - [x] Shows user-friendly message
  - [x] Retry button works
  - [x] Errors logged

- [x] **Network Errors**
  - [x] Timeout handled gracefully
  - [x] Connection errors show message
  - [x] Retry mechanism works

- [x] **Form Validation**
  - [x] Required fields enforced
  - [x] Email format validated
  - [x] Phone format validated
  - [x] Error messages clear

---

## Performance Testing

### Metrics to Monitor

- [ ] **First Contentful Paint (FCP)** - < 1.5s
- [ ] **Time to Interactive (TTI)** - < 3.5s
- [ ] **Largest Contentful Paint (LCP)** - < 2.5s
- [ ] **Cumulative Layout Shift (CLS)** - < 0.1
- [ ] **First Input Delay (FID)** - < 100ms

### Performance Tests

- [x] **Component Rendering**
  - [x] LeadCard memoized properly
  - [x] StatusBadge memoized properly
  - [x] Lists render smoothly (60fps)
  - [x] No unnecessary re-renders

- [ ] **Bundle Size**
  - [ ] Main bundle < 1MB
  - [ ] Code splitting implemented
  - [ ] Lazy loading for routes
  - [ ] Tree shaking working

- [ ] **Memory Usage**
  - [ ] No memory leaks
  - [ ] Proper cleanup on unmount
  - [ ] Images released from memory
  - [ ] Event listeners removed

- [ ] **Database Queries**
  - [ ] Firestore queries indexed
  - [ ] Pagination implemented (if needed)
  - [ ] Data fetching optimized
  - [ ] Cache utilized

### Performance Testing Tools

```bash
# Lighthouse (Web)
npx lighthouse http://localhost:8082 --view

# React DevTools Profiler
# Use in browser DevTools

# Bundle analyzer
npx react-native-bundle-visualizer
```

---

## Security Testing

### Authentication Security

- [x] **Password Security**
  - [x] Passwords hashed (Firebase Auth)
  - [x] No passwords in logs
  - [x] Password requirements enforced

- [ ] **Session Management**
  - [ ] Sessions expire appropriately
  - [ ] Logout clears all tokens
  - [ ] No session fixation vulnerabilities

### Data Security

- [x] **Firestore Security Rules**
  - [x] Users can only read own data
  - [x] Write operations validated
  - [x] Field-level validation
  - [x] Admin-only operations protected

- [ ] **API Security**
  - [ ] API keys not exposed in client
  - [ ] HTTPS enforced
  - [ ] Rate limiting configured
  - [ ] CORS configured properly

### Input Validation

- [x] **Client-Side Validation**
  - [x] Email format validated
  - [x] Phone format validated
  - [x] Required fields enforced

- [ ] **Server-Side Validation**
  - [ ] All inputs validated in Cloud Functions
  - [ ] SQL injection prevented
  - [ ] XSS prevention implemented
  - [ ] CSRF protection enabled

### Security Testing Tools

```bash
# Check dependencies for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# OWASP ZAP (Web)
# Manual security testing tool
```

---

## Accessibility Testing

See [ACCESSIBILITY_AUDIT.md](./ACCESSIBILITY_AUDIT.md) for full audit results.

### Quick Checklist

- [x] **Color Contrast** - WCAG AA compliant
- [x] **Touch Targets** - Minimum 44x44px
- [x] **Screen Readers** - Labels provided
- [ ] **Keyboard Navigation** - All features accessible
- [ ] **Focus Indicators** - Visible focus states
- [ ] **Alt Text** - Images have descriptions

### Testing Tools

- **Web**: Chrome DevTools Accessibility Inspector
- **iOS**: Xcode Accessibility Inspector, VoiceOver
- **Android**: Accessibility Scanner, TalkBack

---

## Regression Testing

### Test Before Every Release

1. **Core Flows**
   - [ ] Login → Dashboard → Lead Detail
   - [ ] Filter leads → Search → Open lead
   - [ ] Update status → Add note → Mark contacted
   - [ ] Copy contact info → External app

2. **Critical Features**
   - [ ] Authentication works
   - [ ] Data syncs correctly
   - [ ] Push notifications deliver
   - [ ] Offline mode functions

3. **UI/UX**
   - [ ] No visual regressions
   - [ ] Animations smooth
   - [ ] Theme switching works
   - [ ] Forms validate properly

### Automated Regression Tests

```typescript
// Example Jest test
describe('Lead Detail Screen', () => {
  it('should display lead information', () => {
    // Test implementation
  });

  it('should copy phone number to clipboard', () => {
    // Test implementation
  });

  it('should update lead status', () => {
    // Test implementation
  });
});
```

---

## Known Issues

### Web
- None currently identified

### iOS
- ⚠️ **Pending Testing** - Requires physical device or Mac with Xcode

### Android
- ⚠️ **Pending Testing** - Requires APK build and physical device

### All Platforms
- None currently identified

---

## Testing Sign-Off

### Web Testing ✅
- **Tester**: Development Team
- **Date**: April 3, 2026
- **Status**: PASSED
- **Notes**: All core features working on Chrome. Additional browser testing recommended.

### iOS Testing ⏳
- **Tester**: Pending
- **Date**: Pending
- **Status**: NOT STARTED
- **Notes**: Requires Mac with Xcode or TestFlight build

### Android Testing ⏳
- **Tester**: Pending
- **Date**: Pending
- **Status**: NOT STARTED
- **Notes**: Requires APK/AAB build and physical device

---

## Next Steps

1. **Complete Web Testing**
   - [ ] Test on Firefox, Safari, Edge
   - [ ] Run Lighthouse audit
   - [ ] Test on various screen sizes

2. **iOS Device Testing**
   - [ ] Build with EAS: `eas build --platform ios`
   - [ ] Test on physical devices
   - [ ] Submit to TestFlight for beta testing

3. **Android Device Testing**
   - [ ] Build with EAS: `eas build --platform android`
   - [ ] Test on multiple devices/manufacturers
   - [ ] Distribute via Firebase App Distribution

4. **Performance Optimization**
   - [ ] Run bundle analyzer
   - [ ] Optimize images
   - [ ] Implement code splitting

5. **Production Deployment**
   - [ ] Deploy to App Store
   - [ ] Deploy to Google Play
   - [ ] Deploy web to Firebase Hosting

---

**Testing Coordinator**: Development Team
**Last Review**: April 3, 2026
**Next Review**: Before production release
