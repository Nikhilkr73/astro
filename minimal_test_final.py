#!/usr/bin/env python3
"""
Minimal Test - Just test basic Python functionality
"""

print("🔍 Minimal Test Starting")
print("=" * 30)

try:
    import sys
    import os
    print("✅ Basic imports work")
    
    # Test path manipulation
    project_root = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, project_root)
    print(f"✅ Project root: {project_root}")
    
    # Test if files exist
    backend_path = os.path.join(project_root, 'backend')
    db_manager_path = os.path.join(backend_path, 'database', 'manager.py')
    root_db_path = os.path.join(project_root, 'database_manager.py')
    
    print(f"Backend exists: {os.path.exists(backend_path)}")
    print(f"DB manager exists: {os.path.exists(db_manager_path)}")
    print(f"Root DB exists: {os.path.exists(root_db_path)}")
    
    # Try to import
    print("\n🔍 Trying imports...")
    
    try:
        from backend.database.manager import db
        print("✅ Backend import successful")
        print(f"DB type: {type(db)}")
    except Exception as e:
        print(f"❌ Backend import failed: {e}")
        
    try:
        from database_manager import DatabaseManager
        db_root = DatabaseManager()
        print("✅ Root import successful")
        print(f"DB type: {type(db_root)}")
    except Exception as e:
        print(f"❌ Root import failed: {e}")
    
    print("\n✅ Minimal test completed successfully")
    
except Exception as e:
    print(f"❌ Minimal test failed: {e}")
    import traceback
    traceback.print_exc()
