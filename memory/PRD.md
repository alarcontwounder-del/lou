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
- Blog with CMS, social sharing (WhatsApp, Twitter, Facebook) — **11 posts total**
- Admin Dashboard with Hotels tab
- Google Analytics 4 with 6 custom conversion events
- SEO: Dynamic canonical tags, golf course landing pages, sitemap.xml
- Cookie Consent popup
- Newsletter subscription
- Stripe payment integration
- Multi-language support (EN, DE, FR, SE)
- Weather badge
- Section Navigator (right-side dots)
- Floating Search with **fuzzy matching** (Levenshtein distance)
- Code Quality improvements (var->let/const, React Hook deps, useMemo)
- **Session-based Favorites System** (sessionStorage)
- **Mobile Card Limit (6 per section)** with Skeleton loaders
- **"New Features" Blog Post** with composite Desktop+Mobile hero image

## Recent Changes (Apr 9, 2026)
### Search Bug Fix
- Fixed: Mobile search panel overflow (panel was cropped on left side on small screens)
- Added: Fuzzy search matching (Levenshtein distance) — tolerates typos like "Gimbo" finding "Ginbo"
- Threshold scales with word length: 1 edit for 4-6 char words, 2 edits for 7+ char words

### New Blog Post: "What's New on golfinmallorca.com"
- Created blog post in English announcing 6 new site features (from LinkedIn capsules)
- Generated composite hero image: Desktop + Mobile screenshots side-by-side with phone frame
- Added to sitemap.xml
- Slug: `new-features-golfinmallorca-2026`
- Features covered: 24/7 Tee Times, Luxury Hotels, AI Trip Planner, Favourites, Google Maps, Gastronomy Guide

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
- Fuzzy Search (Apr 9)
- New Features Blog Post (Apr 9)

## Files Reference
### Search
- `/app/frontend/src/components/FloatingSearch.jsx` (mobile-responsive fix)
- `/app/backend/server.py` (fuzzy search `_fuzzy_match()` function)

### Blog
- `/app/backend/data/partners.py` (BLOG_POSTS array — 11 posts)
- `/app/backend/uploads/blog_new_features_hero.jpg` (composite hero image)
- `/app/frontend/public/sitemap.xml` (updated with new blog URL)

### Favorites System
- `/app/frontend/src/context/FavoritesContext.jsx`
- `/app/frontend/src/components/FavoriteButton.jsx`
- `/app/frontend/src/components/FavoritesPanel.jsx`

### Mobile Limit + Skeleton
- `/app/frontend/src/hooks/useIsMobile.js`
- `/app/frontend/src/components/CardSkeleton.jsx`

## Pending/Upcoming Tasks
### P1 - Awaiting User Input
- Add Hero Video to homepage (waiting for video file)
- Add "From €[Price]" to 35 remaining hotels (waiting for pricing list or user approval to web-scrape)
- External review links for "Write a review" modal (waiting for URLs)

### P2
- Activate `teetimescancun.net` and `teetimespuntacana.com` footer links
- Google Business Profile appeal (user action)

### P3 - Future
- Refactor large components: TripPlanner.jsx (~800 lines), ContentManager.jsx, BlogPostPage.jsx, server.py
- Golf Packages page (bundle course and hotel deals)

## Key DB Schema
- `hotels`: 59 total (57 active, 2 inactive). 22 have prices, 35 do not.
- `golf_courses`: 16 total, all active, all with prices
- `restaurants`: 48 total (47 active, 1 inactive)
- `beach_clubs`: 12 total (11 active, 1 inactive)
- `cafe_bars`: 36 total (35 active, 1 inactive)

## Important Notes
- Hotel images may appear broken in preview due to hotlink protection
- LIVE Stripe key is active
- Favorites use sessionStorage (key: gim_session_favorites)
- Mobile limit is 6 cards per section
- `greenfee365.com` is used for "Book a tee time" links (correct and intended)
- Search now supports fuzzy matching for typo tolerance
