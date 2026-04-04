# Golf in Mallorca — Product Requirements Document

## Original Problem Statement
Build a full-featured golf travel portal for Mallorca with authentic images, performant UI, fully functional partner cards, robust email contact forms, and a comprehensive "Golf Trip Planner" lead capture tool. The site must be visually consistent and highly responsive.

## Architecture
- **Frontend**: React, Tailwind CSS, Shadcn UI, i18n multi-language
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **Storage**: Emergent Integrations Object Storage
- **Communications**: Resend SDK (verified domain)
- **Payments**: Stripe API (LIVE MODE)
- **Database**: MongoDB (DB: test_database)

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
- Cookie Consent (GDPR) — fixed glass-effect artifact
- Transparent favicon
- Venue display ordering (position control)
- QuickView modal redesign
- Schema.org structured data (Organization, GolfCourse, LocalBusiness)
- SEO meta tags, OG tags, Twitter cards
- Sitemap.xml and robots.txt
- Language Dropdown Glass Effect
- SEO Pre-rendering via custom Playwright-based prerender.js script
- Dynamic Inline SEO Script in index.html for Googlebot rendering
- 59 Hotels total (38 original + 21 newly added) with full data, real photos, and pricing

## Recent Changes (March 31, 2026)
- **Code Quality Report v2 (April 4)**: Applied fixes — empty catch blocks (PaymentsTab, TripPlanner), useMemo for ReviewSection filtered reviews, email templates adapted for hotel/restaurant. Security (eval→ast.literal_eval) was already fixed. Hook dependencies verified as correct (use module constants + stable setState).
- **Hotel Booking Inquiry Form (April 4)**: All hotel "Book" buttons now open the BookingRequestModal form (check-in/check-out, guests, name, email, phone, message) instead of linking to external hotel websites. Same approved design as restaurants.
- **Blog Share Buttons (April 4)**: Added WhatsApp, Twitter, Facebook share buttons to every blog article.
- **Footer Other Destinations (April 4)**: New "Other Destinations" section with golfgatecatalunya.es (active) and teetimescancun.net / teetimespuntacana.com (coming soon).
- **SEO Canonical Fix (April 3)**: Fixed "Alternate page with proper canonical tag" Google Search Console error. Root cause: static canonical in HTML always pointed to homepage regardless of URL. Fixed by making canonical, og:url, and hreflang tags dynamic via inline scripts that execute immediately based on `window.location.pathname`. Each page now has its own correct canonical URL from the first byte of HTML.
  - `book_tee_time_click` (Hero CTA)
  - `trip_planner_open` / `trip_planner_submit` (Trip Planner)
  - `booking_request_submit` (Restaurant/Beach Club reservations)
  - `contact_form_submit` (Contact form)
  - `newsletter_signup` (Newsletter)
  - `course_booking_click` (Golf course card bookings)
- **Hotels Dashboard Tab**: Added "Hotels" tab to admin backoffice with on/off toggles, search, and active/inactive filters (57 active, 2 inactive)
- **Cookie Popup Transparency**: Restored to `bg-stone-900/60` (was incorrectly changed to `/85`)
- **Code Quality Refactoring (March 31)**: Applied all fixes from automated Code Quality Report:
  - Replaced all `var` with `const`/`let` in `WeatherBadge.jsx`
  - Fixed array-index-as-key anti-patterns in `GolfCourses.jsx`, `GolfCourseLanding.jsx`, `BlogPostPage.jsx`, `ReviewSection.jsx`
  - Fixed `useEffect` dependency in `use-toast.js`
  - Fixed Python test linting: F541 (f-strings without placeholders), E712 (boolean comparisons), E722 (bare except)
  - All ESLint and ruff linting passes clean
- **Price Range Filter**: Added to hotels section — "All", "Under €200", "€200–€400", "€400+" filter pills + "Sort by Price" toggle (cycles asc/desc/off). Shows hotel count.
- **Greyed-Out Inactive Cards**: When admin sets `is_active=false` on any partner (hotel/restaurant/beach club/café), the card turns grayscale, shows "Coming Soon" badge, disables flip animation, QuickView, booking links, and maps. Inactive cards sort to end of grid. Applied across all 4 partner types.
- **Search Fix**: Hotel search results now open hotel websites on click (added `contact_url` fallback to search API).
- **Cookie Popup Fix**: Increased opacity to `bg-stone-900/85` to eliminate hero content bleeding through glass effect.

## Pending / Blocked Items
- Google Business Profile suspended (user must appeal with Google)
- External review links for "Write a Review" modal (waiting for URLs from user)
- Hero Video on homepage (waiting for user to provide video file)

## Backlog (P2/P3)
- Refactor `TripPlanner.jsx` (~800 lines -> smaller components)
- Refactor `server.py` (>2300 lines, could be split)
- Golf Packages page (bundle course + hotel deals)

## Key API Endpoints
- `GET /api/all-partners` — Returns ALL partners (including inactive) with `is_active` field
- `GET /api/partner-offers` — Returns ALL partners (including inactive)
- `GET /api/search?q=&category=` — Returns only ACTIVE partners; includes `contact_url` fallback for `booking_url`
- `POST /api/booking-request` — Restaurant/Beach Club reservations + Resend emails
- `POST /api/display-settings` — Content Manager visibility/limits

## Hotel Data Schema
- Old hotels (38): `{id, name, type, description, image, location, deal, original_price, offer_price, discount_percent, contact_url, is_active, display_order, distance_km, nearest_golf, category?, region?}`
- New hotels (21): `{id, name, type, description, image, location, deal, offer_price, contact_url, is_active, display_order, distance_km, nearest_golf, category, region}`
- New hotels use "From €X" display (no discount_percent/original_price)
- `is_active=false` triggers greyed-out card treatment across all partner types

## Critical Notes
- **PRODUCTION ENVIRONMENT**: Stripe is in LIVE mode. Be extremely cautious.
- **Database**: Active MongoDB database is `test_database` (NOT `golf_mallorca`)
- **Inactive Cards**: Admin toggle `is_active` now shows/hides card functionality (not visibility)
