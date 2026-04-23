"""
New golf courses added on 2026-04-23.
Inserted automatically on FastAPI startup if missing from DB (production-safe).
Never re-activates courses the user has manually deactivated.
"""

NEW_GOLF_COURSES = [
    {
        "id": "golf-de-andratx",
        "name": "Golf de Andratx",
        "description": {
            "en": "One of the most demanding courses in the Mediterranean, featuring the legendary 'Green Monster' — hole 6, a 609m par-5, the longest in Spain. Designed by Gleneagles in the stunning southwest of Mallorca.",
            "de": "Einer der anspruchsvollsten Platze im Mittelmeerraum mit dem legendaren 'Green Monster' — Loch 6, ein 609m Par-5, das langste in Spanien. Entworfen von Gleneagles im Sudwesten Mallorcas.",
            "fr": "L'un des parcours les plus exigeants de la Mediterranee, avec le legendaire 'Green Monster' — trou 6, un par-5 de 609m, le plus long d'Espagne. Concu par Gleneagles au sud-ouest de Majorque.",
            "se": "En av de mest kravande banorna i Medelhavet, med det legendariska 'Green Monster' — hal 6, en 609m par-5, den langsta i Spanien. Designad av Gleneagles i sydvastra Mallorca."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/golf-de-andratx/golf-de-andratx",
        "holes": 18,
        "par": 72,
        "price_from": 140,
        "location": "Camp de Mar, Andratx",
        "features": [
            "Championship Course",
            "Driving Range",
            "Pro Shop",
            "Restaurant",
            "Buggy Hire",
            "Practice Bunker"
        ],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-de-andratx",
        "display_order": 16
    },
    {
        "id": "golf-maioris",
        "name": "Golf Maioris",
        "description": {
            "en": "A beautifully preserved course in a privileged Mallorcan setting with 300 days of sunshine. Featuring classic landscapes with olive and carob trees, Scottish-links front nine and American parkland back nine, plus a stunning island green on hole 4.",
            "de": "Ein wunderschon erhaltener Platz in privilegierter Lage auf Mallorca mit 300 Sonnentagen. Klassische Landschaft mit Oliven- und Johannisbrotbaumen, schottische Links vorne und amerikanischer Parkland hinten.",
            "fr": "Un parcours magnifiquement preserve dans un cadre majorquin privilegie avec 300 jours de soleil. Paysages classiques avec oliviers et caroubiers, links ecossais et parkland americain.",
            "se": "En vackert bevarad bana i ett privilegierat mallorkinsk landskap med 300 soldagar. Klassiska landskap med oliv- och johannesbrodtrad, skotska links framre nio och amerikansk parkland bakre nio."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/golf-maioris/golf-maioris",
        "holes": 18,
        "par": 72,
        "price_from": 63,
        "location": "Llucmajor",
        "features": [
            "Championship Course",
            "Driving Range",
            "Pro Shop",
            "Restaurant",
            "Buggy Hire",
            "Club Rental"
        ],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-maioris",
        "display_order": 17
    },
    {
        "id": "golf-son-termens",
        "name": "Golf Son Termes",
        "description": {
            "en": "Mallorca's most ecological golf course, just 10km from Palma on the scenic road to Valldemossa. Designed by Harris Group with superb greens nestled in the Tramuntana foothills, offering breathtaking mountain views and a unique, hilly terrain.",
            "de": "Mallorcas okologischster Golfplatz, nur 10 km von Palma auf dem Weg nach Valldemossa. Von der Harris Group entworfen, mit hervorragenden Greens in den Auslaufern der Tramuntana.",
            "fr": "Le parcours de golf le plus ecologique de Majorque, a seulement 10 km de Palma sur la route de Valldemossa. Concu par le Harris Group avec des greens superbes dans les contreforts de la Tramuntana.",
            "se": "Mallorcas mest ekologiska golfbana, bara 10 km fran Palma pa vagen till Valldemossa. Designad av Harris Group med fantastiska greener i Tramuntanabergens utlopare."
        },
        "image": "https://res.cloudinary.com/greenfee365/image/upload/w_800,h_600,c_fill/courses/golf-son-termens/golf-son-termens",
        "holes": 18,
        "par": 70,
        "price_from": 85,
        "location": "Bunyola",
        "features": [
            "Ecological Course",
            "Mountain Views",
            "Driving Range",
            "Pro Shop",
            "Restaurant",
            "Club Rental"
        ],
        "booking_url": "https://golfinmallorca.greenfee365.com/golf-course/golf-son-termens",
        "display_order": 18
    }
]
