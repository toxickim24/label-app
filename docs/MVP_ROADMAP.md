# Label App - MVP Roadmap

## Overview

This roadmap breaks down the Label app development into three phases, prioritizing core functionality for rapid market entry while maintaining production quality.

**Timeline**: 12-16 weeks total
**Approach**: Agile with 2-week sprints
**Team Recommendation**: 2-3 developers + 1 designer + 1 PM

---

## Phase 1: Core MVP (Weeks 1-6)

**Goal**: Launch functional mobile app with essential lead management

### Sprint 1-2: Foundation (Weeks 1-4)

#### Week 1-2: Setup & Authentication

**Deliverables:**
- [x] React Native + Expo project initialized
- [x] Firebase project created and configured
- [x] Logo integration complete
- [x] Authentication flow implemented
  - Login screen
  - Registration screen (with Terms & Privacy acceptance)
  - Password reset flow
  - Biometric login (iOS Face ID / Android Fingerprint)
- [x] Basic navigation structure
  - Root navigator
  - Auth stack
  - Main tab navigator (skeleton)
- [x] Theme system (light/dark mode with logo switching)
- [x] Firebase Auth integration with custom claims

**Technical Tasks:**
- Set up Firebase Authentication
- Implement role-based access control (RBAC) foundation
- Create base UI components (buttons, inputs, cards)
- Set up state management (Zustand)
- Configure TypeScript types

**Testing:**
- User can register with email/password
- Terms & Privacy acceptance enforced
- Login with correct credentials succeeds
- Biometric login works on supported devices
- Theme switches correctly

#### Week 3-4: Dashboard & Lead Display

**Deliverables:**
- [x] Dashboard screen (main view)
  - Permit type selector dropdown
  - Lead list with cards
  - Sort by newest first
  - Pull to refresh
- [x] Lead card component
  - Record ID
  - Status badge
  - Name, address
  - Permit type
  - Created date
- [x] Lead detail screen
  - All contact information
  - Property details
  - Permit information
- [x] Search functionality
  - Real-time search across fields
- [x] Status filter
  - All, New, Contacted, etc.

**Technical Tasks:**
- Firestore lead collection schema
- React Query for data fetching
- Implement pagination (load more on scroll)
- Caching strategy for offline viewing
- Permission checks per permit type

**Testing:**
- Leads display correctly sorted
- Search returns accurate results
- Status filters work
- Pull to refresh fetches new data
- Lead detail shows all information
- Respects view permissions

### Sprint 3: Communication Basics (Week 5-6)

#### Week 5-6: Send Email & SMS

**Deliverables:**
- [x] Email send functionality
  - Select email address
  - Compose message
  - Send via SendGrid
- [x] SMS send functionality
  - Select phone number
  - Compose message (character counter)
  - Send via Twilio
- [x] Communication history
  - Timeline view in lead detail
  - Status indicators
  - Sent by information
- [x] Call functionality
  - Open phone dialer with number
- [x] Basic templates
  - Manual template creation
  - Template selection when sending
  - Variable substitution ({{firstName}}, etc.)

**Cloud Functions:**
- `sendEmail`: SendGrid integration
- `sendSms`: Twilio integration
- `twilioWebhook`: Track SMS delivery
- `sendgridWebhook`: Track email opens/clicks

**API Integrations:**
- Twilio account setup
- SendGrid account setup
- Webhook configuration

**Testing:**
- Email sends successfully
- SMS sends successfully
- Delivery status updates
- Templates populate correctly
- Variables substitute properly
- Permission enforcement works

---

## Phase 2: Enhanced Features (Weeks 7-10)

**Goal**: Add AI template generation, notifications, and admin features

### Sprint 4: AI Integration (Week 7-8)

#### Week 7-8: AI Template Generation

**Deliverables:**
- [x] Templates screen
  - View templates by permit type & category
  - Create manual templates
  - Edit existing templates
  - Delete templates
- [x] AI generation UI
  - Provider selection (OpenAI/Gemini)
  - Custom prompt input
  - Loading state with progress
  - Edit generated content
  - Save as template
- [x] Base prompt management
  - Per permit type + category
  - Editable by users with manage_templates permission
- [x] Template usage tracking
  - Times used counter
  - Last used date

**Cloud Functions:**
- `generateTemplate`: OpenAI & Gemini integration
- `selectProvider`: Get default AI provider

**API Integrations:**
- OpenAI API setup
- Google Gemini API setup
- Firebase Secret Manager for keys

