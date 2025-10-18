#!/usr/bin/env python3
"""
Simple Import Test
"""

import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

print("🔍 Testing imports...")

try:
    from backend.database.manager import db
    print("✅ Import successful")
    print(f"Type: {type(db)}")
    print(f"Has generate_user_id: {hasattr(db, 'generate_user_id')}")
    
    # Test a simple method
    user_id = db.generate_user_id()
    print(f"Generated user ID: {user_id}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
