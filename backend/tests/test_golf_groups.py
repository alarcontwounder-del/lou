"""
Test Golf Groups feature in Trip Planner
- Tests new golf_groups service option
- Tests group_type, group_name, transfer_type fields
- Tests backend API acceptance of new fields
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGolfGroupsBackend:
    """Backend API tests for Golf Groups feature"""
    
    def test_trip_planner_accepts_golf_groups_service(self):
        """Test that /api/trip-planner accepts golf_groups as a service"""
        response = requests.post(f"{BASE_URL}/api/trip-planner", json={
            "name": "TEST_Golf_Groups_User",
            "email": "test_golf_groups@example.com",
            "services": ["golf_groups"],
            "budget": "premium",
            "date": "2026-04-15",
            "group_size": 8
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data or "message" in data, "Response should contain id or message"
        print(f"SUCCESS: golf_groups service accepted - {data}")
    
    def test_trip_planner_accepts_group_type_society(self):
        """Test that /api/trip-planner accepts group_type='society'"""
        response = requests.post(f"{BASE_URL}/api/trip-planner", json={
            "name": "TEST_Society_Trip",
            "email": "test_society@example.com",
            "services": ["golf_groups", "hotel"],
            "budget": "luxury",
            "date": "2026-05-01",
            "group_size": 12,
            "group_type": "society",
            "group_name": "Mallorca Golf Society"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"SUCCESS: group_type='society' accepted - {data}")
    
    def test_trip_planner_accepts_group_type_friends(self):
        """Test that /api/trip-planner accepts group_type='friends'"""
        response = requests.post(f"{BASE_URL}/api/trip-planner", json={
            "name": "TEST_Friends_Trip",
            "email": "test_friends@example.com",
            "services": ["golf_groups", "restaurant"],
            "budget": "moderate",
            "date": "2026-06-10",
            "group_size": 6,
            "group_type": "friends",
            "group_name": "The Golf Buddies"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"SUCCESS: group_type='friends' accepted - {data}")
    
    def test_trip_planner_accepts_transfer_type_sedan(self):
        """Test that /api/trip-planner accepts transfer_type='sedan'"""
        response = requests.post(f"{BASE_URL}/api/trip-planner", json={
            "name": "TEST_Transfer_Sedan",
            "email": "test_sedan@example.com",
            "services": ["golf_groups", "transfer"],
            "budget": "premium",
            "date": "2026-04-20",
            "group_size": 4,
            "group_type": "friends",
            "transfer_type": "sedan",
            "transfer_pickup": "Palma Airport",
            "transfer_dropoff": "Son Gual Golf"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"SUCCESS: transfer_type='sedan' accepted - {data}")
    
    def test_trip_planner_accepts_transfer_type_minibus(self):
        """Test that /api/trip-planner accepts transfer_type='minibus'"""
        response = requests.post(f"{BASE_URL}/api/trip-planner", json={
            "name": "TEST_Transfer_Minibus",
            "email": "test_minibus@example.com",
            "services": ["golf_groups", "transfer"],
            "budget": "premium",
            "date": "2026-04-21",
            "group_size": 10,
            "group_type": "society",
            "transfer_type": "minibus",
            "transfer_pickup": "Palma Airport",
            "transfer_dropoff": "Golf Alcanada"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"SUCCESS: transfer_type='minibus' accepted - {data}")
    
    def test_trip_planner_accepts_transfer_type_coach(self):
        """Test that /api/trip-planner accepts transfer_type='coach'"""
        response = requests.post(f"{BASE_URL}/api/trip-planner", json={
            "name": "TEST_Transfer_Coach",
            "email": "test_coach@example.com",
            "services": ["golf_groups", "transfer"],
            "budget": "luxury",
            "date": "2026-04-22",
            "group_size": 20,
            "group_type": "society",
            "group_name": "UK Golf Society Tour",
            "transfer_type": "coach",
            "transfer_pickup": "Palma Airport",
            "transfer_dropoff": "St. Regis Mardavall"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"SUCCESS: transfer_type='coach' accepted - {data}")
    
    def test_trip_planner_full_golf_groups_request(self):
        """Test full Golf Groups request with all new fields"""
        response = requests.post(f"{BASE_URL}/api/trip-planner", json={
            "name": "TEST_Full_Golf_Groups",
            "email": "test_full_groups@example.com",
            "phone": "+44 7700 900123",
            "services": ["golf_groups", "hotel", "restaurant", "beach_club", "transfer"],
            "budget": "luxury",
            "date": "2026-07-01",
            "departure_date": "2026-07-05",
            "group_size": 16,
            "group_type": "society",
            "group_name": "London Golf Society",
            "transfer_type": "minibus",
            "transfer_pickup": "Palma Airport",
            "transfer_dropoff": "St. Regis Mardavall",
            "preferred_hotel": "St. Regis Mardavall",
            "preferred_restaurant": "Zaranda",
            "preferred_beach_club": "Nikki Beach Mallorca",
            "special_requests": "Need 4 tee times at Son Gual on July 2nd"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"SUCCESS: Full Golf Groups request accepted - {data}")
    
    def test_trip_planner_golf_groups_without_optional_fields(self):
        """Test Golf Groups request without optional group_name and transfer_type"""
        response = requests.post(f"{BASE_URL}/api/trip-planner", json={
            "name": "TEST_Minimal_Golf_Groups",
            "email": "test_minimal@example.com",
            "services": ["golf_groups"],
            "budget": "moderate",
            "date": "2026-08-01",
            "group_size": 4,
            "group_type": "friends"
            # No group_name, no transfer_type
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"SUCCESS: Minimal Golf Groups request accepted - {data}")


class TestTripPlannerEndpointHealth:
    """Basic health checks for trip planner endpoint"""
    
    def test_trip_planner_endpoint_exists(self):
        """Test that /api/trip-planner endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/trip-planner", json={
            "name": "TEST_Health_Check",
            "email": "test_health@example.com",
            "services": ["hotel"],
            "budget": "moderate",
            "date": "2026-03-25",
            "group_size": 2
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: /api/trip-planner endpoint is healthy")
    
    def test_all_partners_endpoint(self):
        """Test that /api/all-partners endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "hotels" in data, "Response should contain hotels"
        assert "restaurants" in data, "Response should contain restaurants"
        assert "beach_clubs" in data, "Response should contain beach_clubs"
        print(f"SUCCESS: /api/all-partners returns {len(data.get('hotels', []))} hotels, {len(data.get('restaurants', []))} restaurants, {len(data.get('beach_clubs', []))} beach clubs")
    
    def test_golf_courses_endpoint(self):
        """Test that /api/golf-courses endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert len(data) > 0, "Should return at least one golf course"
        print(f"SUCCESS: /api/golf-courses returns {len(data)} courses")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
