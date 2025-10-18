#!/usr/bin/env python3
"""
Unit Tests - Database Operations
Tests database connection, user creation, and basic operations
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

# Check if psycopg2 is available
try:
    import psycopg2
    PSYCOPG2_AVAILABLE = True
    print("✅ psycopg2 is available - database tests enabled")
except ImportError:
    PSYCOPG2_AVAILABLE = False
    print("⚠️  psycopg2 not available - skipping database connection tests")

class TestDatabaseOperations(unittest.TestCase):
    """Test database operations"""
    
    def setUp(self):
        """Set up test data"""
        self.test_user_id = f"test_user_{int(datetime.now().timestamp())}"
        self.test_data = {
            'user_id': self.test_user_id,
            'phone_number': '+919999999999',
            'full_name': 'Test User',
            'display_name': 'TestUser',
            'email': 'test@example.com',
            'gender': 'Male',
            'language_preference': 'en',
            'subscription_type': 'free',
            'metadata': {'test': True}
        }
    
    def test_uuid_generation(self):
        """Test UUID generation methods (always works)"""
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
    
    def test_database_connection(self):
        """Test database connection (only if psycopg2 available)"""
        if not PSYCOPG2_AVAILABLE:
            self.skipTest("psycopg2 not available - skipping database connection test")
        
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
    
    def test_user_creation(self):
        """Test user creation (only if psycopg2 available)"""
        if not PSYCOPG2_AVAILABLE:
            self.skipTest("psycopg2 not available - skipping user creation test")
        
        print("🔍 Testing user creation...")
        
        try:
            # Create user
            user_id = db.create_user(self.test_data)
            self.assertIsNotNone(user_id)
            self.assertEqual(user_id, self.test_user_id)
            
            # Verify user exists
            user = db.get_user(self.test_user_id)
            self.assertIsNotNone(user)
            self.assertEqual(user['full_name'], 'Test User')
            self.assertEqual(user['language_preference'], 'en')
            
            print("✅ User creation successful")
        except Exception as e:
            self.fail(f"User creation failed: {e}")
    
    def test_wallet_creation(self):
        """Test wallet creation (only if psycopg2 available)"""
        if not PSYCOPG2_AVAILABLE:
            self.skipTest("psycopg2 not available - skipping wallet creation test")
        
        print("🔍 Testing wallet creation...")
        
        try:
            # Create wallet
            wallet_id = db.create_wallet(self.test_user_id, 500.0)
            self.assertIsNotNone(wallet_id)
            
            # Verify wallet exists
            wallet = db.get_wallet(self.test_user_id)
            self.assertIsNotNone(wallet)
            self.assertEqual(wallet['balance'], 500.0)
            
            print("✅ Wallet creation successful")
        except Exception as e:
            self.fail(f"Wallet creation failed: {e}")
    
    def test_language_preference_storage(self):
        """Test language preference storage (only if psycopg2 available)"""
        if not PSYCOPG2_AVAILABLE:
            self.skipTest("psycopg2 not available - skipping language preference test")
        
        print("🔍 Testing language preference storage...")
        
        try:
            # Test different languages
            languages = ['en', 'hi', 'ta', 'te']
            
            for lang in languages:
                test_user_id = f"test_lang_{lang}_{int(datetime.now().timestamp())}"
                test_data = self.test_data.copy()
                test_data['user_id'] = test_user_id
                test_data['language_preference'] = lang
                
                # Create user
                user_id = db.create_user(test_data)
                self.assertIsNotNone(user_id)
                
                # Verify language preference
                user = db.get_user(test_user_id)
                self.assertEqual(user['language_preference'], lang)
            
            print("✅ Language preference storage successful")
        except Exception as e:
            self.fail(f"Language preference storage failed: {e}")
    
    def tearDown(self):
        """Clean up test data (only if psycopg2 available)"""
        if not PSYCOPG2_AVAILABLE:
            return
            
        try:
            # Clean up test users
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("DELETE FROM wallets WHERE user_id LIKE 'test_%'")
                    cursor.execute("DELETE FROM users WHERE user_id LIKE 'test_%'")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")

def run_tests():
    """Run all tests"""
    print("🧪 Running Database Unit Tests")
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
    print(f"Skipped: {len(result.skipped) if hasattr(result, 'skipped') else 0}")
    
    if result.failures:
        print("\n❌ Failures:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback}")
    
    if result.errors:
        print("\n💥 Errors:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback}")
    
    if hasattr(result, 'skipped') and result.skipped:
        print("\n⏭️  Skipped:")
        for test, reason in result.skipped:
            print(f"  - {test}: {reason}")
    
    return len(result.failures) == 0 and len(result.errors) == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)