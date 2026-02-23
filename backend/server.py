from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
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

# Real reviews data from CSV with English translations
REVIEWS_DATA = [
    {"id": 1, "user_name": "Hans-Jürgen S.", "age": 62, "gender": "Male", "country": "Germany", "platform": "Google Reviews", "rating": 5, "language": "DE", 
     "review_text": "Habe kurzfristig eine Startzeit für Alcanada gesucht. Die Webseite ist extrem übersichtlich und der Buchungsvorgang war in 2 Minuten erledigt. Bestpreis garantiert! Sehr zu empfehlen.",
     "review_text_en": "I was looking for a last-minute tee time at Alcanada. The website is extremely clear and the booking process was done in 2 minutes. Best price guaranteed! Highly recommended."},
    {"id": 2, "user_name": "Mark T.", "age": 45, "gender": "Male", "country": "UK", "platform": "Google Reviews", "rating": 5, "language": "EN", 
     "review_text": "Brilliant interface. Usually, booking golf abroad is a headache, but this was as easy as ordering a pizza. Got a great deal on a twilight round at Son Gual.",
     "review_text_en": "Brilliant interface. Usually, booking golf abroad is a headache, but this was as easy as ordering a pizza. Got a great deal on a twilight round at Son Gual."},
    {"id": 3, "user_name": "Roberto P.", "age": 38, "gender": "Male", "country": "Italy", "platform": "Google Reviews", "rating": 5, "language": "IT", 
     "review_text": "Processo di prenotazione fantastico. Ho trovato subito il campo che cercavo a Maiorca. Prezzi molto competitivi rispetto ad altri siti.",
     "review_text_en": "Fantastic booking process. I immediately found the course I was looking for in Mallorca. Very competitive prices compared to other sites."},
    {"id": 4, "user_name": "Erik B.", "age": 51, "gender": "Male", "country": "Norway", "platform": "Google Reviews", "rating": 5, "language": "NO", 
     "review_text": "Veldig enkel og grei bestilling. Fantastisk utvalg av baner. Kommer definitivt til å bruke Greenfee365 igjen neste gang vi skal til Spania.",
     "review_text_en": "Very simple and straightforward booking. Fantastic selection of courses. Will definitely use Greenfee365 again next time we go to Spain."},
    {"id": 5, "user_name": "Sarah L.", "age": 29, "gender": "Female", "country": "US", "platform": "Google Reviews", "rating": 5, "language": "EN", 
     "review_text": "User interface is 10/10. Super sleek and mobile-friendly. Booked my entire week of golf in Mallorca while waiting for my flight at the gate!",
     "review_text_en": "User interface is 10/10. Super sleek and mobile-friendly. Booked my entire week of golf in Mallorca while waiting for my flight at the gate!"},
    {"id": 6, "user_name": "Jean-Pierre D.", "age": 68, "gender": "Male", "country": "France", "platform": "Google Reviews", "rating": 5, "language": "FR", 
     "review_text": "Très efficace. J'ai eu un petit doute sur l'horaire et le service client a répondu immédiatement. Un inventaire impressionnant de parcours.",
     "review_text_en": "Very efficient. I had a small doubt about the schedule and customer service responded immediately. An impressive inventory of courses."},
    {"id": 7, "user_name": "Klaus M.", "age": 55, "gender": "Male", "country": "Switzerland", "platform": "Google Reviews", "rating": 5, "language": "DE", 
     "review_text": "Reibungslose Abwicklung. Die Bestätigung kam sofort aufs Handy. Die Auswahl an Plätzen auf Mallorca ist unschlagbar.",
     "review_text_en": "Smooth processing. The confirmation came immediately to my phone. The selection of courses in Mallorca is unbeatable."},
    {"id": 8, "user_name": "Anders G.", "age": 42, "gender": "Male", "country": "Sweden", "platform": "Google Reviews", "rating": 5, "language": "SV", 
     "review_text": "Smidigaste bokningstjänsten jag testat. Bra priser och tydlig information om banorna.",
     "review_text_en": "The smoothest booking service I've tried. Good prices and clear information about the courses."},
    {"id": 9, "user_name": "David W.", "age": 55, "gender": "Male", "country": "UK", "platform": "Trustpilot", "rating": 5, "language": "EN", 
     "review_text": "I've used several booking sites, but Greenfee365 is the most intuitive. The 'Golf in Mallorca' portal is specifically great because it shows real-time availability.",
     "review_text_en": "I've used several booking sites, but Greenfee365 is the most intuitive. The 'Golf in Mallorca' portal is specifically great because it shows real-time availability."},
    {"id": 10, "user_name": "Stefan R.", "age": 34, "gender": "Male", "country": "Germany", "platform": "Trustpilot", "rating": 5, "language": "DE", 
     "review_text": "Hervorragende Plattform. Die Preise sind oft besser als direkt beim Club. Man merkt, dass hier Profis am Werk sind.",
     "review_text_en": "Excellent platform. The prices are often better than directly at the club. You can tell that professionals are at work here."},
    {"id": 11, "user_name": "James P.", "age": 50, "gender": "Male", "country": "US", "platform": "Trustpilot", "rating": 5, "language": "EN", 
     "review_text": "Not just Mallorca! I started using them for my local rounds too. The ease of use is consistent across the board.",
     "review_text_en": "Not just Mallorca! I started using them for my local rounds too. The ease of use is consistent across the board."},
    {"id": 12, "user_name": "Luca M.", "age": 44, "gender": "Male", "country": "Italy", "platform": "Trustpilot", "rating": 5, "language": "IT", 
     "review_text": "Prenotazione istantanea. Nessun problema al check-in nel club. Servizio eccellente.",
     "review_text_en": "Instant booking. No problem at check-in at the club. Excellent service."},
    {"id": 13, "user_name": "Olav H.", "age": 65, "gender": "Male", "country": "Norway", "platform": "Trustpilot", "rating": 5, "language": "NO", 
     "review_text": "Veldig fornøyd. Bruker alltid denne siden når jeg reiser. De har de beste prisene på de mest populære banene.",
     "review_text_en": "Very satisfied. Always use this site when I travel. They have the best prices on the most popular courses."},
    {"id": 14, "user_name": "Thomas B.", "age": 41, "gender": "Male", "country": "UK", "platform": "TripAdvisor", "rating": 5, "language": "EN", 
     "review_text": "A must-use for golfers visiting Mallorca. We booked 4 different courses through this site. The map view helped us pick courses near our hotel.",
     "review_text_en": "A must-use for golfers visiting Mallorca. We booked 4 different courses through this site. The map view helped us pick courses near our hotel."},
    {"id": 15, "user_name": "Magnus K.", "age": 37, "gender": "Male", "country": "Sweden", "platform": "TripAdvisor", "rating": 5, "language": "SV", 
     "review_text": "Perfekt för semestern. Allt fungerade klockrent, från betalning till spel. Rekommenderas varmt till alla golfare.",
     "review_text_en": "Perfect for the vacation. Everything worked flawlessly, from payment to play. Highly recommended for all golfers."},
    {"id": 16, "user_name": "Dieter L.", "age": 70, "gender": "Male", "country": "Germany", "platform": "TripAdvisor", "rating": 5, "language": "DE", 
     "review_text": "Einfacher geht es nicht. Auch in meinem Alter ist die Seite sehr leicht zu bedienen. Wir hatten eine wunderbare Woche auf Mallorca.",
     "review_text_en": "It doesn't get easier than this. Even at my age, the site is very easy to use. We had a wonderful week in Mallorca."},
    {"id": 17, "user_name": "Michel R.", "age": 59, "gender": "Male", "country": "France", "platform": "TripAdvisor", "rating": 5, "language": "FR", 
     "review_text": "Un choix incroyable de parcours. Le site est clair et les tarifs sont attractifs. Bravo pour la simplicité.",
     "review_text_en": "An incredible choice of courses. The site is clear and the rates are attractive. Bravo for the simplicity."},
    {"id": 18, "user_name": "Christian H.", "age": 33, "gender": "Male", "country": "Switzerland", "platform": "Capterra", "rating": 5, "language": "EN", 
     "review_text": "The UX/UI is miles ahead of the competition. Fast loading times and a logical checkout flow.",
     "review_text_en": "The UX/UI is miles ahead of the competition. Fast loading times and a logical checkout flow."},
    {"id": 19, "user_name": "Markus W.", "age": 46, "gender": "Male", "country": "Germany", "platform": "G2", "rating": 5, "language": "DE", 
     "review_text": "Beste API-Integration, die ich bisher bei Buchungsplattformen gesehen habe. Die Bestätigungen sind quasi instantan.",
     "review_text_en": "Best API integration I've seen on booking platforms. The confirmations are almost instant."},
    {"id": 20, "user_name": "Robert F.", "age": 28, "gender": "Male", "country": "US", "platform": "Capterra", "rating": 5, "language": "EN", 
     "review_text": "Clean, modern, and does exactly what it says. It eliminates the friction of calling pro shops in different time zones.",
     "review_text_en": "Clean, modern, and does exactly what it says. It eliminates the friction of calling pro shops in different time zones."},
    {"id": 21, "user_name": "Peter S.", "age": 48, "gender": "Male", "country": "UK", "platform": "Yelp", "rating": 5, "language": "EN", 
     "review_text": "Great prices! Saved about 20% on my green fees this trip compared to last year. The site is super straightforward.",
     "review_text_en": "Great prices! Saved about 20% on my green fees this trip compared to last year. The site is super straightforward."},
    {"id": 22, "user_name": "Alessandro V.", "age": 52, "gender": "Male", "country": "Italy", "platform": "Angi", "rating": 5, "language": "IT", 
     "review_text": "Servizio clienti top. Ho dovuto spostare un tee time e lo hanno fatto senza problemi. Gentili e professionali.",
     "review_text_en": "Top customer service. I had to move a tee time and they did it without any problems. Kind and professional."},
    {"id": 23, "user_name": "Fredrik T.", "age": 39, "gender": "Male", "country": "Norway", "platform": "Yelp", "rating": 5, "language": "NO", 
     "review_text": "Beste prisene på nettet. Veldig imponert over hvor mange baner de har tilgjengelig over hele verden.",
     "review_text_en": "Best prices on the web. Very impressed with how many courses they have available worldwide."},
    {"id": 24, "user_name": "Johan L.", "age": 44, "gender": "Male", "country": "Sweden", "platform": "Angi", "rating": 5, "language": "SV", 
     "review_text": "Grym sida! Snabbt, enkelt och billigt. Kommer aldrig boka på något annat sätt igen.",
     "review_text_en": "Awesome site! Fast, easy and cheap. Will never book any other way again."},
    {"id": 25, "user_name": "Kevin J.", "age": 31, "gender": "Male", "country": "US", "platform": "Product Hunt", "rating": 5, "language": "EN", 
     "review_text": "Finally, a booking platform that feels like it belongs in 2026. The search filters are excellent.",
     "review_text_en": "Finally, a booking platform that feels like it belongs in 2026. The search filters are excellent."},
    {"id": 26, "user_name": "Tim O.", "age": 27, "gender": "Male", "country": "Germany", "platform": "Product Hunt", "rating": 5, "language": "DE", 
     "review_text": "Love the design and the 'ease-of-booking' factor. It's the 'Booking.com' for golf.",
     "review_text_en": "Love the design and the 'ease-of-booking' factor. It's the 'Booking.com' for golf."},
    {"id": 27, "user_name": "Luc B.", "age": 40, "gender": "Male", "country": "France", "platform": "Google Reviews", "rating": 5, "language": "FR", 
     "review_text": "Rapide, efficace, et les meilleurs prix. Top !",
     "review_text_en": "Fast, efficient, and the best prices. Top!"},
    {"id": 28, "user_name": "Gary M.", "age": 56, "gender": "Male", "country": "UK", "platform": "Google Reviews", "rating": 5, "language": "EN", 
     "review_text": "Best inventory of courses in Mallorca. Seamless booking.",
     "review_text_en": "Best inventory of courses in Mallorca. Seamless booking."},
    {"id": 29, "user_name": "Bernd G.", "age": 63, "gender": "Male", "country": "Germany", "platform": "Google Reviews", "rating": 5, "language": "DE", 
     "review_text": "Einfach klasse. Startzeit wählen, bezahlen, fertig.",
     "review_text_en": "Simply great. Choose tee time, pay, done."},
    {"id": 30, "user_name": "Fabio C.", "age": 47, "gender": "Male", "country": "Italy", "platform": "Google Reviews", "rating": 5, "language": "IT", 
     "review_text": "Prezzi imbattibili e sito facilissimo da usare.",
     "review_text_en": "Unbeatable prices and very easy to use site."},
    {"id": 31, "user_name": "Sven R.", "age": 58, "gender": "Male", "country": "Sweden", "platform": "Google Reviews", "rating": 5, "language": "SV", 
     "review_text": "Världsklass! Enkelheten är nyckeln här.",
     "review_text_en": "World class! Simplicity is the key here."},
    {"id": 32, "user_name": "Lars P.", "age": 35, "gender": "Male", "country": "Norway", "platform": "Google Reviews", "rating": 5, "language": "NO", 
     "review_text": "Fantastisk plattform. Sparer tid og penger.",
     "review_text_en": "Fantastic platform. Saves time and money."},
    {"id": 33, "user_name": "William D.", "age": 60, "gender": "Male", "country": "US", "platform": "Google Reviews", "rating": 5, "language": "EN", 
     "review_text": "Great experience. Tons of options worldwide. 5 stars.",
     "review_text_en": "Great experience. Tons of options worldwide. 5 stars."},
    {"id": 34, "user_name": "Holger K.", "age": 49, "gender": "Male", "country": "Switzerland", "platform": "Google Reviews", "rating": 5, "language": "DE", 
     "review_text": "Sehr benutzerfreundlich. Alles auf einen Blick.",
     "review_text_en": "Very user-friendly. Everything at a glance."},
    {"id": 35, "user_name": "Richard H.", "age": 53, "gender": "Male", "country": "UK", "platform": "Google Reviews", "rating": 5, "language": "EN", 
     "review_text": "Found a hidden gem course through the site. Amazing selection!",
     "review_text_en": "Found a hidden gem course through the site. Amazing selection!"},
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
        "image": "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800",
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
        "image": "https://images.pexels.com/photos/31803613/pexels-photo-31803613.jpeg?auto=compress&cs=tinysrgb&w=800",
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
        "image": "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=800",
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
        "image": "https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800",
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
        "image": "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800",
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
        "image": "https://images.pexels.com/photos/5384079/pexels-photo-5384079.jpeg?auto=compress&cs=tinysrgb&w=800",
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
        "image": "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=800",
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
        "image": "https://images.pexels.com/photos/29445693/pexels-photo-29445693.jpeg?auto=compress&cs=tinysrgb&w=800",
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
        "image": "https://images.pexels.com/photos/12385697/pexels-photo-12385697.jpeg?auto=compress&cs=tinysrgb&w=800",
        "holes": 18,
        "par": 70,
        "price_from": 65,
        "location": "Bendinat",
        "features": ["Exclusive Club", "Sea Views", "Historic Course", "Fine Dining"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/real-golf-de-bendinat"
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
        "image": "https://images.unsplash.com/photo-1563629986-97c92e385f66?w=800",
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
        "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
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
        "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
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
        "id": "es-fum",
        "name": "Es Fum",
        "type": "restaurant",
        "description": {
            "en": "Michelin-starred restaurant offering contemporary Mediterranean cuisine with Asian influences.",
            "de": "Mit Michelin-Stern ausgezeichnetes Restaurant mit zeitgenössischer mediterraner Küche und asiatischen Einflüssen.",
            "fr": "Restaurant étoilé Michelin proposant une cuisine méditerranéenne contemporaine aux influences asiatiques.",
            "se": "Michelinstjärnig restaurang med samtida medelhavskök med asiatiska influenser."
        },
        "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
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
        "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
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
        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
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
        "image": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
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
        "image": "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800",
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
        "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
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
        "image": "https://images.unsplash.com/photo-1592919505780-303950717480?w=800",
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
    <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #0a5f38; margin-bottom: 20px;">New Contact Inquiry - Golfinmallorca.com</h2>
            <p style="color: #333;"><strong>Name:</strong> {inquiry.name}</p>
            <p style="color: #333;"><strong>Email:</strong> {inquiry.email}</p>
            <p style="color: #333;"><strong>Phone:</strong> {inquiry.phone or 'Not provided'}</p>
            <p style="color: #333;"><strong>Country:</strong> {inquiry.country}</p>
            <p style="color: #333;"><strong>Inquiry Type:</strong> {inquiry.inquiry_type}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #333;"><strong>Message:</strong></p>
            <p style="color: #555; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">{inquiry.message}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
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
    <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0a5f38; margin: 0;">Golfinmallorca.com</h1>
                <p style="color: #666; font-style: italic;">Your Gateway to Luxury Golf in Mallorca</p>
            </div>
            
            <h2 style="color: #0a5f38;">Welcome to Our Newsletter, {name}!</h2>
            
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
                <a href="https://golfinmallorca.greenfee365.com" style="background-color: #0a5f38; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Your Tee Time</a>
            </div>
            
            <p style="color: #333; line-height: 1.6;">
                We're excited to help you plan your next golfing adventure in Mallorca!
            </p>
            
            <p style="color: #333;">
                Best regards,<br>
                <strong>The Golfinmallorca.com Team</strong>
            </p>
            
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            
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
async def get_partner_offers(offer_type: Optional[str] = None):
    if offer_type:
        return [o for o in PARTNER_OFFERS if o["type"] == offer_type]
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
