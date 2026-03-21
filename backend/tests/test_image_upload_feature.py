"""
Test suite for the Drag-and-Drop Image Upload feature in Admin Dashboard.
Tests: POST /api/admin/upload-image, GET /api/images/{path}, PATCH /api/admin/partner/{partner_id}/image
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Minimal valid JPEG bytes (1x1 pixel red image)
MINIMAL_JPEG = bytes([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
    0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
    0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
    0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
    0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
    0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
    0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
    0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
    0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD5, 0xDB, 0x20, 0xA8, 0xF1, 0x7E, 0xA9,
    0x00, 0x1F, 0xFF, 0xD9
])


class TestImageUploadEndpoint:
    """Test POST /api/admin/upload-image endpoint"""
    
    def test_upload_jpeg_image(self):
        """Upload a JPEG image and verify response contains url and path"""
        files = {'file': ('test_image.jpg', io.BytesIO(MINIMAL_JPEG), 'image/jpeg')}
        response = requests.post(f"{BASE_URL}/api/admin/upload-image", files=files)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert 'url' in data, "Response should contain 'url' field"
        assert 'path' in data, "Response should contain 'path' field"
        
        # Verify URL format
        assert data['url'].startswith('/api/images/'), f"URL should start with /api/images/, got: {data['url']}"
        assert 'mallorca-golf/partners/' in data['path'], f"Path should contain mallorca-golf/partners/, got: {data['path']}"
        
        print(f"✓ Upload successful: url={data['url']}, path={data['path']}")
        return data
    
    def test_upload_png_image(self):
        """Upload a PNG image and verify it's accepted"""
        # Minimal PNG (1x1 pixel)
        png_bytes = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59, 0xE7, 0x00, 0x00, 0x00,
            0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        files = {'file': ('test_image.png', io.BytesIO(png_bytes), 'image/png')}
        response = requests.post(f"{BASE_URL}/api/admin/upload-image", files=files)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert 'url' in data
        assert 'path' in data
        print(f"✓ PNG upload successful: {data['url']}")
    
    def test_upload_rejects_invalid_file_type(self):
        """Verify that non-image files are rejected"""
        files = {'file': ('test.txt', io.BytesIO(b'Hello World'), 'text/plain')}
        response = requests.post(f"{BASE_URL}/api/admin/upload-image", files=files)
        
        assert response.status_code == 400, f"Expected 400 for invalid file type, got {response.status_code}"
        print("✓ Invalid file type correctly rejected")


class TestImageServingEndpoint:
    """Test GET /api/images/{path} endpoint"""
    
    def test_serve_uploaded_image(self):
        """Upload an image and verify it can be served back"""
        # First upload an image
        files = {'file': ('test_serve.jpg', io.BytesIO(MINIMAL_JPEG), 'image/jpeg')}
        upload_response = requests.post(f"{BASE_URL}/api/admin/upload-image", files=files)
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        
        # Now fetch the image
        serve_url = f"{BASE_URL}{upload_data['url']}"
        serve_response = requests.get(serve_url)
        
        assert serve_response.status_code == 200, f"Expected 200, got {serve_response.status_code}"
        assert 'image/' in serve_response.headers.get('Content-Type', ''), "Content-Type should be image/*"
        assert len(serve_response.content) > 0, "Image content should not be empty"
        
        print(f"✓ Image served successfully from {upload_data['url']}")
    
    def test_serve_nonexistent_image_returns_error(self):
        """Verify that requesting a non-existent image returns an error"""
        response = requests.get(f"{BASE_URL}/api/images/nonexistent/path/image.jpg")
        
        # Should return 404 or 500 (depending on storage implementation)
        assert response.status_code in [404, 500], f"Expected 404 or 500, got {response.status_code}"
        print("✓ Non-existent image correctly returns error")


