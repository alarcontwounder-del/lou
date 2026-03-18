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
  - Homepage copy enriched with high-traffic keywords across hero, about, courses, hotels, restaurants, beach clubs, cafes sections
  - Enhanced meta tags (title, description, OG, Twitter Card) with target keywords
  - Expanded FAQ schema from 4 to 8 questions targeting long-tail keywords
  - Enriched golfCourseSEO.js with location-specific keywords per course
  - **NEW: /golf-holidays-mallorca landing page** — targets "golf holiday packages mallorca", "stay and play golf mallorca", "golf weekend breaks mallorca", etc.
  - **NEW: /book-tee-times landing page** — targets "book tee times mallorca", "discount tee times mallorca", "mallorca tee time booking", etc.
  - Sitemap updated with 2 new landing page URLs
  - Footer internal links to new landing pages
  - llms.txt updated with new pages and 16 courses
  - Updated service descriptions from 13 to 16 courses across all schemas

## Keyword Clusters Targeted
1. **courses** (research): "best golf courses mallorca", "luxury golf courses mallorca", "top rated golf courses mallorca"
2. **local** (commercial): "golf guide palma mallorca", "golf tee times alcudia mallorca", "golf packages santa ponsa mallorca"
3. **core** (informational): "golf mallorca guide", "play golf mallorca", "golf in mallorca tee times"
4. **travel** (commercial): "golf holiday packages mallorca", "stay and play golf mallorca", "mallorca golf vacation"
5. **high-intent** (transactional): "book tee times mallorca", "discount tee times mallorca", "golf concierge mallorca", "vip golf experience mallorca"

## Blocked
- [ ] Google Business Profile reinstatement (user needs to change category)
- [ ] Sitemap submission (pending production deployment)
- [ ] Authentic venue photos for remaining courses (pending user assets)
- [ ] External review links (pending user URLs)

## Backlog / Future
- [ ] Integrate remaining keywords into blog content / new blog posts
- [ ] Hero video replacement (P2)
- [ ] Weather widget for Mallorca (P2)
- [ ] Multi-language subdirectories /de/, /fr/ instead of ?lang= params (P2)
- [ ] Golf Packages page with bundled course + hotel deals (P2)
- [ ] Webpack deprecation warnings cleanup (P3)
- [ ] AdminDashboard.jsx refactoring into sub-components (P3)

## Architecture
```
/app/
├── backend/
│   └── server.py
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── GolfCourseLanding.jsx  # Individual course detail page
│       │   ├── GolfHolidaysPage.jsx   # NEW: Golf holidays landing page
│       │   ├── BookTeeTimesPage.jsx   # NEW: Book tee times landing page
│       │   ├── GolfCourses.jsx        # Course listing cards
│       │   ├── Navbar.jsx             # Supports variant="light"
│       │   ├── Footer.jsx             # Updated with internal links
│       │   ├── Hero.jsx, About.jsx, etc.
│       │   └── AdminDashboard.jsx
│       ├── data/
│       │   └── golfCourseSEO.js       # Enriched SEO content for 16 courses
│       ├── i18n/
│       │   └── translations.js        # Keyword-enriched copy
│       ├── context/
│       │   ├── LanguageContext.js
│       │   └── DataContext.jsx
│       └── App.js                     # Routes: /, /golf-courses/:courseId, /golf-holidays-mallorca, /book-tee-times
└── public/
    ├── index.html                     # Updated meta tags, FAQ schemas
    ├── sitemap.xml                    # 2 new landing page URLs
    ├── robots.txt
    ├── llms.txt                       # Updated with 16 courses and new pages
    └── schema-hub.json
```

## Key API Endpoints
- `GET /api/golf-courses` - List all golf courses
- `GET /api/golf-courses/{course_id}` - Get individual course
- `POST /api/golf-courses` - Create course (admin)
- `PUT /api/golf-courses/{course_id}` - Update course (admin)
- `DELETE /api/golf-courses/{course_id}` - Delete course (admin)
- `POST /api/newsletter/subscribe` - Newsletter signup
- `POST /api/contact` - Contact form
- `GET /api/auth/google` - Google OAuth

## Important Technical Notes
- GolfCourseLanding.jsx, GolfHolidaysPage.jsx, BookTeeTimesPage.jsx live in /components/ (not /pages/) due to Babel metadata plugin stack overflow
- React.lazy loading used for all landing page routes
- Hero images: user-provided photos via HERO_IMAGE_OVERRIDE map
- Navbar has `variant="light"` prop for content/landing pages
