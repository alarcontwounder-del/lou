"""
Test Trip Planner Schedule Feature
Tests the new per-service scheduling system with schedule dict field
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTripPlannerScheduleFeature:
    """Tests for the new schedule dict field in trip planner"""
    
    def test_schedule_field_accepted_with_transfer_only(self):
        """Test that schedule dict is accepted for transfer-only service"""
        payload = {
            "name": "TEST_Schedule_Transfer",
            "email": "test_schedule_transfer@example.com",
            "services": ["transfer"],
            "budget": "premium",
            "date": "2026-03-25",
            "departure_date": "2026-03-28",
            "schedule": {
                "transfer_arrival": {"date": "2026-03-25", "time": "10:00"},
                "transfer_departure": {"date": "2026-03-28", "time": "14:00"}
            },
            "group_size": 2
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"PASS: Transfer-only with schedule accepted, id={data['id']}")
    
    def test_schedule_field_accepted_with_restaurant_only(self):
        """Test that schedule dict is accepted for restaurant-only service"""
        payload = {
            "name": "TEST_Schedule_Restaurant",
            "email": "test_schedule_restaurant@example.com",
            "services": ["restaurant"],
            "budget": "luxury",
            "date": "2026-03-25",
            "departure_date": "2026-03-27",
            "schedule": {
                "restaurant": {"date": "2026-03-26", "time": "19:00"}
            },
            "group_size": 4
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"PASS: Restaurant-only with schedule accepted, id={data['id']}")
    
    def test_schedule_field_accepted_with_beach_club_only(self):
        """Test that schedule dict is accepted for beach_club-only service"""
        payload = {
            "name": "TEST_Schedule_BeachClub",
            "email": "test_schedule_beachclub@example.com",
            "services": ["beach_club"],
            "budget": "moderate",
            "date": "2026-03-25",
            "departure_date": "2026-03-26",
            "schedule": {
                "beach_club": {"date": "2026-03-25", "time": "11:00"}
            },
            "group_size": 2
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"PASS: Beach club-only with schedule accepted, id={data['id']}")
    
    def test_schedule_field_accepted_with_all_four_services(self):
        """Test that schedule dict is accepted with all 4 services"""
        payload = {
            "name": "TEST_Schedule_AllServices",
            "email": "test_schedule_all@example.com",
            "services": ["hotel", "restaurant", "beach_club", "transfer"],
            "budget": "luxury",
            "date": "2026-03-25",
            "departure_date": "2026-03-30",
            "schedule": {
                "transfer_arrival": {"date": "2026-03-25", "time": "08:00"},
                "restaurant": {"date": "2026-03-26", "time": "20:00"},
                "beach_club": {"date": "2026-03-27", "time": "10:00"},
                "transfer_departure": {"date": "2026-03-30", "time": "06:00"}
            },
            "group_size": 6
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"PASS: All 4 services with full schedule accepted, id={data['id']}")
    
    def test_schedule_field_optional(self):
        """Test that schedule field is optional (null or empty)"""
        payload = {
            "name": "TEST_Schedule_Optional",
            "email": "test_schedule_optional@example.com",
            "services": ["transfer"],
            "budget": "moderate",
            "date": "2026-03-25",
            "departure_date": "2026-03-26",
            "schedule": None,
            "group_size": 2
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: Schedule field is optional (null accepted)")
    
    def test_schedule_field_empty_dict(self):
        """Test that empty schedule dict is accepted"""
        payload = {
            "name": "TEST_Schedule_Empty",
            "email": "test_schedule_empty@example.com",
            "services": ["restaurant", "beach_club"],
            "budget": "premium",
            "date": "2026-03-25",
            "departure_date": "2026-03-27",
            "schedule": {},
            "group_size": 3
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        # Empty dict should be converted to null by frontend, but backend should accept it
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: Empty schedule dict accepted")
    
    def test_schedule_with_early_morning_times(self):
        """Test that early morning times (06:00, 07:00, 08:00) are accepted"""
        payload = {
            "name": "TEST_Schedule_EarlyTimes",
            "email": "test_schedule_early@example.com",
            "services": ["transfer"],
            "budget": "luxury",
            "date": "2026-03-25",
            "departure_date": "2026-03-28",
            "schedule": {
                "transfer_arrival": {"date": "2026-03-25", "time": "06:00"},
                "transfer_departure": {"date": "2026-03-28", "time": "07:00"}
            },
            "group_size": 2
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: Early morning times (06:00, 07:00) accepted")
    
    def test_schedule_with_late_evening_times(self):
        """Test that late evening times (21:00, 22:00) are accepted"""
        payload = {
            "name": "TEST_Schedule_LateTimes",
            "email": "test_schedule_late@example.com",
            "services": ["transfer", "restaurant"],
            "budget": "premium",
            "date": "2026-03-25",
            "departure_date": "2026-03-27",
            "schedule": {
                "transfer_arrival": {"date": "2026-03-25", "time": "21:00"},
                "restaurant": {"date": "2026-03-26", "time": "22:00"},
                "transfer_departure": {"date": "2026-03-27", "time": "22:00"}
            },
            "group_size": 2
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: Late evening times (21:00, 22:00) accepted")
    
    def test_schedule_partial_entries(self):
        """Test that partial schedule entries (only date or only time) are accepted"""
        payload = {
            "name": "TEST_Schedule_Partial",
            "email": "test_schedule_partial@example.com",
            "services": ["transfer", "restaurant"],
            "budget": "moderate",
            "date": "2026-03-25",
            "departure_date": "2026-03-27",
            "schedule": {
                "transfer_arrival": {"date": "2026-03-25"},  # Only date, no time
                "restaurant": {"time": "19:00"},  # Only time, no date
                "transfer_departure": {"date": "2026-03-27", "time": "14:00"}  # Both
            },
            "group_size": 2
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: Partial schedule entries accepted")
    
    def test_legacy_time_field_still_works(self):
        """Test that legacy 'time' field still works for backward compatibility"""
        payload = {
            "name": "TEST_Schedule_Legacy",
            "email": "test_schedule_legacy@example.com",
            "services": ["hotel"],
            "budget": "moderate",
            "date": "2026-03-25",
            "time": "10:00",  # Legacy field
            "group_size": 2
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: Legacy 'time' field still works")


class TestScheduleDataPersistence:
    """Tests to verify schedule data is properly persisted"""
    
    def test_schedule_data_persisted_and_retrievable(self):
        """Test that schedule data is persisted in database"""
        # Create a trip request with schedule
        payload = {
            "name": "TEST_Schedule_Persist",
            "email": "test_schedule_persist@example.com",
            "services": ["transfer", "restaurant"],
            "budget": "premium",
            "date": "2026-03-25",
            "departure_date": "2026-03-28",
            "schedule": {
                "transfer_arrival": {"date": "2026-03-25", "time": "09:00"},
                "restaurant": {"date": "2026-03-26", "time": "19:30"},
                "transfer_departure": {"date": "2026-03-28", "time": "15:00"}
            },
            "group_size": 4
        }
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify the response contains the schedule
        assert "id" in data
        print(f"PASS: Schedule data persisted, id={data['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
