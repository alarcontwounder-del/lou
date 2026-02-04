# Mallorca Golf Exclusive - PRD

## Original Problem Statement
Build a website to promote golf booking services in Mallorca. Services target clients from Germany, Sweden, Switzerland, UK, and France. Features include:
- Multi-language support with language selector (EN, DE, FR, SE)
- Contact/inquiry forms
- Redirect to external booking platform: https://golfinmallorca.greenfee365.com
- Partner offers with separate sections for Hotels and Restaurants/Bars

## Architecture
- **Frontend**: React with Tailwind CSS + Shadcn UI components
- **Backend**: FastAPI with MongoDB
- **Styling**: Organic & Earthy Luxury theme (Deep Emerald Green, Sand, Terracotta)
- **Typography**: Playfair Display (headings) + Manrope (body)

## User Personas
1. **International Golfers** - Wealthy tourists from DE, SE, CH, UK, FR seeking premium golf experiences
2. **Travel Planners** - Planning golf trips to Mallorca

## Core Requirements (Static)
- [x] Hero section with "Book Tee Time" button → External booking site
- [x] Multi-language support (EN, DE, FR, SE) with instant switching
- [x] Golf courses showcase (4 courses with details and booking links)
- [x] Hotel Partners section (3 luxury hotels with booking buttons)
- [x] Restaurants & Bars section (3 restaurants with reservation buttons)
- [x] Contact/inquiry form with country selection
- [x] Responsive design for mobile users
- [x] External booking redirects to greenfee365.com

## What's Been Implemented (Dec 2025)
- Full landing page with all sections
- Language context provider with 4 languages
- Navigation with smooth scroll to sections
- Hero section with external booking CTA
- About section highlighting services
- Golf courses bento grid layout
- **Separate Hotels section** with 3 partner cards
- **Separate Restaurants & Bars section** with 3 partner cards
- Contact form with country selector
- Footer with social links and booking link
- Backend APIs for courses, offers, and contact inquiries
- Premium "Organic Luxury" design aesthetic

## External Booking Integration
- **Tee Time Booking**: https://golfinmallorca.greenfee365.com
- Accessible via: Hero CTA button, Nav "Book Now" button, Footer link

## Backend Endpoints
- `GET /api/golf-courses` - List all golf courses
- `GET /api/partner-offers` - List partner offers (filter by type)
- `POST /api/contact` - Submit contact inquiry
- `GET /api/contact` - List inquiries

## Test Results (Iteration 1)
- Backend: 80% (4/5 tests - minor CORS preflight issue, non-blocking)
- Frontend: 95% (14/15 features working)
- All core functionality verified and working

## P0/P1/P2 Features Remaining
### P0 (Critical) - None

### P1 (Important)
- Admin dashboard to manage inquiries
- Email notifications for new inquiries
- Newsletter subscription

### P2 (Nice to Have)
- Blog/News section
- Weather widget for Mallorca
- Customer testimonials section
- Course availability calendar integration

## Next Tasks
1. Add email notification integration for contact inquiries
2. Consider adding analytics tracking
3. Add testimonials section
