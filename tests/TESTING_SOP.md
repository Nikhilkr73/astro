# 🧪 AstroVoice Testing SOP (Standard Operating Procedure)

## Overview

This document provides a comprehensive guide for testing the AstroVoice application. The testing framework includes unit tests, integration tests, API tests, and database tests.

---

## 🚀 Quick Start

### Run All Tests
```bash
# Run complete test suite (with enhanced error logging)
python3 tests/run_tests.py

# Run tests without database connection (always works)
python3 tests/unit/test_database_no_db.py

# Run tests with psycopg2 dependency (requires database)
python3 tests/unit/test_database.py

# Enhanced test runner (maximum verbosity)
python3 tests/enhanced_test_runner.py

# Simple test (basic functionality check)
python3 tests/simple_test.py

# Debug test (import and connection check)
python3 tests/debug_test.py

# Run specific test type
python3 tests/run_tests.py unit
python3 tests/run_tests.py integration
python3 tests/run_tests.py api
python3 tests/run_tests.py database
```

### Prerequisites
```bash
# Install psycopg2 for database tests
pip install psycopg2-binary==2.9.10

# Ensure server is running
python3 -m backend.main &

# Check server health
curl http://localhost:8000/health
```

---

## 📋 Test Categories

### 1. **Unit Tests** (`tests/unit/`)
- **Purpose**: Test individual components in isolation
- **Files**:
  - `test_database.py` - Database operations (requires psycopg2)
  - `test_database_no_db.py` - Database operations without database connection
  - `test_uuid_generation.py` - UUID generation methods
- **Run**: `python3 tests/run_tests.py unit`
- **Run without DB**: `python3 tests/unit/test_database_no_db.py`

### 2. **Integration Tests** (`tests/integration/`)
- **Purpose**: Test complete workflows and component interactions
- **Files**:
  - `test_user_registration.py` - Complete user registration flow
  - `test_language_preference.py` - Language preference functionality
- **Run**: `python3 tests/run_tests.py integration`

### 3. **API Tests** (`tests/api/`)
- **Purpose**: Test HTTP endpoints and API functionality
- **Files**:
  - `test_mobile_endpoints.py` - Mobile API endpoints
- **Run**: `python3 tests/run_tests.py api`

### 4. **Database Tests** (`tests/database/`)
- **Purpose**: Test database operations and data export
- **Files**:
  - `test_data_export.py` - Data export functionality
- **Run**: `python3 tests/run_tests.py database`

---

## 🔧 Test Setup

### Environment Setup
```bash
# Activate virtual environment
source venv/bin/activate

# Install test dependencies (if needed)
pip install requests unittest

# Ensure database is running
brew services start postgresql
```

### Database Setup
```bash
# Install psycopg2 first
pip install psycopg2-binary==2.9.10

# Check database connection (with fallback)
python3 tests/debug_test.py

# Alternative database check
python3 -c "from backend.database.manager import db; print('✅ Database connected')"

# Verify database schema
python3 view_user_data.py --tables

# Test without database connection
python3 tests/unit/test_database_no_db.py
```

---

## 📊 Test Execution

### Manual Test Execution
```bash
# Run individual test files (with database)
python3 tests/unit/test_database.py
python3 tests/integration/test_user_registration.py
python3 tests/api/test_mobile_endpoints.py
python3 tests/database/test_data_export.py

# Run tests without database connection
python3 tests/unit/test_database_no_db.py
python3 tests/unit/test_uuid_generation.py
```

### Automated Test Execution
```bash
# Run all tests with summary
python3 tests/run_tests.py

# Run specific test category
python3 tests/run_tests.py unit
```

### Test Output Interpretation

