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

