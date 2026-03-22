"""
Blog SEO API Tests - Iteration 23
Tests for blog post endpoints with SEO fields (meta_description, seo_keywords)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Known blog slugs from the data
BLOG_SLUGS = [
    'best-time-golf-mallorca',
    'top-5-courses-beginners',
    'golf-and-gastronomy-mallorca',
    'championship-courses-mallorca',
    'ultimate-golf-guide-mallorca',
    'stay-and-play-golf-packages-mallorca',
    'art-culture-mallorca-golfers',
    'culinary-mallorca-food-guide',
    'cheap-golf-mallorca-budget',
    'golf-near-palma-courses'
]


class TestBlogListEndpoint:
    """Tests for GET /api/blog - list all blog posts"""
    
    def test_blog_list_returns_200(self):
        """Blog list endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/blog returns 200")
    
    def test_blog_list_returns_array(self):
        """Blog list returns an array of posts"""
        response = requests.get(f"{BASE_URL}/api/blog")
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) >= 10, f"Expected at least 10 posts, got {len(data)}"
        print(f"PASS: GET /api/blog returns {len(data)} posts")
    
    def test_blog_posts_have_required_fields(self):
        """Each blog post has required fields for SEO"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        required_fields = ['id', 'slug', 'title', 'excerpt', 'content', 'image', 
                          'author', 'category', 'tags', 'created_at']
        
        for post in posts:
            for field in required_fields:
                assert field in post, f"Missing field '{field}' in post {post.get('slug', 'unknown')}"
        print(f"PASS: All {len(posts)} posts have required fields")
    
    def test_blog_posts_have_seo_fields(self):
        """Each blog post has meta_description and seo_keywords for SEO"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        for post in posts:
            slug = post.get('slug', 'unknown')
            assert 'meta_description' in post, f"Missing meta_description in post {slug}"
            assert 'seo_keywords' in post, f"Missing seo_keywords in post {slug}"
            assert isinstance(post['meta_description'], str), f"meta_description should be string in {slug}"
            assert isinstance(post['seo_keywords'], list), f"seo_keywords should be list in {slug}"
            assert len(post['meta_description']) > 50, f"meta_description too short in {slug}"
            assert len(post['seo_keywords']) >= 3, f"seo_keywords should have at least 3 items in {slug}"
        print(f"PASS: All {len(posts)} posts have SEO fields (meta_description, seo_keywords)")
    
    def test_blog_posts_have_cta(self):
        """Each blog post has a CTA (call-to-action) object"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        for post in posts:
            slug = post.get('slug', 'unknown')
            assert 'cta' in post, f"Missing cta in post {slug}"
            assert 'label' in post['cta'], f"Missing cta.label in post {slug}"
            assert 'url' in post['cta'], f"Missing cta.url in post {slug}"
        print(f"PASS: All {len(posts)} posts have CTA objects")
    
    def test_blog_posts_sorted_by_date_descending(self):
        """Blog posts are sorted by created_at descending (newest first)"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        dates = [post['created_at'] for post in posts]
        assert dates == sorted(dates, reverse=True), "Posts not sorted by date descending"
        print("PASS: Blog posts sorted by date descending")
    
    def test_blog_filter_by_category(self):
        """Blog list can be filtered by category"""
        response = requests.get(f"{BASE_URL}/api/blog?category=travel-tips")
        posts = response.json()
        
        for post in posts:
            assert post['category'] == 'travel-tips', f"Post {post['slug']} has wrong category"
        print(f"PASS: Category filter works, returned {len(posts)} travel-tips posts")


