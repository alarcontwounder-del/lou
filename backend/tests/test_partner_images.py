"""
Test suite for verifying partner images have been replaced with authentic/themed images.
Verifies NO Pexels URLs remain in the database for any partner category.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Expected counts based on the requirements
EXPECTED_HOTELS = 38
EXPECTED_RESTAURANTS = 54
EXPECTED_CAFE_BARS = 36
EXPECTED_BEACH_CLUBS = 12


class TestHotelsImages:
    """Test hotel images are non-Pexels and load correctly"""
    
    def test_hotels_endpoint_returns_data(self):
        """Verify /api/hotels returns data"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Hotels should return a list"
        print(f"Hotels returned: {len(data)} items")
    
    def test_hotels_count(self):
        """Verify all 38 hotels are returned"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        data = response.json()
        assert len(data) == EXPECTED_HOTELS, f"Expected {EXPECTED_HOTELS} hotels, got {len(data)}"
        print(f"✓ Hotels count: {len(data)}")
    
    def test_no_pexels_urls_in_hotels(self):
        """Verify NO hotels have Pexels image URLs"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        data = response.json()
        
        pexels_hotels = []
        for hotel in data:
            image_url = hotel.get('image', '')
            if 'pexels.com' in image_url.lower():
                pexels_hotels.append({
                    'id': hotel.get('id'),
                    'name': hotel.get('name'),
                    'image': image_url
                })
        
        if pexels_hotels:
            print(f"FAIL: Found {len(pexels_hotels)} hotels with Pexels URLs:")
            for h in pexels_hotels:
                print(f"  - {h['name']}: {h['image']}")
        
        assert len(pexels_hotels) == 0, f"Found {len(pexels_hotels)} hotels with Pexels URLs"
        print(f"✓ No Pexels URLs in hotels")
    
    def test_hotels_have_valid_images(self):
        """Verify all hotels have non-empty image URLs"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        data = response.json()
        
        missing_images = []
        for hotel in data:
            image_url = hotel.get('image', '')
            if not image_url or image_url.strip() == '':
                missing_images.append(hotel.get('name'))
        
        assert len(missing_images) == 0, f"Hotels with missing images: {missing_images}"
        print(f"✓ All {len(data)} hotels have image URLs")


class TestRestaurantsImages:
    """Test restaurant images are non-Pexels"""
    
    def test_restaurants_endpoint_returns_data(self):
        """Verify /api/restaurants returns data"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Restaurants should return a list"
        print(f"Restaurants returned: {len(data)} items")
    
    def test_restaurants_count(self):
        """Verify all 54 restaurants are returned"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        data = response.json()
        assert len(data) == EXPECTED_RESTAURANTS, f"Expected {EXPECTED_RESTAURANTS} restaurants, got {len(data)}"
        print(f"✓ Restaurants count: {len(data)}")
    
    def test_no_pexels_urls_in_restaurants(self):
        """Verify NO restaurants have Pexels image URLs"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        data = response.json()
        
        pexels_restaurants = []
        for restaurant in data:
            image_url = restaurant.get('image', '')
            if 'pexels.com' in image_url.lower():
                pexels_restaurants.append({
                    'id': restaurant.get('id'),
                    'name': restaurant.get('name'),
                    'image': image_url
                })
        
        if pexels_restaurants:
            print(f"FAIL: Found {len(pexels_restaurants)} restaurants with Pexels URLs:")
            for r in pexels_restaurants:
                print(f"  - {r['name']}: {r['image']}")
        
        assert len(pexels_restaurants) == 0, f"Found {len(pexels_restaurants)} restaurants with Pexels URLs"
        print(f"✓ No Pexels URLs in restaurants")
    
    def test_restaurants_have_valid_images(self):
        """Verify all restaurants have non-empty image URLs"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        data = response.json()
        
        missing_images = []
        for restaurant in data:
            image_url = restaurant.get('image', '')
            if not image_url or image_url.strip() == '':
                missing_images.append(restaurant.get('name'))
        
        assert len(missing_images) == 0, f"Restaurants with missing images: {missing_images}"
        print(f"✓ All {len(data)} restaurants have image URLs")


class TestCafeBarsImages:
    """Test cafe/bar images are non-Pexels"""
    
    def test_cafe_bars_endpoint_returns_data(self):
        """Verify /api/cafe-bars returns data"""
        response = requests.get(f"{BASE_URL}/api/cafe-bars")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Cafe bars should return a list"
        print(f"Cafe/Bars returned: {len(data)} items")
    
    def test_cafe_bars_count(self):
        """Verify all 36 cafe/bars are returned"""
        response = requests.get(f"{BASE_URL}/api/cafe-bars")
        data = response.json()
        assert len(data) == EXPECTED_CAFE_BARS, f"Expected {EXPECTED_CAFE_BARS} cafe/bars, got {len(data)}"
        print(f"✓ Cafe/Bars count: {len(data)}")
    
    def test_no_pexels_urls_in_cafe_bars(self):
        """Verify NO cafe/bars have Pexels image URLs"""
        response = requests.get(f"{BASE_URL}/api/cafe-bars")
        data = response.json()
        
        pexels_cafes = []
        for cafe in data:
            image_url = cafe.get('image', '')
            if 'pexels.com' in image_url.lower():
                pexels_cafes.append({
                    'id': cafe.get('id'),
                    'name': cafe.get('name'),
                    'image': image_url
                })
        
        if pexels_cafes:
            print(f"FAIL: Found {len(pexels_cafes)} cafe/bars with Pexels URLs:")
            for c in pexels_cafes:
                print(f"  - {c['name']}: {c['image']}")
        
        assert len(pexels_cafes) == 0, f"Found {len(pexels_cafes)} cafe/bars with Pexels URLs"
        print(f"✓ No Pexels URLs in cafe/bars")
    
    def test_cafe_bars_have_valid_images(self):
        """Verify all cafe/bars have non-empty image URLs"""
        response = requests.get(f"{BASE_URL}/api/cafe-bars")
        data = response.json()
        
        missing_images = []
        for cafe in data:
            image_url = cafe.get('image', '')
            if not image_url or image_url.strip() == '':
                missing_images.append(cafe.get('name'))
        
        assert len(missing_images) == 0, f"Cafe/bars with missing images: {missing_images}"
        print(f"✓ All {len(data)} cafe/bars have image URLs")


class TestBeachClubsImages:
    """Test beach club images are non-Pexels"""
    
    def test_beach_clubs_endpoint_returns_data(self):
        """Verify /api/beach-clubs returns data"""
        response = requests.get(f"{BASE_URL}/api/beach-clubs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Beach clubs should return a list"
        print(f"Beach clubs returned: {len(data)} items")
    
    def test_beach_clubs_count(self):
        """Verify all 12 beach clubs are returned"""
        response = requests.get(f"{BASE_URL}/api/beach-clubs")
        data = response.json()
        assert len(data) == EXPECTED_BEACH_CLUBS, f"Expected {EXPECTED_BEACH_CLUBS} beach clubs, got {len(data)}"
        print(f"✓ Beach clubs count: {len(data)}")
    
    def test_no_pexels_urls_in_beach_clubs(self):
        """Verify NO beach clubs have Pexels image URLs"""
        response = requests.get(f"{BASE_URL}/api/beach-clubs")
        data = response.json()
        
        pexels_clubs = []
        for club in data:
            image_url = club.get('image', '')
            if 'pexels.com' in image_url.lower():
                pexels_clubs.append({
                    'id': club.get('id'),
                    'name': club.get('name'),
                    'image': image_url
                })
        
        if pexels_clubs:
            print(f"FAIL: Found {len(pexels_clubs)} beach clubs with Pexels URLs:")
            for b in pexels_clubs:
                print(f"  - {b['name']}: {b['image']}")
        
        assert len(pexels_clubs) == 0, f"Found {len(pexels_clubs)} beach clubs with Pexels URLs"
        print(f"✓ No Pexels URLs in beach clubs")
    
    def test_beach_clubs_have_valid_images(self):
        """Verify all beach clubs have non-empty image URLs"""
        response = requests.get(f"{BASE_URL}/api/beach-clubs")
        data = response.json()
        
        missing_images = []
        for club in data:
            image_url = club.get('image', '')
            if not image_url or image_url.strip() == '':
                missing_images.append(club.get('name'))
        
        assert len(missing_images) == 0, f"Beach clubs with missing images: {missing_images}"
        print(f"✓ All {len(data)} beach clubs have image URLs")


class TestAllPartnersEndpoint:
    """Test the aggregated /api/all-partners endpoint"""
    
    def test_all_partners_endpoint(self):
        """Verify /api/all-partners returns all categories"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all categories are present
        assert 'hotels' in data, "Missing hotels in all-partners"
        assert 'restaurants' in data, "Missing restaurants in all-partners"
        assert 'beach_clubs' in data, "Missing beach_clubs in all-partners"
        assert 'cafe_bars' in data, "Missing cafe_bars in all-partners"
        
        print(f"All-partners endpoint returns:")
        print(f"  - Hotels: {len(data.get('hotels', []))}")
        print(f"  - Restaurants: {len(data.get('restaurants', []))}")
        print(f"  - Beach Clubs: {len(data.get('beach_clubs', []))}")
        print(f"  - Cafe/Bars: {len(data.get('cafe_bars', []))}")
    
    def test_no_pexels_in_all_partners(self):
        """Verify NO Pexels URLs in the all-partners aggregated endpoint"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        pexels_found = []
        
        for category, items in data.items():
            if isinstance(items, list):
                for item in items:
                    image_url = item.get('image', '')
                    if 'pexels.com' in image_url.lower():
                        pexels_found.append({
                            'category': category,
                            'id': item.get('id'),
                            'name': item.get('name'),
                            'image': image_url
                        })
        
        if pexels_found:
            print(f"FAIL: Found {len(pexels_found)} items with Pexels URLs:")
            for p in pexels_found:
                print(f"  - [{p['category']}] {p['name']}: {p['image']}")
        
        assert len(pexels_found) == 0, f"Found {len(pexels_found)} items with Pexels URLs in all-partners"
        print(f"✓ No Pexels URLs found in all-partners endpoint")


class TestImageSourceAnalysis:
    """Analyze image sources to verify authentic/themed images"""
    
    def test_image_sources_summary(self):
        """Print a summary of image sources used"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        source_counts = {
            'unsplash': 0,
            'pexels': 0,
            'cloudinary': 0,
            'hotel_official': 0,  # Direct hotel website URLs
            'local_static': 0,    # /api/static/ URLs
            'other': 0
        }
        
        all_items = []
        for category in ['hotels', 'restaurants', 'beach_clubs', 'cafe_bars']:
            items = data.get(category, [])
            for item in items:
                item['_category'] = category
                all_items.append(item)
        
        for item in all_items:
            image_url = item.get('image', '').lower()
            
            if 'unsplash.com' in image_url:
                source_counts['unsplash'] += 1
            elif 'pexels.com' in image_url:
                source_counts['pexels'] += 1
            elif 'cloudinary' in image_url:
                source_counts['cloudinary'] += 1
            elif '/api/static/' in image_url:
                source_counts['local_static'] += 1
            elif any(domain in image_url for domain in [
                'hilton.com', 'belmond.com', 'marriott.com', 'stregis.com',
                'purobeach.com', 'nikkibeach.com', 'besobeach.com', 'framerusercontent.com',
                '.hotel', 'hotels.com', 'sonbrull.com', 'simpsontravel.com',
                'bordoyhotels.com', 'yartanhotels.com', 'pletademar.com', 'cansimoneta.com'
            ]):
                source_counts['hotel_official'] += 1
            else:
                source_counts['other'] += 1
        
        print("\n=== IMAGE SOURCE ANALYSIS ===")
        print(f"Total items: {len(all_items)}")
        print(f"  Unsplash (themed): {source_counts['unsplash']}")
        print(f"  Pexels (SHOULD BE 0): {source_counts['pexels']}")
        print(f"  Cloudinary: {source_counts['cloudinary']}")
        print(f"  Official hotel/venue sites: {source_counts['hotel_official']}")
        print(f"  Local static: {source_counts['local_static']}")
        print(f"  Other sources: {source_counts['other']}")
        
        # CRITICAL: Pexels count must be 0
        assert source_counts['pexels'] == 0, f"Found {source_counts['pexels']} Pexels images!"
        print("\n✓ VERIFIED: No Pexels images in database")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
