# EAS Build Setup Guide - Production App Store Deployment

**Date:** October 12, 2025  
**Status:** 🎯 **PRODUCTION-READY**

---

## 🚀 **OVERVIEW**

This guide walks you through setting up EAS Build to create production-ready apps for Google Play Store and Apple App Store deployment.

---

## 📋 **PREREQUISITES**

### **Required Accounts:**
- ✅ **Expo Account**: [Sign up at expo.dev](https://expo.dev)
- ✅ **Google Play Console**: $25 one-time registration
- ✅ **Apple Developer Account**: $99/year subscription

### **Development Environment:**
- ✅ **Node.js**: v18+ installed
- ✅ **Expo CLI**: Latest version
- ✅ **EAS CLI**: Will be installed during setup

---

## 🛠️ **STEP-BY-STEP SETUP**

### **Step 1: Install EAS CLI**
```bash
npm install -g eas-cli
```

### **Step 2: Login to Expo**
```bash
eas login
```
*Enter your Expo account credentials*

### **Step 3: Configure EAS Build**
```bash
cd /Users/nikhil/workplace/voice_v1/mobile
eas build:configure
```

### **Step 4: Review Configuration**
The following files will be created/updated:

#### **eas.json** (Already configured):
```json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### **app.json** (Already configured):
```json
{
  "expo": {
    "name": "Kundli - Astrology App",
    "slug": "astrology-app",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "backgroundColor": "#6366f1",
      "resizeMode": "contain"
    },
    "ios": {
      "bundleIdentifier": "com.astrovoice.kundli",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.astrovoice.kundli",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6366f1"
      }
    }
  }
}
```

---

## 📱 **BUILDING PRODUCTION APPS**

### **Android Build (Play Store):**
```bash
eas build --platform android --profile production
```

**Output:**
- ✅ **APK file** for testing
- ✅ **AAB file** for Play Store submission
- ✅ **Signed with your keystore**
- ✅ **Production-optimized**

### **iOS Build (App Store):**
```bash
eas build --platform ios --profile production
```

**Output:**
- ✅ **IPA file** for App Store submission
- ✅ **Signed with your certificates**
- ✅ **TestFlight ready**
- ✅ **App Store Connect compatible**

### **Both Platforms:**
```bash
eas build --platform all --profile production
```

---

## 🔐 **SIGNING & CERTIFICATES**

### **Android Signing:**
EAS Build automatically handles:
- ✅ **Keystore generation**
- ✅ **App signing**
- ✅ **Play Store compatibility**

### **iOS Signing:**
EAS Build automatically handles:
- ✅ **Certificate management**
- ✅ **Provisioning profiles**
- ✅ **App Store signing**

---

## 📦 **BUILD PROCESS**

### **What Happens During Build:**
1. **Code Compilation**
   - TypeScript compilation
   - React Native bundling
   - Asset optimization

2. **Native Compilation**
   - Android: Java/Kotlin compilation
   - iOS: Swift/Objective-C compilation

3. **Signing & Packaging**
   - Digital signatures
   - Store-compliant packaging
   - Optimization

4. **Artifact Generation**
   - APK/AAB for Android
   - IPA for iOS

---

## 🎯 **BUILD PROFILES**

### **Development Profile:**
- **Purpose**: Internal testing
- **Features**: Development client, debugging
- **Distribution**: Internal only

### **Preview Profile:**
- **Purpose**: Beta testing
- **Features**: Production-like build
- **Distribution**: Internal testing

### **Production Profile:**
- **Purpose**: Store submission
- **Features**: Optimized, signed
- **Distribution**: Public stores

---

## 📊 **BUILD MONITORING**

### **Build Status:**
```bash
# Check build status
eas build:list

# View specific build
eas build:view [BUILD_ID]
```

### **Build Logs:**
- **Real-time logs** during build process
- **Error details** if build fails
- **Performance metrics** and warnings

---

## 🚀 **SUBMISSION TO STORES**

### **Android Play Store:**
```bash
# Submit to Play Store
eas submit --platform android
```

### **iOS App Store:**
```bash
# Submit to App Store
eas submit --platform ios
```

---

## 💰 **COST BREAKDOWN**

### **EAS Build Pricing:**
- **Free Tier**: 30 builds/month
- **Production Tier**: $29/month (unlimited builds)
- **Enterprise**: Custom pricing

### **Store Fees:**
- **Google Play**: $25 one-time registration
- **Apple App Store**: $99/year developer account

---

## 🔧 **TROUBLESHOOTING**

### **Common Build Issues:**

#### **Build Fails:**
```bash
# Check build logs
eas build:view [BUILD_ID]

# Common fixes
eas build:configure
```

#### **Signing Issues:**
```bash
# Reset certificates
eas credentials

# Clear cache
eas build --clear-cache
```

#### **Asset Issues:**
- ✅ Verify all assets exist in `assets/` folder
- ✅ Check file paths in `app.json`
- ✅ Ensure proper image formats

---

## 📈 **BUILD OPTIMIZATION**

### **Performance Tips:**
- ✅ **Image Optimization**: Use WebP format
- ✅ **Bundle Size**: Remove unused dependencies
- ✅ **Code Splitting**: Optimize imports
- ✅ **Asset Compression**: Compress images/videos

### **Build Speed:**
- ✅ **Use M1 Macs**: Faster builds
- ✅ **Parallel Builds**: Multiple platforms
- ✅ **Caching**: Enable build caching

---

## 🎯 **SUCCESS METRICS**

### **Build Success Indicators:**
- ✅ **Build completes** without errors
- ✅ **Artifacts generated** successfully
- ✅ **Signing successful** for both platforms
- ✅ **Store compatibility** verified

### **Quality Checks:**
- ✅ **App launches** on target devices
- ✅ **All features** work as expected
- ✅ **Performance** meets requirements
- ✅ **Store guidelines** compliance

---

## 🔄 **CONTINUOUS DEPLOYMENT**

### **Automated Builds:**
```bash
# GitHub Actions integration
eas build --platform all --non-interactive
```

### **Version Management:**
- ✅ **Semantic versioning** (1.0.0)
- ✅ **Build numbers** auto-increment
- ✅ **Changelog** tracking

---

## 📞 **SUPPORT RESOURCES**

### **Documentation:**
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Store Submission Guide](https://docs.expo.dev/submit/introduction/)

### **Community:**
- [Expo Discord](https://discord.gg/expo)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

---

## 🎉 **FINAL RESULT**

After completing this setup, you'll have:

- ✅ **Production-ready Android app** (APK/AAB)
- ✅ **Production-ready iOS app** (IPA)
- ✅ **Store-compliant apps** ready for submission
- ✅ **Automated build pipeline** for updates
- ✅ **Professional deployment** process

---

**The web version is perfect for development, but EAS Build is the ONLY way to get your app into the actual app stores!**

---

**Last Updated:** October 12, 2025  
**Author:** Cursor AI Assistant  
**Status:** 🎯 **PRODUCTION-READY**