**Testing:**
- AI generates relevant content
- Both providers work
- Generated content editable
- Templates save correctly
- Usage tracking accurate
- Permission checks enforced

### Sprint 5: Notifications & Settings (Week 9-10)

#### Week 9: Push Notifications

**Deliverables:**
- [x] Firebase Cloud Messaging (FCM) setup
- [x] Push notification handling
  - Receive when app in foreground
  - Background notifications
  - Notification tap handling
- [x] Notifications screen
  - List all notifications
  - Mark as read
  - Delete notifications
  - Badge count on tab icon
- [x] Notification types
  - New lead alerts
  - Policy update alerts
  - System messages
- [x] App icon badge
  - Shows unread notification count
  - Updates in real-time
  - Clears when viewed

**Cloud Functions:**
- `onLeadCreated`: Trigger notifications
- `sendPushNotification`: FCM sender
- `updateBadgeCount`: Calculate and update

**Testing:**
- Notifications arrive on new leads
- Badge count accurate
- Tap opens relevant screen
- Mark as read works
- iOS and Android notification permissions

#### Week 10: Settings & Profile

**Deliverables:**
- [x] Settings screen
  - Profile section (name, email, role badge)
  - Edit profile (name, phone, photo)
  - Theme toggle (Light/Dark/Auto)
  - Notifications toggle
  - About section
- [x] About section
  - App name and version
  - Editable footer text (Master only)
  - Terms & Conditions link
  - Privacy Policy link
  - Contact support
- [x] Change password flow
- [x] Logout functionality
  - Single device logout
  - All devices logout (Admin+)

**Testing:**
- Profile edits save
- Theme switching works
- About section displays correctly
- Logout clears session
- Password change successful

---

## Phase 3: Admin & Production Polish (Weeks 11-16)

**Goal**: Complete admin features, polish UI/UX, deploy to stores

### Sprint 6: Admin Panel (Week 11-12)

#### Week 11-12: User & Permission Management

**Deliverables:**
- [x] Admin Panel access (Settings > Admin Panel)
- [x] User Management screen
  - List all users
  - Search users
  - Filter by role/status
  - Invite new users
- [x] User edit functionality
  - Change role
  - Configure permissions per permit type
  - Enable/disable user
  - Reset password
- [x] Permission templates
  - Predefined sets (View Only, Sales Rep, Team Lead, Full Access)
  - Apply template to user
  - Copy permissions to other permit types
- [x] API Key Management screen
  - View all configured keys
  - Add new keys (OpenAI, Gemini, Twilio, SendGrid)
  - Test connections
  - Set default AI provider
  - Activate/deactivate keys

**Cloud Functions:**
- `setUserRole`: Update role and permissions
- `onUserCreate`: Initialize new user
- `onUserDelete`: Cleanup user data
- `setCustomClaims`: Update Firebase Auth claims

**Testing:**
- Admins can create users
- Role changes apply immediately
- Permission enforcement works
- API keys save securely
- Test connections validate keys

### Sprint 7: Policy Management & Audit (Week 13-14)

#### Week 13: Policy Management

**Deliverables:**
- [x] Policy Management screen (Master only)
  - View current Terms & Privacy versions
  - Edit existing policies (minor changes)
  - Create new versions (major changes)
  - Version history
  - Acceptance status tracking
- [x] Policy editor
  - Markdown/rich text editor
  - Preview mode
  - Change log input
  - Force re-acceptance toggle
- [x] Policy acceptance flow
  - Show policy screen when updated
  - Block app until accepted
  - Log acceptance with metadata
- [x] Footer editor (Master only)
  - Edit footer text shown in About section
  - Markdown support
  - Preview
  - Version history

**Cloud Functions:**
- `onPolicyPublished`: Trigger notifications
- `checkPolicyAcceptance`: Middleware

**Testing:**
- Policies save and version correctly
- Re-acceptance enforcement works
- Acceptance logging accurate
- Footer updates propagate
- Master-only restrictions enforced

#### Week 14: Audit Logs & Monitoring

**Deliverables:**
- [x] Audit Logs screen (Master/Admin only)
  - View all system activity
  - Filter by user, action, date
  - Search logs
  - Export logs (CSV, JSON, PDF)
- [x] Audit logging implementation
  - Log all sensitive actions
  - Capture user, action, resource, changes
  - IP address and device info
  - Immutable log entries
- [x] Analytics dashboard (basic)
  - User activity stats
  - Lead stats per permit type
  - Communication stats
  - API usage overview

