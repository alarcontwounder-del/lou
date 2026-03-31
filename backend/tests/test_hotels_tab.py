"""
Test suite for Hotels Tab admin functionality:
- GET /api/hotels?include_inactive=true returns all hotels
- PUT /api/hotels/{hotel_id} toggles is_active status
- Verify 57 active, 2 inactive hotels
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHotelsTabAPI:
    """Test Hotels Tab API endpoints"""
    
    def test_get_hotels_with_include_inactive_returns_all(self):
        """GET /api/hotels?include_inactive=true returns all 59 hotels"""
        response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        hotels = response.json()
        assert len(hotels) == 59, f"Expected 59 hotels, got {len(hotels)}"
        print(f"PASS: GET /api/hotels?include_inactive=true returns {len(hotels)} hotels")
    
    def test_get_hotels_without_include_inactive_returns_active_only(self):
        """GET /api/hotels returns only active hotels (57)"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        hotels = response.json()
        assert len(hotels) == 57, f"Expected 57 active hotels, got {len(hotels)}"
        print(f"PASS: GET /api/hotels returns {len(hotels)} active hotels")
    
    def test_active_inactive_counts(self):
        """Verify 57 active and 2 inactive hotels"""
        response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        assert response.status_code == 200
        hotels = response.json()
        
        active = [h for h in hotels if h.get('is_active') != False]
        inactive = [h for h in hotels if h.get('is_active') == False]
        
        assert len(active) == 57, f"Expected 57 active, got {len(active)}"
        assert len(inactive) == 2, f"Expected 2 inactive, got {len(inactive)}"
        print(f"PASS: {len(active)} active, {len(inactive)} inactive hotels")
    
    def test_inactive_hotels_are_correct(self):
        """Verify the 2 inactive hotels are Lindner and Hoposa Niu"""
        response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        assert response.status_code == 200
        hotels = response.json()
        
        inactive = [h for h in hotels if h.get('is_active') == False]
        inactive_names = [h.get('name') for h in inactive]
        
        assert 'Lindner Hotel Mallorca Portal Nous' in inactive_names, "Lindner should be inactive"
        assert 'Hoposa Niu' in inactive_names, "Hoposa Niu should be inactive"
        print(f"PASS: Inactive hotels are: {inactive_names}")


class TestHotelToggleAPI:
    """Test PUT /api/hotels/{hotel_id} for toggling is_active"""
    
    @pytest.fixture
    def test_hotel_id(self):
        """Get a hotel ID to test with"""
        response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        hotels = response.json()
        # Use first active hotel for testing
        active_hotel = next((h for h in hotels if h.get('is_active') != False), None)
        return active_hotel['id'] if active_hotel else None
    
    def test_put_hotel_deactivate(self, test_hotel_id):
        """PUT /api/hotels/{id} with is_active=false deactivates hotel"""
        if not test_hotel_id:
            pytest.skip("No test hotel available")
        
        # Deactivate
        response = requests.put(
            f"{BASE_URL}/api/hotels/{test_hotel_id}",
            json={"is_active": False}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get('is_active') == False, f"Expected is_active=False, got {data.get('is_active')}"
        print(f"PASS: PUT /api/hotels/{test_hotel_id} deactivated hotel")
        
        # Verify via GET
        verify_response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        hotels = verify_response.json()
        hotel = next((h for h in hotels if h['id'] == test_hotel_id), None)
        assert hotel and hotel.get('is_active') == False, "Hotel should be inactive in GET response"
        print("PASS: Verified hotel is inactive via GET")
        
        # Reactivate (cleanup)
        requests.put(
            f"{BASE_URL}/api/hotels/{test_hotel_id}",
            json={"is_active": True}
        )
        print(f"CLEANUP: Reactivated hotel {test_hotel_id}")
    
    def test_put_hotel_activate(self):
        """PUT /api/hotels/{id} with is_active=true activates hotel"""
        # Use one of the known inactive hotels
        hotel_id = "lindner-hotel-mallorca-portal-nous"
        
        # Activate
        response = requests.put(
            f"{BASE_URL}/api/hotels/{hotel_id}",
            json={"is_active": True}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get('is_active') == True, f"Expected is_active=True, got {data.get('is_active')}"
        print(f"PASS: PUT /api/hotels/{hotel_id} activated hotel")
        
        # Verify via GET (should now appear in active list)
        verify_response = requests.get(f"{BASE_URL}/api/hotels")
        hotels = verify_response.json()
        hotel = next((h for h in hotels if h['id'] == hotel_id), None)
        assert hotel is not None, "Hotel should appear in active hotels list"
        print("PASS: Verified hotel appears in active list")
        
        # Deactivate (cleanup - restore original state)
        requests.put(
            f"{BASE_URL}/api/hotels/{hotel_id}",
            json={"is_active": False}
        )
        print(f"CLEANUP: Deactivated hotel {hotel_id} back to original state")
    
    def test_put_nonexistent_hotel_returns_404(self):
        """PUT /api/hotels/{nonexistent_id} returns 404"""
        response = requests.put(
            f"{BASE_URL}/api/hotels/nonexistent-hotel-id-12345",
            json={"is_active": False}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: PUT nonexistent hotel returns 404")


class TestHotelsDataStructure:
    """Test hotel data structure for HotelsTab component"""
    
    def test_hotels_have_required_fields(self):
        """Verify hotels have fields needed by HotelsTab component"""
        response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        assert response.status_code == 200
        hotels = response.json()
        
        required_fields = ['id', 'name', 'image']
        optional_fields = ['location', 'category', 'offer_price', 'is_active']
        
        for hotel in hotels[:5]:  # Check first 5 hotels
            for field in required_fields:
                assert field in hotel, f"Hotel {hotel.get('id')} missing required field: {field}"
        
        print(f"PASS: Hotels have required fields: {required_fields}")
        print(f"INFO: Optional fields checked: {optional_fields}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
