"""
Migration script to populate nearest_golf and distance_km for all venues.
Uses known Mallorca geography to map venue locations to nearest golf courses.
"""
import os
from pymongo import MongoClient

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = 'test_database'

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Location → (nearest_golf_course_name, distance_in_km)
LOCATION_MAP = {
    # Palma area
    'palma': ('Son Vida Golf', 6),
    'palma (old town)': ('Son Vida Golf', 5),
    'palma (center)': ('Son Vida Golf', 6),
    'santa catalina': ('Son Vida Golf', 5.5),
    'la lonja, palma': ('Son Vida Golf', 5),
    'paseo marítimo, palma': ('Son Vida Golf', 5),
    # Son Vida / Arabella area
    'son vida': ('Son Vida Golf', 0.5),
    # Bendinat / Costa d'en Blanes / Portals area
    'bendinat': ('Real Golf De Bendinat', 1),
    "costa d'en blanes": ('Real Golf De Bendinat', 2),
    'puerto portals': ('Real Golf De Bendinat', 4),
    'portals nous': ('Real Golf De Bendinat', 3.5),
    # Southwest coast
    'santa ponsa': ('Golf Santa Ponsa I', 1.5),
    'palmanova': ('Real Golf De Bendinat', 5),
    'palma nova': ('Real Golf De Bendinat', 5),
    'magaluf': ('Golf Santa Ponsa I', 4),
    'port adriano': ('Golf Santa Ponsa I', 4),
    'calvià': ('Golf Santa Ponsa I', 6),
    'es capdellà': ('Golf Santa Ponsa I', 7),
    "port d'andratx": ('Golf Santa Ponsa I', 12),
    # North
    'alcúdia': ('Golf Alcanada', 5),
    "port d'alcúdia": ('Golf Alcanada', 4),
    'playa de muro': ('Golf Alcanada', 8),
    'pollença': ('Golf Alcanada', 12),
    'port de pollença': ('Golf Alcanada', 14),
    'pollensa': ('Golf Alcanada', 12),
    # Northwest / Tramuntana
    'deià': ('Son Vida Golf', 22),
    'sóller': ('Son Vida Golf', 25),
    'port de sóller': ('Son Vida Golf', 26),
    'valldemossa': ('Son Vida Golf', 15),
    'banyalbufar': ('Son Vida Golf', 28),
    'puigpunyent': ('Son Vida Golf', 12),
    'galilea': ('Son Vida Golf', 15),
    'escorca': ('Golf Alcanada', 25),
    'selva': ('Golf Alcanada', 20),
    'caimari': ('Golf Alcanada', 22),
    'alaró': ('Golf Son Gual', 18),
    'santa maria del camí': ('Golf Son Gual', 12),
    # East coast
    'canyamel': ('Capdepera Golf', 3),
    'capdepera': ('Capdepera Golf', 2),
    'cala ratjada': ('Capdepera Golf', 5),
    'cala rajada': ('Capdepera Golf', 5),
    'artà': ('Capdepera Golf', 10),
    'son servera': ('Pula Golf Resort', 3),
    'cala millor': ('Pula Golf Resort', 4),
    # Southeast
    "cala d'or": ('Vall D\'Or Golf', 10),
    "cala d'or marina": ('Vall D\'Or Golf', 10),
    'porto colom': ('Vall D\'Or Golf', 3),
    'portocolom': ('Vall D\'Or Golf', 3),
    'santanyí': ('Vall D\'Or Golf', 15),
    'felanitx': ('Vall D\'Or Golf', 8),
    # South
    'llucmajor': ('Son Antem Resort', 3),
    'cala blava': ('Son Antem Resort', 6),
    # Interior
    'montuïri': ('Golf Son Gual', 15),
    'sineu': ('Golf Son Gual', 20),
    'sineu (interior)': ('Golf Son Gual', 20),
    'sencelles': ('Golf Son Gual', 18),
    'cala estellencs': ('Golf Santa Ponsa I', 20),
    # Additional unaccented variants
    "port d'andratx": ('Golf Santa Ponsa I', 12),
    "port d'alcudia": ('Golf Alcanada', 4),
    'alcudia': ('Golf Alcanada', 5),
}

def normalize_location(loc):
    """Normalize location string for matching."""
    return loc.strip().lower().replace('\u2019', "'").replace('\u2018', "'")

def find_nearest_golf(location):
    """Find the nearest golf course for a given location."""
    loc = normalize_location(location)
    # Direct match
    if loc in LOCATION_MAP:
        return LOCATION_MAP[loc]
    # Partial match
    for key, val in LOCATION_MAP.items():
        if key in loc or loc in key:
            return val
    # Check if it contains 'palma'
    if 'palma' in loc:
        return ('Son Vida Golf', 6)
    return None

def update_collection(collection_name):
    """Update all documents in a collection with nearest_golf data."""
    collection = db[collection_name]
    docs = list(collection.find({}, {'_id': 1, 'name': 1, 'location': 1}))
    updated = 0
    skipped = 0
    for doc in docs:
        location = doc.get('location', '')
        if not location:
            print(f"  SKIP (no location): {doc.get('name')}")
            skipped += 1
            continue
        result = find_nearest_golf(location)
        if result:
            golf_name, distance = result
            collection.update_one(
                {'_id': doc['_id']},
                {'$set': {'nearest_golf': golf_name, 'distance_km': distance}}
            )
            print(f"  OK: {doc.get('name')} ({location}) → {golf_name} ({distance}km)")
            updated += 1
        else:
            print(f"  NO MATCH: {doc.get('name')} ({location})")
            skipped += 1
    return updated, skipped

print("=== Populating nearest golf course data ===\n")

for coll_name in ['hotels', 'restaurants', 'cafe_bars']:
    print(f"\n--- {coll_name.upper()} ---")
    u, s = update_collection(coll_name)
    print(f"  Updated: {u}, Skipped: {s}")

print("\n=== Done ===")
client.close()
