# 📱 Android Studio Emulator Development Guide

**Last Updated:** October 23, 2025  
**Purpose:** Complete development workflow using Android Studio emulator + Cursor IDE

---

## 🎯 **Recommended Development Workflow**

### **Setup: Android Studio Emulator + Cursor IDE**
- ✅ **Code in Cursor** - Full IDE with AI assistance
- ✅ **Test on Emulator** - Android Studio emulator
- ✅ **Hot Reload** - Instant updates when you save code
- ✅ **Debug Tools** - Full debugging capabilities

---

## 🚀 **Step 1: Android Studio Emulator Setup**

### **Open Project in Android Studio**
```bash
# Open Android Studio
# File → Open → Select this folder:
/Users/nikhil/workplace/voice_v1/mobile/android
```

### **Create/Start Emulator**
1. **In Android Studio:**
   - Tools → AVD Manager
   - Create Virtual Device
   - Choose: **Pixel 7** (recommended)
   - System Image: **API 33 (Android 13)** or **API 34 (Android 14)**
   - Click **Finish**

2. **Start Emulator:**
   - Click ▶️ **Play button** next to your emulator
   - Wait for emulator to boot (2-3 minutes first time)

### **Verify Emulator is Running**
```bash
adb devices
# Should show: emulator-5554    device
```

---

## 🚀 **Step 2: Development Workflow**

### **Method 1: Expo Development Build (Recommended)**

**One-time setup:**
```bash
cd /Users/nikhil/workplace/voice_v1/mobile

# Build and install on emulator (one-time)
npx expo run:android
```

This will:
1. Build the app
2. Install on emulator automatically
3. Start development server

**Daily development:**
```bash
# In Cursor IDE - make your code changes
# Then run this to see changes instantly:
npx expo start --dev-client
```

**Benefits:**
- ✅ Hot reload - changes appear instantly
- ✅ No rebuild needed for code changes
- ✅ Full debugging capabilities
- ✅ All features work (chat, voice, wallet UI)

### **Method 2: Direct APK Build**

**Build APK:**
```bash
cd /Users/nikhil/workplace/voice_v1/mobile/android
./gradlew assembleDebug
```

**Install on emulator:**
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Note:** This method requires rebuild for every change.

---

## 📋 **Development Environment Setup**

### **Required:**
1. **Android Studio** ✅ Already installed
2. **Java JDK 17** ✅ Already installed
3. **Android SDK** ✅ Already installed
4. **Environment Variables** ✅ Already configured

### **Current Setup Status:**
```bash
# Verify everything is working:
echo $ANDROID_HOME
# Should show: /Users/nikhil/Library/Android/sdk

adb --version
# Should show: Android Debug Bridge version 1.0.41

java -version
# Should show: openjdk version "17.0.17"
```

### **Environment Variables (Already Set):**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
```

---

## 🔧 **Troubleshooting**

### **Issue: Emulator not detected**
```bash
# Check if emulator is running
adb devices

# If empty, start emulator in Android Studio:
# Tools → AVD Manager → Click ▶️ Play button
```

### **Issue: App crashes on emulator**
```bash
# Check logs in real-time
adb logcat | grep -E "(AstrologyApp|Kundli|com.astrovoice)"

# Or view logs in Android Studio:
# View → Tool Windows → Logcat
```

### **Issue: Hot reload not working**
```bash
# Restart development server
npx expo start --dev-client --clear

# Or rebuild if needed
npx expo run:android
```

### **Issue: Build fails**
```bash
# Clean and rebuild
cd /Users/nikhil/workplace/voice_v1/mobile
rm -rf android ios .expo
npx expo prebuild --platform android
npx expo run:android
```

### **Issue: react-native-iap error**
- ✅ **Already fixed!** IAP disabled temporarily in billingService.ts
- ✅ **Wallet works in MOCK MODE** for testing

---

## 📱 **Testing Features on Emulator**

### **✅ What Works Perfectly:**
- **Authentication** - Phone OTP login (real SMS via Message Central)
- **Chat** - AI astrologer conversations (real OpenAI responses)
- **Voice Calls** - Voice AI with OpenAI Realtime API
- **Profile Management** - View/edit profile, birth details
- **Wallet UI** - View balance, transaction history
- **Navigation** - All screens and flows
- **Backend Integration** - Real database, real APIs

### **⚠️ Mock Features (For Testing):**
- **Wallet Recharge** - Mock purchases (IAP temporarily disabled for build stability)

---

## 🎯 **Daily Development Workflow**

### **Step 1: Start Emulator**
1. Open Android Studio
2. Tools → AVD Manager
3. Click ▶️ **Play button** next to your emulator
4. Wait for emulator to boot

### **Step 2: Start Development Server**
```bash
cd /Users/nikhil/workplace/voice_v1/mobile

