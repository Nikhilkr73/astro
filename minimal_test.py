#!/usr/bin/env python3
"""
Minimal Test - Check what's actually working
"""

import sys
import os

print("🔍 Minimal Test")
print("=" * 40)

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)
print(f"Added to path: {project_root}")

print("\n🔍 Testing imports...")

# Test 1: Backend import
try:
    print("Testing backend.database.manager import...")
    from backend.database.manager import db
    print(f"✅ backend.database.manager imported successfully: {type(db)}")
    print(f"   Has generate_user_id: {hasattr(db, 'generate_user_id')}")
    print(f"   Has get_user: {hasattr(db, 'get_user')}")
    print(f"   Has create_user: {hasattr(db, 'create_user')}")
except ImportError as e:
    print(f"❌ backend.database.manager import failed: {e}")

# Test 2: Root import
try:
    print("\nTesting root database_manager import...")
    from database_manager import DatabaseManager
    db_root = DatabaseManager()
    print(f"✅ root database_manager imported successfully: {type(db_root)}")
    print(f"   Has generate_user_id: {hasattr(db_root, 'generate_user_id')}")
    print(f"   Has get_user: {hasattr(db_root, 'get_user')}")
    print(f"   Has create_user: {hasattr(db_root, 'create_user')}")
except ImportError as e:
    print(f"❌ root database_manager import failed: {e}")

print("\n✅ Minimal test completed")
