import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
load_dotenv()

async def get():
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client[os.environ.get('DB_NAME')]
    new_ids = [
        'petit-hotel-ses-cases-pula','steigenberger-golf-spa-camp-de-mar','lindner-hotel-mallorca-portal-nous',
        'la-reserva-rotana','hotel-inmood-alcanada','alcanada-golf-hotel','bordoy-alcudia-port-suites',
        'st-regis-mallorca-resort','zafiro-palace-andratx','hotel-alcudiamar-club','hotel-llenaire',
        'carrossa-hotel-spa','robinson-cala-serena','son-penya-petit-hotel','four-seasons-formentor',
        'el-vicenc-de-la-mar','hipotels-playa-de-palma-palace','hoposa-niu','the-donna-portals',
        'hospes-maricel','iberostar-selection-es-trenc'
    ]
    async for h in db.hotels.find({'id': {'$in': new_ids}}, {'_id': 0, 'id': 1, 'name': 1, 'contact_url': 1}):
        print(f"{h['name']}|{h['contact_url']}")
    client.close()

asyncio.run(get())
