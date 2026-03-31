"""
Test suite for verifying the 21 new hotels update:
- Real photos (unique images)
- July pricing (offer_price, no discount_percent)
- Category, region, and deal fields
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# The 21 new hotel IDs
NEW_HOTEL_IDS = [
    'petit-hotel-ses-cases-pula', 'steigenberger-golf-spa-camp-de-mar', 'lindner-hotel-mallorca-portal-nous',
    'la-reserva-rotana', 'hotel-inmood-alcanada', 'alcanada-golf-hotel', 'bordoy-alcudia-port-suites',
    'st-regis-mallorca-resort', 'zafiro-palace-andratx', 'hotel-alcudiamar-club', 'hotel-llenaire',
    'carrossa-hotel-spa', 'robinson-cala-serena', 'son-penya-petit-hotel', 'four-seasons-formentor',
    'el-vicenc-de-la-mar', 'hipotels-playa-de-palma-palace', 'hoposa-niu', 'the-donna-portals',
    'hospes-maricel', 'iberostar-selection-es-trenc'
]


class TestAllPartnersEndpoint:
    """Test /api/all-partners endpoint returns correct hotel data"""
    
    def test_all_partners_returns_200(self):
        """Verify endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("PASS: /api/all-partners returns 200")
    
    def test_all_partners_returns_59_hotels(self):
        """Verify 59 hotels are returned (38 old + 21 new)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        assert len(hotels) == 59, f"Expected 59 hotels, got {len(hotels)}"
        print("PASS: 59 hotels returned")
    
    def test_all_21_new_hotels_present(self):
        """Verify all 21 new hotels are in the response"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        hotel_ids = [h.get('id') for h in hotels]
        
        missing = [hid for hid in NEW_HOTEL_IDS if hid not in hotel_ids]
        assert len(missing) == 0, f"Missing new hotels: {missing}"
        print("PASS: All 21 new hotels present")


