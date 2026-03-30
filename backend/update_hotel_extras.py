"""Add category, region, and deal text to the 21 new hotels."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "test_database"

HOTEL_EXTRAS = {
    "petit-hotel-ses-cases-pula": {
        "category": "Boutique",
        "region": "Northeast",
        "deal": {
            "en": "Stay & Play: Pula Golf on your doorstep",
            "de": "Stay & Play: Pula Golf direkt vor der Tür",
            "fr": "Séjour & Golf: Pula Golf à votre porte",
            "sv": "Bo & Spela: Pula Golf vid din dörr",
        },
    },
    "steigenberger-golf-spa-camp-de-mar": {
        "category": "5-Star Golf Resort",
        "region": "Southwest",
        "deal": {
            "en": "Golf & Spa Package: Direct access to Golf de Andratx",
            "de": "Golf & Spa Paket: Direkter Zugang zum Golf de Andratx",
            "fr": "Forfait Golf & Spa: Accès direct au Golf de Andratx",
            "sv": "Golf & Spa-paket: Direkt tillgång till Golf de Andratx",
        },
    },
    "lindner-hotel-mallorca-portal-nous": {
        "category": "4-Star Superior Resort",
        "region": "Southwest",
        "deal": {
            "en": "Sea View & Golf: Close to Bendinat & Son Vida",
            "de": "Meerblick & Golf: Nahe Bendinat & Son Vida",
            "fr": "Vue Mer & Golf: Proche de Bendinat & Son Vida",
            "sv": "Havsutsikt & Golf: Nära Bendinat & Son Vida",
        },
    },
    "la-reserva-rotana": {
        "category": "Luxury Rural",
        "region": "Central Inland",
        "deal": {
            "en": "Private 9-hole course + vineyard dining included",
            "de": "Privater 9-Loch-Platz + Weinberg-Dinner inklusive",
            "fr": "Parcours privé 9 trous + dîner vignoble inclus",
            "sv": "Privat 9-hålsbana + vingårdsmiddag ingår",
        },
    },
    "hotel-inmood-alcanada": {
        "category": "Luxury Design",
        "region": "North",
        "deal": {
            "en": "Design Stay: Rooftop views & Alcanada Golf nearby",
            "de": "Design-Aufenthalt: Dachterrasse & Alcanada Golf in der Nähe",
            "fr": "Séjour Design: Vue rooftop & Golf Alcanada à proximité",
            "sv": "Designvistelse: Takterrass & Alcanada Golf i närheten",
        },
    },
    "alcanada-golf-hotel": {
        "category": "5-Star Golf Resort",
        "region": "North",
        "deal": {
            "en": "Ultimate Stay & Play at Golf Alcanada",
            "de": "Ultimatives Stay & Play am Golf Alcanada",
            "fr": "Séjour & Jeu ultime au Golf Alcanada",
            "sv": "Ultimat Bo & Spela vid Golf Alcanada",
        },
    },
    "bordoy-alcudia-port-suites": {
        "category": "Luxury Boutique",
        "region": "North",
        "deal": {
            "en": "All-Suite Marina Stay + North Coast golf access",
            "de": "All-Suite Hafen-Aufenthalt + Nordküsten-Golfzugang",
            "fr": "Séjour Marina All-Suite + accès golf côte nord",
            "sv": "All-Suite Marina-vistelse + tillgång till nordkustens golf",
        },
    },
    "st-regis-mallorca-resort": {
        "category": "Ultra Luxury",
        "region": "Southwest",
        "deal": {
            "en": "Butler Service + Curated Golf Itinerary",
            "de": "Butler-Service + Kuratierte Golf-Reise",
            "fr": "Service Majordome + Itinéraire Golf sur mesure",
            "sv": "Butlerservice + Skräddarsydd Golfresa",
        },
    },
    "zafiro-palace-andratx": {
        "category": "5-Star Resort",
        "region": "Southwest",
        "deal": {
            "en": "All-Inclusive + Golf de Andratx green fees",
            "de": "All-Inclusive + Golf de Andratx Greenfees",
            "fr": "Tout Inclus + green fees Golf de Andratx",
            "sv": "All Inclusive + Golf de Andratx greenfees",
        },
    },
    "hotel-alcudiamar-club": {
        "category": "4-Star Superior Resort",
        "region": "North",
        "deal": {
            "en": "Family Golf Break: Pool, sports & Alcanada Golf",
            "de": "Familien-Golfurlaub: Pool, Sport & Alcanada Golf",
            "fr": "Séjour Golf Famille: Piscine, sports & Golf Alcanada",
            "sv": "Familje-Golfresa: Pool, sport & Alcanada Golf",
        },
    },
    "hotel-llenaire": {
        "category": "Luxury Nature Retreat",
        "region": "North",
        "deal": {
            "en": "Tramuntana Retreat: Golf Pollença + hiking trails",
            "de": "Tramuntana-Rückzugsort: Golf Pollença + Wanderwege",
            "fr": "Retraite Tramuntana: Golf Pollença + randonnées",
            "sv": "Tramuntana-retreat: Golf Pollença + vandringsleder",
        },
    },
    "carrossa-hotel-spa": {
        "category": "Luxury Estate",
        "region": "Northeast",
        "deal": {
            "en": "Historic Finca Spa + Capdepera Golf access",
            "de": "Historisches Finca Spa + Capdepera Golf Zugang",
            "fr": "Spa Finca Historique + accès Golf Capdepera",
            "sv": "Historiskt Finca Spa + tillgång till Capdepera Golf",
        },
    },
    "robinson-cala-serena": {
        "category": "5-Star Resort",
        "region": "Southeast",
        "deal": {
            "en": "All-Inclusive Club + Vall d'Or & Canyamel Golf",
            "de": "All-Inclusive Club + Vall d'Or & Canyamel Golf",
            "fr": "Club Tout Inclus + Golf Vall d'Or & Canyamel",
            "sv": "All Inclusive Klubb + Vall d'Or & Canyamel Golf",
        },
    },
    "son-penya-petit-hotel": {
        "category": "Boutique",
        "region": "Northeast",
        "deal": {
            "en": "Intimate Escape: 8 rooms, personalised golf service",
            "de": "Intimer Rückzugsort: 8 Zimmer, persönlicher Golf-Service",
            "fr": "Évasion Intime: 8 chambres, service golf personnalisé",
            "sv": "Intimt Flykt: 8 rum, personlig golfservice",
        },
    },
    "four-seasons-formentor": {
        "category": "Ultra Luxury",
        "region": "North",
        "deal": {
            "en": "Legendary Formentor: Concierge golf itinerary + spa",
            "de": "Legendäres Formentor: Concierge Golf-Reise + Spa",
            "fr": "Légendaire Formentor: Itinéraire golf concierge + spa",
            "sv": "Legendariska Formentor: Concierge golfresa + spa",
        },
    },
    "el-vicenc-de-la-mar": {
        "category": "Luxury Seaview",
        "region": "North",
        "deal": {
            "en": "Clifftop Sunsets + Golf Pollença arrangement",
            "de": "Klippensonnenuntergänge + Golf Pollença Arrangement",
            "fr": "Couchers de soleil falaise + arrangement Golf Pollença",
            "sv": "Klippsolnedgångar + Golf Pollença-arrangemang",
        },
    },
    "hipotels-playa-de-palma-palace": {
        "category": "5-Star Modern Luxury",
        "region": "Palma",
        "deal": {
            "en": "Beach & Golf: Easy access to Son Antem & Son Gual",
            "de": "Strand & Golf: Einfacher Zugang zu Son Antem & Son Gual",
            "fr": "Plage & Golf: Accès facile Son Antem & Son Gual",
            "sv": "Strand & Golf: Enkel tillgång till Son Antem & Son Gual",
        },
    },
    "hoposa-niu": {
        "category": "Luxury Boutique",
        "region": "North",
        "deal": {
            "en": "Seaside Charm: Direct beach + Golf Pollença",
            "de": "Küstenzauber: Direkter Strand + Golf Pollença",
            "fr": "Charme Balnéaire: Plage directe + Golf Pollença",
            "sv": "Kustnära Charm: Direkt strand + Golf Pollença",
        },
    },
    "the-donna-portals": {
        "category": "Adults-Only Luxury",
        "region": "Southwest",
        "deal": {
            "en": "Ultra-Chic: Rooftop bar + Bendinat Golf minutes away",
            "de": "Ultra-Chic: Rooftop-Bar + Bendinat Golf in Minuten",
            "fr": "Ultra-Chic: Bar rooftop + Golf Bendinat à minutes",
            "sv": "Ultra-Chic: Takbar + Bendinat Golf minuter bort",
        },
    },
    "hospes-maricel": {
        "category": "Luxury Design",
        "region": "Southwest",
        "deal": {
            "en": "Iconic Clifftop: Infinity pool + Bendinat Golf",
            "de": "Ikonische Klippe: Infinity-Pool + Bendinat Golf",
            "fr": "Falaise Iconique: Piscine à débordement + Golf Bendinat",
            "sv": "Ikonisk Klippa: Infinity-pool + Bendinat Golf",
        },
    },
    "iberostar-selection-es-trenc": {
        "category": "Luxury Nature Retreat",
        "region": "Southeast",
        "deal": {
            "en": "Eco-Luxury: Pristine beach + Son Antem Golf",
            "de": "Öko-Luxus: Unberührter Strand + Son Antem Golf",
            "fr": "Éco-Luxe: Plage vierge + Golf Son Antem",
            "sv": "Eko-Lyx: Orörd strand + Son Antem Golf",
        },
    },
}


async def update():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    updated = []
    failed = []

    for hotel_id, data in HOTEL_EXTRAS.items():
        try:
            result = await db.hotels.update_one(
                {"id": hotel_id},
                {
                    "$set": {
                        "category": data["category"],
                        "region": data["region"],
                        "deal": data["deal"],
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )
            if result.modified_count > 0:
                updated.append(hotel_id)
            else:
                failed.append(f"{hotel_id}: no change or not found")
        except Exception as e:
            failed.append(f"{hotel_id}: {e}")

    print(f"\n=== Category/Region/Deal Update ===")
    print(f"Updated: {len(updated)}")
    if failed:
        print(f"Failed: {len(failed)}")
        for f in failed:
            print(f"  ! {f}")

    # Verify a sample
    h = await db.hotels.find_one({"id": "four-seasons-formentor"}, {"_id": 0, "name": 1, "category": 1, "region": 1, "deal": 1, "offer_price": 1})
    print(f"\nSample: {h}")

    client.close()


if __name__ == "__main__":
    asyncio.run(update())
