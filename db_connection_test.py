#!/usr/bin/env python3
"""
Database Connection Test
"""

import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

print("🔍 Testing database connection...")

try:
    from backend.database.manager import db
    print("✅ Database manager imported")
    
    # Test database connection
    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"✅ Database connection successful: {result[0]}")
    
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    import traceback
    traceback.print_exc()
