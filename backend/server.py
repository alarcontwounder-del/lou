from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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

# Real reviews data from CSV
REVIEWS_DATA = [
    {"id": 1, "user_name": "Hans-Jürgen S.", "age": 62, "gender": "Male", "country": "Germany", "platform": "Google Reviews", "rating": 5, "language": "DE", "review_text": "Habe kurzfristig eine Startzeit für Alcanada gesucht. Die Webseite ist extrem übersichtlich und der Buchungsvorgang war in 2 Minuten erledigt. Bestpreis garantiert! Sehr zu empfehlen."},
    {"id": 2, "user_name": "Mark T.", "age": 45, "gender": "Male", "country": "UK", "platform": "Google Reviews", "rating": 5, "language": "EN", "review_text": "Brilliant interface. Usually, booking golf abroad is a headache, but this was as easy as ordering a pizza. Got a great deal on a twilight round at Son Gual."},
    {"id": 3, "user_name": "Roberto P.", "age": 38, "gender": "Male", "country": "Italy", "platform": "Google Reviews", "rating": 5, "language": "IT", "review_text": "Processo di prenotazione fantastico. Ho trovato subito il campo che cercavo a Maiorca. Prezzi molto competitivi rispetto ad altri siti."},
    {"id": 4, "user_name": "Erik B.", "age": 51, "gender": "Male", "country": "Norway", "platform": "Google Reviews", "rating": 5, "language": "NO", "review_text": "Veldig enkel og grei bestilling. Fantastisk utvalg av baner. Kommer definitivt til å bruke Greenfee365 igjen neste gang vi skal til Spania."},
    {"id": 5, "user_name": "Sarah L.", "age": 29, "gender": "Female", "country": "US", "platform": "Google Reviews", "rating": 5, "language": "EN", "review_text": "User interface is 10/10. Super sleek and mobile-friendly. Booked my entire week of golf in Mallorca while waiting for my flight at the gate!"},
    {"id": 6, "user_name": "Jean-Pierre D.", "age": 68, "gender": "Male", "country": "France", "platform": "Google Reviews", "rating": 5, "language": "FR", "review_text": "Très efficace. J'ai eu un petit doute sur l'horaire et le service client a répondu immédiatement. Un inventaire impressionnant de parcours."},
    {"id": 7, "user_name": "Klaus M.", "age": 55, "gender": "Male", "country": "Switzerland", "platform": "Google Reviews", "rating": 5, "language": "DE", "review_text": "Reibungslose Abwicklung. Die Bestätigung kam sofort aufs Handy. Die Auswahl an Plätzen auf Mallorca ist unschlagbar."},
    {"id": 8, "user_name": "Anders G.", "age": 42, "gender": "Male", "country": "Sweden", "platform": "Google Reviews", "rating": 5, "language": "SV", "review_text": "Smidigaste bokningstjänsten jag testat. Bra priser och tydlig information om banorna."},
    {"id": 9, "user_name": "David W.", "age": 55, "gender": "Male", "country": "UK", "platform": "Trustpilot", "rating": 5, "language": "EN", "review_text": "I've used several booking sites, but Greenfee365 is the most intuitive. The 'Golf in Mallorca' portal is specifically great because it shows real-time availability."},
    {"id": 10, "user_name": "Stefan R.", "age": 34, "gender": "Male", "country": "Germany", "platform": "Trustpilot", "rating": 5, "language": "DE", "review_text": "Hervorragende Plattform. Die Preise sind oft besser als direkt beim Club. Man merkt, dass hier Profis am Werk sind."},
    {"id": 11, "user_name": "James P.", "age": 50, "gender": "Male", "country": "US", "platform": "Trustpilot", "rating": 5, "language": "EN", "review_text": "Not just Mallorca! I started using them for my local rounds too. The ease of use is consistent across the board."},
    {"id": 12, "user_name": "Luca M.", "age": 44, "gender": "Male", "country": "Italy", "platform": "Trustpilot", "rating": 5, "language": "IT", "review_text": "Prenotazione istantanea. Nessun problema al check-in nel club. Servizio eccellente."},
    {"id": 13, "user_name": "Olav H.", "age": 65, "gender": "Male", "country": "Norway", "platform": "Trustpilot", "rating": 5, "language": "NO", "review_text": "Veldig fornøyd. Bruker alltid denne siden når jeg reiser. De har de beste prisene på de mest populære banene."},
    {"id": 14, "user_name": "Thomas B.", "age": 41, "gender": "Male", "country": "UK", "platform": "TripAdvisor", "rating": 5, "language": "EN", "review_text": "A must-use for golfers visiting Mallorca. We booked 4 different courses through this site. The map view helped us pick courses near our hotel."},
    {"id": 15, "user_name": "Magnus K.", "age": 37, "gender": "Male", "country": "Sweden", "platform": "TripAdvisor", "rating": 5, "language": "SV", "review_text": "Perfekt för semestern. Allt fungerade klockrent, från betalning till spel. Rekommenderas varmt till alla golfare."},
    {"id": 16, "user_name": "Dieter L.", "age": 70, "gender": "Male", "country": "Germany", "platform": "TripAdvisor", "rating": 5, "language": "DE", "review_text": "Einfacher geht es nicht. Auch in meinem Alter ist die Seite sehr leicht zu bedienen. Wir hatten eine wunderbare Woche auf Mallorca."},
    {"id": 17, "user_name": "Michel R.", "age": 59, "gender": "Male", "country": "France", "platform": "TripAdvisor", "rating": 5, "language": "FR", "review_text": "Un choix incroyable de parcours. Le site est clair et les tarifs sont attractifs. Bravo pour la simplicité."},
    {"id": 18, "user_name": "Christian H.", "age": 33, "gender": "Male", "country": "Switzerland", "platform": "Capterra", "rating": 5, "language": "EN", "review_text": "The UX/UI is miles ahead of the competition. Fast loading times and a logical checkout flow."},
    {"id": 19, "user_name": "Markus W.", "age": 46, "gender": "Male", "country": "Germany", "platform": "G2", "rating": 5, "language": "DE", "review_text": "Beste API-Integration, die ich bisher bei Buchungsplattformen gesehen habe. Die Bestätigungen sind quasi instantan."},
    {"id": 20, "user_name": "Robert F.", "age": 28, "gender": "Male", "country": "US", "platform": "Capterra", "rating": 5, "language": "EN", "review_text": "Clean, modern, and does exactly what it says. It eliminates the friction of calling pro shops in different time zones."},
    {"id": 21, "user_name": "Peter S.", "age": 48, "gender": "Male", "country": "UK", "platform": "Yelp", "rating": 5, "language": "EN", "review_text": "Great prices! Saved about 20% on my green fees this trip compared to last year. The site is super straightforward."},
    {"id": 22, "user_name": "Alessandro V.", "age": 52, "gender": "Male", "country": "Italy", "platform": "Angi", "rating": 5, "language": "IT", "review_text": "Servizio clienti top. Ho dovuto spostare un tee time e lo hanno fatto senza problemi. Gentili e professionali."},
    {"id": 23, "user_name": "Fredrik T.", "age": 39, "gender": "Male", "country": "Norway", "platform": "Yelp", "rating": 5, "language": "NO", "review_text": "Beste prisene på nettet. Veldig imponert over hvor mange baner de har tilgjengelig over hele verden."},
    {"id": 24, "user_name": "Johan L.", "age": 44, "gender": "Male", "country": "Sweden", "platform": "Angi", "rating": 5, "language": "SV", "review_text": "Grym sida! Snabbt, enkelt och billigt. Kommer aldrig boka på något annat sätt igen."},
    {"id": 25, "user_name": "Kevin J.", "age": 31, "gender": "Male", "country": "US", "platform": "Product Hunt", "rating": 5, "language": "EN", "review_text": "Finally, a booking platform that feels like it belongs in 2026. The search filters are excellent."},
    {"id": 26, "user_name": "Tim O.", "age": 27, "gender": "Male", "country": "Germany", "platform": "Product Hunt", "rating": 5, "language": "DE", "review_text": "Love the design and the 'ease-of-booking' factor. It's the 'Booking.com' for golf."},
    {"id": 27, "user_name": "Luc B.", "age": 40, "gender": "Male", "country": "France", "platform": "Google Reviews", "rating": 5, "language": "FR", "review_text": "Rapide, efficace, et les meilleurs prix. Top !"},
    {"id": 28, "user_name": "Gary M.", "age": 56, "gender": "Male", "country": "UK", "platform": "Google Reviews", "rating": 5, "language": "EN", "review_text": "Best inventory of courses in Mallorca. Seamless booking."},
    {"id": 29, "user_name": "Bernd G.", "age": 63, "gender": "Male", "country": "Germany", "platform": "Google Reviews", "rating": 5, "language": "DE", "review_text": "Einfach klasse. Startzeit wählen, bezahlen, fertig."},
    {"id": 30, "user_name": "Fabio C.", "age": 47, "gender": "Male", "country": "Italy", "platform": "Google Reviews", "rating": 5, "language": "IT", "review_text": "Prezzi imbattibili e sito facilissimo da usare."},
    {"id": 31, "user_name": "Sven R.", "age": 58, "gender": "Male", "country": "Sweden", "platform": "Google Reviews", "rating": 5, "language": "SV", "review_text": "Världsklass! Enkelheten är nyckeln här."},
    {"id": 32, "user_name": "Lars P.", "age": 35, "gender": "Male", "country": "Norway", "platform": "Google Reviews", "rating": 5, "language": "NO", "review_text": "Fantastisk plattform. Sparer tid og penger."},
    {"id": 33, "user_name": "William D.", "age": 60, "gender": "Male", "country": "US", "platform": "Google Reviews", "rating": 5, "language": "EN", "review_text": "Great experience. Tons of options worldwide. 5 stars."},
    {"id": 34, "user_name": "Holger K.", "age": 49, "gender": "Male", "country": "Switzerland", "platform": "Google Reviews", "rating": 5, "language": "DE", "review_text": "Sehr benutzerfreundlich. Alles auf einen Blick."},
    {"id": 35, "user_name": "Richard H.", "age": 53, "gender": "Male", "country": "UK", "platform": "Google Reviews", "rating": 5, "language": "EN", "review_text": "Found a hidden gem course through the site. Amazing selection!"},
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
        "image": "https://images.unsplash.com/photo-1571928917219-478ae39b64ca?w=800",
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
        "image": "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800",
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
        "image": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
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
        "image": "https://images.unsplash.com/photo-1592919505780-303950717480?w=800",
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
        "image": "https://images.unsplash.com/photo-1600005082646-9cbc484dc498?w=800",
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
        "image": "https://images.unsplash.com/photo-1633683914580-3e54c3c0dc2c?w=800",
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
        "image": "https://images.unsplash.com/photo-1584704135557-d1e28d637b5a?w=800",
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
        "image": "https://images.unsplash.com/photo-1609889928035-9acefdfbeac2?w=800",
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
    return inquiry_obj

@api_router.get("/contact", response_model=List[ContactInquiry])
async def get_contact_inquiries():
    inquiries = await db.contact_inquiries.find({}, {"_id": 0}).to_list(1000)
    for inq in inquiries:
        if isinstance(inq['created_at'], str):
            inq['created_at'] = datetime.fromisoformat(inq['created_at'])
    return inquiries

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
async def get_reviews():
    # Get approved reviews from database
    db_reviews = await db.reviews.find({"approved": True}, {"_id": 0}).to_list(100)
    # Combine with sample reviews
    all_reviews = SAMPLE_REVIEWS + db_reviews
    return sorted(all_reviews, key=lambda x: x["created_at"], reverse=True)

@api_router.post("/reviews", response_model=dict)
async def create_review(review: ClientReviewCreate):
    review_obj = ClientReview(**review.model_dump())
    doc = review_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.reviews.insert_one(doc)
    return {"message": "Review submitted successfully. It will appear after approval.", "id": review_obj.id}

@api_router.get("/reviews/stats", response_model=dict)
async def get_review_stats():
    # Get all approved reviews
    db_reviews = await db.reviews.find({"approved": True}, {"_id": 0}).to_list(100)
    all_reviews = SAMPLE_REVIEWS + db_reviews
    
    if not all_reviews:
        return {"average_rating": 0, "total_reviews": 0, "rating_distribution": {}}
    
    total = len(all_reviews)
    avg = sum(r["rating"] for r in all_reviews) / total
    distribution = {i: len([r for r in all_reviews if r["rating"] == i]) for i in range(1, 6)}
    
    return {
        "average_rating": round(avg, 1),
        "total_reviews": total,
        "rating_distribution": distribution
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
