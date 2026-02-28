# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a premium golf booking website for Mallorca ("Golfinmallorca.com") with:
- Modern, dynamic UI/UX design ("Ink Wash" color palette: charcoal, cream, slate blue)
- Fixed left-side reviews sidebar
- Admin dashboard for content management
- Real authentic images for all partners
- Beach Clubs section added

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
6. ✅ Replace all placeholder images with authentic photos - COMPLETED
7. ✅ Beach Clubs section - COMPLETED (11 beach clubs with images)
8. ✅ Display new data fields (Michelin stars, category/region tags) - COMPLETED
9. ⏳ Admin dashboard for content management
10. ⏳ Custom booking URLs for cards
11. ⏳ Email functionality (blocked - needs API key)

## What's Been Implemented

### February 28, 2026 (Session 4) - Current
- **P0: Fixed ALL Broken Images**:
  - Replaced ALL TripAdvisor CDN URLs (broken) with Unsplash URLs
  - Fixed 11 beach club images
  - Fixed 10+ new hotel images  
  - Fixed 15+ restaurant images (Marc Fosh, Bens d'Avall, profitroom CDN replacements)
  - Replaced external URLs that were showing broken content
  
- **P1: Data Fields Already Displayed**:
  - Hotels: Category tags (Boutique, Luxury Rural, Ultra Luxury, etc.) + Region tags (Tramuntana, Palma, East Coast Luxury, etc.) - WORKING
  - Restaurants: Michelin star badges (11 total: 1x ⭐⭐, 10x ⭐) - WORKING
  - Beach Clubs: "Beach Club" tags + distance to golf courses - WORKING

- **Bug Fix by Testing Agent**:
  - Fixed HotelPartners.jsx: API used wrong parameter (offer_type → type)
  - Fixed RestaurantPartners.jsx: API used wrong parameter (offer_type → type)
  
- **Beach Clubs Section**: Complete with 11 clubs:
  - Purobeach Illetas, Nikki Beach Mallorca, Beso Beach Mallorca
  - Cap Falcó Beach, Gran Folies Beach Club, Anima Beach Palma
  - Mhares Sea Club, Balneario Illetas, Ponderosa Beach
  - Assaona Gastrobeach, Patiki Beach

### February 26, 2026 (Session 3)
- **Review Widget**: Added "Write a Review" functionality with Google OAuth
- Backend APIs for submission and admin approval workflow

### Previous Sessions
- Full UI/UX redesign with "Ink Wash" palette
- Two-column layout with fixed ReviewSidebar
- Logo branding with golden amber color filter
- Footer social media icons

## Prioritized Backlog

### P0 - Critical
- [x] Fix all broken images - ✅ COMPLETED

### P1 - High Priority  
- [x] Display new data fields (Michelin, category/region) - ✅ COMPLETED
- [ ] Email functionality (needs RESEND_API_KEY, SENDER_EMAIL)
- [ ] Admin Dashboard implementation
- [ ] Custom booking URLs

### P2 - Medium Priority
- [ ] Hero video replacement
- [ ] Weather widget integration

## Technical Architecture

### Frontend
- React + Tailwind CSS
- Components: Navbar, Hero, ReviewSidebar, HotelPartners, RestaurantPartners, BeachClubPartners, Footer
- State management: React hooks

### Backend
- FastAPI (Python)
- All data hardcoded in server.py (PARTNER_OFFERS array)
- MongoDB configured for reviews

### Key Files
- `/app/backend/server.py` - All partner data (golf, hotels, restaurants, beach clubs)
- `/app/frontend/src/components/BeachClubPartners.jsx` - Beach clubs section
- `/app/frontend/src/components/HotelPartners.jsx` - Hotels with category/region tags
- `/app/frontend/src/components/RestaurantPartners.jsx` - Restaurants with Michelin stars
- `/app/frontend/src/components/ReviewsSidebar.jsx` - Reviews panel with Write a Review

## Partner Data Summary
- Golf Courses: 12+
- Hotels: 38+
- Restaurants: 45+
- Beach Clubs: 11

## Known Issues
1. **Email broken**: Missing Resend API credentials
2. **Data hardcoded**: Needs MongoDB migration for Admin Dashboard

## Integration Dependencies
- Resend (email) - needs API key
- PostHog (analytics) - configured
- Emergent Google OAuth - implemented for reviews
