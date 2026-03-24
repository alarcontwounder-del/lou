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

## Recent Changes (March 24, 2026)
- **SEO Indexing Fix**: Fixed Google Search Console "0 pages indexed" issue
  - Removed 7 hash-based URLs from sitemap (Google can't index `/#section` fragments)
  - Fixed duplicate canonical tags — all pages now update single `#main-canonical` element
  - Added canonical URLs to TermsPage and PrivacyPage (were missing)
  - Updated all sitemap lastmod dates
  - Sitemap now has 31 clean, real page URLs

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
