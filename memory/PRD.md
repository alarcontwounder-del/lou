# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a premium golf booking website for Mallorca ("Golfinmallorca.com") with:
- Modern, dynamic UI/UX design ("Ink Wash" color palette)
- Admin dashboard for content management
- Real authentic images for all partners
- Partner management with display controls

## What's Been Implemented

### December 2, 2026 (Current Session)

#### ✅ FULL CONTENT MANAGEMENT SYSTEM
Complete admin control over all partners with:

**Toggle Active/Inactive:**
- On/off switch on each partner card in Admin
- Hidden partners don't appear on website
- "Show Hidden" filter to view inactive partners
- Easy restore by toggling back on

**Display Limits:**
- Settings panel to control cards shown per category
- Options: 3, 4, 6, 8, 10, 12, 16, 20, or "Show All"
- Settings saved in MongoDB (`display_settings` collection)
- Each category section respects limits

**URL Management:**
- Prominent "Booking URL" field in edit form
- Easy to add/edit/remove partner booking links
- Visual URL indicator on each card

**API Updates:**
- `GET /api/display-settings` - Get display limits
- `POST /api/display-settings` - Save display limits
- `?include_inactive=true` parameter on all GET endpoints
- Soft delete with `is_active` field

### December 1, 2026
- Full database migration (156 partners to MongoDB)
- Admin Dashboard Content Manager UI
- Golf courses reordered (Son Gual, Alcanada, Pula first)
- Reduced spacing between sections

## Admin Dashboard Features

### Content Manager Tab
Access: Gear icon → Google Login → "Content Manager" tab

| Feature | Description |
|---------|-------------|
| **Type Tabs** | Golf, Hotels, Restaurants, Beach Clubs, Cafés |
| **Search** | Filter by name, location, category |
| **Active Toggle** | Show/hide partners on website |
| **Show Hidden** | View inactive partners |
| **Display Limits** | Set max cards per category |
| **Add New** | Create new partners |
| **Edit** | Modify all fields including URLs |
| **Delete** | Permanently remove partners |

### Display Settings
| Category | Default | Options |
|----------|---------|---------|
| Golf Courses | Show All | 3-20 or All |
| Hotels | Show All | 3-20 or All |
| Restaurants | Show All | 3-20 or All |
| Beach Clubs | Show All | 3-20 or All |
| Cafés & Bars | Show All | 3-20 or All |

## Technical Architecture

### MongoDB Collections
```
golf_courses      - 16 records
hotels            - 38 records
restaurants       - 54 records  
beach_clubs       - 12 records
cafe_bars         - 36 records
display_settings  - 1 record (limits config)
```

### Key Files Updated
- `/app/frontend/src/components/ContentManager.jsx` - Full admin UI
- `/app/frontend/src/components/GolfCourses.jsx` - Display limits
- `/app/frontend/src/components/HotelPartners.jsx` - Display limits
- `/app/frontend/src/components/RestaurantPartners.jsx` - Display limits
- `/app/frontend/src/components/BeachClubPartners.jsx` - Display limits
- `/app/frontend/src/components/CafeBarsPartners.jsx` - Display limits
- `/app/backend/server.py` - Display settings endpoints

## Prioritized Backlog

### P0 - Critical (User Input Needed)
- [ ] Replace stock photos with real venue images

### P1 - High Priority  
- [ ] Full Search Engine implementation
- [ ] Email functionality (needs RESEND_API_KEY)

### P2 - Medium Priority
- [ ] Hero video replacement
- [ ] Weather widget integration

## Data Summary
- **Total Partners**: 156 records in MongoDB
- **All with toggle on/off**: Yes
- **All with URL editing**: Yes
- **Display limits**: Configurable per category