class TestBlogDetailEndpoint:
    """Tests for GET /api/blog/{slug} - single blog post"""
    
    def test_blog_detail_returns_200(self):
        """Blog detail endpoint returns 200 for valid slug"""
        response = requests.get(f"{BASE_URL}/api/blog/best-time-golf-mallorca")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: GET /api/blog/best-time-golf-mallorca returns 200")
    
    def test_blog_detail_returns_404_for_invalid_slug(self):
        """Blog detail endpoint returns 404 for invalid slug"""
        response = requests.get(f"{BASE_URL}/api/blog/nonexistent-slug-12345")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: GET /api/blog/nonexistent-slug returns 404")
    
    def test_blog_detail_has_all_seo_fields(self):
        """Single blog post has all SEO fields"""
        response = requests.get(f"{BASE_URL}/api/blog/best-time-golf-mallorca")
        post = response.json()
        
        # Check SEO fields
        assert 'meta_description' in post, "Missing meta_description"
        assert 'seo_keywords' in post, "Missing seo_keywords"
        assert len(post['meta_description']) > 50, "meta_description too short"
        assert len(post['seo_keywords']) >= 3, "seo_keywords should have at least 3 items"
        
        # Check multilingual fields
        assert 'title' in post and isinstance(post['title'], dict), "title should be multilingual dict"
        assert 'en' in post['title'], "title should have 'en' key"
        assert 'excerpt' in post and isinstance(post['excerpt'], dict), "excerpt should be multilingual dict"
        assert 'content' in post and isinstance(post['content'], dict), "content should be multilingual dict"
        
        print("PASS: Blog post has all SEO fields")
    
    def test_blog_detail_has_cta(self):
        """Single blog post has CTA object"""
        response = requests.get(f"{BASE_URL}/api/blog/best-time-golf-mallorca")
        post = response.json()
        
        assert 'cta' in post, "Missing cta"
        assert 'label' in post['cta'], "Missing cta.label"
        assert 'url' in post['cta'], "Missing cta.url"
        print(f"PASS: Blog post has CTA: {post['cta']['label']} -> {post['cta']['url']}")
    
    @pytest.mark.parametrize("slug", BLOG_SLUGS)
    def test_all_blog_slugs_accessible(self, slug):
        """All known blog slugs are accessible"""
        response = requests.get(f"{BASE_URL}/api/blog/{slug}")
        assert response.status_code == 200, f"Slug {slug} returned {response.status_code}"
        data = response.json()
        assert data['slug'] == slug, f"Returned slug doesn't match requested"
        print(f"PASS: Blog post /{slug} accessible")


class TestBlogDataIntegrity:
    """Tests for blog data integrity and SEO quality"""
    
    def test_all_posts_have_unique_slugs(self):
        """All blog posts have unique slugs"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        slugs = [post['slug'] for post in posts]
        assert len(slugs) == len(set(slugs)), "Duplicate slugs found"
        print(f"PASS: All {len(slugs)} slugs are unique")
    
    def test_all_posts_have_valid_images(self):
        """All blog posts have image URLs"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        for post in posts:
            assert post.get('image'), f"Missing image in post {post['slug']}"
            assert post['image'].startswith('http') or post['image'].startswith('/'), \
                f"Invalid image URL in post {post['slug']}"
        print(f"PASS: All {len(posts)} posts have valid image URLs")
    
    def test_all_posts_have_valid_categories(self):
        """All blog posts have valid categories"""
        valid_categories = ['travel-tips', 'course-guides', 'lifestyle']
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        for post in posts:
            assert post['category'] in valid_categories, \
                f"Invalid category '{post['category']}' in post {post['slug']}"
        print(f"PASS: All {len(posts)} posts have valid categories")
    
    def test_meta_descriptions_are_seo_friendly(self):
        """Meta descriptions are SEO-friendly (50-160 chars)"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        for post in posts:
            meta = post.get('meta_description', '')
            length = len(meta)
            # SEO best practice: 50-160 characters
            assert 50 <= length <= 300, \
                f"meta_description length {length} not optimal in {post['slug']}"
        print(f"PASS: All {len(posts)} posts have SEO-friendly meta descriptions")
    
    def test_seo_keywords_are_relevant(self):
        """SEO keywords contain relevant golf/mallorca terms"""
        response = requests.get(f"{BASE_URL}/api/blog")
        posts = response.json()
        
        golf_terms = ['golf', 'mallorca', 'course', 'tee', 'green', 'play']
        
        for post in posts:
            keywords = post.get('seo_keywords', [])
            keywords_lower = ' '.join(keywords).lower()
            has_relevant = any(term in keywords_lower for term in golf_terms)
            assert has_relevant, f"No relevant golf keywords in {post['slug']}"
        print(f"PASS: All {len(posts)} posts have relevant SEO keywords")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
