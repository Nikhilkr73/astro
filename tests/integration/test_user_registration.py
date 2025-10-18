#!/usr/bin/env python3
"""
Integration Tests - User Registration
Tests complete user registration flow including API endpoints
"""

import sys
import os
import requests
import json
import time
from datetime import datetime

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

class TestUserRegistration:
    """Test user registration integration"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.test_results = []
    
    def check_server_running(self):
        """Check if server is running"""
        print("🔍 Checking if server is running...")
        
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Server is running")
                return True
            else:
                print(f"❌ Server health check failed: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Server not accessible: {e}")
            return False
    
    def test_user_registration_api(self):
        """Test user registration via API"""
        print("🔍 Testing user registration API...")
        
        # Test data
        test_data = {
            "phone_number": f"+919999999{int(time.time()) % 10000:04d}",
            "full_name": "API Test User",
            "display_name": "APITest",
            "date_of_birth": "15/06/1990",
            "time_of_birth": "02:30 PM",
            "place_of_birth": "Mumbai, India",
            "gender": "Male",
            "language_preference": "en"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/users/register",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Verify response structure
                required_fields = ['success', 'user_id', 'message', 'wallet']
                for field in required_fields:
                    if field not in result:
                        print(f"❌ Missing field in response: {field}")
                        return False
                
                # Verify user ID format
                user_id = result['user_id']
                if not user_id.startswith('user_'):
                    print(f"❌ Invalid user ID format: {user_id}")
                    return False
                
                # Verify wallet creation
                wallet = result['wallet']
                if wallet['balance'] != 500.0:
                    print(f"❌ Invalid wallet balance: {wallet['balance']}")
                    return False
                
                print("✅ User registration API successful")
                return True
                
            else:
                print(f"❌ Registration failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed: {e}")
            return False
    
    def test_language_preference_storage(self):
        """Test language preference storage via API"""
        print("🔍 Testing language preference storage...")
        
        languages = ['en', 'hi', 'ta']
        results = []
        
        for lang in languages:
            test_data = {
                "phone_number": f"+919999999{int(time.time()) % 10000:04d}",
                "full_name": f"Language Test User {lang.upper()}",
                "display_name": f"LangTest{lang.upper()}",
                "date_of_birth": "01/01/1990",
                "time_of_birth": "12:00 PM",
                "place_of_birth": "Test City",
                "gender": "Male",
                "language_preference": lang
            }
            
            try:
                response = requests.post(
                    f"{self.base_url}/api/users/register",
                    headers={"Content-Type": "application/json"},
                    json=test_data,
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    user_id = result['user_id']
                    
                    # Verify language preference in database
                    if self.verify_language_in_db(user_id, lang):
                        results.append(True)
                        print(f"✅ Language {lang} stored correctly")
                    else:
                        results.append(False)
                        print(f"❌ Language {lang} not stored correctly")
                else:
                    results.append(False)
                    print(f"❌ Registration failed for language {lang}")
                    
            except Exception as e:
                results.append(False)
                print(f"❌ Error testing language {lang}: {e}")
        
        return all(results)
    
    def verify_language_in_db(self, user_id, expected_lang):
        """Verify language preference in database"""
        try:
            try:
                from backend.database.manager import db
            except ImportError:
                # Fallback to root database_manager
                from database_manager import DatabaseManager
                db = DatabaseManager()
            
            user = db.get_user(user_id)
            if user and user.get('language_preference') == expected_lang:
                return True
            return False
            
        except Exception as e:
            print(f"❌ Database verification error: {e}")
            return False
    
    def test_wallet_creation(self):
        """Test wallet creation during registration"""
        print("🔍 Testing wallet creation...")
        
        test_data = {
            "phone_number": f"+919999999{int(time.time()) % 10000:04d}",
            "full_name": "Wallet Test User",
            "display_name": "WalletTest",
            "date_of_birth": "01/01/1990",
            "time_of_birth": "12:00 PM",
            "place_of_birth": "Test City",
            "gender": "Male",
            "language_preference": "en"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/users/register",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                wallet = result['wallet']
                
                # Verify wallet properties
                if (wallet['balance'] == 500.0 and 
                    wallet['currency'] == 'INR' and 
                    wallet['wallet_id'].startswith('wallet_')):
                    print("✅ Wallet creation successful")
                    return True
                else:
                    print(f"❌ Invalid wallet properties: {wallet}")
                    return False
            else:
                print(f"❌ Registration failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Wallet test error: {e}")
            return False
    
    def test_error_handling(self):
        """Test error handling for invalid data"""
        print("🔍 Testing error handling...")
        
        # Test with missing required fields
        invalid_data = {
            "phone_number": "+919999999999",
            # Missing full_name
            "gender": "Male"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/users/register",
                headers={"Content-Type": "application/json"},
                json=invalid_data,
                timeout=10
            )
            
            # Should return error status
            if response.status_code >= 400:
                print("✅ Error handling working correctly")
                return True
            else:
                print(f"❌ Should have returned error for invalid data: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error handling test failed: {e}")
            return False
    
    def run_all_tests(self):
        """Run all integration tests"""
        print("🧪 Running User Registration Integration Tests")
        print("=" * 60)
        
        if not self.check_server_running():
            print("❌ Server not running. Please start the server first.")
            return False
        
        tests = [
            ("User Registration API", self.test_user_registration_api),
            ("Language Preference Storage", self.test_language_preference_storage),
            ("Wallet Creation", self.test_wallet_creation),
            ("Error Handling", self.test_error_handling)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🔍 Running: {test_name}")
            try:
                if test_func():
                    passed += 1
                    print(f"✅ {test_name} - PASSED")
                else:
                    print(f"❌ {test_name} - FAILED")
            except Exception as e:
                print(f"💥 {test_name} - ERROR: {e}")
        
        print(f"\n📊 Integration Test Summary:")
        print(f"Passed: {passed}/{total}")
        
        return passed == total

def main():
    """Main function"""
    tester = TestUserRegistration()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
