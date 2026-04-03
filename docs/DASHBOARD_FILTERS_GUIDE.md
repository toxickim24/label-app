# Dashboard Filters & Features Guide

**Last Updated**: April 3, 2026

This guide explains all the filtering, sorting, and display features available on the Label App Dashboard.

---

## 📊 Quick Stats Overview

At the top of the dashboard, you'll see three key metrics:

### 1. **New This Week**
- **What it shows**: Number of leads created in the last 7 days
- **Color**: Green badge
- **Calculation**: Counts leads where `createdDate >= 7 days ago`
- **Use case**: Track recent lead flow and identify busy weeks
- **Note**: Label says "New today" in UI but actually shows weekly count

### 2. **Need Follow-up**
- **What it shows**: Number of older leads (not new) that may need attention
- **Color**: Coral/Red badge (urgent)
- **Calculation**: Counts leads where:
  - Created >2 days ago (>48 hours)
  - AND status is NOT "new"
- **Use case**: Identify leads in pipeline that may need a follow-up touch
- **Algorithm**:
  ```typescript
  Need follow-up if:
  - daysSinceCreated > 2
  - AND status !== 'new'

  Example: A "contacted" lead from 3 days ago
  ```

**Note**: This is different from the "Stale Only" filter (see below), which checks actual contact timing.

### 3. **Total Pipeline**
- **What it shows**: Total number of all leads in the system
- **Color**: Blue badge
- **Calculation**: All leads (no filtering)
- **Use case**: Overall pipeline size at a glance

---

## 🎯 Permit Type Filters

Located below the stats cards, these filter leads by permit category.

### Available Options:
1. **All Permits** (🔲 grid icon)
   - Shows all leads regardless of permit type
   - Default selection when dashboard loads

2. **Pool** (🏊 pool icon)
   - Filters to `pool_permits` only
   - Shows count badge on card

3. **Kitchen & Bath** (🍴 silverware icon)
   - Filters to `kitchen_bath_permits` only
   - Shows count badge on card

4. **Roof** (🏠 roof icon)
   - Filters to `roof_permits` only
   - Shows count badge on card

### How to Use:
- **Click/Tap** any permit type card
- Selected card turns **blue** with primary color
- Lead list instantly updates
- Count badges show number of leads in each category

---

## 🔄 Status Filters

Horizontal scrollable chips that filter by lead status in your sales pipeline.

### 6-Stage Pipeline:

#### 1. **All** (Default)
- Shows leads in all statuses
- Default filter when dashboard loads

#### 2. **New** (Green)
- Fresh leads that haven't been contacted yet
- Highest priority if they become stale

#### 3. **Contacted** (Purple)
- Leads you've reached out to at least once
- Awaiting response or follow-up

#### 4. **Engaged** (Amber)
- Leads showing interest/responding
- Active conversations

#### 5. **Est. Sent** (Blue)
- Estimate/quote has been sent
- Watching for approval

#### 6. **Appointment** (Purple)
- Meeting scheduled
- High probability of conversion

#### 7. **Closing** (Pink)
- Final stage before conversion
- Near deal completion

### How to Use:
- **Scroll horizontally** to see all status options
- **Tap any status chip** to filter
- Selected chip becomes **filled** with colored background
- Combine with other filters (permit type, stale, search)

---

## ⚠️ Stale Only Filter

Special filter chip at the end of status filters (coral/red color).

### What is "Stale"?

A lead becomes **stale** when it hasn't been contacted recently enough:

#### Stale Rules:
```
IF lead has NEVER been contacted:
  ✓ Stale if created >48 hours ago
  ✗ Not stale if created ≤48 hours ago

IF lead HAS been contacted before:
  ✓ Stale if last contact >48 hours ago
  ✗ Not stale if last contact ≤48 hours ago
```

### Why It Matters:
- **48-hour window** is the optimal follow-up time in sales
- Stale leads are at risk of going cold
- Early intervention significantly improves conversion rates

### Visual Indicators:
- Stale leads have a **coral/red left border** (4px wide)
- "Stale Only" chip turns **coral when active**
- These leads appear first in priority sorting

### How to Use:
1. **Tap the "Stale Only" chip** (clock icon, coral color)
2. List filters to show ONLY stale leads
3. Chip background turns coral when active
4. Combine with status filters to find "Stale New Leads" etc.
5. **Tap again** to turn off the filter

### Priority Scoring:
Stale leads get **+100 points** in priority score, making them appear at the top of your list.

---

## 🔍 Search Bar

Free-text search across multiple lead fields.

### What It Searches:
- ✓ Record ID
- ✓ Full Name
- ✓ City
- ✓ Full Address
- ✓ Phone Numbers (all)
- ✓ Email Addresses (all)

### How to Use:
1. **Tap the search bar** at the top
2. **Type any text** - searches in real-time
3. Search is **case-insensitive**
4. Works with **partial matches**
5. Combines with all other filters

### Examples:
- `"Smith"` → Finds John Smith, Mary Smith
- `"305"` → Finds area code 305 phones, 305 Main St addresses
- `"Miami"` → Finds all leads in Miami
- `"john@"` → Finds emails starting with john@

---

## 📅 Time-Based Grouping

Toggle between grouped and list views.

### Grouped View (Default: ON)
Organizes leads into time-based sections:

#### Groups:
1. **Today (X)** - Created today
2. **This Week (X)** - Created in last 7 days
3. **This Month (X)** - Created in last 30 days
4. **Older (X)** - Created >30 days ago

#### Visual Design:
- **Section headers** with lead counts
- **Calendar icon** (📅) in header
- **Colored left border** (primary blue)
- **Subtle background** for headers
- **Sticky headers** when scrolling

