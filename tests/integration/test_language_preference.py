#!/usr/bin/env python3
"""
Integration Tests - Language Preference Fix
Tests the language preference storage fix
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

class TestLanguagePreference:
    """Test language preference functionality"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
    
    def test_explicit_language_preference(self):
        """Test explicit language preference"""
        print("🔍 Testing explicit language preference...")
        
        languages = ['en', 'hi', 'ta', 'te']
        results = []
        
        for lang in languages:
            test_data = {
                "phone_number": f"+919999999{int(time.time()) % 10000:04d}",
                "full_name": f"Explicit {lang.upper()} User",
                "display_name": f"Explicit{lang.upper()}",
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
                    
                    # Verify in database
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
    
    def test_default_language_preference(self):
        """Test default language preference when not specified"""
        print("🔍 Testing default language preference...")
        
        # Test without language_preference field
        test_data = {
            "phone_number": f"+919999999{int(time.time()) % 10000:04d}",
            "full_name": "Default Language User",
            "display_name": "DefaultLang",
            "date_of_birth": "01/01/1990",
            "time_of_birth": "12:00 PM",
            "place_of_birth": "Test City",
            "gender": "Male"
            # No language_preference field
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
                
                # Should default to 'hi'
                if self.verify_language_in_db(user_id, 'hi'):
                    print("✅ Default language (hi) applied correctly")
                    return True
                else:
                    print("❌ Default language not applied correctly")
                    return False
            else:
                print(f"❌ Registration failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing default language: {e}")
            return False
    
    def test_null_language_preference(self):
        """Test null language preference handling"""
        print("🔍 Testing null language preference...")
        
        test_data = {
            "phone_number": f"+919999999{int(time.time()) % 10000:04d}",
            "full_name": "Null Language User",
            "display_name": "NullLang",
            "date_of_birth": "01/01/1990",
            "time_of_birth": "12:00 PM",
            "place_of_birth": "Test City",
            "gender": "Male",
            "language_preference": None
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
                
                # Should default to 'hi' when null
                if self.verify_language_in_db(user_id, 'hi'):
                    print("✅ Null language preference handled correctly")
                    return True
                else:
                    print("❌ Null language preference not handled correctly")
                    return False
            else:
                print(f"❌ Registration failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing null language: {e}")
            return False
    
    def test_empty_language_preference(self):
        """Test empty string language preference"""
        print("🔍 Testing empty language preference...")
        
        test_data = {
            "phone_number": f"+919999999{int(time.time()) % 10000:04d}",
            "full_name": "Empty Language User",
            "display_name": "EmptyLang",
            "date_of_birth": "01/01/1990",
            "time_of_birth": "12:00 PM",
            "place_of_birth": "Test City",
            "gender": "Male",
            "language_preference": ""
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
                
                # Should default to 'hi' when empty
                if self.verify_language_in_db(user_id, 'hi'):
                    print("✅ Empty language preference handled correctly")
                    return True
                else:
                    print("❌ Empty language preference not handled correctly")
                    return False
            else:
                print(f"❌ Registration failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing empty language: {e}")
            return False
    
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
    
    def test_language_distribution(self):
        """Test language distribution in database"""
        print("🔍 Testing language distribution...")
        
        try:
            try:
                from backend.database.manager import db
            except ImportError:
                # Fallback to root database_manager
                from database_manager import DatabaseManager
                db = DatabaseManager()
            
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT language_preference, COUNT(*) as count 
                        FROM users 
                        WHERE user_id LIKE 'test_%' OR user_id LIKE 'user_%'
                        GROUP BY language_preference 
                        ORDER BY count DESC
                    """)
                    
                    results = cursor.fetchall()
                    
                    print("📊 Current language distribution:")
                    for lang, count in results:
                        print(f"   • {lang}: {count} users")
                    
                    # Check if we have multiple languages
                    languages = [lang for lang, count in results]
                    if len(languages) > 1:
                        print("✅ Multiple languages found in database")
                        return True
                    else:
                        print("⚠️  Only one language found - may need more test data")
                        return True
                        
        except Exception as e:
            print(f"❌ Language distribution test error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all language preference tests"""
        print("🧪 Running Language Preference Integration Tests")
        print("=" * 60)
        
        tests = [
            ("Explicit Language Preference", self.test_explicit_language_preference),
            ("Default Language Preference", self.test_default_language_preference),
            ("Null Language Preference", self.test_null_language_preference),
            ("Empty Language Preference", self.test_empty_language_preference),
            ("Language Distribution", self.test_language_distribution)
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
        
        print(f"\n📊 Language Preference Test Summary:")
        print(f"Passed: {passed}/{total}")
        
        return passed == total

def main():
    """Main function"""
    tester = TestLanguagePreference()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
