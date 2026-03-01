"""
Seed script for migrating ALL partner data to MongoDB.
Collections: hotels, restaurants, beach_clubs, cafe_bars

Run with: python seed_all_partners.py
Reset with: python seed_all_partners.py --reset
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


async def get_partners_from_server():
    """Extract partner data from server.py PARTNER_OFFERS"""
    # Import the data directly from server.py
    import sys
    sys.path.insert(0, str(ROOT_DIR))
    
    # We need to read and parse the PARTNER_OFFERS from server.py
    server_path = ROOT_DIR / 'server.py'
    with open(server_path, 'r') as f:
        content = f.read()
    
    # Find PARTNER_OFFERS list
    start_idx = content.find('PARTNER_OFFERS = [')
    if start_idx == -1:
        raise ValueError("Could not find PARTNER_OFFERS in server.py")
    
    # Find the matching closing bracket
    bracket_count = 0
    end_idx = start_idx
    for i, char in enumerate(content[start_idx:]):
        if char == '[':
            bracket_count += 1
        elif char == ']':
            bracket_count -= 1
            if bracket_count == 0:
                end_idx = start_idx + i + 1
                break
    
    # Execute the extracted code to get the data
    partner_code = content[start_idx:end_idx]
    local_vars = {}
    exec(partner_code, {}, local_vars)
    
    return local_vars['PARTNER_OFFERS']


async def seed_all_partners():
    """Seed all partner collections"""
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🚀 Starting full partner data migration...")
    
    # Get all partner data
    partners = await get_partners_from_server()
    print(f"📦 Found {len(partners)} total partner records")
    
    # Categorize by type
    hotels = [p for p in partners if p.get('type') == 'hotel']
    restaurants = [p for p in partners if p.get('type') == 'restaurant']
    beach_clubs = [p for p in partners if p.get('type') == 'beach_club']
    cafe_bars = [p for p in partners if p.get('type') == 'cafe_bar']
    
    print(f"  🏨 Hotels: {len(hotels)}")
    print(f"  🍽️  Restaurants: {len(restaurants)}")
    print(f"  🏖️  Beach Clubs: {len(beach_clubs)}")
    print(f"  ☕ Cafés & Bars: {len(cafe_bars)}")
    
    now = datetime.now(timezone.utc)
    
    # Helper to add metadata
    def add_metadata(items):
        result = []
        for i, item in enumerate(items):
            doc = {
                **item,
                "is_active": True,
                "display_order": i,
                "created_at": now,
                "updated_at": now
            }
            result.append(doc)
        return result
    
    # Migrate Hotels
    print("\n🏨 Migrating Hotels...")
    await db.hotels.delete_many({})
    if hotels:
        hotels_docs = add_metadata(hotels)
        result = await db.hotels.insert_many(hotels_docs)
        await db.hotels.create_index("id", unique=True)
        await db.hotels.create_index("display_order")
        print(f"   ✅ Inserted {len(result.inserted_ids)} hotels")
    
    # Migrate Restaurants
    print("\n🍽️  Migrating Restaurants...")
    await db.restaurants.delete_many({})
    if restaurants:
        restaurants_docs = add_metadata(restaurants)
        result = await db.restaurants.insert_many(restaurants_docs)
        await db.restaurants.create_index("id", unique=True)
        await db.restaurants.create_index("display_order")
        print(f"   ✅ Inserted {len(result.inserted_ids)} restaurants")
    
    # Migrate Beach Clubs
    print("\n🏖️  Migrating Beach Clubs...")
    await db.beach_clubs.delete_many({})
    if beach_clubs:
        beach_clubs_docs = add_metadata(beach_clubs)
        result = await db.beach_clubs.insert_many(beach_clubs_docs)
        await db.beach_clubs.create_index("id", unique=True)
        await db.beach_clubs.create_index("display_order")
        print(f"   ✅ Inserted {len(result.inserted_ids)} beach clubs")
    
    # Migrate Cafés & Bars
    print("\n☕ Migrating Cafés & Bars...")
    await db.cafe_bars.delete_many({})
    if cafe_bars:
        cafe_bars_docs = add_metadata(cafe_bars)
        result = await db.cafe_bars.insert_many(cafe_bars_docs)
        await db.cafe_bars.create_index("id", unique=True)
        await db.cafe_bars.create_index("display_order")
        print(f"   ✅ Inserted {len(result.inserted_ids)} cafés & bars")
    
    # Summary
    print("\n" + "="*50)
    print("🎉 MIGRATION COMPLETE!")
    print("="*50)
    
    # Verify counts
    hotel_count = await db.hotels.count_documents({})
    restaurant_count = await db.restaurants.count_documents({})
    beach_club_count = await db.beach_clubs.count_documents({})
    cafe_bar_count = await db.cafe_bars.count_documents({})
    golf_count = await db.golf_courses.count_documents({})
    
    print(f"\n📊 Database Summary:")
    print(f"   🏌️ Golf Courses: {golf_count}")
    print(f"   🏨 Hotels: {hotel_count}")
    print(f"   🍽️  Restaurants: {restaurant_count}")
    print(f"   🏖️  Beach Clubs: {beach_club_count}")
    print(f"   ☕ Cafés & Bars: {cafe_bar_count}")
    print(f"   ─────────────────")
    print(f"   📦 Total: {golf_count + hotel_count + restaurant_count + beach_club_count + cafe_bar_count}")
    
    client.close()


async def reset_all_partners():
    """Reset all partner collections to seed data"""
    print("🔄 Resetting all partner data...")
    await seed_all_partners()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        asyncio.run(reset_all_partners())
    else:
        asyncio.run(seed_all_partners())
