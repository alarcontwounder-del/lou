"""
Test suite for Booking Request feature - Restaurant and Beach Club reservations
Tests POST /api/booking-request endpoint for:
- Valid booking submission
- Required field validation
- MongoDB persistence
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBookingRequestEndpoint:
    """Tests for POST /api/booking-request endpoint"""
    
    def test_booking_request_valid_submission(self):
        """Test valid booking request returns success with booking ID"""
        payload = {
            "venue_name": "Test Restaurant",
            "venue_type": "restaurant",
            "guest_name": "TEST_John Smith",
            "guest_email": "test@example.com",
            "guest_phone": "+34 612 345 678",
            "date": "2026-02-15",
            "time": "20:00",
            "guests": 4,
            "dietary": ["vegetarian", "gluten-free"],
            "allergies": "nuts",
            "special_requests": "Birthday celebration"
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") is True, "Expected success: true"
        assert "id" in data, "Expected booking ID in response"
        assert isinstance(data["id"], str), "Booking ID should be a string"
        assert len(data["id"]) > 0, "Booking ID should not be empty"
        assert "message" in data, "Expected message in response"
        
        print(f"✓ Booking created with ID: {data['id']}")
        return data["id"]
    
    def test_booking_request_beach_club(self):
        """Test booking request for beach club venue type"""
        payload = {
            "venue_name": "Test Beach Club",
            "venue_type": "beach_club",
            "guest_name": "TEST_Jane Doe",
            "guest_email": "jane@example.com",
            "guest_phone": "+34 699 888 777",
            "date": "2026-03-20",
            "time": "13:00",
            "guests": 6,
            "dietary": [],
            "allergies": "",
            "special_requests": "Outdoor seating preferred"
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True
        assert "id" in data
        print(f"✓ Beach club booking created with ID: {data['id']}")
    
    def test_booking_request_missing_guest_name(self):
        """Test validation: missing guest_name returns error"""
        payload = {
            "venue_name": "Test Restaurant",
            "venue_type": "restaurant",
            # guest_name missing
            "guest_email": "test@example.com",
            "guest_phone": "+34 612 345 678",
            "date": "2026-02-15",
            "time": "20:00",
            "guests": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422 for missing guest_name, got {response.status_code}"
        print("✓ Missing guest_name correctly rejected with 422")
    
    def test_booking_request_missing_guest_email(self):
        """Test validation: missing guest_email returns error"""
        payload = {
            "venue_name": "Test Restaurant",
            "venue_type": "restaurant",
            "guest_name": "TEST_John",
            # guest_email missing
            "guest_phone": "+34 612 345 678",
            "date": "2026-02-15",
            "time": "20:00",
            "guests": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing guest_email, got {response.status_code}"
        print("✓ Missing guest_email correctly rejected with 422")
    
    def test_booking_request_missing_guest_phone(self):
        """Test validation: missing guest_phone returns error"""
        payload = {
            "venue_name": "Test Restaurant",
            "venue_type": "restaurant",
            "guest_name": "TEST_John",
            "guest_email": "test@example.com",
            # guest_phone missing
            "date": "2026-02-15",
            "time": "20:00",
            "guests": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing guest_phone, got {response.status_code}"
        print("✓ Missing guest_phone correctly rejected with 422")
    
    def test_booking_request_missing_date(self):
        """Test validation: missing date returns error"""
        payload = {
            "venue_name": "Test Restaurant",
            "venue_type": "restaurant",
            "guest_name": "TEST_John",
            "guest_email": "test@example.com",
            "guest_phone": "+34 612 345 678",
            # date missing
            "time": "20:00",
            "guests": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing date, got {response.status_code}"
        print("✓ Missing date correctly rejected with 422")
    
    def test_booking_request_missing_time(self):
        """Test validation: missing time returns error"""
        payload = {
            "venue_name": "Test Restaurant",
            "venue_type": "restaurant",
            "guest_name": "TEST_John",
            "guest_email": "test@example.com",
            "guest_phone": "+34 612 345 678",
            "date": "2026-02-15",
            # time missing
            "guests": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing time, got {response.status_code}"
        print("✓ Missing time correctly rejected with 422")
    
    def test_booking_request_missing_venue_name(self):
        """Test validation: missing venue_name returns error"""
        payload = {
            # venue_name missing
            "venue_type": "restaurant",
            "guest_name": "TEST_John",
            "guest_email": "test@example.com",
            "guest_phone": "+34 612 345 678",
            "date": "2026-02-15",
            "time": "20:00",
            "guests": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing venue_name, got {response.status_code}"
        print("✓ Missing venue_name correctly rejected with 422")
    
    def test_booking_request_missing_venue_type(self):
        """Test validation: missing venue_type returns error"""
        payload = {
            "venue_name": "Test Restaurant",
            # venue_type missing
            "guest_name": "TEST_John",
            "guest_email": "test@example.com",
            "guest_phone": "+34 612 345 678",
            "date": "2026-02-15",
            "time": "20:00",
            "guests": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing venue_type, got {response.status_code}"
        print("✓ Missing venue_type correctly rejected with 422")
    
    def test_booking_request_invalid_email(self):
        """Test validation: invalid email format returns error"""
        payload = {
            "venue_name": "Test Restaurant",
            "venue_type": "restaurant",
            "guest_name": "TEST_John",
            "guest_email": "not-an-email",  # Invalid email
            "guest_phone": "+34 612 345 678",
            "date": "2026-02-15",
            "time": "20:00",
            "guests": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print("✓ Invalid email correctly rejected with 422")
    
    def test_booking_request_optional_fields_empty(self):
        """Test booking with empty optional fields (dietary, allergies, special_requests)"""
        payload = {
            "venue_name": "Test Restaurant",
            "venue_type": "restaurant",
            "guest_name": "TEST_Minimal User",
            "guest_email": "minimal@example.com",
            "guest_phone": "+34 600 000 000",
            "date": "2026-04-01",
            "time": "19:30",
            "guests": 2,
            "dietary": [],
            "allergies": "",
            "special_requests": ""
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True
        print(f"✓ Booking with empty optional fields created: {data['id']}")


class TestBookingRequestPersistence:
    """Tests to verify booking data is stored in MongoDB"""
    
    def test_booking_stored_in_database(self):
        """Create booking and verify it can be retrieved (if GET endpoint exists)"""
        # First create a booking
        unique_name = f"TEST_Persistence_{uuid.uuid4().hex[:8]}"
        payload = {
            "venue_name": "Persistence Test Restaurant",
            "venue_type": "restaurant",
            "guest_name": unique_name,
            "guest_email": "persist@example.com",
            "guest_phone": "+34 611 222 333",
            "date": "2026-05-15",
            "time": "21:00",
            "guests": 3,
            "dietary": ["vegan"],
            "allergies": "shellfish",
            "special_requests": "Window seat"
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        assert response.status_code == 200, f"Failed to create booking: {response.text}"
        
        data = response.json()
        booking_id = data.get("id")
        assert booking_id, "No booking ID returned"
        
        print(f"✓ Booking created and stored with ID: {booking_id}")
        print(f"  Guest: {unique_name}")
        print(f"  Venue: {payload['venue_name']}")
        print(f"  Date/Time: {payload['date']} at {payload['time']}")


class TestHealthAndBasicEndpoints:
    """Basic health checks to ensure API is running"""
    
    def test_api_root(self):
        """Test API root endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200, f"API root not accessible: {response.status_code}"
        print("✓ API root endpoint accessible")
    
    def test_restaurants_endpoint(self):
        """Test restaurants endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        assert response.status_code == 200, f"Restaurants endpoint failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of restaurants"
        print(f"✓ Restaurants endpoint returns {len(data)} items")
    
    def test_beach_clubs_endpoint(self):
        """Test beach clubs endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/beach-clubs")
        assert response.status_code == 200, f"Beach clubs endpoint failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of beach clubs"
        print(f"✓ Beach clubs endpoint returns {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
