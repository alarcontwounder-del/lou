"""
Test suite for Iteration 33 features:
1. Hotel booking via BookingRequestModal (with check-in/check-out, no time/dietary/allergies)
2. Blog share buttons (WhatsApp, Twitter, Facebook)
3. Footer Other Destinations section
4. API POST /api/booking-request accepts hotel booking data
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHotelBookingAPI:
    """Tests for hotel booking via POST /api/booking-request"""
    
    def test_hotel_booking_without_time(self):
        """Test hotel booking request without time field (should succeed)"""
        payload = {
            "venue_name": "St. Regis Mardavall",
            "venue_type": "hotel",
            "guest_name": "TEST_Hotel_Guest_NoTime",
            "guest_email": "test@example.com",
            "guest_phone": "+34 612 345 678",
            "date": "2026-05-15",
            "date_checkout": "2026-05-20",
            "guests": 2,
            "special_requests": "Room with sea view"
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True
        assert "id" in data
        print(f"✓ Hotel booking without time created: {data['id']}")
    
    def test_hotel_booking_with_checkout_date(self):
        """Test hotel booking with check-out date"""
        payload = {
            "venue_name": "Petit Hotel Ses Cases de Pula",
            "venue_type": "hotel",
            "guest_name": "TEST_Hotel_Guest_Checkout",
            "guest_email": "checkout@example.com",
            "guest_phone": "+34 699 888 777",
            "date": "2026-06-01",
            "date_checkout": "2026-06-05",
            "guests": 4,
            "dietary": [],
            "allergies": "",
            "special_requests": "Late check-in requested"
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True
        print(f"✓ Hotel booking with checkout date created: {data['id']}")
    
    def test_hotel_booking_empty_time(self):
        """Test hotel booking with empty time string (should succeed)"""
        payload = {
            "venue_name": "Steigenberger Golf Resort",
            "venue_type": "hotel",
            "guest_name": "TEST_Hotel_Guest_EmptyTime",
            "guest_email": "emptytime@example.com",
            "guest_phone": "+34 611 222 333",
            "date": "2026-07-10",
            "time": "",  # Empty time for hotels
            "guests": 2,
            "special_requests": "Golf package inquiry"
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True
        print(f"✓ Hotel booking with empty time created: {data['id']}")


class TestRestaurantBookingStillWorks:
    """Ensure restaurant booking still works with time, dietary, allergies"""
    
    def test_restaurant_booking_with_all_fields(self):
        """Test restaurant booking with time, dietary, and allergies"""
        payload = {
            "venue_name": "DINS Santi Taura",
            "venue_type": "restaurant",
            "guest_name": "TEST_Restaurant_Guest",
            "guest_email": "restaurant@example.com",
            "guest_phone": "+34 612 345 678",
            "date": "2026-05-20",
            "time": "20:00",
            "guests": 4,
            "dietary": ["vegetarian", "gluten-free"],
            "allergies": "nuts, shellfish",
            "special_requests": "Birthday celebration"
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True
        print(f"✓ Restaurant booking with all fields created: {data['id']}")
    
    def test_beach_club_booking_with_time(self):
        """Test beach club booking with time"""
        payload = {
            "venue_name": "Nikki Beach Mallorca",
            "venue_type": "beach_club",
            "guest_name": "TEST_BeachClub_Guest",
            "guest_email": "beach@example.com",
            "guest_phone": "+34 699 888 777",
            "date": "2026-06-15",
            "time": "13:00",
            "guests": 6,
            "dietary": ["vegan"],
            "allergies": "",
            "special_requests": "Outdoor seating"
        }
        
        response = requests.post(f"{BASE_URL}/api/booking-request", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True
        print(f"✓ Beach club booking created: {data['id']}")


class TestBlogEndpoints:
    """Tests for blog endpoints (share buttons rely on frontend, but we test API)"""
    
    def test_blog_list_endpoint(self):
        """Test blog list endpoint returns posts"""
        response = requests.get(f"{BASE_URL}/api/blog")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of blog posts"
        assert len(data) > 0, "Expected at least one blog post"
        print(f"✓ Blog list returns {len(data)} posts")
    
    def test_blog_post_by_slug(self):
        """Test getting a specific blog post by slug"""
        # First get the list to find a slug
        list_response = requests.get(f"{BASE_URL}/api/blog")
        posts = list_response.json()
        
        if len(posts) > 0:
            slug = posts[0].get("slug")
            response = requests.get(f"{BASE_URL}/api/blog/{slug}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            data = response.json()
            assert data.get("slug") == slug
            assert "title" in data
            assert "content" in data
            print(f"✓ Blog post '{slug}' retrieved successfully")
        else:
            pytest.skip("No blog posts available to test")


class TestHotelsEndpoint:
    """Tests for hotels endpoint"""
    
    def test_hotels_list(self):
        """Test hotels list endpoint"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of hotels"
        assert len(data) > 0, "Expected at least one hotel"
        print(f"✓ Hotels list returns {len(data)} hotels")
    
    def test_hotels_have_required_fields(self):
        """Test hotels have required fields for booking modal"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        data = response.json()
        
        if len(data) > 0:
            hotel = data[0]
            assert "id" in hotel, "Hotel should have id"
            assert "name" in hotel, "Hotel should have name"
            assert "image" in hotel, "Hotel should have image"
            assert "location" in hotel, "Hotel should have location"
            print(f"✓ Hotel '{hotel['name']}' has required fields")
        else:
            pytest.skip("No hotels available to test")


class TestAPIHealth:
    """Basic health checks"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        print("✓ API root accessible")
    
    def test_restaurants_endpoint(self):
        """Test restaurants endpoint"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Restaurants endpoint returns {len(data)} items")
    
    def test_beach_clubs_endpoint(self):
        """Test beach clubs endpoint"""
        response = requests.get(f"{BASE_URL}/api/beach-clubs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Beach clubs endpoint returns {len(data)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
