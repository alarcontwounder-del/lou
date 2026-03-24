from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import resend
import httpx
import requests as sync_requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
import string
import random
from datetime import datetime, timezone, timedelta
import shutil
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
load_dotenv(ROOT_DIR / '.env')

# Resend email setup
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# Object Storage setup
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "mallorca-golf"
_storage_key = None

# Stripe setup
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

def init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = sync_requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = sync_requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = sync_requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Mount static files
app.mount("/api/static", StaticFiles(directory=str(ROOT_DIR / "static")), name="static")

# Mount uploads directory for serving uploaded images
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class ContactInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    country: str
    message: str
    inquiry_type: str = "general"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactInquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    country: str
    message: str
    inquiry_type: str = "general"

# Newsletter Models
class NewsletterSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    country: str
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class NewsletterSubscriptionCreate(BaseModel):
    email: EmailStr
    name: str
    country: str

# Auth Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Booking Request Models
class BookingRequestCreate(BaseModel):
    venue_name: str
    venue_type: str
    guest_name: str
    guest_email: EmailStr
    guest_phone: str
    date: str
    time: str
    guests: int
    dietary: List[str] = []
    allergies: str = ""
    special_requests: str = ""

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionIdRequest(BaseModel):
    session_id: str

class GolfCourse(BaseModel):
    id: str
    name: str
    description: dict  # Multi-language
    image: str
    holes: int
    par: int
    features: List[str]
    booking_url: str

class PartnerOffer(BaseModel):
    id: str
    name: str
    type: str  # hotel or restaurant
    description: dict  # Multi-language
    image: str
    location: str
    deal: dict  # Multi-language deal description
    original_price: Optional[float] = None
    offer_price: Optional[float] = None
    discount_percent: Optional[int] = None
    contact_url: str

# Blog Post Models
class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: dict  # Multi-language
    excerpt: dict  # Multi-language
    content: dict  # Multi-language
    image: str
    author: str
    category: str
    tags: List[str] = []
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Trip Planner Models
class TripPlannerRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    services: List[str]  # e.g. ["hotel", "restaurant", "beach_club", "transfer", "golf_groups"]
    budget: Optional[str] = None  # "moderate", "premium", "luxury"
    preferred_hotel: Optional[str] = None
    preferred_restaurant: Optional[str] = None
    preferred_beach_club: Optional[str] = None
    transfer_pickup: Optional[str] = None
    transfer_dropoff: Optional[str] = None
    date: str  # ISO date string (arrival)
    departure_date: Optional[str] = None
    time: Optional[str] = None  # legacy
    schedule: Optional[dict] = None
    group_size: int = 2
    special_requests: Optional[str] = None
    group_type: Optional[str] = None  # "society" or "friends"
    group_name: Optional[str] = None
    transfer_type: Optional[str] = None  # "sedan", "minibus", "coach"

class TripPlannerEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    services: List[str]
    budget: Optional[str] = None
    preferred_hotel: Optional[str] = None
    preferred_restaurant: Optional[str] = None
    preferred_beach_club: Optional[str] = None
    transfer_pickup: Optional[str] = None
    transfer_dropoff: Optional[str] = None
    date: str
    departure_date: Optional[str] = None
    time: Optional[str] = None  # legacy
    schedule: Optional[dict] = None
    group_size: int = 2
    special_requests: Optional[str] = None
    group_type: Optional[str] = None
    group_name: Optional[str] = None
    transfer_type: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Client Review Models
class ClientReview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: int
    user_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    country: str
    platform: str
    rating: int = Field(ge=1, le=5)
    language: str
    review_text: str

class ClientReviewCreate(BaseModel):
    user_name: str
    country: str
    platform: str = "Website"
    rating: int = Field(ge=1, le=5)
    language: str = "EN"
    review_text: str

# User-submitted review model (requires auth, pending approval)
class UserReviewSubmission(BaseModel):
    rating: int = Field(ge=1, le=5)
    review_text: str
    platform: str = "Google"  # The platform they used to sign in

class UserReview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str = Field(default_factory=lambda: f"review_{uuid.uuid4().hex[:12]}")
    user_id: str  # Links to authenticated user
    user_name: str
    user_email: str
    user_picture: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    review_text: str
    platform: str  # Google, Facebook, etc.
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: Optional[datetime] = None


# Data imports - extracted from server.py for maintainability
from data.reviews import REVIEWS_DATA
from data.courses import GOLF_COURSES
from data.partners import PARTNER_OFFERS, BLOG_POSTS


# Email helper functions
async def send_contact_notification_email(inquiry: ContactInquiryCreate):
    """Send notification email to admin when new contact inquiry is received."""
    logo_url = "https://golfinmallorca.com/api/uploads/logo_email_v2.jpg"
    html_content = f"""
    <html>
    <head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
                <img src="{logo_url}" alt="golfinmallorca.com" style="width: 180px; height: auto; display: block; margin: 0 auto;" />
            </div>
            <div style="background: linear-gradient(135deg, #6B7B8C 0%, #7D8D9C 100%); padding: 14px 30px; text-align: center;">
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 12px; letter-spacing: 2px;">NEW CONTACT INQUIRY</p>
            </div>
            <div style="background-color: white; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 120px;">Name</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{inquiry.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px;"><a href="mailto:{inquiry.email}" style="color: #2D2D2D !important; text-decoration: none !important;">{inquiry.email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px;"><a href="tel:{inquiry.phone}" style="color: #2D2D2D !important; text-decoration: none !important;">{inquiry.phone or 'Not provided'}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Country</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px;">{inquiry.country}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Type</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px;">{inquiry.inquiry_type}</td>
                    </tr>
                </table>
                <div style="margin-top: 24px;">
                    <p style="color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Message</p>
                    <div style="background-color: #F5F2EB; padding: 20px; border-radius: 8px; border-left: 4px solid #6B7B8C;">
                        <p style="color: #2D2D2D; font-size: 15px; line-height: 1.7; margin: 0;">{inquiry.message}</p>
                    </div>
                </div>
            </div>
            <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;"><a href="https://golfinmallorca.com" style="color: rgba(255,255,255,0.7) !important; text-decoration: none !important;">golfinmallorca.com</a></p>
                <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 8px 0 0 0;"><a href="mailto:contact@golfinmallorca.com" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">contact@golfinmallorca.com</a> | <a href="tel:+34620987575" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">+34 620 987 575</a></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": ["contact@golfinmallorca.com"],
        "subject": f"New Contact Inquiry from {inquiry.name} - golfinmallorca.com",
        "html": html_content
    }
    
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Contact notification email sent for inquiry from {inquiry.email}")
    except Exception as e:
        logger.error(f"Failed to send contact notification email: {str(e)}")

async def send_newsletter_welcome_email(name: str, email: str):
    """Send welcome email to new newsletter subscriber."""
    logo_url = "https://golfinmallorca.com/api/uploads/logo_email_v2.jpg"
    html_content = f"""
    <html>
    <head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
                <img src="{logo_url}" alt="golfinmallorca.com" style="width: 180px; height: auto; display: block; margin: 0 auto;" />
            </div>
            <div style="background-color: #ffffff; padding: 30px 30px 10px 30px;">
                <h2 style="color: #2D2D2D; font-size: 22px; margin: 0 0 8px 0; font-weight: 500;">Welcome, {name}!</h2>
                <p style="color: #6B7B8C; font-size: 15px; line-height: 1.6; margin: 0;">
                    Thank you for joining our exclusive community of golf enthusiasts. You're now part of a select group who appreciate the finest courses and experiences Mallorca has to offer.
                </p>
            </div>
            <div style="background-color: #ffffff; padding: 10px 30px 30px 30px;">
                <div style="background-color: #F5F2EB; border-radius: 12px; padding: 24px; margin-top: 16px;">
                    <p style="color: #8B8680; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">As a subscriber, you'll receive:</p>
                    <table style="width: 100%;">
                        <tr><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">&#10003; Exclusive deals on green fees at premium courses</td></tr>
                        <tr><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">&#10003; Early access to golf &amp; hotel packages</td></tr>
                        <tr><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">&#10003; Insider tips on the best courses and restaurants</td></tr>
                        <tr><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">&#10003; Seasonal offers and special promotions</td></tr>
                    </table>
                </div>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="https://golfinmallorca.greenfee365.com" style="display: inline-block; background-color: #6B7B8C; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Book Your Tee Time</a>
                </div>
            </div>
            <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;">Questions? Contact us at</p>
                <a href="mailto:contact@golfinmallorca.com" style="color: #ffffff !important; font-size: 13px; text-decoration: none !important;">contact@golfinmallorca.com</a>
                <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 16px 0 0 0;"><a href="https://golfinmallorca.com" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">golfinmallorca.com</a> &mdash; Your Gateway to Luxury Golf in Mallorca</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [email],
        "subject": "Welcome to golfinmallorca.com!",
        "html": html_content
    }
    
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Welcome newsletter email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send welcome newsletter email: {str(e)}")

