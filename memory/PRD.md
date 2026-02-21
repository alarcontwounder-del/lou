# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a premium luxury golf website for Golfinmallorca.com to promote golf booking services in Mallorca. The site targets affluent golfers from Germany, Sweden, Switzerland, UK, France, and beyond.

**Key Features:**
- Multi-language support (EN, DE, FR, SE)
- Contact/inquiry forms with email notifications
- Newsletter subscription with welcome emails
- Redirect to external booking platform: https://golfinmallorca.greenfee365.com
- Premium reviews section with filters and translations
- Partner offers (Hotels & Restaurants)

## Brand: Golfinmallorca.com
- **Established:** 2003
- **Contact:** contact@golfinmallorca.com | +34 871 555 365
- **Theme:** Organic & Earthy Luxury (Deep Emerald Green #0a5f38, Sand, Terracotta)

## Architecture
- **Frontend:** React + Tailwind CSS + Shadcn UI + i18next
- **Backend:** FastAPI + Motor (async MongoDB)
- **Database:** MongoDB
- **Email Service:** Resend (transactional emails)

## User Personas
1. **International Golfers** - Wealthy tourists from DE, SE, CH, UK, FR
2. **Travel Planners** - Planning golf trips to Mallorca

## Core Requirements

### Implemented Features (Feb 2025)
- [x] Hero section with "Book Tee Time" CTA
- [x] Multi-language support (EN, DE, FR, SE) with instant switching
- [x] Golf courses showcase (13 courses with details and booking links)
- [x] Hotel Partners section (3 luxury hotels)
- [x] Restaurants & Bars section (3 Michelin-starred restaurants)
- [x] **Premium Reviews Section** - Masonry grid, filters, translations, animations
- [x] **Newsletter Subscription** - With Resend welcome emails
- [x] **Contact Form** - With Resend notification emails
- [x] Blog section with travel tips
- [x] Responsive design
- [x] External booking redirects to greenfee365.com
- [x] **Resend Email Integration** - Contact notifications + Newsletter welcome emails

## Backend API Endpoints
| Endpoint | Method | Description | Email |
|----------|--------|-------------|-------|
| `/api/golf-courses` | GET | List all golf courses | - |
| `/api/partner-offers` | GET | List partner offers | - |
| `/api/reviews` | GET | List reviews (with filters) | - |
| `/api/reviews/stats` | GET | Review statistics | - |
| `/api/blog` | GET | List blog posts | - |
| `/api/contact` | POST | Submit contact inquiry | Sends notification to admin |
| `/api/contact` | GET | List inquiries | - |
| `/api/newsletter` | POST | Subscribe to newsletter | Sends welcome email to subscriber |
| `/api/newsletter` | GET | List subscribers | - |

## Database Schema
- **contact_inquiries:** name, email, phone, country, message, inquiry_type, created_at
- **newsletter_subscribers:** name, email, country, subscribed_at, is_active

## 3rd Party Integrations
| Service | Status | Notes |
|---------|--------|-------|
| Resend | ACTIVE | Test mode - verify domain for production |
| Unsplash | ACTIVE | Stock images |
| Lucide React | ACTIVE | Icons |

## Resend Email Configuration
- **API Key:** Stored in `/app/backend/.env`
- **Sender:** `onboarding@resend.dev` (test mode)
- **Status:** Working in test mode
- **Production:** Verify domain at resend.com/domains, update SENDER_EMAIL

## P0/P1/P2 Remaining Tasks

### P0 (Critical) - COMPLETE
- ~~Resend Email Integration~~ DONE (Feb 2025)

### P1 (Important)
- [ ] Admin Dashboard (view contacts & subscribers) - User chose Emergent Google Auth
- [ ] Save to GitHub

### P2 (Nice to Have)
- [ ] Hero video replacement (user looking for video file)
- [ ] Social media links in footer (user deferred)
- [ ] Weather widget

## File Structure
```
/app
├── backend/
│   ├── .env                 # MONGO_URL, RESEND_API_KEY, SENDER_EMAIL
│   ├── requirements.txt
│   └── server.py            # FastAPI with email integration
├── frontend/
│   ├── .env                 # REACT_APP_BACKEND_URL
│   ├── src/
│   │   ├── components/
│   │   │   ├── sections/    # Hero, Reviews, Newsletter, Contact, etc.
│   │   │   └── ui/          # Shadcn components
│   │   └── locales/         # en.json, de.json, fr.json, sv.json
│   └── package.json
└── memory/
    └── PRD.md
```

## Testing Status
- **Backend APIs:** Verified via curl
- **Email Integration:** Verified - sends successfully to verified email
- **Frontend:** Visual verification via screenshots
