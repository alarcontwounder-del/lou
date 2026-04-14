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
- 56 Active Hotel partner cards (59 total, 3 inactive) with internal BookingRequestModal
- Restaurant (48), Beach Club (12), Cafe & Bar (36) partner sections — ALL with internal booking forms
- Trip Planner (multi-step wizard with AI itinerary generation)
- Contact form with Resend email integration
- Blog with CMS, social sharing — **11 posts total** (incl. "New Features" post)
- Admin Dashboard with Hotels tab (display_order 1-59 assigned)
- Google Analytics 4 with 6 custom conversion events
- SEO: Dynamic canonical tags, golf course landing pages, sitemap.xml, hreflang tags
- Cookie Consent popup, Newsletter subscription, Stripe payment integration
- Multi-language support (EN, DE, FR, SE), Weather badge
- Section Navigator (right-side scroll dots)
- Floating Search with **fuzzy matching** (Levenshtein distance)
- **Session-based Favorites System** (sessionStorage)
- **Mobile Card Limit (6 per section)** with Skeleton loaders
- **Startup hotel auto-seed** (ensures all hotels exist on deploy)

## Changes - April 14, 2026

### Code Quality Fixes Applied
**Critical:**
- Fixed skeleton key props: replaced index-only keys with prefixed unique keys (`skeleton-${i}`) in 5 components
- Added eslint-disable comments for mount-only useEffect hooks (PaymentsTab, PartnerImagesTab)
- Verified `seed_all_partners.py` already uses safe `ast.literal_eval()` (not `eval()`)

**Important:**
- Replaced `var` → `const`/`let` in TermsPage.jsx, PrivacyPage.jsx, ContentManager.jsx
- Removed `console.log` statement in ContentManager.jsx
- Verified all React hook dependencies are correct (useIsMobile, FavoritesContext, DataContext, WeatherBadge, TripPlanner)

**Deferred to P3 (refactoring):**
- Component decomposition (BlogPostPage, AdminDashboard, FloatingSearch, Navbar, ContentManager)
- Email template extraction to Jinja2
- Search function complexity reduction in server.py

### Search Bug Fix
- Fixed mobile search panel overflow (cropped on left side)
- Added fuzzy search (Levenshtein distance) — tolerates typos

### New Blog Post
- "What's New on golfinmallorca.com" - English, 6 feature capsules, composite hero image

### All Partner Booking → Internal Forms
- Restaurants, Beach Clubs, Cafes: changed external URL links to internal BookingRequestModal

### Hotel Admin Fixes
- "St. Regis Mallorca Resort" deactivated + seed exclusion
- Sequential display_order 1-59 assigned
- Startup auto-seed with exclusion list

### Performance
- Hero image compressed: 4.1 MB → 308 KB (92% reduction)
- Dark green placeholder background prevents gray flash

### SEO
- `robots.txt`: Added `Disallow: /*?lang=` to stop crawling language parameter URLs
- Translation keys fixed (offers.exclusive, viewDetails, bookNow) in 4 languages

## Pending/Upcoming Tasks
### P1 - Awaiting User Input
- Add Hero Video to homepage (waiting for video file)
- Add "From €[Price]" to 35 remaining hotels (waiting for pricing or web-scrape approval)
- External review links for "Write a review" modal (waiting for URLs)

### P2
- Activate teetimescancun.net / teetimespuntacana.com footer links
- Google Business Profile appeal (user action)

### P3 - Refactoring
- Decompose large components: TripPlanner (~800 lines), ContentManager, BlogPostPage, FloatingSearch, Navbar
- Extract email templates to Jinja2/HTML files
- Reduce search function complexity in server.py
- Golf Packages page (bundle course and hotel deals)
