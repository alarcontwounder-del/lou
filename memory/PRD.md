# Mallorca Golf Exclusive - PRD

## Original Problem Statement
Build a website to promote golf booking services in Mallorca. Services target clients from Germany, Sweden, Switzerland, UK, and France. Features include:
- Multi-language support with language selector
- Contact/inquiry forms
- Redirect to external booking platforms
- Partner offers showcasing hotels & restaurants with deals/pricing

## Architecture
- **Frontend**: React with Tailwind CSS + Shadcn UI components
- **Backend**: FastAPI with MongoDB
- **Styling**: Organic & Earthy Luxury theme (Deep Emerald Green, Sand, Terracotta)
- **Typography**: Playfair Display (headings) + Manrope (body)

## User Personas
1. **International Golfers** - Wealthy tourists from DE, SE, CH, UK, FR seeking premium golf experiences
2. **Travel Planners** - Planning golf trips to Mallorca

## Core Requirements (Static)
- [x] Hero section with golf imagery and CTAs
- [x] Multi-language support (EN, DE, FR, SE)
- [x] Golf courses showcase (4 courses with details)
- [x] Partner offers (Hotels & Restaurants with discounts)
- [x] Contact/inquiry form with country selection
- [x] Responsive design for mobile users
- [x] External booking redirects

## What's Been Implemented (Dec 2025)
- Full landing page with all sections
- Language context provider with 4 languages
- Navigation with scroll-to-section
- Hero section with animations
- About section highlighting services
- Golf courses bento grid layout
- Partner offers with tabs (Hotels/Restaurants)
- Contact form with country selector
- Footer with social links
- Backend APIs for courses, offers, and contact inquiries
- Premium "Organic Luxury" design aesthetic

## Backend Endpoints
- `GET /api/golf-courses` - List all golf courses
- `GET /api/partner-offers` - List partner offers (filter by type)
- `POST /api/contact` - Submit contact inquiry
- `GET /api/contact` - List inquiries

## P0/P1/P2 Features Remaining
### P0 (Critical) - None

### P1 (Important)
- Admin dashboard to manage inquiries
- Email notifications for new inquiries
- Newsletter subscription

### P2 (Nice to Have)
- Blog/News section
- Weather widget for Mallorca
- Course availability calendar integration
- Customer testimonials section

## Next Tasks
1. Run full testing via testing_agent
2. Add email notification integration (optional)
3. Consider adding analytics tracking
