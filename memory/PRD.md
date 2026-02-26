# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a premium golf booking website for Mallorca ("Golfinmallorca.com") with:
- Modern, dynamic UI/UX design ("Ink Wash" color palette: charcoal, cream, slate blue)
- Fixed left-side reviews sidebar
- Admin dashboard for content management
- Real authentic images for all partners

## User Personas
- Golf enthusiasts visiting Mallorca
- Luxury hotel guests seeking golf packages
- Restaurant-goers looking for fine dining with golf packages

## Core Requirements
1. ✅ Full website redesign with "Ink Wash" palette
2. ✅ Fixed reviews sidebar layout
3. ✅ New transparent logo with golden amber color on hero
4. ✅ Social media icons in footer
5. ✅ Improved scroll indicator
6. 🔄 Replace all placeholder images with authentic photos (90% complete)
7. ⏳ Admin dashboard for content management
8. ⏳ Custom booking URLs for cards

## What's Been Implemented

### February 26, 2026
- **Image Replacement Task**: Replaced 40+ placeholder stock photos with actual images from official hotel/restaurant websites
  - Hotels: Can Mostatxins, Son Brull, Yartan, Pleta de Mar, Can Simoneta, Can Aulí, Can Ferrereta, Cal Reiet, Finca Serena, Ten Mallorca
  - Used official CDN sources: Simpson Travel, Bordoy Hotels, Yartan Hotels, Pleta de Mar, Can Simoneta, Can Ferrereta Gallery, Cal Reiet, Finca Serena, Ten Mallorca (Wix)
  - Fixed Can Aulí broken image by using Simpson Travel CDN alternative

### Previous Sessions
- Full UI/UX redesign with "Ink Wash" palette
- New two-column layout with fixed ReviewSidebar
- Logo branding with golden amber color filter
- Footer social media icons (Facebook, Instagram)
- Hero scroll indicator improvement

## Prioritized Backlog

### P0 - Critical
- [ ] Fix remaining restaurant images (Zaranda, Es Fum, Sa Clastra, Andreu Genestra)

### P1 - High Priority  
- [ ] Email functionality (needs RESEND_API_KEY, SENDER_EMAIL)
- [ ] Admin Dashboard implementation
- [ ] Custom booking URLs

### P2 - Medium Priority
- [ ] Hero video replacement
- [ ] Weather widget integration
- [ ] Webpack deprecation warnings

## Technical Architecture

### Frontend
- React + Tailwind CSS
- Components: Navbar, Hero, ReviewSidebar, Footer, partner cards
- State management: React hooks

### Backend
- FastAPI (Python)
- All data currently hardcoded in server.py
- MongoDB configured but unused

### Key Files
- `/app/backend/server.py` - All partner data
- `/app/frontend/src/App.js` - Main layout with sidebar logic
- `/app/frontend/src/components/ReviewSidebar.jsx` - Reviews panel
- `/app/frontend/src/components/Navbar.jsx` - Logo and navigation
- `/app/frontend/tailwind.config.js` - Ink Wash color palette

## Known Issues
1. **Email broken**: Missing Resend API credentials
2. **Some restaurant images**: Still showing broken (need CDN URLs)
3. **Data hardcoded**: Needs MongoDB migration for Admin Dashboard

## Integration Dependencies
- Resend (email) - needs API key
- PostHog (analytics) - configured
- Google OAuth - exists but unused
