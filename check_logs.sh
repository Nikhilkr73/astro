#!/bin/bash
# Quick log checking script for AstroVoice
# Usage: ./check_logs.sh [lambda|backend|mobile|all]

LOG_TYPE=${1:-all}

echo "📋 AstroVoice Log Checking"
echo "=================================="
echo ""

case $LOG_TYPE in
  lambda|aws)
    echo "🔍 AWS Lambda Logs:"
    echo ""
    
    # Get Lambda function names
    MOBILE_LAMBDA=$(aws lambda list-functions --region ap-south-1 --query "Functions[?contains(FunctionName, 'MobileApi')].FunctionName" --output text | awk '{print $1}')
    INIT_LAMBDA=$(aws lambda list-functions --region ap-south-1 --query "Functions[?contains(FunctionName, 'InitDb')].FunctionName" --output text | awk '{print $1}')
    
    if [ -n "$MOBILE_LAMBDA" ]; then
      echo "📱 Mobile API Lambda: $MOBILE_LAMBDA"
      echo "   Recent logs (last 5 minutes):"
      aws logs tail "/aws/lambda/$MOBILE_LAMBDA" --region ap-south-1 --since 5m --format short 2>&1 | tail -20
      echo ""
      echo "💡 To tail continuously:"
      echo "   aws logs tail \"/aws/lambda/$MOBILE_LAMBDA\" --region ap-south-1 --follow"
    fi
    
    if [ -n "$INIT_LAMBDA" ]; then
      echo "🗄️  Database Init Lambda: $INIT_LAMBDA"
      echo "   Recent logs:"
      aws logs tail "/aws/lambda/$INIT_LAMBDA" --region ap-south-1 --since 1h --format short 2>&1 | tail -10
    fi
    ;;
    
  backend|local)
    echo "🔍 Local Backend Logs:"
    echo ""
    if [ -f "backend.log" ]; then
      echo "📄 backend.log (last 50 lines):"
      tail -50 backend.log
      echo ""
      echo "💡 To tail: tail -f backend.log"
    else
      echo "⚠️  backend.log not found"
      echo "   Start backend with: python3 main_openai_realtime.py"
    fi
    ;;
    
  mobile|android)
    echo "🔍 Mobile App Logs:"
    echo ""
    echo "📱 To view Android device logs:"
    echo "   adb logcat | grep -i astrovoice"
    echo ""
    echo "📱 To view React Native Metro logs:"
    echo "   cd mobile && npx expo start"
    ;;
    
  all|*)
    MOBILE_LAMBDA=$(aws lambda list-functions --region ap-south-1 --query "Functions[?contains(FunctionName, 'MobileApi')].FunctionName" --output text | awk '{print $1}')
    echo "1️⃣  AWS Lambda: aws logs tail \"/aws/lambda/$MOBILE_LAMBDA\" --region ap-south-1 --follow"
    echo "2️⃣  Backend: tail -f backend.log"
    echo "3️⃣  Mobile: adb logcat | grep -i astro"
    ;;
esac

echo ""