# Auth helper function
async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token in cookie or Authorization header."""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry with timezone awareness
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# Auth Routes
@api_router.post("/auth/session")
async def exchange_session(request: SessionIdRequest, response: Response):
    """Exchange session_id from Emergent Auth for user data and set session cookie."""
    try:
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": request.session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = auth_response.json()
        
        # Check if user exists
        existing_user = await db.users.find_one(
            {"email": auth_data["email"]},
            {"_id": 0}
        )
        
        if existing_user:
            user_id = existing_user["user_id"]
            # Update user data
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": auth_data["name"],
                    "picture": auth_data.get("picture")
                }}
            )
        else:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": auth_data["email"],
                "name": auth_data["name"],
                "picture": auth_data.get("picture"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        # Create session
        session_token = auth_data.get("session_token", f"session_{uuid.uuid4().hex}")
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Remove old sessions for this user
        await db.user_sessions.delete_many({"user_id": user_id})
        await db.user_sessions.insert_one(session_doc)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        
        return User(**user)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth session exchange error: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user and clear session."""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}

# Routes
@api_router.get("/")
async def root():
    return {"message": "Mallorca Golf Exclusive API"}

@api_router.get("/golf-courses", response_model=List[dict])
async def get_golf_courses(include_inactive: bool = False):
    """Get all golf courses from MongoDB, falls back to hardcoded data if empty"""
    # Try to fetch from MongoDB first
    query = {} if include_inactive else {"is_active": True}
    cursor = db.golf_courses.find(query, {"_id": 0}).sort("display_order", 1)
    
    courses = await cursor.to_list(length=100)
    
    # If no courses in database, return hardcoded data (for backward compatibility)
    if not courses:
        return GOLF_COURSES
    
    return courses


@api_router.get("/golf-courses/{course_id}")
async def get_golf_course_by_id(course_id: str):
    """Get a single golf course by its ID/slug"""
    course = await db.golf_courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        # Fallback to hardcoded data
        for c in GOLF_COURSES:
            if c["id"] == course_id:
                return c
        raise HTTPException(status_code=404, detail="Golf course not found")
    return course


@api_router.post("/golf-courses", response_model=dict, status_code=201)
async def create_golf_course(course: dict):
    """Create a new golf course (admin only)"""
    # Check if course with same ID already exists
    existing = await db.golf_courses.find_one({"id": course.get("id")})
    if existing:
        raise HTTPException(status_code=400, detail="Golf course with this ID already exists")
    
    # Add metadata
    now = datetime.now(timezone.utc)
    course["is_active"] = True
    course["display_order"] = course.get("display_order", 0)
    course["created_at"] = now
    course["updated_at"] = now
    
    await db.golf_courses.insert_one(course)
    
    # Return without _id
    course.pop("_id", None)
    return course


