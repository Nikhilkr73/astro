# 📱 AstroVoice APK Creation Guide

**Last Updated:** October 20, 2025  
**Status:** Ready for APK Creation

---

## 🚀 **Quick Start (Recommended)**

### **Option 1: EAS Build (Cloud-based) - Best for Production**

1. **Create Expo Account** (Free):
   - Visit [expo.dev](https://expo.dev) and sign up
   - No credit card required for basic builds

2. **Run the APK creation script**:
   ```bash
   cd /Users/nikhil/workplace/voice_v1/mobile
   ./create_apk.sh
   ```
   - Choose option 1 (EAS Build)
   - Login with your Expo account
   - Wait for build to complete (5-10 minutes)

3. **Download APK**:
   - You'll get a download link when build completes
   - Install APK directly on your Android device

### **Option 2: Expo Go (Quick Testing) - No APK Needed**

1. **Install Expo Go** on your Android phone from Play Store
2. **Run development server**:
   ```bash
   cd /Users/nikhil/workplace/voice_v1/mobile
   npx expo start
   ```
3. **Scan QR code** with Expo Go app
4. **Test immediately** - changes reflect in real-time

---

## 📋 **Prerequisites Check**

Your project is ready for APK creation:

- ✅ **App Configuration**: `app.json` properly configured
- ✅ **Build Configuration**: `eas.json` ready
- ✅ **Assets**: All required icons and splash screens present
- ✅ **Dependencies**: All packages installed
- ✅ **Package Name**: `com.astrovoice.kundli`
- ✅ **App Name**: "Kundli - Astrology App"
- ✅ **Version**: 1.0.0

---

## 🔧 **Detailed Setup Instructions**

### **EAS Build Setup (Recommended)**

1. **Install EAS CLI**:
   ```bash
   # Try these methods in order:
   sudo npm install -g eas-cli
   # OR
   npm install -g eas-cli --user
   # OR use npx (no installation)
   npx eas-cli --version
   ```

2. **Login to Expo**:
   ```bash
   cd /Users/nikhil/workplace/voice_v1/mobile
   eas login
   # OR with npx
   npx eas-cli login
   ```

3. **Build APK**:
   ```bash
   # For testing (smaller, faster)
   eas build --platform android --profile preview
   
   # For production (optimized, larger)
   eas build --platform android --profile production
   ```

### **Local Build Setup (Advanced)**

If you want to build locally:

1. **Install Android Studio**:
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK, build tools, and platform tools

2. **Set up environment**:
   ```bash
   # Add to your ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Build APK**:
   ```bash
   cd /Users/nikhil/workplace/voice_v1/mobile
   npx expo run:android --variant release
   ```

---

## 📱 **Testing Your APK**

### **Installation**

1. **Enable Unknown Sources** on your Android device:
   - Settings → Security → Install unknown apps
   - Allow installation from your file manager

2. **Install APK**:
   - Download APK to your phone
   - Tap to install
   - Follow installation prompts

### **Testing Checklist**

- ✅ **App launches** without crashes
- ✅ **Splash screen** displays correctly
- ✅ **Navigation** works between screens
- ✅ **Voice recording** functions properly
- ✅ **Backend connection** works (if testing with live backend)
- ✅ **UI elements** display correctly
- ✅ **Performance** is smooth

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Build Fails**
```bash
# Check build logs
eas build:view [BUILD_ID]

# Common fixes
eas build:configure
```

#### **APK Won't Install**
- Enable "Unknown Sources" in Android settings
- Check if APK is corrupted (re-download)
- Ensure device has enough storage space

#### **App Crashes on Launch**
- Check device compatibility (Android 6.0+)
- Verify all dependencies are included
- Check console logs for errors

#### **EAS CLI Issues**
```bash
# Clear cache
eas build --clear-cache

# Reset credentials
eas credentials
```

---

## 📊 **Build Profiles**

Your project has three build profiles configured:

### **Development**
- **Purpose**: Internal testing with debugging
- **Size**: Larger (includes debug symbols)
- **Features**: Hot reload, debugging tools

### **Preview**
- **Purpose**: Beta testing, sharing with testers
- **Size**: Medium
- **Features**: Production-like but with some debugging

### **Production**
- **Purpose**: App store submission
- **Size**: Smallest (optimized)
- **Features**: Fully optimized, no debugging

---

## 💰 **Cost Information**

### **EAS Build Pricing**
- **Free Tier**: 30 builds/month
- **Production Tier**: $29/month (unlimited builds)
- **Your Usage**: Free tier should be sufficient for testing

### **Store Fees** (Future)
- **Google Play**: $25 one-time registration
- **Apple App Store**: $99/year developer account

---

## 🎯 **Next Steps After APK Creation**

1. **Test thoroughly** on different devices
2. **Fix any bugs** found during testing
3. **Update version number** for next build
4. **Prepare for store submission** (if ready)
5. **Set up automated builds** for future updates

---

## 📞 **Support Resources**

- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
- **EAS Build Guide**: [docs.expo.dev/build/introduction/](https://docs.expo.dev/build/introduction/)
- **Android Setup**: [developer.android.com](https://developer.android.com)

---

## 🎉 **Success Indicators**

You'll know the APK creation was successful when:

- ✅ **Build completes** without errors
- ✅ **APK file** is generated and downloadable
- ✅ **APK installs** on Android device
- ✅ **App launches** and functions properly
- ✅ **All features** work as expected

---

**Ready to create your APK? Run: `./create_apk.sh` and follow the prompts!**
