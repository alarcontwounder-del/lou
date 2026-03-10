# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a comprehensive website for Golfinmallorca.com - a golf tourism platform in Mallorca. The site showcases golf courses, hotels, restaurants, beach clubs, and cafe bars. Key requirements include:
- Modern, responsive UI/UX with consistent visual design
- Full-featured admin CMS for content management
- Email functionality for newsletters and contact forms
- Site-wide search feature
- Real venue images instead of stock photos

## User Personas
1. **Golf Tourists** - Visitors planning golf trips to Mallorca, looking for courses, accommodations, and dining
2. **Site Admin** - Content manager maintaining partner listings, reviewing submissions, managing subscribers

## Tech Stack
- **Frontend:** React, Tailwind CSS, React Context API
- **Backend:** FastAPI, MongoDB (Motor), Pydantic
- **Email:** Resend API
- **Auth:** Emergent-managed Google Auth
- **Analytics:** PostHog

## Core Requirements

### Completed Features ✅
1. **Partner Management System**
   - Full CRUD for golf courses, hotels, restaurants, beach clubs, cafe bars
   - Active/inactive toggle per partner
   - Display limit settings per category
   - Image upload functionality

2. **Quick View Modal**
   - Eye icon on all partner cards
   - Shows detailed partner info without navigation

3. **Site-wide Search**
   - Backend endpoint `/api/search`
   - Category filtering (Golf, Hotels, Mixed)
   - Real-time keyword search
   - Custom result sorting (Golf → Hotels → Mixed)

4. **Email System**
   - Resend API integration
   - Newsletter subscription
   - Contact form submissions
   - Branded HTML email templates

5. **Subscriber Management**
   - Manual add subscriber
   - CSV bulk import
   - Bulk email sending capability
   - Subscriber active/inactive status

6. **UI/UX Refinements**
   - Standardized section spacing
   - Color palette consistency across sections
   - Review cards with grey backgrounds
   - Review modal with matching grey theme (FIXED: March 10, 2026)

### Blocked Items ⏸️
1. **Real Venue Photos** - Technical implementation complete, awaiting user's images
2. **Full Email Functionality** - Domain verification required in Resend dashboard

### Pending Items 🟡
1. **External Review Links** - Need actual URLs for Google, Trustpilot, TripAdvisor

### Future/Backlog 📋
1. Hero Video implementation
2. Weather Widget integration
3. Webpack deprecation warnings cleanup

## Key API Endpoints
- `GET /api/search?q={query}&category={category}` - Search all partners
- `POST /api/newsletter/import` - Bulk import subscribers from CSV
- `POST /api/newsletter/bulk-email` - Send bulk email to subscribers
- `GET /api/all-partners` - Fetch all active partners
- `PUT /api/admin/partners/{partner_id}` - Update partner
- `POST /api/reviews/submit` - Submit user review

## Database Schema
- **golf_courses, hotels, restaurants, beach_clubs, cafe_bars:** Partner data with `is_active` flag
- **display_settings:** `{category, limit}` per partner type
- **newsletter_subscriptions:** `{name, email, country, subscribed_at, is_active}`

## File Structure
```
/app/
├── backend/
│   ├── emails/
│   │   ├── templates/
│   │   └── emails.py
│   ├── uploads/
│   ├── routes/
│   │   └── newsletter.py
│   └── server.py
└── frontend/
    └── src/
        ├── App.js
        ├── components/
        │   ├── admin/AdminDashboard.jsx
        │   ├── common/
        │   │   ├── FloatingSearch.jsx
        │   │   └── QuickViewModal.jsx
        │   ├── CompactReviewsCarousel.jsx
        │   ├── ReviewModal.jsx
        │   └── partners/
        └── index.css
```

## Last Updated
March 10, 2026 - Fixed review modal form input styling (white → grey)
