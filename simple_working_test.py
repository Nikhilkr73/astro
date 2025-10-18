#!/usr/bin/env python3
"""
Simple Working Test - No Database Required
"""

import sys
import os
import unittest

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

class TestBasicFunctionality(unittest.TestCase):
    """Test basic functionality without database"""
    
    def test_imports(self):
        """Test that we can import the database manager"""
        print("🔍 Testing imports...")
        
        try:
            from backend.database.manager import db
            print("✅ backend.database.manager imported successfully")
            self.assertTrue(hasattr(db, 'generate_user_id'))
            return True
        except ImportError as e:
            print(f"❌ backend.database.manager import failed: {e}")
            try:
                from database_manager import DatabaseManager
                db = DatabaseManager()
                print("✅ root database_manager imported successfully")
                self.assertTrue(hasattr(db, 'generate_user_id'))
                return True
            except ImportError as e2:
                print(f"❌ root database_manager import failed: {e2}")
                self.fail(f"Could not import database manager: {e2}")
    
    def test_uuid_generation(self):
        """Test UUID generation without database connection"""
        print("🔍 Testing UUID generation...")
        
        try:
            from backend.database.manager import db
        except ImportError:
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
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
    
    def test_path_setup(self):
        """Test that path setup is working"""
        print("🔍 Testing path setup...")
        
        # Check if we can find the backend module
        backend_path = os.path.join(project_root, 'backend')
        self.assertTrue(os.path.exists(backend_path), f"Backend path not found: {backend_path}")
        
        # Check if we can find the database manager
        db_manager_path = os.path.join(backend_path, 'database', 'manager.py')
        self.assertTrue(os.path.exists(db_manager_path), f"Database manager not found: {db_manager_path}")
        
        print("✅ Path setup correct")

def run_tests():
    """Run all tests"""
    print("🧪 Running Simple Working Tests")
    print("=" * 50)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestBasicFunctionality)
    
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
