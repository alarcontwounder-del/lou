"""
Test suite for Trip Planner Bug Fixes
Tests the 5 reported bugs that were fixed:
1. 'Next' button blocked when only 'Premium Transfer' was selected
2. Stale itinerary entries remained when going back and deselecting services
3. Calendar only accepted single date instead of arrival/departure range
4. Missing Mercedes S-Class image for transfer in itinerary
5. Calendar selection color was salmon instead of greyscale

Backend tests focus on:
- Transfer-only service requests
- departure_date field support
- All service combinations
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestTransferOnlyService:
    """Bug Fix #1: Test that transfer-only requests work correctly"""
    
    @pytest.fixture
    def unique_email(self):
        """Generate unique email for each test"""
        return f"TEST_transfer_{uuid.uuid4().hex[:8]}@example.com"
    
    def test_transfer_only_request(self, unique_email):
        """Test creating a trip request with only transfer service"""
        payload = {
            "name": "TEST_Transfer Only User",
            "email": unique_email,
            "services": ["transfer"],
            "transfer_pickup": "Palma Airport",
            "transfer_dropoff": "St. Regis Mardavall",
            "date": "2026-04-15",
            "group_size": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200, f"Transfer-only request should succeed. Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["status"] == "received"
        
    def test_transfer_only_with_budget(self, unique_email):
        """Test transfer-only request with budget selection"""
        payload = {
            "name": "TEST_Transfer Budget User",
            "email": unique_email,
            "services": ["transfer"],
            "budget": "premium",
            "transfer_pickup": "Hotel Son Vida",
            "transfer_dropoff": "Golf Alcanada",
            "date": "2026-04-20",
            "group_size": 4
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200
        
    def test_transfer_with_other_services(self, unique_email):
        """Test transfer combined with other services"""
        payload = {
            "name": "TEST_Transfer Combo User",
            "email": unique_email,
            "services": ["hotel", "transfer"],
            "budget": "luxury",
            "preferred_hotel": "Cap Rocat",
            "transfer_pickup": "Palma Airport",
            "transfer_dropoff": "Cap Rocat",
            "date": "2026-05-01",
            "group_size": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200


class TestDateRangeSupport:
    """Bug Fix #3: Test that departure_date field is supported"""
    
    @pytest.fixture
    def unique_email(self):
        return f"TEST_daterange_{uuid.uuid4().hex[:8]}@example.com"
    
    def test_arrival_and_departure_dates(self, unique_email):
        """Test creating request with both arrival (date) and departure_date"""
        payload = {
            "name": "TEST_Date Range User",
            "email": unique_email,
            "services": ["hotel"],
            "date": "2026-04-15",
            "departure_date": "2026-04-20",
            "group_size": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200, f"Request with date range should succeed. Got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data
        
    def test_departure_date_persisted(self, unique_email):
        """Test that departure_date is persisted and retrievable"""
        payload = {
            "name": "TEST_Departure Persist User",
            "email": unique_email,
            "services": ["hotel", "restaurant"],
            "date": "2026-05-10",
            "departure_date": "2026-05-15",
            "group_size": 4
        }
        
        create_response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert create_response.status_code == 200
        
        created_id = create_response.json()["id"]
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/trip-planner")
        assert get_response.status_code == 200
        
        all_requests = get_response.json()
        found = next((r for r in all_requests if r["id"] == created_id), None)
        
        assert found is not None, "Created request should be retrievable"
        assert found["date"] == "2026-05-10", "Arrival date should be persisted"
        assert found.get("departure_date") == "2026-05-15", "Departure date should be persisted"
        
    def test_departure_date_optional(self, unique_email):
        """Test that departure_date is optional (single date still works)"""
        payload = {
            "name": "TEST_Single Date User",
            "email": unique_email,
            "services": ["restaurant"],
            "date": "2026-06-01",
            # No departure_date
            "group_size": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        
        assert response.status_code == 200, "Request without departure_date should succeed"


class TestAllServiceCombinations:
    """Test all possible service combinations work correctly"""
    
    @pytest.fixture
    def unique_email(self):
        return f"TEST_combo_{uuid.uuid4().hex[:8]}@example.com"
    
    def test_hotel_only(self, unique_email):
        """Test hotel-only service"""
        payload = {
            "name": "TEST_Hotel Only",
            "email": unique_email,
            "services": ["hotel"],
            "budget": "moderate",
            "date": "2026-04-01"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200
        
    def test_restaurant_only(self, unique_email):
        """Test restaurant-only service"""
        payload = {
            "name": "TEST_Restaurant Only",
            "email": unique_email,
            "services": ["restaurant"],
            "budget": "premium",
            "date": "2026-04-02"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200
        
    def test_beach_club_only(self, unique_email):
        """Test beach_club-only service"""
        payload = {
            "name": "TEST_Beach Club Only",
            "email": unique_email,
            "services": ["beach_club"],
            "budget": "luxury",
            "date": "2026-04-03"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200
        
    def test_transfer_only(self, unique_email):
        """Test transfer-only service"""
        payload = {
            "name": "TEST_Transfer Only",
            "email": unique_email,
            "services": ["transfer"],
            "budget": "premium",
            "transfer_pickup": "Airport",
            "transfer_dropoff": "Hotel",
            "date": "2026-04-04"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200
        
    def test_all_four_services(self, unique_email):
        """Test all four services combined"""
        payload = {
            "name": "TEST_All Four Services",
            "email": unique_email,
            "services": ["hotel", "restaurant", "beach_club", "transfer"],
            "budget": "luxury",
            "preferred_hotel": "St. Regis Mardavall",
            "preferred_restaurant": "DINS Santi Taura",
            "preferred_beach_club": "Nikki Beach",
            "transfer_pickup": "Palma Airport",
            "transfer_dropoff": "St. Regis Mardavall",
            "date": "2026-04-10",
            "departure_date": "2026-04-15",
            "time": "14:00",
            "group_size": 6,
            "special_requests": "Golf trip celebration"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "received"
        
    def test_hotel_and_transfer(self, unique_email):
        """Test hotel + transfer combination"""
        payload = {
            "name": "TEST_Hotel Transfer",
            "email": unique_email,
            "services": ["hotel", "transfer"],
            "budget": "premium",
            "date": "2026-04-05"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200
        
    def test_restaurant_and_beach_club(self, unique_email):
        """Test restaurant + beach_club combination"""
        payload = {
            "name": "TEST_Restaurant Beach",
            "email": unique_email,
            "services": ["restaurant", "beach_club"],
            "budget": "luxury",
            "date": "2026-04-06"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200


class TestBudgetOptions:
    """Test all budget options work correctly"""
    
    @pytest.fixture
    def unique_email(self):
        return f"TEST_budget_{uuid.uuid4().hex[:8]}@example.com"
    
    def test_moderate_budget(self, unique_email):
        """Test moderate budget option"""
        payload = {
            "name": "TEST_Moderate Budget",
            "email": unique_email,
            "services": ["hotel"],
            "budget": "moderate",
            "date": "2026-04-01"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200
        
    def test_premium_budget(self, unique_email):
        """Test premium budget option"""
        payload = {
            "name": "TEST_Premium Budget",
            "email": unique_email,
            "services": ["hotel"],
            "budget": "premium",
            "date": "2026-04-02"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200
        
    def test_luxury_budget(self, unique_email):
        """Test luxury budget option"""
        payload = {
            "name": "TEST_Luxury Budget",
            "email": unique_email,
            "services": ["hotel"],
            "budget": "luxury",
            "date": "2026-04-03"
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
