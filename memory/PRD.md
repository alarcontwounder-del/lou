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
- 59 Hotel partner cards with internal BookingRequestModal (not external links)
- Restaurant, Beach Club, Café & Bar partner sections
- Trip Planner (multi-step wizard with AI itinerary generation)
- Contact form with Resend email integration
- Blog with CMS, social sharing (WhatsApp, Twitter, Facebook)
- Admin Dashboard with Hotels tab
- Google Analytics 4 with 6 custom conversion events
- SEO: Dynamic canonical tags, golf course landing pages
- Cookie Consent popup
- Newsletter subscription
- Stripe payment integration
- Multi-language support (EN, DE, FR, SE)
- Weather badge
- Section Navigator (right-side dots)
- Floating Search
- Code Quality improvements (var→let/const, React Hook deps, useMemo)

## Recent Fixes (Apr 5, 2026)
- Fixed: Scroll indicator overlapping Trip Planner pill on mobile (hidden on <640px)
- Fixed: "Play Golf Wherever You Are" banner mobile layout (full-width button, smaller text)
- Fixed: Contact form "Book Your Mallorca Golf Holiday" cut off on right (overflow-hidden, decorative element hidden on mobile)
- Improved: Added decoding="async" to card images for faster mobile loading

## Confirmed Working (User Verified)
- Logo on mobile navbar ✅
- SectionNavigator dots on right side ✅
- Hotel Booking Flow ✅
- GA4 Tracking ✅
- SEO Canonicals ✅
- Emails ✅
- Admin Dashboard ✅

## Pending/Upcoming Tasks
### P1 - Awaiting User Input
- Add Hero Video to homepage (waiting for video file)
- Add "From €[Price]" to 35 remaining hotels (waiting for pricing list)
- External review links for "Write a review" modal (waiting for URLs)

### P2
- Activate `teetimescancun.net` and `teetimespuntacana.com` footer links
- Google Business Profile appeal (user action)

### P3 - Future
- Refactor large components: TripPlanner.jsx (~800 lines), ContentManager.jsx, BlogPostPage.jsx, server.py
- Golf Packages page (bundle course and hotel deals)

## Key DB Schema
- `hotels`: 59 total (57 active, 2 inactive). 36 real photos, 23 stock. 24 have prices, 35 do not.

## Key API Endpoints
- `POST /api/booking-request`: Handles hotel inquiries
- `POST /api/contact`: General contact form
- `GET /api/partners/{type}`: Fetch partners by type

## Important Notes
- DO NOT tell user images were lost - 36 real images are safe in DB
- Hotel images may appear broken in preview due to hotlink protection
- LIVE Stripe key is active
