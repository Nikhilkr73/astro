#!/usr/bin/env python3
"""
Quick Test Runner - Simple testing commands
Usage: python3 quick_test.py [command]
"""

import sys
import os
import subprocess
import time

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"🔍 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"✅ {description} - SUCCESS")
            return True
        else:
            print(f"❌ {description} - FAILED")
            print(f"Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} - TIMEOUT")
        return False
    except Exception as e:
        print(f"💥 {description} - ERROR: {e}")
        return False

def test_server_health():
    """Test if server is running"""
    return run_command("curl -s http://localhost:8000/health", "Server Health Check")

def test_database_connection():
    """Test database connection"""
    return run_command("python3 -c \"from backend.database.manager import db; print('Database OK')\"", "Database Connection")

def test_user_registration():
    """Test user registration"""
    test_data = '''{
        "phone_number": "+919999999999",
        "full_name": "Quick Test User",
        "display_name": "QuickTest",
        "date_of_birth": "01/01/1990",
        "time_of_birth": "12:00 PM",
        "place_of_birth": "Test City",
        "gender": "Male",
        "language_preference": "en"
    }'''
    
    cmd = f'curl -s -X POST "http://localhost:8000/api/users/register" -H "Content-Type: application/json" -d \'{test_data}\''
    return run_command(cmd, "User Registration")

def test_language_preference():
    """Test language preference storage"""
    return run_command("python3 tests/integration/test_language_preference.py", "Language Preference Test")

def test_uuid_generation():
    """Test UUID generation"""
    return run_command("python3 tests/unit/test_uuid_generation.py", "UUID Generation Test")

def test_data_export():
    """Test data export functionality"""
    return run_command("python3 tests/database/test_data_export.py", "Data Export Test")

def run_all_quick_tests():
    """Run all quick tests"""
    print("🚀 Quick Test Suite")
    print("=" * 40)
    
    tests = [
        ("Server Health", test_server_health),
        ("Database Connection", test_database_connection),
        ("User Registration", test_user_registration),
        ("Language Preference", test_language_preference),
        ("UUID Generation", test_uuid_generation),
        ("Data Export", test_data_export)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running: {test_name}")
        if test_func():
            passed += 1
    
    print(f"\n📊 Quick Test Summary:")
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 ALL QUICK TESTS PASSED!")
        return True
    else:
        print("❌ SOME QUICK TESTS FAILED")
        return False

def main():
    """Main function"""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "health":
            test_server_health()
        elif command == "db":
            test_database_connection()
        elif command == "register":
            test_user_registration()
        elif command == "language":
            test_language_preference()
        elif command == "uuid":
            test_uuid_generation()
        elif command == "export":
            test_data_export()
        else:
            print(f"❌ Unknown command: {command}")
            print("Available commands: health, db, register, language, uuid, export")
    else:
        run_all_quick_tests()

if __name__ == "__main__":
    main()
