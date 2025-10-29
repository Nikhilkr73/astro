#!/bin/bash

# Android Logcat Filter - Show Only Our App Logs
# Usage: ./scripts/android_logcat_filter.sh

echo "📱 Filtering Android Logs for AstroVoice..."
echo "Press Ctrl+C to stop"
echo ""

# Filter for our package + React Native JS logs + our emoji markers
adb logcat -c  # Clear old logs
adb logcat -s ReactNativeJS:* | grep --line-buffered -E "(💰|🔙|⏰|📏|📐|ChatSessionScreen|PersistentChatBar|ChatSessionContext|apiService|Session|💰|🔙|⏰|📏)"

