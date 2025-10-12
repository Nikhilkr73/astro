# App Testing Guide

**Created:** October 9, 2025  
**Status:** Ready to Test!

---

## 🚀 Quick Start

The Expo server is starting! Once it's ready:

### On Your Phone:
1. **Install Expo Go** app from App Store/Play Store
2. **Scan the QR code** that appears in terminal
3. **App will load** on your device

### On Computer:
- **iOS Simulator:** Press `i` in terminal
- **Android Emulator:** Press `a` in terminal
- **Web:** Press `w` in terminal (limited functionality)

---

## 🎯 Testing Flows

### Flow 1: Skip to Home (Fastest)
```
Splash Screen (3s auto-advance)
  ↓
Login Screen → Click "Skip for now"
  ↓
Home Screen (with bottom tabs)
```

**Test this flow to quickly explore all features!**

### Flow 2: Full Authentication Flow
```
Splash Screen (3s)
  ↓
Login Screen
  → Enter phone: 9876543210
  → Enter OTP: 123456 (NOT 111111)
  ↓
Onboarding Form (3 steps)
  → Name: Your Name
  → Gender: Male/Female/Other
  → DOB: 01/01/2000
  → Time: 10:00 AM
  → Place: Mumbai
  ↓
Home Screen with tabs
```

### Flow 3: Full User Journey
```
1. Home Tab
   → Browse astrologers
   → Filter by category
   → Click astrologer card
   → View profile
   → Click "Start Chat"
   → Send messages
   → End session

2. Chat History Tab
   → View past chats
   → Click to view details

3. Wallet Tab
   → View balance (₹500)
   → Select recharge amount
   → Click "Proceed to Pay"
   → See success screen
   → Go to "Transaction History"

4. Profile Tab
   → View profile
   → Browse menu items
   → (Logout when ready)
```

---

## 🎨 What to Look For

### Visual Design
✅ Orange primary color (#FF6B00)
✅ Cream background (#FFFDF9)
✅ Poppins font family
✅ Smooth animations
✅ Proper spacing and shadows

### Interactions
✅ Smooth screen transitions
✅ Bottom tab changes
✅ Back buttons work
✅ Forms validate properly
✅ Buttons have active states
✅ Scrolling is smooth

### Features to Test

**Home Screen:**
- [ ] Category filters (horizontal scroll)
- [ ] Astrologer list (vertical scroll)
- [ ] Online/offline indicators
- [ ] Wallet balance display
- [ ] Offer banner

**Astrologer Profile:**
- [ ] Large avatar
- [ ] Stats display
- [ ] Languages and specialties
- [ ] Start chat button

**Chat Screen:**
- [ ] Send messages
- [ ] Receive auto-responses
- [ ] Session timer counting
- [ ] Wallet balance decreasing (if TEST_MODE enabled)
- [ ] Quick reply suggestions
- [ ] End session dialog
- [ ] Minimize functionality

**Wallet:**
- [ ] Recharge amount selection
- [ ] Amount highlighting
- [ ] Proceed to payment
- [ ] Transaction status screens

**Profile:**
- [ ] User info display
- [ ] Menu items clickable

---

## 🐛 Quick Troubleshooting

### App won't load?
```bash
# Kill the process and restart
cd astro-voice-mobile
npm start -- --clear
```

### White screen?
- **Wait 5-10 seconds** for fonts to load
- Check terminal for errors
- Try shaking device → Reload

### Navigation not working?
- Check console logs
- Try going back and forward
- Restart app

### Fonts look wrong?
- Fonts are loading on first launch
- Restart app if needed

---

## 📱 Device Testing

### On iOS:
- Test on iPhone with notch (safe areas)
- Test on older iPhone (non-notch)
- Test dark mode toggle (system setting)

### On Android:
- Test on different screen sizes
- Test back button behavior
- Test keyboard behavior

---

## 🎯 What's Working

✅ **All 11 screens** are navigation-ready
✅ **Bottom tabs** work
✅ **Nested navigation** (Home→Profile→Chat)
✅ **Authentication flow** (Splash→Login→Onboarding→Main)
✅ **Form validation** in login and onboarding
✅ **Auto-responses** in chat (simulated)
✅ **Session timer** in chat
✅ **All UI components** (buttons, inputs, cards, badges)

---

## ⚠️ What's Not Connected Yet

❌ Real authentication (using mock)
❌ Real astrologer data (using sample data)
❌ WebSocket for chat (simulated responses)
❌ Payment gateway (simulated success)
❌ API calls (all local)
❌ Push notifications
❌ Image uploads
❌ Location services

**These will be connected to backend next!**

---

## 💡 Testing Tips

1. **Start with Skip** to quickly see everything
2. **Test all tabs** before going deep
3. **Try the chat feature** - it's fully interactive!
4. **Check wallet flow** - recharge works end-to-end
5. **Go back and forth** between screens
6. **Test form validation** - try invalid inputs

---

## 📸 Expected Behavior

### Splash Screen (3 seconds)
- Orange logo with star icon
- "Kundli" text
- "Your Stars. Your Guidance." tagline
- Bouncing dots animation
- Auto-advances

### Login Screen
- Phone input with +91 prefix
- OTP input (6 boxes)
- Resend timer (30 seconds)
- Skip button for testing
- Terms & Privacy links

### Home Screen
- Wallet button (top right)
- Offer banner
- Category filters (swipe left/right)
- Astrologer cards
- Online status badges
- Chat/Call buttons

### Chat Screen
- Messages with bubbles
- Session timer (top)
- Wallet balance (top)
- Quick replies (bottom)
- Message input
- Send button
- End session button
- Auto-responses after 1.5s

### Wallet Screen
- Big balance card
- 6 recharge options (grid)
- Selected amount highlighted
- Offers section
- Benefits list
- Fixed bottom CTA

### Profile Screen
- User avatar
- Name, phone, email
- 8 menu items
- App version
- Logout button

---

## 🎊 Success Indicators

You'll know it's working when:
1. ✅ Splash auto-advances after 3 seconds
2. ✅ Skip login takes you straight to home
3. ✅ Bottom tabs switch smoothly
4. ✅ Astrologer profile opens when clicked
5. ✅ Chat screen works with messages
6. ✅ Wallet screens flow correctly
7. ✅ Everything looks beautiful and professional!

---

## 🔜 Next Steps

Once testing looks good:
1. ✅ **Test thoroughly** (you are here!)
2. 🔄 **Fix any issues** found
3. 🔌 **Connect backend** (next step)
4. 🧪 **Test with real data**
5. 🚀 **Deploy to TestFlight/Play Console**

---

## 📞 Need Help?

If something doesn't work:
1. Check terminal for error messages
2. Try clearing cache: `npm start -- --clear`
3. Check NAVIGATION_SETUP.md for details
4. Post errors in console/terminal

---

**Happy Testing! 🎉**

Your app is fully functional (with mock data) and ready to explore!


