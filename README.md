# Label App - Pool Permit Lead Management CRM

A modern, streamlined CRM app for real estate agents to manage and convert pool permit leads into commissions. Built with React Native and Expo, featuring a dark-first design system and daily lead delivery hook.

## Overview

Label App revolutionizes how real estate agents discover and convert new business opportunities. Instead of complex in-app communication, we focus on what works: **daily lead delivery at 8 AM** with a simple copy-to-clipboard pattern that lets agents use their preferred communication tools.

### Business Model
- **Commission Split**: Label takes 25% of the agent's commission per successful deal
- **Lead Source**: Pool permit applications (currently California only)
- **Target Users**: Real estate agents seeking homeowner leads for pool construction projects

## Features

### 6-Stage Pipeline
Track leads through their entire lifecycle:
- **New** - Fresh leads, ready for outreach
- **Contacted** - Initial contact made
- **Engaged** - Active conversation
- **Est. Sent** - Estimate/proposal sent
- **Appointment** - Meeting scheduled
- **Closing** - Deal in final stages

### Smart Lead Management
- **48-Hour Stale Detection** - Visual warnings for leads not contacted within 48 hours
- **Priority Sorting** - Intelligent sorting by urgency and status
- **Search & Filter** - Find leads by name, address, phone, email, or status
- **Activity Timeline** - Complete history of status changes and contact attempts

### Copy-to-Clipboard Pattern
No in-app messaging complexity. One-tap copy for:
- Homeowner phone numbers
- Homeowner email addresses
- Property addresses
- Contractor information
- License numbers

### Push Notifications
- **Daily Lead Drop** - 8 AM notification with new leads
- **Stale Lead Reminders** - Alerts for leads needing attention
- **New Lead Alerts** - Real-time notifications for fresh opportunities
- **Customizable Preferences** - Control notification timing and types

