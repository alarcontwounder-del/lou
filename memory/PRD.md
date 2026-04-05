# Golf in Mallorca - Product Requirements Document

## Original Problem Statement
Build a full-featured golf travel portal for Mallorca with authentic images, performant UI, fully functional partner cards, robust email contact forms, a comprehensive "Golf Trip Planner", Google Analytics tracking, and solid SEO routing. The site captures leads by routing hotel bookings through internal inquiry forms.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, Motor (async MongoDB)
- **Architecture**: SPA with dynamic SEO routing
- **Tracking**: GA4 custom events
- **Integrations**: OpenAI/Emergent LLMs, Gemini Image Gen, Emergent Object Storage, Resend (Emails), Stripe (Payments), Google Analytics 4

## What's Been Implemented
- 16 Golf Course partner cards with flip animations, SEO landing pages
- 59 Hotel partner cards with internal BookingRequestModal (not external links)
- Restaurant (48), Beach Club (12), Cafe & Bar (36) partner sections
- Trip Planner (multi-step wizard with AI itinerary generation)
- Contact form with Resend email integration
- Blog with CMS, social sharing (WhatsApp, Twitter, Facebook)
- Admin Dashboard with Hotels tab
- Google Analytics 4 with 6 custom conversion events
- SEO: Dynamic canonical tags, golf course landing pages
- Cookie Consent popup
- Newsletter subscription
- Stripe payment integration
- Multi-language support (EN, DE, FR, SE)
- Weather badge
- Section Navigator (right-side dots)
- Floating Search
- Code Quality improvements (var->let/const, React Hook deps, useMemo)
- **Session-based Favorites System** (sessionStorage) - heart icons on all card types, floating button with counter, sliding panel with grouped items
- **Mobile Card Limit (6 per section)** - Shows 6 cards on mobile with "View All" expand button, all cards on desktop
- **Skeleton Loading States** - Animated skeleton cards during data loading for all sections

## Recent Changes (Apr 5, 2026)
### Mobile UI Bug Fixes
- Fixed: Scroll indicator overlapping Trip Planner pill on mobile (hidden on <640px)
- Fixed: "Play Golf Wherever You Are" banner mobile layout (full-width button, smaller text)
- Fixed: Contact form "Book Your Mallorca Golf Holiday" cut off on right (overflow-hidden)
- Improved: Added decoding="async" to card images for faster mobile loading

### Session Favorites System
- Created FavoritesContext (sessionStorage - clears on browser close)
- Heart icon buttons on ALL card types: golf (top-left), hotels/restaurants/beach clubs/cafes (bottom-right)
- Floating heart button (bottom-right) with count badge
- Sliding panel "My List" with items grouped by type, remove buttons, clear all

### Mobile Card Limit + Skeleton Loading
- All 5 sections limited to 6 cards on mobile (<768px)
- "View all X items" button expands to show all cards
- Desktop shows all cards, no limit, no button
- Skeleton loading placeholders (animate-pulse) while data loads
- Custom `useIsMobile` hook with matchMedia for responsive detection

## Confirmed Working (User + Testing Agent Verified)
- Logo on mobile navbar
- SectionNavigator dots on right side
- Hotel Booking Flow
- GA4 Tracking
- SEO Canonicals
- Emails
- Admin Dashboard
- Favorites System (iteration 35)
- Mobile Card Limit (iteration 36)

## Files Reference
### Favorites System
- `/app/frontend/src/context/FavoritesContext.jsx`
- `/app/frontend/src/components/FavoriteButton.jsx`
- `/app/frontend/src/components/FavoritesPanel.jsx`

### Mobile Limit + Skeleton
- `/app/frontend/src/hooks/useIsMobile.js`
- `/app/frontend/src/components/CardSkeleton.jsx`
- Modified: GolfCourses.jsx, HotelPartners.jsx, RestaurantPartners.jsx, BeachClubPartners.jsx, CafeBarsPartners.jsx

## Pending/Upcoming Tasks
### P1 - Awaiting User Input
- Add Hero Video to homepage (waiting for video file)
- Add "From [Price]" to 35 remaining hotels (waiting for pricing list)
- External review links for "Write a review" modal (waiting for URLs)

### P2
- Activate `teetimescancun.net` and `teetimespuntacana.com` footer links
- Google Business Profile appeal (user action)

### P3 - Future
- Refactor large components: TripPlanner.jsx (~800 lines), ContentManager.jsx, BlogPostPage.jsx, server.py
- Golf Packages page (bundle course and hotel deals)

## Key DB Schema
- `hotels`: 59 total (57 active, 2 inactive). 36 real photos, 23 stock. 24 have prices, 35 do not.

## Important Notes
- DO NOT tell user images were lost - 36 real images are safe in DB
- Hotel images may appear broken in preview due to hotlink protection
- LIVE Stripe key is active
- Favorites use sessionStorage (key: gim_session_favorites) — data clears when browser closes
- Mobile limit is 6 cards, hardcoded as MOBILE_LIMIT constant in each section component
