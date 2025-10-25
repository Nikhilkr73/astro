#!/bin/bash

# Quick Setup Script for Test Phone Number System
# This script helps configure the environment for cost-saving beta testing

echo "🧪 Setting up Test Phone Number System for Beta Testing"
echo "=================================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from env_example.txt..."
    cp env_example.txt .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check database connection
echo ""
echo "🔍 Checking database connection..."
if psql -h localhost -p 5432 -U nikhil -d astrovoice -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "💡 Make sure PostgreSQL is running and accessible"
    echo "   Try: brew services start postgresql@14"
fi

# Check if database exists
echo ""
echo "🔍 Checking if astrovoice database exists..."
if psql -h localhost -p 5432 -U nikhil -d astrovoice -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ astrovoice database exists"
else
    echo "❌ astrovoice database not found"
    echo "💡 Create it with: createdb -U nikhil astrovoice"
fi

echo ""
echo "🧪 Test Phone Numbers Available:"
echo "================================"
echo "Phone Number    | OTP Code | Purpose"
echo "9999999999      | 112233   | Main test user"
echo "8888888888      | 112233   | Secondary test user"
echo "7777777777      | 112233   | Wallet testing"
echo "6666666666      | 112233   | Chat testing"
echo "5555555555      | 112233   | Voice testing"
echo "1111111111      | 000000   | Admin test"
echo "2222222222      | 999999   | Error testing"
echo "3333333333      | 123456   | Bonus testing"

echo ""
echo "💰 Cost Savings:"
echo "================"
echo "• Message Central Cost: ~₹0.50-1.00 per OTP"
echo "• Test OTPs per day: ~50-100 during beta"
echo "• Daily Savings: ₹25-100"
echo "• Monthly Savings: ₹750-3000"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Start your backend server: python3 main_openai_realtime.py"
echo "2. Use any test phone number in your mobile app"
echo "3. Enter the corresponding OTP code"
echo "4. Complete authentication without Message Central costs"

echo ""
echo "✅ Setup complete! Test phone numbers are ready to use."
