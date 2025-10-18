#!/usr/bin/env python3
"""
Unit Tests - Database Operations (No Database Required)
Tests UUID generation and basic functionality without database connection
"""

import sys
import os
import unittest
from datetime import datetime

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Also add current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

print(f"Project root: {project_root}")
print(f"Current dir: {current_dir}")
print(f"Python path: {sys.path[:3]}")

# Import database manager with fallback
try:
    from backend.database.manager import db
    print("✅ Database manager imported successfully from backend.database.manager")
except ImportError as e:
    print(f"❌ Could not import from backend.database.manager: {e}")
    try:
        # Fallback to root database_manager
        from database_manager import DatabaseManager
        db = DatabaseManager()
        print("✅ Database manager imported successfully from root database_manager")
    except ImportError as e2:
        print(f"❌ Could not import database manager: {e2}")
        sys.exit(1)

class TestDatabaseOperations(unittest.TestCase):
    """Test database operations"""
    
    def test_uuid_generation(self):
        """Test UUID generation methods (no database required)"""
        print("🔍 Testing UUID generation...")
        
        # Test user ID generation
        user_id = db.generate_user_id()
        self.assertTrue(user_id.startswith('user_'))
        self.assertEqual(len(user_id), 17)  # 'user_' + 12 hex chars
        
        # Test conversation ID generation
        conv_id = db.generate_conversation_id(user_id, 'astrologer_001')
        self.assertTrue(conv_id.startswith('conv_'))
        
        # Test message ID generation
        msg_id = db.generate_message_id(conv_id)
        self.assertTrue(msg_id.startswith('msg_'))
        
        # Test wallet ID generation
        wallet_id = db.generate_wallet_id(user_id)
        self.assertTrue(wallet_id.startswith('wallet_'))
        
        print("✅ UUID generation successful")
    
    def test_uuid_uniqueness(self):
        """Test that UUIDs are unique"""
        print("🔍 Testing UUID uniqueness...")
        
        ids = set()
        for _ in range(100):
            user_id = db.generate_user_id()
            self.assertNotIn(user_id, ids)
            ids.add(user_id)
        
        print(f"✅ Generated 100 unique user IDs")
    
    def test_uuid_performance(self):
        """Test UUID generation performance"""
        print("🔍 Testing UUID generation performance...")
        
        start_time = datetime.now()
        
        # Generate 1000 IDs
        for _ in range(1000):
            db.generate_user_id()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        self.assertLess(duration, 1.0)  # Should be less than 1 second
        
        print(f"✅ Generated 1000 unique IDs in {duration:.3f} seconds")
    
    def test_database_manager_methods(self):
        """Test that database manager has required methods"""
        print("🔍 Testing database manager methods...")
        
        # Check required methods exist
        required_methods = ['generate_user_id', 'generate_conversation_id', 'generate_message_id', 'generate_wallet_id']
        
        for method in required_methods:
            self.assertTrue(hasattr(db, method), f"Missing method: {method}")
        
        print("✅ All required methods exist")
    
    def test_database_manager_type(self):
        """Test database manager type"""
        print("🔍 Testing database manager type...")
        
        self.assertIsNotNone(db)
        self.assertTrue(hasattr(db, '__class__'))
        
        print(f"✅ Database manager type: {type(db)}")

def run_tests():
    """Run all tests"""
    print("🧪 Running Database Unit Tests (No Database Required)")
    print("=" * 60)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestDatabaseOperations)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print(f"\n📊 Test Summary:")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\n❌ Failures:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback}")
    
    if result.errors:
        print("\n💥 Errors:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback}")
    
    return len(result.failures) == 0 and len(result.errors) == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
