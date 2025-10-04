#!/bin/bash
# Script to tail logs for the Voice Astrology App

echo "🔍 Voice Astrology App - Log Viewer"
echo "===================================="
echo ""

# Check which logs to tail
case "$1" in
  backend|server|api)
    echo "📱 Tailing Backend API logs..."
    tail -f backend.log
    ;;
  
  mobile|expo|metro)
    echo "📱 Expo Metro bundler doesn't create log files"
    echo "Check the terminal where you ran 'npm start'"
    ;;
  
  all|combined)
    echo "📊 Tailing ALL logs..."
    tail -f backend.log
    ;;
  
  *)
    echo "Usage: ./tail_logs.sh [backend|mobile|all]"
    echo ""
    echo "Available log files:"
    echo "  📱 backend.log          - FastAPI backend logs (API requests, OpenAI responses)"
    echo "  📂 logs/                - Historical logs directory"
    echo ""
    echo "Examples:"
    echo "  ./tail_logs.sh backend  - Watch backend API logs"
    echo "  ./tail_logs.sh all      - Watch all logs together"
    echo ""
    echo "Quick commands:"
    echo "  tail -f backend.log                    - Follow backend logs"
    echo "  tail -100 backend.log                  - Last 100 lines"
    echo "  grep 'OpenAI' backend.log              - Search for OpenAI messages"
    echo "  tail -f backend.log | grep '📱'        - Only mobile API requests"
    ;;
esac


