# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a comprehensive website for Golfinmallorca.com - a golf tourism platform in Mallorca. The site showcases golf courses, hotels, restaurants, beach clubs, and cafe bars.

## Tech Stack
- **Frontend:** React, Tailwind CSS, React Context API
- **Backend:** FastAPI, MongoDB (Motor), Pydantic
- **Email:** Resend API
- **Auth:** Emergent-managed Google Auth

## Completed Features ✅

### Core Features
1. Partner Management System - Full CRUD with active/inactive toggle
2. Quick View Modal - Eye icon on all partner cards
3. Site-wide Search - Backend endpoint with category filtering
4. Email System - Resend API for newsletters and contact forms
5. Subscriber Management - Manual add, CSV import, bulk email

### UI/UX Refinements (March 11, 2026)
- Hero section: Large white logo with drop shadow, better spacing
- Navbar: Larger text (text-base), visible separator, removed Book Now button
- Newsletter form: Grey input backgrounds
- Review modal: Grey styling + fade-in/slide-up animation
- Mobile responsive: Navigation dots visible, no horizontal overflow
- Golf course cards: Proper image centering with object-center
- Footer: Illes Balears Sostenibles logo, website link in Contact Info

## Blocked Items ⏸️
1. **Real Venue Photos** - Technical implementation complete, awaiting user's images
2. **Full Email Functionality** - Domain verification required in Resend

## Pending Items 🟡
1. External review links (Google, Trustpilot, TripAdvisor URLs)

## Future/Backlog 📋
1. Hero Video implementation
2. Weather Widget integration
3. Webpack deprecation warnings cleanup

## Key API Endpoints
- `GET /api/search?q={query}&category={category}`
- `POST /api/newsletter/import`
- `POST /api/newsletter/bulk-email`
- `GET /api/all-partners`
- `PUT /api/admin/partners/{partner_id}`

## Database Schema
- **golf_courses, hotels, restaurants, beach_clubs, cafe_bars:** Partner data with `is_active`
- **display_settings:** `{category, limit}`
- **newsletter_subscriptions:** `{name, email, country, subscribed_at, is_active}`

## Last Updated
March 11, 2026 - UI/UX refinements: logo, navbar, footer, hero spacing, card images
