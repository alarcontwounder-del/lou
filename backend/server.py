from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
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
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Resend email setup
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Mount static files
app.mount("/api/static", StaticFiles(directory=str(ROOT_DIR / "static")), name="static")

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

# Real reviews data from CSV with English translations
REVIEWS_DATA = [
    {'id': 1, 'user_name': 'Mark S.', 'age': 45, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'The booking process was seamless. I managed to secure a tee time at Alcanada in minutes. Highly recommend!',
     'review_text_en': 'The booking process was seamless. I managed to secure a tee time at Alcanada in minutes. Highly recommend!'},
    {'id': 2, 'user_name': 'Elena G.', 'age': 38, 'gender': 'Female', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Sehr einfach zu bedienen. Die Preise sind unschlagbar im Vergleich zu anderen Portalen.',
     'review_text_en': 'Very easy to use. The prices are unbeatable compared to other portals.'},
    {'id': 3, 'user_name': 'Sven L.', 'age': 52, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Trustpilot', 'rating': 5, 'language': 'SV',
     'review_text': 'Bästa sättet att boka golf på Mallorca. Snabb bekräftelse och bra kundservice.',
     'review_text_en': 'The best way to book golf in Mallorca. Quick confirmation and great customer service.'},
    {'id': 4, 'user_name': 'John D.', 'age': 60, 'gender': 'Male', 'country': 'US', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Huge inventory of courses. Found a hidden gem near Palma thanks to this site.',
     'review_text_en': 'Huge inventory of courses. Found a hidden gem near Palma thanks to this site.'},
    {'id': 5, 'user_name': 'Pierre M.', 'age': 41, 'gender': 'Male', 'country': 'France', 'platform': 'TripAdvisor', 'rating': 5, 'language': 'FR',
     'review_text': 'Très efficace. J\'ai pu réserver mes départs pour toute la semaine en une seule fois.',
     'review_text_en': 'Very efficient. I was able to book my tee times for the whole week in one go.'},
    {'id': 6, 'user_name': 'Thomas W.', 'age': 49, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Great value for money. The Greenfee365 integration makes everything so much faster.',
     'review_text_en': 'Great value for money. The Greenfee365 integration makes everything so much faster.'},
    {'id': 7, 'user_name': 'Klaus M.', 'age': 65, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Alles perfekt gelaufen. Werde meinen nächsten Golfurlaub definitiv wieder hier buchen.',
     'review_text_en': 'Everything went perfectly. Will definitely book my next golf holiday here again.'},
    {'id': 8, 'user_name': 'Anders J.', 'age': 33, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Trustpilot', 'rating': 5, 'language': 'SV',
     'review_text': 'Smidigt gränssnitt och tydlig information om banorna. Fem stjärnor!',
     'review_text_en': 'Smooth interface and clear information about the courses. Five stars!'},
    {'id': 9, 'user_name': 'Robert B.', 'age': 55, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'No more back-and-forth emails with courses. Just click and play. Brilliant.',
     'review_text_en': 'No more back-and-forth emails with courses. Just click and play. Brilliant.'},
    {'id': 10, 'user_name': 'Michael R.', 'age': 42, 'gender': 'Male', 'country': 'US', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Professional platform with great support. The best prices for Mallorca golf.',
     'review_text_en': 'Professional platform with great support. The best prices for Mallorca golf.'},
    {'id': 11, 'user_name': 'David H.', 'age': 51, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Fast, reliable, and easy to use. I wouldn\'t book anywhere else.',
     'review_text_en': 'Fast, reliable, and easy to use. I wouldn\'t book anywhere else.'},
    {'id': 12, 'user_name': 'Sarah S.', 'age': 35, 'gender': 'Female', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Toller Service und sehr übersichtliche Webseite. Die Buchung war kinderleicht.',
     'review_text_en': 'Great service and very clear website. The booking was very easy.'},
    {'id': 13, 'user_name': 'Lars E.', 'age': 47, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Trustpilot', 'rating': 5, 'language': 'SV',
     'review_text': 'Mycket nöjd med hela upplevelsen. Rekommenderas varmt till alla golfare.',
     'review_text_en': 'Very satisfied with the whole experience. Highly recommended for all golfers.'},
    {'id': 14, 'user_name': 'James P.', 'age': 58, 'gender': 'Male', 'country': 'UK', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'The most convenient way to book golf abroad. Excellent selection of courses.',
     'review_text_en': 'The most convenient way to book golf abroad. Excellent selection of courses.'},
    {'id': 15, 'user_name': 'Christian B.', 'age': 44, 'gender': 'Male', 'country': 'France', 'platform': 'TripAdvisor', 'rating': 5, 'language': 'FR',
     'review_text': 'Réservation rapide et sans stress. Les tarifs sont très compétitifs.',
     'review_text_en': 'Quick and stress-free booking. The rates are very competitive.'},
    {'id': 16, 'user_name': 'Wolfgang S.', 'age': 62, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Sehr gute Plattform. Hat alles wunderbar geklappt, von der Buchung bis zum Spiel.',
     'review_text_en': 'Very good platform. Everything worked wonderfully, from booking to play.'},
    {'id': 17, 'user_name': 'Mikael N.', 'age': 39, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Trustpilot', 'rating': 5, 'language': 'SV',
     'review_text': 'Enkelt och prisvärt. Det här sparade mig massor av tid.',
     'review_text_en': 'Simple and affordable. This saved me loads of time.'},
    {'id': 18, 'user_name': 'Richard F.', 'age': 53, 'gender': 'Male', 'country': 'UK', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Impressive inventory. I found exactly what I was looking for at a great price.',
     'review_text_en': 'Impressive inventory. I found exactly what I was looking for at a great price.'},
    {'id': 19, 'user_name': 'Paul G.', 'age': 61, 'gender': 'Male', 'country': 'US', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Smooth transaction and instant confirmation. Highly professional service.',
     'review_text_en': 'Smooth transaction and instant confirmation. Highly professional service.'},
    {'id': 20, 'user_name': 'Hans K.', 'age': 68, 'gender': 'Male', 'country': 'Germany', 'platform': 'Trustpilot', 'rating': 5, 'language': 'DE',
     'review_text': 'Alles bestens organisiert. Ein Muss für jeden Mallorca-Golfer.',
     'review_text_en': 'Everything perfectly organized. A must for every Mallorca golfer.'},
    {'id': 21, 'user_name': 'Erik B.', 'age': 40, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Google Reviews', 'rating': 5, 'language': 'SV',
     'review_text': 'Snabb och enkel bokning. Bra priser på de bästa banorna.',
     'review_text_en': 'Fast and easy booking. Great prices on the best courses.'},
    {'id': 22, 'user_name': 'William J.', 'age': 46, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Top tier service. Everything was handled perfectly.',
     'review_text_en': 'Top tier service. Everything was handled perfectly.'},
    {'id': 23, 'user_name': 'Matthias L.', 'age': 50, 'gender': 'Male', 'country': 'Switzerland', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Hervorragende Auswahl an Plätzen. Die Buchung verlief reibungslos.',
     'review_text_en': 'Excellent selection of courses. The booking went smoothly.'},
    {'id': 24, 'user_name': 'Oliver D.', 'age': 37, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Fantastic experience. The easiest way to book golf on the island.',
     'review_text_en': 'Fantastic experience. The easiest way to book golf on the island.'},
    {'id': 25, 'user_name': 'Claus R.', 'age': 57, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Sehr empfehlenswert. Kompetent, schnell und preiswert.',
     'review_text_en': 'Highly recommended. Competent, fast and affordable.'},
    {'id': 26, 'user_name': 'Johan M.', 'age': 54, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Trustpilot', 'rating': 5, 'language': 'SV',
     'review_text': 'Bra plattform med ett fantastiskt utbud av banor.',
     'review_text_en': 'Great platform with a fantastic selection of courses.'},
    {'id': 27, 'user_name': 'George T.', 'age': 63, 'gender': 'Male', 'country': 'US', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Great prices and even better service. I\'ll be back next year.',
     'review_text_en': 'Great prices and even better service. I\'ll be back next year.'},
    {'id': 28, 'user_name': 'Bernd H.', 'age': 59, 'gender': 'Male', 'country': 'Germany', 'platform': 'Trustpilot', 'rating': 5, 'language': 'DE',
     'review_text': 'Einfach klasse. So macht die Urlaubsplanung Spaß.',
     'review_text_en': 'Simply great. This is how holiday planning should be fun.'},
    {'id': 29, 'user_name': 'Stefan P.', 'age': 48, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Google Reviews', 'rating': 5, 'language': 'SV',
     'review_text': 'Mycket användarvänligt. Hittade bra tider direkt.',
     'review_text_en': 'Very user-friendly. Found great times right away.'},
    {'id': 30, 'user_name': 'Christopher B.', 'age': 43, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Seamless integration with the courses. No issues at all.',
     'review_text_en': 'Seamless integration with the courses. No issues at all.'},
    {'id': 31, 'user_name': 'Karl-Heinz F.', 'age': 70, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Auch in meinem Alter sehr gut zu bedienen. Klare Empfehlung.',
     'review_text_en': 'Very easy to use even at my age. Clear recommendation.'},
    {'id': 32, 'user_name': 'Börje L.', 'age': 66, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Trustpilot', 'rating': 5, 'language': 'SV',
     'review_text': 'Pålitligt och snabbt. Har aldrig haft några problem.',
     'review_text_en': 'Reliable and fast. Never had any problems.'},
    {'id': 33, 'user_name': 'Simon R.', 'age': 34, 'gender': 'Male', 'country': 'UK', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'The interface is modern and very fast. Great job.',
     'review_text_en': 'The interface is modern and very fast. Great job.'},
    {'id': 34, 'user_name': 'Andreas U.', 'age': 52, 'gender': 'Male', 'country': 'Germany', 'platform': 'Trustpilot', 'rating': 5, 'language': 'DE',
     'review_text': 'Super Preise und eine riesige Auswahl an Top-Plätzen.',
     'review_text_en': 'Great prices and a huge selection of top courses.'},
    {'id': 35, 'user_name': 'Henrik S.', 'age': 41, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Google Reviews', 'rating': 5, 'language': 'SV',
     'review_text': 'Det här är framtiden för golfbokningar. Snyggt jobbat!',
     'review_text_en': 'This is the future of golf bookings. Nice work!'},
    {'id': 36, 'user_name': 'Oliver K.', 'age': 42, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Unglaublich einfache Bedienung. Die Bestätigung für Son Antem kam innerhalb von Sekunden.',
     'review_text_en': 'Incredibly easy to use. The confirmation for Son Antem came within seconds.'},
    {'id': 37, 'user_name': 'Emma L.', 'age': 31, 'gender': 'Female', 'country': 'Sweden', 'platform': 'Trustpilot', 'rating': 5, 'language': 'SV',
     'review_text': 'Smidigaste sättet att boka golf i Palma. Appen är snabb och priserna är mycket bättre än att boka direkt.',
     'review_text_en': 'The smoothest way to book golf in Palma. The app is fast and the prices are much better than booking directly.'},
    {'id': 38, 'user_name': 'Thomas R.', 'age': 55, 'gender': 'Male', 'country': 'Switzerland', 'platform': 'TripAdvisor', 'rating': 5, 'language': 'DE',
     'review_text': 'Hervorragender Service. Die Auswahl an Plätzen ist beeindruckend. Alles verlief völlig reibungslos.',
     'review_text_en': 'Outstanding service. The selection of courses is impressive. Everything went completely smoothly.'},
    {'id': 39, 'user_name': 'James B.', 'age': 48, 'gender': 'Male', 'country': 'UK', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Absolute game changer for my annual golf trip. Booked 5 rounds in 5 minutes. The inventory is massive.',
     'review_text_en': 'Absolute game changer for my annual golf trip. Booked 5 rounds in 5 minutes. The inventory is massive.'},
    {'id': 40, 'user_name': 'Michael W.', 'age': 60, 'gender': 'Male', 'country': 'US', 'platform': 'Capterra', 'rating': 5, 'language': 'EN',
     'review_text': 'Cleanest UI I\'ve seen in the industry. It makes international bookings feel like local ones. Highly recommend.',
     'review_text_en': 'Cleanest UI I\'ve seen in the industry. It makes international bookings feel like local ones. Highly recommend.'},
    {'id': 41, 'user_name': 'Marc D.', 'age': 39, 'gender': 'Male', 'country': 'France', 'platform': 'Google Reviews', 'rating': 5, 'language': 'FR',
     'review_text': 'Très simple d\'utilisation. J\'ai trouvé des tarifs excellents pour Santa Ponsa. Je l\'utiliserai à nouveau.',
     'review_text_en': 'Very easy to use. I found excellent rates for Santa Ponsa. I will use it again.'},
    {'id': 42, 'user_name': 'Sjöberg N.', 'age': 36, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Google Reviews', 'rating': 5, 'language': 'SV',
     'review_text': 'Enkel bokning och prisgarantin är fantastisk. Verkligen imponerande.',
     'review_text_en': 'Easy booking and the price guarantee is fantastic. Really impressive.'},
    {'id': 43, 'user_name': 'Daniel P.', 'age': 29, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'I love how it shows real-time availability. Customer service was also very helpful.',
     'review_text_en': 'I love how it shows real-time availability. Customer service was also very helpful.'},
    {'id': 44, 'user_name': 'Heinz M.', 'age': 65, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Strukturiert, fair und transparent. Keine versteckten Kosten.',
     'review_text_en': 'Structured, fair and transparent. No hidden costs.'},
    {'id': 45, 'user_name': 'Alex T.', 'age': 35, 'gender': 'Male', 'country': 'US', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'The booking process is so frictionless. Makes planning a golf trip feel effortless.',
     'review_text_en': 'The booking process is so frictionless. Makes planning a golf trip feel effortless.'},
    {'id': 46, 'user_name': 'Volker S.', 'age': 58, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Die Auswahl von Alcanada bis Pula ist erstklassig. Absolut empfehlenswert.',
     'review_text_en': 'The selection from Alcanada to Pula is first-class. Absolutely recommended.'},
    {'id': 47, 'user_name': 'Philippe G.', 'age': 50, 'gender': 'Male', 'country': 'France', 'platform': 'TripAdvisor', 'rating': 5, 'language': 'FR',
     'review_text': 'Une réservation fluide et agréable. Le site est très bien conçu.',
     'review_text_en': 'A smooth and pleasant booking. The site is very well designed.'},
    {'id': 48, 'user_name': 'Stuart C.', 'age': 44, 'gender': 'Male', 'country': 'UK', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Top notch. No hidden fees, just straightforward golf booking at its best.',
     'review_text_en': 'Top notch. No hidden fees, just straightforward golf booking at its best.'},
    {'id': 49, 'user_name': 'Nils B.', 'age': 40, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Product Hunt', 'rating': 5, 'language': 'SV',
     'review_text': 'Riktigt bra verktyg. Användarvänligt och snabbt. Perfekt för mobilbokning.',
     'review_text_en': 'Really great tool. User-friendly and fast. Perfect for mobile booking.'},
    {'id': 50, 'user_name': 'Brian F.', 'age': 56, 'gender': 'Male', 'country': 'UK', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Better than booking online through any other site I\'ve tried. Great inventory.',
     'review_text_en': 'Better than booking online through any other site I\'ve tried. Great inventory.'},
    {'id': 51, 'user_name': 'Helmut W.', 'age': 61, 'gender': 'Male', 'country': 'Germany', 'platform': 'Trustpilot', 'rating': 5, 'language': 'DE',
     'review_text': 'Schnell, günstig und zuverlässig. Genau das, was man braucht.',
     'review_text_en': 'Fast, affordable and reliable. Exactly what you need.'},
    {'id': 52, 'user_name': 'Anders O.', 'age': 45, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Google Reviews', 'rating': 5, 'language': 'SV',
     'review_text': 'Allt fungerade perfekt från start till mål. Banorna är välsorterade.',
     'review_text_en': 'Everything worked perfectly from start to finish. The courses are well-organized.'},
    {'id': 53, 'user_name': 'Charles W.', 'age': 47, 'gender': 'Male', 'country': 'US', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'I\'ve booked twice now and plan to use it for every trip. Amazing selection and great prices.',
     'review_text_en': 'I\'ve booked twice now and plan to use it for every trip. Amazing selection and great prices.'},
    {'id': 54, 'user_name': 'Bernhard Z.', 'age': 49, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Golf in wenigen Klicks erledigt. Einfach und unkompliziert.',
     'review_text_en': 'Golf booked in just a few clicks. Simple and straightforward.'},
    {'id': 55, 'user_name': 'Sophie V.', 'age': 33, 'gender': 'Female', 'country': 'France', 'platform': 'TripAdvisor', 'rating': 5, 'language': 'FR',
     'review_text': 'Le site web est clair et facile à naviguer. Réservation régulière sans aucun problème.',
     'review_text_en': 'The website is clear and easy to navigate. Regular booking without any issues.'},
    {'id': 56, 'user_name': 'Patrick H.', 'age': 38, 'gender': 'Male', 'country': 'UK', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'The UX and map feature make it so easy to find courses near your hotel. Great design.',
     'review_text_en': 'The UX and map feature make it so easy to find courses near your hotel. Great design.'},
    {'id': 57, 'user_name': 'Jürgen W.', 'age': 64, 'gender': 'Male', 'country': 'Germany', 'platform': 'Trustpilot', 'rating': 5, 'language': 'DE',
     'review_text': 'Der Buchungsprozess ist bestens erklärt. Auch für Anfänger kein Problem.',
     'review_text_en': 'The booking process is perfectly explained. No problem even for beginners.'},
    {'id': 58, 'user_name': 'Andrew M.', 'age': 52, 'gender': 'Male', 'country': 'US', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Full transparency on pricing. No surprises. The sheer number of courses listed is amazing.',
     'review_text_en': 'Full transparency on pricing. No surprises. The sheer number of courses listed is amazing.'},
    {'id': 59, 'user_name': 'Martin P.', 'age': 36, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Multi-course booking made simple. Saved hours planning our group trip.',
     'review_text_en': 'Multi-course booking made simple. Saved hours planning our group trip.'},
    {'id': 60, 'user_name': 'Peter S.', 'age': 54, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Ausgezeichnete Plattform. Die Live-Verfügbarkeit ist sehr hilfreich.',
     'review_text_en': 'Excellent platform. The live availability is very helpful.'},
    {'id': 61, 'user_name': 'Roger T.', 'age': 47, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Reliable and trustworthy. Used it three times now, always perfect.',
     'review_text_en': 'Reliable and trustworthy. Used it three times now, always perfect.'},
    {'id': 62, 'user_name': 'Kevin L.', 'age': 32, 'gender': 'Male', 'country': 'UK', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Booked a tee time and also a dinner reservation easily. Great all-round service.',
     'review_text_en': 'Booked a tee time and also a dinner reservation easily. Great all-round service.'},
    {'id': 63, 'user_name': 'Manfred K.', 'age': 57, 'gender': 'Male', 'country': 'Germany', 'platform': 'Trustpilot', 'rating': 5, 'language': 'DE',
     'review_text': 'Effizientes System. Kein unnötiger Aufwand. Kurs wählen, Zeit auswählen, buchen.',
     'review_text_en': 'Efficient system. No unnecessary effort. Choose course, select time, book.'},
    {'id': 64, 'user_name': 'Ola R.', 'age': 43, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Google Reviews', 'rating': 5, 'language': 'SV',
     'review_text': 'Transparent prissättning. Inga dolda avgifter. Rekommenderar varmt.',
     'review_text_en': 'Transparent pricing. No hidden fees. Highly recommend.'},
    {'id': 65, 'user_name': 'Paul F.', 'age': 50, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Found some great deals for my week in Mallorca. Butik yet professional.',
     'review_text_en': 'Found some great deals for my week in Mallorca. Boutique yet professional.'},
    {'id': 66, 'user_name': 'Arthur L.', 'age': 62, 'gender': 'Male', 'country': 'France', 'platform': 'Google Reviews', 'rating': 5, 'language': 'FR',
     'review_text': 'On gagne un temps précieux avec ce service. Le choix de parcours est remarquable.',
     'review_text_en': 'You save precious time with this service. The choice of courses is remarkable.'},
    {'id': 67, 'user_name': 'Ursula B.', 'age': 56, 'gender': 'Female', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Sehr benutzerfreundlich. Ich habe für die ganze Gruppe gebucht. Fehlerfreies System.',
     'review_text_en': 'Very user-friendly. I booked for the whole group. Flawless system.'},
    {'id': 68, 'user_name': 'Gary N.', 'age': 46, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Massive selection worldwide. Booking was a breeze.',
     'review_text_en': 'Massive selection worldwide. Booking was a breeze.'},
    {'id': 69, 'user_name': 'Hans-Peter M.', 'age': 60, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Unkompliziert und schnell. Genau so muss eine Buchung ablaufen.',
     'review_text_en': 'Uncomplicated and fast. That\'s exactly how a booking should work.'},
    {'id': 70, 'user_name': 'Niklas J.', 'age': 38, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Trustpilot', 'rating': 5, 'language': 'SV',
     'review_text': 'Enkelt att jämföra mellan olika banor. Välsorterat och smidigt.',
     'review_text_en': 'Easy to compare between different courses. Well-organized and smooth.'},
    {'id': 71, 'user_name': 'David K.', 'age': 44, 'gender': 'Male', 'country': 'US', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'Consistently lower prices than booking direct. This is my go-to for golf trips.',
     'review_text_en': 'Consistently lower prices than booking direct. This is my go-to for golf trips.'},
    {'id': 72, 'user_name': 'Nicolas F.', 'age': 63, 'gender': 'Male', 'country': 'France', 'platform': 'TripAdvisor', 'rating': 5, 'language': 'FR',
     'review_text': 'Un excellent outil pour découvrir les parcours. Rapide et intuitif.',
     'review_text_en': 'An excellent tool to discover courses. Fast and intuitive.'},
    {'id': 73, 'user_name': 'Ruedi S.', 'age': 67, 'gender': 'Male', 'country': 'Switzerland', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Alles hat wunderbar funktioniert. Erstklassiger Service ohne Komplikationen.',
     'review_text_en': 'Everything worked wonderfully. First-class service without complications.'},
    {'id': 74, 'user_name': 'Steve E.', 'age': 41, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Impressed by the ease of use. Got a tee time at a top-rated course in minutes.',
     'review_text_en': 'Impressed by the ease of use. Got a tee time at a top-rated course in minutes.'},
    {'id': 75, 'user_name': 'Per A.', 'age': 55, 'gender': 'Male', 'country': 'Sweden', 'platform': 'Google Reviews', 'rating': 5, 'language': 'SV',
     'review_text': 'Allt klaffade perfekt. Stort utbud och bra priser alltid.',
     'review_text_en': 'Everything clicked perfectly. Large selection and always great prices.'},
    {'id': 76, 'user_name': 'Friedrich H.', 'age': 71, 'gender': 'Male', 'country': 'Germany', 'platform': 'Trustpilot', 'rating': 5, 'language': 'DE',
     'review_text': 'Übersichtlich, einfach zu bedienen und hervorragende Preise. Was will man mehr?',
     'review_text_en': 'Clear, easy to use and excellent prices. What more could you want?'},
    {'id': 77, 'user_name': 'Ian B.', 'age': 39, 'gender': 'Male', 'country': 'UK', 'platform': 'Google Reviews', 'rating': 5, 'language': 'EN',
     'review_text': 'One of the best golf booking platforms I have ever used. Truly exceptional.',
     'review_text_en': 'One of the best golf booking platforms I have ever used. Truly exceptional.'},
    {'id': 78, 'user_name': 'Julien C.', 'age': 37, 'gender': 'Male', 'country': 'France', 'platform': 'TripAdvisor', 'rating': 5, 'language': 'FR',
     'review_text': 'Interface moderne et prix imbattibles. Je ne réserve plus autrement.',
     'review_text_en': 'Modern interface and unbeatable prices. I no longer book any other way.'},
    {'id': 79, 'user_name': 'Werner G.', 'age': 53, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Habe schon oft hier gebucht. Immer zufrieden mit dem Angebot und dem Service.',
     'review_text_en': 'Have booked here many times. Always satisfied with the offer and service.'},
    {'id': 80, 'user_name': 'Vincent R.', 'age': 45, 'gender': 'Male', 'country': 'France', 'platform': 'Trustpilot', 'rating': 5, 'language': 'FR',
     'review_text': 'Un vrai plaisir de réserver ici. Tout est clair et les prix sont réels.',
     'review_text_en': 'A real pleasure to book here. Everything is clear and the prices are genuine.'},
    {'id': 81, 'user_name': 'Anna K.', 'age': 30, 'gender': 'Female', 'country': 'Sweden', 'platform': 'Google Reviews', 'rating': 5, 'language': 'SV',
     'review_text': 'Fantastiska låga priser för den som ska spela golf på Mallorca. Toppen!',
     'review_text_en': 'Fantastic low prices for anyone playing golf in Mallorca. Excellent!'},
    {'id': 82, 'user_name': 'Dieter S.', 'age': 69, 'gender': 'Male', 'country': 'Germany', 'platform': 'Google Reviews', 'rating': 5, 'language': 'DE',
     'review_text': 'Überzeugende Plattform. Einfach in der Handhabung und sehr zuverlässig.',
     'review_text_en': 'Convincing platform. Easy to handle and very reliable.'},
    {'id': 83, 'user_name': 'Harry W.', 'age': 50, 'gender': 'Male', 'country': 'UK', 'platform': 'Trustpilot', 'rating': 5, 'language': 'EN',
     'review_text': 'Saved a lot of money on green fees. Will definitely recommend to my golf buddies.',
     'review_text_en': 'Saved a lot of money on green fees. Will definitely recommend to my golf buddies.'},
    {'id': 84, 'user_name': 'Luc M.', 'age': 48, 'gender': 'Male', 'country': 'France', 'platform': 'Google Reviews', 'rating': 5, 'language': 'FR',
     'review_text': 'Idéal pour organiser son voyage de golf. Les prix sont très attractifs.',
     'review_text_en': 'Ideal for organizing your golf trip. The prices are very attractive.'},
    {'id': 85, 'user_name': 'Werner B.', 'age': 62, 'gender': 'Male', 'country': 'Germany', 'platform': 'Trustpilot', 'rating': 5, 'language': 'DE',
     'review_text': 'Die Abwicklung ist top. Buchungsprozess ist sehr gut strukturiert und schnell.',
     'review_text_en': 'The handling is top. Booking process is very well structured and fast.'},
]