class TestPartnerImageUpdateEndpoint:
    """Test PATCH /api/admin/partner/{partner_id}/image endpoint"""
    
    def test_update_partner_image_golf_course(self):
        """Update a golf course partner's image"""
        test_image_url = "https://example.com/test-image.jpg"
        
        response = requests.patch(
            f"{BASE_URL}/api/admin/partner/golf-son-gual/image",
            json={"image": test_image_url}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get('status') == 'ok', f"Expected status 'ok', got: {data}"
        assert data.get('partner_id') == 'golf-son-gual', f"Expected partner_id 'golf-son-gual', got: {data}"
        
        print(f"✓ Partner image updated: {data}")
    
    def test_update_partner_image_hotel(self):
        """Update a hotel partner's image"""
        test_image_url = "https://example.com/hotel-test-image.jpg"
        
        # Get a hotel ID first
        hotels_response = requests.get(f"{BASE_URL}/api/hotels")
        hotels = hotels_response.json()
        if hotels:
            hotel_id = hotels[0].get('id')
            
            response = requests.patch(
                f"{BASE_URL}/api/admin/partner/{hotel_id}/image",
                json={"image": test_image_url}
            )
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            data = response.json()
            assert data.get('status') == 'ok'
            print(f"✓ Hotel image updated for {hotel_id}")
        else:
            pytest.skip("No hotels found to test")
    
    def test_update_partner_image_missing_url(self):
        """Verify that missing image URL returns 400"""
        response = requests.patch(
            f"{BASE_URL}/api/admin/partner/golf-son-gual/image",
            json={}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Missing image URL correctly returns 400")
    
    def test_update_nonexistent_partner_creates_override(self):
        """Updating a non-existent partner should create an override entry"""
        test_image_url = "https://example.com/override-test.jpg"
        
        response = requests.patch(
            f"{BASE_URL}/api/admin/partner/nonexistent-partner-xyz/image",
            json={"image": test_image_url}
        )
        
        # Should still return 200 as it creates an override
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get('status') == 'ok'
        print("✓ Non-existent partner creates override entry")


class TestAllPartnersEndpoint:
    """Test GET /api/all-partners endpoint"""
    
    def test_all_partners_returns_all_categories(self):
        """Verify /api/all-partners returns all partner categories"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify all categories are present
        required_categories = ['golf_courses', 'hotels', 'restaurants', 'beach_clubs', 'cafe_bars']
        for category in required_categories:
            assert category in data, f"Missing category: {category}"
            assert isinstance(data[category], list), f"{category} should be a list"
        
        print(f"✓ All categories present:")
        print(f"  - Golf courses: {len(data['golf_courses'])}")
        print(f"  - Hotels: {len(data['hotels'])}")
        print(f"  - Restaurants: {len(data['restaurants'])}")
        print(f"  - Beach clubs: {len(data['beach_clubs'])}")
        print(f"  - Cafe bars: {len(data['cafe_bars'])}")
    
    def test_all_partners_items_have_required_fields(self):
        """Verify partner items have id, name, and image fields"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        
        for category in ['golf_courses', 'hotels', 'restaurants', 'beach_clubs', 'cafe_bars']:
            items = data.get(category, [])
            for item in items[:3]:  # Check first 3 items of each category
                assert 'id' in item, f"Missing 'id' in {category} item"
                assert 'name' in item, f"Missing 'name' in {category} item"
                assert 'image' in item, f"Missing 'image' in {category} item: {item.get('name')}"
        
        print("✓ All partner items have required fields (id, name, image)")


class TestEndToEndImageUploadFlow:
    """Test the complete flow: upload → serve → update partner"""
    
    def test_complete_image_upload_flow(self):
        """Test the complete flow of uploading an image and updating a partner"""
        # Step 1: Upload image
        files = {'file': ('e2e_test.jpg', io.BytesIO(MINIMAL_JPEG), 'image/jpeg')}
        upload_response = requests.post(f"{BASE_URL}/api/admin/upload-image", files=files)
        assert upload_response.status_code == 200, f"Upload failed: {upload_response.text}"
        upload_data = upload_response.json()
        print(f"Step 1: Image uploaded - {upload_data['url']}")
        
        # Step 2: Verify image can be served
        full_url = f"{BASE_URL}{upload_data['url']}"
        serve_response = requests.get(full_url)
        assert serve_response.status_code == 200, f"Serve failed: {serve_response.status_code}"
        print(f"Step 2: Image served successfully")
        
        # Step 3: Update partner with the new image URL
        partner_id = "golf-son-gual"
        image_url = f"{BASE_URL}{upload_data['url']}"
        patch_response = requests.patch(
            f"{BASE_URL}/api/admin/partner/{partner_id}/image",
            json={"image": image_url}
        )
        assert patch_response.status_code == 200, f"Patch failed: {patch_response.text}"
        print(f"Step 3: Partner {partner_id} updated with new image")
        
        # Step 4: Verify partner has the new image
        all_partners = requests.get(f"{BASE_URL}/api/all-partners").json()
        golf_courses = all_partners.get('golf_courses', [])
        partner = next((p for p in golf_courses if p['id'] == partner_id), None)
        
        if partner:
            assert partner.get('image') == image_url, f"Partner image not updated. Expected: {image_url}, Got: {partner.get('image')}"
            print(f"Step 4: Verified partner image is updated")
        
        print("✓ Complete E2E flow successful!")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
