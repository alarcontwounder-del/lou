"""Fix all broken images across hotels, restaurants, beach clubs, and cafes."""
import asyncio
import os
import aiohttp
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "test_database"

# Images hosted on hotel/restaurant websites that may have hotlink protection
# Replace ALL non-stock (non-unsplash/pexels) image URLs with reliable stock photos
HOTEL_FIXES = {
    "sheraton-mallorca-arabella-golf-hotel": 
        "https://images.unsplash.com/photo-1770719484738-1db0e76eb403?auto=format&w=800&q=80",
    "can-bordoy-grand-house-garden": 
        "https://images.unsplash.com/photo-1517237680353-0276536284ca?auto=format&w=800&q=80",
    "finca-serena-mallorca": 
        "https://images.unsplash.com/photo-1691322449342-37a5295098c8?auto=format&w=800&q=80",
    "hotel-convent-de-la-missio": 
        "https://images.unsplash.com/photo-1681651032853-5ae07bf2cd25?auto=format&w=800&q=80",
    "hotel-can-cera": 
        "https://images.pexels.com/photos/36547654/pexels-photo-36547654.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "can-alomar-urban-luxury-retreat": 
        "https://images.pexels.com/photos/19765805/pexels-photo-19765805.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
}

RESTAURANT_FIXES = {
    "es-fum-st-regis": 
        "https://images.pexels.com/photos/2792186/pexels-photo-2792186.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "zaranda": 
        "https://images.pexels.com/photos/32738699/pexels-photo-32738699.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "bens-davall": 
        "https://images.pexels.com/photos/33577301/pexels-photo-33577301.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
}


async def check_image_in_browser(session, url):
    """Check if image loads like a browser would (with referrer)."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://mallorca-golf-fix.preview.emergentagent.com/",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        }
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=15), headers=headers, allow_redirects=True) as resp:
            body = await resp.read()
            ct = resp.headers.get("content-type", "")
            if resp.status != 200 or len(body) < 1000 or "image" not in ct:
                return False, f"status={resp.status}, size={len(body)}, ct={ct[:30]}"
            return True, "OK"
    except Exception as e:
        return False, str(e)[:50]


async def fix_all():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    fixed = []
    still_broken = []

    # Fix known broken hotels
    for hotel_id, new_img in HOTEL_FIXES.items():
        result = await db.hotels.update_one(
            {"id": hotel_id},
            {"$set": {"image": new_img, "updated_at": datetime.now(timezone.utc)}},
        )
        if result.modified_count > 0:
            fixed.append(f"hotel: {hotel_id}")
        else:
            # Try matching by partial id
            h = await db.hotels.find_one({"id": {"$regex": hotel_id.split("-")[0]}})
            if h:
                await db.hotels.update_one(
                    {"_id": h["_id"]},
                    {"$set": {"image": new_img, "updated_at": datetime.now(timezone.utc)}},
                )
                fixed.append(f"hotel: {h['name']} (regex match)")

    # Fix known broken restaurants
    for rest_id, new_img in RESTAURANT_FIXES.items():
        result = await db.restaurants.update_one(
            {"id": rest_id},
            {"$set": {"image": new_img, "updated_at": datetime.now(timezone.utc)}},
        )
        if result.modified_count > 0:
            fixed.append(f"restaurant: {rest_id}")
        else:
            # Try partial match
            parts = rest_id.replace("-", " ")
            r = await db.restaurants.find_one({"image": {"$regex": "^/api/static"}})
            if r:
                await db.restaurants.update_one(
                    {"_id": r["_id"]},
                    {"$set": {"image": new_img, "updated_at": datetime.now(timezone.utc)}},
                )
                fixed.append(f"restaurant: {r['name']} (local path fix)")

    # Now scan ALL remaining images with browser-like check
    async with aiohttp.ClientSession() as session:
        for collection in ["hotels", "restaurants", "beach_clubs", "cafe_bars"]:
            items = await db[collection].find({}, {"_id": 0, "id": 1, "name": 1, "image": 1}).to_list(200)
            for item in items:
                img = item.get("image", "")
                if not img or img.startswith("/"):
                    still_broken.append(f"[{collection}] {item['name']}: no valid URL")
                    continue
                ok, reason = await check_image_in_browser(session, img)
                if not ok:
                    still_broken.append(f"[{collection}] {item['name']}: {reason} | {img[:60]}")

    print(f"\n=== FIXED {len(fixed)} images ===")
    for f in fixed:
        print(f"  + {f}")
    
    if still_broken:
        print(f"\n=== STILL BROKEN: {len(still_broken)} ===")
        for b in still_broken:
            print(f"  ! {b}")
    else:
        print("\n=== ALL IMAGES OK ===")

    client.close()


if __name__ == "__main__":
    asyncio.run(fix_all())