### List View
Simple continuous list without section breaks.

### How to Toggle:
1. Look for the **"List/Grouped" toggle button** next to lead count
2. **Tap to switch** between modes
3. Setting persists during session

### When to Use Each:
- **Grouped**: Quickly identify new vs old leads
- **List**: Dense view when you know what you're looking for

---

## 🎲 Combined Filtering

All filters work together! Here are powerful combinations:

### Example Scenarios:

#### 1. **Find Urgent Pool Leads**
```
Permit Type: Pool
Status: New
Stale Only: ON
→ Shows new pool leads that need immediate attention
```

#### 2. **Kitchen Appointments This Week**
```
Permit Type: Kitchen & Bath
Status: Appointment
Grouping: ON → Check "This Week" section
→ Shows upcoming kitchen appointments
```

#### 3. **Search Engaged Roof Leads**
```
Permit Type: Roof
Status: Engaged
Search: "Miami"
→ Shows engaged roof leads in Miami
```

#### 4. **All Stale Leads Needing Follow-up**
```
Permit Type: All
Status: All
Stale Only: ON
→ Full list of leads requiring contact
```

---

## 📋 Lead Sorting

Leads are automatically sorted by **Priority** (highest to lowest).

### Priority Score Algorithm:
```typescript
Base Score = 0

// Stale leads get highest priority
if (lead is stale) {
  score += 100
}

// Status priority (earlier stages = higher)
Status Points:
- New: +50
- Contacted: +40
- Responded: +35
- Engaged: +30
- Qualified: +25
- Est. Sent: +20
- Appointment: +10
- Closing: +5

// Recent leads get bonus
if (created < 7 days ago) {
  score += 10
}

→ Leads sorted by total score (high to low)
```

### Result:
- **Stale new leads** appear first (100 + 50 + 10 = 160 points)
- **Recent engaged leads** appear high (35 + 10 = 45 points)
- **Old closing leads** appear lower (5 points)

---

## 🔄 How Filters Work Together

### Filter Application Order:
1. **Permit Type** → Filter by pool/kitchen/roof
2. **Status** → Filter by pipeline stage
3. **Stale Only** → Filter to stale leads
4. **Search** → Text search across fields
5. **Sort** → Priority sorting applied
6. **Group** → Time-based sections (if enabled)

### Real-Time Updates:
- All filters apply **instantly**
- No need to click "Apply" or "Search"
- Firestore real-time sync keeps data fresh
- Counts update automatically

---

## 🎨 Visual Feedback

### Color Coding:
- **Green** → New leads, success states
- **Coral/Red** → Stale leads, urgent actions
- **Blue** → Pipeline totals, selected states
- **Purple** → Contacted/appointment stages
- **Amber** → Engaged/engaged stages
- **Pink** → Closing stage

### Lead Card Borders:
- **No border** → Normal priority
- **Green (4px)** → New lead
- **Coral (4px)** → Stale lead (urgent!)
- **Blue (4px)** → Hot lead (est_sent/appointment)
- **Amber (4px)** → Closing lead

---

## 💡 Best Practices

### Daily Workflow:
1. **Start with "Need Follow-up"** metric
2. **Enable "Stale Only" filter**
3. **Focus on New/Contacted** status
4. **Work through stale leads** first
5. **Use search** for specific lookups

### Weekly Review:
1. Check **"New Today"** trends
2. Review **"Total Pipeline"** health
3. Filter **"Appointment"** status for upcoming meetings
4. Search for leads by **city/area** for route planning

### Pro Tips:
- 🔥 **Stale + New = Highest Priority** - Don't let new leads go cold!
- 📊 **Monitor "Need Follow-up" daily** - Keep it under control
- 🎯 **Use permit filters** when running targeted campaigns
- 🔍 **Search by area code** to batch calls by region
- ⏰ **Enable grouping** to spot aging leads quickly

---

## 🐛 Troubleshooting

### "No leads showing"
- ✓ Check if multiple filters are active
- ✓ Try clicking "All" permit type
- ✓ Try clicking "All" status
- ✓ Turn off "Stale Only"
- ✓ Clear search bar

### "Stale filter not working"
- ✓ Verify leads are >48 hours old
- ✓ Check if leads have been contacted recently
- ✓ Try combining with "New" or "Contacted" status

### "Can't find a lead"
- ✓ Use search bar with record ID or name
- ✓ Remove all filters first
- ✓ Check if lead was archived/deleted

---

## 📱 Mobile vs Web Differences

### Mobile (iOS/Android):
- Compact spacing and fonts
- Horizontal scrolling for filters
- Touch-optimized chip sizes
- Bottom sheets for dialogs

### Web (Desktop):
- More breathing room
- Wider layout (max 1536px)
- Hover effects on cards
- Standard dialogs

### All Platforms:
- Same filtering logic
- Same priority sorting
- Same real-time sync
- Theme-aware colors (light/dark)

---

## 🔐 Data & Performance

### Real-Time Sync:
- Uses **Firestore subscriptions**
- Instant updates when data changes
- No manual refresh needed
- Pull-to-refresh available

### Performance:
- All **filtering happens client-side**
- Fetches all leads once
- Instant filter application
- Optimized for 1000+ leads

### Privacy:
- Lead data stored in Firestore
- Secure Firebase authentication
- User-specific data access
- No data leaves your Firebase project

---

## 📞 Need Help?

If filters aren't working as expected:
1. Check the console for errors
2. Verify Firestore permissions
3. Check network connectivity
4. Review Firebase rules

For feature requests or bugs:
- Open an issue in the project repository
- Include screenshots of unexpected behavior
- Describe the filters/combinations you tried

---

**Happy Lead Management! 🚀**
