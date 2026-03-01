#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class GolfMallorcaAPITester:
    def __init__(self, base_url="https://luxury-golf-refresh.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            self.failed_tests.append({"test": name, "details": details})
            print(f"❌ {name} - FAILED: {details}")

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data}"
            self.log_test("API Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, str(e))
            return False

    def test_golf_courses_api(self):
        """Test golf courses API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/golf-courses", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                courses = response.json()
                details += f", Count: {len(courses)}"
                
                # Validate structure
                if len(courses) >= 4:  # Should have 4 courses
                    sample_course = courses[0]
                    required_fields = ['id', 'name', 'description', 'image', 'holes', 'par', 'features', 'booking_url']
                    missing_fields = [field for field in required_fields if field not in sample_course]
                    
                    if not missing_fields:
                        # Check multi-language support
                        if isinstance(sample_course.get('description'), dict):
                            langs = sample_course['description'].keys()
                            details += f", Languages: {list(langs)}"
                        else:
                            success = False
                            details += ", Missing multi-language descriptions"
                    else:
                        success = False
                        details += f", Missing fields: {missing_fields}"
                else:
                    success = False
                    details += f", Expected 4+ courses, got {len(courses)}"
                    
            self.log_test("Golf Courses API", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Golf Courses API", False, str(e))
            return False, []

    def test_partner_offers_api(self):
        """Test partner offers API endpoint"""
        try:
            # Test all offers
            response = requests.get(f"{self.api_url}/partner-offers", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                offers = response.json()
                details += f", Total offers: {len(offers)}"
                
                # Test hotel filter
                hotel_response = requests.get(f"{self.api_url}/partner-offers?offer_type=hotel", timeout=10)
                if hotel_response.status_code == 200:
                    hotels = hotel_response.json()
                    details += f", Hotels: {len(hotels)}"
                    
                    # Test restaurant filter
                    restaurant_response = requests.get(f"{self.api_url}/partner-offers?offer_type=restaurant", timeout=10)
                    if restaurant_response.status_code == 200:
                        restaurants = restaurant_response.json()
                        details += f", Restaurants: {len(restaurants)}"
                        
                        # Validate structure
                        if len(hotels) >= 3 and len(restaurants) >= 3:
                            sample_offer = offers[0]
                            required_fields = ['id', 'name', 'type', 'description', 'image', 'location', 'deal', 'contact_url']
                            missing_fields = [field for field in required_fields if field not in sample_offer]
                            
                            if missing_fields:
                                success = False
                                details += f", Missing fields: {missing_fields}"
                        else:
                            success = False
                            details += f", Expected 3+ hotels and 3+ restaurants"
                    else:
                        success = False
                        details += f", Restaurant filter failed: {restaurant_response.status_code}"
                else:
                    success = False
                    details += f", Hotel filter failed: {hotel_response.status_code}"
                    
            self.log_test("Partner Offers API", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Partner Offers API", False, str(e))
            return False, []

    def test_contact_api(self):
        """Test contact form submission API"""
        try:
            # Test POST request
            test_data = {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+34 123 456 789",
                "country": "germany",
                "message": "Test inquiry for golf booking",
                "inquiry_type": "general"
            }
            
            response = requests.post(
                f"{self.api_url}/contact", 
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                details += f", Created ID: {result.get('id', 'N/A')}"
                
                # Validate response structure
                required_fields = ['id', 'name', 'email', 'country', 'message', 'created_at']
                missing_fields = [field for field in required_fields if field not in result]
                
                if missing_fields:
                    success = False
                    details += f", Missing response fields: {missing_fields}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"
                    
            self.log_test("Contact Form API", success, details)
            return success
        except Exception as e:
            self.log_test("Contact Form API", False, str(e))
            return False

    def test_cors_headers(self):
        """Test CORS headers are present"""
        try:
            response = requests.options(f"{self.api_url}/golf-courses", timeout=10)
            success = response.status_code in [200, 204]
            details = f"Status: {response.status_code}"
            
            if success:
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
                }
                details += f", CORS headers present: {bool(any(cors_headers.values()))}"
                
            self.log_test("CORS Headers", success, details)
            return success
        except Exception as e:
            self.log_test("CORS Headers", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🏌️ Starting Mallorca Golf API Tests...")
        print("=" * 50)
        
        # Test API availability
        api_available = self.test_api_root()
        
        if not api_available:
            print("\n❌ API is not available. Stopping tests.")
            return False
            
        # Run all tests
        self.test_golf_courses_api()
        self.test_partner_offers_api()
        self.test_contact_api()
        self.test_cors_headers()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✅ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = GolfMallorcaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())