#!/bin/bash

# AstroVoice APK Creation Script
# This script provides multiple options for creating an APK

echo "🚀 AstroVoice APK Creation Script"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: Please run this script from the mobile directory"
    echo "   cd /Users/nikhil/workplace/voice_v1/mobile"
    exit 1
fi

echo "✅ Found app.json - we're in the right directory"
echo ""

# Check if EAS CLI is available
if command -v eas &> /dev/null; then
    echo "✅ EAS CLI is installed"
    EAS_AVAILABLE=true
else
    echo "⚠️  EAS CLI not found - will try with npx"
    EAS_AVAILABLE=false
fi

echo ""
echo "Choose your APK creation method:"
echo "1. EAS Build (Cloud) - Recommended for production"
echo "2. Expo Go (Quick testing) - No APK needed"
echo "3. Local Build (Requires Android Studio setup)"
echo "4. Check project status"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🔨 Creating APK with EAS Build..."
        echo ""
        if [ "$EAS_AVAILABLE" = true ]; then
            echo "Logging in to Expo..."
            eas login
            echo ""
            echo "Building APK..."
            eas build --platform android --profile preview
        else
            echo "Using npx eas-cli..."
            npx eas-cli login
            echo ""
            echo "Building APK..."
            npx eas-cli build --platform android --profile preview
        fi
        echo ""
        echo "✅ APK build initiated! Check the Expo dashboard for progress."
        echo "📱 You'll get a download link when the build completes."
        ;;
    2)
        echo "📱 Starting Expo Go development server..."
        echo ""
        echo "Instructions:"
        echo "1. Install 'Expo Go' app on your Android phone"
        echo "2. Scan the QR code that appears"
        echo "3. Your app will load in Expo Go"
        echo ""
        npx expo start
        ;;
    3)
        echo "🔨 Setting up local build..."
        echo ""
        echo "Prerequisites:"
        echo "1. Android Studio installed"
        echo "2. Android SDK configured"
        echo "3. Android device connected or emulator running"
        echo ""
        echo "Starting local build..."
        npx expo run:android --variant release
        ;;
    4)
        echo "📊 Project Status:"
        echo ""
        echo "App Name: $(grep -o '"name": "[^"]*"' app.json | cut -d'"' -f4)"
        echo "Version: $(grep -o '"version": "[^"]*"' app.json | cut -d'"' -f4)"
        echo "Package: $(grep -o '"package": "[^"]*"' app.json | cut -d'"' -f4)"
        echo ""
        echo "Assets check:"
        if [ -f "assets/icon.png" ]; then
            echo "✅ App icon: assets/icon.png"
        else
            echo "❌ App icon: Missing"
        fi
        
        if [ -f "assets/splash-icon.png" ]; then
            echo "✅ Splash screen: assets/splash-icon.png"
        else
            echo "❌ Splash screen: Missing"
        fi
        
        if [ -f "assets/adaptive-icon.png" ]; then
            echo "✅ Adaptive icon: assets/adaptive-icon.png"
        else
            echo "❌ Adaptive icon: Missing"
        fi
        
        echo ""
        echo "Dependencies:"
        if [ -f "node_modules" ]; then
            echo "✅ Node modules installed"
        else
            echo "❌ Run 'npm install' first"
        fi
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        ;;
esac

echo ""
echo "🎉 Done! Check the output above for next steps."
