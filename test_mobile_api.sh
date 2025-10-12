#!/bin/bash
# Comprehensive test script for Mobile API

API_BASE="http://localhost:8001"

echo "================================================"
echo "🧪 Testing AstroVoice Mobile API"
echo "================================================"
echo ""

# 1. Health Check
echo "1️⃣  Testing Health Check..."
curl -s "$API_BASE/health" | python3 -m json.tool
echo ""
echo ""

# 2. Register User
echo "2️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919123456789",
    "full_name": "Nikhil Kumar",
    "date_of_birth": "20/05/1995",
    "time_of_birth": "02:30 PM",
    "place_of_birth": "Delhi, India",
    "gender": "Male"
  }')

echo "$REGISTER_RESPONSE" | python3 -m json.tool
USER_ID=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('user_id', ''))")
echo "✅ User ID: $USER_ID"
echo ""
echo ""

# 3. Get All Astrologers
echo "3️⃣  Testing Get All Astrologers..."
curl -s "$API_BASE/api/astrologers" | python3 -m json.tool
echo ""
echo ""

# 4. Start Chat Session
echo "4️⃣  Testing Start Chat Session..."
START_CHAT_RESPONSE=$(curl -s -X POST "$API_BASE/api/chat/start" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"astrologer_id\": \"ast_guru_001\",
    \"topic\": \"career\"
  }")

echo "$START_CHAT_RESPONSE" | python3 -m json.tool
CONVERSATION_ID=$(echo "$START_CHAT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('conversation_id', ''))")
echo "✅ Conversation ID: $CONVERSATION_ID"
echo ""
echo ""

# 5. Send Message
echo "5️⃣  Testing Send Message..."
curl -s -X POST "$API_BASE/api/chat/message" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversation_id\": \"$CONVERSATION_ID\",
    \"sender_type\": \"user\",
    \"content\": \"Hello, can you help me with my career?\"
  }" | python3 -m json.tool
echo ""
echo ""

# 6. Get Chat History
echo "6️⃣  Testing Get Chat History..."
curl -s "$API_BASE/api/chat/history/$CONVERSATION_ID" | python3 -m json.tool
echo ""
echo ""

# 7. Get Wallet Balance
echo "7️⃣  Testing Get Wallet Balance..."
curl -s "$API_BASE/api/wallet/$USER_ID" | python3 -m json.tool
echo ""
echo ""

# 8. Recharge Wallet
echo "8️⃣  Testing Wallet Recharge..."
curl -s -X POST "$API_BASE/api/wallet/recharge" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"amount\": 1000.00,
    \"payment_method\": \"upi\",
    \"payment_reference\": \"UPI_TEST_123456\"
  }" | python3 -m json.tool
echo ""
echo ""

# 9. Get Transactions
echo "9️⃣  Testing Get Transactions..."
curl -s "$API_BASE/api/wallet/transactions/$USER_ID" | python3 -m json.tool
echo ""
echo ""

# 10. End Conversation
echo "🔟 Testing End Conversation..."
curl -s -X POST "$API_BASE/api/chat/end" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversation_id\": \"$CONVERSATION_ID\",
    \"duration_seconds\": 125
  }" | python3 -m json.tool
echo ""
echo ""

# 11. Submit Review
echo "1️⃣1️⃣  Testing Submit Review..."
curl -s -X POST "$API_BASE/api/reviews/submit" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"astrologer_id\": \"ast_guru_001\",
    \"conversation_id\": \"$CONVERSATION_ID\",
    \"rating\": 5,
    \"review_text\": \"Excellent guidance! Very helpful.\",
    \"session_duration\": \"02:05\"
  }" | python3 -m json.tool
echo ""
echo ""

# 12. Get Astrologer (verify rating updated)
echo "1️⃣2️⃣  Testing Get Astrologer (check updated rating)..."
curl -s "$API_BASE/api/astrologers/ast_guru_001" | python3 -m json.tool
echo ""
echo ""

echo "================================================"
echo "✅ All API Tests Complete!"
echo "================================================"
echo ""
echo "Summary:"
echo "- User ID: $USER_ID"
echo "- Conversation ID: $CONVERSATION_ID"
echo ""

