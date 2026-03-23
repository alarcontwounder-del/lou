# Golf in Mallorca - Product Requirements Document

## Original Problem Statement
Build a full-featured golf travel portal for Mallorca with authentic images, performant UI, fully functional partner cards, robust email contact forms, and a comprehensive "Trip Planner" lead capture tool.

## Core Features (Implemented)
- Partner listings: Hotels, Restaurants, Cafe/Bars, Beach Clubs, Golf Courses
- Contact/Newsletter forms via Resend
- Trip Planner wizard with Golf Groups support
- Per-service dynamic scheduling
- Golf Course Pairing (auto-suggests nearest course to hotel)
- Share Trip functionality
- Admin panel with Partner Image editing
- Blog section, Reviews, Weather widget

## Bug Fixes (March 23, 2026 - Session 3)
- **Content Manager Blank Page (FINAL FIX)**: Root cause found — API returns displaySettings as objects `{show: true, limit: 100}` but ContentManager tried to render them as React children, crashing with "Objects are not valid as a React child". Fixed normalization in `fetchDisplaySettings` and `handleSaveDisplaySettings`.
- **St. Regis Image Fix**: Replaced test placeholder `example.com/hotel-test-image.jpg` with real Mediterranean resort Pexels image.
- **Golf Favicon**: Generated golf ball favicon and added `<link rel="icon">` to index.html.
- **Display Settings Format**: Fixed format mismatch between ContentManager (simple numbers) and DisplaySettingsTab (objects). Both now interoperate correctly.

## Bug Fixes (March 22, 2026 - Session 2)
- **Content Manager Blank Page Fix**: Wrapped `new URL(bookingUrl).hostname` in try-catch in `ContentManager.jsx` PartnerCard component. Invalid URLs no longer crash the entire React component tree.
- **Footer Cropping Investigation**: Tested all 7 internal pages. All show full 673px footer — issue NOT reproducible.
- **7-Day Weather Forecast Dropdown**: Expanded the nav weather badge into a clickable 7-day forecast using Open-Meteo API. Shows day names, weather icons, hi/lo temps, rain probability, and wind speed. Adapts between dark glassmorphism (homepage) and light white (internal pages) themes.

## Recently Implemented (March 22, 2026)
- **SEO-Friendly Blog Routes**: Converted blog from modal-based to individual pages at `/blog/[slug]`. Full SEO: meta tags, JSON-LD schemas, 80+ keywords, AI discoverability.
- **Cookie Consent Banner**: GDPR-compliant dark glass popup. Stores choice in localStorage, never reappears.
- **Terms of Service** (`/terms`): Adapted from Greenfee365 terms, covers bookings, payments, cancellations, liability, Stripe security.
- **Privacy Policy** (`/privacy`): Full GDPR/LOPDGDD compliance — data controller, data types, retention periods, user rights, AEPD reference.
- **Sitemap Updated**: Added 10 blog posts + 2 legal pages to `sitemap.xml` (38 URLs total).
- **Stripe Live Keys**: Configured `sk_live` + `whsec` webhook secret. Payment flow is production-ready.
- **Hardcoded URLs Fixed**: All email logo URLs now point to `golfinmallorca.com` instead of preview.
- **Footer Updates**: Save the Med + Illes Balears logos with links. Privacy/Terms links now functional.
- **Email Fixes**: Footer links clickable on mobile, phone numbers no longer blue in Apple Mail.

## Previously Implemented (March 21, 2026)
- **Stripe Payment Integration**: Admin creates payment requests from dashboard, gets shareable link. Customer visits /pay/:id, pays via Stripe Checkout. Tested (iteration_21).
- **Payment Auto-Emails**: Payment link auto-sent to customer on creation. Confirmation emails to both admin (contact@golfinmallorca.com) and customer on payment completion. Tested (iteration_22).
- **Payment Dashboard**: Admin Payments tab with stats summary (collected, pending, total), search, create/delete/copy link. Redesigned payment page matching site branding. Tested (iteration_22).
- **Drag-and-Drop Image Upload**: Admin can upload images via drag-and-drop or file picker. Uses Emergent Object Storage. Fully tested (iteration_20).
- **Golf Groups**: New Trip Planner category with group type, player count, per-person/day budget, vehicle type
- **Admin Partner Images tab**: Self-service image editing for all partner cards (URL paste + drag-and-drop upload)
- **Cappuccino, Wellies, La Bodeguilla, Bar Bosch, Terrae, Barlovento, Flanigan's, Tahini**: All images updated
- **Refactoring**: server.py split from 5974 → 1833 lines. Data extracted to /app/backend/data/
- **Lint cleanup**: All ESLint + Python lint errors resolved
- **Trip Planner UI fixes**: Uniform card sizes, no green colors, floating pill scroll indicator

## Tech Stack
- Frontend: React, Tailwind CSS, Shadcn UI
- Backend: FastAPI, Motor (async MongoDB), Pydantic
- Email: Resend SDK
- Payments: Stripe via emergentintegrations (test key: sk_test_emergent)
- Storage: Emergent Object Storage
- DB: MongoDB (database: test_database)

## Architecture
```
/app/backend/
├── server.py              # Routes + models (1833 lines)
├── data/
│   ├── partners.py        # PARTNER_OFFERS + BLOG_POSTS (3613 lines)
│   ├── courses.py         # GOLF_COURSES (280 lines)
│   └── reviews.py         # REVIEWS_DATA (259 lines)
├── seed_all_partners.py
└── .env

/app/frontend/src/
├── components/
│   ├── TripPlanner.jsx
│   ├── AdminDashboard.jsx
│   ├── admin/
│   │   ├── PartnerImagesTab.jsx  # NEW - self-service image editing
│   │   ├── ContactsTab.jsx
│   │   ├── DisplaySettingsTab.jsx
│   │   └── ...
│   └── ui/
└── context/
```

## Key API Endpoints
- `GET /api/all-partners`: All partners (reads DB, falls back to code, applies overrides)
- `PATCH /api/admin/partner/{id}/image`: Update partner image (writes to DB)
- `POST /api/admin/upload-image`: Upload image file to Object Storage, returns {url, path}
- `GET /api/images/{path}`: Serve uploaded image from Object Storage (cached 1yr)
- `POST /api/admin/payment-request`: Create Stripe payment request (amount, customer, description)
- `GET /api/admin/payments`: List all payment requests/transactions
- `GET /api/payment/{id}`: Public payment details for customer page
- `POST /api/payment/{id}/checkout`: Create Stripe checkout session
- `GET /api/payment/status/{session_id}`: Poll Stripe payment status
- `DELETE /api/admin/payment/{id}`: Delete unpaid payment request
- `POST /api/webhook/stripe`: Stripe webhook handler
- `POST /api/trip-planner`: Submit trip request
- `GET /api/blog`: Blog posts

## CRITICAL: Database Sync Note
The DB name is `test_database` (from .env DB_NAME). When updating partner data:
- Update BOTH the code (data/partners.py) AND the MongoDB collection
- The admin image editor handles this automatically via the API

## Upcoming Tasks (P1)
- Hero Video on homepage

## Future/Backlog (P2)
- Refactor TripPlanner.jsx (~800 lines → smaller components)
- Refactor server.py (extract email templates to separate module)
- Golf Packages page (bundle deals)
- Google Business Profile (resolve suspension — user action)
- External review links (need URLs from user)
- Google Search Console (submit sitemap after production deploy)
- Golf Packages page
- Refactor TripPlanner.jsx (~800 lines)

## Blocked Items
- Google Business Profile suspension (user action)
- Sitemap submission (needs production deployment)
- External review links (waiting on user URLs)
