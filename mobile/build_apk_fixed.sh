#!/bin/bash

# AstroVoice Fixed APK Build Script
# This script fixes the common Gradle build issues with Expo SDK 51

echo "🔧 AstroVoice Fixed APK Build Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: Please run this script from the mobile directory"
    echo "   cd /Users/nikhil/workplace/voice_v1/mobile"
    exit 1
fi

echo "✅ Found app.json - we're in the right directory"
echo ""

# Clear any previous build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf android ios .expo

echo "✅ Cleaned build artifacts"
echo ""

# Prebuild to generate native code
echo "🔨 Running Expo prebuild..."
npx expo prebuild --clean

echo "✅ Prebuild completed"
echo ""

echo "Choose your build method:"
echo "1. EAS Build (Cloud) - Recommended"
echo "2. Local Build (Requires Android Studio)"
echo "3. Expo Go (Quick testing)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🚀 Starting EAS Build..."
        echo ""
        echo "This will build your APK in the cloud."
        echo "You'll need to be logged into your Expo account."
        echo ""
        
        # Try to login first
        echo "Checking Expo login status..."
        if ! npx eas-cli whoami &> /dev/null; then
            echo "Please login to Expo:"
            npx eas-cli login
        fi
        
        echo ""
        echo "Building APK with EAS..."
        npx eas-cli build --platform android --profile preview --non-interactive
        
        echo ""
        echo "✅ EAS Build completed! Check your Expo dashboard for the APK download link."
        ;;
    2)
        echo "🔨 Starting local build..."
        echo ""
        echo "Prerequisites:"
        echo "- Android Studio installed"
        echo "- Android SDK configured"
        echo "- Android device connected or emulator running"
        echo ""
        
        echo "Building APK locally..."
        npx expo run:android --variant release
        
        echo ""
        echo "✅ Local build completed!"
        ;;
    3)
        echo "📱 Starting Expo Go development server..."
        echo ""
        echo "Instructions:"
        echo "1. Install 'Expo Go' app on your Android phone"
        echo "2. Scan the QR code that appears"
        echo "3. Your app will load in Expo Go"
        echo ""
        npx expo start
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        ;;
esac

echo ""
echo "🎉 Build process completed! Check the output above for results."