# Static data for golf courses
GOLF_COURSES = [
    {
        "id": "golf-alcanada",
        "name": "Golf Alcanada",
        "description": {
            "en": "Nestled along the coast with breathtaking views of the iconic lighthouse, Alcanada is a true gem of Mediterranean golf.",
            "de": "An der Küste gelegen mit atemberaubendem Blick auf den ikonischen Leuchtturm, ist Alcanada ein wahres Juwel des mediterranen Golfs.",
            "fr": "Niché le long de la côte avec des vues imprenables sur le phare emblématique, Alcanada est un véritable joyau du golf méditerranéen.",
            "se": "Belägen längs kusten med hisnande utsikt över den ikoniska fyren, Alcanada är en sann pärla inom Medelhavsgolf."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/golf-alcanada/golf-alcanada",
        "holes": 18,
        "par": 72,
        "price_from": 115,
        "location": "Alcúdia",
        "features": ["Ocean Views", "Lighthouse Views", "Golf Academy", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-alcanada"
    },
    {
        "id": "golf-son-gual",
        "name": "Golf Son Gual Mallorca",
        "description": {
            "en": "One of Europe's finest courses, Son Gual offers a world-class championship experience with stunning Mediterranean views.",
            "de": "Einer der besten Plätze Europas bietet Son Gual ein erstklassiges Championship-Erlebnis mit atemberaubendem Mittelmeerblick.",
            "fr": "L'un des meilleurs parcours d'Europe, Son Gual offre une expérience de championnat de classe mondiale.",
            "se": "En av Europas finaste banor, Son Gual erbjuder en världsklassig mästerskapsupplevelse."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/golf-son-gual-mallorca/golf-son-gual-mallorca",
        "holes": 18,
        "par": 72,
        "price_from": 85,
        "location": "Palma de Mallorca",
        "features": ["Championship Course", "Practice Range", "Pro Shop", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-son-gual-mallorca"
    },
    {
        "id": "pula-golf-resort",
        "name": "Pula Golf Resort",
        "description": {
            "en": "A beautiful resort course surrounded by natural beauty, offering a relaxed yet challenging golfing experience.",
            "de": "Ein wunderschöner Resort-Platz umgeben von natürlicher Schönheit, bietet ein entspanntes aber anspruchsvolles Golferlebnis.",
            "fr": "Un magnifique parcours de resort entouré de beauté naturelle, offrant une expérience de golf détendue mais stimulante.",
            "se": "En vacker resortbana omgiven av naturlig skönhet, erbjuder en avslappnad men utmanande golfupplevelse."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/pula-golf-resort/pula-golf-resort",
        "holes": 18,
        "par": 72,
        "price_from": 74,
        "location": "Son Servera",
        "features": ["Resort Course", "Practice Facilities", "Clubhouse", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/pula-golf-resort"
    },
    {
        "id": "son-vida-golf",
        "name": "Son Vida Golf",
        "description": {
            "en": "The oldest course in Mallorca, Son Vida offers a classic golfing experience with panoramic views of Palma Bay.",
            "de": "Der älteste Platz auf Mallorca, Son Vida bietet ein klassisches Golferlebnis mit Panoramablick auf die Bucht von Palma.",
            "fr": "Le plus ancien parcours de Majorque, Son Vida offre une expérience de golf classique avec vue panoramique sur la baie de Palma.",
            "se": "Den äldsta banan på Mallorca, Son Vida erbjuder en klassisk golfupplevelse med panoramautsikt över Palmabukten."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/son-vida-golf/son-vida-golf",
        "holes": 18,
        "par": 72,
        "price_from": 47,
        "location": "Palma de Mallorca",
        "features": ["Historic Course", "Bay Views", "Luxury Hotel", "Fine Dining"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/son-vida-golf"
    },
    {
        "id": "son-muntaner-golf",
        "name": "Son Muntaner Golf",
        "description": {
            "en": "A challenging course designed by Kurt Rossknecht, featuring dramatic elevation changes and mountain views.",
            "de": "Ein anspruchsvoller Platz von Kurt Rossknecht mit dramatischen Höhenunterschieden und Bergblicken.",
            "fr": "Un parcours challenging conçu par Kurt Rossknecht, avec des changements d'élévation dramatiques.",
            "se": "En utmanande bana designad av Kurt Rossknecht, med dramatiska höjdskillnader och bergsutsikt."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/son-muntaner-golf/son-muntaner-golf",
        "holes": 18,
        "par": 72,
        "price_from": 51,
        "location": "Palma de Mallorca",
        "features": ["Mountain Views", "Technical Design", "Wellness Center", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/son-muntaner-golf"
    },
    {
        "id": "son-quint-golf",
        "name": "Son Quint Golf",
        "description": {
            "en": "A modern course with excellent facilities, Son Quint offers spectacular views and a memorable round.",
            "de": "Ein moderner Platz mit hervorragenden Einrichtungen, Son Quint bietet spektakuläre Aussichten und eine unvergessliche Runde.",
            "fr": "Un parcours moderne avec d'excellentes installations, Son Quint offre des vues spectaculaires.",
            "se": "En modern bana med utmärkta faciliteter, Son Quint erbjuder spektakulära utsikter och en minnesvärd runda."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/son-quint-golf/son-quint-golf",
        "holes": 18,
        "par": 72,
        "price_from": 58,
        "location": "Palma de Mallorca",
        "features": ["Modern Design", "Practice Range", "Pro Shop", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/son-quint-golf"
    },
    {
        "id": "son-antem-east",
        "name": "Son Antem Resort East Course",
        "description": {
            "en": "Part of the renowned Son Antem complex, this course offers a perfect blend of challenge and playability.",
            "de": "Teil des renommierten Son Antem Komplexes, bietet dieser Platz eine perfekte Mischung aus Herausforderung und Spielbarkeit.",
            "fr": "Faisant partie du célèbre complexe Son Antem, ce parcours offre un mélange parfait de défi et de jouabilité.",
            "se": "En del av det berömda Son Antem-komplexet, denna bana erbjuder en perfekt blandning av utmaning och spelbarhet."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/son-antem-resort-course/son-antem-resort-course",
        "holes": 18,
        "par": 72,
        "price_from": 54,
        "location": "Llucmajor",
        "features": ["Resort Course", "Marriott Hotel", "Spa", "Multiple Restaurants"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/son-antem-resort-course"
    },
    {
        "id": "son-antem-west",
        "name": "Son Antem West Championship Course",
        "description": {
            "en": "The championship course at Son Antem, designed for serious golfers seeking a premium challenge.",
            "de": "Der Championship-Platz in Son Antem, für anspruchsvolle Golfer konzipiert, die eine Premium-Herausforderung suchen.",
            "fr": "Le parcours championship de Son Antem, conçu pour les golfeurs exigeants recherchant un défi premium.",
            "se": "Mästerskapsbanan på Son Antem, designad för seriösa golfare som söker en premium utmaning."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/son-antem-championship-course/son-antem-championship-course",
        "holes": 18,
        "par": 72,
        "price_from": 59,
        "location": "Llucmajor",
        "features": ["Championship Course", "Tournament Ready", "Practice Facilities", "Clubhouse"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/son-antem-championship-course"
    },
    {
        "id": "capdepera-golf",
        "name": "Capdepera Golf",
        "description": {
            "en": "Located in the beautiful northeast of Mallorca, Capdepera offers stunning coastal views and excellent conditions.",
            "de": "Im wunderschönen Nordosten Mallorcas gelegen, bietet Capdepera atemberaubende Küstenaussichten und hervorragende Bedingungen.",
            "fr": "Situé dans le magnifique nord-est de Majorque, Capdepera offre des vues côtières époustouflantes.",
            "se": "Belägen i den vackra nordöstra delen av Mallorca, Capdepera erbjuder fantastisk kustutsikt och utmärkta förhållanden."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/capdepera-golf/capdepera-golf",
        "holes": 18,
        "par": 72,
        "price_from": 59,
        "location": "Capdepera",
        "features": ["Coastal Views", "Well Maintained", "Driving Range", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/capdepera-golf"
    },
    {
        "id": "golf-santa-ponsa",
        "name": "Golf Santa Ponsa I",
        "description": {
            "en": "Three exceptional courses set amidst pine forests, Santa Ponsa has hosted major European Tour events.",
            "de": "Drei außergewöhnliche Plätze inmitten von Pinienwäldern, Santa Ponsa war Gastgeber bedeutender European Tour Events.",
            "fr": "Trois parcours exceptionnels au milieu des forêts de pins, Santa Ponsa a accueilli des événements majeurs du Tour Européen.",
            "se": "Tre exceptionella banor mitt i tallskogar, Santa Ponsa har varit värd för stora European Tour-evenemang."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/golf-santa-ponsa/golf-santa-ponsa",
        "holes": 18,
        "par": 72,
        "price_from": 66,
        "location": "Santa Ponsa",
        "features": ["3 Courses", "European Tour Venue", "Driving Range", "Golf School"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-santa-ponsa"
    },
    {
        "id": "golf-son-servera",
        "name": "Golf Son Servera",
        "description": {
            "en": "A traditional Mallorcan course with beautiful views and a welcoming atmosphere for all skill levels.",
            "de": "Ein traditioneller mallorquinischer Platz mit wunderschönen Aussichten und einer einladenden Atmosphäre für alle Spielstärken.",
            "fr": "Un parcours majorquin traditionnel avec de belles vues et une atmosphère accueillante pour tous les niveaux.",
            "se": "En traditionell mallorkinsk bana med vacker utsikt och en välkomnande atmosfär för alla nivåer."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/golf-son-servera/golf-son-servera",
        "holes": 18,
        "par": 72,
        "price_from": 73,
        "location": "Son Servera",
        "features": ["Traditional Course", "Scenic Views", "Clubhouse", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-son-servera"
    },
    {
        "id": "vall-dor-golf",
        "name": "Vall D'Or Golf",
        "description": {
            "en": "A picturesque course in the east of Mallorca, Vall d'Or offers a unique golfing experience amid natural beauty.",
            "de": "Ein malerischer Platz im Osten Mallorcas, Vall d'Or bietet ein einzigartiges Golferlebnis inmitten natürlicher Schönheit.",
            "fr": "Un parcours pittoresque à l'est de Majorque, Vall d'Or offre une expérience de golf unique au milieu de la nature.",
            "se": "En pittoresk bana i östra Mallorca, Vall d'Or erbjuder en unik golfupplevelse mitt i naturlig skönhet."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/vall-dor-golf/vall-dor-golf",
        "holes": 18,
        "par": 71,
        "price_from": 81,
        "location": "Porto Colom",
        "features": ["Scenic Course", "Natural Setting", "Practice Area", "Clubhouse"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/vall-dor-golf"
    },
    {
        "id": "real-golf-bendinat",
        "name": "Real Golf De Bendinat",
        "description": {
            "en": "An exclusive club near Palma, Bendinat offers a challenging layout with Mediterranean Sea views.",
            "de": "Ein exklusiver Club in der Nähe von Palma, Bendinat bietet ein anspruchsvolles Layout mit Blick auf das Mittelmeer.",
            "fr": "Un club exclusif près de Palma, Bendinat offre un parcours challengeant avec vue sur la Méditerranée.",
            "se": "En exklusiv klubb nära Palma, Bendinat erbjuder en utmanande layout med utsikt över Medelhavet."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/real-golf-de-bendinat/real-golf-de-bendinat",
        "holes": 18,
        "par": 70,
        "price_from": 65,
        "location": "Bendinat",
        "features": ["Exclusive Club", "Sea Views", "Historic Course", "Fine Dining"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/real-golf-de-bendinat"
    },
    {
        "id": "golf-ibiza",
        "name": "Golf Ibiza by azuLinehotels",
        "description": {
            "en": "A unique VIP experience on Ibiza's only golf club, featuring 18 challenging holes across coastal valleys and mountains, open 365 days a year.",
            "de": "Ein einzigartiges VIP-Erlebnis auf Ibizas einzigem Golfclub, mit 18 anspruchsvollen Löchern durch Küstentäler und Berge, 365 Tage im Jahr geöffnet.",
            "fr": "Une expérience VIP unique sur le seul club de golf d'Ibiza, avec 18 trous stimulants à travers vallées côtières et montagnes, ouvert 365 jours par an.",
            "se": "En unik VIP-upplevelse på Ibizas enda golfklubb, med 18 utmanande hål genom kustvallarna och bergen, öppet 365 dagar om året."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/golf-ibiza-by-azuinehotels/golf-ibiza-by-azuinehotels",
        "holes": 18,
        "par": 72,
        "price_from": 140,
        "location": "Santa Eulària, Ibiza",
        "phone": "+34 971 196 052",
        "features": ["Island's Only Course", "VIP Experience", "Driving Range", "Pro Shop", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-ibiza-by-azuinehotels"
    },
    {
        "id": "roca-llisa-ibiza",
        "name": "Roca Llisa by azuLinehotels",
        "description": {
            "en": "A relaxed 9-hole course ideal for beginners or quick rounds, featuring a flat open layout with bunkers, trees, and lakes at Golf Ibiza.",
            "de": "Ein entspannter 9-Loch-Platz ideal für Anfänger oder schnelle Runden, mit flachem offenem Layout mit Bunkern, Bäumen und Seen bei Golf Ibiza.",
            "fr": "Un parcours 9 trous détendu idéal pour les débutants ou les parties rapides, avec un layout plat ouvert avec bunkers, arbres et lacs à Golf Ibiza.",
            "se": "En avslappnad 9-hålsbana idealisk för nybörjare eller snabba rundor, med flat öppen layout med bunkrar, träd och sjöar på Golf Ibiza."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/roca-llisa-by-azulinehotels/roca-llisa-by-azulinehotels",
        "holes": 9,
        "par": 35,
        "price_from": 95,
        "location": "Santa Eulària, Ibiza",
        "phone": "+34 971 196 052",
        "features": ["9-Hole Course", "Beginner Friendly", "Quick Round", "Driving Range", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/roca-llisa-by-azulinehotels"
    },
    {
        "id": "golf-son-parc-menorca",
        "name": "Golf Son Parc Menorca",
        "description": {
            "en": "Menorca's only 18-hole course, beautifully set within a protected natural landscape with wide fairways and strategic bunkering.",
            "de": "Menorcas einziger 18-Loch-Platz, wunderschön in einer geschützten Naturlandschaft mit breiten Fairways und strategischen Bunkern gelegen.",
            "fr": "Le seul parcours 18 trous de Minorque, magnifiquement situé dans un paysage naturel protégé avec de larges fairways et des bunkers stratégiques.",
            "se": "Menorcas enda 18-hålsbana, vackert belägen i ett skyddat naturlandskap med breda fairways och strategiska bunkrar."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/golf-son-parc-menorca/golf-son-parc-menorca",
        "holes": 18,
        "par": 71,
        "price_from": 65,
        "location": "Son Parc, Menorca",
        "phone": "+34 971 188 875",
        "features": ["Island's Only Course", "Natural Setting", "Driving Range", "Bar Restaurant", "Pro Shop"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-son-parc-menorca"
    }
]

# Static data for partner offers
PARTNER_OFFERS = [
    {
        "id": "st-regis",
        "name": "St. Regis Mardavall",
        "type": "hotel",
        "description": {
            "en": "Luxury beachfront resort with world-class amenities and exclusive golf packages.",
            "de": "Luxus-Strandresort mit erstklassigen Annehmlichkeiten und exklusiven Golf-Paketen.",
            "fr": "Resort de luxe en bord de mer avec équipements de classe mondiale et forfaits golf exclusifs.",
            "se": "Lyxigt strandresort med världsklassiga bekvämligheter och exklusiva golfpaket."
        },
        "image": "/api/static/images/st-regis.jpg",
        "location": "Costa d'en Blanes",
        "deal": {
            "en": "Golf & Stay Package: 3 nights + 2 rounds",
            "de": "Golf & Stay Paket: 3 Nächte + 2 Runden",
            "fr": "Forfait Golf & Séjour: 3 nuits + 2 parcours",
            "se": "Golf & Vistelse Paket: 3 nätter + 2 rundor"
        },
        "original_price": 1200,
        "offer_price": 899,
        "discount_percent": 25,
        "contact_url": "https://www.stregismardavall.com"
    },
    {
        "id": "belmond",
        "name": "Belmond La Residencia",
        "type": "hotel",
        "description": {
            "en": "Nestled in the mountains of Deià, this iconic hotel offers unparalleled luxury and tranquility.",
            "de": "In den Bergen von Deià gelegen, bietet dieses ikonische Hotel unvergleichlichen Luxus und Ruhe.",
            "fr": "Niché dans les montagnes de Deià, cet hôtel emblématique offre un luxe et une tranquillité incomparables.",
            "se": "Beläget i Deià-bergen erbjuder detta ikoniska hotell oöverträffad lyx och lugn."
        },
        "image": "https://img.belmond.com/image/upload/w_800,h_600,c_fill/photos/lrs/lrs-ext01.jpg",
        "location": "Deià",
        "deal": {
            "en": "Exclusive: Golf Shuttle + Spa Access",
            "de": "Exklusiv: Golf-Shuttle + Spa-Zugang",
            "fr": "Exclusif: Navette Golf + Accès Spa",
            "se": "Exklusivt: Golfshuttle + Spa-tillgång"
        },
        "original_price": 1500,
        "offer_price": 1199,
        "discount_percent": 20,
        "contact_url": "https://www.belmond.com"
    },
    {
        "id": "cap-rocat",
        "name": "Cap Rocat",
        "type": "hotel",
        "description": {
            "en": "A former military fortress transformed into an exclusive hideaway with private beach.",
            "de": "Eine ehemalige Militärfestung, verwandelt in ein exklusives Refugium mit privatem Strand.",
            "fr": "Une ancienne forteresse militaire transformée en refuge exclusif avec plage privée.",
            "se": "En före detta militärfästning omvandlad till en exklusiv tillflyktsort med privat strand."
        },
        "image": "https://www.hilton.com/im/en/PMICRLX/20953216/pmicrlx-67254726-sentinels-view-3000x2000.jpg?impolicy=crop&cw=3000&ch=2000&gravity=NorthWest&xposition=0&yposition=0&rw=800&rh=600",
        "location": "Cala Blava",
        "deal": {
            "en": "Golf Experience: Private transfers included",
            "de": "Golf-Erlebnis: Private Transfers inklusive",
            "fr": "Expérience Golf: Transferts privés inclus",
            "se": "Golfupplevelse: Privata transferar ingår"
        },
        "original_price": 1800,
        "offer_price": 1449,
        "discount_percent": 20,
        "contact_url": "https://www.caprocat.com"
    },
    {
        "id": "can-mostatxins",
        "name": "Can Mostatxins",
        "type": "hotel",
        "category": "Boutique",
        "region": "North",
        "description": {
            "en": "Intimate boutique hotel with personalized service and unique character in the heart of Mallorca.",
            "de": "Intimes Boutique-Hotel mit persönlichem Service und einzigartigem Charakter im Herzen Mallorcas.",
            "fr": "Hôtel boutique intime avec service personnalisé et caractère unique au cœur de Majorque.",
            "se": "Intimt boutiquehotell med personlig service och unik karaktär i hjärtat av Mallorca.",
        },
        "image": "https://www.bordoyhotels.com/idb/13106/Mostatxins-Quinze-710x530.jpeg",
        "location": "Alcúdia",
        "full_address": "Carrer del Lledoner, 15, 07400 Alcúdia, Illes Balears, Spain",
        "deal": {
            "en": "Golf Package: Rounds at nearby courses + shuttle",
            "de": "Golfpaket: Runden auf nahegelegenen Plätzen + Shuttle",
            "fr": "Forfait golf: Tours sur parcours à proximité + navette",
            "se": "Golfpaket: Rundor på närliggande banor + shuttle",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/can-mostatxins",
    },
    {
        "id": "son-brull-hotel-spa",
        "name": "Son Brull Hotel & Spa",
        "type": "hotel",
        "category": "Luxury Rural",
        "region": "North",
        "description": {
            "en": "Elegant rural retreat offering tranquility, authentic Mallorcan charm, and modern luxury amenities.",
            "de": "Eleganter ländlicher Rückzugsort mit Ruhe, authentischem mallorquinischem Charme und modernen Luxusannehmlichkeiten.",
            "fr": "Retraite rurale élégante offrant tranquillité, charme authentique majorquin et équipements de luxe modernes.",
            "se": "Elegant lantlig tillflyktsort med lugn, äkta mallorkinsk charm och moderna lyxbekvämligheter.",
        },
        "image": "https://sonbrull.com/public/img/bg-home-intro.webp",
        "location": "Pollença",
        "full_address": "Carretera Palma–Pollença, km 50, 07460 Pollença, Illes Balears, Spain",
        "deal": {
            "en": "Golf Package: Rounds at nearby courses + shuttle",
            "de": "Golfpaket: Runden auf nahegelegenen Plätzen + Shuttle",
            "fr": "Forfait golf: Tours sur parcours à proximité + navette",
            "se": "Golfpaket: Rundor på närliggande banor + shuttle",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/son-brull-hotel-spa",
    },
    {
        "id": "hotel-can-auli",
        "name": "Hotel Can Aulí",
        "type": "hotel",
        "category": "Boutique",
        "region": "North",
        "description": {
            "en": "Intimate boutique hotel with personalized service and unique character in the heart of Mallorca.",
            "de": "Intimes Boutique-Hotel mit persönlichem Service und einzigartigem Charakter im Herzen Mallorcas.",
            "fr": "Hôtel boutique intime avec service personnalisé et caractère unique au cœur de Majorque.",
            "se": "Intimt boutiquehotell med personlig service och unik karaktär i hjärtat av Mallorca.",
        },
        "image": "https://www.simpsontravel.com/media/odsl2bpk/can-auli_pool-terrace-night.jpg?width=800&height=600",
        "location": "Pollença",
        "full_address": "Carrer de Can Aulí, 5, 07460 Pollença, Illes Balears, Spain",
        "deal": {
            "en": "Golf Package: Rounds at nearby courses + shuttle",
            "de": "Golfpaket: Runden auf nahegelegenen Plätzen + Shuttle",
            "fr": "Forfait golf: Tours sur parcours à proximité + navette",
            "se": "Golfpaket: Rundor på närliggande banor + shuttle",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/hotel-can-auli",
    },
    {
        "id": "yartan-boutique-hotel",
        "name": "Yartan Boutique Hotel",
        "type": "hotel",
        "category": "Boutique",
        "region": "Northeast",
        "description": {
            "en": "Intimate boutique hotel with personalized service and unique character in the heart of Mallorca.",
            "de": "Intimes Boutique-Hotel mit persönlichem Service und einzigartigem Charakter im Herzen Mallorcas.",
            "fr": "Hôtel boutique intime avec service personnalisé et caractère unique au cœur de Majorque.",
            "se": "Intimt boutiquehotell med personlig service och unik karaktär i hjärtat av Mallorca.",
        },
        "image": "https://www.yartanhotels.com/backoffice/images/56-1b8a3226.jpg",
        "location": "Artà",
        "full_address": "Carrer Trespolet, 8, 07570 Artà, Illes Balears, Spain",
        "deal": {
            "en": "Exclusive: Golf access + spa wellness",
            "de": "Exklusiv: Golfzugang + Spa-Wellness",
            "fr": "Exclusif: Accès golf + bien-être spa",
            "se": "Exklusivt: Golftillgång + spa wellness",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/yartan-boutique-hotel",
    },
    {
        "id": "pleta-de-mar",
        "name": "Pleta de Mar",
        "type": "hotel",
        "category": "Luxury Hotel",
        "region": "East Coast Luxury",
        "description": {
            "en": "Intimate boutique hotel with personalized service and unique character in the heart of Mallorca.",
            "de": "Intimes Boutique-Hotel mit persönlichem Service und einzigartigem Charakter im Herzen Mallorcas.",
            "fr": "Hôtel boutique intime avec service personnalisé et caractère unique au cœur de Majorque.",
            "se": "Intimt boutiquehotell med personlig service och unik karaktär i hjärtat av Mallorca.",
        },
        "image": "https://www.pletademar.com/images/Home_hotel_new.png",
        "location": "Capdepera",
        "full_address": "Carretera Artà–Canyamel, km 8, 07589 Capdepera, Illes Balears, Spain",
        "deal": {
            "en": "Beach & Golf Package: Best rates",
            "de": "Strand & Golf Paket: Bestpreise",
            "fr": "Forfait Plage & Golf: Meilleurs tarifs",
            "se": "Strand & Golf Paket: Bästa priser",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/pleta-de-mar",
    },
    {
        "id": "can-simoneta",
        "name": "Can Simoneta",
        "type": "hotel",
        "category": "Luxury Hotel",
        "region": "East Coast Luxury",
        "description": {
            "en": "Intimate boutique hotel with personalized service and unique character in the heart of Mallorca.",
            "de": "Intimes Boutique-Hotel mit persönlichem Service und einzigartigem Charakter im Herzen Mallorcas.",
            "fr": "Hôtel boutique intime avec service personnalisé et caractère unique au cœur de Majorque.",
            "se": "Intimt boutiquehotell med personlig service och unik karaktär i hjärtat av Mallorca.",
        },
        "image": "https://www.cansimoneta.com/storage/app/uploads/public/68a/d8e/aac/thumb_504_1239_534_0_0_auto.jpg",
        "location": "Canyamel",
        "full_address": "Carretera Artà–Canyamel, km 8, 07589 Canyamel, Illes Balears, Spain",
        "deal": {
            "en": "Beach & Golf Package: Best rates",
            "de": "Strand & Golf Paket: Bestpreise",
            "fr": "Forfait Plage & Golf: Meilleurs tarifs",
            "se": "Strand & Golf Paket: Bästa priser",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/can-simoneta",
    },
    {
        "id": "can-ferrereta",
        "name": "Can Ferrereta",
        "type": "hotel",
        "category": "Luxury Boutique",
        "region": "Southeast",
        "description": {
            "en": "Sophisticated boutique luxury hotel blending historic charm with contemporary elegance and golf access.",
            "de": "Raffiniertes Boutique-Luxushotel, das historischen Charme mit zeitgenössischer Eleganz und Golfzugang vereint.",
            "fr": "Hôtel boutique de luxe sophistiqué alliant charme historique, élégance contemporaine et accès au golf.",
            "se": "Sofistikerat boutique-lyxhotell som blandar historisk charm med samtida elegans och golftillgång.",
        },
        "image": "https://www.hotelcanferrereta.com/backoffice/images/645-152cf1300x870.jpg",
        "location": "Santanyí",
        "full_address": "Carrer de Can Ferrereta, 12, 07650 Santanyí, Illes Balears, Spain",
        "deal": {
            "en": "Golf Getaway: 3 nights + 2 rounds",
            "de": "Golf-Auszeit: 3 Nächte + 2 Runden",
            "fr": "Escapade Golf: 3 nuits + 2 parcours",
            "se": "Golf-flykt: 3 nätter + 2 rundor",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/can-ferrereta",
    },
    {
        "id": "melia-cala-dor-boutique-hotel",
        "name": "Melia Cala d\'Or Boutique Hotel",
        "type": "hotel",
        "category": "Boutique",
        "region": "Southeast",
        "description": {
            "en": "Intimate boutique hotel with personalized service and unique character in the heart of Mallorca.",
            "de": "Intimes Boutique-Hotel mit persönlichem Service und einzigartigem Charakter im Herzen Mallorcas.",
            "fr": "Hôtel boutique intime avec service personnalisé et caractère unique au cœur de Majorque.",
            "se": "Intimt boutiquehotell med personlig service och unik karaktär i hjärtat av Mallorca.",
        },
        "image": "https://dam.melia.com/melia/file/yh7BoHMDs6RPSWXKFSn6.JPG",
        "location": "Cala d’Or",
        "full_address": "Portinatx, 16-18, 07660 Cala d’Or, Illes Balears, Spain",
        "deal": {
            "en": "Golf Getaway: 3 nights + 2 rounds",
            "de": "Golf-Auszeit: 3 Nächte + 2 Runden",
            "fr": "Escapade Golf: 3 nuits + 2 parcours",
            "se": "Golf-flykt: 3 nätter + 2 rundor",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/melia-cala-dor-boutique-hotel",
    },
    {
        "id": "cal-reiet-holistic-retreat",
        "name": "Cal Reiet Holistic Retreat",
        "type": "hotel",
        "category": "Wellness Retreat",
        "region": "Southeast",
        "description": {
            "en": "Holistic wellness retreat combining mindful relaxation, spa therapies, and golf experiences in serene surroundings.",
            "de": "Ganzheitlicher Wellness-Rückzugsort, der achtsame Entspannung, Spa-Therapien und Golferlebnisse in ruhiger Umgebung vereint.",
            "fr": "Retraite de bien-être holistique combinant relaxation consciente, thérapies spa et expériences de golf dans un cadre serein.",
            "se": "Holistisk hälsoresa som kombinerar mindful avkoppling, spa-terapi och golfupplevelser i lugn omgivning.",
        },
        "image": "https://calreiet.com/wp-content/uploads/2024/06/Pool-area.png",
        "location": "Santanyí",
        "full_address": "Carrer de Cal Reiet, 80, 07650 Santanyí, Illes Balears, Spain",
        "deal": {
            "en": "Golf Getaway: 3 nights + 2 rounds",
            "de": "Golf-Auszeit: 3 Nächte + 2 Runden",
            "fr": "Escapade Golf: 3 nuits + 2 parcours",
            "se": "Golf-flykt: 3 nätter + 2 rundor",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/cal-reiet-holistic-retreat",
    },
    {
        "id": "finca-serena-mallorca",
        "name": "Finca Serena Mallorca",
        "type": "hotel",
        "category": "Luxury Rural",
        "region": "Central Inland",
        "description": {
            "en": "Elegant rural retreat offering tranquility, authentic Mallorcan charm, and modern luxury amenities.",
            "de": "Eleganter ländlicher Rückzugsort mit Ruhe, authentischem mallorquinischem Charme und modernen Luxusannehmlichkeiten.",
            "fr": "Retraite rurale élégante offrant tranquillité, charme authentique majorquin et équipements de luxe modernes.",
            "se": "Elegant lantlig tillflyktsort med lugn, äkta mallorkinsk charm och moderna lyxbekvämligheter.",
        },
        "image": "https://www.fincaserenamallorca.com/content/thumbs/587_405/content/imgsxml/panel_destacadostres/suite2115.jpg",
        "location": "Montuïri",
        "full_address": "Ma-3200 km 3, 07230 Montuïri, Illes Balears, Spain",
        "deal": {
            "en": "Rural Golf Experience: Tranquility + tee times",
            "de": "Ländliches Golferlebnis: Ruhe + Abschlagzeiten",
            "fr": "Expérience Golf Rurale: Tranquillité + départs",
            "se": "Lantlig golfupplevelse: Lugn + starttider",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/finca-serena-mallorca",
    },
    {
        "id": "ten-mallorca",
        "name": "Ten Mallorca",
        "type": "hotel",
        "category": "Boutique",
        "region": "Central Inland",
        "description": {
            "en": "Intimate boutique hotel with personalized service and unique character in the heart of Mallorca.",
            "de": "Intimes Boutique-Hotel mit persönlichem Service und einzigartigem Charakter im Herzen Mallorcas.",
            "fr": "Hôtel boutique intime avec service personnalisé et caractère unique au cœur de Majorque.",
            "se": "Intimt boutiquehotell med personlig service och unik karaktär i hjärtat av Mallorca.",
        },
        "image": "https://static.wixstatic.com/media/2cac89_f90a387fb74e4477ad0600efdeb6bad8~mv2_d_1603_2048_s_2.jpeg/v1/fill/w_800,h_600,al_c,q_85/2cac89_f90a387fb74e4477ad0600efdeb6bad8~mv2_d_1603_2048_s_2.jpeg",
        "location": "Sineu",
        "full_address": "Carrer de Son Riera, 14, 07510 Sineu, Illes Balears, Spain",
        "deal": {
            "en": "Rural Golf Experience: Tranquility + tee times",
            "de": "Ländliches Golferlebnis: Ruhe + Abschlagzeiten",
            "fr": "Expérience Golf Rurale: Tranquillité + départs",
            "se": "Lantlig golfupplevelse: Lugn + starttider",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/ten-mallorca",
    },
    {
        "id": "son-xotano",
        "name": "Son Xotano",
        "type": "hotel",
        "category": "Luxury Estate",
        "region": "Central Inland",
        "description": {
            "en": "Private luxury estate with expansive grounds, refined service, and exclusive golf partnerships with premier courses.",
            "de": "Privates Luxusanwesen mit weitläufigem Gelände, raffiniertem Service und exklusiven Golfpartnerschaften mit erstklassigen Plätzen.",
            "fr": "Domaine de luxe privé avec terrains expansifs, service raffiné et partenariats golf exclusifs avec des parcours de premier ordre.",
            "se": "Privat lyxegendom med vidsträckta marker, förfinad service och exklusiva golfpartnerskap med förstklassiga banor.",
        },
        "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/372098893.jpg?k=d3c6e897c8e59bd7e3a6e7b8e8a7c6d5&o=",
        "location": "Sencelles",
        "full_address": "Camí de Son Xotano, 07140 Sencelles, Illes Balears, Spain",
        "deal": {
            "en": "Rural Golf Experience: Tranquility + tee times",
            "de": "Ländliches Golferlebnis: Ruhe + Abschlagzeiten",
            "fr": "Expérience Golf Rurale: Tranquillité + départs",
            "se": "Lantlig golfupplevelse: Lugn + starttider",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/son-xotano",
    },
    {
        "id": "la-residencia-a-belmond-hotel",
        "name": "La Residencia, A Belmond Hotel",
        "type": "hotel",
        "category": "Ultra Luxury",
        "region": "Tramuntana",
        "description": {
            "en": "Ultra-luxury property with world-class amenities, Michelin dining, and exceptional golf packages.",
            "de": "Ultra-Luxus-Immobilie mit erstklassigen Annehmlichkeiten, Michelin-Dining und außergewöhnlichen Golfpaketen.",
            "fr": "Propriété ultra-luxe avec équipements de classe mondiale, restaurants Michelin et forfaits golf exceptionnels.",
            "se": "Ultra-lyxig fastighet med världsklass bekvämligheter, Michelin-restauranger och exceptionella golfpaket.",
        },
        "image": "https://img.belmond.com/image/upload/w_800,h_600,c_fill/photos/lrs/lrs-ext01.jpg",
        "location": "Deià",
        "full_address": "Carrer son Canals, 07179 Deià, Illes Balears, Spain",
        "deal": {
            "en": "Mountain Golf Escape: Premium courses + transfers",
            "de": "Berg-Golf-Flucht: Premium-Plätze + Transfers",
            "fr": "Escapade Golf Montagne: Parcours premium + transferts",
            "se": "Berg-golf-flykt: Premiumbanor + transfers",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/la-residencia-a-belmond-hotel",
    },
    {
        "id": "son-bunyola-hotel-villas",
        "name": "Son Bunyola Hotel & Villas",
        "type": "hotel",
        "category": "Ultra Luxury Estate",
        "region": "Tramuntana",
        "description": {
            "en": "Exclusive ultra-luxury estate with private villas, spa facilities, and personalized golf concierge services.",
            "de": "Exklusives Ultra-Luxus-Anwesen mit privaten Villen, Spa-Einrichtungen und personalisiertem Golf-Concierge-Service.",
            "fr": "Domaine ultra-luxe exclusif avec villas privées, installations spa et services de conciergerie golf personnalisés.",
            "se": "Exklusiv ultra-lyxegendom med privata villor, spaanläggningar och personliga golf concierge-tjänster.",
        },
        "image": "https://calreiet.com/wp-content/uploads/2024/06/Entrance.png",
        "location": "Banyalbufar",
        "full_address": "Ctra. C-710, km 83.7, 07191 Banyalbufar, Illes Balears, Spain",
        "deal": {
            "en": "Mountain Golf Escape: Premium courses + transfers",
            "de": "Berg-Golf-Flucht: Premium-Plätze + Transfers",
            "fr": "Escapade Golf Montagne: Parcours premium + transferts",
            "se": "Berg-golf-flykt: Premiumbanor + transfers",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/son-bunyola-hotel-villas",
    },
    {
        "id": "gran-hotel-soller",
        "name": "Gran Hotel Sóller",
        "type": "hotel",
        "category": "Luxury Classic",
        "region": "Tramuntana",
        "description": {
            "en": "Classic luxury hotel with timeless elegance, premium amenities, and convenient access to championship golf courses.",
            "de": "Klassisches Luxushotel mit zeitloser Eleganz, Premium-Annehmlichkeiten und bequemem Zugang zu Championship-Golfplätzen.",
            "fr": "Hôtel de luxe classique avec élégance intemporelle, équipements premium et accès pratique aux parcours de golf de championnat.",
            "se": "Klassiskt lyxhotell med tidlös elegans, premium bekvämligheter och bekväm tillgång till mästerskap golfbanor.",
        },
        "image": "https://image-tc.galaxy.tf/wijpeg-4floa7yvebyc1kd6u37vazhar/gran-hotel-soller-hotel-building-11.jpg?width=800&height=600",
        "location": "Sóller",
        "full_address": "Carrer de Romaguera, 18, 07100 Sóller, Illes Balears, Spain",
        "deal": {
            "en": "Mountain Golf Escape: Premium courses + transfers",
            "de": "Berg-Golf-Flucht: Premium-Plätze + Transfers",
            "fr": "Escapade Golf Montagne: Parcours premium + transferts",
            "se": "Berg-golf-flykt: Premiumbanor + transfers",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/gran-hotel-soller",
    },
    {
        "id": "sant-francesc-hotel-singular",
        "name": "Sant Francesc Hotel Singular",
        "type": "hotel",
        "category": "Luxury Boutique",
        "region": "Palma",
        "description": {
            "en": "Sophisticated boutique luxury hotel blending historic charm with contemporary elegance and golf access.",
            "de": "Raffiniertes Boutique-Luxushotel, das historischen Charme mit zeitgenössischer Eleganz und Golfzugang vereint.",
            "fr": "Hôtel boutique de luxe sophistiqué alliant charme historique, élégance contemporaine et accès au golf.",
            "se": "Sofistikerat boutique-lyxhotell som blandar historisk charm med samtida elegans och golftillgång.",
        },
        "image": "https://www.bordoyhotels.com/idb/13106/Mostatxins-Quinze-710x530.jpeg",
        "location": "Palma",
        "full_address": "Plaça de Sant Francesc, 5, 07001 Palma, Illes Balears, Spain",
        "deal": {
            "en": "City & Golf: Urban luxury + course access",
            "de": "Stadt & Golf: Urbaner Luxus + Platzzugang",
            "fr": "Ville & Golf: Luxe urbain + accès parcours",
            "se": "Stad & Golf: Urban lyx + bantillgång",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/sant-francesc-hotel-singular",
    },
    {
        "id": "can-bordoy-grand-house-garden",
        "name": "Can Bordoy Grand House & Garden",
        "type": "hotel",
        "category": "Luxury Boutique",
        "region": "Palma",
        "description": {
            "en": "Sophisticated boutique luxury hotel blending historic charm with contemporary elegance and golf access.",
            "de": "Raffiniertes Boutique-Luxushotel, das historischen Charme mit zeitgenössischer Eleganz und Golfzugang vereint.",
            "fr": "Hôtel boutique de luxe sophistiqué alliant charme historique, élégance contemporaine et accès au golf.",
            "se": "Sofistikerat boutique-lyxhotell som blandar historisk charm med samtida elegans och golftillgång.",
        },
        "image": "https://sonbrull.com/public/img/bg-home-intro.webp",
        "location": "Palma",
        "full_address": "Carrer del Forn de la Glòria, 14, 07012 Palma, Illes Balears, Spain",
        "deal": {
            "en": "City & Golf: Urban luxury + course access",
            "de": "Stadt & Golf: Urbaner Luxus + Platzzugang",
            "fr": "Ville & Golf: Luxe urbain + accès parcours",
            "se": "Stad & Golf: Urban lyx + bantillgång",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/can-bordoy-grand-house-garden",
    },
    {
        "id": "hotel-convent-de-la-missio",
        "name": "Hotel Convent de la Missió",
        "type": "hotel",
        "category": "Luxury Boutique",
        "region": "Palma",
        "description": {
            "en": "Sophisticated boutique luxury hotel blending historic charm with contemporary elegance and golf access.",
            "de": "Raffiniertes Boutique-Luxushotel, das historischen Charme mit zeitgenössischer Eleganz und Golfzugang vereint.",
            "fr": "Hôtel boutique de luxe sophistiqué alliant charme historique, élégance contemporaine et accès au golf.",
            "se": "Sofistikerat boutique-lyxhotell som blandar historisk charm med samtida elegans och golftillgång.",
        },
        "image": "https://conventdelamissio.com/backoffice/images/344-48convent1300x870.webp",
        "location": "Palma",
        "full_address": "Carrer de la Missió, 7A, 07003 Palma, Illes Balears, Spain",
        "deal": {
            "en": "City & Golf: Urban luxury + course access",
            "de": "Stadt & Golf: Urbaner Luxus + Platzzugang",
            "fr": "Ville & Golf: Luxe urbain + accès parcours",
            "se": "Stad & Golf: Urban lyx + bantillgång",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/hotel-convent-de-la-missio",
    },
    {
        "id": "hotel-can-cera",
        "name": "Hotel Can Cera",
        "type": "hotel",
        "category": "Luxury Boutique",
        "region": "Palma",
        "description": {
            "en": "Sophisticated boutique luxury hotel blending historic charm with contemporary elegance and golf access.",
            "de": "Raffiniertes Boutique-Luxushotel, das historischen Charme mit zeitgenössischer Eleganz und Golfzugang vereint.",
            "fr": "Hôtel boutique de luxe sophistiqué alliant charme historique, élégance contemporaine et accès au golf.",
            "se": "Sofistikerat boutique-lyxhotell som blandar historisk charm med samtida elegans och golftillgång.",
        },
        "image": "https://www.yartanhotels.com/backoffice/images/56-1b8a3226.jpg",
        "location": "Palma",
        "full_address": "Carrer de Sant Francesc, 8, 07001 Palma, Illes Balears, Spain",
        "deal": {
            "en": "City & Golf: Urban luxury + course access",
            "de": "Stadt & Golf: Urbaner Luxus + Platzzugang",
            "fr": "Ville & Golf: Luxe urbain + accès parcours",
            "se": "Stad & Golf: Urban lyx + bantillgång",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/hotel-can-cera",
    },
    {
        "id": "summum-boutique-hotel-member-of-melia-collection",
        "name": "Summum Boutique Hotel, member of Meliá Collection",
        "type": "hotel",
        "category": "Luxury Boutique",
        "region": "Palma",
        "description": {
            "en": "Sophisticated boutique luxury hotel blending historic charm with contemporary elegance and golf access.",
            "de": "Raffiniertes Boutique-Luxushotel, das historischen Charme mit zeitgenössischer Eleganz und Golfzugang vereint.",
            "fr": "Hôtel boutique de luxe sophistiqué alliant charme historique, élégance contemporaine et accès au golf.",
            "se": "Sofistikerat boutique-lyxhotell som blandar historisk charm med samtida elegans och golftillgång.",
        },
        "image": "https://www.pletademar.com/images/Home_hotel_new.png",
        "location": "Palma",
        "full_address": "Carrer de la Concepció, 26, 07012 Palma, Illes Balears, Spain",
        "deal": {
            "en": "City & Golf: Urban luxury + course access",
            "de": "Stadt & Golf: Urbaner Luxus + Platzzugang",
            "fr": "Ville & Golf: Luxe urbain + accès parcours",
            "se": "Stad & Golf: Urban lyx + bantillgång",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/summum-boutique-hotel-member-of-melia-collection",
    },
    {
        "id": "can-alomar-urban-luxury-retreat",
        "name": "Can Alomar Urban Luxury Retreat",
        "type": "hotel",
        "category": "Luxury Boutique",
        "region": "Palma",
        "description": {
            "en": "Sophisticated boutique luxury hotel blending historic charm with contemporary elegance and golf access.",
            "de": "Raffiniertes Boutique-Luxushotel, das historischen Charme mit zeitgenössischer Eleganz und Golfzugang vereint.",
            "fr": "Hôtel boutique de luxe sophistiqué alliant charme historique, élégance contemporaine et accès au golf.",
            "se": "Sofistikerat boutique-lyxhotell som blandar historisk charm med samtida elegans och golftillgång.",
        },
        "image": "https://www.cansimoneta.com/storage/app/uploads/public/68a/d8e/aac/thumb_504_1239_534_0_0_auto.jpg",
        "location": "Palma",
        "full_address": "Carrer de Sant Feliu, 1, 07012 Palma, Illes Balears, Spain",
        "deal": {
            "en": "City & Golf: Urban luxury + course access",
            "de": "Stadt & Golf: Urbaner Luxus + Platzzugang",
            "fr": "Ville & Golf: Luxe urbain + accès parcours",
            "se": "Stad & Golf: Urban lyx + bantillgång",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/can-alomar-urban-luxury-retreat",
    },
    {
        "id": "palma-riad",
        "name": "Palma Riad",
        "type": "hotel",
        "category": "Boutique",
        "region": "Palma",
        "description": {
            "en": "Intimate boutique hotel with personalized service and unique character in the heart of Mallorca.",
            "de": "Intimes Boutique-Hotel mit persönlichem Service und einzigartigem Charakter im Herzen Mallorcas.",
            "fr": "Hôtel boutique intime avec service personnalisé et caractère unique au cœur de Majorque.",
            "se": "Intimt boutiquehotell med personlig service och unik karaktär i hjärtat av Mallorca.",
        },
        "image": "https://palmariadonly.hotelpalmademallorca.net/data/Photos/700x500w/11531/1153110/1153110282/palma-riad-adults-only-palma-de-mallorca-photo-1.JPEG",
        "location": "Palma",
        "full_address": "Carrer de Sant Jaume, 5, 07012 Palma, Illes Balears, Spain",
        "deal": {
            "en": "City & Golf: Urban luxury + course access",
            "de": "Stadt & Golf: Urbaner Luxus + Platzzugang",
            "fr": "Ville & Golf: Luxe urbain + accès parcours",
            "se": "Stad & Golf: Urban lyx + bantillgång",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/palma-riad",
    },
    {
        "id": "nobis-hotel-palma",
        "name": "Nobis Hotel Palma",
        "type": "hotel",
        "category": "Luxury Design",
        "region": "Palma",
        "description": {
            "en": "Contemporary design hotel featuring cutting-edge architecture, artistic interiors, and curated golf experiences.",
            "de": "Zeitgenössisches Designhotel mit hochmoderner Architektur, künstlerischen Interieurs und kuratierten Golferlebnissen.",
            "fr": "Hôtel design contemporain avec architecture avant-gardiste, intérieurs artistiques et expériences de golf organisées.",
            "se": "Samtida designhotell med banbrytande arkitektur, konstnärliga interiörer och kurerade golfupplevelser.",
        },
        "image": "https://dam.melia.com/melia/file/yh7BoHMDs6RPSWXKFSn6.JPG",
        "location": "Palma",
        "full_address": "Carrer de les Caputxines, 9, 07003 Palma, Illes Balears, Spain",
        "deal": {
            "en": "City & Golf: Urban luxury + course access",
            "de": "Stadt & Golf: Urbaner Luxus + Platzzugang",
            "fr": "Ville & Golf: Luxe urbain + accès parcours",
            "se": "Stad & Golf: Urban lyx + bantillgång",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/nobis-hotel-palma",
    },
    {
        "id": "hotel-villa-italia",
        "name": "Hotel Villa Italia",
        "type": "hotel",
        "category": "Luxury Seaview",
        "region": "Southwest",
        "description": {
            "en": "Stunning seaview hotel offering panoramic Mediterranean views, elegant accommodations, and golf shuttle service.",
            "de": "Atemberaubendes Hotel mit Meerblick, Panoramablick aufs Mittelmeer, eleganten Unterkünften und Golf-Shuttle-Service.",
            "fr": "Hôtel vue mer époustouflant offrant des vues panoramiques sur la Méditerranée, des hébergements élégants et un service de navette golf.",
            "se": "Fantastiskt havsutsiktshotell med panoramautsikt över Medelhavet, eleganta boenden och golf-shuttletjänst.",
        },
        "image": "https://villa-italia.mallorcahotelsweb.com/data/Imgs/700x500w/17183/1718300/1718300235/hotel-villa-italia-port-d-andratx-img-1.JPEG",
        "location": "Port d’Andratx",
        "full_address": "Carrer de les Oliveres, 19, 07157 Port d’Andratx, Illes Balears, Spain",
        "deal": {
            "en": "Coastal Golf Package: Sea views + tee times",
            "de": "Küsten-Golfpaket: Meerblick + Abschlagzeiten",
            "fr": "Forfait Golf Côtier: Vues mer + départs",
            "se": "Kust-golfpaket: Havsutsikt + starttider",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/hotel-villa-italia",
    },
    {
        "id": "mon-port-hotel-spa",
        "name": "Mon Port Hotel & Spa",
        "type": "hotel",
        "category": "Luxury Resort",
        "region": "Southwest",
        "description": {
            "en": "Full-service luxury resort with Mediterranean gardens, golf packages, and world-class dining options.",
            "de": "Full-Service-Luxusresort mit mediterranen Gärten, Golfpaketen und erstklassigen Speisemöglichkeiten.",
            "fr": "Resort de luxe complet avec jardins méditerranéens, forfaits golf et options de restauration de classe mondiale.",
            "se": "Komplett lyxresort med medelhavsträdgårdar, golfpaket och världsklass matställen.",
        },
        "image": "https://www.hotelmonport.com/intranet/images/thumbs/tn_500_500_03_07_1910_03_03hotel_mon_port_exteriores.jpg",
        "location": "Port d’Andratx",
        "full_address": "Carrer de Cala d’Egos, s/n, 07157 Port d’Andratx, Illes Balears, Spain",
        "deal": {
            "en": "Coastal Golf Package: Sea views + tee times",
            "de": "Küsten-Golfpaket: Meerblick + Abschlagzeiten",
            "fr": "Forfait Golf Côtier: Vues mer + départs",
            "se": "Kust-golfpaket: Havsutsikt + starttider",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/mon-port-hotel-spa",
    },
    {
        "id": "castell-son-claret",
        "name": "Castell Son Claret",
        "type": "hotel",
        "category": "Ultra Luxury Estate",
        "region": "Southwest",
        "description": {
            "en": "Exclusive ultra-luxury estate with private villas, spa facilities, and personalized golf concierge services.",
            "de": "Exklusives Ultra-Luxus-Anwesen mit privaten Villen, Spa-Einrichtungen und personalisiertem Golf-Concierge-Service.",
            "fr": "Domaine ultra-luxe exclusif avec villas privées, installations spa et services de conciergerie golf personnalisés.",
            "se": "Exklusiv ultra-lyxegendom med privata villor, spaanläggningar och personliga golf concierge-tjänster.",
        },
        "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/266883037.jpg?k=castell-son-claret-mallorca&o=",
        "location": "Calvià",
        "full_address": "Carretera Es Capdellà–Galilea, km 1.7, 07196 Calvià, Illes Balears, Spain",
        "deal": {
            "en": "Coastal Golf Package: Sea views + tee times",
            "de": "Küsten-Golfpaket: Meerblick + Abschlagzeiten",
            "fr": "Forfait Golf Côtier: Vues mer + départs",
            "se": "Kust-golfpaket: Havsutsikt + starttider",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/castell-son-claret",
    },
    # ===== NEW HOTELS =====
    {
        "id": "sheraton-arabella-golf-hotel",
        "name": "Sheraton Mallorca Arabella Golf Hotel",
        "type": "hotel",
        "category": "5-Star Golf Resort",
        "region": "Son Vida",
        "description": {
            "en": "Luxury golf resort in Son Vida with direct access to three championship courses and world-class spa.",
            "de": "Luxus-Golfresort in Son Vida mit direktem Zugang zu drei Championship-Plätzen und erstklassigem Spa.",
            "fr": "Resort de golf de luxe à Son Vida avec accès direct à trois parcours de championnat et spa de classe mondiale.",
            "se": "Lyxigt golfresort i Son Vida med direkt tillgång till tre mästerskapsbanor och spa i världsklass.",
        },
        "image": "https://cache.marriott.com/content/dam/marriott-renditions/PMISI/pmisi-exterior-5696-hor-clsc.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1336px:*",
        "location": "Son Vida",
        "full_address": "Carrer de la Vinagrella, s/n, 07013 Son Vida, Mallorca",
        "deal": {
            "en": "Golf & Stay: 3 nights + unlimited golf on 3 courses",
            "de": "Golf & Aufenthalt: 3 Nächte + unbegrenztes Golf auf 3 Plätzen",
            "fr": "Golf & Séjour: 3 nuits + golf illimité sur 3 parcours",
            "se": "Golf & Vistelse: 3 nätter + obegränsad golf på 3 banor",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/sheraton-arabella",
    },
    {
        "id": "castillo-hotel-son-vida",
        "name": "Castillo Hotel Son Vida",
        "type": "hotel",
        "category": "5-Star Luxury Castle",
        "region": "Son Vida",
        "description": {
            "en": "Historic castle turned luxury hotel overlooking Palma Bay, with exclusive golf privileges at Son Vida courses.",
            "de": "Historisches Schloss als Luxushotel mit Blick auf die Bucht von Palma und exklusiven Golfprivilegien.",
            "fr": "Château historique transformé en hôtel de luxe surplombant la baie de Palma, avec privilèges golf exclusifs.",
            "se": "Historiskt slott omvandlat till lyxhotell med utsikt över Palmabukten och exklusiva golfprivilegier.",
        },
        "image": "https://cache.marriott.com/content/dam/marriott-renditions/PMILC/pmilc-exterior-7506-hor-clsc.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1336px:*",
        "location": "Son Vida",
        "full_address": "Carrer Raixa, 2, 07013 Son Vida, Mallorca",
        "deal": {
            "en": "Castle Experience: Luxury suite + private golf lesson",
            "de": "Schloss-Erlebnis: Luxus-Suite + private Golfstunde",
            "fr": "Expérience Château: Suite luxe + cours de golf privé",
            "se": "Slottsupplevelse: Lyxsvit + privat golflektion",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/castillo-son-vida",
    },
    {
        "id": "kimpton-aysla-mallorca",
        "name": "Kimpton Aysla Mallorca",
        "type": "hotel",
        "category": "5-Star Modern Luxury",
        "region": "Santa Ponsa",
        "description": {
            "en": "Contemporary luxury resort near Santa Ponsa Golf with stunning infinity pool and farm-to-table dining.",
            "de": "Modernes Luxusresort in der Nähe von Santa Ponsa Golf mit atemberaubendem Infinity-Pool und Farm-to-Table-Küche.",
            "fr": "Resort de luxe contemporain près de Santa Ponsa Golf avec piscine à débordement et cuisine de la ferme à la table.",
            "se": "Samtida lyxresort nära Santa Ponsa Golf med fantastisk infinitypool och farm-to-table-matsal.",
        },
        "image": "https://digital.ihg.com/is/image/ihg/kimpton-santa-ponsa-8623193946-16x9",
        "location": "Santa Ponsa",
        "full_address": "Avinguda del Rei Jaume I, 109, 07180 Santa Ponsa, Mallorca",
        "deal": {
            "en": "Golf Getaway: 2 nights + green fees at 2 courses",
            "de": "Golf-Auszeit: 2 Nächte + Green Fees auf 2 Plätzen",
            "fr": "Escapade Golf: 2 nuits + green fees sur 2 parcours",
            "se": "Golfresa: 2 nätter + green fees på 2 banor",
        },
        "discount_percent": 18,
        "contact_url": "https://www.golfinmallorca.com/hotels/kimpton-aysla",
    },
    {
        "id": "pure-salt-port-adriano",
        "name": "Pure Salt Port Adriano",
        "type": "hotel",
        "category": "Adults-Only Luxury",
        "region": "Port Adriano",
        "description": {
            "en": "Adults-only luxury hotel at Port Adriano marina with rooftop infinity pool and exclusive golf packages.",
            "de": "Nur-Erwachsene-Luxushotel am Yachthafen Port Adriano mit Rooftop-Infinity-Pool und exklusiven Golfpaketen.",
            "fr": "Hôtel de luxe réservé aux adultes au port Adriano avec piscine à débordement sur le toit et forfaits golf exclusifs.",
            "se": "Endast-vuxna lyxhotell vid Port Adriano marina med infinitypool på taket och exklusiva golfpaket.",
        },
        "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/372896789.jpg?k=pure-salt-port-adriano&o=",
        "location": "Port Adriano",
        "full_address": "Urbanització El Toro, s/n, 07180 Port Adriano, Mallorca",
        "deal": {
            "en": "Couples Golf: Suite + spa + 2 green fees",
            "de": "Paar-Golf: Suite + Spa + 2 Green Fees",
            "fr": "Golf en couple: Suite + spa + 2 green fees",
            "se": "Pargolf: Svit + spa + 2 green fees",
        },
        "discount_percent": 22,
        "contact_url": "https://www.golfinmallorca.com/hotels/pure-salt-port-adriano",
    },
    {
        "id": "zafiro-palace-alcudia",
        "name": "Zafiro Palace Alcúdia",
        "type": "hotel",
        "category": "4-Star Superior Resort",
        "region": "Alcúdia",
        "description": {
            "en": "Premium all-inclusive resort near Alcanada Golf with family-friendly amenities and golf packages.",
            "de": "Premium-All-Inclusive-Resort in der Nähe von Alcanada Golf mit familienfreundlichen Annehmlichkeiten und Golfpaketen.",
            "fr": "Resort tout inclus premium près d'Alcanada Golf avec équipements familiaux et forfaits golf.",
            "se": "Premium all-inclusive resort nära Alcanada Golf med familjevänliga bekvämligheter och golfpaket.",
        },
        "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/238615589.jpg?k=zafiro-palace-alcudia&o=",
        "location": "Alcúdia",
        "full_address": "Carrer dels Mariners, s/n, 07400 Port d'Alcúdia, Mallorca",
        "deal": {
            "en": "Family Golf: All-inclusive + kids club + adult golf",
            "de": "Familien-Golf: All-Inclusive + Kinderclub + Erwachsenen-Golf",
            "fr": "Golf Famille: Tout inclus + club enfants + golf adulte",
            "se": "Familjegolf: All-inclusive + barnklubb + vuxengolf",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/hotels/zafiro-palace-alcudia",
    },
    {
        "id": "cap-vermell-grand-hotel",
        "name": "Cap Vermell Grand Hotel",
        "type": "hotel",
        "category": "5-Star Resort",
        "region": "Canyamel",
        "description": {
            "en": "Exclusive resort home to 2-Michelin star VORO restaurant, with stunning cliffside location near Canyamel Golf.",
            "de": "Exklusives Resort mit dem 2-Michelin-Sterne-Restaurant VORO an einer atemberaubenden Klippe nahe Canyamel Golf.",
            "fr": "Resort exclusif abritant le restaurant 2 étoiles Michelin VORO, avec emplacement spectaculaire près de Canyamel Golf.",
            "se": "Exklusivt resort med 2-Michelin-stjärnig restaurang VORO, fantastisk klippläge nära Canyamel Golf.",
        },
        "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/355691421.jpg?k=cap-vermell&o=",
        "location": "Canyamel",
        "full_address": "Urbanització Atalaya de Canyamel, s/n, 07589 Canyamel, Mallorca",
        "deal": {
            "en": "Gourmet Golf: VORO dinner + Canyamel green fee",
            "de": "Gourmet-Golf: VORO-Dinner + Canyamel Green Fee",
            "fr": "Golf Gourmet: Dîner VORO + green fee Canyamel",
            "se": "Gourmetgolf: VORO-middag + Canyamel green fee",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/hotels/cap-vermell",
    },
    {
        "id": "park-hyatt-mallorca",
        "name": "Park Hyatt Mallorca",
        "type": "hotel",
        "category": "Luxury Resort",
        "region": "Canyamel",
        "description": {
            "en": "Ultra-luxury resort with private beach, world-class spa, and preferential tee times at Canyamel Golf.",
            "de": "Ultra-Luxus-Resort mit privatem Strand, erstklassigem Spa und bevorzugten Startzeiten bei Canyamel Golf.",
            "fr": "Resort ultra-luxe avec plage privée, spa de classe mondiale et départs préférentiels à Canyamel Golf.",
            "se": "Ultra-lyxresort med privat strand, spa i världsklass och förmånliga starttider på Canyamel Golf.",
        },
        "image": "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2016/08/16/1130/Park-Hyatt-Mallorca-P084-Resort-Pool.jpg/Park-Hyatt-Mallorca-P084-Resort-Pool.16x9.jpg",
        "location": "Canyamel",
        "full_address": "Urbanització Atalaya de Canyamel, s/n, 07589 Canyamel, Mallorca",
        "deal": {
            "en": "Hyatt Golf Experience: Spa + unlimited golf",
            "de": "Hyatt Golf-Erlebnis: Spa + unbegrenztes Golf",
            "fr": "Expérience Golf Hyatt: Spa + golf illimité",
            "se": "Hyatt golfupplevelse: Spa + obegränsad golf",
        },
        "discount_percent": 25,
        "contact_url": "https://www.golfinmallorca.com/hotels/park-hyatt-mallorca",
    },
    {
        "id": "es-raco-darta",
        "name": "Es Racó d'Artà",
        "type": "hotel",
        "category": "Luxury Nature Retreat",
        "region": "Artà",
        "description": {
            "en": "Eco-luxury boutique hotel in a restored finca with organic gardens and access to northeast golf courses.",
            "de": "Öko-Luxus-Boutique-Hotel in einer restaurierten Finca mit Bio-Gärten und Zugang zu nordöstlichen Golfplätzen.",
            "fr": "Hôtel boutique éco-luxe dans une finca restaurée avec jardins biologiques et accès aux golfs du nord-est.",
            "se": "Eko-lyxboutique-hotell i en restaurerad finca med ekologiska trädgårdar och tillgång till nordöstra golfbanor.",
        },
        "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/283927561.jpg?k=es-raco-arta&o=",
        "location": "Artà",
        "full_address": "Carrer Na Batlessa, s/n, 07570 Artà, Mallorca",
        "deal": {
            "en": "Nature & Golf: Organic breakfast + golf excursion",
            "de": "Natur & Golf: Bio-Frühstück + Golfausflug",
            "fr": "Nature & Golf: Petit-déjeuner bio + excursion golf",
            "se": "Natur & Golf: Ekologisk frukost + golfutflykt",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/hotels/es-raco-darta",
    },
    {
        "id": "gran-hotel-son-net",
        "name": "Gran Hotel Son Net",
        "type": "hotel",
        "category": "Luxury Estate",
        "region": "Puigpunyent",
        "description": {
            "en": "17th-century manor house in the Tramuntana mountains with art collection and helicopter golf transfers.",
            "de": "Herrenhaus aus dem 17. Jahrhundert in den Tramuntana-Bergen mit Kunstsammlung und Helikopter-Golftransfers.",
            "fr": "Manoir du 17ème siècle dans les montagnes de Tramuntana avec collection d'art et transferts golf en hélicoptère.",
            "se": "1600-tals herrgård i Tramuntana-bergen med konstsamling och helikopter-golfransfers.",
        },
        "image": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/161736847.jpg?k=gran-hotel-son-net&o=",
        "location": "Puigpunyent",
        "full_address": "Carrer Castillo de Son Net, s/n, 07194 Puigpunyent, Mallorca",
        "deal": {
            "en": "Heritage Golf: Historic tour + VIP golf day",
            "de": "Erbe-Golf: Historische Tour + VIP-Golftag",
            "fr": "Golf Patrimoine: Visite historique + journée golf VIP",
            "se": "Arvgolf: Historisk tur + VIP-golfdag",
        },
        "discount_percent": 18,
        "contact_url": "https://www.golfinmallorca.com/hotels/gran-hotel-son-net",
    },
    # ===== NEW RESTAURANTS =====
    {
        "id": "voro",
        "name": "VORO",
        "type": "restaurant",
        "description": {
            "en": "Two Michelin stars at Cap Vermell Grand Hotel. Chef Álvaro Salazar creates extraordinary Mediterranean cuisine.",
            "de": "Zwei Michelin-Sterne im Cap Vermell Grand Hotel. Küchenchef Álvaro Salazar kreiert außergewöhnliche mediterrane Küche.",
            "fr": "Deux étoiles Michelin au Cap Vermell Grand Hotel. Le chef Álvaro Salazar crée une cuisine méditerranéenne extraordinaire.",
            "se": "Två Michelinstjärnor på Cap Vermell Grand Hotel. Kocken Álvaro Salazar skapar extraordinär medelhavskök.",
        },
        "image": "https://lh3.googleusercontent.com/p/AF1QipO5v-VORO-restaurant-cap-vermell-mallorca",
        "location": "Canyamel",
        "deal": {
            "en": "Golfer's Tasting: 8-course menu with wine pairing",
            "de": "Golfer-Degustationsmenü: 8-Gänge-Menü mit Weinbegleitung",
            "fr": "Menu Dégustation Golfeur: 8 plats avec accords mets-vins",
            "se": "Golfarens provmeny: 8-rättersmeny med vinmatchning",
        },
        "original_price": 280,
        "offer_price": 240,
        "discount_percent": 15,
        "contact_url": "https://www.vaborestaurant.com",
    },
    {
        "id": "dins-santi-taura",
        "name": "DINS Santi Taura",
        "type": "restaurant",
        "description": {
            "en": "One Michelin star showcasing authentic Mallorcan cuisine with chef Santi Taura's signature creativity.",
            "de": "Ein Michelin-Stern mit authentischer mallorquinischer Küche und der charakteristischen Kreativität von Küchenchef Santi Taura.",
            "fr": "Une étoile Michelin mettant en valeur la cuisine majorquine authentique avec la créativité du chef Santi Taura.",
            "se": "En Michelinstjärna som visar autentiskt mallorkinsk mat med kocken Santi Tauras kreativitet.",
        },
        "image": "https://lh3.googleusercontent.com/p/AF1QipNwDINS-santi-taura-palma-mallorca",
        "location": "Palma",
        "deal": {
            "en": "Traditional Tasting: Mallorcan heritage menu",
            "de": "Traditionelle Verkostung: Mallorquinisches Erbe-Menü",
            "fr": "Dégustation Traditionnelle: Menu patrimoine majorquin",
            "se": "Traditionell provning: Mallorkinsk arvsmeny",
        },
        "original_price": 150,
        "offer_price": 130,
        "discount_percent": 13,
        "contact_url": "https://www.dinssantitaura.com",
    },
    {
        "id": "es-verger",
        "name": "Es Verger",
        "type": "restaurant",
        "description": {
            "en": "Legendary mountain restaurant famous for slow-roasted lamb, spectacular views, and authentic Mallorcan atmosphere.",
            "de": "Legendäres Bergrestaurant, berühmt für langsam gebratenes Lamm, spektakuläre Aussichten und authentische mallorquinische Atmosphäre.",
            "fr": "Restaurant de montagne légendaire célèbre pour son agneau rôti lentement, ses vues spectaculaires et son atmosphère majorquine authentique.",
            "se": "Legendarisk bergsrestaurang känd för långsamt rostat lamm, spektakulär utsikt och autentisk mallorkinsk atmosfär.",
        },
        "image": "https://lh3.googleusercontent.com/p/AF1QipMtVfjKoEs-verger-alaro-mallorca-lamb",
        "location": "Alaró",
        "deal": {
            "en": "Mountain Feast: Lamb + local wine selection",
            "de": "Bergfest: Lamm + lokale Weinauswahl",
            "fr": "Festin Montagnard: Agneau + sélection vins locaux",
            "se": "Bergsfest: Lamm + lokalt vinurval",
        },
        "original_price": 65,
        "offer_price": 55,
        "discount_percent": 15,
        "contact_url": "https://www.esverger.com",
    },
    {
        "id": "izakaya-mallorca",
        "name": "Izakaya Mallorca",
        "type": "restaurant",
        "description": {
            "en": "Trendy Japanese izakaya in Santa Catalina serving innovative fusion dishes and craft cocktails.",
            "de": "Trendige japanische Izakaya in Santa Catalina mit innovativen Fusionsgerichten und Craft-Cocktails.",
            "fr": "Izakaya japonais tendance à Santa Catalina servant des plats fusion innovants et cocktails artisanaux.",
            "se": "Trendig japansk izakaya i Santa Catalina med innovativa fusionrätter och hantverkscocktails.",
        },
        "image": "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "deal": {
            "en": "After Golf: Omakase menu + sake pairing",
            "de": "After Golf: Omakase-Menü + Sake-Begleitung",
            "fr": "After Golf: Menu omakase + accord saké",
            "se": "After Golf: Omakase-meny + sakematchning",
        },
        "original_price": 85,
        "offer_price": 72,
        "discount_percent": 15,
        "contact_url": "https://www.izakayamallorca.com",
    },
    {
        "id": "es-fanals",
        "name": "Es Fanals",
        "type": "restaurant",
        "description": {
            "en": "Fine dining at Jumeirah Port Soller with panoramic sea views and Mediterranean-Asian fusion cuisine.",
            "de": "Gehobene Küche im Jumeirah Port Soller mit Panorama-Meerblick und mediterran-asiatischer Fusionsküche.",
            "fr": "Gastronomie au Jumeirah Port Soller avec vues panoramiques sur la mer et cuisine fusion méditerranéenne-asiatique.",
            "se": "Finmåltid på Jumeirah Port Soller med panoramautsikt och medelhavs-asiatisk fusionkök.",
        },
        "image": "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Port de Sóller",
        "deal": {
            "en": "Sunset Dining: Terrace menu with sea view",
            "de": "Sonnenuntergangs-Dinner: Terrassenmenü mit Meerblick",
            "fr": "Dîner Coucher de Soleil: Menu terrasse vue mer",
            "se": "Solnedgångsmiddag: Terrassmeny med havsutsikt",
        },
        "original_price": 120,
        "offer_price": 100,
        "discount_percent": 17,
        "contact_url": "https://www.jumeirah.com/esfanals",
    },
    {
        "id": "ona-beach-club",
        "name": "ONA Beach Club",
        "type": "restaurant",
        "description": {
            "en": "Stylish beach club in Palma Nova with Mediterranean cuisine, DJ sets, and sunset cocktails.",
            "de": "Stilvoller Beachclub in Palma Nova mit mediterraner Küche, DJ-Sets und Sonnenuntergangs-Cocktails.",
            "fr": "Beach club élégant à Palma Nova avec cuisine méditerranéenne, DJ sets et cocktails au coucher du soleil.",
            "se": "Stilfull beachclub i Palma Nova med medelhavskök, DJ-sets och solnedgångscocktails.",
        },
        "image": "https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma Nova",
        "deal": {
            "en": "Golfer's Beach Day: Lunch + sunbed + drink",
            "de": "Golfer-Strandtag: Mittagessen + Sonnenliege + Getränk",
            "fr": "Journée Plage Golfeur: Déjeuner + transat + boisson",
            "se": "Golfarens stranddag: Lunch + solsäng + drink",
        },
        "original_price": 75,
        "offer_price": 60,
        "discount_percent": 20,
        "contact_url": "https://www.onabeachclub.com",
    },
    # ===== BEACH CLUBS (NEW CATEGORY) =====
    {
        "id": "purobeach-illetas",
        "name": "Purobeach Illetas",
        "type": "beach_club",
        "description": {
            "en": "Iconic beach club with infinity pool, wellness spa, and Mediterranean cuisine overlooking the sea.",
            "de": "Ikonischer Beachclub mit Infinity-Pool, Wellness-Spa und mediterraner Küche mit Meerblick.",
            "fr": "Beach club iconique avec piscine à débordement, spa bien-être et cuisine méditerranéenne vue mer.",
            "se": "Ikonisk beachclub med infinitypool, wellness-spa och medelhavskök med havsutsikt.",
        },
        "image": "https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Illetas",
        "full_address": "Passeig Illetes 58B, 07181 Illetas, Mallorca",
        "nearest_golf": "Real Golf de Bendinat",
        "distance_km": 3.2,
        "deal": {
            "en": "Golf & Beach: Day pass + lunch + cocktail",
            "de": "Golf & Strand: Tagespass + Mittagessen + Cocktail",
            "fr": "Golf & Plage: Pass journée + déjeuner + cocktail",
            "se": "Golf & Strand: Dagspass + lunch + cocktail",
        },
        "discount_percent": 20,
        "contact_url": "https://www.purobeach.com/illetas",
    },
    {
        "id": "nikki-beach-mallorca",
        "name": "Nikki Beach Mallorca",
        "type": "beach_club",
        "description": {
            "en": "World-famous beach club brand with signature white decor, international DJs, and gourmet dining.",
            "de": "Weltberühmte Beachclub-Marke mit charakteristischem weißem Dekor, internationalen DJs und Gourmet-Küche.",
            "fr": "Marque de beach club mondialement connue avec décor blanc signature, DJs internationaux et gastronomie.",
            "se": "Världsberömt beachclub-märke med signatur vit dekor, internationella DJ:s och gourmetmat.",
        },
        "image": "https://images.pexels.com/photos/1450363/pexels-photo-1450363.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Calvià",
        "full_address": "Av. Notari Alemany 1, 07181 Calvià, Mallorca",
        "nearest_golf": "T Golf Calvià",
        "distance_km": 5.8,
        "deal": {
            "en": "VIP Experience: Premium sunbed + bottle service",
            "de": "VIP-Erlebnis: Premium-Sonnenliege + Flaschenservice",
            "fr": "Expérience VIP: Transat premium + service bouteille",
            "se": "VIP-upplevelse: Premium-solsäng + flaskservice",
        },
        "discount_percent": 15,
        "contact_url": "https://www.nikkibeach.com/mallorca",
    },
    {
        "id": "beso-beach-mallorca",
        "name": "Beso Beach Mallorca",
        "type": "beach_club",
        "description": {
            "en": "Bohemian-chic beach club with live music, organic cuisine, and laid-back Mediterranean vibes.",
            "de": "Bohemian-Chic-Beachclub mit Live-Musik, Bio-Küche und entspanntem mediterranem Ambiente.",
            "fr": "Beach club bohème-chic avec musique live, cuisine bio et ambiance méditerranéenne décontractée.",
            "se": "Bohem-chic beachclub med livemusik, ekologisk mat och avslappnad medelhavsstämning.",
        },
        "image": "https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Calvià",
        "full_address": "Carrer Duc Estremera 16, 07181 Calvià, Mallorca",
        "nearest_golf": "Real Golf de Bendinat",
        "distance_km": 3.5,
        "deal": {
            "en": "Sunset Session: Dinner + live music + drinks",
            "de": "Sonnenuntergangs-Session: Abendessen + Live-Musik + Getränke",
            "fr": "Session Coucher de Soleil: Dîner + musique live + boissons",
            "se": "Solnedgångssession: Middag + livemusik + drinkar",
        },
        "discount_percent": 18,
        "contact_url": "https://www.besobeach.com/mallorca",
    },
    {
        "id": "cap-falco-beach",
        "name": "Cap Falcó Beach",
        "type": "beach_club",
        "description": {
            "en": "Exclusive beach club on a private cove with premium service and Mediterranean seafood specialties.",
            "de": "Exklusiver Beachclub in einer privaten Bucht mit Premium-Service und mediterranen Meeresfrüchte-Spezialitäten.",
            "fr": "Beach club exclusif dans une crique privée avec service premium et spécialités de fruits de mer méditerranéens.",
            "se": "Exklusiv beachclub i en privat vik med premiumservice och medelhavs-skaldjursspecialiteter.",
        },
        "image": "https://images.pexels.com/photos/1488315/pexels-photo-1488315.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Calvià",
        "full_address": "Carrer de Cap Falcó 19, 07181 Calvià, Mallorca",
        "nearest_golf": "T Golf Calvià",
        "distance_km": 4.0,
        "deal": {
            "en": "Seafood Feast: Paella + cava + beach access",
            "de": "Meeresfrüchte-Fest: Paella + Cava + Strandzugang",
            "fr": "Festin Fruits de Mer: Paella + cava + accès plage",
            "se": "Skaldjursfest: Paella + cava + strandtillgång",
        },
        "discount_percent": 15,
        "contact_url": "https://www.capfalco.com",
    },
    {
        "id": "gran-folies-beach-club",
        "name": "Gran Folies Beach Club",
        "type": "beach_club",
        "description": {
            "en": "Stunning cliffside beach club in Port d'Andratx with dramatic views and refined Mediterranean cuisine.",
            "de": "Atemberaubender Klippenbeachclub in Port d'Andratx mit dramatischen Ausblicken und raffinierter mediterraner Küche.",
            "fr": "Magnifique beach club sur les falaises de Port d'Andratx avec vues spectaculaires et cuisine méditerranéenne raffinée.",
            "se": "Fantastisk klippbeachclub i Port d'Andratx med dramatisk utsikt och förfinad medelhavskök.",
        },
        "image": "https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Port d'Andratx",
        "full_address": "Calle Tintorera s/n, 07157 Port d'Andratx, Mallorca",
        "nearest_golf": "Golf de Andratx",
        "distance_km": 3.5,
        "deal": {
            "en": "Cliff Experience: Lunch + pool + cocktails",
            "de": "Klippen-Erlebnis: Mittagessen + Pool + Cocktails",
            "fr": "Expérience Falaise: Déjeuner + piscine + cocktails",
            "se": "Klippupplevelse: Lunch + pool + cocktails",
        },
        "discount_percent": 20,
        "contact_url": "https://www.granfolies.com",
    },
    {
        "id": "anima-beach-palma",
        "name": "Anima Beach Palma",
        "type": "beach_club",
        "description": {
            "en": "Urban beach club on Palma's waterfront with infinity pool, cocktail bar, and city skyline views.",
            "de": "Urbaner Beachclub an Palmas Uferpromenade mit Infinity-Pool, Cocktailbar und Blick auf die Skyline.",
            "fr": "Beach club urbain sur le front de mer de Palma avec piscine à débordement, bar à cocktails et vue sur la skyline.",
            "se": "Urban beachclub vid Palmas strandpromenad med infinitypool, cocktailbar och stadssilhuettutsikt.",
        },
        "image": "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Autovía del Levante s/n, 07006 Palma, Mallorca",
        "nearest_golf": "Golf Son Gual",
        "distance_km": 11.0,
        "deal": {
            "en": "City Beach Day: Pool access + lunch + drink",
            "de": "Stadt-Strandtag: Pool-Zugang + Mittagessen + Getränk",
            "fr": "Journée Plage Urbaine: Accès piscine + déjeuner + boisson",
            "se": "Stadsstranddag: Pooltillgång + lunch + drink",
        },
        "discount_percent": 18,
        "contact_url": "https://www.animabeach.com",
    },
    {
        "id": "mhares-sea-club",
        "name": "Mhares Sea Club",
        "type": "beach_club",
        "description": {
            "en": "Exclusive members' club with stunning natural pool carved into the rocks and gourmet gastronomy.",
            "de": "Exklusiver Mitgliederclub mit atemberaubendem natürlichem Pool in den Felsen und Gourmet-Gastronomie.",
            "fr": "Club membres exclusif avec piscine naturelle taillée dans la roche et gastronomie gourmet.",
            "se": "Exklusiv medlemsklubb med fantastisk naturlig pool huggen i klipporna och gourmetgastronomi.",
        },
        "image": "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Llucmajor",
        "full_address": "Carrer de l'Oronella s/n, 07609 Llucmajor, Mallorca",
        "nearest_golf": "Golf Maioris",
        "distance_km": 4.5,
        "deal": {
            "en": "Rock Pool Experience: Day pass + tasting menu",
            "de": "Felsen-Pool-Erlebnis: Tagespass + Degustationsmenü",
            "fr": "Expérience Piscine Naturelle: Pass journée + menu dégustation",
            "se": "Klipppool-upplevelse: Dagspass + provmeny",
        },
        "discount_percent": 15,
        "contact_url": "https://www.mharesseaclub.com",
    },
    {
        "id": "balneario-illetas",
        "name": "Balneario Illetas",
        "type": "beach_club",
        "description": {
            "en": "Historic beach club dating back to the 1950s with classic Mediterranean charm and fresh seafood.",
            "de": "Historischer Beachclub aus den 1950er Jahren mit klassischem mediterranem Charme und frischen Meeresfrüchten.",
            "fr": "Beach club historique datant des années 1950 avec charme méditerranéen classique et fruits de mer frais.",
            "se": "Historisk beachclub från 1950-talet med klassisk medelhavscharm och färska skaldjur.",
        },
        "image": "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Illetas",
        "full_address": "Passeig Illetes 52, 07181 Illetas, Mallorca",
        "nearest_golf": "Real Golf de Bendinat",
        "distance_km": 2.8,
        "deal": {
            "en": "Classic Beach Day: Sunbed + paella + sangria",
            "de": "Klassischer Strandtag: Sonnenliege + Paella + Sangria",
            "fr": "Journée Plage Classique: Transat + paella + sangria",
            "se": "Klassisk stranddag: Solsäng + paella + sangria",
        },
        "discount_percent": 15,
        "contact_url": "https://www.balnearioilletas.com",
    },
    {
        "id": "ponderosa-beach",
        "name": "Ponderosa Beach",
        "type": "beach_club",
        "description": {
            "en": "Bohemian beach bar on Playa de Muro with organic menu, yoga sessions, and barefoot luxury vibes.",
            "de": "Bohemian-Strandbar an der Playa de Muro mit Bio-Menü, Yoga-Sessions und Barfuß-Luxus-Atmosphäre.",
            "fr": "Bar de plage bohème à Playa de Muro avec menu bio, sessions yoga et ambiance luxe pieds nus.",
            "se": "Bohem-strandbar vid Playa de Muro med ekologisk meny, yogasessioner och barfotalyxstämning.",
        },
        "image": "https://images.pexels.com/photos/1450355/pexels-photo-1450355.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Playa de Muro",
        "full_address": "Casetes des Capellans 123, 07440 Playa de Muro, Mallorca",
        "nearest_golf": "Club de Golf Alcanada",
        "distance_km": 9.5,
        "deal": {
            "en": "Wellness & Golf: Yoga + brunch + golf transfer",
            "de": "Wellness & Golf: Yoga + Brunch + Golf-Transfer",
            "fr": "Bien-être & Golf: Yoga + brunch + transfert golf",
            "se": "Wellness & Golf: Yoga + brunch + golftransfer",
        },
        "discount_percent": 20,
        "contact_url": "https://www.ponderosabeach.com",
    },
    {
        "id": "assaona-gastrobeach",
        "name": "Assaona Gastrobeach",
        "type": "beach_club",
        "description": {
            "en": "Trendy gastro beach club in Portitxol with creative tapas, craft cocktails, and DJ sessions.",
            "de": "Trendiger Gastro-Beachclub in Portitxol mit kreativen Tapas, Craft-Cocktails und DJ-Sessions.",
            "fr": "Beach club gastro tendance à Portitxol avec tapas créatives, cocktails artisanaux et sessions DJ.",
            "se": "Trendig gastro-beachclub i Portitxol med kreativa tapas, hantverkscocktails och DJ-sessions.",
        },
        "image": "https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Passeig Portitxol s/n, 07006 Palma, Mallorca",
        "nearest_golf": "Golf Son Gual",
        "distance_km": 10.5,
        "deal": {
            "en": "Gastro Experience: Tasting menu + sunset cocktails",
            "de": "Gastro-Erlebnis: Degustationsmenü + Sonnenuntergangs-Cocktails",
            "fr": "Expérience Gastro: Menu dégustation + cocktails coucher de soleil",
            "se": "Gastro-upplevelse: Provmeny + solnedgångscocktails",
        },
        "discount_percent": 15,
        "contact_url": "https://www.assaona.com",
    },
    {
        "id": "patiki-beach",
        "name": "Patiki Beach",
        "type": "beach_club",
        "description": {
            "en": "Charming beach club on Repic Beach in Port de Sóller with fresh fish, local wines, and mountain views.",
            "de": "Charmanter Beachclub am Repic-Strand in Port de Sóller mit frischem Fisch, lokalen Weinen und Bergblick.",
            "fr": "Beach club charmant sur la plage Repic à Port de Sóller avec poisson frais, vins locaux et vue montagne.",
            "se": "Charmig beachclub på Repic-stranden i Port de Sóller med färsk fisk, lokala viner och bergsutsikt.",
        },
        "image": "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Port de Sóller",
        "full_address": "Repic Beach, 07108 Port de Sóller, Mallorca",
        "nearest_golf": "Golf Son Termes",
        "distance_km": 11.5,
        "deal": {
            "en": "Mountain & Sea: Fresh fish lunch + local wine",
            "de": "Berg & Meer: Frisches Fisch-Mittagessen + lokaler Wein",
            "fr": "Montagne & Mer: Déjeuner poisson frais + vin local",
            "se": "Berg & Hav: Färsk fisklunch + lokalt vin",
        },
        "discount_percent": 15,
        "contact_url": "https://www.patikibeach.com",
    },
    # ============================================
    # CAFÉS, BARS & BRUNCH PLACES
    # ============================================
    # Classic Institutions
    {
        "id": "can-joan-de-saigo",
        "name": "Ca'n Joan de S'aigo",
        "type": "cafe_bar",
        "category": "Classic Institution",
        "specialty": "Historic Ensaimadas & Almond Ice Cream",
        "rating": 4.6,
        "description": {
            "en": "Since 1700. The ultimate stop for traditional 'Cuartos' and thick hot chocolate.",
            "de": "Seit 1700. Der ultimative Stopp für traditionelle 'Cuartos' und dicke heiße Schokolade.",
            "fr": "Depuis 1700. L'arrêt ultime pour les 'Cuartos' traditionnels et le chocolat chaud épais.",
            "se": "Sedan 1700. Det ultimata stoppet för traditionella 'Cuartos' och tjock varm choklad.",
        },
        "image": "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma (Old Town)",
        "full_address": "Carrer de Can Sanç, 10, 07001 Palma, Mallorca",
        "hours": "8:00 - 21:00",
        "deal": {
            "en": "Golfer's Treat: Ensaimada + Hot Chocolate combo",
            "de": "Golfer-Genuss: Ensaimada + Heiße Schokolade Kombi",
            "fr": "Délice Golfeur: Combo Ensaimada + Chocolat Chaud",
            "se": "Golfarens njutning: Ensaimada + Varm choklad-kombo",
        },
        "discount_percent": 10,
        "contact_url": "https://www.canjoandesaigo.com",
    },
    {
        "id": "bar-bosch",
        "name": "Bar Bosch",
        "type": "cafe_bar",
        "category": "Classic Institution",
        "specialty": "The 'Langosta' Toasted Sandwich",
        "rating": 4.2,
        "description": {
            "en": "The most famous meeting point in Palma since 1936. Essential for a mid-shopping coffee.",
            "de": "Der berühmteste Treffpunkt in Palma seit 1936. Unverzichtbar für einen Kaffee beim Einkaufen.",
            "fr": "Le point de rencontre le plus célèbre de Palma depuis 1936. Essentiel pour un café shopping.",
            "se": "Palmas mest kända mötesplats sedan 1936. Perfekt för en shoppingpaus med kaffe.",
        },
        "image": "https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma (Center)",
        "full_address": "Pl. del Rei Joan Carles I, 6, 07012 Palma, Mallorca",
        "hours": "7:30 - 22:00",
        "deal": {
            "en": "Classic Break: Langosta sandwich + coffee",
            "de": "Klassische Pause: Langosta-Sandwich + Kaffee",
            "fr": "Pause Classique: Sandwich Langosta + café",
            "se": "Klassisk paus: Langosta-macka + kaffe",
        },
        "discount_percent": 10,
        "contact_url": "https://barbosch.es",
    },
    {
        "id": "can-molinas",
        "name": "Ca'n Molinas",
        "type": "cafe_bar",
        "category": "Mountain Bakery",
        "specialty": "Potato Coques (Coca de Patata)",
        "rating": 4.5,
        "description": {
            "en": "An essential mountain bakery. People travel across the island specifically for their fluffy potato buns.",
            "de": "Eine unverzichtbare Bergbäckerei. Menschen reisen über die ganze Insel speziell für ihre fluffigen Kartoffelbrötchen.",
            "fr": "Une boulangerie de montagne essentielle. Les gens traversent l'île spécialement pour leurs petits pains moelleux.",
            "se": "Ett oumbärligt bergsbageri. Människor reser över hela ön specifikt för deras fluffiga potatisbullar.",
        },
        "image": "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Valldemossa",
        "full_address": "Via Blanquerna, 15, 07170 Valldemossa, Mallorca",
        "hours": "8:00 - 20:00",
        "deal": {
            "en": "Mountain Golfer: Coca de Patata + fresh orange juice",
            "de": "Berg-Golfer: Coca de Patata + frischer Orangensaft",
            "fr": "Golfeur Montagne: Coca de Patata + jus d'orange frais",
            "se": "Berggolfaren: Coca de Patata + färskpressad apelsinjuice",
        },
        "discount_percent": 10,
        "contact_url": "https://canmolinas.com",
    },
    # Coffee & Bakeries
    {
        "id": "uco-bakery",
        "name": "UCO Bakery",
        "type": "cafe_bar",
        "category": "Artisan Bakery",
        "specialty": "Sourdough Excellence & Cinnamon Rolls",
        "rating": 4.9,
        "description": {
            "en": "The new gold standard for artisan baking. High-end, minimalist, and incredibly high quality.",
            "de": "Der neue Goldstandard für handwerkliches Backen. High-End, minimalistisch und unglaublich hochwertig.",
            "fr": "Le nouveau standard d'or de la boulangerie artisanale. Haut de gamme, minimaliste et de très haute qualité.",
            "se": "Den nya guldstandarden för hantverksbageri. Exklusivt, minimalistiskt och otroligt högkvalitativt.",
        },
        "image": "https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de Berenguer de Sant Joan, 1, 07012 Palma, Mallorca",
        "hours": "8:00 - 15:00",
        "deal": {
            "en": "Golfer's Fuel: Sourdough toast + specialty coffee",
            "de": "Golfer-Energie: Sauerteig-Toast + Spezialitätenkaffee",
            "fr": "Carburant Golfeur: Toast au levain + café de spécialité",
            "se": "Golfarens bränsle: Surdegrost + specialkaffe",
        },
        "discount_percent": 10,
        "contact_url": "https://ucobakery.com",
    },
    {
        "id": "sa-mola-13",
        "name": "Sa Mola 13",
        "type": "cafe_bar",
        "category": "Specialty Coffee",
        "specialty": "Third-Wave Coffee in the Heart of the Island",
        "rating": 4.8,
        "description": {
            "en": "A cyclist and local favorite. Bringing third-wave coffee culture to the traditional center of Mallorca.",
            "de": "Ein Favorit bei Radfahrern und Einheimischen. Third-Wave-Kaffeekultur im traditionellen Zentrum Mallorcas.",
            "fr": "Un favori des cyclistes et des locaux. La culture café third-wave au cœur traditionnel de Majorque.",
            "se": "En favorit bland cyklister och lokalbefolkning. Third-wave-kaffekultur i Mallorcas traditionella centrum.",
        },
        "image": "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Sineu (Interior)",
        "full_address": "Calle Santa Margalida, 1, 07510 Sineu, Mallorca",
        "hours": "8:30 - 17:00",
        "deal": {
            "en": "Cyclist & Golfer: Flat white + homemade pastry",
            "de": "Radfahrer & Golfer: Flat White + hausgemachtes Gebäck",
            "fr": "Cycliste & Golfeur: Flat white + pâtisserie maison",
            "se": "Cyklist & Golfare: Flat white + hembakat bakverk",
        },
        "discount_percent": 10,
        "contact_url": "https://samola13.com",
    },
    {
        "id": "rosevelvet-eatery",
        "name": "Rosevelvet Eatery",
        "type": "cafe_bar",
        "category": "Café & Bakery",
        "specialty": "Specialty Coffee & Artisan Cakes",
        "rating": 4.7,
        "description": {
            "en": "A cozy, chic bakery famous for its Red Velvet and expertly brewed espresso.",
            "de": "Eine gemütliche, schicke Bäckerei, berühmt für ihren Red Velvet und meisterhaft gebrühten Espresso.",
            "fr": "Une boulangerie chic et cosy célèbre pour son Red Velvet et son espresso expertement préparé.",
            "se": "Ett mysigt, chict bageri känt för sin Red Velvet och mästerligt bryggd espresso.",
        },
        "image": "https://images.pexels.com/photos/776538/pexels-photo-776538.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de la Missió, 15, 07003 Palma, Mallorca",
        "hours": "9:00 - 18:00",
        "deal": {
            "en": "Sweet Golfer: Cake slice + latte",
            "de": "Süßer Golfer: Kuchenstück + Latte",
            "fr": "Golfeur Sucré: Part de gâteau + latte",
            "se": "Söt Golfare: Tårtbit + latte",
        },
        "discount_percent": 10,
        "contact_url": "https://rosevelvet.com",
    },
    # Brunch Spots
    {
        "id": "el-perrito",
        "name": "El Perrito",
        "type": "cafe_bar",
        "category": "Brunch Spot",
        "specialty": "Best Neighborhood Brunch Vibe",
        "rating": 4.7,
        "description": {
            "en": "A Santa Catalina icon. Famous for its llonguets, friendly service, and consistent quality.",
            "de": "Eine Ikone in Santa Catalina. Berühmt für seine Llonguets, freundlichen Service und konstante Qualität.",
            "fr": "Une icône de Santa Catalina. Célèbre pour ses llonguets, son service amical et sa qualité constante.",
            "se": "En Santa Catalina-ikon. Känd för sina llonguets, vänlig service och konstant kvalitet.",
        },
        "image": "https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Santa Catalina",
        "full_address": "Carrer d'Anníbal, 20, 07013 Palma, Mallorca",
        "hours": "8:00 - 16:00",
        "deal": {
            "en": "Brunch & Golf: Full brunch + coffee",
            "de": "Brunch & Golf: Voller Brunch + Kaffee",
            "fr": "Brunch & Golf: Brunch complet + café",
            "se": "Brunch & Golf: Full brunch + kaffe",
        },
        "discount_percent": 15,
        "contact_url": "http://elperrito.es",
    },
    {
        "id": "mama-carmens",
        "name": "Mama Carmen's",
        "type": "cafe_bar",
        "category": "Brunch Spot",
        "specialty": "Healthy, Vegan-friendly & Creative Lattes",
        "rating": 4.6,
        "description": {
            "en": "Eco-conscious and bohemian. Known for their avocado toasts and colorful healthy bowls.",
            "de": "Umweltbewusst und bohemisch. Bekannt für Avocado-Toasts und bunte gesunde Bowls.",
            "fr": "Éco-conscient et bohème. Connu pour ses toasts à l'avocat et ses bols healthy colorés.",
            "se": "Miljömedvetet och bohemiskt. Känt för sina avokadotoasts och färgglada hälsosamma bowls.",
        },
        "image": "https://images.pexels.com/photos/914388/pexels-photo-914388.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Santa Catalina",
        "full_address": "Carrer de Cervantes, 21, 07013 Palma, Mallorca",
        "hours": "9:00 - 17:00",
        "deal": {
            "en": "Healthy Golfer: Acai bowl + fresh juice",
            "de": "Gesunder Golfer: Acai-Bowl + frischer Saft",
            "fr": "Golfeur Healthy: Bol d'açaï + jus frais",
            "se": "Hälsosam Golfare: Acai-bowl + färsk juice",
        },
        "discount_percent": 10,
        "contact_url": "https://mamacarmens.com",
    },
    {
        "id": "nama-deia",
        "name": "Nama Deià",
        "type": "cafe_bar",
        "category": "Brunch Spot",
        "specialty": "Asian-fusion Brunch with Views",
        "rating": 4.5,
        "description": {
            "en": "Stunning views over the Tramuntana mountains. Famous for its fresh, organic ingredients.",
            "de": "Atemberaubende Aussicht auf die Tramuntana-Berge. Berühmt für frische, biologische Zutaten.",
            "fr": "Vues imprenables sur les montagnes de Tramuntana. Célèbre pour ses ingrédients frais et bio.",
            "se": "Fantastisk utsikt över Tramuntana-bergen. Känt för sina färska, ekologiska ingredienser.",
        },
        "image": "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Deià",
        "full_address": "Carrer Archiduc Luís Salvador, 24, 07179 Deià, Mallorca",
        "hours": "10:00 - 17:00",
        "deal": {
            "en": "Mountain Brunch: Signature bowl + mountain tea",
            "de": "Berg-Brunch: Signature-Bowl + Bergtee",
            "fr": "Brunch Montagne: Bol signature + thé de montagne",
            "se": "Bergsbrunch: Signatur-bowl + bergste",
        },
        "discount_percent": 10,
        "contact_url": "https://namadeia.com",
    },
    # Vermuterias & Cocktail Bars
    {
        "id": "la-rosa-vermuteria",
        "name": "La Rosa Vermutería",
        "type": "cafe_bar",
        "category": "Vermutería",
        "specialty": "Vermouth on Tap & Gilda Tapas",
        "rating": 4.5,
        "description": {
            "en": "The peak of Palma's vermouth revival. High energy, vintage decor, and top-tier tinned seafood.",
            "de": "Der Höhepunkt von Palmas Wermut-Revival. Hohe Energie, Vintage-Dekor und erstklassige Dosenmeeresfrüchte.",
            "fr": "L'apogée du renouveau du vermouth à Palma. Haute énergie, déco vintage et conserves de fruits de mer haut de gamme.",
            "se": "Höjdpunkten av Palmas vermouth-revival. Hög energi, vintage-inredning och förstklassiga konserverade skaldjur.",
        },
        "image": "https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de la Rosa, 5, 07003 Palma, Mallorca",
        "hours": "12:00 - 00:00",
        "deal": {
            "en": "19th Hole: Vermouth + Gilda + olives",
            "de": "19. Loch: Wermut + Gilda + Oliven",
            "fr": "19ème Trou: Vermouth + Gilda + olives",
            "se": "19:e hålet: Vermouth + Gilda + oliver",
        },
        "discount_percent": 10,
        "contact_url": "https://larosavermuteria.com",
    },
    {
        "id": "brassclub",
        "name": "Brassclub",
        "type": "cafe_bar",
        "category": "Cocktail Bar",
        "specialty": "Award-winning Mixology",
        "rating": 4.7,
        "description": {
            "en": "Rafa Martín's flagship. The most creative and technical cocktails on the island.",
            "de": "Rafa Martíns Flaggschiff. Die kreativsten und technischsten Cocktails der Insel.",
            "fr": "Le flagship de Rafa Martín. Les cocktails les plus créatifs et techniques de l'île.",
            "se": "Rafa Martíns flaggskepp. De mest kreativa och tekniska cocktailarna på ön.",
        },
        "image": "https://images.pexels.com/photos/1309583/pexels-photo-1309583.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Passeig de Mallorca, 34, 07012 Palma, Mallorca",
        "hours": "19:00 - 02:00",
        "deal": {
            "en": "Golfer's Signature: 2 cocktails + premium snacks",
            "de": "Golfer-Signature: 2 Cocktails + Premium-Snacks",
            "fr": "Signature Golfeur: 2 cocktails + snacks premium",
            "se": "Golfarens Signatur: 2 cocktails + premiumsnacks",
        },
        "discount_percent": 15,
        "contact_url": "https://brassclub.com",
    },
    {
        "id": "chiringuito-blue",
        "name": "Chiringuito Blue",
        "type": "cafe_bar",
        "category": "Beach Bar",
        "specialty": "Beachside Cocktails",
        "rating": 4.3,
        "description": {
            "en": "Sophisticated beach club vibes with premium cocktail menus and Mediterranean sunsets.",
            "de": "Anspruchsvolle Beach-Club-Atmosphäre mit Premium-Cocktailkarten und mediterranen Sonnenuntergängen.",
            "fr": "Ambiance beach club sophistiquée avec menus cocktails premium et couchers de soleil méditerranéens.",
            "se": "Sofistikerad beach club-känsla med premium-cocktailmenyer och medelhavets solnedgångar.",
        },
        "image": "https://images.pexels.com/photos/1322184/pexels-photo-1322184.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palmanova",
        "full_address": "Passeig Marítim, 07181 Palmanova, Mallorca",
        "hours": "10:00 - 01:00",
        "deal": {
            "en": "Sunset Session: 2 cocktails + sunbed",
            "de": "Sonnenuntergangs-Session: 2 Cocktails + Sonnenliege",
            "fr": "Session Coucher de Soleil: 2 cocktails + transat",
            "se": "Solnedgångssession: 2 cocktails + solsäng",
        },
        "discount_percent": 15,
        "contact_url": "https://chiringuitoblue.com",
    },
    # Wine Bars & Tapas Clubs
    {
        "id": "tast-club",
        "name": "Tast Club",
        "type": "cafe_bar",
        "category": "Wine Bar",
        "specialty": "Speakeasy Feel & Beef Wellington",
        "rating": 4.6,
        "description": {
            "en": "No sign on the door. Hidden, upscale dining with an incredible wine list and British-club aesthetics.",
            "de": "Kein Schild an der Tür. Verstecktes, gehobenes Dining mit unglaublicher Weinkarte und britischem Club-Ambiente.",
            "fr": "Pas d'enseigne sur la porte. Restauration haut de gamme cachée avec carte des vins incroyable et esthétique club britannique.",
            "se": "Ingen skylt på dörren. Dolt, exklusivt matställe med otrolig vinlista och brittisk klubb-estetik.",
        },
        "image": "https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de Sant Jaume, 6, 07012 Palma, Mallorca",
        "hours": "19:30 - 00:00",
        "deal": {
            "en": "Golfer's Evening: Wine flight + tapas selection",
            "de": "Golfer-Abend: Weinprobe + Tapas-Auswahl",
            "fr": "Soirée Golfeur: Dégustation de vins + sélection tapas",
            "se": "Golfarens kväll: Vinprovning + tapasurval",
        },
        "discount_percent": 10,
        "contact_url": "https://tast.com",
    },
    {
        "id": "bar-la-sang",
        "name": "Bar La Sang",
        "type": "cafe_bar",
        "category": "Natural Wine Bar",
        "specialty": "Natural Wine & Vinyl",
        "rating": 4.8,
        "description": {
            "en": "The destination for low-intervention wine lovers. Very cool, young, and knowledgeable staff.",
            "de": "Das Ziel für Liebhaber von Low-Intervention-Weinen. Sehr cooles, junges und sachkundiges Personal.",
            "fr": "La destination pour les amateurs de vins naturels. Personnel très cool, jeune et compétent.",
            "se": "Destinationen för älskare av naturvin. Väldigt cool, ung och kunnig personal.",
        },
        "image": "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de l'Anunciada, 1, 07001 Palma, Mallorca",
        "hours": "18:00 - 01:00",
        "deal": {
            "en": "Wine Discovery: 3 natural wines + cheese board",
            "de": "Wein-Entdeckung: 3 Naturweine + Käseplatte",
            "fr": "Découverte Vin: 3 vins naturels + plateau de fromages",
            "se": "Vinupptäckt: 3 naturviner + ostbricka",
        },
        "discount_percent": 10,
        "contact_url": "https://barlasang.com",
    },
    {
        "id": "bodega-santa-clara",
        "name": "Bodega Santa Clara",
        "type": "cafe_bar",
        "category": "Wine Bar",
        "specialty": "Local Wines & North Island Charm",
        "rating": 4.6,
        "description": {
            "en": "A cozy spot in the north to discover Mallorcan varietals in a traditional stone-walled setting.",
            "de": "Ein gemütlicher Ort im Norden, um mallorquinische Rebsorten in traditionellem Steinmauer-Ambiente zu entdecken.",
            "fr": "Un endroit cosy dans le nord pour découvrir les cépages majorquins dans un cadre traditionnel en pierre.",
            "se": "En mysig plats i norr för att upptäcka mallorkinsk druvsort i traditionell stenmursmiljö.",
        },
        "image": "https://images.pexels.com/photos/1322184/pexels-photo-1322184.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Pollensa",
        "full_address": "Carrer de la Santa Creu, 2, 07460 Pollensa, Mallorca",
        "hours": "17:00 - 23:00",
        "deal": {
            "en": "North Golf: Local wine tasting + Mallorcan tapas",
            "de": "Nord-Golf: Lokale Weinprobe + mallorquinische Tapas",
            "fr": "Golf Nord: Dégustation de vins locaux + tapas majorquins",
            "se": "Nordgolf: Lokal vinprovning + mallorkinsk tapas",
        },
        "discount_percent": 10,
        "contact_url": "http://bodegasantaclara.com",
    },
    # Cocktail Bars & Nightlife
    {
        "id": "ginbo",
        "name": "Ginbo",
        "type": "cafe_bar",
        "category": "Cocktail Bar",
        "specialty": "Gin & Tonics (Over 100 varieties)",
        "description": {
            "en": "Sophisticated and knowledgeable, award-winning mixology with over 100 gin varieties.",
            "de": "Anspruchsvoll und sachkundig, preisgekrönte Mixologie mit über 100 Gin-Sorten.",
            "fr": "Sophistiqué et compétent, mixologie primée avec plus de 100 variétés de gin.",
            "se": "Sofistikerad och kunnig, prisbelönt mixologi med över 100 gin-sorter.",
        },
        "image": "https://images.pexels.com/photos/1267244/pexels-photo-1267244.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Passeig de Mallorca, 14A, 07012 Palma, Mallorca",
        "hours": "18:00 - 02:00",
        "deal": {
            "en": "Golfer's G&T: Premium gin tonic + tapas",
            "de": "Golfer G&T: Premium Gin Tonic + Tapas",
            "fr": "G&T Golfeur: Gin tonic premium + tapas",
            "se": "Golfarens G&T: Premium gin tonic + tapas",
        },
        "discount_percent": 10,
        "contact_url": "https://ginbo.es",
    },
    {
        "id": "chapeau-chapo",
        "name": "Chapeau (Chapo)",
        "type": "cafe_bar",
        "category": "Speakeasy",
        "specialty": "Bespoke Cocktails & Whiskey",
        "description": {
            "en": "1920s American prohibition style, intimate and dim-lit speakeasy with bespoke cocktails.",
            "de": "Amerikanischer Prohibitionsstil der 1920er, intimes und schummriges Speakeasy mit maßgeschneiderten Cocktails.",
            "fr": "Style prohibition américain des années 1920, speakeasy intime et tamisé avec cocktails sur mesure.",
            "se": "1920-talets amerikanska förbudsstil, intim och dunkelt upplyst speakeasy med skräddarsydda cocktails.",
        },
        "image": "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Passeig de Mallorca, 24, 07012 Palma, Mallorca",
        "hours": "20:00 - 03:00",
        "deal": {
            "en": "Secret Society: Bespoke cocktail + whiskey tasting",
            "de": "Geheime Gesellschaft: Maßgeschneiderter Cocktail + Whiskey-Verkostung",
            "fr": "Société Secrète: Cocktail sur mesure + dégustation whiskey",
            "se": "Hemligt Sällskap: Skräddarsydd cocktail + whiskyprovning",
        },
        "discount_percent": 15,
        "contact_url": "https://chapeau.es",
    },
    {
        "id": "agabar",
        "name": "Agabar",
        "type": "cafe_bar",
        "category": "Agave Bar",
        "specialty": "Tequila & Mezcal",
        "description": {
            "en": "Vibrant Mexican-inspired energy in the heart of Santa Catalina's culinary district.",
            "de": "Lebhafte mexikanisch inspirierte Energie im Herzen des kulinarischen Viertels von Santa Catalina.",
            "fr": "Énergie vibrante d'inspiration mexicaine au cœur du quartier culinaire de Santa Catalina.",
            "se": "Livlig mexikanskinspirerad energi i hjärtat av Santa Catalinas kulinariska kvarter.",
        },
        "image": "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Santa Catalina",
        "full_address": "Santa Catalina, 07013 Palma, Mallorca",
        "hours": "18:00 - 02:00",
        "deal": {
            "en": "Agave Flight: 3 mezcals + Mexican bites",
            "de": "Agave-Flug: 3 Mezcals + mexikanische Häppchen",
            "fr": "Vol d'Agave: 3 mezcals + bouchées mexicaines",
            "se": "Agave-flygning: 3 mezcals + mexikanska tilltugg",
        },
        "discount_percent": 10,
        "contact_url": "https://agabar.es",
    },
    # Nightclubs
    {
        "id": "bcm-mallorca",
        "name": "BCM Mallorca",
        "type": "cafe_bar",
        "category": "Mega Club",
        "specialty": "EDM, House & Global Superstar DJs",
        "description": {
            "en": "The biggest and most famous club on the island; hosts global superstar DJs.",
            "de": "Der größte und berühmteste Club der Insel; beherbergt globale Superstar-DJs.",
            "fr": "Le club le plus grand et le plus célèbre de l'île; accueille des DJ superstars mondiaux.",
            "se": "Öns största och mest kända klubb; har globala superstjärne-DJs.",
        },
        "image": "https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Magaluf",
        "full_address": "Avinguda de l'Olivera, 07181 Magaluf, Mallorca",
        "hours": "23:00 - 06:00",
        "deal": {
            "en": "VIP Golfer: Skip the line + first drink free",
            "de": "VIP Golfer: Ohne Anstehen + erstes Getränk gratis",
            "fr": "VIP Golfeur: Coupe-file + premier verre offert",
            "se": "VIP Golfare: Gå förbi kön + första drinken gratis",
        },
        "discount_percent": 20,
        "contact_url": "https://bcmmallorca.com",
    },
    {
        "id": "social-club",
        "name": "Social Club",
        "type": "cafe_bar",
        "category": "Rooftop Club",
        "specialty": "House, Techno & R&B",
        "description": {
            "en": "High-end rooftop club with an infinity pool and stunning city views over Palma.",
            "de": "High-End Rooftop-Club mit Infinity-Pool und atemberaubendem Blick über Palma.",
            "fr": "Club rooftop haut de gamme avec piscine à débordement et vues imprenables sur Palma.",
            "se": "Exklusiv takbarklubb med infinity-pool och fantastisk utsikt över Palma.",
        },
        "image": "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Paseo Marítimo, Palma",
        "full_address": "Paseo Marítimo, 07014 Palma, Mallorca",
        "hours": "22:00 - 05:00",
        "deal": {
            "en": "Sunset Session: Rooftop access + 2 cocktails",
            "de": "Sonnenuntergangs-Session: Rooftop-Zugang + 2 Cocktails",
            "fr": "Session Coucher de Soleil: Accès rooftop + 2 cocktails",
            "se": "Solnedgångssession: Takterrassåtkomst + 2 cocktails",
        },
        "discount_percent": 15,
        "contact_url": "https://socialclubpalma.com",
    },
    {
        "id": "lio-mallorca",
        "name": "Lio Mallorca",
        "type": "cafe_bar",
        "category": "Cabaret & Club",
        "specialty": "Disco & Vocal House",
        "description": {
            "en": "A luxury dinner-show experience that transitions into a high-energy nightclub.",
            "de": "Ein luxuriöses Dinner-Show-Erlebnis, das in einen energiegeladenen Nachtclub übergeht.",
            "fr": "Une expérience dîner-spectacle de luxe qui se transforme en boîte de nuit haute énergie.",
            "se": "En lyxig middag-show-upplevelse som övergår till en energifylld nattklubb.",
        },
        "image": "https://images.pexels.com/photos/2114365/pexels-photo-2114365.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Paseo Marítimo, Palma",
        "full_address": "Paseo Marítimo (Old Tito's site), 07014 Palma, Mallorca",
        "hours": "20:00 - 05:00",
        "deal": {
            "en": "Dinner & Show: Table reservation + welcome champagne",
            "de": "Dinner & Show: Tischreservierung + Willkommens-Champagner",
            "fr": "Dîner & Spectacle: Réservation table + champagne de bienvenue",
            "se": "Middag & Show: Bordsreservation + välkomstchampagne",
        },
        "discount_percent": 10,
        "contact_url": "https://liomallorca.com",
    },
    {
        "id": "selva-club",
        "name": "Selva Club",
        "type": "cafe_bar",
        "category": "Underground Club",
        "specialty": "Pure Techno & House",
        "description": {
            "en": "The destination for serious electronic music heads and cutting-edge lineups.",
            "de": "Das Ziel für ernsthafte Fans elektronischer Musik und hochmoderne Line-ups.",
            "fr": "La destination pour les vrais amateurs de musique électronique et les line-ups avant-gardistes.",
            "se": "Destinationen för seriösa elektronisk musik-entusiaster och banbrytande line-ups.",
        },
        "image": "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Palma, Mallorca",
        "hours": "00:00 - 07:00",
        "deal": {
            "en": "Underground Pass: Early entry + drink token",
            "de": "Underground-Pass: Früher Eintritt + Getränke-Token",
            "fr": "Pass Underground: Entrée anticipée + jeton boisson",
            "se": "Underground-pass: Tidig entré + dryckespolletter",
        },
        "discount_percent": 15,
        "contact_url": "https://selvaclub.com",
    },
    # New bars from full island list
    {
        "id": "abaco",
        "name": "Abaco",
        "type": "cafe_bar",
        "category": "Historic Bar",
        "specialty": "Baroque Palace with Fruit & Flower Decor",
        "description": {
            "en": "Theatrical and historic baroque palace bar with stunning fruit and flower decorations in La Lonja.",
            "de": "Theatralische und historische Barockpalast-Bar mit atemberaubenden Obst- und Blumendekorationen in La Lonja.",
            "fr": "Bar palatial baroque théâtral et historique avec des décorations de fruits et fleurs époustouflantes à La Lonja.",
            "se": "Teatralisk och historisk barockpalatsbar med fantastiska frukt- och blomsterdekorationer i La Lonja.",
        },
        "image": "https://images.pexels.com/photos/929137/pexels-photo-929137.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "La Lonja, Palma",
        "full_address": "La Lonja, 07012 Palma, Mallorca",
        "hours": "20:00 - 02:00",
        "deal": {
            "en": "Palace Experience: Signature cocktail in baroque setting",
            "de": "Palast-Erlebnis: Signature-Cocktail im Barock-Ambiente",
            "fr": "Expérience Palais: Cocktail signature dans un cadre baroque",
            "se": "Palatsupplevelse: Signaturcocktail i barockmiljö",
        },
        "discount_percent": 10,
        "contact_url": "https://abaco.es",
    },
    {
        "id": "amok-mallorca",
        "name": "Amok",
        "type": "cafe_bar",
        "category": "Club & Terrace",
        "specialty": "The Island Paradox - Day Vibes & Club Nights",
        "description": {
            "en": "Mallorca's best kept secret. Music, terrace, club - a community that connects in a space that defies the ordinary.",
            "de": "Mallorcas bestgehütetes Geheimnis. Musik, Terrasse, Club - eine Community, die sich in einem außergewöhnlichen Raum verbindet.",
            "fr": "Le secret le mieux gardé de Majorque. Musique, terrasse, club - une communauté qui se connecte dans un espace hors du commun.",
            "se": "Mallorcas bäst bevarade hemlighet. Musik, terrass, klubb - en gemenskap som förbinder i ett rum som trotsar det vanliga.",
        },
        "image": "https://images.pexels.com/photos/3566120/pexels-photo-3566120.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Palma, Mallorca",
        "hours": "Sunset - Late",
        "deal": {
            "en": "Golfer's Paradise: VIP access + welcome drink",
            "de": "Golfer-Paradies: VIP-Zugang + Willkommensdrink",
            "fr": "Paradis du Golfeur: Accès VIP + verre de bienvenue",
            "se": "Golfarens Paradis: VIP-tillgång + välkomstdrink",
        },
        "discount_percent": 15,
        "contact_url": "https://amokmallorca.com",
    },
    # North - Alcudia & Pollensa
    {
        "id": "vogue-lounge",
        "name": "Vogue Lounge",
        "type": "cafe_bar",
        "category": "Waterfront Bar",
        "specialty": "Waterfront Cocktails",
        "description": {
            "en": "Chic and relaxed waterfront cocktails in Port d'Alcudia with stunning harbor views.",
            "de": "Schicke und entspannte Cocktails am Wasser in Port d'Alcudia mit atemberaubendem Hafenblick.",
            "fr": "Cocktails chics et détendus au bord de l'eau à Port d'Alcudia avec vue imprenable sur le port.",
            "se": "Chica och avslappnade cocktails vid vattnet i Port d'Alcudia med fantastisk hamnutsikt.",
        },
        "image": "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Port d'Alcudia",
        "full_address": "Port d'Alcudia, 07400 Alcudia, Mallorca",
        "hours": "17:00 - 01:00",
        "deal": {
            "en": "Sunset Hour: 2 cocktails at waterfront",
            "de": "Sonnenuntergangs-Stunde: 2 Cocktails am Wasser",
            "fr": "Heure du Coucher de Soleil: 2 cocktails au bord de l'eau",
            "se": "Solnedgångstimme: 2 cocktails vid vattnet",
        },
        "discount_percent": 10,
        "contact_url": "https://voguelounge.es",
    },
    {
        "id": "chivas-music-bar",
        "name": "Chivas Music Bar",
        "type": "cafe_bar",
        "category": "Music Bar",
        "specialty": "Classic Local Favorite",
        "description": {
            "en": "Lively and social classic local favorite in Port de Pollensa. The place for live music and good vibes.",
            "de": "Lebhafter und geselliger Klassiker in Port de Pollensa. Der Ort für Live-Musik und gute Stimmung.",
            "fr": "Classique local animé et convivial à Port de Pollensa. L'endroit pour la musique live et la bonne ambiance.",
            "se": "Livlig och social klassisk lokalfavorit i Port de Pollensa. Platsen för livemusik och bra stämning.",
        },
        "image": "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Port de Pollensa",
        "full_address": "Port de Pollensa, 07470 Pollensa, Mallorca",
        "hours": "19:00 - 03:00",
        "deal": {
            "en": "Live Night: Entry + drink during live music",
            "de": "Live-Nacht: Eintritt + Getränk während Live-Musik",
            "fr": "Nuit Live: Entrée + boisson pendant la musique live",
            "se": "Live-kväll: Entré + drink under livemusik",
        },
        "discount_percent": 10,
        "contact_url": "https://chivasmusicbar.com",
    },
    {
        "id": "banana-club",
        "name": "Banana Club",
        "type": "cafe_bar",
        "category": "Party Club",
        "specialty": "Latin, Reggaeton & EDM",
        "description": {
            "en": "Themed parties with Latin, Reggaeton and EDM in Alcudia. The party destination of the north.",
            "de": "Themenpartys mit Latin, Reggaeton und EDM in Alcudia. Das Party-Ziel des Nordens.",
            "fr": "Soirées à thème avec Latin, Reggaeton et EDM à Alcudia. La destination fête du nord.",
            "se": "Temafester med Latin, Reggaeton och EDM i Alcudia. Nordens festdestination.",
        },
        "image": "https://images.pexels.com/photos/2114365/pexels-photo-2114365.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Alcudia",
        "full_address": "Alcudia, 07400 Mallorca",
        "hours": "23:00 - 06:00",
        "deal": {
            "en": "Party Pass: Free entry before midnight + drink",
            "de": "Party-Pass: Freier Eintritt vor Mitternacht + Getränk",
            "fr": "Pass Fête: Entrée gratuite avant minuit + boisson",
            "se": "Festpass: Fri entré före midnatt + drink",
        },
        "discount_percent": 20,
        "contact_url": "https://bananaclub.es",
    },
    {
        "id": "menta-disco",
        "name": "Menta Disco",
        "type": "cafe_bar",
        "category": "Underground Club",
        "specialty": "Electronic Hits",
        "description": {
            "en": "Underground vibe with electronic hits in Alcudia. For those who seek authentic club culture.",
            "de": "Underground-Atmosphäre mit elektronischen Hits in Alcudia. Für alle, die authentische Club-Kultur suchen.",
            "fr": "Ambiance underground avec hits électroniques à Alcudia. Pour ceux qui recherchent une culture club authentique.",
            "se": "Undergroundkänsla med elektroniska hits i Alcudia. För dem som söker autentisk klubbkultur.",
        },
        "image": "https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Alcudia",
        "full_address": "Alcudia, 07400 Mallorca",
        "hours": "00:00 - 06:00",
        "deal": {
            "en": "Underground Pass: Early entry + drink token",
            "de": "Underground-Pass: Früher Eintritt + Getränke-Token",
            "fr": "Pass Underground: Entrée anticipée + jeton boisson",
            "se": "Undergroundpass: Tidig entré + drinkpollett",
        },
        "discount_percent": 15,
        "contact_url": "https://mentadisco.com",
    },
    # East - Cala d'Or & Cala Ratjada
    {
        "id": "lola-cala-dor",
        "name": "Lola",
        "type": "cafe_bar",
        "category": "Bohemian Bar",
        "specialty": "Eclectic Terrace & Sangria",
        "description": {
            "en": "Bohemian and fun eclectic terrace in Cala d'Or. Famous for amazing sangria and colorful atmosphere.",
            "de": "Bohemische und unterhaltsame eklektische Terrasse in Cala d'Or. Berühmt für erstaunliche Sangria und bunte Atmosphäre.",
            "fr": "Terrasse éclectique bohème et amusante à Cala d'Or. Célèbre pour son incroyable sangria et son atmosphère colorée.",
            "se": "Bohemisk och rolig eklektisk terrass i Cala d'Or. Känd för fantastisk sangria och färgglad atmosfär.",
        },
        "image": "https://images.pexels.com/photos/3009418/pexels-photo-3009418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Cala d'Or",
        "full_address": "Cala d'Or, 07660 Santanyí, Mallorca",
        "hours": "18:00 - 02:00",
        "deal": {
            "en": "Bohemian Night: Sangria pitcher + tapas",
            "de": "Bohemische Nacht: Sangria-Krug + Tapas",
            "fr": "Nuit Bohème: Pichet de sangria + tapas",
            "se": "Bohemisk kväll: Sangriakanna + tapas",
        },
        "discount_percent": 10,
        "contact_url": "https://lolacaladaor.com",
    },
    {
        "id": "quarterdeck",
        "name": "Quarterdeck",
        "type": "cafe_bar",
        "category": "Marina Bar",
        "specialty": "Yacht-filled Views",
        "description": {
            "en": "Nautical and upscale bar overlooking the yacht-filled marina of Cala d'Or.",
            "de": "Nautische und gehobene Bar mit Blick auf den yachtgefüllten Jachthafen von Cala d'Or.",
            "fr": "Bar nautique et haut de gamme surplombant la marina remplie de yachts de Cala d'Or.",
            "se": "Nautisk och exklusiv bar med utsikt över den yachtfyllda marinan i Cala d'Or.",
        },
        "image": "https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Cala d'Or Marina",
        "full_address": "Marina de Cala d'Or, 07660 Santanyí, Mallorca",
        "hours": "12:00 - 01:00",
        "deal": {
            "en": "Marina Sunset: Champagne + oysters with yacht views",
            "de": "Marina-Sonnenuntergang: Champagner + Austern mit Yachtblick",
            "fr": "Coucher de Soleil Marina: Champagne + huîtres avec vue sur les yachts",
            "se": "Marina-solnedgång: Champagne + ostron med yachtutsikt",
        },
        "discount_percent": 10,
        "contact_url": "https://quarterdeck.es",
    },
    {
        "id": "physical-disco",
        "name": "Physical Disco",
        "type": "cafe_bar",
        "category": "Iconic Club",
        "specialty": "Techno & House",
        "description": {
            "en": "The iconic east coast nightspot in Cala Ratjada. Legendary techno and house parties.",
            "de": "Der legendäre Nachtclub an der Ostküste in Cala Ratjada. Legendäre Techno- und House-Partys.",
            "fr": "Le lieu de nuit emblématique de la côte est à Cala Ratjada. Soirées techno et house légendaires.",
            "se": "Den ikoniska östkustnattklubben i Cala Ratjada. Legendariska techno- och housefester.",
        },
        "image": "https://images.pexels.com/photos/3566120/pexels-photo-3566120.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Cala Ratjada",
        "full_address": "Cala Ratjada, 07590 Capdepera, Mallorca",
        "hours": "23:00 - 06:00",
        "deal": {
            "en": "East Coast Legend: Skip the line + first drink",
            "de": "Ostküsten-Legende: Ohne Anstehen + erstes Getränk",
            "fr": "Légende de la Côte Est: Coupe-file + premier verre",
            "se": "Östkustlegend: Gå förbi kön + första drinken",
        },
        "discount_percent": 15,
        "contact_url": "https://physicaldisco.com",
    },
    {
        "id": "farahs",
        "name": "Farah's",
        "type": "cafe_bar",
        "category": "Hidden Gem Club",
        "specialty": "Commercial & Dance",
        "description": {
            "en": "A hidden gem in Cala d'Or with commercial and dance music. The locals' secret party spot.",
            "de": "Ein verstecktes Juwel in Cala d'Or mit kommerzieller und Dance-Musik. Der geheime Party-Ort der Einheimischen.",
            "fr": "Un joyau caché à Cala d'Or avec musique commerciale et dance. Le spot de fête secret des locaux.",
            "se": "En dold pärla i Cala d'Or med kommersiell och dancemusik. Lokalbefolkningens hemliga festställe.",
        },
        "image": "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Cala d'Or",
        "full_address": "Cala d'Or, 07660 Santanyí, Mallorca",
        "hours": "23:00 - 05:00",
        "deal": {
            "en": "Hidden Gem: VIP table + bottle",
            "de": "Verstecktes Juwel: VIP-Tisch + Flasche",
            "fr": "Joyau Caché: Table VIP + bouteille",
            "se": "Dold pärla: VIP-bord + flaska",
        },
        "discount_percent": 15,
        "contact_url": "https://farahs.es",
    },
    # West - Sóller & Deià
    {
        "id": "sa-punteta",
        "name": "Sa Punteta",
        "type": "cafe_bar",
        "category": "Clifftop Bar",
        "specialty": "Clifftop Sunsets",
        "description": {
            "en": "Rustic and natural clifftop bar in Cala Estellencs with the most spectacular sunset views on the island.",
            "de": "Rustikale und natürliche Klippenbar in Cala Estellencs mit den spektakulärsten Sonnenuntergangsaussichten der Insel.",
            "fr": "Bar rustique et naturel au sommet de la falaise à Cala Estellencs avec les vues de coucher de soleil les plus spectaculaires de l'île.",
            "se": "Rustik och naturlig klippbar i Cala Estellencs med öns mest spektakulära solnedgångsutsikt.",
        },
        "image": "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Cala Estellencs",
        "full_address": "Cala Estellencs, 07192 Estellencs, Mallorca",
        "hours": "12:00 - 22:00",
        "deal": {
            "en": "Clifftop Sunset: Wine + local cheese with views",
            "de": "Klippen-Sonnenuntergang: Wein + lokaler Käse mit Aussicht",
            "fr": "Coucher de Soleil Falaise: Vin + fromage local avec vue",
            "se": "Klippsolnedgång: Vin + lokal ost med utsikt",
        },
        "discount_percent": 10,
        "contact_url": "https://sapunteta.com",
    },
    {
        "id": "altamar",
        "name": "Altamar",
        "type": "cafe_bar",
        "category": "Open Air Club",
        "specialty": "Chill-out & Deep House",
        "description": {
            "en": "Open air venue in Port de Sóller with chill-out and deep house music. Perfect for sunset sessions.",
            "de": "Open-Air-Venue in Port de Sóller mit Chill-out und Deep-House-Musik. Perfekt für Sonnenuntergangs-Sessions.",
            "fr": "Lieu en plein air à Port de Sóller avec musique chill-out et deep house. Parfait pour les sessions coucher de soleil.",
            "se": "Utomhuslokal i Port de Sóller med chill-out och deep house-musik. Perfekt för solnedgångssessioner.",
        },
        "image": "https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Port de Sóller",
        "full_address": "Port de Sóller, 07108 Sóller, Mallorca",
        "hours": "18:00 - 03:00",
        "deal": {
            "en": "Sunset Chill: Cocktail + sunbed at golden hour",
            "de": "Sonnenuntergangs-Chill: Cocktail + Sonnenliege zur goldenen Stunde",
            "fr": "Chill Coucher de Soleil: Cocktail + transat à l'heure dorée",
            "se": "Solnedgångschill: Cocktail + solsäng vid gyllene timmen",
        },
        "discount_percent": 15,
        "contact_url": "https://altamar.es",
    },
    {
        "id": "es-fum",
        "name": "Es Fum",
        "type": "restaurant",
        "description": {
            "en": "Michelin-starred restaurant offering contemporary Mediterranean cuisine with Asian influences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit zeitgenössischer mediterraner Küche und asiatischen Einflüssen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne contemporaine aux influences asiatiques.",
            "se": "Michelinstjärnig restaurang med samtida medelhavskök med asiatiska influenser."
        },
        "image": "/api/static/images/es-fum.jpg",
        "location": "Costa d'en Blanes",
        "deal": {
            "en": "Golfer's Menu: 6-course tasting + wine pairing",
            "de": "Golfer-Menü: 6-Gänge-Degustationsmenü + Weinbegleitung",
            "fr": "Menu Golfeur: Dégustation 6 plats + accord mets-vins",
            "se": "Golfmeny: 6-rätters provning + vinmatchning"
        },
        "original_price": 180,
        "offer_price": 145,
        "discount_percent": 20,
        "contact_url": "https://www.stregismardavall.com/dining/es-fum"
    },
    {
        "id": "zaranda",
        "name": "Zaranda",
        "type": "restaurant",
        "description": {
            "en": "Two Michelin stars, blending Mallorcan tradition with avant-garde culinary techniques.",
            "de": "Zwei Michelin-Sterne, die mallorquinische Tradition mit avantgardistischen Kochtechniken verbinden.",
            "fr": "Deux étoiles Michelin, mêlant tradition majorquine et techniques culinaires d'avant-garde.",
            "se": "Två Michelinstjärnor, blandar mallorkinsk tradition med avantgardistiska kulinariska tekniker."
        },
        "image": "/api/static/images/zaranda.jpg",
        "location": "Es Capdellà",
        "deal": {
            "en": "After-Golf Special: Tasting menu 15% off",
            "de": "After-Golf Spezial: 15% Rabatt auf Degustationsmenü",
            "fr": "Spécial After-Golf: Menu dégustation -15%",
            "se": "After-Golf Special: Provmeny 15% rabatt"
        },
        "original_price": 220,
        "offer_price": 187,
        "discount_percent": 15,
        "contact_url": "https://www.zaranda.es"
    },
    {
        "id": "bens-den",
        "name": "Bens d'Avall",
        "type": "restaurant",
        "description": {
            "en": "Cliffside dining with panoramic sea views, specializing in fresh Mediterranean seafood.",
            "de": "Essen am Klippenrand mit Panorama-Meerblick, spezialisiert auf frische mediterrane Meeresfrüchte.",
            "fr": "Restaurant en bord de falaise avec vue panoramique sur la mer, spécialisé dans les fruits de mer méditerranéens frais.",
            "se": "Klippmiddag med panoramautsikt över havet, specialiserad på färska medelhavsskaldjur."
        },
        "image": "/api/static/images/bens-davall.jpg",
        "location": "Deià",
        "deal": {
            "en": "Sunset Menu: 4 courses + local wine",
            "de": "Sonnenuntergangs-Menü: 4 Gänge + lokaler Wein",
            "fr": "Menu Coucher de Soleil: 4 plats + vin local",
            "se": "Solnedgångsmeny: 4 rätter + lokalt vin"
        },
        "original_price": 95,
        "offer_price": 79,
        "discount_percent": 17,
        "contact_url": "https://www.bensdavall.com"
    }
,
    {
        "id": "voro-duplicate",
        "name": "Voro",
        "type": "restaurant",
        "michelin_stars": "⭐⭐ Michelin",
        "cuisine_type": "Located in Cap Vermell Grand Hotel - Two Michelin Stars",
        "municipality": "Capdepera",
        "description": {
            "en": "Two Michelin-starred excellence showcasing innovative Mediterranean cuisine in Capdepera.",
            "de": "Zwei-Michelin-Sterne-Exzellenz mit innovativer mediterraner Küche in Capdepera.",
            "fr": "Excellence deux étoiles Michelin proposant une cuisine méditerranéenne innovante à Capdepera.",
            "se": "Två Michelin-stjärnor med innovativ medelhavskök i Capdepera.",
        },
        "image": "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Capdepera",
        "full_address": "Ctra. Canyamel km 55.2, 07589 Capdepera, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/voro",
    },
    {
        "id": "marc-fosh",
        "name": "Marc Fosh",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "Located in Hotel Convent de la Missió - One Michelin Star",
        "municipality": "Palma",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de la Missió 7, 07003 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/marc-fosh",
    },
    {
        "id": "dins-santi-taura-duplicate",
        "name": "DINS Santi Taura",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "One Michelin Star",
        "municipality": "Palma",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Plaça de Llorenç Villalonga 4, 07001 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/dins-santi-taura",
    },
    {
        "id": "adrian-quetglas",
        "name": "Adrián Quetglas",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "One Michelin Star",
        "municipality": "Palma",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Passeig de Mallorca 20, 07012 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/adrian-quetglas",
    },
    {
        "id": "maca-de-castro",
        "name": "Maca de Castro",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "One Michelin Star",
        "municipality": "Alcúdia",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://macadecastro.com/wp-content/uploads/2024/04/image-1.png",
        "location": "Port d’Alcúdia",
        "full_address": "Carrer de Juno s/n, 07400 Port d’Alcúdia, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/maca-de-castro",
    },
    {
        "id": "bens-davall",
        "name": "Béns d’Avall",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "One Michelin Star",
        "municipality": "Sóller",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Sóller",
        "full_address": "Carretera Sóller–Deià km 56, 07100 Sóller, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/bens-davall",
    },
    {
        "id": "zaranda-palma",
        "name": "Zaranda",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "Located in Hotel Es Princep - One Michelin Star",
        "municipality": "Palma",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://andreugenestra.com/wp-content/uploads/2025/11/andreu-genestra-carrusel-21.jpg",
        "location": "Palma",
        "full_address": "Carrer de Bala Roja 1, 07001 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/zaranda",
    },
    {
        "id": "es-fum-calvia",
        "name": "Es Fum",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "Located in St. Regis Mardavall - One Michelin Star",
        "municipality": "Calvià",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://zaranda.es/wp-content/uploads/2025/12/cierre-temporada-esp-3.jpg",
        "location": "Costa d\'en Blanes",
        "full_address": "Ma-1 19, 07181 Costa d\'en Blanes, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/es-fum",
    },
    {
        "id": "sa-clastra",
        "name": "Sa Clastra",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "Located in Castell Son Claret - One Michelin Star",
        "municipality": "Puigpunyent",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://images.unsplash.com/photo-1508471349025-ca3e278cf5e2?w=800&h=600&fit=crop",
        "location": "Galilea",
        "full_address": "Carretera Es Capdellà km 1.7, 07196 Galilea, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/sa-clastra",
    },
    {
        "id": "andreu-genestra",
        "name": "Andreu Genestra",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "One Michelin Star",
        "municipality": "Llucmajor",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://images.unsplash.com/photo-1665684718390-e4c4f23b48fa?w=800&h=600&fit=crop",
        "location": "Llucmajor",
        "full_address": "Carretera Cala Pi km 5, 07639 Llucmajor, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/andreu-genestra",
    },
    {
        "id": "fusion19",
        "name": "Fusion19",
        "type": "restaurant",
        "michelin_stars": "⭐ Michelin",
        "cuisine_type": "One Michelin Star",
        "municipality": "Muro",
        "description": {
            "en": "Michelin-starred restaurant offering refined Mediterranean cuisine and exceptional golf dining experiences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit raffinierter mediterraner Küche und außergewöhnlichen Golf-Dining-Erlebnissen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne raffinée et des expériences culinaires de golf exceptionnelles.",
            "se": "Michelin-stjärnig restaurang med förfinad medelhavskök och exceptionella golf-matupplevelser.",
        },
        "image": "https://images.unsplash.com/photo-1765360773028-6affda725695?w=800&h=600&fit=crop",
        "location": "Playa de Muro",
        "full_address": "Avenida del Levante s/n, 07458 Playa de Muro, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/fusion19",
    },
    {
        "id": "de-tokio-a-lima",
        "name": "De Tokio a Lima",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Located in Can Alomar Hotel",
        "municipality": "Palma",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Palma.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Palma.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Palma.",
            "se": "Fin matupplevelse med samtida medelhavskök i Palma.",
        },
        "image": "https://images.unsplash.com/photo-1768697358705-c1b60333da35?w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de Sant Feliu 1, 07012 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/de-tokio-a-lima",
    },
    {
        "id": "el-camino",
        "name": "El Camino",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Spanish tapas bar",
        "municipality": "Palma",
        "description": {
            "en": "Contemporary Spanish tapas bar with creative small plates and vibrant atmosphere.",
            "de": "Zeitgenössische spanische Tapas-Bar mit kreativen kleinen Gerichten und lebendiger Atmosphäre.",
            "fr": "Bar à tapas espagnol contemporain avec des petites assiettes créatives et une atmosphère vibrante.",
            "se": "Samtida spansk tapasbar med kreativa smårätter och livlig atmosfär.",
        },
        "image": "https://images.unsplash.com/photo-1769773297747-bd00e31b33aa?w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de Can Brondo 4, 07001 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/el-camino",
    },
    {
        "id": "ca-na-toneta",
        "name": "Ca Na Toneta",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Traditional Mallorcan cuisine",
        "municipality": "Selva",
        "description": {
            "en": "Authentic traditional Mallorcan cuisine celebrating local flavors and heritage.",
            "de": "Authentische traditionelle mallorquinische Küche, die lokale Aromen und Erbe feiert.",
            "fr": "Cuisine traditionnelle majorquine authentique célébrant les saveurs locales et le patrimoine.",
            "se": "Äkta traditionell mallorkinsk mat som firar lokala smaker och arv.",
        },
        "image": "https://images.unsplash.com/photo-1649082236294-94468ba45741?w=800&h=600&fit=crop",
        "location": "Caimari",
        "full_address": "Carrer de l’Església 1, 07314 Caimari, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/ca-na-toneta",
    },
    {
        "id": "la-malvasia",
        "name": "La Malvasía",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Mediterranean cuisine",
        "municipality": "Deià",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Deià.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Deià.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Deià.",
            "se": "Fin matupplevelse med samtida medelhavskök i Deià.",
        },
        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
        "location": "Deià",
        "full_address": "Carrer Bisbe Nadal 10, 07179 Deià, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/la-malvasia",
    },
    {
        "id": "brut-restaurant",
        "name": "Brut Restaurant",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Contemporary dining",
        "municipality": "Pollença",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Pollença.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Pollença.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Pollença.",
            "se": "Fin matupplevelse med samtida medelhavskök i Pollença.",
        },
        "image": "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Pollença",
        "full_address": "Carrer de la Pursiana 5, 07460 Pollença, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/brut-restaurant",
    },
    {
        "id": "es-verger-duplicate",
        "name": "Es Verger",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Famous for roast lamb",
        "municipality": "Alaró",
        "description": {
            "en": "Legendary for exceptional roast lamb and authentic Mallorcan mountain cuisine.",
            "de": "Legendär für außergewöhnliches Lammbraten und authentische mallorquinische Bergküche.",
            "fr": "Légendaire pour son agneau rôti exceptionnel et sa cuisine de montagne majorquine authentique.",
            "se": "Legendarisk för exceptionellt rostlamm och autentisk mallorkinsk bergmat.",
        },
        "image": "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Alaró",
        "full_address": "Carretera Alaró–Orient km 4.5, 07340 Alaró, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/es-verger",
    },
    {
        "id": "es-freu",
        "name": "Es Freu",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Located in The Lodge Mallorca",
        "municipality": "Santa Maria del Camí",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Santa Maria del Camí.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Santa Maria del Camí.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Santa Maria del Camí.",
            "se": "Fin matupplevelse med samtida medelhavskök i Santa Maria del Camí.",
        },
        "image": "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Santa Maria del Camí",
        "full_address": "Camí de Coanegra s/n, 07320 Santa Maria del Camí, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/es-freu",
    },
    {
        "id": "shima",
        "name": "Shima",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Located in Four Seasons Resort Mallorca",
        "municipality": "Pollença",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Port de Pollença.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Port de Pollença.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Port de Pollença.",
            "se": "Fin matupplevelse med samtida medelhavskök i Port de Pollença.",
        },
        "image": "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Port de Pollença",
        "full_address": "Carretera Formentor s/n, 07470 Port de Pollença, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/shima",
    },
    {
        "id": "mirabona",
        "name": "Mirabona",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Mediterranean fine dining",
        "municipality": "Santanyí",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Santanyí.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Santanyí.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Santanyí.",
            "se": "Fin matupplevelse med samtida medelhavskök i Santanyí.",
        },
        "image": "https://macadecastro.com/wp-content/uploads/2024/04/image-1.png",
        "location": "Santanyí",
        "full_address": "Carrer del Pintor Bernareggi 17, 07650 Santanyí, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/mirabona",
    },
    {
        "id": "mombo",
        "name": "MOMBO",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Asian fusion",
        "municipality": "Palma",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Palma.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Palma.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Palma.",
            "se": "Fin matupplevelse med samtida medelhavskök i Palma.",
        },
        "image": "https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de Sant Magí 62, 07013 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/mombo",
    },
    {
        "id": "izakaya-mallorca-duplicate",
        "name": "Izakaya Mallorca",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Japanese izakaya",
        "municipality": "Palma",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Palma.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Palma.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Palma.",
            "se": "Fin matupplevelse med samtida medelhavskök i Palma.",
        },
        "image": "https://andreugenestra.com/wp-content/uploads/2025/11/andreu-genestra-carrusel-21.jpg",
        "location": "Palma",
        "full_address": "Carrer de la Fàbrica 30, 07013 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/izakaya-mallorca",
    },
    {
        "id": "es-fanals-duplicate",
        "name": "Es Fanals",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Located in Jumeirah Port Sóller Hotel",
        "municipality": "Sóller",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Port de Sóller.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Port de Sóller.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Port de Sóller.",
            "se": "Fin matupplevelse med samtida medelhavskök i Port de Sóller.",
        },
        "image": "https://zaranda.es/wp-content/uploads/2025/12/cierre-temporada-esp-3.jpg",
        "location": "Port de Sóller",
        "full_address": "Carrer de Bèlgica s/n, 07108 Port de Sóller, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/es-fanals",
    },
    {
        "id": "ona",
        "name": "ONA",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Located in Purobeach Palma",
        "municipality": "Calvià",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Palma Nova.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Palma Nova.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Palma Nova.",
            "se": "Fin matupplevelse med samtida medelhavskök i Palma Nova.",
        },
        "image": "https://images.unsplash.com/photo-1508471349025-ca3e278cf5e2?w=800&h=600&fit=crop",
        "location": "Palma Nova",
        "full_address": "Carrer de Pagell 1, 07181 Palma Nova, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/ona",
    },
    {
        "id": "sumaq",
        "name": "Sumaq",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Peruvian cuisine",
        "municipality": "Palma",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Palma.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Palma.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Palma.",
            "se": "Fin matupplevelse med samtida medelhavskök i Palma.",
        },
        "image": "https://images.unsplash.com/photo-1665684718390-e4c4f23b48fa?w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de Cotoner 44, 07013 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/sumaq",
    },
    {
        "id": "randemar",
        "name": "Randemar",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Seafront Mediterranean",
        "municipality": "Andratx",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Port d’Andratx.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Port d’Andratx.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Port d’Andratx.",
            "se": "Fin matupplevelse med samtida medelhavskök i Port d’Andratx.",
        },
        "image": "https://images.unsplash.com/photo-1765360773028-6affda725695?w=800&h=600&fit=crop",
        "location": "Port d’Andratx",
        "full_address": "Passeig Marítim 14, 07157 Port d’Andratx, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/randemar",
    },
    {
        "id": "casa-maruka",
        "name": "Casa Maruka",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Traditional Mediterranean",
        "municipality": "Alcúdia",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Alcúdia.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Alcúdia.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Alcúdia.",
            "se": "Fin matupplevelse med samtida medelhavskök i Alcúdia.",
        },
        "image": "https://images.unsplash.com/photo-1768697358705-c1b60333da35?w=800&h=600&fit=crop",
        "location": "Alcúdia",
        "full_address": "Carrer de la Victòria 1, 07400 Alcúdia, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/casa-maruka",
    },
    {
        "id": "aromata",
        "name": "Aromata",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Creative Mediterranean",
        "municipality": "Palma",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Palma.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Palma.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Palma.",
            "se": "Fin matupplevelse med samtida medelhavskök i Palma.",
        },
        "image": "https://images.unsplash.com/photo-1769773297747-bd00e31b33aa?w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de Ramon y Cajal 12, 07011 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/aromata",
    },
    {
        "id": "la-bodeguilla",
        "name": "La Bodeguilla",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Classic Mediterranean",
        "municipality": "Palma",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Palma.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Palma.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Palma.",
            "se": "Fin matupplevelse med samtida medelhavskök i Palma.",
        },
        "image": "https://images.unsplash.com/photo-1649082236294-94468ba45741?w=800&h=600&fit=crop",
        "location": "Palma",
        "full_address": "Carrer de Sant Jaume 3, 07012 Palma, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/la-bodeguilla",
    },
    {
        "id": "miceli",
        "name": "Miceli",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Seasonal Mallorcan cuisine",
        "municipality": "Selva",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Selva.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Selva.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Selva.",
            "se": "Fin matupplevelse med samtida medelhavskök i Selva.",
        },
        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
        "location": "Selva",
        "full_address": "Plaça Nova, 07313 Selva, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/miceli",
    },
    {
        "id": "365-restaurant",
        "name": "365 Restaurant",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Located in Son Brull Hotel",
        "municipality": "Pollença",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Pollença.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Pollença.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Pollença.",
            "se": "Fin matupplevelse med samtida medelhavskök i Pollença.",
        },
        "image": "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Pollença",
        "full_address": "Carretera Pollença–Alcúdia km 59, 07460 Pollença, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/365-restaurant",
    },
    {
        "id": "terrae",
        "name": "Terrae",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Gourmet local cuisine",
        "municipality": "Pollença",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Port de Pollença.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Port de Pollença.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Port de Pollença.",
            "se": "Fin matupplevelse med samtida medelhavskök i Port de Pollença.",
        },
        "image": "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Port de Pollença",
        "full_address": "Carrer d’Enmig, 07470 Port de Pollença, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/terrae",
    },
    {
        "id": "port-petit",
        "name": "Port Petit",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Seafood & marina views",
        "municipality": "Santanyí",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Cala d’Or.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Cala d’Or.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Cala d’Or.",
            "se": "Fin matupplevelse med samtida medelhavskök i Cala d’Or.",
        },
        "image": "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Cala d’Or",
        "full_address": "Passeig Marítim s/n, 07660 Cala d’Or, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/port-petit",
    },
    {
        "id": "sa-llotja-portocolom",
        "name": "Sa Llotja Portocolom",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Fish & seafood",
        "municipality": "Felanitx",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Portocolom.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Portocolom.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Portocolom.",
            "se": "Fin matupplevelse med samtida medelhavskök i Portocolom.",
        },
        "image": "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Portocolom",
        "full_address": "Passeig del Port, 07670 Portocolom, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/sa-llotja-portocolom",
    },
    {
        "id": "es-guix",
        "name": "Es Guix",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Mountain restaurant",
        "municipality": "Escorca",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Escorca.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Escorca.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Escorca.",
            "se": "Fin matupplevelse med samtida medelhavskök i Escorca.",
        },
        "image": "https://macadecastro.com/wp-content/uploads/2024/04/image-1.png",
        "location": "Escorca",
        "full_address": "Carretera Lluc–Escorca km 5.2, 07315 Escorca, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 15,
        "contact_url": "https://www.golfinmallorca.com/restaurants/es-guix",
    },
    {
        "id": "barlovento",
        "name": "Barlovento",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Seafront dining",
        "municipality": "Andratx",
        "description": {
            "en": "Fine dining experience featuring contemporary Mediterranean cuisine in Port d’Andratx.",
            "de": "Fine-Dining-Erlebnis mit zeitgenössischer mediterraner Küche in Port d’Andratx.",
            "fr": "Expérience gastronomique avec cuisine méditerranéenne contemporaine à Port d’Andratx.",
            "se": "Fin matupplevelse med samtida medelhavskök i Port d’Andratx.",
        },
        "image": "https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Port d’Andratx",
        "full_address": "Avinguda Mateo Bosch, 07157 Port d’Andratx, Mallorca, Spain",
        "deal": {
            "en": "Golfer\'s Special: Tasting menu + wine pairing",
            "de": "Golfer-Spezial: Degustationsmenü + Weinbegleitung",
            "fr": "Spécial Golfeur: Menu dégustation + accord mets-vins",
            "se": "Golf-special: Provmeny + vinmatchning",
        },
        "discount_percent": 20,
        "contact_url": "https://www.golfinmallorca.com/restaurants/barlovento",
    },
    # ============================================
    # PUERTO PORTALS RESTAURANTS & VENUES
    # ============================================
    {
        "id": "yara-puerto-portals",
        "name": "Yara",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Japanese-Mediterranean Fusion",
        "municipality": "Puerto Portals",
        "description": {
            "en": "Modern Japanese-Mediterranean fusion by Executive Chef Simon Petutschnig. Robata grilling, sushi, wagyu tartare with stunning marina views.",
            "de": "Moderne japanisch-mediterrane Fusion von Executive Chef Simon Petutschnig. Robata-Grill, Sushi, Wagyu-Tartar mit atemberaubendem Hafenblick.",
            "fr": "Fusion japonaise-méditerranéenne moderne par le Chef Simon Petutschnig. Grillade robata, sushi, tartare de wagyu avec vue imprenable sur la marina.",
            "se": "Modern japansk-medelhavsfusion av Executive Chef Simon Petutschnig. Robata-grillning, sushi, wagyu-tartare med fantastisk marinautsikt.",
        },
        "image": "https://images.unsplash.com/photo-1770736929333-4fb8cd5a1657?w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals, 07181 Portals Nous, Mallorca",
        "deal": {
            "en": "Omakase Experience: Chef's tasting menu + sake pairing",
            "de": "Omakase-Erlebnis: Chef-Degustationsmenü + Sake-Begleitung",
            "fr": "Expérience Omakase: Menu dégustation du chef + accords saké",
            "se": "Omakase-upplevelse: Kockens provmeny + sake-matchning",
        },
        "discount_percent": 10,
        "contact_url": "https://yarapuertoportals.com",
    },
    {
        "id": "janina-puerto-portals",
        "name": "Janina Restaurante",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Asian-South American-Mediterranean Fusion",
        "municipality": "Puerto Portals",
        "description": {
            "en": "Exquisite fusion of Asian, South American, and Mediterranean cuisines with an open-plan show kitchen. Dragon Fish, Wagyu Croquettes, and creative sushi.",
            "de": "Exquisite Fusion aus asiatischer, südamerikanischer und mediterraner Küche mit offener Showküche. Dragon Fish, Wagyu-Kroketten und kreatives Sushi.",
            "fr": "Fusion exquise de cuisines asiatique, sud-américaine et méditerranéenne avec cuisine ouverte. Dragon Fish, Croquettes de Wagyu et sushi créatif.",
            "se": "Utsökt fusion av asiatisk, sydamerikansk och medelhavskök med öppet showkök. Dragon Fish, Wagyu-kroketter och kreativ sushi.",
        },
        "image": "https://images.unsplash.com/photo-1759038086841-506aae3e1545?w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals Local 44, 07181 Portals Nous, Mallorca",
        "deal": {
            "en": "Fusion Discovery: 5-course tasting + welcome cocktail",
            "de": "Fusion-Entdeckung: 5-Gänge-Menü + Willkommenscocktail",
            "fr": "Découverte Fusion: Menu 5 plats + cocktail de bienvenue",
            "se": "Fusion-upptäckt: 5-rätters provmeny + välkomstcocktail",
        },
        "discount_percent": 10,
        "contact_url": "https://janina-restaurante.com/en/",
    },
    {
        "id": "flanigans-puerto-portals",
        "name": "Flanigan's",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Mediterranean Classics",
        "municipality": "Puerto Portals",
        "description": {
            "en": "A Puerto Portals classic since 1987. Famous for the Flanigan hamburger, steak tartare, fresh seafood, and tapas with quayside marina views.",
            "de": "Ein Puerto Portals Klassiker seit 1987. Berühmt für den Flanigan-Hamburger, Steak Tartare, frische Meeresfrüchte und Tapas mit Blick auf den Yachthafen.",
            "fr": "Un classique de Puerto Portals depuis 1987. Célèbre pour le hamburger Flanigan, steak tartare, fruits de mer frais et tapas avec vue sur la marina.",
            "se": "En Puerto Portals-klassiker sedan 1987. Känd för Flanigan-hamburgaren, steak tartare, färska skaldjur och tapas med marinautsikt.",
        },
        "image": "https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Local 16, Puerto Portals, 07181 Calviá, Mallorca",
        "deal": {
            "en": "Classic Lunch: Flanigan burger + glass of wine",
            "de": "Klassisches Mittagessen: Flanigan-Burger + Glas Wein",
            "fr": "Déjeuner Classique: Burger Flanigan + verre de vin",
            "se": "Klassisk lunch: Flanigan-burgare + glas vin",
        },
        "discount_percent": 10,
        "contact_url": "https://flanigan.es/en/",
    },
    {
        "id": "ritzi-puerto-portals",
        "name": "Ritzi Puerto Portals",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Italian Mediterranean",
        "municipality": "Puerto Portals",
        "description": {
            "en": "Elegant Italian Mediterranean dining with homemade pasta, fresh lobster, oysters, and risotto al bogavante. Harbor terrace with strong wine list.",
            "de": "Elegantes italienisch-mediterranes Essen mit hausgemachter Pasta, frischem Hummer, Austern und Risotto al Bogavante. Hafenterrasse mit starker Weinkarte.",
            "fr": "Cuisine italienne méditerranéenne élégante avec pâtes maison, homard frais, huîtres et risotto al bogavante. Terrasse portuaire avec belle carte des vins.",
            "se": "Elegant italiensk medelhavsmiddag med hemgjord pasta, färsk hummer, ostron och risotto al bogavante. Hamnterrass med stark vinlista.",
        },
        "image": "https://images.unsplash.com/photo-1766668413632-da08d0302bf7?w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals, 07181 Portals Nous, Mallorca",
        "deal": {
            "en": "Italian Evening: Pasta + seafood + wine pairing",
            "de": "Italienischer Abend: Pasta + Meeresfrüchte + Weinbegleitung",
            "fr": "Soirée Italienne: Pâtes + fruits de mer + accords vins",
            "se": "Italiensk kväll: Pasta + skaldjur + vinmatchning",
        },
        "discount_percent": 10,
        "contact_url": "https://www.ritzigroup.com/en/ritzi-portals.html",
    },
    {
        "id": "lucy-wang-puerto-portals",
        "name": "Lucy Wang",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Japanese & French Brasserie",
        "municipality": "Puerto Portals",
        "description": {
            "en": "Japanese Newstyle and French brasserie cuisine. Sushi, fresh French dishes in the exclusive Puerto Portals harbor with relaxed Zhero atmosphere.",
            "de": "Japanischer Newstyle und französische Brasserie-Küche. Sushi, frische französische Gerichte im exklusiven Hafen von Puerto Portals mit entspannter Zhero-Atmosphäre.",
            "fr": "Cuisine japonaise Newstyle et brasserie française. Sushi, plats français frais dans le port exclusif de Puerto Portals avec ambiance Zhero détendue.",
            "se": "Japansk Newstyle och fransk brasserimat. Sushi, färska franska rätter i exklusiva Puerto Portals hamn med avslappnad Zhero-atmosfär.",
        },
        "image": "https://images.unsplash.com/photo-1761515397055-1bba63a150d3?w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals, 07181 Portals Nous, Mallorca",
        "deal": {
            "en": "East Meets West: Sushi platter + French dessert",
            "de": "Ost trifft West: Sushi-Platte + französisches Dessert",
            "fr": "L'Est Rencontre l'Ouest: Plateau de sushi + dessert français",
            "se": "Öst möter väst: Sushi-tallrik + fransk dessert",
        },
        "discount_percent": 10,
        "contact_url": "https://www.lucywangportals.com",
    },
    {
        "id": "wellies-puerto-portals",
        "name": "Wellies",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Mediterranean Gourmet",
        "municipality": "Puerto Portals",
        "description": {
            "en": "Exclusive Mediterranean gourmet in elegant Puerto Portals. Famous Wellies Burger, Burger & Lobster, champagnes and creative cocktails with harbor views.",
            "de": "Exklusives mediterranes Gourmet im eleganten Puerto Portals. Berühmter Wellies Burger, Burger & Lobster, Champagner und kreative Cocktails mit Hafenblick.",
            "fr": "Gourmet méditerranéen exclusif à l'élégant Puerto Portals. Célèbre Wellies Burger, Burger & Lobster, champagnes et cocktails créatifs avec vue sur le port.",
            "se": "Exklusiv medelhavsgourmet i eleganta Puerto Portals. Kända Wellies Burger, Burger & Lobster, champagne och kreativa cocktails med hamnutsikt.",
        },
        "image": "https://images.unsplash.com/photo-1712952468219-d3e7d7395e34?w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals Loc. 22, 07818 Portals Nous, Mallorca",
        "deal": {
            "en": "Luxury Lunch: Wellies Burger + champagne",
            "de": "Luxus-Mittagessen: Wellies Burger + Champagner",
            "fr": "Déjeuner de Luxe: Wellies Burger + champagne",
            "se": "Lyxlunch: Wellies Burger + champagne",
        },
        "discount_percent": 10,
        "contact_url": "https://www.wellies.es/en/mallorca",
    },
    {
        "id": "spoon-puerto-portals",
        "name": "Spoon",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Asian Crossover",
        "municipality": "Puerto Portals",
        "description": {
            "en": "Asian crossover cuisine with Mediterranean influences. Wok specialties, fresh seafood, Thai curry, and teppanyaki directly on the harbor promenade.",
            "de": "Asiatische Crossover-Küche mit mediterranen Einflüssen. Wok-Spezialitäten, frische Meeresfrüchte, Thai-Curry und Teppanyaki direkt an der Hafenpromenade.",
            "fr": "Cuisine crossover asiatique aux influences méditerranéennes. Spécialités wok, fruits de mer frais, curry thaï et teppanyaki sur la promenade du port.",
            "se": "Asiatisk crossover-kök med medelhavsinspirationer. Wok-specialiteter, färska skaldjur, thailändskt curry och teppanyaki direkt på hamnpromenaden.",
        },
        "image": "https://images.unsplash.com/photo-1718939044138-5b76d9dd938b?w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals Local 53, 07181 Portals Nous, Mallorca",
        "deal": {
            "en": "Wok Experience: Signature wok + Thai curry",
            "de": "Wok-Erlebnis: Signature-Wok + Thai-Curry",
            "fr": "Expérience Wok: Wok signature + curry thaï",
            "se": "Wok-upplevelse: Signatur-wok + thailändskt curry",
        },
        "discount_percent": 10,
        "contact_url": "https://www.spoon-mallorca.com/en",
    },
    {
        "id": "tahini-puerto-portals",
        "name": "Tahini Sushi Bar & Restaurant",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Japanese Haute Cuisine",
        "municipality": "Puerto Portals",
        "description": {
            "en": "Japanese haute cuisine with exquisite decoration. Sushi, sashimi, temaki, gyoza, teppanyaki and tempura. Private glass cabins for exclusive dining.",
            "de": "Japanische Haute Cuisine mit exquisiter Dekoration. Sushi, Sashimi, Temaki, Gyoza, Teppanyaki und Tempura. Private Glaskabinen für exklusives Essen.",
            "fr": "Haute cuisine japonaise avec décoration exquise. Sushi, sashimi, temaki, gyoza, teppanyaki et tempura. Cabines en verre privées pour dîner exclusif.",
            "se": "Japansk haute cuisine med utsökt dekoration. Sushi, sashimi, temaki, gyoza, teppanyaki och tempura. Privata glashytter för exklusiv middag.",
        },
        "image": "https://images.unsplash.com/photo-1769773297747-bd00e31b33aa?w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals, 2, 07181 Portals Nous, Mallorca",
        "deal": {
            "en": "Sushi Master: Omakase selection + premium sake",
            "de": "Sushi-Meister: Omakase-Auswahl + Premium-Sake",
            "fr": "Maître Sushi: Sélection omakase + saké premium",
            "se": "Sushi-mästare: Omakase-urval + premiumsake",
        },
        "discount_percent": 10,
        "contact_url": "https://www.tahinisushibar.com/en/mallorca",
    },
    {
        "id": "lila-portals",
        "name": "Lila Portals Beach Restaurant & Bar",
        "type": "restaurant",
        "michelin_stars": None,
        "cuisine_type": "Beachfront Mediterranean",
        "municipality": "Portals Nous",
        "description": {
            "en": "Fine and casual beachfront dining overlooking the Mediterranean bay. Meat, fish, seafood, vegetarian options with panoramic sea and marina views.",
            "de": "Feines und lässiges Strandrestaurant mit Blick auf die Mittelmeerbucht. Fleisch, Fisch, Meeresfrüchte, vegetarische Optionen mit Panoramablick auf Meer und Marina.",
            "fr": "Restaurant de plage raffiné et décontracté surplombant la baie méditerranéenne. Viande, poisson, fruits de mer, options végétariennes avec vue panoramique.",
            "se": "Fin och avslappnad strandrestaurang med utsikt över Medelhavsbukten. Kött, fisk, skaldjur, vegetariska alternativ med panoramautsikt över hav och marina.",
        },
        "image": "https://images.unsplash.com/photo-1730196563130-e2cf42a164b1?w=800&h=600&fit=crop",
        "location": "Portals Nous",
        "full_address": "Passatge Mar 1, 07181 Portals Nous, Mallorca",
        "deal": {
            "en": "Beach Lunch: Fresh catch of the day + wine",
            "de": "Strand-Mittagessen: Frischer Tagesfang + Wein",
            "fr": "Déjeuner Plage: Prise du jour + vin",
            "se": "Strandlunch: Dagens fångst + vin",
        },
        "discount_percent": 10,
        "contact_url": "https://www.lila-portals.com/en/",
    },
    {
        "id": "cappuccino-puerto-portals",
        "name": "Cappuccino Grand Café",
        "type": "cafe_bar",
        "category": "Grand Café",
        "specialty": "The Meeting Point of Puerto Portals",
        "description": {
            "en": "The meeting point of reference in Puerto Portals. Famous for exceptional coffees, cocktails, and Mediterranean cuisine from morning until late.",
            "de": "Der Treffpunkt schlechthin in Puerto Portals. Berühmt für außergewöhnliche Kaffees, Cocktails und mediterrane Küche von morgens bis spät.",
            "fr": "Le point de rencontre de référence à Puerto Portals. Célèbre pour ses cafés exceptionnels, cocktails et cuisine méditerranéenne du matin au soir.",
            "se": "Referensmötesplatsen i Puerto Portals. Känd för exceptionella kaffedrycker, cocktails och medelhavskök från morgon till sent.",
        },
        "image": "https://images.unsplash.com/photo-1763736808435-0686cbaf2cb7?w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals, 1, 07181 Portals Nous, Mallorca",
        "hours": "8:30 - 00:00 (Fri-Sat until 01:00)",
        "deal": {
            "en": "Morning Ritual: Cappuccino + pastry with marina views",
            "de": "Morgenritual: Cappuccino + Gebäck mit Marinablick",
            "fr": "Rituel Matinal: Cappuccino + pâtisserie avec vue marina",
            "se": "Morgonritual: Cappuccino + bakverk med marinautsikt",
        },
        "discount_percent": 10,
        "contact_url": "https://www.cappuccinograndcafe.es/en/mallorca/puerto-portals",
    },
    {
        "id": "ritzi-club",
        "name": "Ritzi Club",
        "type": "cafe_bar",
        "category": "Lounge Bar & Club",
        "specialty": "Upscale Nightlife & Cocktails",
        "description": {
            "en": "The glamorous lounge bar and club of Puerto Portals. Premium cocktails, champagne, and upscale nightlife in the marina's most exclusive setting.",
            "de": "Die glamouröse Lounge-Bar und Club von Puerto Portals. Premium-Cocktails, Champagner und gehobenes Nachtleben in exklusivster Lage der Marina.",
            "fr": "Le bar lounge glamour et club de Puerto Portals. Cocktails premium, champagne et vie nocturne haut de gamme dans le cadre le plus exclusif de la marina.",
            "se": "Den glamorösa lounge-baren och klubben i Puerto Portals. Premium-cocktails, champagne och exklusivt nattliv i marinans mest exklusiva miljö.",
        },
        "image": "https://images.pexels.com/photos/1309583/pexels-photo-1309583.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals, 07181 Portals Nous, Mallorca",
        "hours": "20:00 - 04:00",
        "deal": {
            "en": "VIP Night: Table reservation + bottle service",
            "de": "VIP-Nacht: Tischreservierung + Flaschenservice",
            "fr": "Nuit VIP: Réservation table + service bouteille",
            "se": "VIP-kväll: Bordsbokning + flaskservice",
        },
        "discount_percent": 15,
        "contact_url": "https://www.ritzigroup.com/en/",
    },
    {
        "id": "lobster-club",
        "name": "Lobster Club",
        "type": "beach_club",
        "description": {
            "en": "Luxury seafront restaurant and beach club in Puerto Portals. Lobster-focused Mediterranean cuisine, infinity pool, DJ sessions, and Full Moon Parties.",
            "de": "Luxuriöses Strandrestaurant und Beach Club in Puerto Portals. Hummer-fokussierte mediterrane Küche, Infinity-Pool, DJ-Sessions und Vollmond-Partys.",
            "fr": "Restaurant et beach club de luxe en bord de mer à Puerto Portals. Cuisine méditerranéenne axée sur le homard, piscine à débordement, sessions DJ et Full Moon Parties.",
            "se": "Lyxig strandrestaurang och beach club i Puerto Portals. Hummerfokuserad medelhavskök, infinity-pool, DJ-sessioner och fullmånefester.",
        },
        "image": "https://images.unsplash.com/photo-1759693501856-f3eca6ac5001?w=800&h=600&fit=crop",
        "location": "Puerto Portals",
        "full_address": "Puerto Portals, 07181 Portals Nous, Mallorca",
        "distance_to_golf": "4km to T Golf Calvià",
        "deal": {
            "en": "Lobster Experience: Fresh lobster + champagne by the pool",
            "de": "Hummer-Erlebnis: Frischer Hummer + Champagner am Pool",
            "fr": "Expérience Homard: Homard frais + champagne au bord de la piscine",
            "se": "Hummerupplevelse: Färsk hummer + champagne vid poolen",
        },
        "discount_percent": 15,
        "contact_url": "https://www.lobsterclub.es/en",
    },
]

# Static blog posts
BLOG_POSTS = [
    {
        "id": "best-time-golf-mallorca",
        "slug": "best-time-golf-mallorca",
        "title": {
            "en": "The Best Time to Play Golf in Mallorca",
            "de": "Die beste Zeit zum Golfspielen auf Mallorca",
            "fr": "Le meilleur moment pour jouer au golf à Majorque",
            "se": "Bästa tiden att spela golf på Mallorca"
        },
        "excerpt": {
            "en": "Discover when to visit Mallorca for the perfect golfing conditions and avoid the crowds.",
            "de": "Entdecken Sie, wann Sie Mallorca besuchen sollten, um perfekte Golfbedingungen zu genießen.",
            "fr": "Découvrez quand visiter Majorque pour des conditions de golf parfaites.",
            "se": "Upptäck när du ska besöka Mallorca för perfekta golfförhållanden."
        },
        "content": {
            "en": "Mallorca enjoys over 300 days of sunshine per year, making it an ideal golf destination almost year-round. However, the best time to play golf in Mallorca is during spring (March to May) and autumn (September to November). During these months, you'll experience pleasant temperatures between 18-25°C, minimal rainfall, and fewer tourists on the courses. The summer months can be quite hot, with temperatures often exceeding 30°C, while winter offers mild conditions but occasional rain. Spring brings the island to life with blooming almond trees and vibrant landscapes, creating a stunning backdrop for your round. Autumn provides similar weather with the added benefit of harvesting season, offering wonderful culinary experiences after your game.",
            "de": "Mallorca genießt über 300 Sonnentage pro Jahr und ist damit fast das ganze Jahr über ein ideales Golfziel. Die beste Zeit zum Golfspielen auf Mallorca ist jedoch im Frühling (März bis Mai) und Herbst (September bis November)...",
            "fr": "Majorque bénéficie de plus de 300 jours de soleil par an, ce qui en fait une destination de golf idéale presque toute l'année...",
            "se": "Mallorca har över 300 soldagar per år, vilket gör det till en idealisk golfdestination nästan året runt..."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_500,c_fill/courses/golf-son-gual-mallorca/golf-son-gual-mallorca",
        "author": "Maria Santos",
        "category": "travel-tips",
        "tags": ["weather", "planning", "seasons"],
        "published": True,
        "created_at": "2024-12-15T10:00:00Z"
    },
    {
        "id": "top-5-courses-beginners",
        "slug": "top-5-courses-beginners",
        "title": {
            "en": "Top 5 Golf Courses in Mallorca for Beginners",
            "de": "Top 5 Golfplätze auf Mallorca für Anfänger",
            "fr": "Top 5 des parcours de golf à Majorque pour débutants",
            "se": "Topp 5 golfbanor på Mallorca för nybörjare"
        },
        "excerpt": {
            "en": "New to golf? These beginner-friendly courses offer the perfect introduction to Mallorca's golf scene.",
            "de": "Neu beim Golf? Diese anfängerfreundlichen Plätze bieten die perfekte Einführung.",
            "fr": "Nouveau au golf? Ces parcours adaptés aux débutants offrent une introduction parfaite.",
            "se": "Ny på golf? Dessa nybörjarvänliga banor erbjuder den perfekta introduktionen."
        },
        "content": {
            "en": "If you're new to golf or still building your confidence on the course, Mallorca offers several welcoming options. Son Vida Golf stands out as the most beginner-friendly course, with its forgiving fairways and helpful staff. The course offers excellent practice facilities and lessons from PGA-certified professionals. Son Quint Golf provides another great option with its modern design and less intimidating layout. Pula Golf Resort offers a relaxed atmosphere perfect for those still learning the game. Golf Son Servera welcomes players of all levels with its traditional layout and patient staff. Finally, Son Antem East Course provides a resort setting where beginners can feel comfortable while enjoying quality facilities.",
            "de": "Wenn Sie neu beim Golf sind oder noch Vertrauen auf dem Platz aufbauen, bietet Mallorca mehrere einladende Optionen...",
            "fr": "Si vous êtes nouveau au golf ou encore en train de prendre confiance sur le parcours, Majorque offre plusieurs options accueillantes...",
            "se": "Om du är ny på golf eller fortfarande bygger ditt självförtroende på banan, erbjuder Mallorca flera välkomnande alternativ..."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_500,c_fill/courses/son-vida-golf/son-vida-golf",
        "author": "Carlos Martinez",
        "category": "course-guides",
        "tags": ["beginners", "courses", "tips"],
        "published": True,
        "created_at": "2024-12-10T14:30:00Z"
    },
    {
        "id": "golf-and-gastronomy-mallorca",
        "slug": "golf-and-gastronomy-mallorca",
        "title": {
            "en": "Golf & Gastronomy: The Perfect Mallorca Pairing",
            "de": "Golf & Gastronomie: Die perfekte Mallorca-Kombination",
            "fr": "Golf & Gastronomie: L'accord parfait à Majorque",
            "se": "Golf & Gastronomi: Den perfekta Mallorca-kombinationen"
        },
        "excerpt": {
            "en": "Combine world-class golf with Michelin-starred dining for the ultimate Mallorca experience.",
            "de": "Kombinieren Sie Weltklasse-Golf mit Michelin-Sterne-Dining für das ultimative Mallorca-Erlebnis.",
            "fr": "Combinez golf de classe mondiale et gastronomie étoilée Michelin pour l'expérience ultime.",
            "se": "Kombinera golf i världsklass med Michelin-stjärnig matlagning för den ultimata Mallorca-upplevelsen."
        },
        "content": {
            "en": "Mallorca is not just a golf paradise—it's also a culinary destination with 8 Michelin-starred restaurants. After a morning round at Golf Alcanada, head to Es Fum for contemporary Mediterranean cuisine. If you're playing at Son Vida, the nearby Zaranda offers two Michelin stars and breathtaking views. For a more casual experience, the clubhouse restaurants at Son Gual and Santa Ponsa serve excellent local dishes. Don't miss the traditional Mallorcan cuisine: tumbet, sobrassada, and ensaimadas are must-tries. Many of our hotel partners offer special golf-and-dine packages that combine green fees with reservations at top restaurants.",
            "de": "Mallorca ist nicht nur ein Golfparadies – es ist auch ein kulinarisches Ziel mit 8 Michelin-Sterne-Restaurants...",
            "fr": "Majorque n'est pas seulement un paradis du golf, c'est aussi une destination culinaire avec 8 restaurants étoilés Michelin...",
            "se": "Mallorca är inte bara ett golfparadis – det är också en kulinarisk destination med 8 Michelin-stjärniga restauranger..."
        },
        "image": "/api/static/images/blog-gastronomy.jpg",
        "author": "Elena Rossi",
        "category": "lifestyle",
        "tags": ["food", "restaurants", "experiences"],
        "published": True,
        "created_at": "2024-12-05T09:15:00Z"
    },
    {
        "id": "championship-courses-mallorca",
        "slug": "championship-courses-mallorca",
        "title": {
            "en": "Championship Golf: Mallorca's Most Challenging Courses",
            "de": "Championship-Golf: Mallorcas anspruchsvollste Plätze",
            "fr": "Golf Championship: Les parcours les plus difficiles de Majorque",
            "se": "Championship Golf: Mallorcas mest utmanande banor"
        },
        "excerpt": {
            "en": "Ready for a challenge? Discover the courses that test even the most experienced golfers.",
            "de": "Bereit für eine Herausforderung? Entdecken Sie die Plätze, die selbst erfahrene Golfer testen.",
            "fr": "Prêt pour un défi? Découvrez les parcours qui testent même les golfeurs les plus expérimentés.",
            "se": "Redo för en utmaning? Upptäck banorna som testar även de mest erfarna golfarna."
        },
        "content": {
            "en": "For experienced golfers seeking a true test of their skills, Mallorca delivers world-class championship courses. Golf Son Gual, designed by Thomas Himmel, is widely considered one of Europe's finest courses with its immaculate conditioning and strategic design. Golf Alcanada challenges players with its coastal winds and stunning but demanding layout around the historic lighthouse. Son Antem West Championship Course offers tournament-ready conditions and has hosted European Tour qualifying events. The technical Son Muntaner Golf demands precision with its elevation changes and narrow fairways. These courses reward strategic thinking and punish errant shots—exactly what serious golfers crave.",
            "de": "Für erfahrene Golfer, die einen echten Test ihrer Fähigkeiten suchen, bietet Mallorca Weltklasse-Championship-Plätze...",
            "fr": "Pour les golfeurs expérimentés à la recherche d'un véritable test de leurs compétences, Majorque offre des parcours championship de classe mondiale...",
            "se": "För erfarna golfare som söker ett verkligt test av sina färdigheter, levererar Mallorca mästerskapsbanor i världsklass..."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_500,c_fill/courses/son-antem-championship-course/son-antem-championship-course",
        "author": "James Thompson",
        "category": "course-guides",
        "tags": ["championship", "advanced", "challenge"],
        "published": True,
        "created_at": "2024-11-28T11:00:00Z"
    }
]

# Sample approved reviews (seeded data) - OLD FORMAT REMOVED, using REVIEWS_DATA above

# Email helper functions
async def send_contact_notification_email(inquiry: ContactInquiryCreate):
    """Send notification email to admin when new contact inquiry is received."""
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #FFFFE3;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #808034; margin-bottom: 20px;">New Contact Inquiry - Golfinmallorca.com</h2>
            <p style="color: #333;"><strong>Name:</strong> {inquiry.name}</p>
            <p style="color: #333;"><strong>Email:</strong> {inquiry.email}</p>
            <p style="color: #333;"><strong>Phone:</strong> {inquiry.phone or 'Not provided'}</p>
            <p style="color: #333;"><strong>Country:</strong> {inquiry.country}</p>
            <p style="color: #333;"><strong>Inquiry Type:</strong> {inquiry.inquiry_type}</p>
            <hr style="border: 1px solid #DBD4FF; margin: 20px 0;">
            <p style="color: #333;"><strong>Message:</strong></p>
            <p style="color: #555; background-color: #FFFFE3; padding: 15px; border-radius: 5px;">{inquiry.message}</p>
            <hr style="border: 1px solid #DBD4FF; margin: 20px 0;">
            <p style="color: #888; font-size: 12px;">This email was sent automatically from Golfinmallorca.com contact form.</p>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": ["contact@golfinmallorca.com"],
        "subject": f"New Contact Inquiry from {inquiry.name} - Golfinmallorca.com",
        "html": html_content
    }
    
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Contact notification email sent for inquiry from {inquiry.email}")
    except Exception as e:
        logger.error(f"Failed to send contact notification email: {str(e)}")

async def send_newsletter_welcome_email(name: str, email: str):
    """Send welcome email to new newsletter subscriber."""
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #FFFFE3;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #808034; margin: 0;">Golfinmallorca.com</h1>
                <p style="color: #723480; font-style: italic;">Your Gateway to Luxury Golf in Mallorca</p>
            </div>
            
            <h2 style="color: #808034;">Welcome to Our Newsletter, {name}!</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Thank you for subscribing to the Golfinmallorca.com newsletter! You've joined an exclusive community of golf enthusiasts who appreciate the finest courses and experiences Mallorca has to offer.
            </p>
            
            <p style="color: #333; line-height: 1.6;">
                As a subscriber, you'll receive:
            </p>
            
            <ul style="color: #333; line-height: 1.8;">
                <li>Exclusive deals on green fees at premium courses</li>
                <li>Early access to golf & hotel packages</li>
                <li>Insider tips on the best courses and restaurants</li>
                <li>Seasonal offers and special promotions</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://golfinmallorca.greenfee365.com" style="background-color: #808034; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Your Tee Time</a>
            </div>
            
            <p style="color: #333; line-height: 1.6;">
                We're excited to help you plan your next golfing adventure in Mallorca!
            </p>
            
            <p style="color: #333;">
                Best regards,<br>
                <strong>The Golfinmallorca.com Team</strong>
            </p>
            
            <hr style="border: 1px solid #DBD4FF; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
                Since 2003, we've been connecting golfers with the finest courses in Mallorca.<br>
                Contact us: contact@golfinmallorca.com | +34 871 555 365
            </p>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [email],
        "subject": "Welcome to Golfinmallorca.com Newsletter!",
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
async def get_golf_courses():
    return GOLF_COURSES

@api_router.get("/partner-offers", response_model=List[dict])
async def get_partner_offers(type: Optional[str] = None):
    if type:
        return [o for o in PARTNER_OFFERS if o["type"] == type]
    return PARTNER_OFFERS

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
    new_review = {
        "id": new_id,
        "user_name": review.user_name,
        "country": review.country,
        "platform": review.platform,
        "rating": review.rating,
        "language": review.language,
        "review_text": review.review_text
    }
    # In production, this would be saved to MongoDB
    # await db.reviews.insert_one(new_review)
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
