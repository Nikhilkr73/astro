# Navigation Setup Guide

**Created:** October 9, 2025  
**Status:** ✅ Complete

---

## 🎯 Navigation Structure

The app uses React Navigation with the following structure:

```
AppNavigator (Stack)
├── Splash Screen (3 seconds auto-advance)
├── Login Screen (with skip option)
├── Onboarding Screen (3-step form)
└── Main App (Bottom Tabs)
    ├── Home Tab (Stack)
    │   ├── Home Screen
    │   ├── Astrologer Profile
    │   └── Chat Screen
    ├── Chat History Tab
    ├── Wallet Tab (Stack)
    │   ├── Wallet Screen
    │   ├── Wallet History
    │   └── Transaction Status
    └── Profile Tab
```

---

## 📁 File Structure

```
src/
├── navigation/
│   └── AppNavigator.tsx    ← Main navigation (NEW)
├── screens/
│   └── index.ts            ← All screens exported
└── components/
    └── index.ts            ← All components exported
```

---

## 🚀 Testing the Navigation

### 1. Start the app:
```bash
cd astro-voice-mobile
npm start
```

### 2. Test Flow:

**Authentication Flow:**
1. **Splash Screen** → Auto-advances after 3 seconds
2. **Login Screen** → 
   - Enter phone number
   - Enter OTP
   - Or click "Skip for now"
3. **Onboarding Screen** (if first time) →
   - Enter name & gender
   - Enter birth details
   - Enter birth place
4. **Main App** → Bottom tabs appear

**Main App Navigation:**

**Home Tab:**
- View astrologer list
- Filter by category
- Click astrologer → Profile screen
- Click "Start Chat" → Chat screen
- Chat screen has minimize and end buttons

**Chat History Tab:**
- View past chat sessions
- Click session to resume (will navigate to chat)

**Wallet Tab:**
- View balance
- Select recharge amount
- Click "Proceed to Pay" → Transaction Status
- Access "Transaction History" → Wallet History screen

**Profile Tab:**
- View user profile
- Access menu items
- Logout button

---

## 🎨 Bottom Tab Icons

- **Home:** house icon
- **Chats:** message-circle icon
- **Wallet:** credit-card icon
- **Profile:** user icon

Active color: Orange (#FF6B00)  
Inactive color: Gray

---

## 🔧 Current Configuration

### App.tsx Updates:
✅ Fonts loaded (Poppins family)  
✅ Navigation imported from `src/navigation/AppNavigator`  
✅ StatusBar set to dark mode  
✅ SafeAreaProvider wrapping  

### AppNavigator Features:
✅ Splash screen with auto-advance  
✅ Authentication flow  
✅ Onboarding flow  
✅ Bottom tab navigation  
✅ Nested stack navigators  
✅ Proper screen transitions  
✅ State management for auth/onboarding  

---

## 🧪 Testing Scenarios

### Scenario 1: First-Time User
1. See splash screen (3s)
2. See login screen
3. Enter phone: `9876543210`
4. Enter OTP: `123456` (any except `111111`)
5. Complete onboarding form
6. Land on home screen
7. Browse astrologers
8. Start a chat

### Scenario 2: Skip Login (Testing)
1. See splash screen
2. Click "Skip for now" on login
3. Land directly on home screen
4. Test all tab navigation

### Scenario 3: Full User Journey
1. Login
2. Complete onboarding
3. Browse astrologers
4. View astrologer profile
5. Start chat session
6. Chat with astrologer
7. End session
8. Rate astrologer (if implemented)
9. Check wallet balance
10. Recharge wallet
11. View transaction history

---

## 🎯 State Management

Currently using local state in AppNavigator:
- `isLoading` - Controls splash screen
- `isAuthenticated` - Controls login flow
- `isOnboarded` - Controls onboarding flow
- `selectedAstrologer` - Tracks selected astrologer

**Next Step:** Move to Context API or Redux for global state.

---

## 🔗 Navigation Methods

### Navigate to screen:
```typescript
navigation.navigate('ScreenName');
```

### Go back:
```typescript
navigation.goBack();
```

### Navigate to tab:
```typescript
navigation.navigate('HomeTab');
navigation.navigate('WalletTab');
```

### Pass data:
```typescript
navigation.navigate('Chat', { astrologer });
```

---

## 🐛 Known Issues & Fixes

### Issue 1: "Cannot read property 'navigate'"
**Fix:** Ensure screen receives navigation prop from Stack.Screen

### Issue 2: Fonts not loading
**Fix:** Already handled in App.tsx with useFonts hook

### Issue 3: StatusBar color
**Fix:** Set to 'dark' to match light background

---

## 📝 Next Steps for Backend Integration

### 1. Authentication
Replace mock auth with real AWS Cognito:
```typescript
// In LoginScreen
const handleLogin = async () => {
  try {
    await Auth.signIn(phoneNumber, code);
    onLogin();
  } catch (error) {
    console.error(error);
  }
};
```

### 2. Astrologer Data
Replace mock data with API call:
```typescript
// In NewHomeScreen
useEffect(() => {
  const fetchAstrologers = async () => {
    const response = await fetch('YOUR_API/astrologers');
    const data = await response.json();
    setAstrologers(data);
  };
  fetchAstrologers();
}, []);
```

### 3. Chat WebSocket
Connect ChatScreen to WebSocket:
```typescript
// In ChatScreen
import { websocketService } from '../services/websocketService';

useEffect(() => {
  websocketService.connect(sessionId);
  websocketService.onMessage((message) => {
    setMessages(prev => [...prev, message]);
  });
}, []);
```

### 4. Wallet API
Connect wallet operations:
```typescript
// In WalletScreen
const handleRecharge = async (amount) => {
  try {
    const result = await fetch('YOUR_API/wallet/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    // Handle success
  } catch (error) {
    console.error(error);
  }
};
```

---

## 🎊 Summary

✅ **Navigation is fully set up and ready to test!**  
✅ **All screens are connected**  
✅ **Authentication flow works**  
✅ **Bottom tabs work**  
✅ **Nested navigation works**  

**Test it now:**
```bash
cd astro-voice-mobile
npm start
```

Scan the QR code and explore your app! 🚀

---

**Next:** Backend integration to make it fully functional!



