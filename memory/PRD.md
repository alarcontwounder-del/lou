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
  - Contained card hero design — image in rounded container, title/details above
  - Real venue photos for Alcanada, Son Gual, Son Vida (user-provided)
  - No Cloudinary upscaling to avoid pixelation
  - Extended SEO descriptions per course from golfCourseSEO.js
  - Course details grid (holes, par, designer, terrain, green fees, established year)
  - Facilities & features tags
  - Best season info
  - "Book a Tee Time now!" CTA sidebar (grey button)
  - Location card with Google Maps link
  - Related courses section
  - Dynamic document title, meta description, OG tags, JSON-LD GolfCourse schema
  - Canonical URL per course page
  - All 16 courses in sitemap.xml
  - Navbar light variant for course pages (relative, original logo colors, dark grey text, visible divider bar)

## Recent UI/UX Fixes (This Session)
- [x] Card front images: changed from h-56 to aspect-[4/3] — shows full images, no cropping
- [x] Card back buttons: stacked vertically, "Book a Tee Time now!" primary + "View Details" secondary
- [x] Course page hero: contained card design (rounded container, not full-bleed)
- [x] Navbar light variant: bigger logo (h-20/h-24), stone-600 text, no border line, visible divider bar
- [x] About section: single description text block, consistent color/size
- [x] CTA button: grey (stone-500) instead of black
- [x] Real venue photos: Alcanada (aerial), Son Gual (panoramic), Son Vida (clubhouse)

## In Progress
- [ ] Keyword & content strategy analysis (user provided 2 CSV files with 500+ keywords)

## Blocked
- [ ] Google Business Profile reinstatement (user needs to change category)
- [ ] Sitemap submission (pending production deployment)
- [ ] Authentic venue photos for remaining courses (pending user assets)
- [ ] External review links (pending user URLs)

## Backlog / Future
- [ ] Create remaining golf course pages (user mentioned having content for 30 courses)
- [ ] Integrate high-traffic keywords into existing site copy
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
│       │   ├── GolfCourseLanding.jsx  # Individual course detail page (contained hero)
│       │   ├── GolfCourses.jsx        # Course listing cards (4:3 aspect, stacked buttons)
│       │   ├── Navbar.jsx             # Supports variant="light" for course pages
│       │   ├── Footer.jsx, Hero.jsx, etc.
│       │   └── AdminDashboard.jsx     # Full CMS
│       ├── data/
│       │   └── golfCourseSEO.js       # Extended SEO content for 16 courses
│       ├── context/
│       │   ├── LanguageContext.jsx
│       │   └── DataContext.jsx
│       └── App.js                     # Routes: /golf-courses/:courseId (React.lazy)
└── public/
    ├── sitemap.xml                    # Updated with all 16 course page URLs
    ├── robots.txt
    ├── llms.txt
    └── schema-hub.json               # Master entity hub schema
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
- GolfCourseLanding.jsx lives in /components/ (not /pages/) due to Babel metadata plugin stack overflow with complex imports from pages directory
- React.lazy loading used for the course page route to avoid build issues
- Hero images: user-provided photos used via HERO_IMAGE_OVERRIDE map; Cloudinary images NOT upscaled to avoid pixelation
- Navbar has `variant="light"` prop: relative positioning, original logo colors, grey text, visible divider bar
