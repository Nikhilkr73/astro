# 📱 Building APK and AAB for Physical Device Testing

**Last Updated:** January 2025  
**Purpose:** Step-by-step guide to build and install APK/AAB on physical Android devices

---

## ⚠️ IMPORTANT: Backend Server Required

**YES - You MUST run the backend server on your Mac!**

The APK bundles the JavaScript code (so you don't need Metro), but the app **still needs the backend API** running for:
- ✅ OTP authentication
- ✅ Chat functionality  
- ✅ Wallet operations
- ✅ User data
- ✅ All API calls

**What's bundled vs what's not:**
- ✅ **Bundled in APK:** React Native app code, UI, JavaScript bundle
- ❌ **NOT bundled:** Backend server (FastAPI), database, OpenAI API calls

**So you need:**
1. ✅ Backend server running on Mac: `python3 main_openai_realtime.py`
2. ✅ Mac and Android device on **same WiFi network**
3. ✅ Mac's IP configured in `api.ts`: `192.168.0.105:8000`

---

## 🎯 Overview

This guide covers building standalone APK and AAB files that can be installed on physical Android devices without requiring Metro bundler.

**Two Build Types:**
1. **Debug APK** - Faster build, larger file, includes debug symbols
2. **Release APK/AAB** - Optimized, smaller, ready for distribution

---

## ⚙️ Step 1: Configure API URL for Physical Device

Before building, ensure the app is configured to use your Mac's IP address:

1. **Find your Mac's IP address:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for: inet 192.168.0.105 (your actual IP)
```

2. **Edit `mobile/src/config/api.ts`:**
```typescript
const USE_PHYSICAL_DEVICE_IP = true; // Set to true for APK/AAB
const MAC_IP_ADDRESS = '192.168.0.105'; // Your Mac's IP
```

---

## 🔨 Step 2: Build Debug APK (Fast Testing)

**Use when:** Quick testing, debugging, development

```bash
cd /Users/nikhil/workplace/voice_v1/mobile/android

# Clean previous builds
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# APK location:
# mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

**Install on device:**
```bash
# Via ADB
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Or transfer APK to device and install manually:
# - Email to yourself
# - Use ADB push: adb push app-debug.apk /sdcard/Download/
# - On device: open APK from Downloads folder
```

---

## 🚀 Step 3: Build Release APK (Optimized)

**Use when:** Final testing, distribution, performance testing

```bash
cd /Users/nikhil/workplace/voice_v1/mobile/android

# Clean previous builds
./gradlew clean

# Build release APK
./gradlew assembleRelease

# APK location:
# mobile/android/app/build/outputs/apk/release/app-release.apk
```

**Note:** Release APKs may require signing. If you get signing errors, you may need to configure signing keys (see troubleshooting section).

**Install on device:**
```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Step 4: Build AAB (App Bundle for Play Store)

**Use when:** Uploading to Google Play Store (internal testing, alpha, beta, production)

```bash
cd /Users/nikhil/workplace/voice_v1/mobile/android

# Clean previous builds
./gradlew clean

# Build release AAB
./gradlew bundleRelease

# AAB location:
# mobile/android/app/build/outputs/bundle/release/app-release.aab
```

**Upload AAB to Play Console:**
- Go to Google Play Console
- Select your app → Release → Internal testing / Alpha / Beta / Production
- Upload the `.aab` file

---

## 🌐 Step 5: Start Backend Server (REQUIRED!)

**⚠️ CRITICAL:** The backend server MUST be running on your Mac for the app to work. Without it, the app will show network errors and nothing will work.

**You can start it BEFORE or AFTER installing the APK, but it must be running when you use the app:**

```bash
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate

# Start server (bind to all interfaces for LAN access)
python3 main_openai_realtime.py

# Server should run on: 0.0.0.0:8000
# This allows devices on same WiFi to connect
```

**Verify backend is accessible:**
```bash
# From Mac terminal:
curl http://192.168.0.105:8000/health

# Should return: {"status":"healthy",...}
```

**Important Network Requirements:**
- ✅ Mac and Android device must be on **same WiFi network**
- ✅ Mac's firewall must allow incoming connections on port 8000
- ✅ If firewall blocks, allow Python/uvicorn: `System Preferences → Security → Firewall`

---

## 📲 Step 6: Install APK on Device

### Method 1: Via ADB (Easiest)
```bash
# Connect device via USB and enable USB debugging

# Check device is connected
adb devices

# Install APK
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Or for release:
adb install -r app/build/outputs/apk/release/app-release.apk
```

### Method 2: Transfer and Install Manually
1. **Transfer APK to device:**
   ```bash
   adb push app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/app.apk
   ```

2. **On device:**
   - Open Files app → Download folder
   - Tap `app.apk`
   - Allow installation from unknown sources if prompted
   - Tap Install

### Method 3: Email/Cloud Transfer
1. Email APK to yourself
2. Open email on device
3. Download APK
4. Install from Downloads

---

## 🔍 Step 7: View Logs from Device

```bash
# Real-time logs (filtered for app)
adb logcat | grep -E "(AstrologyApp|com.astrovoice|ReactNativeJS|Error)"

# Or all React Native logs:
adb logcat | grep "ReactNative"

# Save errors to file:
adb logcat -d *:E > device_errors.txt

# Clear logs and start fresh:
adb logcat -c && adb logcat
```

---

## 🧪 Testing Checklist

After installing APK/AAB:

- [ ] App opens without crashes
- [ ] OTP login works (check backend is running)
- [ ] Astrologers list loads
- [ ] Chat functionality works
- [ ] Wallet balance displays correctly
- [ ] All API calls succeed (check logs for errors)

---

## 🔄 Switching Between Emulator and Physical Device

**For Emulator Testing:**
1. Edit `mobile/src/config/api.ts`:
   ```typescript
   const USE_PHYSICAL_DEVICE_IP = false; // Emulator mode
   ```
2. Run: `npx expo start` or `npx expo run:android`
3. Uses `10.0.2.2:8000` automatically

**For Physical Device Testing (APK/AAB):**
1. Edit `mobile/src/config/api.ts`:
   ```typescript
   const USE_PHYSICAL_DEVICE_IP = true; // Physical device mode
   const MAC_IP_ADDRESS = '192.168.0.105'; // Your Mac's IP
   ```
2. Rebuild APK: `./gradlew assembleDebug`
3. Install: `adb install -r app/build/outputs/apk/debug/app-debug.apk`
4. Uses `192.168.0.105:8000`

---

## 🔧 Troubleshooting

### Issue: "Network Error" or "Cannot connect to backend"
**Solution:**
1. ✅ Verify backend is running: `curl http://192.168.0.105:8000/health`
2. ✅ Check Mac and device are on same WiFi
3. ✅ Confirm Mac IP in `api.ts` matches actual IP
4. ✅ Check Mac firewall allows connections
5. ✅ Try accessing backend URL from device's browser: `http://192.168.0.105:8000/health`

### Issue: "Installation failed: INSTALL_FAILED_UPDATE_INCOMPATIBLE"
**Solution:**
```bash
# Uninstall existing app first
adb uninstall com.astrovoice.kundli

# Then install new APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Issue: APK won't install (Unknown sources blocked)
**Solution:**
- Settings → Security → Enable "Install from unknown sources"
- Or: Settings → Apps → Special access → Install unknown apps → Select file manager → Allow

### Issue: Release APK requires signing
**Solution:**
- For testing: Use debug APK (`assembleDebug`) - no signing needed
- For distribution: Configure signing keys in `android/app/build.gradle`

### Issue: App crashes immediately after opening
**Solution:**
```bash
# Check logs for error:
adb logcat -d | grep -E "(FATAL|AndroidRuntime|Exception)"

# Common causes:
# - Missing backend server
# - Wrong API URL
# - Network connectivity issues
```

### Issue: Can't find backend (ECONNREFUSED)
**Solution:**
```bash
# Test backend accessibility from device's browser:
# Open Chrome on device → Go to: http://192.168.0.105:8000/health

# If fails:
# 1. Check Mac IP hasn't changed: ifconfig | grep "inet "
# 2. Update api.ts with new IP
# 3. Rebuild APK
# 4. Reinstall
```

---

## 📊 APK vs AAB Comparison

| Feature | Debug APK | Release APK | AAB |
|---------|-----------|-------------|-----|
| **Size** | Larger (~50MB) | Optimized (~30MB) | Optimized (~25MB) |
| **Build Speed** | Fast (~2 min) | Medium (~3 min) | Slower (~4 min) |
| **Debugging** | ✅ Full debugging | ⚠️ Limited | ❌ No debugging |
| **Distribution** | Manual install | Manual install | Google Play Store |
| **Signing** | Auto-signed (debug) | Manual signing | Manual signing |
| **Use Case** | Development testing | Beta testing | Production release |

---

## 🎯 Quick Commands Reference

```bash
# Build debug APK
cd mobile/android && ./gradlew assembleDebug

# Build release APK
cd mobile/android && ./gradlew assembleRelease

# Build AAB
cd mobile/android && ./gradlew bundleRelease

# Install debug APK
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Install release APK
adb install -r app/build/outputs/apk/release/app-release.apk

# View logs
adb logcat | grep "ReactNative"

# Check backend health
curl http://192.168.0.105:8000/health
```

---

## 📝 Notes

- **APK/AAB files are standalone** - No Metro bundler needed
- **Backend must be running** on Mac for API calls to work
- **Always verify Mac IP** hasn't changed (WiFi reconnection can change it)
- **Rebuild APK** after changing `api.ts` configuration
- **Use debug APK** for development, release APK/AAB for testing/production