# If first time or major changes:
npx expo run:android

# For daily development (after first build):
npx expo start --dev-client
```

### **Step 3: Code in Cursor IDE**
- Make changes in Cursor IDE
- Save file (Ctrl/Cmd + S)
- Changes appear instantly on emulator! 🚀

---

## 🔍 **Debugging Tools**

### **Real-time Logs:**
```bash
# Terminal logs
adb logcat | grep -E "(AstrologyApp|Kundli|com.astrovoice)"

# Android Studio Logcat
# View → Tool Windows → Logcat
```

### **Debug Features:**
- ✅ **Hot Reload** - Instant code updates
- ✅ **Error Overlay** - See errors directly on emulator
- ✅ **React DevTools** - Debug React components
- ✅ **Network Inspector** - Monitor API calls
- ✅ **Performance Profiler** - Check app performance

---

## 🚀 **Quick Commands Summary**

```bash
# First-time setup (run once)
cd /Users/nikhil/workplace/voice_v1/mobile
npx expo run:android

# Daily development (run every session)
npx expo start --dev-client

# If something breaks (clean rebuild)
rm -rf android ios .expo
npx expo prebuild --platform android
npx expo run:android
```

---

## 📊 **Development Benefits**

| Feature | Emulator Development | Physical Device |
|---------|-------------------|-----------------|
| **Setup** | ✅ One-time | ⚠️ USB debugging |
| **Hot Reload** | ✅ Instant | ✅ Instant |
| **Debug Tools** | ✅ Full access | ⚠️ Limited |
| **Speed** | ✅ Fast | ✅ Fast |
| **Convenience** | ✅ Always available | ❌ Need device |

---

## 🛒 **Google Play Store Testing (Future Enhancement)**

### **Current Status: Mock Mode**
- ✅ **App builds successfully** without IAP complications
- ✅ **All features work** except real payments
- ✅ **Wallet UI fully functional** with mock purchases
- ✅ **Perfect for development and testing**

### **For Real Google Play Testing (Later):**
1. **Create Google Play Console Account**
   - Go to: https://play.google.com/console
   - Create developer account ($25 one-time fee)
   - Create new app: "AstroVoice"

2. **Set Up Test Products**
   - Go to **Monetization** → **Products** → **In-app products**
   - Create products: `astro_recharge_100`, `astro_recharge_500`, etc.

3. **Enable Real IAP**
   - Re-enable `react-native-iap` in package.json
   - Update billingService.ts to use real Google Play calls
   - Test with Google Play test accounts

### **🔧 Current Purchase Flow**
- ✅ **Mock purchases work perfectly**
- ✅ **UI shows purchase success**
- ✅ **Wallet balance updates**
- ✅ **Transaction history recorded**
- ❌ **No real money charged** (safe for testing)

---

## 🎉 **You're Ready to Develop!**

1. **Start emulator** in Android Studio
2. **Run:** `npx expo run:android` (first time)
3. **Code in Cursor IDE**
4. **Test real Google Play purchases** on emulator!

**Perfect development setup with real IAP testing achieved!** 🚀


---

## 🔧 **Version Code Updates & Build Fixes**

**Last Updated:** November 1, 2024  
**Purpose:** Fix common build issues when updating version codes for Google Play Console uploads

### **Common Issue: Version Code Already Used**

Google Play Console tracks version codes even for failed uploads. If you get:
```
Error: Version code X has already been used. Try another version code.
```

**Solution:** Increment to the next unused version code.

### **Step 1: Update Version Codes**

```bash
cd /Users/nikhil/workplace/voice_v1

# Update app.json
sed -i '' 's/"versionCode": [0-9]*/"versionCode": <NEW_VERSION>/' mobile/app.json
sed -i '' 's/"version": "[^"]*"/"version": "<NEW_VERSION_NAME>"/' mobile/app.json

# Update build.gradle
sed -i '' 's/versionCode [0-9]*/versionCode <NEW_VERSION>/' mobile/android/app/build.gradle
sed -i '' 's/versionName "[^"]*"/versionName "<NEW_VERSION_NAME>"/' mobile/android/app/build.gradle

