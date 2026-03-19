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
  - Homepage copy enriched with high-traffic keywords
  - Enhanced meta tags (title, description, OG, Twitter Card)
  - Expanded FAQ schema from 4 to 8 questions
  - Enriched golfCourseSEO.js with location-specific keywords per course
  - **NEW: /golf-holidays-mallorca landing page**
  - **NEW: /book-tee-times landing page**
  - Sitemap updated with 2 new landing page URLs
  - Footer internal links to new landing pages
  - llms.txt updated with new pages and 16 courses
- [x] **Blog Content Expansion** (March 2026) — VERIFIED March 19
  - 4 existing blog posts enriched with keywords
  - 6 new blog posts created (art galleries, culinary experiences, Palma golf, budget golf, stay & play packages, ultimate guide)
  - All 10 posts rendering correctly in homepage grid + modal detail view
  - API endpoints verified: GET /api/blog, GET /api/blog/{slug}
- [x] **Nearest Golf Course Distance** on ALL partner categories (March 2026)
- [x] **Bug Fixes — Search, Footer, Navigation, Design** (March 2026)
  - Search finds landing pages, footer links work, hero flash resolved
  - Book Tee Times redesigned, brand-charcoal backgrounds, logo overlay fix

## Keyword Clusters Targeted
1. **courses** (research): "best golf courses mallorca", "luxury golf courses mallorca"
2. **local** (commercial): "golf guide palma mallorca", "golf tee times alcudia mallorca"
3. **core** (informational): "golf mallorca guide", "play golf mallorca"
4. **travel** (commercial): "golf holiday packages mallorca", "stay and play golf mallorca"
5. **high-intent** (transactional): "book tee times mallorca", "discount tee times mallorca"

## Blocked
- [ ] Google Business Profile reinstatement (user needs to change category)
- [ ] Sitemap submission (pending production deployment)
- [ ] Authentic venue photos for remaining courses (pending user assets)
- [ ] External review links (pending user URLs)

## Backlog / Future
- [ ] SEO-friendly individual blog post routes (/blog/slug) instead of modal (P1 - recommended)
- [ ] Hero video replacement (P2)
- [ ] Weather widget for Mallorca (P2)
- [ ] Multi-language subdirectories /de/, /fr/ (P2)
- [ ] Golf Packages page with bundled course + hotel deals (P2)
- [ ] Webpack deprecation warnings cleanup (P3)
- [ ] AdminDashboard.jsx refactoring into sub-components (P3)

## Architecture
```
/app/
├── backend/
│   ├── server.py           # API endpoints, blog data, search
│   └── migrate_nearest_golf.py
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── GolfCourseLanding.jsx  # Individual course detail page
│       │   ├── GolfHolidaysPage.jsx   # Golf holidays landing page
│       │   ├── BookTeeTimesPage.jsx   # Book tee times landing page
│       │   ├── Blog.jsx              # Blog section with modal detail view
│       │   ├── Navbar.jsx, Footer.jsx, FloatingSearch.jsx
│       │   └── AdminDashboard.jsx
│       ├── data/golfCourseSEO.js
│       ├── i18n/translations.js
│       ├── context/LanguageContext.js, DataContext.jsx
│       └── App.js           # Routes and scroll-to-section logic
└── public/
    ├── index.html, sitemap.xml, robots.txt, llms.txt, schema-hub.json
```

## Key API Endpoints
- `GET /api/golf-courses` - List all golf courses
- `GET /api/golf-courses/{course_id}` - Get individual course
- `GET /api/search?q=<query>` - Site-wide search (partners + pages)
- `GET /api/blog` - All blog posts
- `GET /api/blog/{slug}` - Individual blog post
- `POST /api/newsletter/subscribe` - Newsletter signup
- `POST /api/contact` - Contact form
- `GET /api/auth/google` - Google OAuth

## Important Technical Notes
- Navigation uses React Router state + requestAnimationFrame for scroll-to-section (no setTimeout)
- Blog uses modal detail view (not separate routes — SEO improvement recommended)
- GolfCourseLanding/GolfHolidaysPage/BookTeeTimesPage use React.lazy to avoid Babel stack overflow
- Hero images: user-provided photos via HERO_IMAGE_OVERRIDE map
- Navbar has `variant="light"` prop for content/landing pages
