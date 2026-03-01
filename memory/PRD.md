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
- **P0: Golf Courses Data Migration to MongoDB** - COMPLETED:
  - Created MongoDB collection `golf_courses` for storing course data
  - Built migration script with proper seeding (`/app/backend/seed_golf_courses.py`)
  - Updated API endpoint `/api/golf-courses` to fetch from MongoDB with fallback to hardcoded data
  - Added CRUD endpoints for golf courses (create, update, delete, reorder)
  - Reordered courses as requested: **Son Gual → Alcanada → Pula** as first three
  - Created database models and routes in `/app/backend/models/` and `/app/backend/routes/`

- **P0: UI Layout Adjustments** - COMPLETED:
  - Reduced vertical spacing between "About Us" and "World-Class Courses" sections
  - About section: `pt-12 pb-6` (reduced bottom padding)
  - Golf Courses section: `pt-8 pb-24 px-6` (reduced top padding)

- **Image Framing Enhancement** - COMPLETED:
  - Added CSS class `.card-image-container` with `object-position: center`
  - All partner cards maintain consistent `h-64` image height with proper aspect ratio

### Previous Sessions
- **Reviews UI Overhaul**: Replaced floating sidebar with compact horizontal carousel
- **Navigation**: Ghost section navigator for quick page jumps
- **UI Consistency**: Standardized colors on all partner cards
- **Content**: Fixed golf courses count (16), cream background throughout
- **Beach Clubs Section**: 11 beach clubs with images
- **Cafés & Bars Section**: 34 venues
- **Floating Search Mockup**: UI ready for implementation

## Technical Architecture

### Database
- **MongoDB Collections**:
  - `golf_courses` - Golf course data with multi-language support (NEW)
  - `contact_inquiries` - Contact form submissions
  - `newsletter_subscriptions` - Newsletter signups
  - `users` - Authenticated users
  - `user_sessions` - Session tokens
  - `user_reviews` - User-submitted reviews

### Golf Courses Schema
```javascript
{
  id: String,           // Unique slug (e.g., "golf-son-gual")
  name: String,
  description: {        // Multi-language
    en: String,
    de: String,
    fr: String,
    se: String
  },
  image: String,
  holes: Number,
  par: Number,
  price_from: Number,
  location: String,
  full_address: String,
  phone: String,
  features: [String],
  booking_url: String,
  is_active: Boolean,   // For soft delete
  display_order: Number,// For custom ordering
  created_at: Date,
  updated_at: Date
}
```

### Key Files
- `/app/backend/server.py` - Main FastAPI application
- `/app/backend/seed_golf_courses.py` - Database seeding script
- `/app/backend/models/golf_course.py` - Pydantic models
- `/app/frontend/src/components/GolfCourses.jsx` - Golf courses display
- `/app/frontend/src/components/About.jsx` - About section

### API Endpoints (Golf Courses)
- `GET /api/golf-courses` - Fetch all active courses (sorted by display_order)
- `POST /api/golf-courses` - Create new course
- `PUT /api/golf-courses/{id}` - Update course
- `DELETE /api/golf-courses/{id}` - Soft delete course
- `POST /api/golf-courses/reorder` - Reorder courses

## Prioritized Backlog

### P0 - Critical
- [x] Golf courses MongoDB migration - ✅ COMPLETED
- [x] Reduce spacing between sections - ✅ COMPLETED
- [x] Reorder golf cards - ✅ COMPLETED
- [ ] Real photos for all venues (user needs to provide URLs)

### P1 - High Priority  
- [ ] Migrate remaining data to MongoDB (Hotels, Restaurants, Beach Clubs, Cafés)
- [ ] Full Search Implementation (after mockup approval)
- [ ] Email functionality (needs RESEND_API_KEY)
- [ ] Admin Dashboard - Golf Courses CRUD

### P2 - Medium Priority
- [ ] Admin Dashboard - Review management
- [ ] Hero video replacement
- [ ] Weather widget integration

## Known Issues
1. **Email broken**: Missing Resend API credentials
2. **Real photos needed**: Partner venues still using stock images
3. **Search not functional**: Current search is UI mockup only

## Integration Dependencies
- Resend (email) - needs API key
- PostHog (analytics) - configured
- Emergent Google OAuth - implemented for reviews

## Partner Data Summary
- Golf Courses: 16 (now in MongoDB)
- Hotels: 38+ (hardcoded in server.py)
- Restaurants: 54+ (hardcoded in server.py)
- Beach Clubs: 12 (hardcoded in server.py)
- Cafés & Bars: 36 (hardcoded in server.py)
