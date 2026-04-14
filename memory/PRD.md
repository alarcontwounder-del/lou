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
- 57 Hotel partner cards (59 total, 3 inactive) with internal BookingRequestModal
- Restaurant (48), Beach Club (12), Cafe & Bar (36) partner sections — ALL with internal booking forms
- Trip Planner (multi-step wizard with AI itinerary generation)
- Contact form with Resend email integration
- Blog with CMS, social sharing — **11 posts total** (incl. "New Features" post)
- Admin Dashboard with Hotels tab (display_order 1-59 assigned)
- Google Analytics 4 with 6 custom conversion events
- SEO: Dynamic canonical tags, golf course landing pages, sitemap.xml, hreflang tags
- Cookie Consent popup
- Newsletter subscription
- Stripe payment integration
- Multi-language support (EN, DE, FR, SE)
- Weather badge
- Section Navigator (right-side scroll dots)
- Floating Search with **fuzzy matching** (Levenshtein distance)
- **Session-based Favorites System** (sessionStorage)
- **Mobile Card Limit (6 per section)** with Skeleton loaders
- **Startup hotel auto-seed** (ensures all hotels exist on deploy)

## Changes - April 14, 2026

### Search Bug Fix
- Fixed mobile search panel overflow (cropped on left side)
- Added fuzzy search (Levenshtein distance) — tolerates typos like "Gimbo" → "Ginbo"

### New Blog Post: "What's New on golfinmallorca.com"
- English blog post with 6 feature capsules + composite Desktop/Mobile hero image
- Slug: `new-features-golfinmallorca-2026`, added to sitemap.xml

### Translation Keys Fixed
- Added missing i18n keys: `offers.exclusive`, `offers.viewDetails`, `offers.bookNow`, `card.hoverForDetails` in all 4 languages

### All Partner Booking → Internal Forms
- Restaurants, Beach Clubs, Cafés: changed external URL links to internal BookingRequestModal
- All partner types now route through inquiry forms (no external links)

### Hotel Admin Fixes
- "St. Regis Mallorca Resort" deactivated + added to seed exclusion list (won't return)
- Startup seed with exclusion list to prevent re-activating user-deleted hotels
- Assigned sequential `display_order` 1-59 to all hotels

### Hero Image Optimization
- Compressed from **4.1 MB → 308 KB** (92% reduction)
- Added dark green placeholder background (#2d4a2e) to prevent gray flash on load
- Image now served from own server instead of external CDN

### Google Search Console Fix
- Added `Disallow: /*?lang=` to robots.txt to stop Google crawling `?lang=` parameter URLs
- Existing 21 "Alternate page with proper canonical tag" entries will gradually disappear

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
- `hotels`: 59 total (56 active, 3 inactive). 22 have prices, 35 do not.
- `golf_courses`: 16 total, all active
- `restaurants`: 48 total (47 active, 1 inactive)
- `beach_clubs`: 12 total (11 active, 1 inactive)
- `cafe_bars`: 36 total (35 active, 1 inactive)

## Important Notes
- `greenfee365.com` is used for "Book a tee time" links (correct and intended)
- Favorites use sessionStorage (key: gim_session_favorites)
- Mobile limit is 6 cards per section
- Hotel startup seed has EXCLUDED_IDS set to skip user-deleted hotels
- Search supports fuzzy matching (Levenshtein) for typo tolerance
