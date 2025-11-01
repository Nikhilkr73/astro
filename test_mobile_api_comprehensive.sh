#!/bin/bash
API_URL="https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod"
TEST_PHONE="9876543210"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'
PASSED=0
FAILED=0

test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    echo "Testing: $name"
    if [ "$method" = "POST" ]; then
        http_code=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST "$API_URL$endpoint" -H "Content-Type: application/json" -d "$data")
    else
        http_code=$(curl -s -w "%{http_code}" -o /tmp/response.json -X GET "$API_URL$endpoint")
    fi
    if [[ "$http_code" =~ ^2[0-9]{2}$ ]]; then
        echo -e "${GREEN}✅ $name: HTTP $http_code${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $name: HTTP $http_code${NC}"
        cat /tmp/response.json | head -c 200
        echo ""
        ((FAILED++))
    fi
}

echo "🧪 Testing Mobile API Endpoints"
echo "=================================="
test_api "Health" "GET" "/health" ""
test_api "Send OTP" "POST" "/api/auth/send-otp" "{\"phone_number\":\"$TEST_PHONE\"}"
test_api "Verify OTP" "POST" "/api/auth/verify-otp" "{\"phone_number\":\"$TEST_PHONE\",\"otp_code\":\"123456\"}"
test_api "List Astrologers" "GET" "/api/astrologers" ""
test_api "Register User" "POST" "/api/users/register" "{\"phone_number\":\"$TEST_PHONE\",\"full_name\":\"Test\",\"date_of_birth\":\"01/01/1990\",\"time_of_birth\":\"12:00 PM\",\"place_of_birth\":\"Mumbai\"}"
echo ""
echo "✅ Passed: $PASSED | ❌ Failed: $FAILED"
