# 🚀 Real Google Play Testing - Step-by-Step Guide

**Date:** October 21, 2025  
**Status:** Ready for actual Google Play testing  
**Test Mode:** DISABLED ✅

---

## ✅ Current Status

- ✅ Backend implementation complete
- ✅ Mobile UI complete (2-column layout)
- ✅ Test mode DISABLED (real IAP enabled)
- ✅ 6 products configured (₹1, ₹50, ₹100, ₹200, ₹500, ₹1000)
- ✅ First-time ₹50 bonus logic ready
- ✅ Default wallet balance: ₹50

---

## 📋 Step-by-Step Testing Guide

### Phase 1: Google Play Console Setup (15-20 minutes)

#### Step 1: Create Products in Google Play Console

1. **Go to Google Play Console**
   - URL: https://play.google.com/console/
   - Select your app or create new app

2. **Navigate to In-app products**
   - Left menu → **Monetize** → **In-app products**
   - Click **Create product**

3. **Create 6 Products** (one by one):

**Product 1: ₹1 Test Product**
```
Product ID: astro_recharge_1
Name: ₹1 Test Recharge
Description: Test recharge for ₹1
Status: Active
Product type: Consumable
Default price: ₹1.00 INR
```

**Product 2: ₹50 Recharge**
```
Product ID: astro_recharge_50
Name: ₹50 Recharge
Description: Recharge your wallet with ₹50
Status: Active
Product type: Consumable
Default price: ₹50.00 INR
```

**Product 3: ₹100 Recharge**
```
Product ID: astro_recharge_100
Name: ₹100 Recharge
Description: Recharge your wallet with ₹100 and get 10% bonus
Status: Active
Product type: Consumable
Default price: ₹100.00 INR
```

**Product 4: ₹200 Recharge (Most Popular)**
```
Product ID: astro_recharge_200
Name: ₹200 Recharge
Description: Recharge your wallet with ₹200 and get 12.5% bonus - Most Popular!
Status: Active
Product type: Consumable
Default price: ₹200.00 INR
```

**Product 5: ₹500 Recharge**
```
Product ID: astro_recharge_500
Name: ₹500 Recharge
Description: Recharge your wallet with ₹500 and get 15% bonus
Status: Active
Product type: Consumable
Default price: ₹500.00 INR
```

**Product 6: ₹1000 Recharge**
```
Product ID: astro_recharge_1000
Name: ₹1000 Recharge
Description: Recharge your wallet with ₹1000 and get 20% bonus
Status: Active
Product type: Consumable
Default price: ₹1000.00 INR
```

⚠️ **CRITICAL:** Product IDs must match EXACTLY! Copy-paste from above.

#### Step 2: Set Up License Testing (Testing Without Real Money)

1. **Go to License testing**
   - Left menu → **Setup** → **License testing**

2. **Add test accounts**
   - Add your Gmail account(s)
   - These accounts can make test purchases WITHOUT real charges

3. **Save changes**

---

### Phase 2: Google Cloud API Setup (10-15 minutes)

#### Step 1: Enable Google Play Developer API

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/

2. **Select/Create Project**
   - Use existing project or create new one

3. **Enable API**
   - Search: "Google Play Android Developer API"
   - Click **Enable**

#### Step 2: Create Service Account

1. **Go to Credentials**
   - Left menu → **APIs & Services** → **Credentials**

2. **Create Service Account**
   - Click **Create Credentials** → **Service Account**
   - Name: `astrovoice-play-billing`
   - ID: Auto-generated
   - Click **Create and Continue**

3. **Skip role assignment** (optional)
   - Click **Continue**
   - Click **Done**

#### Step 3: Generate JSON Key

1. **Click on service account**
   - Find your newly created service account
   - Click on it

2. **Create Key**
   - Go to **Keys** tab
   - Click **Add Key** → **Create New Key**
   - Select **JSON**
   - Click **Create**
   - **File downloads automatically** 📥

