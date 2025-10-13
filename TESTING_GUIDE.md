# AstroVoice Testing Guide

**Date:** October 12, 2025  
**Version:** 1.0.0  
**Status:** 🎯 **PRODUCTION-READY**

---

## 📋 **TESTING OVERVIEW**

This guide provides comprehensive testing procedures for the AstroVoice application across all platforms and deployment scenarios.

---

## 🎯 **TESTING PHASES**

### **Phase 1: Development Testing (Web)**
- ✅ **Platform**: Web browser (Chrome/Safari/Firefox)
- ✅ **Purpose**: Feature development, bug fixes, rapid iteration
- ✅ **Access**: `http://localhost:8081`

### **Phase 2: Production Testing (EAS Build)**
- ✅ **Platform**: Native Android/iOS apps
- ✅ **Purpose**: Production-ready app store deployment
- ✅ **Access**: APK/IPA files from EAS Build

---

## 🚀 **QUICK START TESTING**

### **Start Backend Server:**
```bash
cd /Users/nikhil/workplace/voice_v1
python3 -m backend
```

### **Start Web Development Server:**
```bash
cd /Users/nikhil/workplace/voice_v1/mobile
npx expo start --web --clear
```

### **Access Application:**
- **Web**: `http://localhost:8081`
- **Backend API**: `http://localhost:8000`

---

## 🧪 **FEATURE TESTING CHECKLIST**

### **✅ User Registration & Onboarding**
- [ ] **Profile Creation**
  - [ ] Fill all required fields (name, DOB, time, place, gender)
  - [ ] Submit registration form
  - [ ] Verify success message
  - [ ] Check wallet balance appears (₹100 initial)

### **✅ Astrologer Selection**
- [ ] **Astrologer List**
  - [ ] View available astrologers
  - [ ] Check astrologer details (name, specialty, rating)
  - [ ] Verify astrologer images load correctly
  - [ ] Confirm call/chat buttons are enabled

### **✅ Text Chat Functionality**
- [ ] **Chat Session**
  - [ ] Select astrologer and start chat
  - [ ] Send text messages
  - [ ] Receive AI responses (not hardcoded)
  - [ ] Verify message history persists
  - [ ] Test scrolling in chat window
  - [ ] Confirm input field remains visible

### **✅ Voice Call Functionality**
- [ ] **Voice Call Session**
  - [ ] Click "Call" button on astrologer
  - [ ] Grant microphone permissions
  - [ ] Speak to astrologer
  - [ ] Receive voice responses
  - [ ] Verify audio playback works
  - [ ] Test call timer functionality
  - [ ] End call properly

### **✅ Wallet & Payment System**
- [ ] **Wallet Management**
  - [ ] View current balance
  - [ ] Verify balance updates after calls
  - [ ] Check balance persistence
  - [ ] Test insufficient balance scenarios

---

## 🌐 **WEB PLATFORM TESTING**

### **Browser Compatibility:**
- [ ] **Chrome** (Primary)
- [ ] **Safari** (iOS compatibility)
- [ ] **Firefox** (Alternative)
- [ ] **Edge** (Windows compatibility)

### **Web-Specific Features:**
- [ ] **Audio Recording**
  - [ ] Microphone access permission
  - [ ] Audio recording quality
  - [ ] Audio playback quality
- [ ] **Responsive Design**
  - [ ] Mobile viewport (375px width)
  - [ ] Tablet viewport (768px width)
  - [ ] Desktop viewport (1024px width)
- [ ] **Scrolling**
  - [ ] Chat window scrolls properly
  - [ ] Input field stays visible
  - [ ] Smooth scroll behavior

---

## 📱 **MOBILE PLATFORM TESTING (EAS Build)**

### **Android Testing:**
- [ ] **APK Installation**
  - [ ] Download APK from EAS Build
  - [ ] Install on Android device
  - [ ] Launch application
- [ ] **Core Functionality**
  - [ ] All features work as expected
  - [ ] No native module errors
  - [ ] Proper permissions handling
- [ ] **Performance**
  - [ ] App launch time
  - [ ] Memory usage
  - [ ] Battery consumption

### **iOS Testing:**
- [ ] **IPA Installation**
  - [ ] Download IPA from EAS Build
  - [ ] Install via TestFlight or Xcode
  - [ ] Launch application
- [ ] **Core Functionality**
  - [ ] All features work as expected
  - [ ] iOS-specific UI elements
  - [ ] Proper permissions handling

---

## 🔧 **API TESTING**

### **Backend Endpoints:**
- [ ] **Health Check**
  - [ ] `GET /health` returns 200
- [ ] **User Registration**
  - [ ] `POST /api/users/register` accepts all fields
  - [ ] Returns user data with wallet balance
- [ ] **Astrologers**
  - [ ] `GET /api/astrologers` returns formatted data
  - [ ] No external image URL errors
- [ ] **Chat**
  - [ ] `POST /api/chat/start` accepts JSON body
  - [ ] `POST /api/chat/message` processes messages
- [ ] **Wallet**
  - [ ] `GET /api/wallet/{user_id}` returns balance
