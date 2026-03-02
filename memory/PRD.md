# Golfinmallorca.com - Product Requirements Document

## Original Problem Statement
Build a premium golf booking website for Mallorca ("Golfinmallorca.com") with:
- Modern, dynamic UI/UX design ("Ink Wash" color palette)
- Admin dashboard for content management
- Real authentic images for all partners
- Partner management with display controls

## What's Been Implemented

### December 2, 2026 (Current Session)

#### ✅ IMAGE UPLOAD FUNCTIONALITY
Direct image upload from computer:
- **Drag & drop** images into the upload area
- **Browse files** button to select images
- Supports JPG, PNG, GIF, WebP formats
- Max file size: 10MB
- Images stored in `/app/backend/uploads/`
- Still supports **URL paste** as alternative
- Live preview of uploaded/pasted images

**Backend Endpoints:**
- `POST /api/upload-image` - Upload image file
- `DELETE /api/upload-image/{filename}` - Delete uploaded image
- `GET /api/uploads/{filename}` - Serve uploaded images

#### ✅ FULL CONTENT MANAGEMENT SYSTEM
Complete admin control over all partners:

| Feature | Status |
|---------|--------|
| Toggle on/off | ✅ Show/hide partners |
| Display limits | ✅ 3-20 or "Show All" per category |
| Image upload | ✅ Direct upload from computer |
| URL editing | ✅ Booking/contact URLs |
| Add/Edit/Delete | ✅ Full CRUD |

### Previous Sessions
- Full database migration (156 partners to MongoDB)
- Golf courses reordered (Son Gual, Alcanada, Pula first)
- Reviews carousel and ghost navigator
- Color consistency across all cards

## Admin Dashboard Features

### Content Manager Tab
Access: Gear icon → Google Login → "Content Manager" tab

**Image Upload Options:**
1. Drag & drop image file
2. Click "Browse Files" to select
3. Paste image URL directly

**All Features:**
- Type tabs (Golf, Hotels, Restaurants, Beach Clubs, Cafés)
- Search and filter
- Active/inactive toggle
- Display limits settings
- Full CRUD operations

## Technical Architecture

### File Storage
```
/app/backend/uploads/     - Uploaded images
                         - Served via /api/uploads/
                         - Filename: {timestamp}_{uuid}.{ext}
```

### MongoDB Collections
```
golf_courses      - 16 records
hotels            - 38 records
restaurants       - 54 records  
beach_clubs       - 12 records
cafe_bars         - 36 records
display_settings  - 1 record
```

### Key Files
- `/app/frontend/src/components/ContentManager.jsx` - Image upload UI
- `/app/backend/server.py` - Upload endpoint
- `/app/backend/uploads/` - Stored images

## Prioritized Backlog

### P1 - High Priority  
- [ ] Full Search Engine implementation
- [ ] Email functionality (needs RESEND_API_KEY)

### P2 - Medium Priority
- [ ] Hero video replacement
- [ ] Weather widget integration

## Data Summary
- **Total Partners**: 156 records in MongoDB
- **Image storage**: Local uploads + external URLs supported
- **Display limits**: Configurable per category
