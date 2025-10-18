#!/usr/bin/env python3
"""
Test script to verify language preference fix
"""

import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from backend.database.manager import db
    print("✅ Database manager imported successfully")
    
    # Test database connection
    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            # Check current language preferences
            cursor.execute("SELECT DISTINCT language_preference, COUNT(*) as count FROM users GROUP BY language_preference")
            results = cursor.fetchall()
            
            print("\n📊 Current Language Preferences:")
            for lang, count in results:
                print(f"   • {lang}: {count} users")
            
            # Update a test user to English
            cursor.execute("UPDATE users SET language_preference = 'en' WHERE user_id = 'user_2fbeb926d9bb'")
            print(f"\n✅ Updated user_2fbeb926d9bb to English")
            
            # Verify the update
            cursor.execute("SELECT user_id, full_name, language_preference FROM users WHERE user_id = 'user_2fbeb926d9bb'")
            user = cursor.fetchone()
            if user:
                print(f"✅ Verification: {user[0]} - {user[1]} - Language: {user[2]}")
            
            # Check updated language distribution
            cursor.execute("SELECT DISTINCT language_preference, COUNT(*) as count FROM users GROUP BY language_preference")
            results = cursor.fetchall()
            
            print("\n📊 Updated Language Preferences:")
            for lang, count in results:
                print(f"   • {lang}: {count} users")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
