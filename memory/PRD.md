# Golf in Mallorca — Product Requirements Document

## Original Problem Statement
Build a full-featured golf travel portal for Mallorca with authentic images, performant UI, fully functional partner cards, robust email contact forms, and a comprehensive "Golf Trip Planner" lead capture tool. The site must be visually consistent and highly responsive.

## Architecture
- **Frontend**: React, Tailwind CSS, Shadcn UI, i18n multi-language
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **Storage**: Emergent Integrations Object Storage
- **Communications**: Resend SDK (verified domain)
- **Payments**: Stripe API (LIVE MODE)
- **Database**: MongoDB

## What's Been Implemented (Completed)
- Full golf course catalog with 16 individual landing pages
- Hotel, Restaurant, Beach Club, Café & Bar partner sections
- Custom Booking Request system for Restaurants & Beach Clubs (with Resend emails)
- Trip Planner lead capture tool
- Live Stripe payment integration
- Blog with 10 SEO-optimized articles
- Multi-language support (EN, DE, FR, SV)
- Newsletter signup
- Admin Dashboard with Content Manager
- Weather Widget (7-day forecast)
- Review system with social proof
- Cookie Consent (GDPR)
- Transparent favicon
- Venue display ordering (position control)
- QuickView modal redesign
- Schema.org structured data (Organization, GolfCourse, LocalBusiness)
- SEO meta tags, OG tags, Twitter cards
- Sitemap.xml and robots.txt

## Recent Changes (March 30, 2026)
- **Language Dropdown Glass Effect**: Replaced Shadcn DropdownMenu with custom hover-based dropdown matching WeatherBadge's glass/translucent style (bg-white/10 backdrop-blur-xl on hero, bg-white/90 when scrolled)
- **21 New Hotels Added**: Seeded 21 new hotels from user's PDF list (total now 59). All with multi-language descriptions (EN/DE/FR/SV), location, nearest golf course, distance, images. Added null-safe checks for `deal` and `description` fields across HotelPartners, RestaurantPartners, BeachClubPartners components.

## Changes from March 26, 2026
- **Critical SEO Fix: Inline Route Script**: Added synchronous JavaScript in `index.html` `<head>` that sets correct canonical, title, description, OG, Twitter, and hreflang tags based on the URL path. This executes during Google's render phase, fixing the root cause of "Alternate page with proper canonical tag" (11 pages) and "Crawled - currently not indexed" (16 pages).
- Root cause identified: Deployment serves the same `index.html` for all SPA routes (ignoring pre-rendered subdirectory files), so every page had homepage meta tags.
- Added IDs to all hreflang tags for dynamic page-specific updates.

## Changes from March 24, 2026
- **SEO Indexing Fix**: Fixed Google Search Console "0 pages indexed" issue
  - Removed 7 hash-based URLs from sitemap (Google can't index `/#section` fragments)
  - Fixed duplicate canonical tags — all pages now update single `#main-canonical` element
  - Added canonical URLs to TermsPage and PrivacyPage (were missing)
  - Updated all sitemap lastmod dates
  - Sitemap now has 31 clean, real page URLs
- **SEO Pre-rendering**: Added build-time pre-rendering for all 30 sub-pages
  - Each route gets its own `index.html` with correct title, description, canonical, OG/Twitter tags
  - Runs automatically after `craco build` via `postbuild` script (`prerender.js`)
  - No puppeteer/browser dependency — pure Node.js string replacement
  - Covers: 16 golf courses, 10 blog posts, 4 static pages

## Pending / Blocked Items
- Google Business Profile suspended (user must appeal with Google)
- External review links for "Write a Review" modal (waiting for URLs from user)
- Hero Video on homepage (waiting for user to provide video file)

## Backlog (P2/P3)
- Refactor `TripPlanner.jsx` (~800 lines → smaller components)
- Refactor `server.py` (extract HTML email templates, >2300 lines)
- Golf Packages page (bundle course + hotel deals)
- TheFork B2B API integration (if user gets developer account)

## Key API Endpoints
- `POST /api/booking-request` — Restaurant/Beach Club reservations + Resend emails
- `POST /api/display-settings` — Content Manager visibility/limits
- `GET /api/golf-courses/:id` — Individual course data
- `GET /api/blog-posts` — Blog content

## DB Collections
- `golf_courses`, `hotels`, `restaurants`, `beach_clubs`, `cafe_bars` — with `display_order`, `is_active`
- `booking_requests` — `{id, venue_id, venue_name, venue_type, date, time, guests, name, email, phone, dietary_preferences, allergies, special_requests, created_at}`

## Critical Notes
- **PRODUCTION ENVIRONMENT**: Stripe is in LIVE mode. Be extremely cautious.
- **Deployment**: Changes must be pushed via "Deploy" → "Replace deployment" → "Existing database"
- **After SEO fix deployment**: Resubmit sitemap in Google Search Console