#### **Successful Test Output**
```
🧪 Running Unit tests: tests/unit/test_database.py
============================================================
📝 Test Output:
----------------------------------------
✅ Database manager imported successfully from backend.database.manager
🧪 Running Database Unit Tests
==================================================
🔍 Testing database connection...
✅ Database connection successful
🔍 Testing user creation...
✅ User creation successful
🔍 Testing wallet creation...
✅ Wallet creation successful
----------------------------------------

✅ tests/unit/test_database.py - PASSED

📊 TEST SUMMARY
============================================================
Total Tests: 6
Passed: 6
Failed: 0
Duration: 15.23 seconds
🎉 ALL TESTS PASSED!
```

#### **Failed Test Output (Enhanced Error Logging)**
```
🧪 Running Unit tests: tests/unit/test_database.py
============================================================
📝 Test Output:
----------------------------------------
⚠️  psycopg2 not available - database features will be disabled
⚠️  Database manager initialized but psycopg2 not available
✅ Database manager imported successfully from backend.database.manager
🧪 Running Database Unit Tests
==================================================
test_database_connection (__main__.TestDatabaseOperations.test_database_connection)
Test database connection ... 🔍 Testing database connection...
SKIP (psycopg2 not available - skipping database connection test)
test_user_creation (__main__.TestDatabaseOperations.test_user_creation)
Test user creation ... 🔍 Testing user creation...
SKIP (psycopg2 not available - skipping user creation test)
test_uuid_generation (__main__.TestDatabaseOperations.test_uuid_generation)
Test UUID generation methods ... 🔍 Testing UUID generation...
✅ UUID generation successful
ok

📊 Test Summary:
Tests run: 3
Failures: 0
Errors: 0
Skipped: 2
🎉 TESTS PASSED (with skips)!
```

---

## 🎯 Feature-Specific Testing

### 1. **User Registration Testing**
```bash
# Test complete registration flow
python3 tests/integration/test_user_registration.py

# Expected Results:
# ✅ User Registration API - PASSED
# ✅ Language Preference Storage - PASSED
# ✅ Wallet Creation - PASSED
# ✅ Error Handling - PASSED
```

### 2. **Language Preference Testing**
```bash
# Test language preference fix
python3 tests/integration/test_language_preference.py

# Expected Results:
# ✅ Explicit Language Preference - PASSED
# ✅ Default Language Preference - PASSED
# ✅ Null Language Preference - PASSED
# ✅ Empty Language Preference - PASSED
# ✅ Language Distribution - PASSED
```

### 3. **UUID Generation Testing**
```bash
# Test UUID scalability
python3 tests/unit/test_uuid_generation.py

# Expected Results:
# ✅ User ID format correct
# ✅ User IDs are unique
# ✅ Conversation ID format correct
# ✅ Message ID format correct
# ✅ Wallet ID format correct
# ✅ Timestamp inclusion correct
# ✅ Generated 1000 unique IDs in 0.123 seconds
```

### 4. **API Endpoint Testing**
```bash
# Test mobile API endpoints
python3 tests/api/test_mobile_endpoints.py

# Expected Results:
# ✅ Health Endpoints - PASSED
# ✅ Astrologers Endpoint - PASSED
# ✅ User Registration Endpoint - PASSED
# ✅ Wallet Endpoint - PASSED
# ✅ Error Handling - PASSED
# ✅ CORS Headers - PASSED
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Server Not Running**
```bash
# Error: Server not accessible
# Solution:
python3 -m backend.main &
sleep 5
curl http://localhost:8000/health
```

#### 2. **Database Connection Issues**
```bash
# Error: Database connection failed
# Solution:
brew services start postgresql

# Install psycopg2 first
pip install psycopg2-binary==2.9.10

# Test with debug tool (recommended)
python3 tests/debug_test.py

# Alternative test
python3 -c "from backend.database.manager import db; print('✅ Database connected')"

# If backend import fails, test root import
python3 -c "from database_manager import DatabaseManager; print('✅ Root database manager works')"

