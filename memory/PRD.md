# Golf in Mallorca - Product Requirements Document

## Original Problem Statement
Build a full-featured golf travel portal for Mallorca with authentic images, performant UI, fully functional partner cards, robust email contact forms, a comprehensive "Golf Trip Planner", Google Analytics tracking, and solid SEO routing. The site captures leads by routing hotel bookings through internal inquiry forms.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, Motor (async MongoDB)
- **Architecture**: SPA with dynamic SEO routing
- **Integrations**: OpenAI/Emergent LLMs, Resend (Emails), Stripe (Payments), Google Analytics 4

## What's Been Implemented
- **19 Golf Course** partner cards with flip animations, SEO landing pages
- 56 Active Hotel partner cards (59 total, 3 inactive) with internal BookingRequestModal
- Restaurant (48), Beach Club (12), Cafe & Bar (36) partner sections — ALL with internal booking forms
- Trip Planner (multi-step wizard with AI itinerary generation)
- Contact form with Resend email integration
- Blog with CMS, social sharing — **11 posts total**
- Admin Dashboard with Hotels tab (display_order 1-59)
- Google Analytics 4, SEO canonicals, sitemap.xml, hreflang tags
- Cookie Consent, Newsletter, Stripe, Multi-language (EN/DE/FR/SE)
- Floating Search with fuzzy matching (Levenshtein distance)
- Session-based Favorites (sessionStorage), Mobile Card Limit (6/section)
- Startup hotel auto-seed with exclusion list
- Image fallback (onError) on ALL card components
- Hero image optimized (4.1MB → 308KB)
- Logo uses reliable `brightness(0) invert(1)` instead of `mix-blend-mode: screen`

## Latest Changes - Feb 14, 2026

### SEO Indexing Fix (Google Search Console)
- **Root cause**: `hreflang` tags pointed to `?lang=de|fr|sv` URLs that served identical English HTML → Google flagged as duplicates + robots.txt blocked them → "Alternate page / Blocked by robots" errors.
- Removed `hreflang` entries for `de`/`fr`/`sv` (content is client-side only, not server-translated). Kept `en` + `x-default` only.
- Replaced `document.write()` canonical with **static `<link rel="canonical">` + JS refinement** so Googlebot sees canonical in initial HTML parse.
- Made `og:url` static with JS update (same pattern).
- Removed `og:locale:alternate` entries for DE/FR/SV.
- Removed `Disallow: /*?lang=` from `robots.txt` (no longer needed).
- Updated `sitemap.xml`: added 3 new courses (golf-de-andratx, golf-maioris, golf-son-termens), refreshed `lastmod` to 2026-02-14.
- Updated "16 courses" → "19 courses" in meta description, OG, Twitter, schema.org `ItemList` (numberOfItems), `Service.description`, and 3 FAQ answers.

## Latest Changes - April 23, 2026

### 3 New Golf Courses Added
- **Golf de Andratx** — Camp de Mar | 18H Par 72 | From €140 | Cloudinary image
- **Golf Maioris** — Llucmajor | 18H Par 72 | From €63 | Cloudinary image
- **Golf Son Termes** — Bunyola | 18H Par 70 | From €85 | Cloudinary image
- All booking URLs linked to `golfinmallorca.greenfee365.com`
- Updated references from "16 Courses" → "19 Courses" in landing pages

### Previous Session Fixes (April 14-16)
- Fuzzy search, blog post "New Features", translation keys, internal booking forms
- Hotel admin fixes, hero optimization, mobile reliability fixes
- Code quality: skeleton keys, var→const, console.log cleanup

## DB Schema
- `golf_courses`: **19 total**, all active, all with prices and booking URLs
- `hotels`: 59 total (56 active, 3 inactive). 22 have prices, 35 do not
- `restaurants`: 48 total (47 active), `beach_clubs`: 12 (11 active), `cafe_bars`: 36 (35 active)

## Pending/Upcoming Tasks
### P1 - Awaiting User Input
- Hero Video homepage (waiting for video file)
- "From €[Price]" for 35 remaining hotels (waiting for pricing or web-scrape approval)
- External review links for "Write a review" modal (waiting for URLs)

### P2
- Activate teetimescancun.net / teetimespuntacana.com footer links
- Google Business Profile appeal (user action)

### P3 - Refactoring
- Decompose large components (TripPlanner, ContentManager, BlogPostPage)
- Extract email templates to HTML/Jinja2
- Golf Packages page

### Future - Real Multi-Language SEO (Phase 2)
- Currently site is English-only server-side (i18n is client JS only).
- To actually rank in DE/FR/SV: need SSG/SSR routes `/de/`, `/fr/`, `/sv/` with translated HTML, then re-introduce real `hreflang` annotations. Large effort — deferred until business confirms priority.
