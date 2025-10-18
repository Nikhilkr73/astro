#!/usr/bin/env python3
"""
Fixed Test Runner - Handles Import Issues
"""

import sys
import os
import subprocess
import unittest
from datetime import datetime

def fix_imports_and_run_test(test_file):
    """Fix imports and run a test file"""
    print(f"🔧 Fixing imports for: {test_file}")
    
    # Read the test file
    with open(test_file, 'r') as f:
        content = f.read()
    
    # Fix the import path issue
    fixed_content = content.replace(
        "sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))",
        "project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))\nsys.path.insert(0, project_root)"
    )
    
    # Create a temporary fixed file
    temp_file = test_file.replace('.py', '_fixed.py')
    with open(temp_file, 'w') as f:
        f.write(fixed_content)
    
    print(f"✅ Created fixed version: {temp_file}")
    return temp_file

def run_test_with_fixes(test_file):
    """Run a test file with import fixes"""
    print(f"\n🧪 Running test: {test_file}")
    print("=" * 60)
    
    try:
        # Fix imports
        fixed_file = fix_imports_and_run_test(test_file)
        
        # Run the fixed test
        result = subprocess.run([
            sys.executable, '-u', fixed_file
        ], capture_output=True, text=True, timeout=60, cwd=os.path.dirname(os.path.abspath(__file__)))
        
        # Show output
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
            return True
        else:
            print(f"❌ {test_file} - FAILED")
            print(f"Return code: {result.returncode}")
            return False
            
    except Exception as e:
        print(f"💥 {test_file} - ERROR: {e}")
        return False
    finally:
        # Clean up temp file
        try:
            if 'fixed_file' in locals():
                os.remove(fixed_file)
        except:
            pass

def main():
    """Main test runner"""
    print("🔧 Fixed Test Runner")
    print("=" * 60)
    
    # Test files to run
    test_files = [
        "tests/unit/test_database.py",
        "tests/unit/test_uuid_generation.py",
        "tests/database/test_data_export.py"
    ]
    
    passed = 0
    failed = 0
    
    for test_file in test_files:
        if os.path.exists(test_file):
            if run_test_with_fixes(test_file):
                passed += 1
            else:
                failed += 1
        else:
            print(f"⚠️  Test file not found: {test_file}")
    
    print(f"\n📊 SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {passed + failed}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("🎉 ALL TESTS PASSED!")
    else:
        print("❌ Some tests failed")

if __name__ == "__main__":
    main()
