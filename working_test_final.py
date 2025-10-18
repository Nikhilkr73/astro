#!/usr/bin/env python3
"""
Working Test - Based on actual error analysis
"""

import sys
import os
import unittest

# Fix the path issue properly
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)  # Go up one level from script location

# Add both project root and script dir to path
sys.path.insert(0, project_root)
sys.path.insert(0, script_dir)

print(f"Script dir: {script_dir}")
print(f"Project root: {project_root}")
print(f"Python path: {sys.path[:3]}")

# Test imports
print("\n🔍 Testing imports...")

db = None
try:
    from backend.database.manager import db
    print("✅ Using backend.database.manager")
except ImportError as e:
    print(f"❌ Backend import failed: {e}")
    try:
        from database_manager import DatabaseManager
        db = DatabaseManager()
        print("✅ Using root database_manager")
    except ImportError as e2:
        print(f"❌ Root import failed: {e2}")
        print("❌ No database manager available")
        sys.exit(1)

class TestBasicFunctionality(unittest.TestCase):
    """Test basic functionality"""
    
    def test_uuid_generation(self):
        """Test UUID generation"""
        print("🔍 Testing UUID generation...")
        
        if db is None:
            self.fail("No database manager available")
        
        # Test user ID generation
        user_id = db.generate_user_id()
        self.assertTrue(user_id.startswith('user_'))
        self.assertEqual(len(user_id), 17)
        
        print(f"✅ Generated user ID: {user_id}")
    
    def test_database_manager_methods(self):
        """Test that database manager has required methods"""
        print("🔍 Testing database manager methods...")
        
        if db is None:
            self.fail("No database manager available")
        
        # Check required methods exist
        required_methods = ['generate_user_id', 'generate_conversation_id', 'generate_message_id', 'generate_wallet_id']
        
        for method in required_methods:
            self.assertTrue(hasattr(db, method), f"Missing method: {method}")
        
        print("✅ All required methods exist")

def run_tests():
    """Run tests"""
    print("🧪 Running Working Tests")
    print("=" * 50)
    
    suite = unittest.TestLoader().loadTestsFromTestCase(TestBasicFunctionality)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
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
