#!/bin/bash
# Optimized API Test Script - Fast & Minimal API Calls
# Only tests critical endpoints that must work for app to function

API_URL="https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod"
TEST_PHONE="9876543210"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

echo "⚡ Optimized API Test (Critical Endpoints Only)"
echo "API URL: $API_URL"
echo "=========================================="
echo ""

# Quick test function - minimal output, minimal API calls
test_quick() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    
    if [ "$method" = "POST" ]; then
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL$endpoint" \
            -H "Content-Type: application/json" -d "$data" 2>/dev/null)
    else
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL$endpoint" 2>/dev/null)
    fi
    
    if [[ "$http_code" =~ ^2[0-9]{2}$ ]]; then
        echo -e "${GREEN}✅${NC} $name (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $name (HTTP $http_code)"
        ((FAILED++))
        return 1
    fi
}

# Critical endpoints only (4 total)
echo -e "${BLUE}Testing Critical Endpoints...${NC}"
echo ""

test_quick "Health Check (root)" "GET" "/health" ""
test_quick "Health Check (/api/health)" "GET" "/api/health" ""
test_quick "Send OTP" "POST" "/api/auth/send-otp" "{\"phone_number\":\"$TEST_PHONE\"}"
test_quick "List Astrologers" "GET" "/api/astrologers" ""

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical endpoints working!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some endpoints need fixing${NC}"
    exit 1
fi
