#!/bin/bash
# Configure Android signing for local builds
# This script configures signing in android/app/build.gradle after prebuild

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$SCRIPT_DIR/android"
BUILD_GRADLE="$ANDROID_DIR/app/build.gradle"
KEYSTORE_PATH="$PROJECT_ROOT/credentials/new_keystore.jks"
KEYSTORE_ALIAS="kundli"
KEYSTORE_PASSWORD="kundli@123"

# Check if keystore file exists
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ ERROR: Keystore file not found at $KEYSTORE_PATH"
    echo "   Please ensure new_keystore.jks is in the credentials/ folder"
    exit 1
fi

# Check if build.gradle exists (must run after prebuild)
if [ ! -f "$BUILD_GRADLE" ]; then
    echo "❌ ERROR: build.gradle not found at $BUILD_GRADLE"
    echo "   Please run 'npx expo prebuild --platform android' first"
    exit 1
fi

echo "🔧 Configuring Android signing..."

# Check if signing is already configured
if grep -q "signingConfigs" "$BUILD_GRADLE"; then
    echo "⚠️  Signing config already exists, updating..."
    # Remove existing signingConfigs and release config
    # This is a simple approach - you may need to manually edit if complex
    sed -i.bak '/signingConfigs/,/}/d' "$BUILD_GRADLE"
fi

# Create signing config block
SIGNING_CONFIG="
    signingConfigs {
        release {
            storeFile file(\"$KEYSTORE_PATH\")
            storePassword \"$KEYSTORE_PASSWORD\"
            keyAlias \"$KEYSTORE_ALIAS\"
            keyPassword \"$KEYSTORE_PASSWORD\"
        }
    }
"

# Find android block and add signingConfigs
if grep -q "android {" "$BUILD_GRADLE"; then
    # Add signingConfigs after android { block
    awk -v config="$SIGNING_CONFIG" '
    /android \{/ {
        print $0
        print config
        next
    }
    {print}
    ' "$BUILD_GRADLE" > "$BUILD_GRADLE.tmp" && mv "$BUILD_GRADLE.tmp" "$BUILD_GRADLE"
fi

# Update buildTypes to use signing config
if grep -q "buildTypes {" "$BUILD_GRADLE"; then
    # Ensure release buildType uses signingConfig
    if grep -q "release {" "$BUILD_GRADLE"; then
        if ! grep -q "signingConfig signingConfigs.release" "$BUILD_GRADLE"; then
            sed -i.bak '/release {/,/}/ {
                /}/ i\
            signingConfig signingConfigs.release
            }' "$BUILD_GRADLE"
        fi
    fi
fi

echo "✅ Signing configuration added to build.gradle"
echo "   Keystore: $KEYSTORE_PATH"
echo "   Alias: $KEYSTORE_ALIAS"
echo ""
echo "⚠️  NOTE: Please verify the signing configuration in android/app/build.gradle"
echo "   You may need to manually adjust the file paths if needed"

