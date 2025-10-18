#!/bin/bash
# Build AstroVoice Project
# Installs all dependencies and verifies setup

echo "🔨 Building AstroVoice Project..."
echo "================================="

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found. Run this script from the project root."
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install Python dependencies"
    exit 1
fi

# Install mobile dependencies
echo "Installing mobile dependencies..."
cd mobile
if [ ! -f "package.json" ]; then
    echo "❌ Error: mobile/package.json not found"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install mobile dependencies"
    exit 1
fi
cd ..

# Install CDK dependencies
echo "Installing CDK dependencies..."
cd infrastructure
if [ ! -f "package.json" ]; then
    echo "❌ Error: infrastructure/package.json not found"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install CDK dependencies"
    exit 1
fi
cd ..

# Test the setup
echo "Testing setup..."
source venv/bin/activate
python3 tests/unit/test_database_no_db.py
if [ $? -ne 0 ]; then
    echo "❌ Error: Tests failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start backend: python3 -m backend.main"
echo "2. Start mobile: cd mobile && npm start"
echo "3. Test health: curl http://localhost:8000/health"
