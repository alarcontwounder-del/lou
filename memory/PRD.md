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
  - Dynamic routing: /golf-courses/:courseId
  - Hero banner with course image, breadcrumb, name, location, holes/par, pricing
  - Extended SEO descriptions, course details grid, features, best season info
  - Booking CTA sidebar with pricing and external booking link
  - Location card with Google Maps link
  - Related courses section (3 recommended courses)
  - Dynamic document title, meta description, OG tags, JSON-LD schema per course
  - Canonical URL per course page
  - All courses added to sitemap.xml

## In Progress
- [ ] Keyword & content strategy analysis (user provided 2 CSV files with 500+ keywords)
- [ ] Integrating high-traffic keywords into existing site copy

## Blocked
- [ ] Google Business Profile reinstatement (user needs to change category)
- [ ] Sitemap submission (pending production deployment)
- [ ] Authentic venue photos (pending user assets)
- [ ] External review links (pending user URLs)

## Backlog / Future
- [ ] Create remaining golf course pages (user mentioned having content for 30 courses)
- [ ] Hero video replacement (P2)
- [ ] Weather widget for Mallorca (P2)
- [ ] Multi-language subdirectories /de/, /fr/ instead of ?lang= params (P2)
- [ ] Webpack deprecation warnings cleanup (P3)
- [ ] AdminDashboard.jsx refactoring into sub-components (P3)

## Architecture
```
/app/
├── backend/
│   └── server.py              # FastAPI with all API routes
│   └── .env                   # MONGO_URL, RESEND_API_KEY, SENDER_EMAIL
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── GolfCourseLanding.jsx  # Individual course detail page
│       │   ├── GolfCourses.jsx        # Course listing with links to detail pages
│       │   ├── Navbar.jsx, Footer.jsx, Hero.jsx, etc.
│       │   └── AdminDashboard.jsx     # Full CMS
│       ├── data/
│       │   └── golfCourseSEO.js       # Extended SEO content for 16 courses
│       ├── context/
│       │   ├── LanguageContext.jsx
│       │   └── DataContext.jsx
│       └── App.js                     # Routes including /golf-courses/:courseId
└── public/
    ├── sitemap.xml                    # Updated with all course page URLs
    ├── robots.txt
    ├── llms.txt
    └── schema-hub.json               # Master entity hub schema
```

## Key API Endpoints
- `GET /api/golf-courses` - List all golf courses
- `GET /api/golf-courses/{course_id}` - Get individual course (NEW)
- `POST /api/golf-courses` - Create course (admin)
- `PUT /api/golf-courses/{course_id}` - Update course (admin)
- `DELETE /api/golf-courses/{course_id}` - Delete course (admin)
- `POST /api/newsletter/subscribe` - Newsletter signup
- `POST /api/contact` - Contact form
- `GET /api/auth/google` - Google OAuth