3. **⚠️ IMPORTANT: Store JSON file securely**
   ```bash
   # Move to secure location (NOT in git repo!)
   mv ~/Downloads/astrovoice-*.json /path/to/secure/location/google-play-service-account.json
   ```

#### Step 4: Grant Play Console Access

1. **Back to Play Console**
   - URL: https://play.google.com/console/

2. **Go to Users and Permissions**
   - Left menu → **Users and permissions**

3. **Invite service account**
   - Click **Invite new users**
   - Email: Use service account email from JSON file (ends with `@*.iam.gserviceaccount.com`)
   - Permissions: Check **View app information and download bulk reports (read-only)**
   - Click **Invite user**

4. **Accept invitation**
   - Service account auto-accepts (no action needed)

---

### Phase 3: Backend Configuration (5 minutes)

#### Update .env file

```bash
# Edit your .env file
nano /Users/nikhil/workplace/voice_v1/.env

# Add these lines:
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=/path/to/google-play-service-account.json
GOOGLE_PLAY_PACKAGE_NAME=com.astrovoice.app
GOOGLE_PLAY_ENABLED=true
FIRST_RECHARGE_BONUS_AMOUNT=50.00
```

⚠️ **Use absolute path for JSON file!**

#### Restart Backend

```bash
cd /Users/nikhil/workplace/voice_v1
python3 main_openai_realtime.py
```

**Check logs for:**
```
✅ Google Play billing service initialized
```

---

### Phase 4: Build Mobile App for Testing (30-40 minutes)

#### ⚠️ CRITICAL: You MUST Upload APK to Play Console First!

Google Play IAP only works with apps that are:
1. Uploaded to Play Console (Internal Testing track is fine)
2. Published to at least Internal Testing
3. Installed from Play Console (or via build)

#### Option 1: EAS Build + Upload (Recommended)

**Step 1: Configure EAS**
```bash
cd /Users/nikhil/workplace/voice_v1/mobile

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure
```

**Step 2: Update app.json**

Add/verify these fields:
```json
{
  "expo": {
    "name": "AstroVoice",
    "slug": "astrovoice",
    "android": {
      "package": "com.astrovoice.app",
      "versionCode": 1,
      "permissions": [
        "com.android.vending.BILLING"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

**Step 3: Build APK/AAB**

```bash
# For Internal Testing (AAB - required for Play Console)
eas build --profile production --platform android

# Wait ~20 minutes for build
```

**Step 4: Download Build**
- Build completes → You get download link
- Download the .aab file (Android App Bundle)

**Step 5: Upload to Play Console** ⭐ CRITICAL

1. **Go to Play Console**
   - URL: https://play.google.com/console/

2. **Navigate to Testing → Internal testing**
   - Left menu → **Testing** → **Internal testing**
   - Click **Create new release**

3. **Upload AAB**
   - Click **Upload** 
   - Select your downloaded .aab file
   - Wait for upload to complete

4. **Fill Release Details**
   - Release name: "v1.0 - Wallet Testing"
   - Release notes: "Initial release with wallet and IAP"

5. **Add Testers**
   - Create test email list
   - Add your test account email
   - Save

6. **Review and Roll Out**
   - Click **Review release**
   - Click **Start rollout to Internal testing**
   - Confirm

7. **Wait for Processing** (~15-30 minutes)
   - Status changes to "Available"
   - You'll get an opt-in link

**Step 6: Install from Play Console**

1. **Open opt-in link on Android device**
   - You'll receive email with link
   - Or find in Play Console → Internal testing

2. **Opt-in as tester**
   - Click "Become a tester"
   - Opens Google Play Store

3. **Install app from Play Store**
   - App appears in Play Store
   - Install normally
   - ✅ Now IAP will work!

**Alternative: Install Development Build for Quick Testing**

After uploading AAB to Play Console, you can also install a development build for faster testing:

```bash
# Build development version (APK)
eas build --profile development --platform android

