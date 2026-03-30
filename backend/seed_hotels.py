"""Seed script to add 21 new hotels to the database."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "golf_mallorca")

NEW_HOTELS = [
    {
        "id": "petit-hotel-ses-cases-pula",
        "name": "Petit Hôtel Ses Cases de Pula",
        "type": "hotel",
        "description": {
            "en": "Charming boutique hotel within the Pula Golf Resort, blending traditional Mallorcan architecture with modern luxury. Steps from the first tee.",
            "de": "Charmantes Boutique-Hotel im Pula Golf Resort, das traditionelle mallorquinische Architektur mit modernem Luxus verbindet. Nur wenige Schritte vom ersten Abschlag.",
            "fr": "Charmant hôtel boutique au sein du Pula Golf Resort, alliant architecture traditionnelle majorquine et luxe moderne. À quelques pas du premier départ.",
            "sv": "Charmigt boutiquehotell inom Pula Golf Resort som blandar traditionell mallorkinsk arkitektur med modern lyx. Några steg från första tee."
        },
        "image": "https://images.unsplash.com/photo-1633368098496-be7b5571547c?auto=format&w=800&q=80",
        "location": "Son Servera",
        "contact_url": "https://www.pfrhotels.com",
        "nearest_golf": "Pula Golf Resort",
        "distance_km": 0.2
    },
    {
        "id": "steigenberger-golf-spa-camp-de-mar",
        "name": "Steigenberger Golf & Spa Resort Camp de Mar",
        "type": "hotel",
        "description": {
            "en": "Premium golf resort in Camp de Mar with direct access to Golf de Andratx. Full-service spa, multiple restaurants, and stunning mountain views.",
            "de": "Premium-Golfresort in Camp de Mar mit direktem Zugang zum Golf de Andratx. Vollservice-Spa, mehrere Restaurants und atemberaubende Bergblicke.",
            "fr": "Resort golf premium à Camp de Mar avec accès direct au Golf de Andratx. Spa complet, plusieurs restaurants et vues magnifiques sur les montagnes.",
            "sv": "Premium golfresort i Camp de Mar med direkt tillgång till Golf de Andratx. Fullservice-spa, flera restauranger och fantastisk bergsutsikt."
        },
        "image": "https://images.unsplash.com/photo-1589776533480-a21ee7b7478f?auto=format&w=800&q=80",
        "location": "Camp de Mar",
        "contact_url": "https://www.steigenberger.com",
        "nearest_golf": "Golf de Andratx",
        "distance_km": 1.5
    },
    {
        "id": "lindner-hotel-mallorca-portal-nous",
        "name": "Lindner Hotel Mallorca Portal Nous",
        "type": "hotel",
        "description": {
            "en": "Modern 4-star hotel in Portal Nous with panoramic sea views, infinity pool, and excellent proximity to Bendinat and Son Vida golf courses.",
            "de": "Modernes 4-Sterne-Hotel in Portal Nous mit Panorama-Meerblick, Infinity-Pool und hervorragender Nähe zu den Golfplätzen Bendinat und Son Vida.",
            "fr": "Hôtel moderne 4 étoiles à Portal Nous avec vue panoramique sur la mer, piscine à débordement et excellente proximité des golfs de Bendinat et Son Vida.",
            "sv": "Modernt 4-stjärnigt hotell i Portal Nous med panoramautsikt över havet, infinity-pool och utmärkt närhet till golfbanorna Bendinat och Son Vida."
        },
        "image": "https://images.unsplash.com/photo-1692698904172-5b6ae3ec7900?auto=format&w=800&q=80",
        "location": "Portal Nous",
        "contact_url": "https://www.lindnerhotels.com",
        "nearest_golf": "Real Golf de Bendinat",
        "distance_km": 3
    },
    {
        "id": "la-reserva-rotana",
        "name": "La Reserva Rotana",
        "type": "hotel",
        "description": {
            "en": "Exclusive rural estate hotel near Manacor with its own 9-hole golf course, surrounded by vineyards and olive groves. A true hidden gem.",
            "de": "Exklusives ländliches Anwesen-Hotel bei Manacor mit eigenem 9-Loch-Golfplatz, umgeben von Weinbergen und Olivenhainen. Ein echtes Juwel.",
            "fr": "Hôtel de domaine rural exclusif près de Manacor avec son propre parcours de golf 9 trous, entouré de vignobles et d'oliveraies. Un véritable joyau.",
            "sv": "Exklusivt lantligt godshotell nära Manacor med egen 9-håls golfbana, omgivet av vingårdar och olivlundar. En sann dold pärla."
        },
        "image": "https://images.pexels.com/photos/27500284/pexels-photo-27500284.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "location": "Manacor",
        "contact_url": "https://www.reservarotana.com",
        "nearest_golf": "La Reserva Rotana Golf",
        "distance_km": 0.1
    },
    {
        "id": "hotel-inmood-alcanada",
        "name": "Hotel Inmood Alcanada",
        "type": "hotel",
        "description": {
            "en": "Stylish contemporary hotel near Alcanada Golf Club in the north of Mallorca. Minimalist design, rooftop terrace, and breathtaking bay views.",
            "de": "Stilvolles zeitgenössisches Hotel in der Nähe des Alcanada Golf Club im Norden Mallorcas. Minimalistisches Design, Dachterrasse und atemberaubende Buchtblicke.",
            "fr": "Hôtel contemporain élégant près du Club de Golf Alcanada au nord de Majorque. Design minimaliste, terrasse sur le toit et vues imprenables sur la baie.",
            "sv": "Stilfullt samtida hotell nära Alcanada Golf Club i norra Mallorca. Minimalistisk design, takterrass och hänförande buktvy."
        },
        "image": "https://images.unsplash.com/photo-1767045568259-8b3f3db8dabc?auto=format&w=800&q=80",
        "location": "Alcúdia",
        "contact_url": "https://www.inmoodhotels.com",
        "nearest_golf": "Golf Alcanada",
        "distance_km": 2
    },
    {
        "id": "alcanada-golf-hotel",
        "name": "Alcanada Golf Hotel",
        "type": "hotel",
        "description": {
            "en": "Perfectly positioned right at Golf Alcanada, this hotel offers the ultimate stay-and-play experience with views across the bay to the lighthouse.",
            "de": "Perfekt gelegen direkt am Golf Alcanada bietet dieses Hotel das ultimative Stay-and-Play-Erlebnis mit Blick über die Bucht zum Leuchtturm.",
            "fr": "Parfaitement situé au Golf Alcanada, cet hôtel offre l'expérience ultime séjour-et-jeu avec vue sur la baie et le phare.",
            "sv": "Perfekt beläget vid Golf Alcanada erbjuder detta hotell den ultimata bo-och-spela-upplevelsen med utsikt över bukten mot fyren."
        },
        "image": "https://images.unsplash.com/photo-1691322449342-37a5295098c8?auto=format&w=800&q=80",
        "location": "Alcúdia",
        "contact_url": "https://www.alcanadagolfhotel.com",
        "nearest_golf": "Golf Alcanada",
        "distance_km": 0.3
    },
    {
        "id": "bordoy-alcudia-port-suites",
        "name": "Bordoy Alcudia Port Suites",
        "type": "hotel",
        "description": {
            "en": "Modern all-suite hotel at Alcúdia's marina. Spacious rooms, rooftop pool with harbour views, and easy access to the north coast golf courses.",
            "de": "Modernes All-Suite-Hotel am Hafen von Alcúdia. Geräumige Zimmer, Dachpool mit Hafenblick und einfacher Zugang zu den Golfplätzen der Nordküste.",
            "fr": "Hôtel moderne tout-suite au port d'Alcúdia. Chambres spacieuses, piscine sur le toit avec vue sur le port et accès facile aux golfs de la côte nord.",
            "sv": "Modernt all-suite-hotell vid Alcúdias hamn. Rymliga rum, takpool med hamnvy och enkel tillgång till golfbanorna på nordkusten."
        },
        "image": "https://images.unsplash.com/photo-1767045558770-3a338e06d1f0?auto=format&w=800&q=80",
        "location": "Port d'Alcúdia",
        "contact_url": "https://www.bordoyhotels.com",
        "nearest_golf": "Golf Alcanada",
        "distance_km": 8
    },
    {
        "id": "st-regis-mallorca-resort",
        "name": "St. Regis Mallorca Resort",
        "type": "hotel",
        "description": {
            "en": "Ultra-luxury beachfront resort on Mallorca's east coast. World-class butler service, championship-level golf nearby, and pristine private beach.",
            "de": "Ultra-luxuriöses Strandresort an Mallorcas Ostküste. Erstklassiger Butler-Service, Championship-Golf in der Nähe und makelloser Privatstrand.",
            "fr": "Resort ultra-luxe en bord de mer sur la côte est de Majorque. Service de majordome de classe mondiale, golf de championnat à proximité et plage privée immaculée.",
            "sv": "Ultralyxig strandresort på Mallorcas östkust. Butlerservice i världsklass, mästerskapsgolf i närheten och orörda privata stränder."
        },
        "image": "https://images.pexels.com/photos/32797250/pexels-photo-32797250.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "location": "Costa d'en Blanes",
        "contact_url": "https://www.marriott.com/en-us/hotels/pmist-the-st-regis-mallorca-resort",
        "nearest_golf": "Golf Santa Ponsa",
        "distance_km": 10
    },
    {
        "id": "zafiro-palace-andratx",
        "name": "Zafiro Palace Andratx",
        "type": "hotel",
        "description": {
            "en": "5-star all-inclusive resort in Camp de Mar with spectacular infinity pools, gourmet dining, and privileged access to Golf de Andratx.",
            "de": "5-Sterne-All-Inclusive-Resort in Camp de Mar mit spektakulären Infinity-Pools, Gourmet-Küche und privilegiertem Zugang zum Golf de Andratx.",
            "fr": "Resort 5 étoiles tout inclus à Camp de Mar avec piscines à débordement spectaculaires, gastronomie et accès privilégié au Golf de Andratx.",
            "sv": "5-stjärnigt all inclusive-resort i Camp de Mar med spektakulära infinity-pooler, gourmetmat och privilegierad tillgång till Golf de Andratx."
        },
        "image": "https://images.unsplash.com/photo-1772555429580-4c0178b63e2e?auto=format&w=800&q=80",
        "location": "Camp de Mar",
        "contact_url": "https://www.zafirohotels.com",
        "nearest_golf": "Golf de Andratx",
        "distance_km": 2
    },
    {
        "id": "hotel-alcudiamar-club",
        "name": "Hotel Alcudiamar Club",
        "type": "hotel",
        "description": {
            "en": "Comfortable family-friendly hotel at Alcúdia's marina. Ideal base for golfers exploring the north with pools, sports facilities, and harbour-side dining.",
            "de": "Komfortables familienfreundliches Hotel am Hafen von Alcúdia. Ideale Basis für Golfer im Norden mit Pools, Sportanlagen und Restaurants am Hafen.",
            "fr": "Hôtel familial confortable au port d'Alcúdia. Base idéale pour les golfeurs du nord avec piscines, installations sportives et restaurants au port.",
            "sv": "Bekvämt familjevänligt hotell vid Alcúdias hamn. Perfekt bas för golfare som utforskar norra Mallorca med pooler, sportanläggningar och hamnrestauranger."
        },
        "image": "https://images.unsplash.com/photo-1642103113416-09b28121a37d?auto=format&w=800&q=80",
        "location": "Port d'Alcúdia",
        "contact_url": "https://www.alcudiamar.com",
        "nearest_golf": "Golf Alcanada",
        "distance_km": 9
    },
    {
        "id": "hotel-llenaire",
        "name": "Hotel Llenaire",
        "type": "hotel",
        "description": {
            "en": "Peaceful countryside hotel near Pollença with stunning Tramuntana mountain views. Perfect for combining golf at Pollença with hiking and relaxation.",
            "de": "Friedliches Landhotel bei Pollença mit atemberaubendem Blick auf die Tramuntana. Perfekt zum Golfspielen in Pollença kombiniert mit Wandern und Entspannung.",
            "fr": "Hôtel de campagne paisible près de Pollença avec vue imprenable sur la Tramuntana. Parfait pour combiner golf à Pollença avec randonnée et détente.",
            "sv": "Fridfullt lanthotell nära Pollença med fantastisk utsikt över Tramuntana. Perfekt för att kombinera golf vid Pollença med vandring och avkoppling."
        },
        "image": "https://images.unsplash.com/photo-1682194573479-83b1d6072253?auto=format&w=800&q=80",
        "location": "Pollença",
        "contact_url": "https://www.hotelllenaire.com",
        "nearest_golf": "Golf Pollença",
        "distance_km": 5
    },
    {
        "id": "carrossa-hotel-spa",
        "name": "Carrossa Hotel & Spa",
        "type": "hotel",
        "description": {
            "en": "Stunning 13th-century finca transformed into a luxury spa hotel near Artà. Olive groves, organic cuisine, and easy reach of Capdepera Golf.",
            "de": "Atemberaubende Finca aus dem 13. Jahrhundert, umgebaut in ein Luxus-Spa-Hotel bei Artà. Olivenhaine, Bio-Küche und leichter Zugang zum Capdepera Golf.",
            "fr": "Magnifique finca du XIIIe siècle transformée en hôtel spa de luxe près d'Artà. Oliveraies, cuisine bio et accès facile au Golf Capdepera.",
            "sv": "Fantastisk finca från 1200-talet omvandlad till lyxigt spahotell nära Artà. Olivlundar, ekologisk mat och nära till Capdepera Golf."
        },
        "image": "https://images.unsplash.com/photo-1717352599820-c14798fe9054?auto=format&w=800&q=80",
        "location": "Artà",
        "contact_url": "https://www.carrossa.com",
        "nearest_golf": "Capdepera Golf",
        "distance_km": 12
    },
    {
        "id": "robinson-cala-serena",
        "name": "Robinson Cala Serena",
        "type": "hotel",
        "description": {
            "en": "All-inclusive premium club resort in Cala Serena. Extensive sports programme, beach access, and close to Vall d'Or and Canyamel golf courses.",
            "de": "All-Inclusive Premium-Clubresort in Cala Serena. Umfangreiches Sportprogramm, Strandzugang und nahe der Golfplätze Vall d'Or und Canyamel.",
            "fr": "Club resort premium tout inclus à Cala Serena. Programme sportif étendu, accès à la plage et proche des golfs Vall d'Or et Canyamel.",
            "sv": "All inclusive premium klubbresort i Cala Serena. Omfattande sportprogram, strandtillgång och nära Vall d'Or och Canyamel golfbanor."
        },
        "image": "https://images.unsplash.com/photo-1767045572136-868c9407818b?auto=format&w=800&q=80",
        "location": "Cala Serena",
        "contact_url": "https://www.robinson.com",
        "nearest_golf": "Vall d'Or Golf",
        "distance_km": 6
    },
    {
        "id": "son-penya-petit-hotel",
        "name": "Son Penya Petit Hotel",
        "type": "hotel",
        "description": {
            "en": "Intimate 8-room boutique hotel in a restored Mallorcan manor. Personalised service, gorgeous gardens, and a tranquil escape between rounds.",
            "de": "Intimes 8-Zimmer-Boutique-Hotel in einem restaurierten mallorquinischen Herrenhaus. Persönlicher Service, wunderschöne Gärten und ein ruhiger Rückzugsort zwischen den Runden.",
            "fr": "Hôtel boutique intime de 8 chambres dans un manoir majorquin restauré. Service personnalisé, jardins magnifiques et une évasion tranquille entre les tours.",
            "sv": "Intimt 8-rums boutiquehotell i en restaurerad mallorkinsk herrgård. Personlig service, vackra trädgårdar och en fridfull tillflyktsort mellan rundorna."
        },
        "image": "https://images.unsplash.com/photo-1577980569495-3f840f9a0da8?auto=format&w=800&q=80",
        "location": "Son Servera",
        "contact_url": "https://www.sonpenya.com",
        "nearest_golf": "Pula Golf Resort",
        "distance_km": 4
    },
    {
        "id": "four-seasons-formentor",
        "name": "Four Seasons Resort Mallorca at Formentor",
        "type": "hotel",
        "description": {
            "en": "The legendary Formentor peninsula reborn as a Four Seasons masterpiece. Private beach, world-class spa, and a concierge to arrange your dream golf itinerary.",
            "de": "Die legendäre Halbinsel Formentor als Four Seasons Meisterwerk wiedergeboren. Privatstrand, Weltklasse-Spa und ein Concierge für Ihre Traum-Golf-Reise.",
            "fr": "La légendaire péninsule de Formentor renaît en chef-d'œuvre Four Seasons. Plage privée, spa de classe mondiale et concierge pour votre itinéraire golf de rêve.",
            "sv": "Den legendariska Formentor-halvön återfödd som ett Four Seasons-mästerverk. Privatstrand, spa i världsklass och concierge för din dröm-golfresa."
        },
        "image": "https://images.pexels.com/photos/2096983/pexels-photo-2096983.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "location": "Formentor",
        "contact_url": "https://www.fourseasons.com/mallorca",
        "nearest_golf": "Golf Pollença",
        "distance_km": 15
    },
    {
        "id": "el-vicenc-de-la-mar",
        "name": "El Vicenç de la Mar",
        "type": "hotel",
        "description": {
            "en": "Elegant clifftop hotel overlooking Cala Sant Vicenç with spectacular sunset views. Boutique suites, infinity pool, and authentic Mallorcan hospitality.",
            "de": "Elegantes Klippenhotel mit Blick auf Cala Sant Vicenç und spektakulären Sonnenuntergängen. Boutique-Suiten, Infinity-Pool und authentische mallorquinische Gastfreundschaft.",
            "fr": "Hôtel élégant en bord de falaise surplombant Cala Sant Vicenç avec des couchers de soleil spectaculaires. Suites boutique, piscine à débordement et hospitalité majorquine.",
            "sv": "Elegant klipphotell med utsikt över Cala Sant Vicenç med spektakulära solnedgångar. Boutiquesviter, infinity-pool och äkta mallorkinsk gästfrihet."
        },
        "image": "https://images.unsplash.com/photo-1767045558770-3a338e06d1f0?auto=format&w=800&q=80",
        "location": "Cala Sant Vicenç",
        "contact_url": "https://www.hotelvicenc.com",
        "nearest_golf": "Golf Pollença",
        "distance_km": 10
    },
    {
        "id": "hipotels-playa-de-palma-palace",
        "name": "Hipotels Playa de Palma Palace & Spa",
        "type": "hotel",
        "description": {
            "en": "Premium beachfront resort on Playa de Palma with full spa facilities. Ideal central location for accessing Son Antem and Son Gual golf courses.",
            "de": "Premium-Strandresort an der Playa de Palma mit vollem Spa-Angebot. Ideale zentrale Lage für den Zugang zu den Golfplätzen Son Antem und Son Gual.",
            "fr": "Resort premium en bord de mer à Playa de Palma avec spa complet. Emplacement central idéal pour accéder aux golfs Son Antem et Son Gual.",
            "sv": "Premium strandresort vid Playa de Palma med fullständig spa-anläggning. Perfekt centralt läge för att nå Son Antem och Son Gual golfbanor."
        },
        "image": "https://images.unsplash.com/photo-1767045572136-868c9407818b?auto=format&w=800&q=80",
        "location": "Playa de Palma",
        "contact_url": "https://www.hipotels.com",
        "nearest_golf": "Golf Son Gual",
        "distance_km": 8
    },
    {
        "id": "hoposa-niu",
        "name": "Hoposa Niu",
        "type": "hotel",
        "description": {
            "en": "Charming seaside hotel on Pollença Bay with direct beach access. Simple elegance, fresh seafood restaurant, and a laid-back north coast vibe.",
            "de": "Charmantes Strandhotel an der Bucht von Pollença mit direktem Strandzugang. Schlichte Eleganz, frisches Fischrestaurant und entspannte Nordküsten-Atmosphäre.",
            "fr": "Charmant hôtel en bord de mer dans la baie de Pollença avec accès direct à la plage. Élégance simple, restaurant de fruits de mer et ambiance détendue.",
            "sv": "Charmigt strandhotell vid Pollençabukten med direkt strandtillgång. Enkel elegans, restaurang med färska skaldjur och avslappnad nordkuststämning."
        },
        "image": "https://images.unsplash.com/photo-1682194573479-83b1d6072253?auto=format&w=800&q=80",
        "location": "Port de Pollença",
        "contact_url": "https://www.hoposa.com",
        "nearest_golf": "Golf Pollença",
        "distance_km": 4
    },
    {
        "id": "the-donna-portals",
        "name": "The Donna Portals",
        "type": "hotel",
        "description": {
            "en": "Ultra-chic boutique hotel in the exclusive Portals Nous area. Rooftop bar, designer interiors, and just minutes from Bendinat golf course.",
            "de": "Ultra-schickes Boutique-Hotel im exklusiven Portals Nous. Rooftop-Bar, Designer-Interieur und nur wenige Minuten vom Golfplatz Bendinat entfernt.",
            "fr": "Hôtel boutique ultra-chic dans le quartier exclusif de Portals Nous. Bar sur le toit, intérieurs design et à quelques minutes du golf de Bendinat.",
            "sv": "Ultra-chict boutiquehotell i exklusiva Portals Nous. Takbar, designerinredning och bara minuter från Bendinat golfbana."
        },
        "image": "https://images.unsplash.com/photo-1642103113416-09b28121a37d?auto=format&w=800&q=80",
        "location": "Portals Nous",
        "contact_url": "https://www.thedonnahotels.com",
        "nearest_golf": "Real Golf de Bendinat",
        "distance_km": 3
    },
    {
        "id": "hospes-maricel",
        "name": "Hospes Maricel",
        "type": "hotel",
        "description": {
            "en": "Iconic clifftop luxury hotel in Cas Català with a stunning infinity pool overlooking the Mediterranean. Bodyna Spa and gourmet dining on-site.",
            "de": "Ikonisches Luxushotel auf den Klippen von Cas Català mit atemberaubendem Infinity-Pool über dem Mittelmeer. Bodyna Spa und Gourmet-Küche vor Ort.",
            "fr": "Hôtel de luxe iconique perché sur les falaises de Cas Català avec piscine à débordement sur la Méditerranée. Spa Bodyna et gastronomie sur place.",
            "sv": "Ikoniskt lyxhotell på klipporna i Cas Català med fantastisk infinity-pool med utsikt över Medelhavet. Bodyna Spa och gourmetrestaurang."
        },
        "image": "https://images.unsplash.com/photo-1772555429580-4c0178b63e2e?auto=format&w=800&q=80",
        "location": "Cas Català",
        "contact_url": "https://www.hospes.com/en/mallorca-maricel",
        "nearest_golf": "Real Golf de Bendinat",
        "distance_km": 4
    },
    {
        "id": "iberostar-selection-es-trenc",
        "name": "Iberostar Selection Es Trenc",
        "type": "hotel",
        "description": {
            "en": "Beachfront eco-luxury resort near the pristine Es Trenc beach. Sustainable design, farm-to-table restaurants, and a relaxing south coast retreat.",
            "de": "Öko-Luxus-Strandresort nahe dem unberührten Strand Es Trenc. Nachhaltiges Design, Farm-to-Table-Restaurants und ein entspannender Rückzugsort an der Südküste.",
            "fr": "Resort éco-luxe en bord de mer près de la plage vierge d'Es Trenc. Design durable, restaurants farm-to-table et retraite relaxante sur la côte sud.",
            "sv": "Strandfronts eko-lyxresort nära den orörda stranden Es Trenc. Hållbar design, gård-till-bord-restauranger och avkopplande tillflykt på sydkusten."
        },
        "image": "https://images.pexels.com/photos/27500284/pexels-photo-27500284.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "location": "Sa Ràpita",
        "contact_url": "https://www.iberostar.com",
        "nearest_golf": "Golf Son Antem",
        "distance_km": 25
    }
]


async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    existing = []
    added = []
    skipped = []
    
    for hotel in NEW_HOTELS:
        found = await db.hotels.find_one({"id": hotel["id"]})
        if found:
            existing.append(hotel["name"])
            continue
        
        now = datetime.now(timezone.utc)
        hotel["is_active"] = True
        hotel["display_order"] = 0
        hotel["created_at"] = now
        hotel["updated_at"] = now
        
        try:
            await db.hotels.insert_one(hotel)
            hotel.pop("_id", None)
            added.append(hotel["name"])
        except Exception as e:
            skipped.append(f"{hotel['name']}: {e}")
    
    print(f"\n=== Hotel Seed Results ===")
    print(f"Added: {len(added)}")
    for h in added:
        print(f"  + {h}")
    if existing:
        print(f"\nAlready existed: {len(existing)}")
        for h in existing:
            print(f"  ~ {h}")
    if skipped:
        print(f"\nSkipped (errors): {len(skipped)}")
        for s in skipped:
            print(f"  ! {s}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
