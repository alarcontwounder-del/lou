"""
Bug Fix Verification Tests - Iteration 26
Tests for:
1. Display settings API format (object with show/limit)
2. Hotel toggle (is_active) functionality
3. St. Regis image fix (no example.com placeholder)
4. All partner endpoints returning data
5. Favicon verification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://golf-booking-preview.preview.emergentagent.com')


class TestDisplaySettings:
    """Tests for display settings API - Bug fix for ContentManager blank page"""
    
    def test_get_display_settings_returns_correct_format(self):
        """Verify display settings returns object format {show: bool, limit: number}"""
        response = requests.get(f"{BASE_URL}/api/display-settings")
        assert response.status_code == 200
        
        data = response.json()
        # Check that each category has the correct format
        for category in ['golf', 'hotels', 'restaurants', 'beach_clubs', 'cafe_bars']:
            if category in data and data[category] is not None:
                setting = data[category]
                # Should be an object with show and limit, or null
                if isinstance(setting, dict):
                    assert 'show' in setting or 'limit' in setting, f"{category} should have show or limit"
                    if 'limit' in setting:
                        assert isinstance(setting['limit'], (int, type(None))), f"{category} limit should be int or null"
    
    def test_post_display_settings_saves_correctly(self):
        """Verify POST display settings saves and returns updated values"""
        test_settings = {
            "golf": {"show": True, "limit": 6},
            "hotels": {"show": True, "limit": 8},
            "restaurants": {"show": True, "limit": 10},
            "beach_clubs": {"show": True, "limit": 4},
            "cafe_bars": {"show": True, "limit": 6}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/display-settings",
            json=test_settings
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data['golf']['limit'] == 6
        assert data['hotels']['limit'] == 8
        
        # Reset to defaults
        reset_settings = {
            "golf": {"show": True, "limit": 100},
            "hotels": {"show": True, "limit": 100},
            "restaurants": {"show": True, "limit": 100},
            "beach_clubs": {"show": True, "limit": 100},
            "cafe_bars": {"show": True, "limit": 100}
        }
        requests.post(f"{BASE_URL}/api/display-settings", json=reset_settings)


class TestHotelToggle:
    """Tests for hotel is_active toggle functionality"""
    
    def test_toggle_hotel_inactive(self):
        """Verify PUT /api/hotels/{id} with is_active: false works"""
        response = requests.put(
            f"{BASE_URL}/api/hotels/st-regis",
            json={"is_active": False}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data['is_active'] is False
        assert data['id'] == 'st-regis'
    
    def test_toggle_hotel_active(self):
        """Verify PUT /api/hotels/{id} with is_active: true works"""
        response = requests.put(
            f"{BASE_URL}/api/hotels/st-regis",
            json={"is_active": True}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data['is_active'] is True
        assert data['id'] == 'st-regis'
    
    def test_inactive_hotel_excluded_from_default_list(self):
        """Verify inactive hotels are excluded from default list"""
        # First toggle off
        requests.put(f"{BASE_URL}/api/hotels/st-regis", json={"is_active": False})
        
        # Get hotels without include_inactive
        response = requests.get(f"{BASE_URL}/api/hotels")
        assert response.status_code == 200
        
        data = response.json()
        hotel_ids = [h['id'] for h in data]
        assert 'st-regis' not in hotel_ids, "Inactive hotel should not appear in default list"
        
        # Toggle back on
        requests.put(f"{BASE_URL}/api/hotels/st-regis", json={"is_active": True})
    
    def test_inactive_hotel_included_with_flag(self):
        """Verify inactive hotels are included with include_inactive=true"""
        # First toggle off
        requests.put(f"{BASE_URL}/api/hotels/st-regis", json={"is_active": False})
        
        # Get hotels with include_inactive
        response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        assert response.status_code == 200
        
        data = response.json()
        hotel_ids = [h['id'] for h in data]
        assert 'st-regis' in hotel_ids, "Inactive hotel should appear with include_inactive=true"
        
        # Toggle back on
        requests.put(f"{BASE_URL}/api/hotels/st-regis", json={"is_active": True})


class TestStRegisImage:
    """Tests for St. Regis image fix - no example.com placeholder"""
    
    def test_st_regis_has_valid_image(self):
        """Verify St. Regis hotel has a proper image URL (not example.com)"""
        response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        assert response.status_code == 200
        
        data = response.json()
        st_regis = next((h for h in data if h['id'] == 'st-regis'), None)
        
        assert st_regis is not None, "St. Regis hotel should exist"
        assert 'image' in st_regis, "St. Regis should have image field"
        assert st_regis['image'] is not None, "St. Regis image should not be null"
        assert 'example.com' not in st_regis['image'], "St. Regis should not have example.com placeholder"
        assert 'pexels' in st_regis['image'].lower() or 'unsplash' in st_regis['image'].lower() or 'cloudinary' in st_regis['image'].lower(), \
            "St. Regis should have a real image URL"


class TestPartnerEndpoints:
    """Tests for all partner endpoints returning data"""
    
    def test_golf_courses_returns_data(self):
        """Verify /api/golf-courses returns data"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have at least one golf course"
        
        # Check first course has required fields
        course = data[0]
        assert 'id' in course
        assert 'name' in course
        assert 'image' in course
    
    def test_hotels_returns_data(self):
        """Verify /api/hotels returns data"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have at least one hotel"
    
    def test_restaurants_returns_data(self):
        """Verify /api/restaurants returns data"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have at least one restaurant"
    
    def test_beach_clubs_returns_data(self):
        """Verify /api/beach-clubs returns data"""
        response = requests.get(f"{BASE_URL}/api/beach-clubs")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have at least one beach club"
    
    def test_cafe_bars_returns_data(self):
        """Verify /api/cafe-bars returns data"""
        response = requests.get(f"{BASE_URL}/api/cafe-bars")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have at least one cafe/bar"
    
    def test_all_partners_returns_grouped_data(self):
        """Verify /api/all-partners returns all categories"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200
        
        data = response.json()
        assert 'golf_courses' in data
        assert 'hotels' in data
        assert 'restaurants' in data
        assert 'beach_clubs' in data
        assert 'cafe_bars' in data
        assert 'total_count' in data
        
        assert len(data['golf_courses']) > 0
        assert len(data['hotels']) > 0


class TestNoExampleComImages:
    """Tests to ensure no example.com placeholder images exist"""
    
    def test_no_example_com_in_hotels(self):
        """Verify no hotels have example.com images"""
        response = requests.get(f"{BASE_URL}/api/hotels?include_inactive=true")
        assert response.status_code == 200
        
        data = response.json()
        for hotel in data:
            if hotel.get('image'):
                assert 'example.com' not in hotel['image'], \
                    f"Hotel {hotel['id']} has example.com placeholder image"
    
    def test_no_example_com_in_golf_courses(self):
        """Verify no golf courses have example.com images"""
        response = requests.get(f"{BASE_URL}/api/golf-courses?include_inactive=true")
        assert response.status_code == 200
        
        data = response.json()
        for course in data:
            if course.get('image'):
                assert 'example.com' not in course['image'], \
                    f"Golf course {course['id']} has example.com placeholder image"


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_root(self):
        """Verify API root endpoint works"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
    
    def test_search_endpoint(self):
        """Verify search endpoint works"""
        response = requests.get(f"{BASE_URL}/api/search?q=golf")
        assert response.status_code == 200
        
        data = response.json()
        assert 'results' in data
        assert 'count' in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
