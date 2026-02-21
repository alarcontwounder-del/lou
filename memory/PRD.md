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
- Admin Dashboard for viewing, searching, and managing contacts & subscribers

## Brand: Golfinmallorca.com
- **Established:** 2003
- **Contact:** contact@golfinmallorca.com | +34 871 555 365
- **Theme:** Organic & Earthy Luxury (Deep Emerald Green #0a5f38, Sand, Terracotta)

## Architecture
- **Frontend:** React + Tailwind CSS + Shadcn UI + i18next + React Router
- **Backend:** FastAPI + Motor (async MongoDB) + Resend (email) + Emergent Auth
- **Database:** MongoDB
- **Email Service:** Resend (transactional emails)
- **Authentication:** Emergent Google OAuth

## Core Requirements - ALL COMPLETE

### Implemented Features (Feb 2025)
- [x] Hero section with "Book Tee Time" CTA
- [x] Multi-language support (EN, DE, FR, SE) with instant switching
- [x] Golf courses showcase (13 courses with details and booking links)
- [x] Hotel Partners section (3 luxury hotels)
- [x] Restaurants & Bars section (3 Michelin-starred restaurants)
- [x] Premium Reviews Section - Masonry grid, filters, translations, animations
- [x] Newsletter Subscription - With Resend welcome emails
- [x] Contact Form - With Resend notification emails
- [x] Blog section with travel tips
- [x] Responsive design
- [x] External booking redirects to greenfee365.com
- [x] Resend Email Integration - Contact notifications + Newsletter welcome emails
- [x] Admin Dashboard with Emergent Google OAuth
- [x] **Search/Filter Functionality** - Search contacts and subscribers by name, email, country
- [x] **Delete Functionality** - Delete contacts and subscribers with confirmation modal

## Backend API Endpoints
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/golf-courses` | GET | List all golf courses | - |
| `/api/partner-offers` | GET | List partner offers | - |
| `/api/reviews` | GET | List reviews (with filters) | - |
| `/api/reviews/stats` | GET | Review statistics | - |
| `/api/blog` | GET | List blog posts | - |
| `/api/contact` | POST | Submit contact inquiry (sends email) | - |
| `/api/contact` | GET | List inquiries | - |
| `/api/contact/{id}` | DELETE | Delete contact inquiry | Cookie/Bearer |
| `/api/newsletter` | POST | Subscribe to newsletter (sends email) | - |
| `/api/newsletter` | GET | List subscribers | - |
| `/api/newsletter/{id}` | DELETE | Delete subscriber | Cookie/Bearer |
| `/api/auth/session` | POST | Exchange session_id for user data | - |
| `/api/auth/me` | GET | Get current authenticated user | Cookie/Bearer |
| `/api/auth/logout` | POST | Logout user | Cookie |

## Database Schema
- **users:** user_id, email, name, picture, created_at
- **user_sessions:** user_id, session_token, expires_at, created_at
- **contact_inquiries:** id, name, email, phone, country, message, inquiry_type, created_at
- **newsletter_subscribers:** id, name, email, country, subscribed_at, is_active

## 3rd Party Integrations
| Service | Status | Notes |
|---------|--------|-------|
| Resend | ACTIVE | Test mode - verify domain for production |
| Emergent Auth | ACTIVE | Google OAuth for admin access |
| Unsplash | ACTIVE | Stock images |
| Lucide React | ACTIVE | Icons |

## Admin Dashboard Features
1. **Contact Inquiries Tab**
   - View all contact form submissions
   - Search by name, email, country, message, inquiry type
   - Delete contacts with confirmation
   - Export to CSV

2. **Newsletter Subscribers Tab**
   - View all newsletter subscribers
   - Search by name, email, country
   - Delete subscribers with confirmation
   - Export to CSV

3. **Stats Footer**
   - Total contacts count
   - Total subscribers count
   - Today's contacts count

## P1 (Remaining)
- [ ] Save to GitHub - Use "Save to GitHub" button in UI

## P2 (Future/Backlog)
- [ ] Hero video replacement (user looking for video file)
- [ ] Social media links in footer (user deferred)
- [ ] Weather widget

## File Structure
```
/app
├── backend/
│   ├── .env                 # MONGO_URL, RESEND_API_KEY, SENDER_EMAIL
│   ├── requirements.txt     # FastAPI, Motor, Resend, httpx
│   └── server.py            # FastAPI with email, auth & delete endpoints
├── frontend/
│   ├── .env                 # REACT_APP_BACKEND_URL
│   ├── src/
│   │   ├── App.js           # Main app with React Router & auth flow
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx  # Admin modal with search & delete
│   │   │   ├── AuthCallback.jsx    # Handles OAuth callback
│   │   │   ├── Navbar.jsx          # With admin button
│   │   │   ├── sections/           # Hero, Reviews, Newsletter, Contact
│   │   │   └── ui/                 # Shadcn components
│   │   └── locales/         # en.json, de.json, fr.json, sv.json
│   └── package.json
└── memory/
    └── PRD.md
```

## Testing Status
- Backend APIs: Verified via curl
- Email Integration: Verified - sends successfully to verified email
- Admin Dashboard: Verified with test session
- Search Functionality: Implemented and working
- Delete Functionality: Backend verified, frontend implemented