# Example for version code 4:
# sed -i '' 's/"versionCode": 3/"versionCode": 4/' mobile/app.json
# sed -i '' 's/"version": "1.0.2"/"version": "1.0.3"/' mobile/app.json
```

### **Step 2: Fix Expo Modules Core Plugin Error**

If you encounter this error during build:
```
Could not get unknown property 'release' for SoftwareComponent container
```

**Fix:** Patch the expo-modules-core plugin to handle missing components gracefully:

```bash
# Backup original plugin
cp mobile/node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle.backup \
   mobile/node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle 2>/dev/null || \
cp mobile/node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle \
   mobile/node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle.backup

# Apply fix
python3 << 'PYTHON'
import re

expo_plugin = 'mobile/node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle'

with open(expo_plugin, 'r') as f:
    content = f.read()

# Wrap publishing block in conditional check
old_publishing = '''  project.afterEvaluate {
    publishing {
      publications {
        release(MavenPublication) {
          from components.release
        }
      }
      repositories {
        maven {
          url = mavenLocal().url
        }
      }
    }
  }'''

new_publishing = '''  project.afterEvaluate {
    // Only configure publishing if release component exists
    def hasReleaseComponent = false
    try {
      hasReleaseComponent = components.findByName('release') != null
    } catch (Exception e) {
      // Component doesn't exist yet, skip publishing config
    }
    
    if (hasReleaseComponent) {
      publishing {
        publications {
          release(MavenPublication) {
            from components.release
          }
        }
        repositories {
          maven {
            url = mavenLocal().url
          }
        }
      }
    }
  }'''

if old_publishing in content:
    content = content.replace(old_publishing, new_publishing)
    with open(expo_plugin, 'w') as f:
        f.write(content)
    print("✅ Applied expo-modules-core fix")
else:
    print("ℹ️  Plugin already patched or structure different")
PYTHON
```

### **Step 3: Fix React Native IAP Product Flavor Ambiguity**

If you get an error about ambiguous variants (amazonReleaseRuntimeElements vs playReleaseRuntimeElements):

```bash
# Add missingDimensionStrategy to defaultConfig in build.gradle
sed -i '' '/versionName "[^"]*"/a\
        missingDimensionStrategy '\''store'\'', '\''play'\''
' mobile/android/app/build.gradle
```

### **Step 4: Ensure Android SDK Location**

```bash
# Create/update local.properties
echo "sdk.dir=$HOME/Library/Android/sdk" > mobile/android/local.properties
```

### **Step 5: Clean Build**

```bash
cd mobile/android
./gradlew clean
./gradlew bundleRelease --no-daemon
```

### **Step 6: Verify Build**

```bash
# Check AAB exists and get version info
ls -lh mobile/android/app/build/outputs/bundle/release/app-release.aab
grep -E 'versionCode|versionName' mobile/android/app/build.gradle | head -2
```

### **Quick Script for Version Update**

Save this script as `update-version.sh` in project root:

```bash
#!/bin/bash
# Usage: ./update-version.sh <VERSION_CODE> <VERSION_NAME>
# Example: ./update-version.sh 4 "1.0.3"

VERSION_CODE=$1
VERSION_NAME=$2

if [ -z "$VERSION_CODE" ] || [ -z "$VERSION_NAME" ]; then
    echo "Usage: $0 <VERSION_CODE> <VERSION_NAME>"
    echo "Example: $0 4 \"1.0.3\""
    exit 1
fi

cd "$(dirname "$0")"

# Update app.json
sed -i '' "s/\"versionCode\": [0-9]*/\"versionCode\": $VERSION_CODE/" mobile/app.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION_NAME\"/" mobile/app.json

# Update build.gradle
sed -i '' "s/versionCode [0-9]*/versionCode $VERSION_CODE/" mobile/android/app/build.gradle
sed -i '' "s/versionName \"[^\"]*\"/versionName \"$VERSION_NAME\"/" mobile/android/app/build.gradle

echo "✅ Updated to version code $VERSION_CODE, version name $VERSION_NAME"
echo "Next: Run 'cd mobile/android && ./gradlew bundleRelease'"
```

### **Troubleshooting**

1. **"SDK location not found"**
   - Ensure `mobile/android/local.properties` exists with `sdk.dir=$HOME/Library/Android/sdk`

2. **"Could not get unknown property 'release'"**
   - Apply the expo-modules-core fix above
   - Ensure you're running `./gradlew clean` before building

3. **"Version code already used"**
   - Check Google Play Console for all uploaded versions
   - Increment to next unused version code

4. **"Ambiguous product flavors"**
   - Ensure `missingDimensionStrategy 'store', 'play'` is in `defaultConfig`

5. **Build succeeds but AAB not found**
   - Check `mobile/android/app/build/outputs/bundle/release/`
   - Verify build completed without errors

---

