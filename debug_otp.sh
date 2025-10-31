#!/bin/bash
# OTP Debugging Script

echo "=== OTP Debugging Checklist ==="
echo ""

echo "1️⃣ Checking Local Backend..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Local backend is running"
    curl -s http://localhost:8000/health | head -1
else
    echo "❌ Local backend NOT running"
    echo "   Start with: python3 main_openai_realtime.py"
fi

echo ""
echo "2️⃣ Checking AWS Backend..."
AWS_RESPONSE=$(curl -s https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/health 2>&1)
if echo "$AWS_RESPONSE" | grep -q "Missing Authentication Token"; then
    echo "⚠️  AWS API Gateway may not be configured correctly"
elif echo "$AWS_RESPONSE" | grep -q "message\|status"; then
    echo "✅ AWS backend accessible"
    echo "$AWS_RESPONSE" | head -1
else
    echo "❌ AWS backend not accessible"
fi

echo ""
echo "3️⃣ Mac IP Address (for local testing):"
MAC_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "   $MAC_IP"

echo ""
echo "4️⃣ Current API Config:"
grep -A 5 "if (!isDevelopment)" mobile/src/config/api.ts | head -6

echo ""
echo "5️⃣ Testing OTP Endpoint (Local)..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    curl -X POST http://localhost:8000/api/auth/send-otp \
      -H "Content-Type: application/json" \
      -d '{"phone_number":"1234567890"}' 2>&1 | head -3
else
    echo "   (Skipped - backend not running)"
fi

echo ""
echo "=== To View Mobile Logs ==="
echo "adb logcat | grep -E 'API|OTP|Error'"