- [ ] **Voice Call**
  - [ ] WebSocket connection at `/mobile/ws/{user_id}`
  - [ ] Audio streaming works
  - [ ] Real-time communication

---

## 🐛 **ERROR SCENARIOS TESTING**

### **Network Errors:**
- [ ] **Offline Mode**
  - [ ] App behavior without internet
  - [ ] Error messages displayed
  - [ ] Graceful degradation
- [ ] **API Failures**
  - [ ] 404 errors handled
  - [ ] 422 validation errors handled
  - [ ] 500 server errors handled

### **Permission Errors:**
- [ ] **Microphone Access**
  - [ ] Permission denied scenario
  - [ ] Permission revoked during call
  - [ ] Fallback to text chat
- [ ] **Camera Access** (if implemented)
  - [ ] Permission handling
  - [ ] Fallback behavior

### **Input Validation:**
- [ ] **Form Validation**
  - [ ] Empty required fields
  - [ ] Invalid date formats
  - [ ] Invalid phone numbers
  - [ ] Special character handling

---

## 📊 **PERFORMANCE TESTING**

### **Load Testing:**
- [ ] **Multiple Users**
  - [ ] 10 concurrent users
  - [ ] 50 concurrent users
  - [ ] 100 concurrent users
- [ ] **Resource Usage**
  - [ ] Memory consumption
  - [ ] CPU usage
  - [ ] Database connections

### **Stress Testing:**
- [ ] **Long Sessions**
  - [ ] 1-hour voice calls
  - [ ] 100+ message chat sessions
  - [ ] Continuous usage patterns

---

## 🔒 **SECURITY TESTING**

### **Data Protection:**
- [ ] **User Data**
  - [ ] Personal information encrypted
  - [ ] No sensitive data in logs
  - [ ] Secure API communications
- [ ] **Authentication**
  - [ ] Session management
  - [ ] Token expiration
  - [ ] Secure storage

---

## 📈 **ANALYTICS & MONITORING**

### **Application Metrics:**
- [ ] **Usage Tracking**
  - [ ] User registration rate
  - [ ] Feature usage statistics
  - [ ] Error rates and types
- [ ] **Performance Metrics**
  - [ ] Response times
  - [ ] Success rates
  - [ ] Crash reports

---

## 🚀 **DEPLOYMENT TESTING**

### **EAS Build Process:**
- [ ] **Configuration**
  - [ ] `eas.json` properly configured
  - [ ] `app.json` has correct bundle IDs
  - [ ] Assets and icons present
- [ ] **Build Commands**
  - [ ] `eas build --platform android --profile production`
  - [ ] `eas build --platform ios --profile production`
  - [ ] Build artifacts generated successfully

### **Store Submission:**
- [ ] **Android Play Store**
  - [ ] AAB file generated
  - [ ] App signing verified
  - [ ] Store listing prepared
- [ ] **iOS App Store**
  - [ ] IPA file generated
  - [ ] Certificates valid
  - [ ] TestFlight ready

---

## 📝 **TESTING REPORT TEMPLATE**

### **Test Execution:**
```
Date: [DATE]
Tester: [NAME]
Platform: [WEB/ANDROID/iOS]
Build Version: [VERSION]

Features Tested:
- [ ] User Registration: [PASS/FAIL]
- [ ] Astrologer Selection: [PASS/FAIL]
- [ ] Text Chat: [PASS/FAIL]
- [ ] Voice Calls: [PASS/FAIL]
- [ ] Wallet System: [PASS/FAIL]

Issues Found:
1. [ISSUE DESCRIPTION]
2. [ISSUE DESCRIPTION]

Overall Status: [PASS/FAIL]
```

---

## 🎯 **SUCCESS CRITERIA**

### **Development Phase (Web):**
- ✅ All features functional
- ✅ No critical bugs
- ✅ Responsive design
- ✅ Cross-browser compatibility

### **Production Phase (Mobile):**
- ✅ Native app builds successfully
- ✅ All features work on mobile
- ✅ Performance acceptable
- ✅ Ready for store submission

---

## 🔄 **CONTINUOUS TESTING**

### **Automated Testing:**
- [ ] **Unit Tests**
  - [ ] Backend API endpoints
  - [ ] Frontend components
  - [ ] Utility functions
- [ ] **Integration Tests**
  - [ ] End-to-end user flows
  - [ ] API integration
  - [ ] Database operations

### **Manual Testing Schedule:**
- **Daily**: Development testing on web
- **Weekly**: Mobile build testing
- **Before Release**: Full regression testing
- **After Release**: Post-deployment monitoring

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues:**
1. **Audio not working**: Check microphone permissions
2. **Chat not scrolling**: Verify HTML/CSS implementation
3. **API errors**: Check backend server status
4. **Build failures**: Verify EAS configuration

### **Debug Tools:**
- **Web**: Browser developer tools
- **Mobile**: React Native debugger
- **Backend**: Log files in `backend.log`

---

**Last Updated:** October 12, 2025  
**Author:** Cursor AI Assistant  
**Status:** 🎯 **PRODUCTION-READY**