**Cloud Functions:**
- `createAuditLog`: Centralized logging
- `getUserStats`: Aggregate user metrics

**Testing:**
- All actions logged correctly
- Logs searchable and filterable
- Export formats work
- Analytics data accurate

### Sprint 8: Lead Import/Export & Polish (Week 15)

#### Week 15: Data Management

**Deliverables:**
- [x] Import leads functionality
  - CSV upload
  - Field mapping
  - Validation
  - Batch import with progress
  - Error handling
- [x] Export leads functionality
  - CSV export
  - PDF export (lead details)
  - vCard export (contact info)
  - Filter before export
- [x] Bulk actions
  - Select multiple leads
  - Bulk status change
  - Bulk email/SMS send
  - Bulk export
- [x] Lead editing
  - Edit all fields (with permission)
  - Add notes
  - Flag leads
  - Status management

**Cloud Functions:**
- `importLeads`: Process CSV import
- `exportLeads`: Generate export files

**Testing:**
- CSV import handles various formats
- Validation catches errors
- Export formats correct
- Bulk actions apply to all selected
- Edit permissions enforced

### Sprint 9: Testing & Deployment (Week 16)

#### Week 16: Final Testing & Launch

**Deliverables:**
- [x] Comprehensive testing
  - Unit tests (>80% coverage)
  - Integration tests
  - E2E tests (critical flows)
  - Performance testing
  - Security audit
- [x] Bug fixes and polish
  - Address all critical bugs
  - UI/UX refinements
  - Loading states
  - Error messages
  - Empty states
- [x] Documentation
  - User guide
  - Admin guide
  - API integration guide
  - Deployment guide
- [x] Store listings
  - App Store (iOS)
  - Google Play Store (Android)
  - Screenshots (all device sizes)
  - Descriptions and keywords
- [x] Production deployment
  - Cloud Functions deployed
  - Firestore rules deployed
  - iOS app submitted to App Store
  - Android app submitted to Play Store
- [x] Beta testing
  - TestFlight (iOS) with 10-20 testers
  - Firebase App Distribution (Android)
  - Collect and address feedback
- [x] Production monitoring setup
  - Firebase Crashlytics
  - Firebase Analytics
  - Error alerting
  - Usage monitoring

**Final Checklist:**
- [ ] All features implemented and tested
- [ ] Security rules audited
- [ ] API keys configured in production
- [ ] Privacy policy and terms published
- [ ] App Store approval received
- [ ] Play Store approval received
- [ ] Monitoring dashboards configured
- [ ] Support processes documented
- [ ] Marketing materials ready
- [ ] Launch announcement prepared

---

## Post-MVP: Future Enhancements (Phase 4+)

### Future Sprint Ideas

**Lead Enrichment:**
- [ ] Auto-lookup additional contact info
- [ ] Property value estimation
- [ ] Social media profile linking
- [ ] Credit score integration

**Advanced AI:**
- [ ] Sentiment analysis on responses
- [ ] Predictive lead scoring
- [ ] Optimal contact time prediction
- [ ] Automated follow-up scheduling

**Team Collaboration:**
- [ ] Lead assignment system
- [ ] Team messaging
- [ ] Shared notes and comments
- [ ] Activity feed

**Reporting:**
- [ ] Custom reports builder
- [ ] Conversion funnel analysis
- [ ] Performance dashboards
- [ ] ROI tracking

**Integrations:**
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Calendar integration
- [ ] Zapier/Make.com connectors
- [ ] Stripe for payments (if subscription model)

**Mobile Enhancements:**
- [ ] Offline mode (full support)
- [ ] Widget for home screen
- [ ] Siri/Google Assistant shortcuts
- [ ] Apple Watch companion app
- [ ] Tablet-optimized UI

**Business Features:**
- [ ] Multi-organization support
- [ ] White-label capability
- [ ] Custom branding per organization
- [ ] Usage-based billing
- [ ] Enterprise SSO

---

## Development Best Practices

### Throughout All Phases

**Code Quality:**
- Write clean, documented code
- Follow React Native best practices
- Use TypeScript strictly
- Implement error boundaries
- Add loading and error states

**Security:**
- Never commit secrets
- Use Firebase Security Rules
- Validate all inputs
- Sanitize user content
- Regular security audits

**Performance:**
- Optimize images and assets
- Lazy load screens
- Implement pagination
- Cache data appropriately
- Monitor app size

