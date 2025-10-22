# ⚠️ Expo Go IAP Limitation - Important!

**Error:** `E_IAP_NOT_AVAILABLE` and `PromiseResolve called on non-object`

## Why This Happens

**In-App Purchases (IAP) DO NOT work in Expo Go!** 

Expo Go is a sandbox app that doesn't include native billing modules required for Google Play or App Store purchases. This is a known limitation.

## How to Test IAP

You have 3 options:

### Option 1: EAS Development Build (Recommended)
```bash
cd mobile
eas build --profile development --platform android
```

This creates a development build with IAP support that you can install on your physical device.

### Option 2: Local Development Build
```bash
cd mobile
npx expo run:android
```

Requires Android Studio and Android SDK installed locally.

### Option 3: Production Build
```bash
cd mobile
eas build --profile production --platform android
```

Creates a production APK/AAB for testing.

## What Works in Expo Go

✅ **Everything else works:**
- UI and product selection
- Backend API calls
- Wallet balance display
- Transaction history
- Chat/voice sessions

❌ **Only IAP doesn't work:**
- `billingService.init()` fails
- `purchaseProduct()` fails
- Google Play billing unavailable

## Testing Strategy

### Phase 1: UI Testing (Expo Go - Current)
- Test product selection UI ✅
- Test 2-column layout ✅
- Test "Continue" button ✅
- Test bonus display ✅
- Mock the purchase flow if needed

### Phase 2: IAP Testing (Development Build)
- Build with EAS
- Install on physical device
- Test actual Google Play purchases
- Verify backend verification
- Confirm bonus logic

## Quick Mock for Development

If you want to test the flow in Expo Go, you can temporarily add a mock:

**File:** `mobile/src/services/billingService.ts`

```typescript
// At the top of the class
private isDevelopmentMode = __DEV__ && !this.isInitialized;

// In purchaseProduct method
if (this.isDevelopmentMode) {
  console.log('🧪 MOCK MODE: Simulating purchase');
  return {
    productId: productId,
    transactionId: `mock_${Date.now()}`,
    purchaseToken: `mock_token_${Date.now()}`,
    // ... other mock data
  } as ProductPurchase;
}
```

## Current Status

✅ **Implemented:**
- 2-column layout (looks pretty! 🎨)
- Product cards with selection
- Better error handling for IAP not available
- Clear error message guiding to EAS build

✅ **Next Step:**
Build with EAS to test actual IAP:
```bash
cd mobile
eas build --profile development --platform android
```

## Documentation

See full guide: `docs/guides/GOOGLE_PLAY_BILLING_INTEGRATION.md`

---

**TL;DR:** IAP doesn't work in Expo Go. Build with EAS or use `expo run:android` to test IAP. Everything else works fine! 🚀