# Test without database connection
python3 tests/unit/test_database_no_db.py
```

#### 3. **Test Data Cleanup**
```bash
# Clean up test data
python3 view_user_data.py --sql "DELETE FROM users WHERE user_id LIKE 'test_%'"
python3 view_user_data.py --sql "DELETE FROM wallets WHERE user_id LIKE 'test_%'"
```

#### 4. **Port Already in Use**
```bash
# Error: Port 8000 already in use
# Solution:
lsof -ti:8000 | xargs kill -9
python3 -m backend.main &
```

#### 5. **Import Path Issues**
```bash
# Error: ModuleNotFoundError: No module named 'backend.database.manager'
# Solution: Tests now have dual import strategy, but you can debug with:

# Test imports manually
python3 debug_test.py

# Check if backend module exists
ls -la backend/database/

# Test root database manager
python3 -c "from database_manager import DatabaseManager; print('✅ Root import works')"
```

#### 6. **Empty Error Messages**
```bash
# Problem: Tests fail but show no error details
# Solution: Use enhanced test runners

# Enhanced test runner (recommended)
python3 tests/enhanced_test_runner.py

# Simple test for basic validation
python3 tests/simple_test.py

# Debug specific issues
python3 tests/debug_test.py
```

#### 7. **psycopg2 Not Available**
```bash
# Problem: psycopg2 not installed
# Solution: Install psycopg2 or use tests without database

# Install psycopg2
pip install psycopg2-binary==2.9.10

# Or run tests without database connection
python3 tests/unit/test_database_no_db.py
python3 tests/unit/test_uuid_generation.py
```

---

## 📈 Test Metrics

### Success Criteria
- **Unit Tests**: 100% pass rate
- **Integration Tests**: 100% pass rate
- **API Tests**: 100% pass rate
- **Database Tests**: 100% pass rate

### Performance Benchmarks
- **UUID Generation**: 1000 IDs in < 1 second
- **User Registration**: < 2 seconds per user
- **Database Queries**: < 100ms per query
- **API Response**: < 500ms per request

---

## 🔄 Continuous Testing

### Pre-Development Testing
```bash
# Before starting new feature
python3 tests/run_tests.py

# Quick validation
python3 simple_test.py
```

### Post-Development Testing
```bash
# After implementing feature
python3 tests/run_tests.py
python3 tests/run_tests.py integration  # Focus on integration

# Enhanced testing with detailed output
python3 enhanced_test_runner.py
```

### Regression Testing
```bash
# Before deployment
python3 tests/run_tests.py
python3 view_user_data.py analyze  # Check data integrity

