# Google Play Purchase Integration - Phase Approach

## Phase 1: Fix 405 Backend Error ✅ COMPLETED

### 1.1 Investigate routing issue ✅ DONE
- Checked `mobile/src/config/api.ts` for BASE_URL
- Verified mobile app calls main backend on port 8000
- Confirmed `/api/wallet/verify-purchase` was missing from main backend

### 1.2 Fix backend routing ✅ DONE
- Copied verify-purchase endpoint from `mobile_api_service.py` lines 559-676 to main backend
- Added GooglePlayPurchase model and endpoint to `backend/api/mobile_endpoints.py`
- Restarted backend to load new endpoint

### 1.3 Test with current APK ✅ DONE
- Backend now responds correctly (no more 405 error)
- Endpoint returns proper error messages instead of "Method Not Allowed"
- APK installed and ready for testing

## Phase 2: Build App Bundle (AAB) for Google Play Console ✅ COMPLETED

### 2.1 Build AAB and APK with Android Studio ✅ COMPLETED
```bash
cd mobile/android
./gradlew assembleRelease    # For APK
./gradlew bundleRelease      # For AAB
```
- ✅ APK built successfully: `app-release.apk`
- ✅ AAB built successfully: `app-release.aab`
- ✅ Build time: ~9 minutes (much faster than EAS queue)
- ✅ Files ready for Google Play Console upload

### 2.1.1 Fix Debug Signing Issue ✅ COMPLETED
- **Problem**: Google Play Console rejected debug-signed APK/AAB
- **Solution**: Created release keystore and updated build.gradle
- ✅ Generated release keystore: `release-key.keystore`
- ✅ Updated signing configuration in `build.gradle`
- ✅ Rebuilt APK and AAB with proper release signing
- ✅ Verified both files are signed with release certificate
- ✅ Certificate: CN=AstroVoice, OU=Development, O=AstroVoice
- ✅ Valid until: March 11, 2053

### 2.2 Upload AAB to Google Play Console ⏳ NEXT STEP
- Create app in Google Play Console: "AstroVoice"
- Package name: `com.astrovoice.kundli`
- Upload AAB file (not APK) to closed testing
- Complete app store listing (basic info required)
- **Note**: AAB can be updated later with new builds

### 2.3 Create In-App Products (After APK Upload) ⏳ NEXT STEP
- Go to Monetize → Products → In-app products
- Create 4 consumable products:
  - astro_recharge_100 (₹100)
  - astro_recharge_500 (₹500)
  - astro_recharge_1000 (₹1000)
  - astro_recharge_2000 (₹2000)

### 2.4 Add test accounts ⏳ NEXT STEP
- Settings → License testing
- Add Gmail addresses for sandbox testing
- Enable "License Test Response: RESPOND_NORMALLY"

## Phase 3: Backend Google Play Integration ⏳ NEXT STEP

### 3.1 Service account setup (20 min) ⏳ PENDING
- Google Cloud Console → Create service account
- Download JSON credentials
- Save: `backend/credentials/google-play-service-account.json`
- Link in Play Console → API access

### 3.2 Configure backend ✅ PREPARED
- ✅ Created `backend/credentials/` directory
- ✅ Added credentials directory to `.gitignore`
- ✅ Google Play billing service exists and ready
- ✅ Environment configuration prepared in `.env`
- **Action needed**: Update `.env` with actual credentials path:
```
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=backend/credentials/google-play-service-account.json
GOOGLE_PLAY_PACKAGE_NAME=com.astrovoice.kundli
```

### 3.3 Verify database products ⏳ PENDING
- Query: `SELECT * FROM recharge_products WHERE platform='android';`
- Ensure product_id matches Google Play Console SKUs
- Verify bonus_percentage values set

## Phase 4: Mobile App - Enable Real IAP (After Google Play Setup)

### 4.1 Install react-native-iap ⏳ PENDING
```bash
cd mobile
npm install react-native-iap
```

### 4.2 Update billingService.ts ⏳ PENDING
- Uncomment IAP imports (lines 18-29)
- Replace mock methods with real Google Play calls:
  - init() → use initConnection()
  - loadProducts() → use getProducts()
  - purchaseProduct() → use requestPurchase()
  - finalizePurchase() → use finishTransaction()
  - disconnect() → use endConnection()

