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

## Recently Implemented (March 21, 2026)
- **Golf Groups**: New Trip Planner category with group type, player count, per-person/day budget, vehicle type
- **Admin Partner Images tab**: Self-service image editing for all partner cards
- **Cappuccino, Wellies, La Bodeguilla, Bar Bosch, Terrae, Barlovento, Flanigan's, Tahini**: All images updated
- **Refactoring**: server.py split from 5974 → 1833 lines. Data extracted to /app/backend/data/
- **Lint cleanup**: All ESLint + Python lint errors resolved
- **Trip Planner UI fixes**: Uniform card sizes, no green colors, floating pill scroll indicator

## Tech Stack
- Frontend: React, Tailwind CSS, Shadcn UI
- Backend: FastAPI, Motor (async MongoDB), Pydantic
- Email: Resend SDK
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
- `POST /api/trip-planner`: Submit trip request
- `GET /api/blog`: Blog posts

## CRITICAL: Database Sync Note
The DB name is `test_database` (from .env DB_NAME). When updating partner data:
- Update BOTH the code (data/partners.py) AND the MongoDB collection
- The admin image editor handles this automatically via the API

## Upcoming Tasks (P1)
- SEO-friendly blog routes (`/blog/[slug]` pages)
- Hero Video on homepage

## Future/Backlog (P2)
- Golf Packages page
- Stripe Payment Integration

## Blocked Items
- Google Business Profile suspension (user action)
- Sitemap submission (needs production deployment)
- External review links (waiting on user URLs)
