# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a premium golf booking website for Mallorca ("Golfinmallorca.com") with:
- Modern, dynamic UI/UX design ("Ink Wash" color palette)
- Admin dashboard for content management
- Real authentic images for all partners
- Partner management with display controls

## What's Been Implemented

### March 10, 2026 (Current Session)

#### ✅ SEARCH FEATURE
Implemented full search functionality:
- **Backend `/api/search` endpoint** - Searches across all partner collections
- **Search by**: Name, location, description
- **Results order**: Golf → Hotels → Mixed (restaurants, beach clubs, cafés)
- **Category filtering** via dropdown or quick pills
- **Real-time results** with 300ms debounce
- **Grey scale badges** for each category type

**Files Modified:**
- `/app/backend/server.py` - Added `/api/search` endpoint
- `/app/frontend/src/components/FloatingSearch.jsx` - Connected to backend

#### ✅ EMAIL SYSTEM
- Added Resend API integration
- Newsletter welcome email with clean design
- Admin subscriber management (Add, Import CSV, Bulk Email)
- Clean text-based email design (no logo image issues)

#### ✅ UI CONSISTENCY UPDATES
- **Review cards**: Changed from white to grey (`bg-stone-100`) on cream background
- **Newsletter form**: Changed from white to cream (`bg-brand-cream`) on grey background
- **Search badges**: Grey scale differentiation per category

### March 2, 2026 (Previous Session)

#### ✅ QUICK VIEW FEATURE
Implemented "Quick View" modal for all partner cards:
- **Eye icon** on every card (top-right corner for Golf, top-left for others)
- **Mobile support**: "View Details" text link appears on mobile (hidden on desktop where hover works)
- **Works on all partner types**: Golf Courses, Hotels, Restaurants, Beach Clubs, Cafés & Bars
- **Modal shows**: Image, location (clickable map link), name, type-specific details (holes/par for golf, price/discount for hotels, Michelin stars for restaurants), description, exclusive offer, and CTA button

**Files Created:**
- `/app/frontend/src/components/QuickViewModal.jsx` - Reusable modal component

**Files Modified:**
- `/app/frontend/src/components/GolfCourses.jsx` - Added quick view button and modal
- `/app/frontend/src/components/HotelPartners.jsx` - Added quick view button and modal
- `/app/frontend/src/components/RestaurantPartners.jsx` - Added quick view button and modal
- `/app/frontend/src/components/BeachClubPartners.jsx` - Added quick view button and modal
- `/app/frontend/src/components/CafeBarsPartners.jsx` - Added quick view button and modal

#### ✅ UNIFIED SECTION SPACING
Fixed inconsistent vertical spacing between all sections:
- Created unified `.section-padding` class in `App.css`
- Applied to ALL sections consistently: About, Golf, Hotels, Restaurants, Cafés, Beach Clubs, Blog, Contact, Newsletter
- Mobile: `2.5rem 1.5rem` (40px vertical, 24px horizontal)
- Desktop: `3rem 3rem` (48px all around)
- Previously had inconsistent spacing ranging from `py-8` to `py-20` to custom `pt-x pb-y` values

**Files Modified:**
- `/app/frontend/src/App.css` - Updated section-padding class
- `/app/frontend/src/components/About.jsx` - Changed to section-padding
- `/app/frontend/src/components/GolfCourses.jsx` - Changed to section-padding  
- `/app/frontend/src/components/BeachClubPartners.jsx` - Changed to section-padding
- `/app/frontend/src/components/CafeBarsPartners.jsx` - Changed to section-padding
- `/app/frontend/src/components/Newsletter.jsx` - Changed from py-20 to section-padding

### December 2, 2026 (Previous Session)

#### ✅ IMAGE UPLOAD FUNCTIONALITY
Direct image upload from computer:
- **Drag & drop** images into the upload area
- **Browse files** button to select images
- Supports JPG, PNG, GIF, WebP formats
- Max file size: 10MB
- Images stored in `/app/backend/uploads/`
- Still supports **URL paste** as alternative
- Live preview of uploaded/pasted images

**Backend Endpoints:**
- `POST /api/upload-image` - Upload image file
- `DELETE /api/upload-image/{filename}` - Delete uploaded image
- `GET /api/uploads/{filename}` - Serve uploaded images

#### ✅ FULL CONTENT MANAGEMENT SYSTEM
Complete admin control over all partners:

| Feature | Status |
|---------|--------|
| Toggle on/off | ✅ Show/hide partners |
| Display limits | ✅ 3-20 or "Show All" per category |
| Image upload | ✅ Direct upload from computer |
| URL editing | ✅ Booking/contact URLs |
| Add/Edit/Delete | ✅ Full CRUD |

### Previous Sessions
- Full database migration (156 partners to MongoDB)
- Golf courses reordered (Son Gual, Alcanada, Pula first)
- Reviews carousel and ghost navigator
- Color consistency across all cards

## Admin Dashboard Features

### Content Manager Tab
Access: Gear icon → Google Login → "Content Manager" tab

**Image Upload Options:**
1. Drag & drop image file
2. Click "Browse Files" to select
3. Paste image URL directly

**All Features:**
- Type tabs (Golf, Hotels, Restaurants, Beach Clubs, Cafés)
- Search and filter
- Active/inactive toggle
- Display limits settings
- Full CRUD operations

## Technical Architecture

### File Storage
```
/app/backend/uploads/     - Uploaded images
                         - Served via /api/uploads/
                         - Filename: {timestamp}_{uuid}.{ext}
```

### MongoDB Collections
```
golf_courses      - 16 records
hotels            - 38 records
restaurants       - 54 records  
beach_clubs       - 12 records
cafe_bars         - 36 records
display_settings  - 1 record
```

### Key Files
- `/app/frontend/src/components/ContentManager.jsx` - Image upload UI
- `/app/backend/server.py` - Upload endpoint
- `/app/backend/uploads/` - Stored images

## Prioritized Backlog

### P1 - High Priority  
- [ ] Full Search Engine implementation
- [ ] Email functionality (needs RESEND_API_KEY)

### P2 - Medium Priority
- [ ] Hero video replacement
- [ ] Weather widget integration

## Data Summary
- **Total Partners**: 156 records in MongoDB
- **Image storage**: Local uploads + external URLs supported
- **Display limits**: Configurable per category
