#!/usr/bin/env python3
"""
Test Import Fix
"""

import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

print(f"Project root: {project_root}")
print(f"Python path: {sys.path[:3]}")

print("\n🔍 Testing imports...")

# Test 1: Backend import
try:
    print("Testing backend.database.manager import...")
    from backend.database.manager import db
    print(f"✅ backend.database.manager imported successfully: {type(db)}")
    print(f"   Has generate_user_id: {hasattr(db, 'generate_user_id')}")
    print(f"   Has get_user: {hasattr(db, 'get_user')}")
    print(f"   Has create_user: {hasattr(db, 'create_user')}")
    
    # Test a simple method
    user_id = db.generate_user_id()
    print(f"Generated user ID: {user_id}")
    
except ImportError as e:
    print(f"❌ backend.database.manager import failed: {e}")
except Exception as e:
    print(f"❌ backend.database.manager error: {e}")

# Test 2: Root import
try:
    print("\nTesting root database_manager import...")
    from database_manager import DatabaseManager
    db_root = DatabaseManager()
    print(f"✅ root database_manager imported successfully: {type(db_root)}")
    print(f"   Has generate_user_id: {hasattr(db_root, 'generate_user_id')}")
    print(f"   Has get_user: {hasattr(db_root, 'get_user')}")
    print(f"   Has create_user: {hasattr(db_root, 'create_user')}")
    
    # Test a simple method
    user_id = db_root.generate_user_id()
    print(f"Generated user ID: {user_id}")
    
except ImportError as e:
    print(f"❌ root database_manager import failed: {e}")
except Exception as e:
    print(f"❌ root database_manager error: {e}")

print("\n✅ Import test completed")
