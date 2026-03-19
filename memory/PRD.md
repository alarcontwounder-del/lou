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

## Blocked
- [ ] Google Business Profile reinstatement (user needs to change category)
- [ ] Sitemap submission (pending production deployment)
- [ ] External review links (pending user URLs)

## Backlog / Future
- [ ] SEO-friendly individual blog post routes (/blog/slug) instead of modal (P1 - recommended)
- [ ] Hero video replacement (P2)
- [ ] Golf Packages page with bundled course + hotel deals (P2)

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
- `GET /api/restaurants` - All restaurants (54)
- `GET /api/cafe-bars` - All cafe/bars (36)
- `GET /api/beach-clubs` - All beach clubs (12)
- `GET /api/golf-courses` - All golf courses
- `GET /api/search?q=<query>` - Site-wide search
- `GET /api/blog` - All blog posts
- `POST /api/newsletter/subscribe` - Newsletter signup
- `POST /api/contact` - Contact form
- `GET /api/auth/google` - Google OAuth

## Important Technical Notes
- Navigation uses React Router state + requestAnimationFrame for scroll-to-section
- Blog uses modal detail view (not separate routes — SEO improvement recommended)
- GolfCourseLanding/GolfHolidaysPage/BookTeeTimesPage use React.lazy
- Hero images: user-provided photos via HERO_IMAGE_OVERRIDE map
- Navbar has `variant="light"` prop for content/landing pages
- Multi-language feature was explicitly dropped by user
- Partner data seeded from PARTNER_OFFERS in server.py → MongoDB via seed_all_partners.py
