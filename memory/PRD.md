# Golf in Mallorca - Product Requirements Document

## Original Problem Statement
Build a full-featured golf travel portal for Mallorca with authentic images, performant UI, fully functional partner cards, robust email contact forms, and a comprehensive "Trip Planner" lead capture tool. The site must be visually consistent and highly responsive.

## Core Features (Implemented)
- Partner listings: Hotels, Restaurants, Cafe/Bars, Beach Clubs, Golf Courses
- Contact/Newsletter forms via Resend
- Trip Planner wizard: 4-step flow (Services → Dates → Itinerary → Contact)
- Per-service dynamic scheduling (date/time rows for transfers, dining, etc.)
- Golf Course Pairing: auto-suggests nearest course to selected hotel
- Share Trip functionality (WhatsApp, Email, Copy)
- Multi-language support (EN, DE, FR, SE)
- Blog section, Reviews, Weather widget
- Admin content manager

## Recently Implemented (March 21, 2026)
- **Golf Groups Feature**: New "Golf Groups" service category in Trip Planner
  - Group type toggle: Golf Society / Friends Trip
  - Player count: 4-8, 8-12, 12-20, 20+
  - Budget per person pricing (Moderate €150-€300, Premium €300-€500, Luxury €500+)
  - Vehicle type selector when combined with Transfer (Sedan, Minibus, Coach)
  - Group/Society name field in contact step
  - Backend models extended with group_type, group_name, transfer_type
  - Email notifications flag golf group requests in subject line
- **Renamed**: "Plan Trip / Reserve" → "Trip Planner" across navbar, hero, modal
- **Cappuccino Grand Café**: Image updated to authentic photo

## Tech Stack
- Frontend: React, Tailwind CSS, Shadcn UI, react-day-picker
- Backend: FastAPI, Motor (async MongoDB), Pydantic
- Email: Resend SDK
- LLM: Emergent LLM Key (OpenAI/Gemini)

## Architecture
```
/app/
├── backend/
│   ├── server.py               # Main FastAPI, data, email, models
│   ├── seed_all_partners.py    # DB seeding
│   └── models/
└── frontend/src/
    ├── components/
    │   ├── TripPlanner.jsx     # Wizard with Golf Groups
    │   ├── Navbar.jsx
    │   ├── Hero.jsx
    │   └── ui/
    └── context/
```

## Key API Endpoints
- `POST /api/trip-planner`: Submit trip request (supports golf_groups fields)
- `GET /api/all-partners`: Fetch all partner categories
- `GET /api/golf-courses`: Fetch golf courses
- `POST /api/contact`: Contact form
- `POST /api/newsletter/subscribe`: Newsletter

## Upcoming Tasks (P1)
- SEO-friendly blog routes: Convert modal blog to `/blog/[slug]` pages
- Hero Video: Add hero video to homepage

## Future/Backlog (P2)
- Golf Packages page: Bundle course + hotel deals
- Stripe Payment Integration: Deposit/booking flow

## Blocked Items
- Google Business Profile suspension (user action)
- Sitemap submission (needs production deployment)
- External review links (waiting on user URLs)

## Refactoring Needs
- TripPlanner.jsx (~700 lines): Split responsibilities
- server.py (~6000 lines): Move hardcoded data to JSON/seed files
- ESLint/Build warnings cleanup
