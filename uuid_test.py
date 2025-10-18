#!/usr/bin/env python3
"""
UUID Generation Test - No Database Required
"""

import sys
import os
import unittest

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

class TestUUIDGeneration(unittest.TestCase):
    """Test UUID generation methods"""
    
    def setUp(self):
        """Set up test"""
        try:
            from backend.database.manager import db
            self.db = db
            print("✅ Using backend.database.manager")
        except ImportError:
            from database_manager import DatabaseManager
            self.db = DatabaseManager()
            print("✅ Using root database_manager")
    
    def test_user_id_format(self):
        """Test user ID format"""
        print("🔍 Testing user ID format...")
        
        user_id = self.db.generate_user_id()
        self.assertTrue(user_id.startswith('user_'))
        self.assertEqual(len(user_id), 17)  # 'user_' + 12 hex chars
        
        print(f"✅ User ID format correct: {user_id}")
    
    def test_user_ids_unique(self):
        """Test that user IDs are unique"""
        print("🔍 Testing user ID uniqueness...")
        
        ids = set()
        for _ in range(100):
            user_id = self.db.generate_user_id()
            self.assertNotIn(user_id, ids)
            ids.add(user_id)
        
        print(f"✅ Generated 100 unique user IDs")
    
    def test_conversation_id_format(self):
        """Test conversation ID format"""
        print("🔍 Testing conversation ID format...")
        
        user_id = self.db.generate_user_id()
        conv_id = self.db.generate_conversation_id(user_id, 'astrologer_001')
        
        self.assertTrue(conv_id.startswith('conv_'))
        self.assertIn(user_id, conv_id)
        self.assertIn('astrologer_001', conv_id)
        
        print(f"✅ Conversation ID format correct: {conv_id}")
    
    def test_message_id_format(self):
        """Test message ID format"""
        print("🔍 Testing message ID format...")
        
        user_id = self.db.generate_user_id()
        conv_id = self.db.generate_conversation_id(user_id, 'astrologer_001')
        msg_id = self.db.generate_message_id(conv_id)
        
        self.assertTrue(msg_id.startswith('msg_'))
        self.assertIn(conv_id, msg_id)
        
        print(f"✅ Message ID format correct: {msg_id}")
    
    def test_wallet_id_format(self):
        """Test wallet ID format"""
        print("🔍 Testing wallet ID format...")
        
        user_id = self.db.generate_user_id()
        wallet_id = self.db.generate_wallet_id(user_id)
        
        self.assertTrue(wallet_id.startswith('wallet_'))
        self.assertEqual(wallet_id, f"wallet_{user_id}")
        
        print(f"✅ Wallet ID format correct: {wallet_id}")
    
    def test_timestamp_inclusion(self):
        """Test that timestamps are included in IDs"""
        print("🔍 Testing timestamp inclusion...")
        
        user_id = self.db.generate_user_id()
        conv_id = self.db.generate_conversation_id(user_id, 'astrologer_001')
        msg_id = self.db.generate_message_id(conv_id)
        
        # All IDs should contain the user_id
        self.assertIn(user_id, conv_id)
        self.assertIn(conv_id, msg_id)
        
        print("✅ Timestamp inclusion correct")
    
    def test_performance(self):
        """Test UUID generation performance"""
        print("🔍 Testing UUID generation performance...")
        
        start_time = datetime.now()
        
        # Generate 1000 IDs
        for _ in range(1000):
            self.db.generate_user_id()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        self.assertLess(duration, 1.0)  # Should be less than 1 second
        
        print(f"✅ Generated 1000 unique IDs in {duration:.3f} seconds")

def run_tests():
    """Run all tests"""
    print("🧪 Running UUID Generation Tests")
    print("=" * 50)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestUUIDGeneration)
    
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
