#!/bin/bash
# Clean AstroVoice Project
# Removes all build artifacts, caches, and temporary files

echo "🧹 Cleaning AstroVoice Project..."
echo "================================="

# Clean Python cache
echo "Cleaning Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true

# Clean Node modules (mobile)
echo "Cleaning mobile node_modules..."
cd mobile 2>/dev/null && rm -rf node_modules && cd .. || true

# Clean Expo cache
echo "Cleaning Expo cache..."
cd mobile 2>/dev/null && npx expo r -c 2>/dev/null && cd .. || true

# Clean CDK build artifacts
echo "Cleaning CDK build artifacts..."
cd infrastructure 2>/dev/null && rm -rf cdk.out && cd .. || true

# Clean logs
echo "Cleaning log files..."
rm -f *.log backend.log server_output.log 2>/dev/null || true

# Clean test artifacts
echo "Cleaning test artifacts..."
rm -f tests/*_fixed.py tests/test_output.txt 2>/dev/null || true

# Clean temporary files
echo "Cleaning temporary files..."
rm -f .DS_Store 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

echo "✅ Clean completed!"
echo ""
echo "To rebuild:"
echo "1. pip install -r requirements.txt"
echo "2. cd mobile && npm install && cd .."
echo "3. cd infrastructure && npm install && cd .."
echo "4. python3 tests/unit/test_database_no_db.py"
