# 📱 APK Generation & Firebase App Distribution Guide

## 🎯 **Overview**
This guide helps you generate an APK for your AstroVoice mobile app and distribute it to testers via Firebase App Distribution.

## 🚀 **Step 1: Set Up EAS Build**

### **Option A: Web-based EAS Build (Recommended)**
1. Go to [expo.dev](https://expo.dev)
2. Sign in with your GitHub account
3. Create a new project or connect existing repository
4. Go to **"Builds"** section
5. Click **"Create a new build"**

### **Option B: CLI Setup (if permissions allow)**
```bash
# Install EAS CLI (if you have permissions)
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure
```

## 🔧 **Step 2: Configure Build Settings**

### **Build Configuration:**
- **Platform**: Android
- **Build Type**: APK (for testing)
- **Profile**: Preview (for internal testing)

### **Environment Variables:**
Set these in EAS Build:
```
EXPO_PUBLIC_API_URL=https://your-railway-url.up.railway.app
EXPO_PUBLIC_WEBSOCKET_URL=wss://your-railway-url.up.railway.app
```

## 📦 **Step 3: Generate APK**

### **Via Web Interface:**
1. In Expo dashboard, go to **"Builds"**
2. Click **"Create a new build"**
3. Select **"Android"** → **"APK"**
4. Select **"Preview"** profile
5. Click **"Build"**
6. Wait for build to complete (10-15 minutes)

### **Via CLI (if available):**
```bash
cd astro-voice-mobile
eas build --platform android --profile preview
```

## 🔥 **Step 4: Set Up Firebase App Distribution**

### **Create Firebase Project:**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: **"AstroVoice"**
4. Enable Google Analytics (optional)
5. Create project

### **Add Android App:**
1. In Firebase console, click **"Add app"**
2. Select **Android** icon
3. Enter package name: **`com.astrovoice.mobile`**
4. Enter app nickname: **"AstroVoice Mobile"**
5. Download **`google-services.json`**
6. Place it in `astro-voice-mobile/android/app/` (if using bare workflow)

## 📱 **Step 5: Configure Firebase App Distribution**

### **Enable App Distribution:**
1. In Firebase console, go to **"App Distribution"**
2. Click **"Get started"**
3. Upload your APK file
4. Add release notes
5. Add testers

### **Add Testers:**
1. Go to **"Testers & Groups"**
2. Create tester groups:
   - **"Internal Testers"** (your team)
   - **"Beta Testers"** (external testers)
3. Add tester emails
4. Send invitations

## 🎯 **Step 6: Upload APK to Firebase**

### **Manual Upload:**
1. Download APK from EAS Build
2. Go to Firebase App Distribution
3. Click **"Distribute app"**
4. Upload APK file
5. Add release notes
6. Select tester groups
7. Distribute

### **Automated Upload (Advanced):**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Upload APK
firebase appdistribution:distribute path/to/your-app.apk \
  --app YOUR_FIREBASE_APP_ID \
  --release-notes "Initial release for testing" \
  --testers "tester1@example.com,tester2@example.com"
```

## 📋 **Step 7: Tester Setup**

### **For Testers:**
1. **Accept invitation** from Firebase email
2. **Install Firebase App Tester** app from Play Store
3. **Sign in** with Google account
4. **Download and install** your APK
5. **Test the app** and provide feedback

### **Tester Instructions:**
```
1. Check your email for Firebase App Distribution invitation
2. Click "Accept invitation"
3. Install "Firebase App Tester" from Google Play Store
4. Sign in with your Google account
5. Download and install AstroVoice APK
6. Test voice chat functionality
7. Report any issues via Firebase feedback
```

## 🔧 **Step 8: Update Mobile App Configuration**

### **Production Configuration:**
Update `astro-voice-mobile/src/services/configService.ts`:

```typescript
const productionConfig: ApiConfig = {
  REST_API_URL: 'https://your-railway-url.up.railway.app',
  WEBSOCKET_API_URL: 'wss://your-railway-url.up.railway.app',
  REGION: 'ap-south-1',
};
```

### **Environment Variables:**
Set these in EAS Build:
```
EXPO_PUBLIC_API_URL=https://your-railway-url.up.railway.app
EXPO_PUBLIC_WEBSOCKET_URL=wss://your-railway-url.up.railway.app
```

## 📊 **Step 9: Monitor Distribution**

### **Firebase App Distribution Dashboard:**
- **View download statistics**
- **Monitor crash reports**
- **Collect tester feedback**
- **Track installation rates**

### **Key Metrics to Track:**
- ✅ **APK download count**
- ✅ **Installation success rate**
- ✅ **Crash reports**
- ✅ **Tester feedback**
- ✅ **Voice chat functionality**

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **APK Build Fails:**
   - Check EAS Build logs
   - Verify app.json configuration
   - Ensure all dependencies are compatible

2. **Firebase Upload Fails:**
   - Verify Firebase project setup
   - Check package name matches
   - Ensure proper permissions

3. **Testers Can't Install:**
   - Check if "Unknown sources" is enabled
   - Verify APK is not corrupted
   - Ensure Firebase App Tester is installed

4. **App Crashes on Launch:**
   - Check API endpoints are accessible
   - Verify environment variables
   - Test with development build first

## 🎯 **Success Checklist**

- ✅ **APK generated successfully**
- ✅ **Firebase project created**
- ✅ **App Distribution configured**
- ✅ **Testers added and invited**
- ✅ **APK uploaded to Firebase**
- ✅ **Testers can download and install**
- ✅ **Voice chat works in production**
- ✅ **Feedback collection working**

## 📈 **Next Steps**

1. **Monitor tester feedback**
2. **Fix reported issues**
3. **Create new builds with fixes**
4. **Expand tester group**
5. **Prepare for Play Store release**

## 💰 **Costs**

- **EAS Build**: Free for public projects
- **Firebase App Distribution**: Free
- **Firebase Analytics**: Free (up to limits)
- **Total**: $0 for testing phase

---

## 🎉 **Summary**

This setup gives you:
- ✅ **Professional APK distribution**
- ✅ **Easy tester management**
- ✅ **Crash reporting and analytics**
- ✅ **Feedback collection**
- ✅ **Version control**
- ✅ **Scalable testing process**

**Your testers will receive professional invitations and can easily install and test your app!** 📱
