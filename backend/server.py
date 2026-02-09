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

# Static data for golf courses
GOLF_COURSES = [
    {
        "id": "son-gual",
        "name": "Golf Son Gual Mallorca",
        "description": {
            "en": "One of Europe's finest courses, Son Gual offers a world-class championship experience with stunning Mediterranean views.",
            "de": "Einer der besten Plätze Europas bietet Son Gual ein erstklassiges Championship-Erlebnis mit atemberaubendem Mittelmeerblick.",
            "fr": "L'un des meilleurs parcours d'Europe, Son Gual offre une expérience de championnat de classe mondiale avec des vues méditerranéennes époustouflantes.",
            "se": "En av Europas finaste banor, Son Gual erbjuder en världsklassig mästerskapsupplevelse med fantastisk Medelhavsutsikt."
        },
        "image": "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800",
        "holes": 18,
        "par": 72,
        "price_from": 85,
        "features": ["Championship Course", "Practice Range", "Pro Shop", "Restaurant"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-son-gual-mallorca"
    },
    {
        "id": "alcanada",
        "name": "Golf Alcanada",
        "description": {
            "en": "Nestled along the coast with breathtaking views of the lighthouse, Alcanada is a true gem of Mediterranean golf.",
            "de": "An der Küste gelegen mit atemberaubendem Blick auf den Leuchtturm, ist Alcanada ein wahres Juwel des mediterranen Golfs.",
            "fr": "Niché le long de la côte avec des vues imprenables sur le phare, Alcanada est un véritable joyau du golf méditerranéen.",
            "se": "Belägen längs kusten med hisnande utsikt över fyren, Alcanada är en sann pärla inom Medelhavsgolf."
        },
        "image": "https://images.unsplash.com/photo-1571928917219-478ae39b64ca?w=800",
        "holes": 18,
        "par": 72,
        "price_from": 115,
        "features": ["Ocean Views", "Clubhouse", "Golf Academy", "Spa"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-alcanada"
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
        "image": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800",
        "holes": 18,
        "par": 72,
        "price_from": 66,
        "features": ["3 Courses", "Tournament Host", "Driving Range", "Golf School"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-santa-ponsa"
    },
    {
        "id": "son-muntaner",
        "name": "Son Muntaner Golf",
        "description": {
            "en": "A challenging course designed by Kurt Rossknecht, featuring dramatic elevation changes and mountain views.",
            "de": "Ein anspruchsvoller Platz von Kurt Rossknecht mit dramatischen Höhenunterschieden und Bergblicken.",
            "fr": "Un parcours challenging conçu par Kurt Rossknecht, avec des changements d'élévation dramatiques et des vues sur les montagnes.",
            "se": "En utmanande bana designad av Kurt Rossknecht, med dramatiska höjdskillnader och bergsutsikt."
        },
        "image": "https://images.unsplash.com/photo-1592919505780-303950717480?w=800",
        "holes": 18,
        "par": 72,
        "price_from": 51,
        "features": ["Mountain Views", "Technical Design", "Wellness Center", "Fine Dining"],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/son-muntaner-golf"
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