class TestNewHotelsHaveOfferPrice:
    """Test new hotels display 'FROM €[price]' (offer_price field)"""
    
    def test_new_hotels_have_offer_price(self):
        """Verify all 21 new hotels have offer_price field"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        missing_price = [h.get('id') for h in new_hotels if not h.get('offer_price')]
        assert len(missing_price) == 0, f"Hotels missing offer_price: {missing_price}"
        print("PASS: All 21 new hotels have offer_price")
    
    def test_new_hotels_no_discount_percent(self):
        """Verify new hotels do NOT have discount_percent (no Save X% badge)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        with_discount = [h.get('id') for h in new_hotels if h.get('discount_percent')]
        assert len(with_discount) == 0, f"Hotels should NOT have discount_percent: {with_discount}"
        print("PASS: No new hotels have discount_percent")
    
    def test_new_hotels_no_original_price(self):
        """Verify new hotels do NOT have original_price"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        with_original = [h.get('id') for h in new_hotels if h.get('original_price')]
        assert len(with_original) == 0, f"Hotels should NOT have original_price: {with_original}"
        print("PASS: No new hotels have original_price")


class TestNewHotelsHaveCategoryRegion:
    """Test new hotels show category and region tags"""
    
    def test_new_hotels_have_category(self):
        """Verify all 21 new hotels have category field"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        missing_category = [h.get('id') for h in new_hotels if not h.get('category')]
        assert len(missing_category) == 0, f"Hotels missing category: {missing_category}"
        print("PASS: All 21 new hotels have category")
    
    def test_new_hotels_have_region(self):
        """Verify all 21 new hotels have region field"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        missing_region = [h.get('id') for h in new_hotels if not h.get('region')]
        assert len(missing_region) == 0, f"Hotels missing region: {missing_region}"
        print("PASS: All 21 new hotels have region")


class TestNewHotelsHaveDeal:
    """Test new hotels have deal text for card back"""
    
    def test_new_hotels_have_deal(self):
        """Verify all 21 new hotels have deal field (multilang dict)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        missing_deal = [h.get('id') for h in new_hotels if not h.get('deal')]
        assert len(missing_deal) == 0, f"Hotels missing deal: {missing_deal}"
        print("PASS: All 21 new hotels have deal")
    
    def test_deal_is_multilang_dict(self):
        """Verify deal field is a multilang dict with en, de, fr, sv keys"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        invalid_deal = []
        for h in new_hotels:
            deal = h.get('deal')
            if not isinstance(deal, dict):
                invalid_deal.append(h.get('id'))
            elif 'en' not in deal:
                invalid_deal.append(f"{h.get('id')} (missing 'en')")
        
        assert len(invalid_deal) == 0, f"Hotels with invalid deal format: {invalid_deal}"
        print("PASS: All deals are multilang dicts with 'en' key")


class TestNewHotelsHaveUniqueImages:
    """Test new hotels have unique real photos (no duplicates)"""
    
    def test_new_hotels_have_images(self):
        """Verify all 21 new hotels have image field"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        missing_image = [h.get('id') for h in new_hotels if not h.get('image')]
        assert len(missing_image) == 0, f"Hotels missing image: {missing_image}"
        print("PASS: All 21 new hotels have image")
    
    def test_new_hotels_unique_images(self):
        """Verify no duplicate image URLs among the 21 new hotels"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        images = [h.get('image') for h in new_hotels]
        unique_images = set(images)
        
        assert len(images) == len(unique_images), f"Duplicate images found! {len(images)} total, {len(unique_images)} unique"
        print("PASS: All 21 new hotels have unique images")
    
    def test_images_are_real_urls(self):
        """Verify images are real URLs (pexels or unsplash)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        new_hotels = [h for h in hotels if h.get('id') in NEW_HOTEL_IDS]
        
        invalid_urls = []
        for h in new_hotels:
            img = h.get('image', '')
            if not (img.startswith('https://images.pexels.com') or img.startswith('https://images.unsplash.com')):
                invalid_urls.append(f"{h.get('id')}: {img[:50]}")
        
        assert len(invalid_urls) == 0, f"Hotels with non-pexels/unsplash images: {invalid_urls}"
        print("PASS: All images are from pexels or unsplash")


class TestOldHotelsStillHaveDiscountBadges:
    """Test old hotels still show 'Save X%' discount badges"""
    
    def test_old_hotels_have_discount_percent(self):
        """Verify old hotels (not in new list) have discount_percent"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        old_hotels = [h for h in hotels if h.get('id') not in NEW_HOTEL_IDS]
        
        with_discount = [h for h in old_hotels if h.get('discount_percent')]
        assert len(with_discount) == len(old_hotels), f"Expected all {len(old_hotels)} old hotels to have discount_percent, got {len(with_discount)}"
        print(f"PASS: All {len(old_hotels)} old hotels have discount_percent")
    
    def test_old_hotels_count_is_38(self):
        """Verify there are 38 old hotels (59 total - 21 new)"""
        response = requests.get(f"{BASE_URL}/api/all-partners")
        data = response.json()
        hotels = data.get('hotels', [])
        old_hotels = [h for h in hotels if h.get('id') not in NEW_HOTEL_IDS]
        
        assert len(old_hotels) == 38, f"Expected 38 old hotels, got {len(old_hotels)}"
        print("PASS: 38 old hotels present")


class TestHotelsEndpoint:
    """Test /api/hotels endpoint"""
    
    def test_hotels_endpoint_returns_200(self):
        """Verify /api/hotels returns 200"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        assert response.status_code == 200
        print("PASS: /api/hotels returns 200")
    
    def test_hotels_endpoint_returns_59(self):
        """Verify /api/hotels returns 59 hotels"""
        response = requests.get(f"{BASE_URL}/api/hotels")
        hotels = response.json()
        assert len(hotels) == 59, f"Expected 59, got {len(hotels)}"
        print("PASS: /api/hotels returns 59 hotels")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
