#!/usr/bin/env python3
"""
Database Tests - Data Export
Tests data export functionality
"""

import sys
import os
import csv
import json
import tempfile
from datetime import datetime

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

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

class TestDataExport:
    """Test data export functionality"""
    
    def test_csv_export(self):
        """Test CSV export functionality"""
        print("🔍 Testing CSV export...")
        
        try:
            # Create test data
            test_user_id = f"test_export_{int(datetime.now().timestamp())}"
            test_data = {
                'user_id': test_user_id,
                'phone_number': '+919999999999',
                'full_name': 'CSV Export Test User',
                'display_name': 'CSVTest',
                'email': 'csv@test.com',
                'gender': 'Male',
                'language_preference': 'en',
                'subscription_type': 'free',
                'metadata': {'test': True}
            }
            
            # Create user
            user_id = db.create_user(test_data)
            if not user_id:
                print("❌ Failed to create test user")
                return False
            
            # Export to CSV
            query = f"SELECT user_id, full_name, language_preference FROM users WHERE user_id = '{test_user_id}'"
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as temp_file:
                temp_filename = temp_file.name
            
            # Simulate CSV export
            try:
                from backend.database.manager import db
            except ImportError:
                # Fallback to root database_manager
                from database_manager import DatabaseManager
                db = DatabaseManager()
            
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    columns = [desc[0] for desc in cursor.description]
                    rows = cursor.fetchall()
                    
                    with open(temp_filename, 'w', newline='', encoding='utf-8') as csvfile:
                        writer = csv.writer(csvfile)
                        writer.writerow(columns)
                        writer.writerows(rows)
            
            # Verify CSV file
            with open(temp_filename, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                rows = list(reader)
                
                if len(rows) == 1:
                    row = rows[0]
                    if (row['user_id'] == test_user_id and 
                        row['full_name'] == 'CSV Export Test User' and
                        row['language_preference'] == 'en'):
                        print("✅ CSV export successful")
                        
                        # Cleanup
                        os.unlink(temp_filename)
                        return True
                    else:
                        print(f"❌ Invalid CSV data: {row}")
                        return False
                else:
                    print(f"❌ Expected 1 row, got {len(rows)}")
                    return False
                    
        except Exception as e:
            print(f"❌ CSV export error: {e}")
            return False
    
    def test_json_export(self):
        """Test JSON export functionality"""
        print("🔍 Testing JSON export...")
        
        try:
            # Create test data
            test_user_id = f"test_json_{int(datetime.now().timestamp())}"
            test_data = {
                'user_id': test_user_id,
                'phone_number': '+919999999998',
                'full_name': 'JSON Export Test User',
                'display_name': 'JSONTest',
                'email': 'json@test.com',
                'gender': 'Female',
                'language_preference': 'hi',
                'subscription_type': 'free',
                'metadata': {'test': True}
            }
            
            # Create user
            user_id = db.create_user(test_data)
            if not user_id:
                print("❌ Failed to create test user")
                return False
            
            # Export to JSON
            query = f"SELECT user_id, full_name, language_preference, created_at FROM users WHERE user_id = '{test_user_id}'"
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
                temp_filename = temp_file.name
            
            # Simulate JSON export
            try:
                from backend.database.manager import db
            except ImportError:
                # Fallback to root database_manager
                from database_manager import DatabaseManager
                db = DatabaseManager()
            
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    columns = [desc[0] for desc in cursor.description]
                    rows = cursor.fetchall()
                    
                    # Convert to list of dictionaries
                    data = []
                    for row in rows:
                        row_dict = {}
                        for i, value in enumerate(row):
                            # Convert datetime objects to strings
                            if hasattr(value, 'isoformat'):
                                row_dict[columns[i]] = value.isoformat()
                            else:
                                row_dict[columns[i]] = value
                        data.append(row_dict)
                    
                    with open(temp_filename, 'w', encoding='utf-8') as jsonfile:
                        json.dump(data, jsonfile, indent=2, ensure_ascii=False)
            
            # Verify JSON file
            with open(temp_filename, 'r', encoding='utf-8') as jsonfile:
                data = json.load(jsonfile)
                
                if len(data) == 1:
                    row = data[0]
                    if (row['user_id'] == test_user_id and 
                        row['full_name'] == 'JSON Export Test User' and
                        row['language_preference'] == 'hi'):
                        print("✅ JSON export successful")
                        
                        # Cleanup
                        os.unlink(temp_filename)
                        return True
                    else:
                        print(f"❌ Invalid JSON data: {row}")
                        return False
                else:
                    print(f"❌ Expected 1 row, got {len(data)}")
                    return False
                    
        except Exception as e:
            print(f"❌ JSON export error: {e}")
            return False
    
    def test_sql_query_execution(self):
        """Test SQL query execution"""
        print("🔍 Testing SQL query execution...")
        
        try:
            try:
                from backend.database.manager import db
            except ImportError:
                # Fallback to root database_manager
                from database_manager import DatabaseManager
                db = DatabaseManager()
            
            # Test basic query
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT COUNT(*) as user_count FROM users")
                    result = cursor.fetchone()
                    
                    if result and result[0] > 0:
                        print(f"✅ SQL query execution successful - {result[0]} users found")
                        return True
                    else:
                        print("❌ No users found in database")
                        return False
                        
        except Exception as e:
            print(f"❌ SQL query execution error: {e}")
            return False
    
    def test_table_schema_retrieval(self):
        """Test table schema retrieval"""
        print("🔍 Testing table schema retrieval...")
        
        try:
            try:
                from backend.database.manager import db
            except ImportError:
                # Fallback to root database_manager
                from database_manager import DatabaseManager
                db = DatabaseManager()
            
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT column_name, data_type, is_nullable 
                        FROM information_schema.columns 
                        WHERE table_name = 'users' AND table_schema = 'public'
                        ORDER BY ordinal_position
                    """)
                    
                    columns = cursor.fetchall()
                    
                    if len(columns) > 0:
                        print(f"✅ Table schema retrieval successful - {len(columns)} columns found")
                        
                        # Check for key columns
                        column_names = [col[0] for col in columns]
                        required_columns = ['user_id', 'full_name', 'language_preference']
                        
                        for req_col in required_columns:
                            if req_col not in column_names:
                                print(f"❌ Missing required column: {req_col}")
                                return False
                        
                        print("✅ All required columns present")
                        return True
                    else:
                        print("❌ No columns found")
                        return False
                        
        except Exception as e:
            print(f"❌ Table schema retrieval error: {e}")
            return False
    
    def test_data_viewer_functionality(self):
        """Test data viewer functionality"""
        print("🔍 Testing data viewer functionality...")
        
        try:
            try:
                from backend.database.manager import db
            except ImportError:
                # Fallback to root database_manager
                from database_manager import DatabaseManager
                db = DatabaseManager()
            
            # Test get_user method (which exists in both database managers)
            test_user_id = f"test_viewer_{int(datetime.now().timestamp())}"
            test_data = {
                'user_id': test_user_id,
                'phone_number': '+919999999997',
                'full_name': 'Viewer Test User',
                'display_name': 'ViewerTest',
                'email': 'viewer@test.com',
                'gender': 'Male',
                'language_preference': 'en',
                'subscription_type': 'free',
                'metadata': {'test': True}
            }
            
            # Create user first
            user_id = db.create_user(test_data)
            if not user_id:
                print("❌ Failed to create test user")
                return False
            
            # Test get_user method
            user = db.get_user(test_user_id)
            
            if user and isinstance(user, dict):
                print(f"✅ get_user successful - user retrieved: {user['full_name']}")
                
                # Check user structure
                required_fields = ['user_id', 'full_name', 'created_at']
                
                for field in required_fields:
                    if field not in user:
                        print(f"❌ Missing field in user data: {field}")
                        return False
                
                print("✅ User data structure correct")
                return True
            else:
                print("❌ get_user returned invalid data")
                return False
                
        except Exception as e:
            print(f"❌ Data viewer functionality error: {e}")
            return False
    
    def cleanup_test_data(self):
        """Clean up test data"""
        try:
            try:
                from backend.database.manager import db
            except ImportError:
                # Fallback to root database_manager
                from database_manager import DatabaseManager
                db = DatabaseManager()
            
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("DELETE FROM users WHERE user_id LIKE 'test_%'")
                    print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")
    
    def run_all_tests(self):
        """Run all database tests"""
        print("🧪 Running Database Data Export Tests")
        print("=" * 50)
        
        tests = [
            ("CSV Export", self.test_csv_export),
            ("JSON Export", self.test_json_export),
            ("SQL Query Execution", self.test_sql_query_execution),
            ("Table Schema Retrieval", self.test_table_schema_retrieval),
            ("Data Viewer Functionality", self.test_data_viewer_functionality)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🔍 Running: {test_name}")
            try:
                if test_func():
                    passed += 1
                    print(f"✅ {test_name} - PASSED")
                else:
                    print(f"❌ {test_name} - FAILED")
            except Exception as e:
                print(f"💥 {test_name} - ERROR: {e}")
        
        # Cleanup
        self.cleanup_test_data()
        
        print(f"\n📊 Database Test Summary:")
        print(f"Passed: {passed}/{total}")
        
        return passed == total

def main():
    """Main function"""
    tester = TestDataExport()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
