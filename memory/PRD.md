# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a premium golf booking website for Mallorca ("Golfinmallorca.com") with:
- Modern, dynamic UI/UX design ("Ink Wash" color palette: charcoal, cream, slate blue)
- Admin dashboard for content management
- Real authentic images for all partners
- Beach Clubs section
- Mini search engine for finding golf courses, hotels, restaurants, etc.

## What's Been Implemented

### December 1, 2026 (Current Session)

#### ✅ FULL DATABASE MIGRATION COMPLETE
All partner data migrated from hardcoded `server.py` to MongoDB:

| Collection | Records | Status |
|------------|---------|--------|
| golf_courses | 16 | ✅ Migrated |
| hotels | 38 | ✅ Migrated |
| restaurants | 54 | ✅ Migrated |
| beach_clubs | 12 | ✅ Migrated |
| cafe_bars | 36 | ✅ Migrated |
| **Total** | **156** | ✅ Complete |

#### ✅ ADMIN DASHBOARD - CONTENT MANAGER UI
New Content Manager component with full CRUD capabilities:
- **File**: `/app/frontend/src/components/ContentManager.jsx`
- **Features**:
  - Tab-based navigation for all 5 partner types (Golf, Hotels, Restaurants, Beach Clubs, Cafés)
  - Search/filter functionality within each tab
  - Add New partner button with full form
  - Edit existing partners (all fields including multi-language descriptions)
  - Delete partners (soft delete)
  - Image preview in forms
  - Compact card grid view
- **Access**: Admin Dashboard → "Content Manager" tab

#### ✅ API ENDPOINTS (Full CRUD)
Each partner type has complete REST API:
- `GET /api/{type}` - List all
- `POST /api/{type}` - Create new
- `PUT /api/{type}/{id}` - Update
- `DELETE /api/{type}/{id}` - Soft delete

**Endpoints:**
- `/api/golf-courses`
- `/api/hotels`
- `/api/restaurants`
- `/api/beach-clubs`
- `/api/cafe-bars`
- `/api/all-partners` - Combined view

#### ✅ OTHER COMPLETED TASKS
- Golf courses reordered: **Son Gual → Alcanada → Pula** as first three
- Reduced spacing between "About Us" and "World-Class Courses" sections

### Previous Sessions
- Reviews UI: Compact horizontal carousel
- Ghost section navigator
- Standardized colors across all partner cards
- Beach Clubs Section (12 clubs)
- Cafés & Bars Section (36 venues)
- Floating Search Mockup (UI ready)

## Technical Architecture

### MongoDB Collections
```
golf_courses    - 16 records
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

### Key Files
- `/app/backend/server.py` - FastAPI with all CRUD endpoints
- `/app/backend/seed_golf_courses.py` - Golf courses seeding
- `/app/backend/seed_all_partners.py` - Full partner migration script
- `/app/frontend/src/components/ContentManager.jsx` - **NEW** Admin Content Manager
- `/app/frontend/src/components/AdminDashboard.jsx` - Updated with Content tab

## Prioritized Backlog

### P0 - Critical (User Input Needed)
- [ ] Replace stock photos with real venue images (user to provide URLs)

### P1 - High Priority  
- [ ] Full Search Engine implementation (backend + frontend)
- [ ] Email functionality (needs RESEND_API_KEY)

### P2 - Medium Priority
- [ ] Hero video replacement
- [ ] Weather widget integration

### P3 - Low Priority
- [ ] Fix webpack deprecation warnings

## Known Issues
1. **Email broken**: Missing Resend API credentials
2. **Real photos needed**: Some venues still using stock images
3. **Search not functional**: Current search is UI mockup only

## Admin Dashboard Access
1. Click the gear icon in the navigation bar
2. Login with Google OAuth (Emergent-managed)
3. Access tabs: Contacts | Subscribers | Pending Reviews | **Content Manager**

## Data Summary
- **Total Partners**: 156 records in MongoDB
- **Golf Courses**: 16 (Mallorca, Ibiza, Menorca)
- **Hotels**: 38 (Luxury to Boutique)
- **Restaurants**: 54 (Fine dining to casual)
- **Beach Clubs**: 12
- **Cafés & Bars**: 36
