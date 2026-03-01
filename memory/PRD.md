# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a premium golf booking website for Mallorca ("Golfinmallorca.com") with:
- Modern, dynamic UI/UX design ("Ink Wash" color palette: charcoal, cream, slate blue)
- Fixed left-side reviews sidebar (appears after scrolling past hero)
- Admin dashboard for content management
- Real authentic images for all partners
- Beach Clubs section added
- Mini search engine for finding golf courses, hotels, restaurants, etc.

## User Personas
- Golf enthusiasts visiting Mallorca
- Luxury hotel guests seeking golf packages
- Restaurant-goers looking for fine dining with golf packages
- Beach club visitors

## Core Requirements
1. ✅ Full website redesign with "Ink Wash" palette
2. ✅ Fixed reviews sidebar layout
3. ✅ New transparent logo with golden amber color on hero
4. ✅ Social media icons in footer
5. ✅ Improved scroll indicator
6. ✅ Replace all stock images with Pexels professional photos - COMPLETED (106 images replaced)
7. ✅ Beach Clubs section - COMPLETED (11 beach clubs with images)
8. ✅ Display new data fields (Michelin stars, category/region tags) - COMPLETED
9. ✅ Cafés & Bars section - COMPLETED (34 venues)
10. ✅ Floating Search Mockup - COMPLETED (UI mockup for user approval)
11. ⏳ Full Search Implementation - PENDING USER APPROVAL of mockup
12. ⏳ Admin dashboard for content management
13. ⏳ Email functionality (blocked - needs API key)

## What's Been Implemented

### March 1, 2026 (Current Session)
- **P0: Reviews Sidebar Hero Overlap Fix** - COMPLETED:
  - Fixed the bug where ReviewsSidebar overlapped the hero section when scrolling up
  - Changed visibility logic to use `getBoundingClientRect()` for accurate viewport detection
  - Sidebar now only shows when hero is completely out of view (bottom edge < 50px from viewport top)
  - Added smooth slide-in/out animation with opacity and translate transforms
  - Sidebar starts at `top-16` (below navbar) instead of `top-0`
  - Uses `pointer-events-none` when hidden to prevent interaction bugs

### December 2025 (Previous Session)
- **P0: Stock Photo Replacement** - COMPLETED:
  - Replaced ALL 106 Unsplash stock photos with Pexels professional images
  - Fixed blocked CDN URLs (Booking.com, Marriott, Hyatt, IHG) with reliable Pexels alternatives
  - All hotel, restaurant, beach club, and café/bar images now loading correctly
  
- **P0: Floating Search Mockup** - COMPLETED:
  - Created sticky/floating search bar component
  - Category dropdown with all 6 categories (All, Golf, Hotels, Restaurants, Cafés & Bars, Beach Clubs)
  - Quick category filter buttons
  - Multi-language support (EN, DE, FR, SE)
  - Search input field
  - ESC key and click-outside to close
  - "MOCKUP" notice for user approval
  - Positioned above "Made with Emergent" badge

### February 28, 2026 (Session 4)
- **Fixed ALL Broken Images**: Replaced TripAdvisor/external CDN URLs
- **Data Fields Displayed**: Michelin stars, category/region tags
- **Bug Fixes**: API parameter issues in HotelPartners.jsx and RestaurantPartners.jsx

### Previous Sessions
- Beach Clubs Section (11 clubs)
- Cafés & Bars Section (34 venues)
- Review Widget with Google OAuth
- Full UI/UX redesign with "Ink Wash" palette
- Two-column layout with fixed ReviewSidebar

## Prioritized Backlog

### P0 - Critical
- [x] Fix all stock/broken images - ✅ COMPLETED (106 images replaced)
- [x] Floating Search Mockup - ✅ COMPLETED (awaiting user approval)

### P1 - High Priority  
- [ ] Full Search Implementation (after mockup approval)
- [ ] Email functionality (needs RESEND_API_KEY, SENDER_EMAIL)
- [ ] Admin Dashboard implementation
- [ ] Custom booking URLs

### P2 - Medium Priority
- [ ] Hero video replacement
- [ ] Weather widget integration

## Technical Architecture

### Frontend
- React + Tailwind CSS
- Components: Navbar, Hero, ReviewSidebar, HotelPartners, RestaurantPartners, BeachClubPartners, CafeBarsPartners, FloatingSearch, Footer
- State management: React hooks

### Backend
- FastAPI (Python)
- All data hardcoded in server.py (PARTNER_OFFERS array)
- MongoDB configured for reviews

### Key Files
- `/app/backend/server.py` - All partner data (golf, hotels, restaurants, beach clubs, cafes)
- `/app/frontend/src/components/FloatingSearch.jsx` - NEW: Floating search mockup
- `/app/frontend/src/components/BeachClubPartners.jsx` - Beach clubs section
- `/app/frontend/src/components/CafeBarsPartners.jsx` - Cafés & Bars section
- `/app/frontend/src/components/HotelPartners.jsx` - Hotels with category/region tags
- `/app/frontend/src/components/RestaurantPartners.jsx` - Restaurants with Michelin stars

## Partner Data Summary
- Golf Courses: 12+ (including Ibiza & Menorca)
- Hotels: 38+
- Restaurants: 54+
- Beach Clubs: 12
- Cafés & Bars: 36

## Known Issues
1. **Email broken**: Missing Resend API credentials
2. **Data hardcoded**: Needs MongoDB migration for Admin Dashboard
3. **Search not functional**: Current search is UI mockup only

## Integration Dependencies
- Resend (email) - needs API key
- PostHog (analytics) - configured
- Emergent Google OAuth - implemented for reviews