### Modern Design System
- **Dark-First UI** - Optimized for all-day use (#06060b background)
- **Dual Theme Support** - Full light theme with WCAG AA accessibility
- **DM Sans Typography** - Clean, professional font family
- **Color-Coded Statuses** - Visual pipeline at a glance
- **Responsive Layout** - Works on iOS, Android, and web

### Dashboard Intelligence
- **Today's Summary** - New leads, follow-ups needed, pipeline total
- **Lead Cards** - Status badges, contact info, quick actions
- **Filter Controls** - Status, staleness, search
- **Sort Options** - Newest, oldest, priority

### Lead Detail View
- **Comprehensive Information** - Homeowner, contractor, permit details
- **Contact Tracking** - Manual "Mark as Contacted" button
- **Notes System** - Add context and reminders
- **Status Updates** - Tap to change pipeline stage
- **Activity Log** - Chronological timeline of all interactions

### Error Handling & Reliability
- **Error Boundaries** - Graceful error recovery with user-friendly messages
- **Offline Indicator** - Network status monitoring
- **Firestore Sync** - Real-time data synchronization
- **Performance Optimization** - React.memo for smooth scrolling

## Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo SDK 52** - Development platform and build tools
- **TypeScript** - Type-safe development
- **React Native Paper** - Material Design components
- **React Navigation** - Screen navigation

### Backend & Services
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Authentication** - User management
- **Firebase Cloud Functions** - Serverless backend
- **Expo Notifications** - Push notification delivery

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management

### Utilities
- **Expo Clipboard** - Copy-to-clipboard functionality
- **NetInfo** - Network connectivity detection
- **Expo Google Fonts (DM Sans)** - Custom typography

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Emulator
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd label-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
Create `firebaseConfig.ts` with your Firebase project credentials:
```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

4. **Start the development server**
```bash
# Web (recommended for development)
npx expo start --web

# iOS
npx expo start --ios

# Android
npx expo start --android
```

The web app will be available at `http://localhost:8082`

## Project Structure

```
label-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LeadCard.tsx
│   │   ├── OfflineIndicator.tsx
│   │   └── StatusBadge.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── useNotifications.ts
│   ├── navigation/          # Navigation configuration
│   │   └── MainNavigator.tsx
│   ├── screens/             # App screens
│   │   ├── auth/            # Authentication screens
│   │   ├── dashboard/       # Dashboard and lead detail
│   │   ├── notifications/   # Notification center
│   │   └── settings/        # App settings
│   ├── services/            # API and business logic
│   │   ├── leadsService.ts
│   │   └── notificationService.ts
│   ├── store/               # Zustand state management
│   │   └── index.ts
│   ├── theme/               # Design system
│   │   ├── colors.ts
│   │   └── index.ts
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   └── utils/               # Helper functions
│       └── leadUtils.ts
├── assets/                  # Images, fonts, icons
├── docs/                    # Documentation
│   ├── ACCESSIBILITY_AUDIT.md
│   ├── DEPLOYMENT-UBUNTU.md
│   ├── DEVELOPMENT_PHASES.md
│   ├── QUICK_FIX_GUIDE.md
│   └── TESTING_iOS.md
├── app.json                 # Expo configuration
├── App.tsx                  # App entry point
└── package.json             # Dependencies
```

## Configuration

### Notification Preferences
Users can customize notifications in the Settings screen:
- Enable/disable all notifications
- Daily lead notification (8 AM)
- Stale lead reminders
- New lead alerts
- Custom notification time

### Theme Settings
- Dark mode (default)
- Light mode
- System-based theme

### Firestore Collections

**users**
- User profiles and preferences
- Notification settings
- Theme preferences

**leads**
- Lead information
- Status history
- Contact tracking
- Activity timeline

**notifications** (optional)
- In-app notification history

## Development Phases

The app was built in 4 phases:

### Phase 1: Design Transformation (100% Complete)
- Dark theme color system
- DM Sans typography
- Dashboard screen redesign
- Lead detail screen overhaul
- StatusBadge and LeadCard components
- Dual-theme support

### Phase 2: CRM Core Features (100% Complete)
- 6-stage pipeline implementation
- Stale lead detection (48-hour rule)
- Push notification system
- Activity timeline
- Lead filtering and search
- Dashboard statistics

### Phase 3: Communication Simplification (50% Complete - 2 tasks skipped)
- Copy-to-clipboard pattern
- Manual contact tracking
- Removed in-app messaging (skipped)
- Template system removal (skipped)

### Phase 4: Polish & Testing (60% Complete)
- Performance optimization (React.memo)
- Accessibility audit (WCAG AA)
- Error boundaries and offline handling
- Cross-platform testing (pending)
- Documentation and deployment (in progress)

**Overall Progress**: 81% (17/21 effective tasks)

See [DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md) for detailed progress tracking.

## Design Principles

1. **Dark First** - Default to dark theme (#06060b background)
2. **Speed** - Every interaction should feel instant
3. **Simplicity** - Remove friction, focus on core actions
4. **Copy Pattern** - No in-app communication, just copy-to-clipboard
5. **Daily Hook** - Push notification at 8 AM with new leads

## Accessibility

Label App meets WCAG AA standards:
- All color contrasts exceed 4.5:1 ratio
- Touch targets meet 44x44px minimum
- Screen reader support via React Native Paper
- Keyboard navigation on web

See [ACCESSIBILITY_AUDIT.md](docs/ACCESSIBILITY_AUDIT.md) for full audit.

## Deployment

### Web
```bash
npm run build
# Deploy build folder to hosting service
```

### iOS (via EAS)
```bash
eas build --platform ios
```

### Android (via EAS)
```bash
eas build --platform android
```

See [DEPLOYMENT-UBUNTU.md](docs/DEPLOYMENT-UBUNTU.md) for detailed deployment instructions.

## Testing

### Web Testing
```bash
npx expo start --web
# Open http://localhost:8082
```

### iOS Testing
See [TESTING_iOS.md](docs/TESTING_iOS.md) for TestFlight setup.

### Android Testing
```bash
npx expo start --android
```

## Roadmap

### Future Features
- Multi-state expansion (currently CA-only)
- Additional permit types (kitchen/bath, roofing)
- Team features for agencies
- Integration with pool contractor software
- Lead scoring and AI insights

## Key Design Reference

All design specifications are in `/files/label-agent-wireframes.jsx`

### Status Badge Colors
```javascript
const statusColors = {
  new: { bg: '#34d39920', text: '#34d399', dot: '#22c55e' },
  contacted: { bg: '#818cf820', text: '#818cf8', dot: '#6366f1' },
  engaged: { bg: '#fbbf2420', text: '#fbbf24', dot: '#f59e0b' },
  est_sent: { bg: '#60a5fa20', text: '#60a5fa', dot: '#3b82f6' },
  appointment: { bg: '#a78bfa20', text: '#a78bfa', dot: '#8b5cf6' },
  closing: { bg: '#f472b620', text: '#f472b6', dot: '#ec4899' }
}
```

## Contributing

This is a private commercial project. Contact the project owner for contribution guidelines.

## License

Proprietary - All rights reserved.

## Support

For issues or questions:
- Check [QUICK_FIX_GUIDE.md](docs/QUICK_FIX_GUIDE.md) for common problems
- Review [DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md) for implementation details
- Contact the development team

---

**Built with** ❤️ **by the Label team**
