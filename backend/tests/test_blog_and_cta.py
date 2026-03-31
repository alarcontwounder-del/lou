"""
Test Blog Posts, CTAs, and Homepage Sections
Tests for blog modal with scroll indicator and CTA buttons
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBlogAPI:
    """Blog API endpoint tests"""
    
    def test_blog_endpoint_returns_200(self):
        """Test /api/blog returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/blog returns 200")
    
    def test_blog_returns_10_posts(self):
        """Test blog endpoint returns exactly 10 posts"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        assert len(posts) == 10, f"Expected 10 posts, got {len(posts)}"
        print("PASS: Blog returns 10 posts")
    
    def test_blog_posts_have_required_fields(self):
        """Test each blog post has required fields"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        required_fields = ['id', 'slug', 'title', 'excerpt', 'content', 'image', 'author', 'created_at', 'category']
        
        for post in posts:
            for field in required_fields:
                assert field in post, f"Post {post.get('slug', 'unknown')} missing {field}"
        print("PASS: All posts have required fields")
    
    def test_blog_posts_have_cta(self):
        """Test all 10 blog posts have CTA with label and url"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        posts_with_cta = 0
        for post in posts:
            if 'cta' in post and post['cta']:
                assert 'label' in post['cta'], f"Post {post['slug']} CTA missing label"
                assert 'url' in post['cta'], f"Post {post['slug']} CTA missing url"
                posts_with_cta += 1
                print(f"  - {post['slug']}: '{post['cta']['label']}' -> {post['cta']['url']}")
        
        assert posts_with_cta == 10, f"Expected 10 posts with CTA, got {posts_with_cta}"
        print("PASS: All 10 posts have CTA buttons")
    
    def test_golf_near_palma_cta(self):
        """Test Golf Near Palma post has correct CTA"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        post = next((p for p in posts if p['slug'] == 'golf-near-palma-courses'), None)
        
        assert post is not None, "Golf Near Palma post not found"
        assert post['cta']['label'] == 'Book your next Tee Time in Palma Now!', f"Wrong label: {post['cta']['label']}"
        assert post['cta']['url'] == '/book-tee-times', f"Wrong URL: {post['cta']['url']}"
        print("PASS: Golf Near Palma CTA correct")
    
    def test_stay_and_play_cta(self):
        """Test Stay & Play post has correct CTA"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        post = next((p for p in posts if p['slug'] == 'stay-and-play-golf-packages-mallorca'), None)
        
        assert post is not None, "Stay & Play post not found"
        assert post['cta']['label'] == 'Explore Our Hotel Partners', f"Wrong label: {post['cta']['label']}"
        assert post['cta']['url'] == '#hotels', f"Wrong URL: {post['cta']['url']}"
        print("PASS: Stay & Play CTA correct")
    
    def test_golf_gastronomy_cta(self):
        """Test Golf & Gastronomy post has correct CTA"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        post = next((p for p in posts if p['slug'] == 'golf-and-gastronomy-mallorca'), None)
        
        assert post is not None, "Golf & Gastronomy post not found"
        assert post['cta']['label'] == 'Explore Our Restaurant Partners', f"Wrong label: {post['cta']['label']}"
        assert post['cta']['url'] == '#restaurants', f"Wrong URL: {post['cta']['url']}"
        print("PASS: Golf & Gastronomy CTA correct")
    
    def test_art_culture_cta(self):
        """Test Art & Culture post has correct CTA"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        post = next((p for p in posts if p['slug'] == 'art-culture-mallorca-golfers'), None)
        
        assert post is not None, "Art & Culture post not found"
        assert post['cta']['label'] == 'Discover Cafes & Bars in Mallorca', f"Wrong label: {post['cta']['label']}"
        assert post['cta']['url'] == '#cafes-bars', f"Wrong URL: {post['cta']['url']}"
        print("PASS: Art & Culture CTA correct")


class TestPartnersAPI:
    """Partner sections API tests"""
    
    def test_all_partners_endpoint(self):
        """Test /api/all-partners returns data"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert 'golf_courses' in data, "Missing golf_courses"
        assert 'hotels' in data, "Missing hotels"
        assert 'restaurants' in data, "Missing restaurants"
        assert 'beach_clubs' in data, "Missing beach_clubs"
        assert 'cafe_bars' in data, "Missing cafe_bars"
        print("PASS: /api/all-partners returns all partner types")
    
    def test_partners_have_images(self):
        """Test partner cards have images"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        # Check each category has items with images (skip total_count)
        partner_categories = ['golf_courses', 'hotels', 'restaurants', 'beach_clubs', 'cafe_bars']
        for category in partner_categories:
            partners = data.get(category, [])
            if len(partners) > 0:
                sample = partners[0]
                assert 'image' in sample or 'imageUrl' in sample, f"{category} items missing image field"
        print("PASS: Partner items have image fields")
    
    def test_golf_courses_count(self):
        """Test golf courses count"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        assert len(data['golf_courses']) == 16, f"Expected 16 golf courses, got {len(data['golf_courses'])}"
        print("PASS: 16 golf courses returned")
    
    def test_hotels_count(self):
        """Test hotels count"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        assert len(data['hotels']) >= 1, f"Expected hotels, got {len(data['hotels'])}"
        print(f"PASS: {len(data['hotels'])} hotels returned")
    
    def test_restaurants_count(self):
        """Test restaurants count"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        assert len(data['restaurants']) >= 1, f"Expected restaurants, got {len(data['restaurants'])}"
        print(f"PASS: {len(data['restaurants'])} restaurants returned")


class TestLandingPages:
    """Test landing page routes"""
    
    def test_book_tee_times_page(self):
        """Test /book-tee-times page loads"""
        response = requests.get(f"{BASE_URL}/book-tee-times", allow_redirects=True)
        # Frontend pages return HTML, but any 2xx is fine
        assert response.status_code in [200, 304], f"Expected 200/304, got {response.status_code}"
        print("PASS: /book-tee-times accessible")
    
    def test_golf_holidays_page(self):
        """Test /golf-holidays-mallorca page loads"""
        response = requests.get(f"{BASE_URL}/golf-holidays-mallorca", allow_redirects=True)
        assert response.status_code in [200, 304], f"Expected 200/304, got {response.status_code}"
        print("PASS: /golf-holidays-mallorca accessible")
    
    def test_homepage_loads(self):
        """Test homepage loads"""
        response = requests.get(f"{BASE_URL}/", allow_redirects=True)
        assert response.status_code in [200, 304], f"Expected 200/304, got {response.status_code}"
        print("PASS: Homepage accessible")


class TestSearchAPI:
    """Search functionality tests"""
    
    def test_search_golf(self):
        """Test search for 'golf' returns results"""
        response = requests.get(f"{BASE_URL}/api/search", params={"q": "golf"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        results = response.json()
        assert len(results) > 0, "Expected search results for 'golf'"
        print(f"PASS: Search 'golf' returns {len(results)} results")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
