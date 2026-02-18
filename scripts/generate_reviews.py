import pandas as pd

# Data for the 35 sample reviews
reviews_data = [
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

def generate_reviews_csv(data, filename="golf_mallorca_reviews.csv"):
    """Generate a CSV file from review data."""
    # Convert list of dictionaries to a DataFrame
    df = pd.DataFrame(data)
    
    # Save to CSV
    df.to_csv(filename, index=False, encoding='utf-8-sig')
    print(f"✅ Dataset successfully created: {filename}")
    return df

def add_new_reviews(new_reviews, existing_file="golf_mallorca_reviews.csv"):
    """Add new reviews to an existing CSV file."""
    try:
        existing_df = pd.read_csv(existing_file, encoding='utf-8-sig')
        new_df = pd.DataFrame(new_reviews)
        
        # Auto-increment IDs
        if len(existing_df) > 0:
            max_id = existing_df['id'].max()
            new_df['id'] = range(max_id + 1, max_id + 1 + len(new_df))
        
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        combined_df.to_csv(existing_file, index=False, encoding='utf-8-sig')
        print(f"✅ Added {len(new_reviews)} new reviews. Total: {len(combined_df)}")
        return combined_df
    except FileNotFoundError:
        print("File not found. Creating new file...")
        return generate_reviews_csv(new_reviews, existing_file)

def get_reviews_by_country(filename="golf_mallorca_reviews.csv"):
    """Get review statistics by country."""
    df = pd.read_csv(filename, encoding='utf-8-sig')
    return df.groupby('country').agg({
        'id': 'count',
        'rating': 'mean'
    }).rename(columns={'id': 'count', 'rating': 'avg_rating'})

def get_reviews_by_language(filename="golf_mallorca_reviews.csv"):
    """Get review statistics by language."""
    df = pd.read_csv(filename, encoding='utf-8-sig')
    return df.groupby('language').agg({
        'id': 'count',
        'rating': 'mean'
    }).rename(columns={'id': 'count', 'rating': 'avg_rating'})

# Run the generation
if __name__ == "__main__":
    # Generate the initial CSV
    df = generate_reviews_csv(reviews_data, "/app/data/golf_mallorca_reviews.csv")
    
    # Print statistics
    print(f"\n📊 Total reviews: {len(df)}")
    print(f"📊 Average rating: {df['rating'].mean():.1f}")
    print(f"\n🌍 Reviews by country:")
    print(df['country'].value_counts())
    print(f"\n🗣️ Reviews by language:")
    print(df['language'].value_counts())
