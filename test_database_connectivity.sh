#!/bin/bash
# Quick test to verify database operations work
API_URL="https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod"

echo "Testing database-dependent endpoints..."
echo ""

# Test user registration (requires database)
echo "1. User Registration:"
curl -s -X POST "$API_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"9876543210","full_name":"Test User","date_of_birth":"01/01/1990","time_of_birth":"12:00 PM","place_of_birth":"Mumbai"}' | head -c 200
echo ""
echo ""

sleep 2

# Check Lambda logs
MOBILE_LAMBDA=$(aws lambda list-functions --region ap-south-1 --query "Functions[?contains(FunctionName, 'MobileApi')].FunctionName" --output text | awk '{print $1}')
echo "2. Recent Lambda logs (database-related):"
aws logs tail "/aws/lambda/$MOBILE_LAMBDA" --region ap-south-1 --since 2m --format short 2>&1 | grep -E "database|Database|psycopg2|Error|ERROR" | tail -5