@api_router.put("/golf-courses/{course_id}", response_model=dict)
async def update_golf_course(course_id: str, course_update: dict):
    """Update an existing golf course (admin only)"""
    existing = await db.golf_courses.find_one({"id": course_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Golf course not found")
    
    # Remove fields that shouldn't be updated directly
    course_update.pop("_id", None)
    course_update.pop("id", None)
    course_update.pop("created_at", None)
    
    if course_update:
        course_update["updated_at"] = datetime.now(timezone.utc)
        await db.golf_courses.update_one(
            {"id": course_id},
            {"$set": course_update}
        )
    
    updated = await db.golf_courses.find_one({"id": course_id}, {"_id": 0})
    return updated


@api_router.delete("/golf-courses/{course_id}", status_code=204)
async def delete_golf_course(course_id: str):
    """Soft delete a golf course (sets is_active to False)"""
    result = await db.golf_courses.update_one(
        {"id": course_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Golf course not found")
    return None


@api_router.post("/golf-courses/reorder", status_code=200)
async def reorder_golf_courses(course_ids: List[str]):
    """Reorder golf courses by updating display_order (admin only)"""
    for index, course_id in enumerate(course_ids):
        await db.golf_courses.update_one(
            {"id": course_id},
            {"$set": {"display_order": index, "updated_at": datetime.now(timezone.utc)}}
        )
    return {"message": "Courses reordered successfully"}

@api_router.get("/partner-offers", response_model=List[dict])
async def get_partner_offers(type: Optional[str] = None):
    """Get partner offers from MongoDB, falls back to hardcoded data if empty"""
    
    if type == "hotel":
        cursor = db.hotels.find({"is_active": True}, {"_id": 0}).sort("display_order", 1)
        items = await cursor.to_list(length=100)
        if items:
            return items
    elif type == "restaurant":
        cursor = db.restaurants.find({"is_active": True}, {"_id": 0}).sort("display_order", 1)
        items = await cursor.to_list(length=100)
        if items:
            return items
    elif type == "beach_club":
        cursor = db.beach_clubs.find({"is_active": True}, {"_id": 0}).sort("display_order", 1)
        items = await cursor.to_list(length=100)
        if items:
            return items
    elif type == "cafe_bar":
        cursor = db.cafe_bars.find({"is_active": True}, {"_id": 0}).sort("display_order", 1)
        items = await cursor.to_list(length=100)
        if items:
            return items
    elif type is None:
        # Return all partners combined
        hotels = await db.hotels.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
        restaurants = await db.restaurants.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
        beach_clubs = await db.beach_clubs.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
        cafe_bars = await db.cafe_bars.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
        
        all_partners = hotels + restaurants + beach_clubs + cafe_bars
        if all_partners:
            return all_partners
    
    # Fallback to hardcoded data
    if type:
        return [o for o in PARTNER_OFFERS if o["type"] == type]
    return PARTNER_OFFERS


# Individual partner type endpoints
@api_router.get("/hotels", response_model=List[dict])
async def get_hotels(include_inactive: bool = False):
    """Get all hotels from MongoDB"""
    query = {} if include_inactive else {"is_active": True}
    cursor = db.hotels.find(query, {"_id": 0}).sort("display_order", 1)
    hotels = await cursor.to_list(length=200)
    if not hotels:
        return [o for o in PARTNER_OFFERS if o["type"] == "hotel"]
    return hotels


@api_router.get("/restaurants", response_model=List[dict])
async def get_restaurants(include_inactive: bool = False):
    """Get all restaurants from MongoDB"""
    query = {} if include_inactive else {"is_active": True}
    cursor = db.restaurants.find(query, {"_id": 0}).sort("display_order", 1)
    restaurants = await cursor.to_list(length=200)
    if not restaurants:
        return [o for o in PARTNER_OFFERS if o["type"] == "restaurant"]
    return restaurants


@api_router.get("/beach-clubs", response_model=List[dict])
async def get_beach_clubs(include_inactive: bool = False):
    """Get all beach clubs from MongoDB"""
    query = {} if include_inactive else {"is_active": True}
    cursor = db.beach_clubs.find(query, {"_id": 0}).sort("display_order", 1)
    beach_clubs = await cursor.to_list(length=200)
    if not beach_clubs:
        return [o for o in PARTNER_OFFERS if o["type"] == "beach_club"]
    return beach_clubs


@api_router.get("/cafe-bars", response_model=List[dict])
async def get_cafe_bars(include_inactive: bool = False):
    """Get all cafés and bars from MongoDB"""
    query = {} if include_inactive else {"is_active": True}
    cursor = db.cafe_bars.find(query, {"_id": 0}).sort("display_order", 1)
    cafe_bars = await cursor.to_list(length=200)
    if not cafe_bars:
        return [o for o in PARTNER_OFFERS if o["type"] == "cafe_bar"]
    return cafe_bars


# CRUD endpoints for each partner type
@api_router.post("/hotels", response_model=dict, status_code=201)
async def create_hotel(hotel: dict):
    """Create a new hotel"""
    existing = await db.hotels.find_one({"id": hotel.get("id")})
    if existing:
        raise HTTPException(status_code=400, detail="Hotel with this ID already exists")
    
    now = datetime.now(timezone.utc)
    hotel["type"] = "hotel"
    hotel["is_active"] = True
    hotel["display_order"] = hotel.get("display_order", 0)
    hotel["created_at"] = now
    hotel["updated_at"] = now
    
    await db.hotels.insert_one(hotel)
    hotel.pop("_id", None)
    return hotel


@api_router.put("/hotels/{hotel_id}", response_model=dict)
async def update_hotel(hotel_id: str, hotel_update: dict):
    """Update an existing hotel"""
    existing = await db.hotels.find_one({"id": hotel_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    hotel_update.pop("_id", None)
    hotel_update.pop("id", None)
    hotel_update.pop("created_at", None)
    
    if hotel_update:
        hotel_update["updated_at"] = datetime.now(timezone.utc)
        await db.hotels.update_one({"id": hotel_id}, {"$set": hotel_update})
    
    updated = await db.hotels.find_one({"id": hotel_id}, {"_id": 0})
    return updated


@api_router.delete("/hotels/{hotel_id}", status_code=204)
async def delete_hotel(hotel_id: str):
    """Soft delete a hotel"""
    result = await db.hotels.update_one(
        {"id": hotel_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return None


@api_router.post("/restaurants", response_model=dict, status_code=201)
async def create_restaurant(restaurant: dict):
    """Create a new restaurant"""
    existing = await db.restaurants.find_one({"id": restaurant.get("id")})
    if existing:
        raise HTTPException(status_code=400, detail="Restaurant with this ID already exists")
    
    now = datetime.now(timezone.utc)
    restaurant["type"] = "restaurant"
    restaurant["is_active"] = True
    restaurant["display_order"] = restaurant.get("display_order", 0)
    restaurant["created_at"] = now
    restaurant["updated_at"] = now
    
    await db.restaurants.insert_one(restaurant)
    restaurant.pop("_id", None)
    return restaurant


@api_router.put("/restaurants/{restaurant_id}", response_model=dict)
async def update_restaurant(restaurant_id: str, restaurant_update: dict):
    """Update an existing restaurant"""
    existing = await db.restaurants.find_one({"id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant_update.pop("_id", None)
    restaurant_update.pop("id", None)
    restaurant_update.pop("created_at", None)
    
    if restaurant_update:
        restaurant_update["updated_at"] = datetime.now(timezone.utc)
        await db.restaurants.update_one({"id": restaurant_id}, {"$set": restaurant_update})
    
    updated = await db.restaurants.find_one({"id": restaurant_id}, {"_id": 0})
    return updated


@api_router.delete("/restaurants/{restaurant_id}", status_code=204)
async def delete_restaurant(restaurant_id: str):
    """Soft delete a restaurant"""
    result = await db.restaurants.update_one(
        {"id": restaurant_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return None


@api_router.post("/beach-clubs", response_model=dict, status_code=201)
async def create_beach_club(beach_club: dict):
    """Create a new beach club"""
    existing = await db.beach_clubs.find_one({"id": beach_club.get("id")})
    if existing:
        raise HTTPException(status_code=400, detail="Beach club with this ID already exists")
    
    now = datetime.now(timezone.utc)
    beach_club["type"] = "beach_club"
    beach_club["is_active"] = True
    beach_club["display_order"] = beach_club.get("display_order", 0)
    beach_club["created_at"] = now
    beach_club["updated_at"] = now
    
    await db.beach_clubs.insert_one(beach_club)
    beach_club.pop("_id", None)
    return beach_club


@api_router.put("/beach-clubs/{beach_club_id}", response_model=dict)
async def update_beach_club(beach_club_id: str, beach_club_update: dict):
    """Update an existing beach club"""
    existing = await db.beach_clubs.find_one({"id": beach_club_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Beach club not found")
    
    beach_club_update.pop("_id", None)
    beach_club_update.pop("id", None)
    beach_club_update.pop("created_at", None)
    
    if beach_club_update:
        beach_club_update["updated_at"] = datetime.now(timezone.utc)
        await db.beach_clubs.update_one({"id": beach_club_id}, {"$set": beach_club_update})
    
    updated = await db.beach_clubs.find_one({"id": beach_club_id}, {"_id": 0})
    return updated


@api_router.delete("/beach-clubs/{beach_club_id}", status_code=204)
async def delete_beach_club(beach_club_id: str):
    """Soft delete a beach club"""
    result = await db.beach_clubs.update_one(
        {"id": beach_club_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Beach club not found")
    return None


@api_router.post("/cafe-bars", response_model=dict, status_code=201)
async def create_cafe_bar(cafe_bar: dict):
    """Create a new café/bar"""
    existing = await db.cafe_bars.find_one({"id": cafe_bar.get("id")})
    if existing:
        raise HTTPException(status_code=400, detail="Café/Bar with this ID already exists")
    
    now = datetime.now(timezone.utc)
    cafe_bar["type"] = "cafe_bar"
    cafe_bar["is_active"] = True
    cafe_bar["display_order"] = cafe_bar.get("display_order", 0)
    cafe_bar["created_at"] = now
    cafe_bar["updated_at"] = now
    
    await db.cafe_bars.insert_one(cafe_bar)
    cafe_bar.pop("_id", None)
    return cafe_bar


@api_router.put("/cafe-bars/{cafe_bar_id}", response_model=dict)
async def update_cafe_bar(cafe_bar_id: str, cafe_bar_update: dict):
    """Update an existing café/bar"""
    existing = await db.cafe_bars.find_one({"id": cafe_bar_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Café/Bar not found")
    
    cafe_bar_update.pop("_id", None)
    cafe_bar_update.pop("id", None)
    cafe_bar_update.pop("created_at", None)
    
    if cafe_bar_update:
        cafe_bar_update["updated_at"] = datetime.now(timezone.utc)
        await db.cafe_bars.update_one({"id": cafe_bar_id}, {"$set": cafe_bar_update})
    
    updated = await db.cafe_bars.find_one({"id": cafe_bar_id}, {"_id": 0})
    return updated


@api_router.delete("/cafe-bars/{cafe_bar_id}", status_code=204)
async def delete_cafe_bar(cafe_bar_id: str):
    """Soft delete a café/bar"""
    result = await db.cafe_bars.update_one(
        {"id": cafe_bar_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Café/Bar not found")
    return None


# Combined search endpoint for all partners
@api_router.get("/search")
async def search_partners(q: str = "", category: str = "all"):
    """Search across all partner types"""
    query = q.lower().strip()
    
    # Results grouped by priority
    golf_results = []
    hotel_results = []
    other_results = []
    
    # Define collections to search
    collections = {
        "golf": db.golf_courses,
        "hotel": db.hotels,
        "restaurant": db.restaurants,
        "beach_club": db.beach_clubs,
        "cafe_bar": db.cafe_bars
    }
    
    # If category is specified, only search that collection
    if category != "all" and category in collections:
        collections = {category: collections[category]}
    
    for partner_type, collection in collections.items():
        items = await collection.find({"is_active": True}, {"_id": 0}).to_list(100)
        
        for item in items:
            # Search in name and location
            name = item.get("name", "").lower()
            location = item.get("location", "").lower()
            
            # Search in description (which might be multilingual)
            description = item.get("description", {})
            if isinstance(description, dict):
                desc_text = " ".join([str(v).lower() for v in description.values()])
            else:
                desc_text = str(description).lower()
            
            # Check if query matches
            if not query or query in name or query in location or query in desc_text:
                result_item = {
                    "id": item.get("id"),
                    "type": partner_type,
                    "name": item.get("name"),
                    "location": item.get("location"),
                    "image": item.get("image"),
                    "description": item.get("description"),
                    "booking_url": item.get("booking_url"),
                    "price_from": item.get("price_from"),
                    "offer_price": item.get("offer_price"),
                    "discount_percent": item.get("discount_percent"),
                    "michelin_stars": item.get("michelin_stars"),
                    "category": item.get("category"),
                }
                
                # Sort into priority groups
                if partner_type == "golf":
                    golf_results.append(result_item)
                elif partner_type == "hotel":
                    hotel_results.append(result_item)
                else:
                    other_results.append(result_item)
    
    # Shuffle the "other" results to mix restaurants, beach clubs, cafes
    import random
    random.shuffle(other_results)
    
    # Static page results for landing pages
    page_results = [
        {
            "id": "golf-holidays-mallorca",
            "type": "page",
            "name": "Golf Holidays in Mallorca",
            "location": "Landing Page",
            "image": None,
            "description": {"en": "Custom golf holiday packages — stay and play deals, luxury resort packages, weekend breaks, group golf trips, and corporate golf events."},
            "booking_url": "/golf-holidays-mallorca",
            "price_from": None,
            "offer_price": None,
            "discount_percent": None,
            "michelin_stars": None,
            "category": "page",
            "keywords": "golf holidays mallorca golf holiday packages stay and play golf weekend breaks group trips luxury golf vacation deals packages golf trip planner concierge"
        },
        {
            "id": "book-tee-times",
            "type": "page",
            "name": "Book Tee Times in Mallorca",
            "location": "Landing Page",
            "image": None,
            "description": {"en": "Book tee times at 16 golf courses in Mallorca with instant confirmation. Green fees from EUR47. Discount tee times, last-minute deals, and group bookings."},
            "booking_url": "/book-tee-times",
            "price_from": None,
            "offer_price": None,
            "discount_percent": None,
            "michelin_stars": None,
            "category": "page",
            "keywords": "book tee times mallorca tee time booking reserve golf round discount green fees courses"
        }
    ]

    # Check if pages match query
    matching_pages = []
    for page in page_results:
        page_name = page["name"].lower()
        page_keywords = page.get("keywords", "").lower()
        page_desc = page["description"]["en"].lower()
        if not query or query in page_name or query in page_keywords or query in page_desc:
            result_copy = {k: v for k, v in page.items() if k != "keywords"}
            matching_pages.append(result_copy)

    # Combine: Pages first, Golf second, Hotels third, then mixed others
    results = matching_pages + golf_results + hotel_results + other_results
    
    return {
        "results": results,
        "count": len(results),
        "query": q,
        "category": category
    }

@api_router.get("/all-partners", response_model=dict)
async def get_all_partners():
    """Get all partners grouped by type"""
    golf_courses = await db.golf_courses.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
    hotels = await db.hotels.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
    restaurants = await db.restaurants.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
    beach_clubs = await db.beach_clubs.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
    cafe_bars = await db.cafe_bars.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
    
    # Fallback to hardcoded data if collections are empty
    if not golf_courses:
        golf_courses = GOLF_COURSES
    if not hotels:
        hotels = [o for o in PARTNER_OFFERS if o["type"] == "hotel"]
    if not restaurants:
        restaurants = [o for o in PARTNER_OFFERS if o["type"] == "restaurant"]
    if not beach_clubs:
        beach_clubs = [o for o in PARTNER_OFFERS if o["type"] == "beach_club"]
    if not cafe_bars:
        cafe_bars = [o for o in PARTNER_OFFERS if o["type"] == "cafe_bar"]
    
    # Apply image overrides from DB
    overrides = await db.image_overrides.find({}, {"_id": 0}).to_list(500)
    if overrides:
        override_map = {o["partner_id"]: o["image"] for o in overrides}
        for collection in [golf_courses, hotels, restaurants, beach_clubs, cafe_bars]:
            for item in collection:
                if item.get("id") in override_map:
                    item["image"] = override_map[item["id"]]
    
    return {
        "golf_courses": golf_courses,
        "hotels": hotels,
        "restaurants": restaurants,
        "beach_clubs": beach_clubs,
        "cafe_bars": cafe_bars,
        "total_count": len(golf_courses) + len(hotels) + len(restaurants) + len(beach_clubs) + len(cafe_bars)
    }


# Admin: Update partner image
@api_router.patch("/admin/partner/{partner_id}/image")
async def update_partner_image(partner_id: str, body: dict):
    """Update a partner's image URL"""
    image_url = body.get("image")
    if not image_url:
        raise HTTPException(status_code=400, detail="image URL is required")
    # Update in the actual collection
    for coll_name in ['hotels', 'restaurants', 'beach_clubs', 'cafe_bars', 'golf_courses']:
        result = await db[coll_name].update_one({"id": partner_id}, {"$set": {"image": image_url}})
        if result.modified_count > 0:
            return {"status": "ok", "partner_id": partner_id, "collection": coll_name}
    # Fallback: store override for hardcoded data
    await db.image_overrides.update_one(
        {"partner_id": partner_id},
        {"$set": {"partner_id": partner_id, "image": image_url}},
        upsert=True
    )
    return {"status": "ok", "partner_id": partner_id}


# Admin: Upload partner image file
@api_router.post("/admin/upload-image")
async def upload_partner_image(file: UploadFile = File(...)):
    """Upload an image to object storage and return the serve URL"""
    allowed = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and GIF images are allowed")
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    storage_path = f"{APP_NAME}/partners/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    result = await asyncio.to_thread(put_object, storage_path, data, file.content_type)
    serve_url = f"/api/images/{result['path']}"
    return {"url": serve_url, "path": result["path"]}


# Serve uploaded images from object storage
@api_router.get("/images/{path:path}")
async def serve_image(path: str):
    """Serve an image from object storage"""
    data, content_type = await asyncio.to_thread(get_object, path)
    return Response(content=data, media_type=content_type, headers={"Cache-Control": "public, max-age=31536000"})



# Display Settings endpoints
@api_router.get("/display-settings", response_model=dict)
async def get_display_settings():
    """Get display limits for each partner category"""
    settings = await db.display_settings.find_one({"id": "main"}, {"_id": 0})
    if not settings:
        # Return defaults - null means show all
        return {
            "golf": None,
            "hotels": None,
            "restaurants": None,
            "beach_clubs": None,
            "cafe_bars": None
        }
    return settings


@api_router.post("/display-settings", response_model=dict)
async def save_display_settings(settings: dict):
    """Save display limits for each partner category"""
    settings["id"] = "main"
    settings["updated_at"] = datetime.now(timezone.utc)
    
    await db.display_settings.update_one(
        {"id": "main"},
        {"$set": settings},
        upsert=True
    )
    
    # Return without _id
    saved = await db.display_settings.find_one({"id": "main"}, {"_id": 0})
    return saved


# Image Upload endpoint
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file and return the URL"""
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content
    content = await file.read()
    
    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")
    
    # Generate unique filename
    unique_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{unique_id}{file_ext}"
    
    # Save file
    file_path = UPLOADS_DIR / safe_filename
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Return the URL (relative to API)
    # The frontend will prepend the BACKEND_URL automatically when displaying
    image_url = f"/api/uploads/{safe_filename}"
    
    return {
        "success": True,
        "filename": safe_filename,
        "url": image_url,
        "size": len(content)
    }


@api_router.delete("/upload-image/{filename}")
async def delete_uploaded_image(filename: str):
    """Delete an uploaded image"""
    file_path = UPLOADS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Security: ensure the filename doesn't contain path traversal
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    file_path.unlink()
    return {"success": True, "message": "Image deleted"}

@api_router.post("/contact", response_model=ContactInquiry)
async def create_contact_inquiry(inquiry: ContactInquiryCreate):
    inquiry_obj = ContactInquiry(**inquiry.model_dump())
    doc = inquiry_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.contact_inquiries.insert_one(doc)
    
    # Send notification email to admin (non-blocking)
    asyncio.create_task(send_contact_notification_email(inquiry))
    
    return inquiry_obj

@api_router.get("/contact", response_model=List[ContactInquiry])
async def get_contact_inquiries():
    inquiries = await db.contact_inquiries.find({}, {"_id": 0}).to_list(1000)
    for inq in inquiries:
        if isinstance(inq['created_at'], str):
            inq['created_at'] = datetime.fromisoformat(inq['created_at'])
    return inquiries

# Trip Planner endpoint
@api_router.post("/trip-planner")
async def create_trip_request(request: TripPlannerRequest):
    entry = TripPlannerEntry(**request.model_dump())
    doc = entry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.trip_planner_requests.insert_one(doc)
    
    # Send notification email to admin + confirmation to customer
    asyncio.create_task(send_trip_planner_email(entry))
    asyncio.create_task(send_trip_planner_confirmation(entry))
    
    return {"id": entry.id, "status": "received", "message": "Your trip request has been received! We'll get back to you shortly."}

@api_router.get("/trip-planner")
async def get_trip_requests():
    requests = await db.trip_planner_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return requests

async def send_trip_planner_email(entry: TripPlannerEntry):
    """Send notification email when a new trip planner request is received."""
    try:
        services_html = ""
        if entry.group_type:
            group_label = "Golf Society" if entry.group_type == "society" else "Friends Golf Trip"
            services_html += f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Group Type</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{group_label}</td></tr>'
        if entry.group_name:
            services_html += f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Group Name</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{entry.group_name}</td></tr>'
        if entry.preferred_hotel:
            services_html += f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Hotel</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{entry.preferred_hotel}</td></tr>'
        if entry.preferred_restaurant:
            services_html += f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Restaurant</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{entry.preferred_restaurant}</td></tr>'
        if entry.preferred_beach_club:
            services_html += f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Beach Club</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{entry.preferred_beach_club}</td></tr>'
        if entry.transfer_pickup:
            transfer_info = f"{entry.transfer_pickup} → {entry.transfer_dropoff or 'TBD'}"
            if entry.transfer_type:
                type_labels = {'sedan': 'Mercedes S-Class', 'minibus': 'Luxury Minibus', 'coach': 'Premium Coach'}
                transfer_info += f" ({type_labels.get(entry.transfer_type, entry.transfer_type)})"
            services_html += f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Transfer</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{transfer_info}</td></tr>'
        
        special_requests_html = ""
        if entry.special_requests:
            special_requests_html = '<div style="margin-top: 20px; padding: 16px; background-color: #F5F2EB; border-radius: 8px;"><p style="color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Special Requests</p><p style="color: #2D2D2D; font-size: 14px; margin: 0;">' + entry.special_requests + '</p></div>'

        date_display = entry.date
        if entry.departure_date:
            date_display = f"{entry.date} → {entry.departure_date}"

        schedule_labels = {'transfer_arrival': 'Arrival Pickup', 'transfer_departure': 'Departure Pickup', 'restaurant': 'Dinner Reservation', 'beach_club': 'Beach Club'}
        schedule_rows = ''
        if entry.schedule:
            for key, val in entry.schedule.items():
                if val and (val.get('date') or val.get('time')):
                    label = schedule_labels.get(key, key.replace('_', ' ').title())
                    detail = f"{val.get('date', '')} {val.get('time', '')}".strip() or 'TBD'
                    schedule_rows += f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">{label}</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px;">{detail}</td></tr>'

        logo_url = "https://golfinmallorca.com/api/uploads/logo_email_v2.jpg"
        html_content = f"""
        <html>
        <head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
                    <img src="{logo_url}" alt="golfinmallorca.com" style="width: 180px; height: auto; display: block; margin: 0 auto;" />
                </div>
                <div style="background: linear-gradient(135deg, #6B7B8C 0%, #7D8D9C 100%); padding: 14px 30px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 12px; letter-spacing: 2px;">NEW TRIP PLANNER REQUEST</p>
                </div>
                <div style="background-color: white; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Name</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{entry.name}</td></tr>
                        <tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px;">{entry.email}</td></tr>
                        <tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px;"><a href="tel:{entry.phone}" style="color: #2D2D2D !important; text-decoration: none !important;">{entry.phone or 'N/A'}</a></td></tr>
                        <tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{date_display}</td></tr>
                        {schedule_rows}
                        <tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Group Size</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px;">{entry.group_size} people</td></tr>
                        <tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Services</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px;">{', '.join(entry.services)}</td></tr>
                        <tr><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Budget</td><td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 15px; font-weight: 500;">{entry.budget or 'N/A'}</td></tr>
                        {services_html}
                    </table>
                    {special_requests_html}
                </div>
                <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;"><a href="https://golfinmallorca.com" style="color: rgba(255,255,255,0.7) !important; text-decoration: none !important;">golfinmallorca.com</a></p>
                    <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 8px 0 0 0;"><a href="mailto:contact@golfinmallorca.com" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">contact@golfinmallorca.com</a> | <a href="tel:+34620987575" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">+34 620 987 575</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [SENDER_EMAIL],
            "subject": f"{'GOLF GROUP: ' if entry.group_type else ''}Trip Planner: {entry.name} - {', '.join(entry.services)}",
            "html": html_content,
        }
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        print(f"Error sending trip planner email: {e}")

async def send_trip_planner_confirmation(entry: TripPlannerEntry):
    """Send confirmation email to the customer."""
    try:
        service_names = []
        for s in entry.services:
            if s == 'hotel':
                service_names.append('Hotel Stay')
            elif s == 'restaurant':
                service_names.append('Michelin Dining')
            elif s == 'beach_club':
                service_names.append('Beach Club')
            elif s == 'transfer':
                service_names.append('Premium Transfer')

        details_rows = ""
        if entry.preferred_hotel:
            details_rows += f'<tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px;">Hotel</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px; font-weight: 500;">{entry.preferred_hotel}</td></tr>'
        if entry.preferred_restaurant:
            details_rows += f'<tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px;">Restaurant</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px; font-weight: 500;">{entry.preferred_restaurant}</td></tr>'
        if entry.preferred_beach_club:
            details_rows += f'<tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px;">Beach Club</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px; font-weight: 500;">{entry.preferred_beach_club}</td></tr>'
        if entry.transfer_pickup:
            details_rows += f'<tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px;">Transfer</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px; font-weight: 500;">{entry.transfer_pickup} → {entry.transfer_dropoff or "TBD"}</td></tr>'

        budget_map = {'moderate': '€1,000 – €2,500', 'premium': '€2,500 – €4,000', 'luxury': '€4,000+'}
        budget_display = budget_map.get(entry.budget, 'N/A')
        group_word = 'person' if entry.group_size == 1 else 'people'
        date_display = entry.date
        if entry.departure_date:
            date_display = f"{entry.date} → {entry.departure_date}"

        schedule_labels = {'transfer_arrival': 'Arrival Pickup', 'transfer_departure': 'Departure Pickup', 'restaurant': 'Dinner Reservation', 'beach_club': 'Beach Club'}
        schedule_rows = ''
        if entry.schedule:
            for key, val in entry.schedule.items():
                if val and (val.get('date') or val.get('time')):
                    label = schedule_labels.get(key, key.replace('_', ' ').title())
                    detail = f"{val.get('date', '')} {val.get('time', '')}".strip() or 'TBD'
                    schedule_rows += f'<tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px;">{label}</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px;">{detail}</td></tr>'

        logo_url = "https://golfinmallorca.com/api/uploads/logo_email_v2.jpg"
        html_content = f"""
        <html>
        <head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <!-- Header with logo -->
                <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
                    <img src="{logo_url}" alt="golfinmallorca.com" style="width: 180px; height: auto; display: block; margin: 0 auto;" />
                </div>

                <!-- Greeting -->
                <div style="background-color: #ffffff; padding: 30px 30px 10px 30px;">
                    <h1 style="color: #2D2D2D; font-size: 22px; margin: 0 0 8px 0;">Thank you, {entry.name}!</h1>
                    <p style="color: #6B7B8C; font-size: 15px; line-height: 1.6; margin: 0;">We've received your request and our team will get back to you within 24 hours with a personalised plan.</p>
                </div>

                <!-- Request Summary -->
                <div style="background-color: #ffffff; padding: 10px 30px 30px 30px;">
                    <div style="background-color: #F5F2EB; border-radius: 12px; padding: 24px; margin-top: 16px;">
                        <p style="color: #8B8680; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Your Request Summary</p>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px; width: 120px;">Services</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px; font-weight: 500;">{', '.join(service_names)}</td></tr>
                            <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px;">Budget</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px; font-weight: 500;">{budget_display}</td></tr>
                            <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px;">Date</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px; font-weight: 500;">{date_display}</td></tr>
                            {schedule_rows}
                            <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px;">Group</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px;">{entry.group_size} {group_word}</td></tr>
                            {details_rows}
                        </table>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;">Questions? Reply to this email or contact us at</p>
                    <a href="mailto:contact@golfinmallorca.com" style="color: #ffffff !important; font-size: 13px; text-decoration: none !important;">contact@golfinmallorca.com</a>
                    <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 16px 0 0 0;"><a href="https://golfinmallorca.com" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">golfinmallorca.com</a> — Your Gateway to Luxury Golf in Mallorca</p>
                </div>
            </div>
        </body>
        </html>
        """

        params = {
            "from": SENDER_EMAIL,
            "to": [entry.email],
            "subject": "Your Trip Request Confirmation — golfinmallorca.com",
            "html": html_content,
        }
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        print(f"Error sending trip confirmation email: {e}")



# Newsletter endpoints
@api_router.post("/newsletter", response_model=NewsletterSubscription)
async def subscribe_newsletter(subscription: NewsletterSubscriptionCreate):
    # Check if email already exists
    existing = await db.newsletter_subscriptions.find_one({"email": subscription.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")
    
    subscription_obj = NewsletterSubscription(**subscription.model_dump())
    doc = subscription_obj.model_dump()
    doc['subscribed_at'] = doc['subscribed_at'].isoformat()
    
    await db.newsletter_subscriptions.insert_one(doc)
    
    # Send welcome email to subscriber (non-blocking)
    asyncio.create_task(send_newsletter_welcome_email(subscription.name, subscription.email))
    
    return subscription_obj

@api_router.get("/newsletter", response_model=List[NewsletterSubscription])
async def get_newsletter_subscriptions():
    subscriptions = await db.newsletter_subscriptions.find({"is_active": True}, {"_id": 0}).to_list(1000)
    for sub in subscriptions:
        if isinstance(sub['subscribed_at'], str):
            sub['subscribed_at'] = datetime.fromisoformat(sub['subscribed_at'])
    return subscriptions

@api_router.delete("/newsletter/{subscriber_id}")
async def delete_newsletter_subscriber(subscriber_id: str, request: Request):
    """Delete a newsletter subscriber (admin only)."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.newsletter_subscriptions.delete_one({"id": subscriber_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    return {"message": "Subscriber deleted successfully"}

@api_router.post("/newsletter/add")
async def add_subscriber_manual(request: Request, name: str = "", email: str = "", country: str = ""):
    """Add a single subscriber manually (admin only)."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if email exists
    existing = await db.newsletter_subscriptions.find_one({"email": email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")
    
    subscription = {
        "id": str(uuid.uuid4()),
        "email": email.lower(),
        "name": name,
        "country": country,
        "subscribed_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await db.newsletter_subscriptions.insert_one(subscription)
    if "_id" in subscription:
        del subscription["_id"]
    
    return subscription

@api_router.post("/newsletter/import-csv")
async def import_subscribers_csv(request: Request, file: UploadFile = File(...)):
    """Import subscribers from CSV file (admin only)."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    import csv
    import io
    
    content = await file.read()
    decoded = content.decode('utf-8')
    
    reader = csv.DictReader(io.StringIO(decoded))
    
    imported = 0
    skipped = 0
    errors = []
    
    for row in reader:
        # Try to find email, name, country columns (flexible naming)
        email = row.get('email') or row.get('Email') or row.get('EMAIL') or row.get('e-mail') or ''
        name = row.get('name') or row.get('Name') or row.get('NAME') or row.get('first_name', '') + ' ' + row.get('last_name', '') or ''
        country = row.get('country') or row.get('Country') or row.get('COUNTRY') or ''
        
        email = email.strip().lower()
        name = name.strip()
        country = country.strip()
        
        if not email or '@' not in email:
            skipped += 1
            continue
        
        # Check if exists
        existing = await db.newsletter_subscriptions.find_one({"email": email})
        if existing:
            skipped += 1
            continue
        
        subscription = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": name or "Subscriber",
            "country": country or "Unknown",
            "subscribed_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        }
        
        try:
            await db.newsletter_subscriptions.insert_one(subscription)
            imported += 1
        except Exception as e:
            errors.append(f"{email}: {str(e)}")
    
    return {
        "success": True,
        "imported": imported,
        "skipped": skipped,
        "errors": errors[:10]  # Limit errors shown
    }

@api_router.post("/newsletter/send-bulk")
async def send_bulk_email(request: Request, subject: str = "", message: str = ""):
    """Send bulk email to all active subscribers (admin only)."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not subject or not message:
        raise HTTPException(status_code=400, detail="Subject and message are required")
    
    # Get all active subscribers
    subscribers = await db.newsletter_subscriptions.find({"is_active": True}, {"_id": 0}).to_list(10000)
    
    if not subscribers:
        raise HTTPException(status_code=400, detail="No active subscribers found")
    
    sent = 0
    failed = 0
    
    for sub in subscribers:
        try:
            logo_url = "https://golfinmallorca.com/api/uploads/logo_email_v2.jpg"
            html_content = f"""
            <html>
            <head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head>
            <body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
                        <img src="{logo_url}" alt="golfinmallorca.com" style="width: 200px; height: auto; display: block; margin: 0 auto;" />
                    </div>
                    <div style="background: linear-gradient(135deg, #6B7B8C 0%, #7D8D9C 100%); padding: 14px 30px; text-align: center;">
                        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 13px; font-style: italic;">Your Gateway to Luxury Golf in Mallorca</p>
                    </div>
                    
                    <div style="background-color: white; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <h2 style="color: #2D2D2D; font-size: 22px; margin: 0 0 20px 0; font-weight: 500;">{subject}</h2>
                        
                        <div style="color: #57534E; font-size: 15px; line-height: 1.7;">
                            {message.replace(chr(10), '<br>')}
                        </div>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="https://golfinmallorca.greenfee365.com" style="display: inline-block; background-color: #6B7B8C; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">Book Your Tee Time</a>
                        </div>
                    </div>
                    
                    <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
                        <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;">Questions? Contact us at</p>
                        <a href="mailto:contact@golfinmallorca.com" style="color: #ffffff !important; font-size: 13px; text-decoration: none !important;">contact@golfinmallorca.com</a>
                        <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 16px 0 0 0;"><a href="https://golfinmallorca.com" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">golfinmallorca.com</a> &mdash; Your Gateway to Luxury Golf in Mallorca</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            params = {
                "from": SENDER_EMAIL,
                "to": [sub["email"]],
                "subject": subject,
                "html": html_content
            }
            
            await asyncio.to_thread(resend.Emails.send, params)
            sent += 1
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.1)
            
        except Exception as e:
            logging.error(f"Failed to send to {sub['email']}: {e}")
            failed += 1
    
    return {
        "success": True,
        "sent": sent,
        "failed": failed,
        "total_subscribers": len(subscribers)
    }

@api_router.delete("/contact/{contact_id}")
async def delete_contact_inquiry(contact_id: str, request: Request):
    """Delete a contact inquiry (admin only)."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.contact_inquiries.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact inquiry not found")
    
    return {"message": "Contact inquiry deleted successfully"}

# Blog endpoints
@api_router.get("/blog", response_model=List[dict])
async def get_blog_posts(category: Optional[str] = None):
    posts = BLOG_POSTS
    if category:
        posts = [p for p in posts if p["category"] == category]
    return sorted(posts, key=lambda x: x["created_at"], reverse=True)

@api_router.get("/blog/{slug}", response_model=dict)
async def get_blog_post(slug: str):
    for post in BLOG_POSTS:
        if post["slug"] == slug:
            return post
    raise HTTPException(status_code=404, detail="Blog post not found")

# Review endpoints
@api_router.get("/reviews", response_model=List[dict])
async def get_reviews(limit: Optional[int] = None, country: Optional[str] = None, platform: Optional[str] = None):
    """Get all reviews with optional filters."""
    reviews = REVIEWS_DATA.copy()
    
    if country:
        reviews = [r for r in reviews if r["country"].lower() == country.lower()]
    if platform:
        reviews = [r for r in reviews if r["platform"].lower() == platform.lower()]
    if limit:
        reviews = reviews[:limit]
    
    return reviews

@api_router.post("/reviews", response_model=dict)
async def create_review(review: ClientReviewCreate):
    """Submit a new review."""
    new_id = max(r["id"] for r in REVIEWS_DATA) + 1
    review_data = {
        "id": new_id,
        "user_name": review.user_name,
        "country": review.country,
        "platform": review.platform,
        "rating": review.rating,
        "language": review.language,
        "review_text": review.review_text
    }
    await db.reviews.insert_one(review_data)
    return {"message": "Review submitted successfully!", "id": new_id}

@api_router.post("/reviews/submit", response_model=dict)
async def submit_user_review(review: UserReviewSubmission, request: Request):
    """Submit a review from authenticated user (requires login, pending admin approval)."""
    # Get user from session
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in with Google to submit a review.")
    
    # Find session
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Session not found. Please sign in again.")
    
    # Check session expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found.")
    
    # Create the review
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    review_doc = {
        "review_id": review_id,
        "user_id": user_doc["user_id"],
        "user_name": user_doc["name"],
        "user_email": user_doc["email"],
        "user_picture": user_doc.get("picture"),
        "rating": review.rating,
        "review_text": review.review_text,
        "platform": review.platform,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_at": None
    }
    
    await db.user_reviews.insert_one(review_doc)
    
    return {
        "message": "Thank you! Your review has been submitted and is pending approval.",
        "review_id": review_id,
        "status": "pending"
    }

@api_router.get("/reviews/pending", response_model=List[dict])
async def get_pending_reviews(request: Request):
    """Get all pending reviews (admin only - for now returns all pending)."""
    cursor = db.user_reviews.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("created_at", -1)
    
    reviews = await cursor.to_list(length=100)
    return reviews

@api_router.put("/reviews/{review_id}/approve", response_model=dict)
async def approve_review(review_id: str):
    """Approve a pending review (admin only)."""
    result = await db.user_reviews.update_one(
        {"review_id": review_id},
        {"$set": {"status": "approved", "reviewed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"message": "Review approved", "review_id": review_id}

@api_router.put("/reviews/{review_id}/reject", response_model=dict)
async def reject_review(review_id: str):
    """Reject a pending review (admin only)."""
    result = await db.user_reviews.update_one(
        {"review_id": review_id},
        {"$set": {"status": "rejected", "reviewed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"message": "Review rejected", "review_id": review_id}

@api_router.get("/reviews/stats", response_model=dict)
async def get_review_stats():
    """Get review statistics."""
    reviews = REVIEWS_DATA
    
    if not reviews:
        return {"average_rating": 0, "total_reviews": 0, "rating_distribution": {}, "by_country": {}, "by_platform": {}}
    
    total = len(reviews)
    avg = sum(r["rating"] for r in reviews) / total
    distribution = {i: len([r for r in reviews if r["rating"] == i]) for i in range(1, 6)}
    
    # Count by country
    by_country = {}
    for r in reviews:
        country = r["country"]
        by_country[country] = by_country.get(country, 0) + 1
    
    # Count by platform
    by_platform = {}
    for r in reviews:
        platform = r["platform"]
        by_platform[platform] = by_platform.get(platform, 0) + 1
    
    return {
        "average_rating": round(avg, 1),
        "total_reviews": total,
        "rating_distribution": distribution,
        "by_country": by_country,
        "by_platform": by_platform
    }


# ─── Stripe Payment Endpoints ─────────────────────────────────────────────────

def _gen_payment_id():
    """Generate a short, URL-friendly payment ID"""
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choices(chars, k=8))


class CreatePaymentRequest(BaseModel):
    customer_name: str
    customer_email: EmailStr
    amount: float = Field(..., gt=0)
    currency: str = Field(default="eur")
    description: str
    service_type: str = Field(default="reservation")  # "reservation" or "package"


CURRENCY_SYMBOLS = {"eur": "\u20AC", "gbp": "\u00A3", "usd": "$"}


async def send_payment_link_email(payment: dict, payment_link: str):
    """Send payment link to customer"""
    logo_url = "https://golfinmallorca.com/api/uploads/logo_email_v2.jpg"
    sym = CURRENCY_SYMBOLS.get(payment["currency"], payment["currency"].upper())
    stype = "Package Payment" if payment["service_type"] == "package" else "Reservation Deposit"
    html = f"""
    <html><head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head><body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
            <img src="{logo_url}" alt="golfinmallorca.com" style="width: 180px; height: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="background: linear-gradient(135deg, #6B7B8C 0%, #7D8D9C 100%); padding: 14px 30px; text-align: center;">
            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 12px; letter-spacing: 2px;">{stype.upper()}</p>
        </div>
        <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <p style="color: #2D2D2D; font-size: 16px; margin: 0 0 8px;">Hello {payment["customer_name"]},</p>
            <p style="color: #6B7B8C; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                A payment request has been created for you by Golf in Mallorca.
            </p>
            <div style="background-color: #F5F2EB; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="color: #6B7B8C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Description</p>
                <p style="color: #2D2D2D; font-size: 15px; font-weight: 500; margin: 0 0 12px;">{payment["description"]}</p>
                <p style="color: #6B7B8C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Amount</p>
                <p style="color: #2D2D2D; font-size: 24px; font-weight: 700; margin: 0;">{sym}{payment["amount"]:.2f}</p>
            </div>
            <div style="text-align: center;">
                <a href="{payment_link}" style="display: inline-block; background-color: #6B7B8C; color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 14px; font-weight: 600;">Pay Now</a>
            </div>
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 20px 0 0;">
                Or copy this link: <a href="{payment_link}" style="color: #3D3D3D !important; text-decoration: none !important;">{payment_link}</a>
            </p>
        </div>
        <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;">Secure payment powered by Stripe</p>
            <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 8px 0 0 0;"><a href="mailto:contact@golfinmallorca.com" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">contact@golfinmallorca.com</a> | <a href="tel:+34620987575" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">+34 620 987 575</a></p>
        </div>
    </div></body></html>"""
    try:
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL,
            "to": [payment["customer_email"]],
            "subject": f"Payment Request from Golf in Mallorca - {sym}{payment['amount']:.2f}",
            "html": html,
        })
        logger.info(f"Payment link email sent to {payment['customer_email']}")
    except Exception as e:
        logger.error(f"Failed to send payment link email: {e}")


async def send_payment_confirmation_emails(payment: dict):
    """Send confirmation emails to both admin and customer after successful payment"""
    logo_url = "https://golfinmallorca.com/api/uploads/logo_email_v2.jpg"
    sym = CURRENCY_SYMBOLS.get(payment.get("currency", "eur"), "EUR")
    stype = "Package Payment" if payment.get("service_type") == "package" else "Reservation Deposit"

    # --- Email to ADMIN (Style B - notification with green subheader) ---
    admin_html = f"""
    <html><head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head><body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
            <img src="{logo_url}" alt="golfinmallorca.com" style="width: 180px; height: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="background: linear-gradient(135deg, #6B7B8C 0%, #7D8D9C 100%); padding: 14px 30px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 12px; letter-spacing: 2px;">PAYMENT RECEIVED</p>
        </div>
        <div style="background-color: white; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <p style="color: #2D2D2D; font-size: 16px; font-weight: 600; margin: 0 0 20px;">
                {payment.get("customer_name", "A customer")} just paid {sym}{payment.get("amount", 0):.2f}
            </p>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 120px;">Customer</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 14px;">{payment.get("customer_name", "")}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 14px;">{payment.get("customer_email", "")}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Type</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 14px;">{stype}</td></tr>
                <tr><td style="padding: 10px 0; border-bottom: 1px solid #E5E5E5; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #E5E5E5; color: #2D2D2D; font-size: 18px; font-weight: 700;">{sym}{payment.get("amount", 0):.2f}</td></tr>
                <tr><td style="padding: 10px 0; color: #6B7B8C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Description</td>
                    <td style="padding: 10px 0; color: #2D2D2D; font-size: 14px;">{payment.get("description", "")}</td></tr>
            </table>
        </div>
        <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;"><a href="https://golfinmallorca.com" style="color: rgba(255,255,255,0.7) !important; text-decoration: none !important;">golfinmallorca.com</a></p>
            <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 8px 0 0 0;"><a href="mailto:contact@golfinmallorca.com" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">contact@golfinmallorca.com</a> | <a href="tel:+34620987575" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">+34 620 987 575</a></p>
        </div>
    </div></body></html>"""

    # --- Email to CUSTOMER (Style A - warm confirmation like trip planner) ---
    customer_html = f"""
    <html><head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head><body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
            <img src="{logo_url}" alt="golfinmallorca.com" style="width: 180px; height: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="background-color: #ffffff; padding: 30px 30px 10px 30px;">
            <h1 style="color: #2D2D2D; font-size: 22px; margin: 0 0 8px 0;">Thank you, {payment.get("customer_name", "")}!</h1>
            <p style="color: #6B7B8C; font-size: 15px; line-height: 1.6; margin: 0;">Your payment has been received successfully. Here's your receipt:</p>
        </div>
        <div style="background-color: #ffffff; padding: 10px 30px 30px 30px;">
            <div style="background-color: #F5F2EB; border-radius: 12px; padding: 24px; margin-top: 16px;">
                <p style="color: #8B8680; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Payment Receipt</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px; width: 120px;">Description</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px; font-weight: 500;">{payment.get("description", "")}</td></tr>
                    <tr><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #8B8680; font-size: 13px;">Type</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E4DD; color: #3D3D3D; font-size: 14px; font-weight: 500;">{stype}</td></tr>
                    <tr><td style="padding: 10px 0; color: #8B8680; font-size: 13px;">Amount Paid</td><td style="padding: 10px 0; color: #2D2D2D; font-size: 20px; font-weight: 700;">{sym}{payment.get("amount", 0):.2f}</td></tr>
                </table>
            </div>
        </div>
        <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;">Questions? Reply to this email or contact us at</p>
            <a href="mailto:contact@golfinmallorca.com" style="color: #ffffff !important; font-size: 13px; text-decoration: none !important;">contact@golfinmallorca.com</a>
            <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 16px 0 0 0;"><a href="https://golfinmallorca.com" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">golfinmallorca.com</a> &mdash; Your Gateway to Luxury Golf in Mallorca</p>
        </div>
    </div></body></html>"""

    try:
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL,
            "to": ["contact@golfinmallorca.com"],
            "subject": f"Payment Received: {sym}{payment.get('amount', 0):.2f} from {payment.get('customer_name', 'Customer')}",
            "html": admin_html,
        })
        logger.info("Payment confirmation sent to admin")
    except Exception as e:
        logger.error(f"Failed to send admin payment confirmation: {e}")

    try:
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL,
            "to": [payment.get("customer_email")],
            "subject": f"Payment Confirmation - Golf in Mallorca - {sym}{payment.get('amount', 0):.2f}",
            "html": customer_html,
        })
        logger.info(f"Payment receipt sent to {payment.get('customer_email')}")
    except Exception as e:
        logger.error(f"Failed to send customer payment receipt: {e}")


@api_router.post("/admin/payment-request")
async def create_payment_request(body: CreatePaymentRequest, request: Request):
    """Admin creates a payment request that generates a shareable payment link"""
    payment_id = _gen_payment_id()
    doc = {
        "payment_id": payment_id,
        "customer_name": body.customer_name,
        "customer_email": body.customer_email,
        "amount": float(body.amount),
        "currency": body.currency.lower(),
        "description": body.description,
        "service_type": body.service_type,
        "status": "pending",
        "checkout_session_id": None,
        "payment_status": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "paid_at": None,
    }
    await db.payment_transactions.insert_one(doc)
    origin = request.headers.get("origin") or str(request.base_url).rstrip("/")
    payment_link = f"{origin}/pay/{payment_id}"
    asyncio.create_task(send_payment_link_email(doc, payment_link))
    return {
        "payment_id": payment_id,
        "status": "pending",
        "amount": doc["amount"],
        "currency": doc["currency"],
    }


@api_router.get("/admin/payments")
async def list_payments():
    """Admin: list all payment requests"""
    payments = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return payments


@api_router.get("/admin/payment-stats")
async def get_payment_stats():
    """Admin: get payment summary stats"""
    all_payments = await db.payment_transactions.find({}, {"_id": 0, "status": 1, "amount": 1, "currency": 1}).to_list(500)
    total = len(all_payments)
    paid = [p for p in all_payments if p.get("status") == "paid"]
    pending = [p for p in all_payments if p.get("status") in ("pending", "initiated")]
    total_collected = sum(p.get("amount", 0) for p in paid)
    total_pending = sum(p.get("amount", 0) for p in pending)
    return {
        "total_requests": total,
        "paid_count": len(paid),
        "pending_count": len(pending),
        "total_collected": round(total_collected, 2),
        "total_pending": round(total_pending, 2),
    }


@api_router.get("/payment/{payment_id}")
async def get_payment_details(payment_id: str):
    """Public: get payment request details for the customer payment page"""
    doc = await db.payment_transactions.find_one({"payment_id": payment_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Payment request not found")
    return {
        "payment_id": doc["payment_id"],
        "customer_name": doc["customer_name"],
        "amount": doc["amount"],
        "currency": doc["currency"],
        "description": doc["description"],
        "service_type": doc["service_type"],
        "status": doc["status"],
    }


@api_router.post("/payment/{payment_id}/checkout")
async def create_checkout_session(payment_id: str, request: Request):
    """Create a Stripe checkout session for a payment request"""
    doc = await db.payment_transactions.find_one({"payment_id": payment_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Payment request not found")
    if doc["status"] == "paid":
        raise HTTPException(status_code=400, detail="This payment has already been completed")

    origin = request.headers.get("origin") or str(request.base_url).rstrip("/")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}api/webhook/stripe"

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_secret=STRIPE_WEBHOOK_SECRET, webhook_url=webhook_url)

    success_url = f"{origin}/pay/{payment_id}?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/pay/{payment_id}"

    checkout_req = CheckoutSessionRequest(
        amount=float(doc["amount"]),
        currency=doc["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "payment_id": payment_id,
            "customer_name": doc["customer_name"],
            "customer_email": doc["customer_email"],
            "service_type": doc["service_type"],
        },
    )

    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_req)

    await db.payment_transactions.update_one(
        {"payment_id": payment_id},
        {"$set": {
            "checkout_session_id": session.session_id,
            "status": "initiated",
            "payment_status": "pending",
        }}
    )

    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/payment/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    """Poll Stripe for payment status and update DB"""
    doc = await db.payment_transactions.find_one({"checkout_session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Payment session not found")

    if doc.get("status") == "paid":
        return {"status": "paid", "payment_status": "paid", "payment_id": doc["payment_id"]}

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_secret=STRIPE_WEBHOOK_SECRET, webhook_url=webhook_url)

    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    update_fields = {
        "payment_status": checkout_status.payment_status,
    }
    if checkout_status.payment_status == "paid":
        update_fields["status"] = "paid"
        update_fields["paid_at"] = datetime.now(timezone.utc).isoformat()
    elif checkout_status.status == "expired":
        update_fields["status"] = "expired"

    # Only send confirmation if transitioning to paid for the first time
    was_unpaid = doc.get("status") != "paid"
    await db.payment_transactions.update_one(
        {"checkout_session_id": session_id},
        {"$set": update_fields}
    )
    if checkout_status.payment_status == "paid" and was_unpaid:
        asyncio.create_task(send_payment_confirmation_emails(doc))

    return {
        "status": update_fields.get("status", doc["status"]),
        "payment_status": checkout_status.payment_status,
        "payment_id": doc["payment_id"],
    }


@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    body = await request.body()
    sig = request.headers.get("Stripe-Signature")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}api/webhook/stripe"

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_secret=STRIPE_WEBHOOK_SECRET, webhook_url=webhook_url)
    try:
        event = await stripe_checkout.handle_webhook(body, sig)
        if event.payment_status == "paid" and event.session_id:
            result = await db.payment_transactions.update_one(
                {"checkout_session_id": event.session_id, "status": {"$ne": "paid"}},
                {"$set": {
                    "status": "paid",
                    "payment_status": "paid",
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                }}
            )
            if result.modified_count > 0:
                doc = await db.payment_transactions.find_one({"checkout_session_id": event.session_id}, {"_id": 0})
                if doc:
                    asyncio.create_task(send_payment_confirmation_emails(doc))
    except Exception as e:
        logging.error(f"Webhook error: {e}")
    return {"status": "ok"}


@api_router.delete("/admin/payment/{payment_id}")
async def delete_payment_request(payment_id: str):
    """Admin: delete/cancel a payment request"""
    result = await db.payment_transactions.delete_one({"payment_id": payment_id, "status": {"$ne": "paid"}})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Cannot delete a paid payment or payment not found")
    return {"status": "deleted", "payment_id": payment_id}


@api_router.post("/booking-request", response_model=dict)
async def create_booking_request(booking: BookingRequestCreate):
    """Submit a booking request for a restaurant or beach club."""
    booking_dict = booking.model_dump()
    booking_dict["id"] = str(uuid.uuid4())
    booking_dict["status"] = "pending"
    booking_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.booking_requests.insert_one(booking_dict)
    booking_dict.pop("_id", None)
    asyncio.create_task(send_booking_admin_email(booking_dict))
    asyncio.create_task(send_booking_confirmation_email(booking_dict))
    return {"success": True, "id": booking_dict["id"], "message": "Booking request submitted successfully"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ BOOKING REQUEST ============

async def send_booking_admin_email(booking: dict):
    """Send booking request notification to admin."""
    logo_url = "https://golfinmallorca.com/api/uploads/logo_email_v2.jpg"
    dietary_text = ", ".join(booking.get("dietary", [])) if booking.get("dietary") else "None"
    allergies_text = booking.get("allergies", "") or "None"
    special_text = booking.get("special_requests", "") or "None"
    html_content = f"""
    <html>
    <head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
                <img src="{logo_url}" alt="golfinmallorca.com" style="width: 180px; height: auto; display: block; margin: 0 auto;" />
            </div>
            <div style="background-color: #ffffff; padding: 30px 30px 10px 30px;">
                <h2 style="color: #2D2D2D; font-size: 22px; margin: 0 0 8px 0; font-weight: 500;">New Booking Request</h2>
                <p style="color: #6B7B8C; font-size: 15px; line-height: 1.6; margin: 0;">A new reservation request has been submitted via golfinmallorca.com</p>
            </div>
            <div style="background-color: #ffffff; padding: 10px 30px 30px 30px;">
                <div style="background-color: #F5F2EB; border-radius: 12px; padding: 24px; margin-top: 16px;">
                    <p style="color: #8B8680; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Venue Details</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px; width: 120px;">Venue</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px; font-weight: 600;">{booking["venue_name"]}</td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Type</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">{booking["venue_type"].replace("_", " ").title()}</td></tr>
                    </table>
                </div>
                <div style="background-color: #F5F2EB; border-radius: 12px; padding: 24px; margin-top: 12px;">
                    <p style="color: #8B8680; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Reservation Details</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px; width: 120px;">Date</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px; font-weight: 600;">{booking["date"]}</td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Time</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">{booking["time"]}</td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Guests</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">{booking["guests"]}</td></tr>
                    </table>
                </div>
                <div style="background-color: #F5F2EB; border-radius: 12px; padding: 24px; margin-top: 12px;">
                    <p style="color: #8B8680; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Guest Information</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px; width: 120px;">Name</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px; font-weight: 600;">{booking["guest_name"]}</td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Email</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;"><a href="mailto:{booking["guest_email"]}" style="color: #6B7B8C;">{booking["guest_email"]}</a></td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Phone</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;"><a href="tel:{booking["guest_phone"]}" style="color: #6B7B8C;">{booking["guest_phone"]}</a></td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Dietary</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">{dietary_text}</td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Allergies</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">{allergies_text}</td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Special Req.</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">{special_text}</td></tr>
                    </table>
                </div>
            </div>
            <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;"><a href="https://golfinmallorca.com" style="color: rgba(255,255,255,0.7) !important; text-decoration: none !important;">golfinmallorca.com</a></p>
                <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 8px 0 0 0;"><a href="mailto:contact@golfinmallorca.com" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">contact@golfinmallorca.com</a> | <a href="tel:+34620987575" style="color: rgba(255,255,255,0.4) !important; text-decoration: none !important;">+34 620 987 575</a></p>
            </div>
        </div>
    </body>
    </html>
    """
    try:
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL,
            "to": ["contact@golfinmallorca.com"],
            "subject": f"Booking Request: {booking['venue_name']} - {booking['date']} ({booking['guests']} guests)",
            "html": html_content
        })
    except Exception as e:
        logger.error(f"Failed to send booking admin email: {e}")


async def send_booking_confirmation_email(booking: dict):
    """Send confirmation email to the customer."""
    logo_url = "https://golfinmallorca.com/api/uploads/logo_email_v2.jpg"
    html_content = f"""
    <html>
    <head><meta name="format-detection" content="telephone=no"><meta name="x-apple-disable-message-reformatting"></head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 0; margin: 0; background-color: #F5F2EB;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 2px solid #E5E5E5;">
                <img src="{logo_url}" alt="golfinmallorca.com" style="width: 180px; height: auto; display: block; margin: 0 auto;" />
            </div>
            <div style="background-color: #ffffff; padding: 30px 30px 10px 30px;">
                <h2 style="color: #2D2D2D; font-size: 22px; margin: 0 0 8px 0; font-weight: 500;">Booking Request Received</h2>
                <p style="color: #6B7B8C; font-size: 15px; line-height: 1.6; margin: 0;">
                    Thank you, {booking["guest_name"]}! We have received your reservation request and will get back to you shortly.
                </p>
            </div>
            <div style="background-color: #ffffff; padding: 10px 30px 30px 30px;">
                <div style="background-color: #F5F2EB; border-radius: 12px; padding: 24px; margin-top: 16px;">
                    <p style="color: #8B8680; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Your Reservation Details</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px; width: 100px;">Venue</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px; font-weight: 600;">{booking["venue_name"]}</td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Date</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">{booking["date"]}</td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Time</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">{booking["time"]}</td></tr>
                        <tr><td style="padding: 8px 0; color: #8B8680; font-size: 13px;">Guests</td><td style="padding: 8px 0; color: #2D2D2D; font-size: 14px;">{booking["guests"]}</td></tr>
                    </table>
                </div>
                <div style="background: linear-gradient(135deg, #6B7B8C 0%, #8B9BAC 100%); border-radius: 12px; padding: 24px; margin-top: 16px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; margin: 0;">
                        <strong>Please note:</strong> All bookings are subject to the restaurant's availability. We will confirm your reservation within <strong>72 hours</strong>. In many cases, we'll get back to you much sooner.
                    </p>
                </div>
                <p style="color: #8B8680; font-size: 13px; line-height: 1.6; margin-top: 20px; text-align: center;">
                    If you have any questions, don't hesitate to contact us at<br/>
                    <a href="mailto:contact@golfinmallorca.com" style="color: #6B7B8C;">contact@golfinmallorca.com</a> or
                    <a href="tel:+34620987575" style="color: #6B7B8C;">+34 620 987 575</a>
                </p>
            </div>
            <div style="background-color: #3D3D3D; padding: 24px 30px; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 4px 0;"><a href="https://golfinmallorca.com" style="color: rgba(255,255,255,0.7) !important; text-decoration: none !important;">golfinmallorca.com</a> &mdash; Your Gateway to Luxury Golf in Mallorca</p>
            </div>
        </div>
    </body>
    </html>
    """
    try:
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL,
            "to": [booking["guest_email"]],
            "subject": f"Booking Request Received - {booking['venue_name']} | golfinmallorca.com",
            "html": html_content
        })
    except Exception as e:
        logger.error(f"Failed to send booking confirmation email: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