# Debug any issues
python3 debug_test.py
```

---

## 📝 Test Maintenance

### Adding New Tests
1. **Create test file** in appropriate category directory
2. **Follow naming convention**: `test_<feature>.py`
3. **Include in test runner**: Add to `run_tests.py`
4. **Document test purpose** in file header

### Updating Existing Tests
1. **Maintain backward compatibility**
2. **Update test data** if schema changes
3. **Verify test still passes** after changes
4. **Update documentation** if needed

### Test Data Management
- **Use test prefixes**: `test_`, `user_test_`, etc.
- **Clean up after tests**: Remove test data
- **Use unique identifiers**: Timestamps, UUIDs
- **Avoid production data**: Never test with real user data

---

## 🎯 Testing Checklist

### Before Feature Development
- [ ] Run existing tests: `python3 tests/run_tests.py`
- [ ] Quick validation: `python3 simple_test.py`
- [ ] Verify all tests pass
- [ ] Check database schema: `python3 view_user_data.py --tables`
- [ ] Debug any issues: `python3 debug_test.py`

### During Feature Development
- [ ] Write unit tests for new functions
- [ ] Test database operations
- [ ] Verify API endpoints
- [ ] Check error handling
- [ ] Use enhanced test runner: `python3 enhanced_test_runner.py`

### After Feature Development
- [ ] Run complete test suite: `python3 tests/run_tests.py`
- [ ] Enhanced testing: `python3 enhanced_test_runner.py`
- [ ] Test integration with existing features
- [ ] Verify data export functionality
- [ ] Check language preference handling
- [ ] Test UUID generation
- [ ] Debug any failures: `python3 debug_test.py`

### Before Deployment
- [ ] Run all tests: `python3 tests/run_tests.py`
- [ ] Enhanced validation: `python3 enhanced_test_runner.py`
- [ ] Check data integrity: `python3 view_user_data.py analyze`
- [ ] Verify API endpoints: `python3 tests/run_tests.py api`
- [ ] Test data export: `python3 tests/run_tests.py database`
- [ ] Final debug check: `python3 debug_test.py`

---

## 📚 Additional Resources

### Test Files Reference
- **Main Runner**: `tests/run_tests.py` (enhanced error logging)
- **Enhanced Runner**: `tests/enhanced_test_runner.py` (maximum verbosity)
- **Simple Test**: `tests/simple_test.py` (basic functionality check)
- **Debug Test**: `tests/debug_test.py` (import and connection testing)
- **No DB Test**: `tests/unit/test_database_no_db.py` (works without psycopg2)
- **Unit Tests**: `tests/unit/`
- **Integration Tests**: `tests/integration/`
- **API Tests**: `tests/api/`
- **Database Tests**: `tests/database/`

### Related Tools
- **Data Viewer**: `python3 view_user_data.py`
- **Database Manager**: `backend/database/manager.py`
- **Mobile Endpoints**: `backend/api/mobile_endpoints.py`

### Documentation
- **AWS Data Viewer Guide**: `AWS_DATA_VIEWER_GUIDE.md`
- **Database Schema**: `database_schema.sql`
- **Project Status**: `PROJECT_STATUS.md`
- **Enhanced Error Logging Summary**: `ENHANCED_ERROR_LOGGING_SUMMARY.md`
- **Testing Framework Summary**: `TESTING_FRAMEWORK_SUMMARY.md`

---

## 🎉 Success Metrics

### Test Coverage Goals
- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All major workflows
- **API Tests**: All endpoints
- **Database Tests**: All operations

### Quality Metrics
- **Zero test failures** in CI/CD
- **Sub-second test execution** for unit tests
- **Complete test suite** runs in < 30 seconds
- **100% pass rate** for critical paths
- **Enhanced error logging** for faster debugging
- **Dual import strategy** for robust module loading
- **Comprehensive error capture** with detailed tracebacks

---

## 🔧 Enhanced Error Logging Features

### **New Debugging Tools**
- **`enhanced_test_runner.py`**: Maximum verbosity test runner with detailed error reporting
- **`simple_test.py`**: Basic functionality validation for quick checks
- **`debug_test.py`**: Import and connection testing for troubleshooting

### **Improved Error Reporting**
- **Unbuffered Output**: Real-time test output capture
- **Comprehensive Error Capture**: Both stdout and stderr captured
- **Detailed Failure Reports**: Return codes, error messages, and full tracebacks
- **File Existence Checks**: Verifies test files exist before running
- **Enhanced Timeout Handling**: 60-second timeout with better error messages

### **Dual Import Strategy**
- **Primary Import**: `backend.database.manager` (preferred)
- **Fallback Import**: `database_manager` (root level)
- **Graceful Degradation**: If one import fails, tries the alternative
- **Better Error Messages**: Shows exactly which import failed and why

### **Usage Examples**
```bash
# Enhanced test runner (recommended for debugging)
python3 tests/enhanced_test_runner.py

# Simple validation
python3 tests/simple_test.py

# Debug specific issues
python3 tests/debug_test.py

# Test without database connection
python3 tests/unit/test_database_no_db.py

# Standard test runner (now with better error logging)
python3 tests/run_tests.py
```

---

**Last Updated**: October 18, 2025  
**Version**: 1.1.0  
**Status**: ✅ Ready for Production Testing with Enhanced Error Logging
