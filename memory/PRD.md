# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build and refine the Golfinmallorca.com website - a full-featured golf travel portal for Mallorca (and Balearic Islands). The site should showcase golf courses, hotels, restaurants, beach clubs, and cafes/bars. Core goals: beautiful UI/UX, authentic images, comprehensive admin CMS, site-wide search, email system, and robust SEO/GEO targeting.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI, MongoDB
- **Email:** Resend API
- **Auth:** Emergent-managed Google Auth (admin)
- **Analytics:** PostHog
- **SEO:** JSON-LD schemas, sitemap.xml, robots.txt, hreflang, OG tags

## Core Features (Completed)
- [x] Landing page with Hero, About, Golf Courses, Hotels, Restaurants, Beach Clubs, Cafes/Bars sections
- [x] Partner cards with Quick View modal and flip-card interaction
- [x] Admin Dashboard with full CMS (CRUD for all partner types)
- [x] Admin image uploader
- [x] Site-wide floating search
- [x] Newsletter subscription + email via Resend
- [x] Contact form with email notifications
- [x] Reviews carousel + "Write a review" modal
- [x] Multi-language support (EN, DE, SE, FR, ES)
- [x] SEO foundation: sitemap.xml, robots.txt, llms.txt, schema-hub.json
- [x] Google Search Console verified
- [x] **Individual Golf Course Pages** (16 courses with SEO-optimized detail pages)
- [x] **Keyword & Content Strategy Implementation** (March 2026)
- [x] **Blog Content Expansion** (March 2026) — VERIFIED March 19
- [x] **Nearest Golf Course Distance** on ALL partner categories (March 2026)
- [x] **Bug Fixes — Search, Footer, Navigation, Design** (March 2026)
- [x] **Blog Enhancements** (March 2026) — scroll hint, contextual CTA buttons
- [x] **Hero Redesign** (March 2026) — frosted-glass trust badge, improved narrative flow
- [x] **Weather Widget** (March 2026) — real-time Mallorca weather via Open-Meteo API
- [x] **AdminDashboard Refactoring** (March 2026) — 886-line monolith broken into 5 components
- [x] **Webpack Warning Fixes** (March 2026) — patched dev server config
- [x] **Stock Photo Replacement** (March 2026) — ALL 140 partner listings updated:
  - 19 hotels: authentic images from official hotel websites (Belmond, Hilton, Marriott, etc.)
  - 12 beach clubs: authentic images from official venue websites (Purobeach, Nikki Beach, etc.)
  - 54 restaurants: themed Unsplash images categorized by cuisine type
  - 36 cafes/bars: themed Unsplash images categorized by venue type
  - 9 restaurants with official images from their actual websites (Marc Fosh, DINS Santi Taura, etc.)
  - Zero Pexels stock images remaining across all categories
- [x] **Bug Fix: Nearest Golf Distance Restored** (March 2026) — Re-ran migration + updated seed script to auto-run migration after every seed
- [x] **Bug Fix: QuickView (Eye Icon) Verified** (March 2026) — Working correctly across all partner categories
- [x] **Data Cleanup: Duplicate Entry Removal** (March 2026) — Removed 6 duplicate restaurant entries (DINS Santi Taura, Zaranda, Es Fum, Es Verger, Izakaya Mallorca, Es Fanals duplicates)
- [x] **Data Cleanup: Duplicate Image Deduplication** (March 2026) — Fixed 6 pairs of duplicate images (Mirabona, Es Guix, Ginbo, Altamar, Yara, Social Club)
- [x] **Bug Fix: Broken Images Replaced** (March 2026) — Fixed 5 broken external images (DINS Santi Taura, Castillo Hotel Son Vida, Maca de Castro, Purobeach Illetas, Beso Beach)
- [x] **Bug Fix: Lobster Club nearest_golf** (March 2026) — Added missing nearest_golf data for Lobster Club
- [x] **Display Settings Admin Tab** (March 2026) — Added Display Settings panel to Admin Dashboard for toggling categories on/off and controlling venue display limits
- [x] **Card Flip Delay Fix** (March 2026) — Increased transition-delay to 3s for usable card interactions
- [x] **St. Regis Image Fix** (March 2026) — Replaced with optimized authentic image (66KB vs 440KB)
- [x] **Email Logo Fix** (March 2026) — Replaced with user-provided logo, white header design
- [x] **X (Twitter) Footer Icon** (March 2026) — Added X social media icon linking to https://x.com/Golfinmallorca
- [x] **Scroll Dots Fix** (March 2026) — Fixed Tailwind dynamic class issue preventing desktop hover effect
- [x] **Golf Trip Planner** (March 2026) — 3-step wizard modal: select services (Hotel/Michelin Dining/Beach Club), pick date/time/group size, submit contact details. Backend stores requests + sends email notification
- [x] **Golf Trip Planner Bug Fixes** (March 2026) — Fixed 5 bugs:
  - Next button now works for any single service or combination (transfer-only, hotel-only, etc.)
  - Deselecting services clears them from the suggested itinerary
  - Calendar now accepts date range (arrival + departure) using react-day-picker range mode
  - Mercedes S-Class image added to transfer itinerary card
  - Calendar selection colors changed from salmon to greyscale (stone palette)
  - Wizard always shows 4 steps regardless of service selection
  - Backend now accepts departure_date field for date ranges
  - Email templates updated to show arrival → departure dates