**Testing:**
- Write tests as you build
- Maintain >80% code coverage
- Test on real devices
- Test edge cases
- Automated CI/CD tests

**User Experience:**
- Consistent UI patterns
- Clear error messages
- Helpful empty states
- Smooth animations
- Accessibility support

**Documentation:**
- Keep docs up to date
- Comment complex logic
- Document API changes
- Maintain changelog
- User-facing help content

---

## Risk Mitigation

### Potential Risks & Mitigation Strategies

**Technical Risks:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firebase costs exceed budget | High | Set budget alerts, optimize queries, implement caching |
| API rate limits hit | Medium | Implement rate limiting, queue systems, upgrade plans |
| App Store rejection | High | Follow guidelines strictly, prepare appeals, beta test |
| Security breach | Critical | Regular audits, penetration testing, secure coding practices |
| Performance issues on older devices | Medium | Test on min spec devices, optimize early, profiling |

**Business Risks:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low user adoption | High | Beta test for feedback, marketing plan, user interviews |
| Compliance issues (TCPA, GDPR) | Critical | Legal review, compliance features built-in, documentation |
| Competitor launches similar app | Medium | Focus on unique value prop, rapid iteration, community |
| Key team member leaves | High | Documentation, knowledge sharing, backup plans |

**Timeline Risks:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| Features take longer than estimated | Medium | Buffer time in estimates, prioritize ruthlessly, MVP focus |
| Dependencies delayed | Low | Research early, have alternatives, communicate with vendors |
| Scope creep | High | Strict phase definitions, change control process, stakeholder alignment |

---

## Success Metrics

### Phase 1 (MVP) Success Criteria

- [ ] 50+ beta users signed up
- [ ] <5% crash rate
- [ ] >90% users complete onboarding
- [ ] >80% users send at least one communication
- [ ] Average session length >5 minutes
- [ ] 4+ star rating (TestFlight feedback)

### Phase 2 Success Criteria

- [ ] 200+ active users
- [ ] >50% users generate AI templates
- [ ] >70% users enable push notifications
- [ ] <2% crash rate
- [ ] >85% user satisfaction score

### Phase 3 Success Criteria

- [ ] App Store & Play Store approved
- [ ] 1,000+ downloads in first month
- [ ] >60% day 7 retention
- [ ] >40% day 30 retention
- [ ] $X MRR (if subscription model)
- [ ] NPS >30

---

## Budget Estimate

### Development Costs (Approximate)

**Team (12-16 weeks):**
- 2 Mobile Developers: $150-200/hr × 480 hours = $72,000-96,000
- 1 Backend Developer: $150-200/hr × 320 hours = $48,000-64,000
- 1 UI/UX Designer: $100-150/hr × 240 hours = $24,000-36,000
- 1 Project Manager: $120-180/hr × 240 hours = $28,800-43,200

**Total Team Cost: $172,800 - $239,200**

### Infrastructure Costs (Annual)

**Firebase:**
- Blaze Plan: Pay-as-you-go
- Estimated: $100-500/month = $1,200-6,000/year

**API Services:**
- OpenAI: $50-200/month = $600-2,400/year
- Google Gemini: $0-100/month = $0-1,200/year
- Twilio: $100-500/month = $1,200-6,000/year
- SendGrid: $20-100/month = $240-1,200/year

**Developer Accounts:**
- Apple Developer: $99/year
- Google Play: $25 one-time

**Total Infrastructure: $3,364-17,924/year**

### Additional Costs

- Legal (Terms, Privacy): $2,000-5,000
- Marketing (launch): $5,000-20,000
- Domain & hosting: $50-200/year
- Monitoring tools: $0-1,000/year

**Grand Total First Year: $183,000 - $282,000**

---

## Conclusion

This MVP roadmap provides a structured, phased approach to building the Label mobile application. By focusing on core functionality in Phase 1, we ensure rapid market entry while maintaining production quality. Phases 2 and 3 add value-enhancing features and administrative capabilities.

**Key Success Factors:**
1. Strict adherence to MVP scope in Phase 1
2. Continuous user feedback integration
3. Robust testing at each phase
4. Security and compliance from day one
5. Scalable architecture for future growth

**Next Steps:**
1. Finalize team composition
2. Set up development environment
3. Create detailed task breakdown for Sprint 1
4. Begin Phase 1 development
5. Schedule regular stakeholder reviews

With this roadmap, the Label app will launch as a polished, production-ready mobile application within 12-16 weeks, ready to revolutionize permit-based contractor lead management.
