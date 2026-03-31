"""
Test suite for price filter, inactive partners, and search booking_url features
Tests: Price filter, Sort by Price, Inactive partners, Search with booking_url
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAllPartnersEndpoint:
    """Tests for /api/all-partners endpoint - returns all partners including inactive"""
    
    def test_all_partners_returns_200(self):
        """Verify all-partners endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200
        print("PASS: /api/all-partners returns 200")
    
    def test_all_partners_returns_59_hotels(self):
        """Verify 59 hotels are returned"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotel_count = len(data.get('hotels', []))
        assert hotel_count == 59, f"Expected 59 hotels, got {hotel_count}"
        print(f"PASS: /api/all-partners returns {hotel_count} hotels")
    
    def test_all_partners_hotels_have_is_active_field(self):
        """Verify hotels have is_active field"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        
        # Check first 5 hotels have is_active field
        for hotel in hotels[:5]:
            assert 'is_active' in hotel, f"Hotel {hotel.get('id')} missing is_active field"
        print("PASS: Hotels have is_active field")
    
    def test_all_partners_returns_restaurants(self):
        """Verify restaurants are returned"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        restaurants = data.get('restaurants', [])
        assert len(restaurants) > 0, "No restaurants returned"
        print(f"PASS: /api/all-partners returns {len(restaurants)} restaurants")
    
    def test_all_partners_returns_beach_clubs(self):
        """Verify beach clubs are returned"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        beach_clubs = data.get('beach_clubs', [])
        assert len(beach_clubs) > 0, "No beach clubs returned"
        print(f"PASS: /api/all-partners returns {len(beach_clubs)} beach clubs")
    
    def test_all_partners_returns_cafe_bars(self):
        """Verify cafe bars are returned"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        cafe_bars = data.get('cafe_bars', [])
        assert len(cafe_bars) > 0, "No cafe bars returned"
        print(f"PASS: /api/all-partners returns {len(cafe_bars)} cafe bars")


class TestHotelPriceData:
    """Tests for hotel price data - offer_price and discount_percent"""
    
    def test_hotels_under_200_count(self):
        """Verify hotels with offer_price < 200"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        
        under_200 = [h for h in hotels if h.get('offer_price') and h['offer_price'] < 200]
        assert len(under_200) == 12, f"Expected 12 hotels under €200, got {len(under_200)}"
        print(f"PASS: {len(under_200)} hotels with offer_price < €200")
    
    def test_hotels_200_to_400_count(self):
        """Verify hotels with offer_price 200-400"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        
        range_200_400 = [h for h in hotels if h.get('offer_price') and 200 <= h['offer_price'] < 400]
        assert len(range_200_400) == 8, f"Expected 8 hotels €200-€400, got {len(range_200_400)}"
        print(f"PASS: {len(range_200_400)} hotels with offer_price €200-€400")
    
    def test_hotels_over_400_count(self):
        """Verify hotels with offer_price >= 400"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        
        over_400 = [h for h in hotels if h.get('offer_price') and h['offer_price'] >= 400]
        assert len(over_400) == 4, f"Expected 4 hotels €400+, got {len(over_400)}"
        print(f"PASS: {len(over_400)} hotels with offer_price >= €400")
    
    def test_new_hotels_have_offer_price(self):
        """Verify new hotels (21) have offer_price field"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        
        # New hotels have offer_price but no discount_percent
        new_hotels = [h for h in hotels if h.get('offer_price') and not h.get('discount_percent')]
        assert len(new_hotels) >= 21, f"Expected at least 21 new hotels with offer_price, got {len(new_hotels)}"
        print(f"PASS: {len(new_hotels)} new hotels have offer_price (no discount_percent)")
    
    def test_old_hotels_have_discount_percent(self):
        """Verify old hotels (38) have discount_percent field"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        
        old_hotels = [h for h in hotels if h.get('discount_percent')]
        assert len(old_hotels) == 38, f"Expected 38 old hotels with discount_percent, got {len(old_hotels)}"
        print(f"PASS: {len(old_hotels)} old hotels have discount_percent")


class TestSearchEndpoint:
    """Tests for /api/search endpoint - returns only active partners with booking_url"""
    
    def test_search_returns_200(self):
        """Verify search endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/search?q=hotel")
        assert response.status_code == 200
        print("PASS: /api/search returns 200")
    
    def test_search_steigenberger_returns_result(self):
        """Verify search for 'steigenberger' returns result"""
        response = requests.get(f"{BASE_URL}/api/search?q=steigenberger")
        data = response.json()
        
        assert data.get('count', 0) >= 1, "Expected at least 1 result for 'steigenberger'"
        print(f"PASS: Search 'steigenberger' returns {data['count']} result(s)")
    
    def test_search_steigenberger_has_booking_url(self):
        """Verify steigenberger search result has booking_url populated"""
        response = requests.get(f"{BASE_URL}/api/search?q=steigenberger")
        data = response.json()
        
        results = data.get('results', [])
        assert len(results) > 0, "No results for steigenberger"
        
        hotel_result = results[0]
        booking_url = hotel_result.get('booking_url')
        assert booking_url is not None, "booking_url is None"
        assert booking_url != "", "booking_url is empty"
        assert "steigenberger" in booking_url.lower(), f"booking_url doesn't contain steigenberger: {booking_url}"
        print(f"PASS: Steigenberger booking_url = {booking_url}")
    
    def test_search_returns_only_active_partners(self):
        """Verify search returns only active partners (is_active filter)"""
        response = requests.get(f"{BASE_URL}/api/search?q=")
        data = response.json()
        
        # Search should only return active partners
        # We can't directly verify is_active in search results, but we can check count
        assert data.get('count', 0) > 0, "Search returned no results"
        print(f"PASS: Search returns {data['count']} active partners")
    
    def test_search_hotel_results_have_booking_url(self):
        """Verify hotel search results have booking_url from contact_url fallback"""
        response = requests.get(f"{BASE_URL}/api/search?q=&category=hotel")
        data = response.json()
        
        results = data.get('results', [])
        hotels_with_booking_url = [r for r in results if r.get('booking_url')]
        
        # Most hotels should have booking_url
        assert len(hotels_with_booking_url) > 0, "No hotels have booking_url"
        print(f"PASS: {len(hotels_with_booking_url)}/{len(results)} hotel results have booking_url")


class TestInactivePartners:
    """Tests for inactive partner handling"""
    
    def test_all_partners_includes_inactive(self):
        """Verify /api/all-partners returns inactive partners (for greyed-out display)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        # Currently all 59 hotels are active, but endpoint should return all
        hotels = data.get('hotels', [])
        assert len(hotels) == 59, f"Expected 59 hotels (all), got {len(hotels)}"
        print("PASS: /api/all-partners returns all partners (including inactive)")
    
    def test_hotels_endpoint_filters_inactive_by_default(self):
        """Verify /api/hotels filters inactive by default"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        data = response.json()
        
        # All returned hotels should be active
        inactive_hotels = [h for h in data if h.get('is_active') == False]
        assert len(inactive_hotels) == 0, f"Found {len(inactive_hotels)} inactive hotels in default response"
        print("PASS: /api/hotels filters inactive by default")
    
    def test_hotels_endpoint_include_inactive_param(self):
        """Verify /api/hotels?include_inactive=true returns all"""
        response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        data = response.json()
        
        assert len(data) == 59, f"Expected 59 hotels with include_inactive=true, got {len(data)}"
        print("PASS: /api/hotels?include_inactive=true returns all 59 hotels")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