# Download APK
# Install on device directly
```

⚠️ **Note:** Even with development build, you still need AAB uploaded to Play Console for IAP to work!

#### Option 2: Local Build

**Prerequisites:**
- Android Studio installed
- Android SDK configured

**Build:**
```bash
cd /Users/nikhil/workplace/voice_v1/mobile
npx expo run:android
```

**Note:** Requires Android device connected via USB or emulator running

---

### Phase 5: Testing (The Fun Part!)

#### Test 1: First Purchase (₹1 Test Product)

**Steps:**
1. Open app on device
2. Navigate to Wallet screen
3. **Verify:** No "🧪 TEST MODE" badge (real IAP enabled)
4. Select ₹1 product
5. Tap "Continue (₹1)"
6. **Google Play dialog appears**
7. Select test account
8. Confirm purchase
9. **Wait for verification** (~2-3 seconds)
10. **Success alert appears**

**Expected Results:**
```
Alert: "Recharge Successful! 🎉"
Message:
  ₹1 added to your wallet
  
  🎉 Bonus: ₹50
  • First-time bonus: ₹50
  
  Total credited: ₹51

Balance: ₹50 (default) + ₹51 = ₹101 total
```

**Check Backend Logs:**
```
🛒 Purchase verification started
✅ Google Play verification successful
✅ First-time bonus applied: ₹50
✅ Total credited: ₹51
✅ New balance: ₹101
```

**Check Database:**
```sql
SELECT * FROM wallets WHERE user_id = 'your_user_id';
-- balance should be 101.00

SELECT * FROM first_recharge_bonuses WHERE user_id = 'your_user_id';
-- should have one record

SELECT * FROM transactions WHERE user_id = 'your_user_id' ORDER BY created_at DESC LIMIT 1;
-- should show ₹1 recharge with ₹50 bonus
```

---

#### Test 2: Second Purchase (₹100 Product)

**Steps:**
1. Select ₹100 product
2. Tap "Continue (₹100)"
3. Complete Google Play purchase
4. **Verify success**

**Expected Results:**
```
Alert: "Recharge Successful! 🎉"
Message:
  ₹100 added to your wallet
  
  🎉 Bonus: ₹10
  • Product bonus: ₹10
  
  Total credited: ₹110

