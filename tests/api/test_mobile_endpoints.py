#!/usr/bin/env python3
"""
API Tests - Mobile Endpoints
Tests mobile API endpoints functionality
"""

import sys
import os
import requests
import json
import time
from datetime import datetime

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class TestMobileEndpoints:
    """Test mobile API endpoints"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
    
    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("🔍 Testing health endpoints...")
        
        endpoints = [
            "/health",
            "/health/chat"
        ]
        
        results = []
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=5)
                
                if response.status_code == 200:
                    results.append(True)
                    print(f"✅ {endpoint} - OK")
                else:
                    results.append(False)
                    print(f"❌ {endpoint} - Failed: {response.status_code}")
                    
            except Exception as e:
                results.append(False)
                print(f"❌ {endpoint} - Error: {e}")
        
        return all(results)
    
    def test_astrologers_endpoint(self):
        """Test astrologers endpoint"""
        print("🔍 Testing astrologers endpoint...")
        
        try:
            response = requests.get(f"{self.base_url}/api/astrologers", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                
                # Check response structure
                if 'astrologers' in result and isinstance(result['astrologers'], list):
                    astrologers = result['astrologers']
                    
                    if len(astrologers) > 0:
                        # Check first astrologer structure
                        first_astro = astrologers[0]
                        required_fields = ['astrologer_id', 'name', 'display_name', 'specialization']
                        
                        for field in required_fields:
                            if field not in first_astro:
                                print(f"❌ Missing field in astrologer: {field}")
                                return False
                        
                        print(f"✅ Astrologers endpoint - {len(astrologers)} astrologers found")
                        return True
                    else:
                        print("❌ No astrologers found")
                        return False
                else:
                    print("❌ Invalid response structure")
                    return False
            else:
                print(f"❌ Astrologers endpoint failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Astrologers endpoint error: {e}")
            return False
    
    def test_user_registration_endpoint(self):
        """Test user registration endpoint"""
        print("🔍 Testing user registration endpoint...")
        
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
                
                # Check response structure
                required_fields = ['success', 'user_id', 'message', 'wallet']
                for field in required_fields:
                    if field not in result:
                        print(f"❌ Missing field in response: {field}")
                        return False
                
                # Check user ID format
                user_id = result['user_id']
                if not user_id.startswith('user_'):
                    print(f"❌ Invalid user ID format: {user_id}")
                    return False
                
                # Check wallet structure
                wallet = result['wallet']
                if wallet['balance'] != 500.0 or wallet['currency'] != 'INR':
                    print(f"❌ Invalid wallet: {wallet}")
                    return False
                
                print("✅ User registration endpoint - Success")
                return True
                
            else:
                print(f"❌ User registration failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ User registration error: {e}")
            return False
    
    def test_wallet_endpoint(self):
        """Test wallet endpoint"""
        print("🔍 Testing wallet endpoint...")
        
        # First register a user
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
            # Register user
            reg_response = requests.post(
                f"{self.base_url}/api/users/register",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=10
            )
            
            if reg_response.status_code != 200:
                print("❌ User registration failed for wallet test")
                return False
            
            user_id = reg_response.json()['user_id']
            
            # Test wallet endpoint
            wallet_response = requests.get(
                f"{self.base_url}/api/wallet/{user_id}",
                timeout=10
            )
            
            if wallet_response.status_code == 200:
                wallet_data = wallet_response.json()
                
                # Check wallet structure
                if ('balance' in wallet_data and 
                    'currency' in wallet_data and 
                    wallet_data['balance'] == 500.0):
                    print("✅ Wallet endpoint - Success")
                    return True
                else:
                    print(f"❌ Invalid wallet data: {wallet_data}")
                    return False
            else:
                print(f"❌ Wallet endpoint failed: {wallet_response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Wallet endpoint error: {e}")
            return False
    
    def test_error_handling(self):
        """Test error handling"""
        print("🔍 Testing error handling...")
        
        # Test invalid endpoint
        try:
            response = requests.get(f"{self.base_url}/api/invalid", timeout=5)
            
            if response.status_code == 404:
                print("✅ Invalid endpoint - 404 returned")
                return True
            else:
                print(f"❌ Invalid endpoint should return 404: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error handling test failed: {e}")
            return False
    
    def test_cors_headers(self):
        """Test CORS headers"""
        print("🔍 Testing CORS headers...")
        
        try:
            response = requests.options(
                f"{self.base_url}/api/users/register",
                headers={"Origin": "http://localhost:3000"},
                timeout=5
            )
            
            # Check for CORS headers
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            for header in cors_headers:
                if header not in response.headers:
                    print(f"❌ Missing CORS header: {header}")
                    return False
            
            print("✅ CORS headers present")
            return True
            
        except Exception as e:
            print(f"❌ CORS test error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Running Mobile API Tests")
        print("=" * 50)
        
        tests = [
            ("Health Endpoints", self.test_health_endpoints),
            ("Astrologers Endpoint", self.test_astrologers_endpoint),
            ("User Registration Endpoint", self.test_user_registration_endpoint),
            ("Wallet Endpoint", self.test_wallet_endpoint),
            ("Error Handling", self.test_error_handling),
            ("CORS Headers", self.test_cors_headers)
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
        
        print(f"\n📊 API Test Summary:")
        print(f"Passed: {passed}/{total}")
        
        return passed == total

def main():
    """Main function"""
    tester = TestMobileEndpoints()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