- [x] **Trip Planner UX Enhancements** (March 2026):
  - Added sticky scroll-down indicator (bouncing chevron + gradient fade) when content overflows
  - Updated budget ranges: Moderate €1,000–€2,500, Premium €2,500–€4,000, Luxury €4,000+
  - Added pricing context note: "Approx. prices based on high season for 3 days"
  - Added 15% budget buffer note referencing Balearic Sustainable Tourism Tax (€4.40/night)
  - Replaced AI-generated Mercedes image with user's provided authentic S-Class photo

## Blocked
- [ ] Google Business Profile reinstatement (user needs to change category)
- [ ] Sitemap submission (pending production deployment)
- [ ] External review links (pending user URLs)

## Backlog / Future
- [ ] SEO-friendly individual blog post routes (/blog/slug) instead of modal (P0 - recommended)
- [ ] Hero video replacement (P1)
- [ ] Golf Packages page with bundled course + hotel deals (P2)
- [ ] Stripe payment integration for package deposits (P2)

## Architecture
```
/app/
├── backend/
│   ├── server.py              # API endpoints, partner data, blog data
│   ├── seed_all_partners.py   # Seeds partner data to MongoDB
│   └── tests/
│       └── test_partner_images.py  # Image URL validation tests
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── admin/              # Refactored admin sub-components
│       │   ├── AdminDashboard.jsx  # Shell component
│       │   ├── Blog.jsx            # Blog with scroll hint + CTA
│       │   ├── Hero.jsx            # Redesigned with trust badge
│       │   ├── Navbar.jsx          # Weather widget integrated
│       │   ├── WeatherBadge.jsx    # Real-time weather component
│       │   └── ...
│       ├── context/DataContext.jsx  # Partner data + display settings
│       └── App.js                  # Routes and navigation
└── public/
    ├── index.html, sitemap.xml, robots.txt, llms.txt, schema-hub.json
```

## Key API Endpoints
- `GET /api/hotels` - All hotels (38)
- `GET /api/restaurants` - All restaurants (48)
- `GET /api/cafe-bars` - All cafe/bars (36)
- `GET /api/beach-clubs` - All beach clubs (12)
- `GET /api/golf-courses` - All golf courses
- `GET /api/search?q=<query>` - Site-wide search
- `GET /api/blog` - All blog posts
- `POST /api/newsletter/subscribe` - Newsletter signup
- `POST /api/contact` - Contact form
- `POST /api/trip-planner` - Trip Planner lead capture (accepts date + departure_date)
- `GET /api/trip-planner` - Retrieve trip planner requests (admin)
- `GET /api/auth/google` - Google OAuth

## Important Technical Notes
- Navigation uses React Router state + requestAnimationFrame for scroll-to-section
- Blog uses modal detail view (not separate routes — SEO improvement recommended)
- GolfCourseLanding/GolfHolidaysPage/BookTeeTimesPage use React.lazy
- Hero images: user-provided photos via HERO_IMAGE_OVERRIDE map
- Navbar has `variant="light"` prop for content/landing pages
- Multi-language feature was explicitly dropped by user
- Partner data seeded from PARTNER_OFFERS in server.py → MongoDB via seed_all_partners.py
