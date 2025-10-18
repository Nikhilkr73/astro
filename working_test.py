#!/usr/bin/env python3
"""
Working Test - Adapted to actual codebase
"""

import sys
import os
import unittest
from datetime import datetime

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

# Import database manager
try:
    from backend.database.manager import db
    print("✅ Using backend.database.manager")
except ImportError:
    from database_manager import DatabaseManager
    db = DatabaseManager()
    print("✅ Using root database_manager")

class TestDatabaseOperations(unittest.TestCase):
    """Test database operations"""
    
    def test_database_connection(self):
        """Test database connection"""
        print("🔍 Testing database connection...")
        
        try:
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    result = cursor.fetchone()
                    self.assertEqual(result[0], 1)
            print("✅ Database connection successful")
        except Exception as e:
            self.fail(f"Database connection failed: {e}")
    
    def test_uuid_generation(self):
        """Test UUID generation methods"""
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
    
    def test_user_creation(self):
        """Test user creation"""
        print("🔍 Testing user creation...")
        
        test_user_id = f"test_user_{int(datetime.now().timestamp())}"
        test_data = {
            'user_id': test_user_id,
            'phone_number': '+919999999999',
            'full_name': 'Test User',
            'display_name': 'TestUser',
            'email': 'test@example.com',
            'gender': 'Male',
            'language_preference': 'en',
            'subscription_type': 'free',
            'metadata': {'test': True}
        }
        
        try:
            # Create user
            user_id = db.create_user(test_data)
            self.assertIsNotNone(user_id)
            self.assertEqual(user_id, test_user_id)
            
            # Verify user exists
            user = db.get_user(test_user_id)
            self.assertIsNotNone(user)
            self.assertEqual(user['full_name'], 'Test User')
            self.assertEqual(user['language_preference'], 'en')
            
            print("✅ User creation successful")
        except Exception as e:
            self.fail(f"User creation failed: {e}")
    
    def test_wallet_creation(self):
        """Test wallet creation"""
        print("🔍 Testing wallet creation...")
        
        test_user_id = f"test_wallet_{int(datetime.now().timestamp())}"
        
        try:
            # Create wallet
            wallet_id = db.create_wallet(test_user_id, 500.0)
            self.assertIsNotNone(wallet_id)
            
            # Verify wallet exists
            wallet = db.get_wallet(test_user_id)
            self.assertIsNotNone(wallet)
            self.assertEqual(wallet['balance'], 500.0)
            
            print("✅ Wallet creation successful")
        except Exception as e:
            self.fail(f"Wallet creation failed: {e}")

def run_tests():
    """Run all tests"""
    print("🧪 Running Working Database Tests")
    print("=" * 50)
    
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
