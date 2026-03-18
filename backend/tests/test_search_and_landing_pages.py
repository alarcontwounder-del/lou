"""
Tests for search functionality and landing pages for golfinmallorca.com
- Search API tests for page results
- Landing pages accessibility tests
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSearchAPI:
    """Tests for search endpoint returning static page results"""
    
    def test_search_golf_holidays_returns_page_result(self):
        """Test that searching 'golf holidays' returns the Golf Holidays landing page"""
        response = requests.get(f"{BASE_URL}/api/search", params={"q": "golf holidays", "category": "all"})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert len(data["results"]) >= 1
        
        # Find the page result
        page_results = [r for r in data["results"] if r.get("type") == "page"]
        assert len(page_results) >= 1, "Should return at least one page result for 'golf holidays'"
        
        golf_holidays_page = next((p for p in page_results if p["id"] == "golf-holidays-mallorca"), None)
        assert golf_holidays_page is not None, "Should return Golf Holidays page"
        assert golf_holidays_page["name"] == "Golf Holidays in Mallorca"
        assert golf_holidays_page["booking_url"] == "/golf-holidays-mallorca"
        assert golf_holidays_page["type"] == "page"
    
    def test_search_book_tee_times_returns_page_result(self):
        """Test that searching 'book tee times' returns the Book Tee Times landing page"""
        response = requests.get(f"{BASE_URL}/api/search", params={"q": "book tee times", "category": "all"})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert len(data["results"]) >= 1
        
        # Find the page result
        page_results = [r for r in data["results"] if r.get("type") == "page"]
        assert len(page_results) >= 1, "Should return at least one page result for 'book tee times'"
        
        book_tee_times_page = next((p for p in page_results if p["id"] == "book-tee-times"), None)
        assert book_tee_times_page is not None, "Should return Book Tee Times page"
        assert book_tee_times_page["name"] == "Book Tee Times in Mallorca"
        assert book_tee_times_page["booking_url"] == "/book-tee-times"
        assert book_tee_times_page["type"] == "page"
    
    def test_search_packages_returns_golf_holidays_page(self):
        """Test that searching 'packages' returns the Golf Holidays landing page"""
        response = requests.get(f"{BASE_URL}/api/search", params={"q": "packages", "category": "all"})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        
        # Find the page result
        page_results = [r for r in data["results"] if r.get("type") == "page"]
        assert len(page_results) >= 1, "Should return at least one page result for 'packages'"
        
        # Golf Holidays page should be in results (packages keyword is in its keywords)
        golf_holidays_page = next((p for p in page_results if p["id"] == "golf-holidays-mallorca"), None)
        assert golf_holidays_page is not None, "Should return Golf Holidays page for 'packages' query"
    
    def test_page_results_have_correct_structure(self):
        """Test that page results have all required fields"""
        response = requests.get(f"{BASE_URL}/api/search", params={"q": "golf holidays", "category": "all"})
        assert response.status_code == 200
        
        data = response.json()
        page_results = [r for r in data["results"] if r.get("type") == "page"]
        
        for page in page_results:
            assert "id" in page
            assert "type" in page
            assert page["type"] == "page"
            assert "name" in page
            assert "location" in page
            assert "booking_url" in page
            assert "description" in page
            # Page type should have category field
            assert "category" in page
            assert page["category"] == "page"
    
    def test_search_empty_query_still_works(self):
        """Test search with empty query returns results (including pages)"""
        response = requests.get(f"{BASE_URL}/api/search", params={"q": "", "category": "all"})
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        # Should return some results even with empty query
        assert len(data["results"]) > 0


class TestLandingPagesAccessibility:
    """Tests to verify landing pages are accessible and load correctly"""
    
    def test_homepage_loads(self):
        """Test that homepage loads correctly"""
        response = requests.get(f"{BASE_URL}/", timeout=10)
        assert response.status_code == 200
    
    def test_golf_holidays_page_route_exists(self):
        """Test that /golf-holidays-mallorca route is accessible"""
        response = requests.get(f"{BASE_URL}/golf-holidays-mallorca", timeout=10)
        # React SPA returns 200 for all routes (client-side routing)
        assert response.status_code == 200
    
    def test_book_tee_times_page_route_exists(self):
        """Test that /book-tee-times route is accessible"""
        response = requests.get(f"{BASE_URL}/book-tee-times", timeout=10)
        # React SPA returns 200 for all routes (client-side routing)
        assert response.status_code == 200


class TestGolfCoursesAPI:
    """Tests for golf courses API (used by landing pages)"""
    
    def test_golf_courses_endpoint(self):
        """Test that golf courses API returns data"""
        response = requests.get(f"{BASE_URL}/api/golf-courses", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check first course has required fields
        course = data[0]
        assert "id" in course
        assert "name" in course
        assert "holes" in course
        assert "par" in course
        assert "booking_url" in course


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
