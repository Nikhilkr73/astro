#!/usr/bin/env python3
"""
Simple Test - Basic functionality check
"""

import sys
import os

def test_imports():
    """Test basic imports"""
    print("🔍 Testing imports...")
    
    # Add project root to path
    project_root = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(project_root)
    
    try:
        from backend.database.manager import db
        print("✅ backend.database.manager imported successfully")
        return True
    except ImportError as e:
        print(f"❌ backend.database.manager import failed: {e}")
        
        try:
            from database_manager import DatabaseManager
            db = DatabaseManager()
            print("✅ root database_manager imported successfully")
            return True
        except ImportError as e2:
            print(f"❌ root database_manager import failed: {e2}")
            return False

def test_database_connection():
    """Test database connection"""
    print("🔍 Testing database connection...")
    
    try:
        from backend.database.manager import db
    except ImportError:
        from database_manager import DatabaseManager
        db = DatabaseManager()
    
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                print(f"✅ Database connection successful: {result[0]}")
                return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_uuid_generation():
    """Test UUID generation"""
    print("🔍 Testing UUID generation...")
    
    try:
        from backend.database.manager import db
    except ImportError:
        from database_manager import DatabaseManager
        db = DatabaseManager()
    
    try:
        user_id = db.generate_user_id()
        print(f"✅ UUID generation successful: {user_id}")
        return True
    except Exception as e:
        print(f"❌ UUID generation failed: {e}")
        return False

def main():
    """Main function"""
    print("🧪 Simple Test Suite")
    print("=" * 40)
    
    tests = [
        ("Import Test", test_imports),
        ("Database Connection", test_database_connection),
        ("UUID Generation", test_uuid_generation)
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
    
    print(f"\n📊 Simple Test Summary:")
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 ALL SIMPLE TESTS PASSED!")
        return True
    else:
        print("❌ SOME SIMPLE TESTS FAILED")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
