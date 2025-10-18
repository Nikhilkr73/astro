#!/usr/bin/env python3
"""
Debug Test Script - Test imports and basic functionality
"""

import sys
import os

print("🔍 Debug Test Script")
print("=" * 40)
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")
print(f"Python path: {sys.path[:3]}...")

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)
print(f"Added to path: {project_root}")

print("\n🔍 Testing imports...")

try:
    print("Testing backend.database.manager import...")
    from backend.database.manager import db
    print("✅ backend.database.manager imported successfully")
except ImportError as e:
    print(f"❌ backend.database.manager import failed: {e}")
    
    try:
        print("Testing root database_manager import...")
        from database_manager import DatabaseManager
        db = DatabaseManager()
        print("✅ root database_manager imported successfully")
    except ImportError as e2:
        print(f"❌ root database_manager import failed: {e2}")

print("\n🔍 Testing database connection...")
try:
    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✅ Database connection successful: {result[0]}")
except Exception as e:
    print(f"❌ Database connection failed: {e}")

print("\n🔍 Testing UUID generation...")
try:
    user_id = db.generate_user_id()
    print(f"✅ UUID generation successful: {user_id}")
except Exception as e:
    print(f"❌ UUID generation failed: {e}")

print("\n✅ Debug test completed")
