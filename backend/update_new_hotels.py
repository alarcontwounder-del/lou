"""Update 21 new hotels with real photos and July pricing."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "test_database"

HOTEL_UPDATES = {
    "petit-hotel-ses-cases-pula": {
        "image": "https://images.pexels.com/photos/5868893/pexels-photo-5868893.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "offer_price": 180,
    },
    "steigenberger-golf-spa-camp-de-mar": {
        "image": "https://images.unsplash.com/photo-1724681450778-c42f4b889e6f?auto=format&w=800&q=80",
        "offer_price": 149,
    },
    "lindner-hotel-mallorca-portal-nous": {
        "image": "https://images.unsplash.com/photo-1745758432592-ea33a412cfa7?auto=format&w=800&q=80",
        "offer_price": 155,
    },
    "la-reserva-rotana": {
        "image": "https://images.unsplash.com/photo-1767045571528-650142c5eac7?auto=format&w=800&q=80",
        "offer_price": 245,
    },
    "hotel-inmood-alcanada": {
        "image": "https://images.unsplash.com/photo-1745761264681-a9dbd769de80?auto=format&w=800&q=80",
        "offer_price": 165,
    },
    "alcanada-golf-hotel": {
        "image": "https://images.unsplash.com/photo-1751914782942-3e09a6e85f1d?auto=format&w=800&q=80",
        "offer_price": 185,
    },
    "bordoy-alcudia-port-suites": {
        "image": "https://images.unsplash.com/photo-1759353672680-2d6cec70f73e?auto=format&w=800&q=80",
        "offer_price": 260,
    },
    "st-regis-mallorca-resort": {
        "image": "https://images.unsplash.com/photo-1760841392188-614e4f11c876?auto=format&w=800&q=80",
        "offer_price": 380,
    },
    "zafiro-palace-andratx": {
        "image": "https://images.pexels.com/photos/9400914/pexels-photo-9400914.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "offer_price": 280,
    },
    "hotel-alcudiamar-club": {
        "image": "https://images.unsplash.com/photo-1682194572950-274f7007dd39?auto=format&w=800&q=80",
        "offer_price": 120,
    },
    "hotel-llenaire": {
        "image": "https://images.pexels.com/photos/9119727/pexels-photo-9119727.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "offer_price": 135,
    },
    "carrossa-hotel-spa": {
        "image": "https://images.unsplash.com/photo-1684858473492-5366711646a8?auto=format&w=800&q=80",
        "offer_price": 245,
    },
    "robinson-cala-serena": {
        "image": "https://images.unsplash.com/photo-1634662984473-8d3d9c179f60?auto=format&w=800&q=80",
        "offer_price": 190,
    },
    "son-penya-petit-hotel": {
        "image": "https://images.unsplash.com/photo-1762926627939-a66e4fc17c2a?auto=format&w=800&q=80",
        "offer_price": 195,
    },
    "four-seasons-formentor": {
        "image": "https://images.pexels.com/photos/5156958/pexels-photo-5156958.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "offer_price": 890,
    },
    "el-vicenc-de-la-mar": {
        "image": "https://images.unsplash.com/photo-1762337013201-f5d07287d490?auto=format&w=800&q=80",
        "offer_price": 215,
    },
    "hipotels-playa-de-palma-palace": {
        "image": "https://images.pexels.com/photos/33818491/pexels-photo-33818491.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "offer_price": 165,
    },
    "hoposa-niu": {
        "image": "https://images.unsplash.com/photo-1740046272938-03014667cef3?auto=format&w=800&q=80",
        "offer_price": 125,
    },
    "the-donna-portals": {
        "image": "https://images.unsplash.com/photo-1692698913019-8197afe18fae?auto=format&w=800&q=80",
        "offer_price": 290,
    },
    "hospes-maricel": {
        "image": "https://images.pexels.com/photos/5899731/pexels-photo-5899731.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "offer_price": 180,
    },
    "iberostar-selection-es-trenc": {
        "image": "https://images.pexels.com/photos/6010420/pexels-photo-6010420.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "offer_price": 200,
    },
}


async def update():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    updated = []
    failed = []

    for hotel_id, data in HOTEL_UPDATES.items():
        try:
            result = await db.hotels.update_one(
                {"id": hotel_id},
                {
                    "$set": {
                        "image": data["image"],
                        "offer_price": data["offer_price"],
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )
            if result.modified_count > 0:
                updated.append(hotel_id)
            else:
                found = await db.hotels.find_one({"id": hotel_id})
                if found:
                    updated.append(f"{hotel_id} (no change)")
                else:
                    failed.append(f"{hotel_id}: NOT FOUND")
        except Exception as e:
            failed.append(f"{hotel_id}: {e}")

    print(f"\n=== Hotel Update Results ===")
    print(f"Updated: {len(updated)}")
    for h in updated:
        print(f"  + {h}")
    if failed:
        print(f"\nFailed: {len(failed)}")
        for f in failed:
            print(f"  ! {f}")

    # Verify
    print("\n=== Verification ===")
    for hotel_id in list(HOTEL_UPDATES.keys())[:3]:
        h = await db.hotels.find_one({"id": hotel_id}, {"_id": 0, "name": 1, "image": 1, "offer_price": 1})
        print(f"  {h}")

    client.close()


if __name__ == "__main__":
    asyncio.run(update())
