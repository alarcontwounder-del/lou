"""
Test file for Golf Course API endpoints
Testing golf course detail pages - GET /api/golf-courses/{course_id}
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')

class TestGolfCoursesAPI:
    """Golf Course API endpoint tests"""
    
    def test_get_golf_alcanada_returns_200(self):
        """Test GET /api/golf-courses/golf-alcanada returns valid course data"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/golf-alcanada")
        assert response.status_code == 200
        
        data = response.json()
        # Validate structure and values
        assert data["id"] == "golf-alcanada"
        assert data["name"] == "Golf Alcanada"
        assert data["holes"] == 18
        assert data["par"] == 72
        assert "description" in data
        assert "en" in data["description"]
        assert "image" in data
        assert "booking_url" in data
        assert "features" in data
        assert isinstance(data["features"], list)
        assert "location" in data
        assert data["location"] == "Alcúdia"
    
    def test_get_golf_son_gual_returns_200(self):
        """Test GET /api/golf-courses/golf-son-gual returns valid course data"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/golf-son-gual")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "golf-son-gual"
        assert data["name"] == "Golf Son Gual Mallorca"
        assert data["holes"] == 18
        assert data["par"] == 72
        assert "description" in data
        assert "booking_url" in data
    
    def test_get_pula_golf_resort_returns_200(self):
        """Test GET /api/golf-courses/pula-golf-resort returns valid course data"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/pula-golf-resort")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "pula-golf-resort"
        assert "name" in data
        assert data["holes"] == 18
    
    def test_get_nonexistent_course_returns_404(self):
        """Test GET /api/golf-courses/nonexistent returns 404"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/nonexistent")
        assert response.status_code == 404
        
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_get_invalid_course_id_returns_404(self):
        """Test GET /api/golf-courses/invalid-slug-12345 returns 404"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/invalid-slug-12345")
        assert response.status_code == 404
    
    def test_get_all_golf_courses_returns_list(self):
        """Test GET /api/golf-courses returns list of courses"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check that alcanada is in the list
        course_ids = [c["id"] for c in data]
        assert "golf-alcanada" in course_ids
        assert "golf-son-gual" in course_ids
    
    def test_golf_course_has_required_fields(self):
        """Test that golf courses have all required fields"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/golf-alcanada")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name", "description", "image", "holes", "par", "features", "booking_url"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
    
    def test_golf_course_multilang_descriptions(self):
        """Test that golf courses have multi-language descriptions"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/golf-alcanada")
        assert response.status_code == 200
        
        data = response.json()
        assert "description" in data
        desc = data["description"]
        
        # Should have at least English
        assert "en" in desc
        assert len(desc["en"]) > 0
    
    def test_golf_course_features_is_list(self):
        """Test that features field is a list"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/golf-alcanada")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data["features"], list)
        assert len(data["features"]) > 0
    
    def test_golf_course_has_price(self):
        """Test that golf course has price_from field"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/golf-alcanada")
        assert response.status_code == 200
        
        data = response.json()
        assert "price_from" in data
        assert data["price_from"] == 115  # Alcanada price


class TestGolfCoursesListAPI:
    """Tests for the golf courses list endpoint"""
    
    def test_courses_list_contains_16_courses(self):
        """Test that courses list contains at least 16 courses (based on SEO data)"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        # Should have at least 16 courses based on golfCourseSEO.js
        assert len(data) >= 16
    
    def test_each_course_has_id_and_name(self):
        """Test that each course in list has id and name"""
        response = requests.get(f"{BASE_URL}/api/golf-courses")
        assert response.status_code == 200
        
        data = response.json()
        for course in data:
            assert "id" in course
            assert "name" in course
            assert len(course["id"]) > 0
            assert len(course["name"]) > 0


class TestGolfCourseSEOCourses:
    """Test specific courses mentioned in golfCourseSEO.js"""
    
    courses_to_test = [
        "golf-alcanada",
        "golf-son-gual",
        "pula-golf-resort",
        "son-vida-golf",
        "son-muntaner-golf",
        "son-quint-golf",
        "son-antem-east",
        "son-antem-west",
        "capdepera-golf",
        "golf-santa-ponsa",
        "golf-son-servera",
        "vall-dor-golf",
        "real-golf-bendinat",
        "golf-ibiza",
        "roca-llisa-ibiza",
        "golf-son-parc-menorca"
    ]
    
    @pytest.mark.parametrize("course_id", courses_to_test)
    def test_seo_course_exists(self, course_id):
        """Test that each SEO course exists in the API"""
        response = requests.get(f"{BASE_URL}/api/golf-courses/{course_id}")
        assert response.status_code == 200, f"Course {course_id} should exist"
        
        data = response.json()
        assert data["id"] == course_id


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
