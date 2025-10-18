#!/usr/bin/env python3
"""
AstroVoice Test Suite - Main Test Runner
Run all tests with: python3 tests/run_tests.py
"""

import sys
import os
import subprocess
import time
from datetime import datetime

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class TestRunner:
    def __init__(self):
        self.test_results = []
        self.start_time = datetime.now()
        
    def run_test_file(self, test_file, test_type):
        """Run a specific test file with enhanced error logging"""
        print(f"\n🧪 Running {test_type} tests: {test_file}")
        print("=" * 60)
        
        # Check if file exists
        if not os.path.exists(test_file):
            print(f"❌ Test file not found: {test_file}")
            return False
        
        try:
            # Run with more verbose output
            result = subprocess.run([
                sys.executable, '-u', test_file  # -u for unbuffered output
            ], capture_output=True, text=True, timeout=60, cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            
            # Always show output for debugging
            if result.stdout:
                print("📝 Test Output:")
                print("-" * 40)
                print(result.stdout)
                print("-" * 40)
            
            if result.stderr:
                print("⚠️  Test Errors/Warnings:")
                print("-" * 40)
                print(result.stderr)
                print("-" * 40)
            
            if result.returncode == 0:
                print(f"✅ {test_file} - PASSED")
                self.test_results.append({
                    'file': test_file,
                    'type': test_type,
                    'status': 'PASSED',
                    'output': result.stdout,
                    'errors': result.stderr
                })
                return True
            else:
                print(f"❌ {test_file} - FAILED")
                print(f"Return code: {result.returncode}")
                
                # Enhanced error reporting
                if result.stderr:
                    print(f"Error details: {result.stderr}")
                else:
                    print("No error output captured")
                
                self.test_results.append({
                    'file': test_file,
                    'type': test_type,
                    'status': 'FAILED',
                    'returncode': result.returncode,
                    'error': result.stderr or "No error message",
                    'stdout': result.stdout
                })
                return False
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {test_file} - TIMEOUT (60 seconds)")
            self.test_results.append({
                'file': test_file,
                'type': test_type,
                'status': 'TIMEOUT',
                'error': 'Test timed out after 60 seconds'
            })
            return False
        except Exception as e:
            print(f"💥 {test_file} - ERROR: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            self.test_results.append({
                'file': test_file,
                'type': test_type,
                'status': 'ERROR',
                'error': str(e),
                'traceback': traceback.format_exc()
            })
            return False
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 AstroVoice Test Suite")
        print("=" * 60)
        print(f"Started at: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test files to run
        test_files = [
            ('tests/unit/test_database.py', 'Unit'),
            ('tests/unit/test_uuid_generation.py', 'Unit'),
            ('tests/integration/test_user_registration.py', 'Integration'),
            ('tests/api/test_mobile_endpoints.py', 'API'),
            ('tests/database/test_data_export.py', 'Database'),
            ('tests/integration/test_language_preference.py', 'Integration')
        ]
        
        passed = 0
        total = len(test_files)
        
        for test_file, test_type in test_files:
            if os.path.exists(test_file):
                if self.run_test_file(test_file, test_type):
                    passed += 1
            else:
                print(f"⚠️  {test_file} - NOT FOUND")
        
        # Summary
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        print(f"\n📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Duration: {duration.total_seconds():.2f} seconds")
        
        # Detailed failure report
        if passed < total:
            print(f"\n❌ FAILED TESTS DETAILS:")
            print("-" * 60)
            for result in self.test_results:
                if result['status'] != 'PASSED':
                    print(f"\n🔍 {result['file']} ({result['type']})")
                    print(f"   Status: {result['status']}")
                    if 'returncode' in result:
                        print(f"   Return Code: {result['returncode']}")
                    if 'error' in result:
                        print(f"   Error: {result['error']}")
                    if 'traceback' in result:
                        print(f"   Traceback: {result['traceback']}")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
            return True
        else:
            print("❌ SOME TESTS FAILED")
            return False
    
    def run_specific_test(self, test_type):
        """Run tests for a specific type"""
        test_map = {
            'unit': ['tests/unit/test_database.py', 'tests/unit/test_uuid_generation.py'],
            'integration': ['tests/integration/test_user_registration.py', 'tests/integration/test_language_preference.py'],
            'api': ['tests/api/test_mobile_endpoints.py'],
            'database': ['tests/database/test_data_export.py']
        }
        
        if test_type not in test_map:
            print(f"❌ Unknown test type: {test_type}")
            print("Available types: unit, integration, api, database")
            return False
        
        print(f"🧪 Running {test_type} tests only")
        print("=" * 60)
        
        passed = 0
        total = len(test_map[test_type])
        
        for test_file in test_map[test_type]:
            if os.path.exists(test_file):
                if self.run_test_file(test_file, test_type.title()):
                    passed += 1
        
        print(f"\n📊 {test_type.upper()} TEST SUMMARY")
        print(f"Passed: {passed}/{total}")
        
        return passed == total

def main():
    """Main function"""
    if len(sys.argv) > 1:
        test_type = sys.argv[1]
        runner = TestRunner()
        success = runner.run_specific_test(test_type)
    else:
        runner = TestRunner()
        success = runner.run_all_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
