"""
Tests for all partner sections, duplicates check, and nearest_golf data
Testing: Hotels, Restaurants, Cafés & Bars, Beach Clubs
"""
import pytest
import requests
import os
from collections import Counter

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://booking-request-flow.preview.emergentagent.com').rstrip('/')

class TestAllPartnersEndpoint:
    """Tests for the /api/all-partners endpoint"""
    
    def test_all_partners_returns_200(self):
        """Verify endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ /api/all-partners returns 200")
    
    def test_all_partners_has_expected_keys(self):
        """Verify response has all expected partner categories"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        expected_keys = ['golf_courses', 'hotels', 'restaurants', 'cafe_bars', 'beach_clubs']
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"
            assert isinstance(data[key], list), f"{key} should be a list"
        
        print(f"✓ All expected keys present: {expected_keys}")
    
    def test_all_partners_counts(self):
        """Verify partner counts match expected values"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        # Expected counts from agent_to_agent_context
        expected_counts = {
            'golf_courses': 16,
            'hotels': 38,
            'restaurants': 48,
            'cafe_bars': 36,
            'beach_clubs': 12
        }
        
        for key, expected in expected_counts.items():
            actual = len(data.get(key, []))
            assert actual == expected, f"{key}: expected {expected}, got {actual}"
            print(f"✓ {key}: {actual} items (expected {expected})")


class TestNoDuplicates:
    """Tests for ensuring no duplicate entries"""
    
    def test_no_duplicate_names(self):
        """Verify no duplicate partner names across all categories"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        all_names = []
        for key in ['hotels', 'restaurants', 'cafe_bars', 'beach_clubs']:
            if key in data and isinstance(data[key], list):
                for item in data[key]:
                    all_names.append((key, item.get('name', 'Unknown')))
        
        name_counts = Counter([name for _, name in all_names])
        duplicates = {name: count for name, count in name_counts.items() if count > 1}
        
        assert len(duplicates) == 0, f"Duplicates found: {duplicates}"
        print(f"✓ No duplicates found among {len(all_names)} partners")
    
    def test_specific_partners_appear_once(self):
        """Verify specific partners appear exactly once (per requirements)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        check_names = ['DINS Santi Taura', 'Zaranda', 'Es Fum', 'Es Verger', 'Izakaya Mallorca', 'Es Fanals']
        
        for check_name in check_names:
            found = []
            for key in ['hotels', 'restaurants', 'cafe_bars', 'beach_clubs']:
                if key in data and isinstance(data[key], list):
                    for item in data[key]:
                        if check_name.lower() in item.get('name', '').lower():
                            found.append((key, item.get('name')))
            
            assert len(found) == 1, f"{check_name}: expected 1 occurrence, found {len(found)}"
            print(f"✓ {check_name}: appears exactly once")


class TestNearestGolfData:
    """Tests for nearest_golf data on partner cards"""
    
    def test_hotels_have_nearest_golf(self):
        """Verify all hotels have nearest_golf data"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        hotels = data.get('hotels', [])
        missing = [h.get('name') for h in hotels if not h.get('nearest_golf')]
        
        assert len(missing) == 0, f"Hotels missing nearest_golf: {missing}"
        print(f"✓ All {len(hotels)} hotels have nearest_golf data")
    
    def test_restaurants_have_nearest_golf(self):
        """Verify restaurants have nearest_golf data"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        restaurants = data.get('restaurants', [])
        with_golf = [r for r in restaurants if r.get('nearest_golf')]
        
        # Most restaurants should have nearest_golf
        assert len(with_golf) >= len(restaurants) * 0.9, f"Only {len(with_golf)}/{len(restaurants)} restaurants have nearest_golf"
        print(f"✓ {len(with_golf)}/{len(restaurants)} restaurants have nearest_golf data")
    
    def test_nearest_golf_format(self):
        """Verify nearest_golf data has correct format (name + distance)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        hotels = data.get('hotels', [])[:5]  # Sample first 5
        
        for hotel in hotels:
            if hotel.get('nearest_golf'):
                assert isinstance(hotel['nearest_golf'], str), f"{hotel['name']}: nearest_golf should be string"
                assert 'distance_km' in hotel, f"{hotel['name']}: missing distance_km"
                assert isinstance(hotel['distance_km'], (int, float)), f"{hotel['name']}: distance_km should be numeric"
                print(f"✓ {hotel['name']}: {hotel['distance_km']}km to {hotel['nearest_golf']}")
    
    def test_lobster_club_has_nearest_golf(self):
        """Verify Lobster Club specifically has nearest_golf (previously fixed)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        beach_clubs = data.get('beach_clubs', [])
        lobster = next((b for b in beach_clubs if 'lobster' in b.get('name', '').lower()), None)
        
        assert lobster is not None, "Lobster Club not found in beach_clubs"
        assert lobster.get('nearest_golf'), f"Lobster Club missing nearest_golf"
        assert lobster.get('distance_km'), f"Lobster Club missing distance_km"
        
        print(f"✓ Lobster Club: {lobster['distance_km']}km to {lobster['nearest_golf']}")


class TestPartnerDataIntegrity:
    """Tests for partner data completeness"""
    
    def test_hotels_have_required_fields(self):
        """Verify hotels have all required fields"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        required_fields = ['id', 'name', 'image', 'location', 'description']
        hotels = data.get('hotels', [])
        
        for hotel in hotels[:10]:  # Sample first 10
            for field in required_fields:
                assert field in hotel, f"{hotel.get('name', 'Unknown')}: missing {field}"
        
        print(f"✓ First 10 hotels have all required fields")
    
    def test_restaurants_have_required_fields(self):
        """Verify restaurants have all required fields"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        required_fields = ['id', 'name', 'image', 'location', 'description']
        restaurants = data.get('restaurants', [])
        
        for restaurant in restaurants[:10]:  # Sample first 10
            for field in required_fields:
                assert field in restaurant, f"{restaurant.get('name', 'Unknown')}: missing {field}"
        
        print(f"✓ First 10 restaurants have all required fields")
    
    def test_images_are_not_pexels(self):
        """Verify no images are from Pexels (per previous cleanup)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        pexels_urls = []
        for key in ['hotels', 'restaurants', 'cafe_bars', 'beach_clubs']:
            if key in data and isinstance(data[key], list):
                for item in data[key]:
                    image = item.get('image', '')
                    if 'pexels' in image.lower():
                        pexels_urls.append((key, item.get('name'), image))
        
        assert len(pexels_urls) == 0, f"Pexels URLs found: {pexels_urls}"
        print(f"✓ No Pexels URLs found in any partner")


class TestIndividualEndpoints:
    """Tests for individual partner endpoints"""
    
    def test_hotels_endpoint(self):
        """Test /api/hotels endpoint"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 38
        print(f"✓ /api/hotels: {len(data)} hotels")
    
    def test_restaurants_endpoint(self):
        """Test /api/restaurants endpoint"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 48
        print(f"✓ /api/restaurants: {len(data)} restaurants")
    
    def test_cafe_bars_endpoint(self):
        """Test /api/cafe-bars endpoint"""
        response = requests.get(f"{BASE_URL}/api/cafe-bars")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 36
        print(f"✓ /api/cafe-bars: {len(data)} cafes/bars")
    
    def test_beach_clubs_endpoint(self):
        """Test /api/beach-clubs endpoint"""
        response = requests.get(f"{BASE_URL}/api/beach-clubs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 12
        print(f"✓ /api/beach-clubs: {len(data)} beach clubs")
    
    def test_golf_courses_endpoint(self):
        """Test /api/golf-courses endpoint"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 16
        print(f"✓ /api/golf-courses: {len(data)} golf courses")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