### 4.3 Ensure TEST_MODE disabled ⏳ PENDING
- Check `mobile/src/config/testMode.ts`
- Set MOCK_PURCHASES = false

### 4.4 Build with Android Studio (Local - Faster than EAS Queue) ✅ COMPLETED
- ✅ Successfully built APK and AAB using local Android Studio
- ✅ Build time: ~9 minutes (much faster than EAS queue)
- ✅ Files ready for Google Play Console upload

## Phase 5: Test Complete Flow ⏳ PENDING

### 5.1 Setup emulator ⏳ PENDING
- Sign in to Google Play Store with test account
- Verify test account in Console license testers

### 5.2 Test purchase ⏳ PENDING
- Open wallet → recharge
- Select amount
- Google Play billing UI appears
- Complete test purchase (no real charge)
- Verify wallet balance increases

### 5.3 Verify backend ⏳ PENDING
- Check logs for Google Play verification
- Confirm purchase acknowledged
- Verify transaction in database

## Files Modified

**Backend:**
- ✅ Added endpoint to `backend/api/mobile_endpoints.py`
- ✅ Created `backend/credentials/` directory
- ✅ Added credentials directory to `.gitignore`
- `.env` - Google Play credentials (pending)

**Mobile:**
- ✅ Built APK and AAB successfully
- `package.json` - add react-native-iap (pending)
- `src/services/billingService.ts` - enable real IAP (pending)
- `src/config/testMode.ts` - disable mocks (pending)

## Success Criteria

- ✅ No 405 error on verify-purchase
- ✅ APK and AAB built successfully
- [ ] Google Play billing dialog opens
- [ ] Test purchases work without real charges
- [ ] Wallet balance updates correctly
- [ ] Backend verifies with Google Play API
- [ ] No local Java memory issues (Android Studio build)

## Current Status

**Phase 1: ✅ COMPLETED** - Backend 405 error fixed
**Phase 2: ✅ COMPLETED** - APK and AAB built successfully
**Phase 3: ⏳ NEXT** - Google Play Console setup (requires user action)
**Phase 4: ⏸️ PENDING** - Backend Google Play integration
**Phase 5: ⏸️ PENDING** - Mobile app real IAP
**Phase 6: ⏸️ PENDING** - Complete flow testing

## Next Steps

1. **User Action Required**: Set up Google Play Console
   - Register app "AstroVoice" 
   - Upload AAB file to closed testing
   - Create 4 in-app products
   - Add test accounts

2. **Backend Integration**: Set up Google Play credentials
   - Create service account
   - Configure backend environment variables
   - Verify database products

3. **Mobile App**: Enable real IAP
   - Install react-native-iap
   - Update billingService.ts
   - Build with Android Studio (local)

## Progress Log

- **2024-01-XX**: Phase 1 completed - Fixed 405 backend error
- **2024-01-XX**: Added verify-purchase endpoint to main backend
- **2024-01-XX**: Backend now responds correctly to purchase verification requests
- **2024-01-XX**: APK installed and ready for testing
- **2024-01-XX**: Phase 3 backend integration prepared
- **2024-01-XX**: Created credentials directory and updated .gitignore
- **2024-01-XX**: Google Play billing service verified and ready
- **2024-01-XX**: Phase 2 completed - APK and AAB built successfully with Android Studio
- **2024-01-XX**: Build time: ~9 minutes (much faster than EAS queue)
- **2024-01-XX**: Files ready for Google Play Console upload

## File Locations

**APK File (for testing):**
```
/Users/nikhil/workplace/voice_v1/mobile/android/app/build/outputs/apk/release/app-release.apk
```

**AAB File (for Google Play Console):**
```
/Users/nikhil/workplace/voice_v1/mobile/android/app/build/outputs/bundle/release/app-release.aab
```

## Troubleshooting

### Node.js Issues with Android Studio
- **Problem**: Android Studio can't find Node.js
- **Solution**: Added Node.js path to `local.properties` and `gradle.properties`
- **Result**: Builds now work successfully

### Java Runtime Issues
- **Problem**: Gradle can't find Java Runtime
- **Solution**: Set `JAVA_HOME=/opt/homebrew/opt/openjdk@17`
- **Result**: Gradle builds now work correctly

### Build Performance
- **EAS Build**: 10-15 minutes + queue time
- **Android Studio Build**: ~9 minutes (local)
- **Recommendation**: Use Android Studio for faster builds