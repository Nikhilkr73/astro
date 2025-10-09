# Troubleshooting Guide - Expo Errors

**Created:** October 9, 2025

---

## 🔴 Error: "Failed to download remote update" + "java.io.IOException"

This is a common Expo error. Here are the solutions:

---

## 🚀 **Quick Fixes (Try in Order)**

### Fix 1: Use Tunnel Connection (RECOMMENDED)
```bash
cd astro-voice-mobile
npx expo start --tunnel
```

**Why?** Tunnel bypasses network issues and works on any network (including mobile data).

### Fix 2: Clear All Caches
```bash
# Stop the server (Ctrl+C)
cd astro-voice-mobile

# Clear everything
rm -rf node_modules
rm -rf .expo
rm package-lock.json
npm cache clean --force

# Reinstall
npm install

# Start fresh
npx expo start --clear --tunnel
```

### Fix 3: Use LAN Connection with IP
```bash
# Get your computer's IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Start with LAN
npx expo start --lan
```

### Fix 4: Try Expo Go Beta or Development Build
Sometimes the issue is with Expo Go app version mismatch.

**Option A: Update Expo Go**
- Go to App Store/Play Store
- Update Expo Go to latest version

**Option B: Use Development Build**
```bash
npx expo prebuild
npx expo run:android  # or run:ios
```

---

## 🎯 **Step-by-Step Solution**

### Step 1: Stop Current Server
Press `Ctrl+C` in terminal to stop the current Expo server.

### Step 2: Clear Metro Cache
```bash
cd astro-voice-mobile
npx expo start --clear
```

### Step 3: Try Tunnel Mode (Best for Network Issues)
```bash
npx expo start --tunnel
```

**Wait for:** "Tunnel ready" message  
**Then:** Scan QR code with Expo Go

### Step 4: If Tunnel Doesn't Work, Try Web
```bash
npx expo start --web
```

This will open in browser to verify the app works.

---

## 🔍 **Detailed Diagnostics**

### Check 1: Network Connection
**Both phone and computer must be on same WiFi**

```bash
# On computer, get IP
ifconfig | grep "inet "

# Should show something like: 192.168.x.x
```

**On phone:** Connect to same WiFi network

### Check 2: Firewall
**Mac:** System Preferences → Security & Privacy → Firewall → Turn off or allow Node

**Windows:** Allow Node.js through Windows Firewall

### Check 3: Expo Go Version
**Update Expo Go app:**
- iOS: App Store → Updates → Expo Go
- Android: Play Store → Updates → Expo Go

### Check 4: Package Versions
```bash
cd astro-voice-mobile
npx expo-doctor
```

This will check for version mismatches.

---

## 🛠️ **Alternative Testing Methods**

### Method 1: Web Browser (Fastest Test)
```bash
npx expo start --web
```

Opens in browser. Limited but works for testing UI.

### Method 2: iOS Simulator (Mac Only)
```bash
npx expo start
# Press 'i' when Metro is ready
```

### Method 3: Android Emulator
```bash
npx expo start
# Press 'a' when Metro is ready
```

### Method 4: Development Build (Most Reliable)
```bash
# Install EAS CLI
npm install -g eas-cli

# Build for your device
eas build --profile development --platform android
# or
eas build --profile development --platform ios

# Install the .apk or .ipa on your device
```

---

## 📱 **Phone-Specific Fixes**

### Android
1. **Clear Expo Go Cache:**
   - Settings → Apps → Expo Go → Storage → Clear Cache
   - Settings → Apps → Expo Go → Storage → Clear Data

2. **Check Network Permissions:**
   - Settings → Apps → Expo Go → Permissions → Allow all

3. **Disable Mobile Data:**
   - Use WiFi only while testing

### iOS
1. **Clear Expo Go:**
   - Delete Expo Go app
   - Reinstall from App Store

2. **Trust Developer:**
   - Settings → General → VPN & Device Management

3. **Reset Network Settings:**
   - Settings → General → Reset → Reset Network Settings

---

## 🌐 **Network Troubleshooting**

### Issue: Can't Connect on Same WiFi

**Solution 1: Use Tunnel**
```bash
npx expo start --tunnel
```

**Solution 2: Use Direct IP**
```bash
# Get your IP
ifconfig | grep "inet " | grep -v 127.0.0.1
# Example output: 192.168.1.100

# Start with LAN
npx expo start --lan

# Manually enter in Expo Go:
exp://192.168.1.100:8081
```

**Solution 3: Check Router Settings**
- AP Isolation might be enabled
- Disable AP Isolation in router settings
- Or use tunnel mode

---

## 💡 **Pro Tips**

### Use Tunnel for Reliable Connection
```bash
npx expo start --tunnel --clear
```

**Pros:**
- Works on any network
- No IP/WiFi issues
- Most reliable

**Cons:**
- Slightly slower than LAN
- Requires internet

### Use Web for Quick UI Tests
```bash
npx expo start --web
```

**Pros:**
- Instant testing
- No phone needed
- No connection issues

**Cons:**
- Limited native features
- Can't test camera, etc.

### Use Emulator for Full Testing
**Best of both worlds:**
- No network issues
- Full native features
- Fast reload

---

## 📋 **Complete Reset Procedure**

If nothing works, do a complete reset:

```bash
# 1. Stop server
# Press Ctrl+C

# 2. Clean everything
cd astro-voice-mobile
rm -rf node_modules
rm -rf .expo
rm -rf ios/build
rm -rf android/build
rm package-lock.json
npm cache clean --force

# 3. Reinstall
npm install

# 4. Start with tunnel
npx expo start --tunnel --clear
```

---

## 🎯 **Recommended Solution for You**

Based on the error, try this in order:

1. **First: Use Tunnel (90% success rate)**
   ```bash
   npx expo start --tunnel --clear
   ```

2. **If tunnel fails: Use Web**
   ```bash
   npx expo start --web
   ```

3. **If you want phone testing: Use Emulator**
   ```bash
   # iOS
   npx expo start
   # Press 'i'
   
   # Android  
   npx expo start
   # Press 'a'
   ```

---

## 🆘 **Still Not Working?**

### Try Development Build
```bash
# This creates a standalone app
npx expo prebuild

# For Android
npx expo run:android

# For iOS (Mac only)
npx expo run:ios
```

This bypasses Expo Go completely and creates a native build.

---

## ✅ **Success Indicators**

You'll know it's working when you see:

1. **Metro Bundler:** "Bundling... 100%"
2. **No errors** in terminal
3. **QR Code** appears
4. **App loads** on phone without errors

---

## 📞 **Quick Commands Reference**

```bash
# Clear and restart
npx expo start --clear

# Use tunnel (most reliable)
npx expo start --tunnel

# Use web (fastest test)
npx expo start --web

# Use specific connection
npx expo start --lan
npx expo start --localhost

# Full clean restart
rm -rf node_modules .expo && npm install && npx expo start --tunnel
```

---

**Try tunnel mode first - it solves 90% of connection issues!** 🚀