Balance: ₹101 + ₹110 = ₹211 total
```

**Key Difference:**
- ❌ No first-time ₹50 bonus (already claimed)
- ✅ Only product bonus (10% = ₹10)

---

#### Test 3: ₹200 Most Popular Product

**Expected:**
```
₹200 base + ₹25 bonus (12.5%) = ₹225 credited
New balance: ₹211 + ₹225 = ₹436
```

---

#### Test 4: Check Transaction History

1. Tap "History" or "View All"
2. Navigate to Wallet History screen
3. **Check "Payment Logs" tab**

**Expected:**
- 3 transactions visible
- Each shows correct amounts
- Bonuses displayed in green
- Status badges show "Success"
- Order IDs from Google Play visible

---

### Phase 6: Regression Testing

#### Test Chat Session Deduction

1. Start chat session
2. Wait 1 minute
3. **Verify:** Balance deducted by ₹8

#### Test Balance Sync

1. Check HomeScreen balance
2. Check WalletScreen balance
3. Check ChatSessionScreen balance
4. **All should match!**

#### Test Voice Call

1. Start voice call
2. Verify per-minute deduction works

---

## 🐛 Troubleshooting

### Issue: Products Not Found

**Error:**
```
❌ Product not found: astro_recharge_1
```

**Solution:**
1. Wait 2-3 hours after creating products (Google Play propagation delay)
2. Verify product IDs match exactly
3. Check product status is "Active"

---

### Issue: Purchase Verification Failed

**Error:**
```
❌ Purchase verification failed: 403 Forbidden
```

**Solution:**
1. Check service account JSON path in .env
2. Verify service account has permissions in Play Console
3. Ensure Google Play Developer API is enabled
4. Restart backend after .env changes

---

### Issue: "This version of the application is not configured for billing"

**This is the most common error!**

**Solution:**
1. ✅ Upload AAB to Play Console (Internal testing track is fine)
2. ✅ Wait for "Available" status (~15-30 min after upload)
3. ✅ Install app from Play Store (use tester opt-in link)
4. ❌ Direct APK install won't work for IAP!

**Why this happens:**
- Google Play IAP requires app to be "known" to Play Console
- Even test purchases need the app uploaded
- Internal testing track is sufficient (no need for production)

---

### Issue: Duplicate Purchase

**Error:**
```
❌ Purchase token already processed
```

**Solution:**
- This is expected behavior (prevents fraud)
- Make a new purchase to test
- Each purchase token can only be used once

---

## ✅ Success Checklist

### Google Play Console:
- [ ] 6 products created with correct IDs
- [ ] All products set to "Active"
- [ ] License testing enabled
- [ ] Test account added

### Google Cloud:
- [ ] Play Developer API enabled
- [ ] Service account created
- [ ] JSON key downloaded
- [ ] Permissions granted in Play Console

### Backend:
- [ ] .env configured with JSON path
- [ ] Backend restarted
- [ ] Logs show "Google Play billing initialized"

### Mobile App:
- [ ] Test mode DISABLED (MOCK_PURCHASES: false)
- [ ] App built with EAS (AAB for Play Console)
- [ ] AAB uploaded to Play Console → Internal testing
- [ ] Release rolled out (status: "Available")
- [ ] Installed from Play Store (via tester opt-in link)
- [ ] Logged in with test account

### Testing:
- [ ] First purchase: ₹1 + ₹50 bonus = ₹51
- [ ] Second purchase: ₹100 + ₹10 bonus = ₹110
- [ ] No first-time bonus on second purchase
- [ ] Balance synced across all screens
- [ ] Transaction history shows all purchases
- [ ] Chat deduction works
- [ ] No regressions

---

## 💰 Recommended Testing Order

1. **₹1 product** (minimal cost, test first-time bonus)
2. **₹100 product** (test product bonus without first-time)
3. **₹200 product** (test "Most Popular" badge)
4. **Chat session** (test balance deduction)
5. **Check history** (verify all transactions)

**Total Cost:** ₹301 (or ₹0 with license testing)

---

## 📊 Expected Results Summary

| Purchase | Base | Product Bonus | First-Time Bonus | Total Credited | Running Balance |
|---|---|---|---|---|---|
| Start | - | - | - | - | ₹50 |
| ₹1 | ₹1 | ₹0 | ₹50 | ₹51 | ₹101 |
| ₹100 | ₹100 | ₹10 | ₹0 | ₹110 | ₹211 |
| ₹200 | ₹200 | ₹25 | ₹0 | ₹225 | ₹436 |
| ₹500 | ₹500 | ₹75 | ₹0 | ₹575 | ₹1011 |
| ₹1000 | ₹1000 | ₹200 | ₹0 | ₹1200 | ₹2211 |

---

## 🎉 When Everything Works

You should see:
- ✅ Products load from Google Play
- ✅ Google Play payment dialog appears
- ✅ Backend verifies with Google
- ✅ Wallet credited correctly
- ✅ Bonuses calculated correctly
- ✅ First-time bonus only once
- ✅ Balance synced everywhere
- ✅ Transactions recorded
- ✅ No errors!

---

## 📝 Next Steps After Testing

1. **Test thoroughly with test account**
2. **Fix any bugs found**
3. **Test edge cases** (network errors, cancellations, etc.)
4. **Update product descriptions** if needed
5. **Create production build**
6. **Submit to Play Store**
7. **Go live!** 🚀

---

**Good luck with testing! You've got this!** 💪

**Questions?** Check backend logs and console logs for detailed error messages.

---

**Last Updated:** October 21, 2025  
**Status:** Ready for real Google Play testing ✅

