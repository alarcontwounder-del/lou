"""
Test file for Golf Course Pairing and Share Trip features
Testing:
1. GET /api/golf-courses returns course data with booking_url, holes, par, price_from
2. Hotels have nearest_golf and distance_km fields
3. Golf course matching logic (case-insensitive partial match)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')


class TestGolfCoursesAPI:
    """Golf Courses API endpoint tests for pairing feature"""
    
    def test_get_all_golf_courses_returns_list(self):
        """Test GET /api/golf-courses returns list of courses"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 16, "Should have at least 16 golf courses"
    
    def test_golf_course_has_booking_url(self):
        """Test that golf courses have booking_url field"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        for course in data:
            assert "booking_url" in course, f"Course {course.get('name')} missing booking_url"
            assert course["booking_url"].startswith("https://"), "booking_url should be HTTPS"
            assert "greenfee365" in course["booking_url"], "booking_url should point to greenfee365"
    
    def test_golf_course_has_holes_par_price(self):
        """Test that golf courses have holes, par, and price_from fields"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        for course in data:
            assert "holes" in course, f"Course {course.get('name')} missing holes"
            assert "par" in course, f"Course {course.get('name')} missing par"
            assert "price_from" in course, f"Course {course.get('name')} missing price_from"
            
            # Validate values
            assert course["holes"] in [9, 18], "Holes should be 9 or 18"
            assert 35 <= course["par"] <= 72, "Par should be between 35 and 72"
            assert course["price_from"] > 0, "price_from should be positive"
    
    def test_golf_course_has_image(self):
        """Test that golf courses have image field"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        for course in data:
            assert "image" in course, f"Course {course.get('name')} missing image"
            assert len(course["image"]) > 0, "Image URL should not be empty"
    
    def test_real_golf_bendinat_exists(self):
        """Test that Real Golf De Bendinat exists (used in hotel pairing)"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        course_names = [c["name"].lower() for c in data]
        
        # Check for Real Golf De Bendinat (case-insensitive)
        found = any("bendinat" in name for name in course_names)
        assert found, "Real Golf De Bendinat should exist in golf courses"
    
    def test_son_vida_golf_exists(self):
        """Test that Son Vida Golf exists (used in hotel pairing)"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        course_names = [c["name"].lower() for c in data]
        
        found = any("son vida" in name for name in course_names)
        assert found, "Son Vida Golf should exist in golf courses"
    
    def test_son_antem_golf_exists(self):
        """Test that Son Antem courses exist (used in hotel pairing)"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        course_names = [c["name"].lower() for c in data]
        
        found = any("son antem" in name for name in course_names)
        assert found, "Son Antem Golf should exist in golf courses"


class TestHotelsWithGolfPairing:
    """Test hotels have nearest_golf and distance_km fields"""
    
    def test_all_partners_returns_hotels(self):
        """Test GET /api/all-partners returns hotels"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200
        
        data = response.json()
        assert "hotels" in data
        assert len(data["hotels"]) > 0
    
    def test_hotels_have_nearest_golf_field(self):
        """Test that hotels have nearest_golf field"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200
        
        data = response.json()
        hotels = data["hotels"]
        
        # At least some hotels should have nearest_golf
        hotels_with_golf = [h for h in hotels if h.get("nearest_golf")]
        assert len(hotels_with_golf) > 0, "At least some hotels should have nearest_golf"
    
    def test_hotels_have_distance_km_field(self):
        """Test that hotels with nearest_golf also have distance_km"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200
        
        data = response.json()
        hotels = data["hotels"]
        
        for hotel in hotels:
            if hotel.get("nearest_golf"):
                assert "distance_km" in hotel, f"Hotel {hotel.get('name')} has nearest_golf but missing distance_km"
                assert hotel["distance_km"] > 0, "distance_km should be positive"
    
    def test_st_regis_has_bendinat_golf(self):
        """Test St. Regis Mardavall is paired with Real Golf De Bendinat"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200
        
        data = response.json()
        hotels = data["hotels"]
        
        st_regis = next((h for h in hotels if "st. regis" in h.get("name", "").lower()), None)
        if st_regis:
            assert st_regis.get("nearest_golf"), "St. Regis should have nearest_golf"
            assert "bendinat" in st_regis["nearest_golf"].lower(), "St. Regis should be paired with Bendinat"
    
    def test_golf_course_name_matching(self):
        """Test that hotel nearest_golf names can match golf course names (case-insensitive)"""
        # Get hotels
        hotels_response = requests.get(f"{BASE_URL}/api/all-partners")
        assert hotels_response.status_code == 200
        hotels = hotels_response.json()["hotels"]
        
        # Get golf courses
        courses_response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert courses_response.status_code == 200
        courses = courses_response.json()
        
        course_names_lower = [c["name"].lower() for c in courses]
        
        # Check that at least some hotels can match to courses
        matched_count = 0
        for hotel in hotels:
            nearest_golf = hotel.get("nearest_golf", "")
            if nearest_golf:
                nearest_lower = nearest_golf.lower()
                # Check if any course name contains or is contained by nearest_golf
                for course_name in course_names_lower:
                    if nearest_lower in course_name or course_name in nearest_lower:
                        matched_count += 1
                        break
        
        assert matched_count > 0, "At least some hotels should match to golf courses"


class TestTripPlannerWithGolfData:
    """Test trip planner submissions include golf-related data"""
    
    def test_trip_planner_accepts_hotel_service(self):
        """Test POST /api/trip-planner accepts hotel service"""
        payload = {
            "name": "TEST_Golf_Pairing_User",
            "email": "test.golf.pairing@example.com",
            "services": ["hotel"],
            "budget": "premium",
            "preferred_hotel": "St. Regis Mardavall",
            "date": "2026-04-15",
            "departure_date": "2026-04-18",
            "group_size": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code in [200, 201]
        
        data = response.json()
        # API returns confirmation message with id
        assert "id" in data or "message" in data
    
    def test_trip_planner_hotel_with_restaurant(self):
        """Test POST /api/trip-planner accepts hotel + restaurant"""
        payload = {
            "name": "TEST_Golf_Multi_Service",
            "email": "test.golf.multi@example.com",
            "services": ["hotel", "restaurant"],
            "budget": "luxury",
            "preferred_hotel": "Belmond La Residencia",
            "preferred_restaurant": "Zaranda",
            "date": "2026-05-01",
            "departure_date": "2026-05-05",
            "group_size": 4
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code in [200, 201]
        
        data = response.json()
        assert "id" in data or "message" in data


class TestShareTripTextGeneration:
    """Test that trip data supports share text generation"""
    
    def test_trip_planner_accepts_all_services_for_share(self):
        """Test that trip planner accepts all services needed for share text"""
        payload = {
            "name": "TEST_Share_Trip_User",
            "email": "test.share@example.com",
            "services": ["hotel", "restaurant", "beach_club", "transfer"],
            "budget": "premium",
            "preferred_hotel": "Cap Rocat",
            "preferred_restaurant": "Es Fum",
            "preferred_beach_club": "Nikki Beach Mallorca",
            "transfer_pickup": "Palma Airport",
            "transfer_dropoff": "Cap Rocat Hotel",
            "date": "2026-06-10",
            "departure_date": "2026-06-15",
            "group_size": 6
        }
        
        response = requests.post(f"{BASE_URL}/api/trip-planner", json=payload)
        assert response.status_code in [200, 201]
        
        data = response.json()
        # API returns confirmation with id
        assert "id" in data, "Response should include trip request id"
        assert "message" in data or "status" in data, "Response should include confirmation"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
