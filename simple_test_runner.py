#!/usr/bin/env python3
"""
Simple Test Runner - Will show actual output
"""

import subprocess
import sys
import os

def run_test_with_output(test_file):
    """Run a test file and capture all output"""
    print(f"🧪 Running: {test_file}")
    print("=" * 60)
    
    try:
        # Run the test file
        result = subprocess.run([
            sys.executable, test_file
        ], capture_output=True, text=True, timeout=30, cwd=os.path.dirname(os.path.abspath(__file__)))
        
        print("STDOUT:")
        print("-" * 40)
        print(result.stdout)
        print("-" * 40)
        
        print("STDERR:")
        print("-" * 40)
        print(result.stderr)
        print("-" * 40)
        
        print(f"Return code: {result.returncode}")
        
        if result.returncode == 0:
            print("✅ TEST PASSED")
        else:
            print("❌ TEST FAILED")
            
    except subprocess.TimeoutExpired:
        print("⏰ TEST TIMED OUT")
    except Exception as e:
        print(f"💥 ERROR RUNNING TEST: {e}")

if __name__ == "__main__":
    # Test the minimal test first
    run_test_with_output("minimal_test_final.py")
    
    print("\n" + "="*60 + "\n")
    
    # Test the actual database test
    run_test_with_output("tests/unit/test_database.py")
