#!/usr/bin/env python3
"""
Unit Tests - UUID Generation
Tests UUID-based ID generation for scalability
"""

import sys
import os
import unittest
import re
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

class TestUUIDGeneration(unittest.TestCase):
    """Test UUID generation methods"""
    
    def test_user_id_format(self):
        """Test user ID format"""
        print("🔍 Testing user ID format...")
        
        user_id = db.generate_user_id()
        
        # Check format: user_ + 12 hex characters
        pattern = r'^user_[a-f0-9]{12}$'
        self.assertRegex(user_id, pattern)
        self.assertEqual(len(user_id), 17)  # 'user_' + 12 chars
        
        print("✅ User ID format correct")
    
    def test_user_id_uniqueness(self):
        """Test user ID uniqueness"""
        print("🔍 Testing user ID uniqueness...")
        
        # Generate multiple user IDs
        user_ids = set()
        for _ in range(100):
            user_id = db.generate_user_id()
            user_ids.add(user_id)
        
        # All should be unique
        self.assertEqual(len(user_ids), 100)
        
        print("✅ User IDs are unique")
    
    def test_conversation_id_format(self):
        """Test conversation ID format"""
        print("🔍 Testing conversation ID format...")
        
        user_id = "user_123456789abc"
        astrologer_id = "astrologer_001"
        
        conv_id = db.generate_conversation_id(user_id, astrologer_id)
        
        # Check format: conv_ + user_id + _ + astrologer_id + _ + timestamp
        pattern = r'^conv_user_[a-f0-9]{12}_astrologer_001_\d+$'
        self.assertRegex(conv_id, pattern)
        
        print("✅ Conversation ID format correct")
    
    def test_message_id_format(self):
        """Test message ID format"""
        print("🔍 Testing message ID format...")
        
        conversation_id = "conv_user_123456789abc_astrologer_001_1234567890"
        
        msg_id = db.generate_message_id(conversation_id)
        
        # Check format: msg_ + conversation_id + _ + timestamp
        pattern = r'^msg_conv_user_[a-f0-9]{12}_astrologer_001_\d+_\d+$'
        self.assertRegex(msg_id, pattern)
        
        print("✅ Message ID format correct")
    
    def test_wallet_id_format(self):
        """Test wallet ID format"""
        print("🔍 Testing wallet ID format...")
        
        user_id = "user_123456789abc"
        
        wallet_id = db.generate_wallet_id(user_id)
        
        # Check format: wallet_ + user_id
        expected = f"wallet_{user_id}"
        self.assertEqual(wallet_id, expected)
        
        print("✅ Wallet ID format correct")
    
    def test_timestamp_inclusion(self):
        """Test that timestamps are included in IDs"""
        print("🔍 Testing timestamp inclusion...")
        
        user_id = "user_123456789abc"
        astrologer_id = "astrologer_001"
        
        # Generate conversation ID
        conv_id = db.generate_conversation_id(user_id, astrologer_id)
        
        # Extract timestamp
        timestamp_match = re.search(r'_(\d+)$', conv_id)
        self.assertIsNotNone(timestamp_match)
        
        timestamp = int(timestamp_match.group(1))
        current_time = int(datetime.now().timestamp())
        
        # Timestamp should be recent (within last minute)
        self.assertLessEqual(abs(current_time - timestamp), 60)
        
        print("✅ Timestamp inclusion correct")
    
    def test_scalability_properties(self):
        """Test scalability properties of UUID generation"""
        print("🔍 Testing scalability properties...")
        
        # Test large number of ID generations
        start_time = datetime.now()
        
        ids = []
        for _ in range(1000):
            user_id = db.generate_user_id()
            ids.append(user_id)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Should generate 1000 IDs quickly (< 1 second)
        self.assertLess(duration, 1.0)
        
        # All IDs should be unique
        unique_ids = set(ids)
        self.assertEqual(len(unique_ids), 1000)
        
        print(f"✅ Generated 1000 unique IDs in {duration:.3f} seconds")

def run_tests():
    """Run all tests"""
    print("🧪 Running UUID Generation Unit Tests")
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
