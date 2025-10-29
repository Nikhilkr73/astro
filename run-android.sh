#!/bin/bash

# Set Java environment for Android builds
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="$JAVA_HOME/bin:$PATH"

# Change to mobile directory
cd /Users/nikhil/workplace/voice_v1/mobile

# Run Android build
echo "🚀 Building and running on Android..."
echo "📋 JAVA_HOME: $JAVA_HOME"
echo ""

npx expo run:android

