#!/bin/bash
# Comprehensive AWS API Gateway Testing Script

AWS_URL="https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod"
echo "=== AWS API Gateway Comprehensive Test ==="
echo "Base URL: $AWS_URL"
echo ""

# Test endpoints used by mobile app
ENDPOINTS=(
    "/health"
    "/api/auth/send-otp"
    "/api/auth/verify-otp"
    "/api/users/register"
    "/api/astrologers"
    "/api/chat/start"
    "/api/wallet/1234567890-1234-1234-1234-123456789012"
)

echo "Testing all endpoints..."
for endpoint in "${ENDPOINTS[@]}"; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Testing: $endpoint"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [[ "$endpoint" == *"send-otp"* ]]; then
        curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$AWS_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d '{"phone_number":"1234567890"}' 2>&1 | head -5
    elif [[ "$endpoint" == *"verify-otp"* ]]; then
        curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$AWS_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d '{"phone_number":"1234567890","otp_code":"123456"}' 2>&1 | head -5
    else
        curl -s -w "\nHTTP Status: %{http_code}\n" "$AWS_URL$endpoint" 2>&1 | head -5
    fi
done

echo ""
echo "=== Test Summary ==="
echo "If all endpoints return 'Missing Authentication Token', AWS API Gateway may not be deployed."
echo "Check: cd infrastructure && cdk deploy"
