# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a premium golf booking website for Mallorca ("Golfinmallorca.com") with:
- Modern, dynamic UI/UX design ("Ink Wash" color palette: charcoal, cream, slate blue)
- Admin dashboard for content management
- Real authentic images for all partners
- Beach Clubs section
- Mini search engine for finding golf courses, hotels, restaurants, etc.

## User Personas
- Golf enthusiasts visiting Mallorca
- Luxury hotel guests seeking golf packages
- Restaurant-goers looking for fine dining with golf packages
- Beach club visitors

## What's Been Implemented

### December 1, 2026 (Current Session)

#### ✅ FULL DATABASE MIGRATION COMPLETE
All partner data has been migrated from hardcoded `server.py` to MongoDB:

| Collection | Records | Status |
|------------|---------|--------|
| golf_courses | 16 | ✅ Migrated |
| hotels | 38 | ✅ Migrated |
| restaurants | 54 | ✅ Migrated |
| beach_clubs | 12 | ✅ Migrated |
| cafe_bars | 36 | ✅ Migrated |
| **Total** | **156** | ✅ Complete |

**API Endpoints Created:**
- `GET /api/golf-courses` - All golf courses
- `GET /api/hotels` - All hotels  
- `GET /api/restaurants` - All restaurants
- `GET /api/beach-clubs` - All beach clubs
- `GET /api/cafe-bars` - All cafés & bars
- `GET /api/all-partners` - All partners grouped by type
- Full CRUD operations (POST, PUT, DELETE) for each type

**Other Completed Tasks:**
- Golf courses reordered: **Son Gual → Alcanada → Pula** as first three
- Reduced spacing between "About Us" and "World-Class Courses" sections
- Added image framing CSS improvements

### Previous Sessions
- Reviews UI: Compact horizontal carousel (replaced floating sidebar)
- Ghost section navigator for quick page jumps
- Standardized colors across all partner cards
- Fixed golf courses count (16), cream background throughout
- Beach Clubs Section (11 clubs)
- Cafés & Bars Section (34 venues)
- Floating Search Mockup (UI ready)

## Technical Architecture

### MongoDB Collections
```
golf_courses    - 16 records (includes Ibiza & Menorca)
hotels          - 38 records
restaurants     - 54 records  
beach_clubs     - 12 records
cafe_bars       - 36 records
contact_inquiries
newsletter_subscriptions
users
user_sessions
user_reviews
```

### Shared Schema Fields (All Partner Types)
```javascript
{
  id: String,           // Unique slug
  name: String,
  type: String,         // "hotel", "restaurant", "beach_club", "cafe_bar"
  description: {        // Multi-language
    en: String, de: String, fr: String, se: String
  },
  image: String,
  location: String,
  deal: { en, de, fr, se },
  discount_percent: Number,
  contact_url: String,
  is_active: Boolean,   // Soft delete
  display_order: Number,// Custom ordering
  created_at: Date,
  updated_at: Date,
  // Type-specific fields...
}
```

### Key Files
- `/app/backend/server.py` - FastAPI with all CRUD endpoints
- `/app/backend/seed_golf_courses.py` - Golf courses seeding
- `/app/backend/seed_all_partners.py` - Full partner migration script
- `/app/frontend/src/components/GolfCourses.jsx`
- `/app/frontend/src/components/HotelPartners.jsx`
- `/app/frontend/src/components/RestaurantPartners.jsx`
- `/app/frontend/src/components/BeachClubPartners.jsx`
- `/app/frontend/src/components/CafeBarsPartners.jsx`

## Prioritized Backlog

### P0 - Critical (User Input Needed)
- [ ] Replace stock photos with real venue images (user to provide URLs)

### P1 - High Priority  
- [ ] Admin Dashboard - Full CRUD UI for all content types
- [ ] Full Search Engine implementation (backend + frontend)
- [ ] Email functionality (needs RESEND_API_KEY)

### P2 - Medium Priority
- [ ] Admin Dashboard - Review moderation
- [ ] Hero video replacement
- [ ] Weather widget integration

## Known Issues
1. **Email broken**: Missing Resend API credentials
2. **Real photos needed**: Some venues still using stock images
3. **Search not functional**: Current search is UI mockup only
4. **Admin Dashboard**: Backend ready, frontend CRUD UI needed

## Integration Dependencies
- Resend (email) - needs API key
- PostHog (analytics) - configured
- Emergent Google OAuth - implemented for reviews

## Data Summary
- **Total Partners**: 156 records in MongoDB
- **Golf Courses**: 16 (Mallorca, Ibiza, Menorca)
- **Hotels**: 38 (Luxury to Boutique)
- **Restaurants**: 54 (Fine dining to casual)
- **Beach Clubs**: 12
- **Cafés & Bars**: 36
