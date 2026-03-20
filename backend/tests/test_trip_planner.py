"""
Test suite for Trip Planner API endpoints
Tests POST /api/trip-planner and GET /api/trip-planner
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTripPlannerAPI:
    """Trip Planner endpoint tests"""
    
    @pytest.fixture
    def unique_email(self):
        """Generate unique email for each test"""
        return f"TEST_tripplanner_{uuid.uuid4().hex[:8]}@example.com"
    
    def test_create_trip_request_success(self, unique_email):
        """Test creating a new trip planner request with all fields"""
        payload = {
            "name": "TEST_User Full Name",
            "email": unique_email,
            "phone": "+34600123456",
            "services": ["hotel", "restaurant", "beach_club"],
            "preferred_hotel": "St. Regis Mardavall",
            "preferred_restaurant": "DINS Santi Taura",
            "preferred_beach_club": "Nikki Beach",
            "date": "2026-03-25",
            "time": "14:00",
            "group_size": 6,
            "special_requests": "Celebration trip for golf lovers"
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "id" in data, "Response should contain id"
        assert "status" in data, "Response should contain status"
        assert data["status"] == "received", f"Expected status 'received', got '{data['status']}'"
        assert "message" in data, "Response should contain message"
        
    def test_create_trip_request_minimal_fields(self, unique_email):
        """Test creating a trip request with only required fields"""
        payload = {
            "name": "TEST_Minimal User",
            "email": unique_email,
            "services": ["hotel"],
            "date": "2026-04-01"
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["status"] == "received"
        
    def test_create_trip_request_all_services(self, unique_email):
        """Test creating a trip request with all service types"""
        payload = {
            "name": "TEST_All Services User",
            "email": unique_email,
            "services": ["hotel", "restaurant", "beach_club"],
            "date": "2026-05-15",
            "group_size": 8
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "received"
        
    def test_create_trip_request_single_service_hotel(self, unique_email):
        """Test creating a trip request with only hotel service"""
        payload = {
            "name": "TEST_Hotel Only User",
            "email": unique_email,
            "services": ["hotel"],
            "preferred_hotel": "Cap Rocat",
            "date": "2026-06-10"
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200
        
    def test_create_trip_request_single_service_restaurant(self, unique_email):
        """Test creating a trip request with only restaurant service"""
        payload = {
            "name": "TEST_Restaurant Only User",
            "email": unique_email,
            "services": ["restaurant"],
            "preferred_restaurant": "Zaranda",
            "date": "2026-06-15"
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200
        
    def test_create_trip_request_single_service_beach_club(self, unique_email):
        """Test creating a trip request with only beach club service"""
        payload = {
            "name": "TEST_Beach Club Only User",
            "email": unique_email,
            "services": ["beach_club"],
            "preferred_beach_club": "Purobeach Palma",
            "date": "2026-07-01"
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200
        
    def test_get_trip_requests_returns_list(self):
        """Test GET /api/trip-planner returns a list"""
        response = requests.get(f"{BASE_URL}/api/trip-planner")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
    def test_get_trip_requests_contains_required_fields(self):
        """Test that returned trip requests have all required fields"""
        response = requests.get(f"{BASE_URL}/api/trip-planner")
        
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) > 0, "Should have at least one trip request"
        
        # Check first item has required fields
        request = data[0]
        required_fields = ["id", "name", "email", "services", "date", "group_size", "created_at"]
        for field in required_fields:
            assert field in request, f"Trip request should have '{field}' field"
            
    def test_create_and_verify_persistence(self, unique_email):
        """Test that created trip request is persisted and retrievable"""
        # Create request
        payload = {
            "name": "TEST_Persistence Check User",
            "email": unique_email,
            "services": ["hotel", "restaurant"],
            "preferred_hotel": "Belmond La Residencia",
            "date": "2026-08-20",
            "time": "18:00",
            "group_size": 2,
            "special_requests": "Honeymoon trip"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert create_response.status_code == 200
        
        created_id = create_response.json()["id"]
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/trip-planner")
        assert get_response.status_code == 200
        
        all_requests = get_response.json()
        
        # Find the created request
        found = None
        for req in all_requests:
            if req["id"] == created_id:
                found = req
                break
                
        assert found is not None, f"Created trip request with id {created_id} should be in the list"
        assert found["name"] == "TEST_Persistence Check User"
        assert found["email"] == unique_email
        assert "hotel" in found["services"]
        assert "restaurant" in found["services"]
        assert found["preferred_hotel"] == "Belmond La Residencia"
        assert found["date"] == "2026-08-20"
        assert found["time"] == "18:00"
        assert found["group_size"] == 2
        assert found["special_requests"] == "Honeymoon trip"
        
    def test_invalid_email_format(self):
        """Test that invalid email format is rejected"""
        payload = {
            "name": "TEST_Invalid Email",
            "email": "invalid-email-format",
            "services": ["hotel"],
            "date": "2026-09-01"
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        # Should return 422 (Unprocessable Entity) for validation error
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        
    def test_missing_required_field_name(self):
        """Test that missing name field is rejected"""
        payload = {
            "email": "test@example.com",
            "services": ["hotel"],
            "date": "2026-09-01"
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing name, got {response.status_code}"
        
    def test_missing_required_field_services(self):
        """Test that missing services field is rejected"""
        payload = {
            "name": "TEST_Missing Services",
            "email": "test@example.com",
            "date": "2026-09-01"
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing services, got {response.status_code}"
        
    def test_group_size_boundaries(self, unique_email):
        """Test group size at boundaries (1 and 20)"""
        # Test minimum group size = 1
        payload_min = {
            "name": "TEST_Group Min",
            "email": unique_email,
            "services": ["hotel"],
            "date": "2026-10-01",
            "group_size": 1
        }
        
        response_min = requests.post(f"{BASE_URL}/api/trip-planner", json=payload_min)
        assert response_min.status_code == 200, "Should accept group_size = 1"
        
        # Test maximum group size = 20
        payload_max = {
            "name": "TEST_Group Max",
            "email": f"max_{unique_email}",
            "services": ["hotel"],
            "date": "2026-10-02",
            "group_size": 20
        }
        
        response_max = requests.post(f"{BASE_URL}/api/trip-planner", json=payload_max)
        assert response_max.status_code == 200, "Should accept group_size = 20"


class TestAllPartnersForTripPlanner:
    """Test /api/all-partners endpoint which provides data for Trip Planner dropdowns"""
    
    def test_all_partners_endpoint(self):
        """Test that /api/all-partners returns data for Trip Planner venue selection"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify structure
        assert "hotels" in data, "Should have hotels for Trip Planner"
        assert "restaurants" in data, "Should have restaurants for Trip Planner"
        assert "beach_clubs" in data, "Should have beach_clubs for Trip Planner"
        
        # Verify data exists
        assert len(data["hotels"]) > 0, "Should have at least one hotel"
        assert len(data["restaurants"]) > 0, "Should have at least one restaurant"
        assert len(data["beach_clubs"]) > 0, "Should have at least one beach club"
        
    def test_michelin_restaurants_available(self):
        """Test that Michelin restaurants are available for Trip Planner"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        
        assert response.status_code == 200
        
        data = response.json()
        restaurants = data.get("restaurants", [])
        
        # Check for Michelin restaurants (have michelin_stars field)
        michelin_restaurants = [r for r in restaurants if r.get("michelin_stars")]
        
        assert len(michelin_restaurants) > 0, "Should have at least one Michelin restaurant"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
