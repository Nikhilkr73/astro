# Google Play Billing Integration Guide

**Last Updated:** October 21, 2025  
**Platform:** Android (iOS-ready architecture)

---

## Overview

This guide covers the complete setup and integration of Google Play In-App Billing for AstroVoice wallet recharges. The system includes:

- ✅ 5 recharge products with percentage-based bonuses
- ✅ Flat ₹50 first-time recharge bonus for all users
- ✅ Server-side purchase verification
- ✅ Per-minute wallet deductions during sessions
- ✅ Complete transaction history with filtering
- ✅ iOS-extensible architecture

---

## Architecture Overview

### Purchase Flow

```
User selects product → Google Play purchase dialog
    ↓
Google Play processes payment
    ↓
Mobile app receives purchase token
    ↓
Backend verifies with Google Play Developer API
    ↓
Backend calculates bonuses:
  - Product bonus (e.g., 10% for ₹100)
  - First-time bonus (₹50 if never recharged)
    ↓
Backend credits wallet with total amount
    ↓
Backend acknowledges purchase with Google
    ↓
Mobile finalizes purchase (marks as consumed)
    ↓
User sees success with bonus breakdown
```

### Bonus Calculation Example

**First Recharge (₹200 product):**
```
Base amount: ₹200
Product bonus (12.5%): +₹25
First-time bonus: +₹50
Total credited: ₹275
```

**Second Recharge (₹100 product):**
```
Base amount: ₹100
Product bonus (10%): +₹10
First-time bonus: N/A (already claimed)
Total credited: ₹110
```

---

## Backend Setup

### 1. Google Play Developer API Setup

#### Step 1: Enable API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services** → **Library**
4. Search for "Google Play Android Developer API"
5. Click **Enable**

#### Step 2: Create Service Account
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in details:
   - Name: `astrovoice-play-billing`
   - Description: `Service account for Google Play purchase verification`
4. Click **Create and Continue**
5. Skip role assignment (optional), click **Continue**
6. Click **Done**

#### Step 3: Generate JSON Key
1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Select **JSON**
5. Download the JSON file
6. **IMPORTANT:** Store securely, never commit to git!

#### Step 4: Grant Play Console Access
1. Go to [Google Play Console](https://play.google.com/console/)
2. Navigate to **Users and Permissions**
3. Click **Invite New Users**
4. Enter the service account email (from JSON file)
5. Grant **View app information and download bulk reports** permission
6. Click **Invite User**

### 2. Backend Environment Variables

Add to `.env`:

```bash
# Google Play Billing Configuration
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=/path/to/google-play-service-account.json
GOOGLE_PLAY_PACKAGE_NAME=com.astrovoice.app
GOOGLE_PLAY_ENABLED=true

# First Recharge Bonus
FIRST_RECHARGE_BONUS_AMOUNT=50.00
```

**Security Notes:**
- Store JSON file outside git repository
- Use absolute path in `.env`
- Never commit `.env` file
- Add `.env` to `.gitignore`

### 3. Install Python Dependencies

Already added to `requirements.txt`:

```bash
google-auth==2.28.0
google-api-python-client==2.120.0
```

Install:
```bash
pip install google-auth google-api-python-client
```

### 4. Database Schema

Already applied! The schema includes:

**New Columns in `transactions` table:**
- `google_play_purchase_token` - Unique token from Google
- `google_play_product_id` - Product purchased
- `google_play_order_id` - Google Play order ID
- `platform` - 'android' or 'ios'
- `bonus_amount` - Bonus credited
- `session_duration_minutes` - For deductions
- `astrologer_name` - For deductions

**New `recharge_products` table:**
- 5 products with bonuses configured
- Platform-specific (android/ios)
- Bonus percentages and amounts pre-calculated

**New `first_recharge_bonuses` table:**
- Tracks first-time ₹50 bonus per user
- Prevents duplicate bonuses

### 5. API Endpoints

#### Get Recharge Products
```bash
GET /api/wallet/products?platform=android
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "product_id": "astro_recharge_50",
      "platform": "android",
      "amount": 50.00,
      "bonus_percentage": 0.00,
      "bonus_amount": 0.00,
      "total_amount": 50.00,
      "display_name": "₹50 Recharge",
      "is_most_popular": false
    },
    {
      "product_id": "astro_recharge_200",
      "platform": "android",
      "amount": 200.00,
      "bonus_percentage": 12.50,
      "bonus_amount": 25.00,
      "total_amount": 225.00,
      "display_name": "₹200 Recharge",
      "is_most_popular": true
    }
    // ... more products
  ]
}
```

#### Verify Purchase
```bash
POST /api/wallet/verify-purchase
Content-Type: application/json

{
  "user_id": "user_12345",
  "product_id": "astro_recharge_100",
  "purchase_token": "google_play_token_here",
  "order_id": "GPA.1234.5678.9012",
  "platform": "android"
}
```

**Response (First Recharge):**
```json
{
  "success": true,
  "transaction_id": "txn_user123_1729512345",
  "amount_paid": 100.00,
  "product_bonus": 10.00,
  "first_time_bonus": 50.00,
  "total_bonus": 60.00,
  "total_credited": 160.00,
  "new_balance": 660.00,
  "message": "₹160 credited to your wallet!"
}
```

**Response (Subsequent Recharge):**
```json
{
  "success": true,
  "transaction_id": "txn_user123_1729512456",
  "amount_paid": 100.00,
  "product_bonus": 10.00,
  "first_time_bonus": 0.00,
  "total_bonus": 10.00,
  "total_credited": 110.00,
  "new_balance": 770.00,
  "message": "₹110 credited to your wallet!"
}
```

---

## Mobile App Setup

### 1. Install Dependencies

Already installed:

```bash
cd mobile
npm install react-native-iap
```

### 2. Product Configuration

File: `mobile/src/config/billing.ts`

Products configured:
- `astro_recharge_50` - ₹50 (0% bonus)
- `astro_recharge_100` - ₹100 (10% bonus = +₹10)
- `astro_recharge_200` - ₹200 (12.5% bonus = +₹25) **Most Popular**
- `astro_recharge_500` - ₹500 (15% bonus = +₹75)
- `astro_recharge_1000` - ₹1000 (20% bonus = +₹200)

### 3. Billing Service Usage

```typescript
import billingService from './services/billingService';

// Initialize on app start
await billingService.init();

// Load products
const products = await billingService.loadProducts();

// Purchase a product
const purchase = await billingService.purchaseProduct('astro_recharge_100');

// Verify with backend
const response = await apiService.verifyGooglePlayPurchase(
  userId,
  'astro_recharge_100',
  purchase.purchaseToken,
  purchase.transactionId,
  'android'
);

// Finalize purchase (mark as consumed)
await billingService.finalizePurchase(purchase);
```

### 4. Screen Navigation

- **WalletScreen** - Recharge interface with product selection
- **WalletHistoryScreen** - Transaction history with tabs
- **HomeScreen** - Shows wallet balance
- **ChatSessionScreen** - Per-minute deductions
- **VoiceCallScreen** - Per-minute deductions

All screens sync balance automatically via API calls.

---

## Google Play Console Configuration

### 1. Create In-App Products

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select **AstroVoice** app
3. Navigate to **Monetize** → **In-app products**
4. Click **Create product** for each:

#### Product 1: ₹50 Recharge
- **Product ID:** `astro_recharge_50`
- **Name:** ₹50 Recharge
- **Description:** Recharge your wallet with ₹50
- **Status:** Active
- **Type:** Consumable
- **Price:** ₹50.00 INR

#### Product 2: ₹100 Recharge
- **Product ID:** `astro_recharge_100`
- **Name:** ₹100 Recharge
- **Description:** Recharge your wallet with ₹100 and get 10% bonus
- **Status:** Active
- **Type:** Consumable
- **Price:** ₹100.00 INR

#### Product 3: ₹200 Recharge (Most Popular)
- **Product ID:** `astro_recharge_200`
- **Name:** ₹200 Recharge
- **Description:** Recharge your wallet with ₹200 and get 12.5% bonus - Most Popular!
- **Status:** Active
- **Type:** Consumable
- **Price:** ₹200.00 INR

#### Product 4: ₹500 Recharge
- **Product ID:** `astro_recharge_500`
- **Name:** ₹500 Recharge
- **Description:** Recharge your wallet with ₹500 and get 15% bonus
- **Status:** Active
- **Type:** Consumable
- **Price:** ₹500.00 INR

#### Product 5: ₹1000 Recharge
- **Product ID:** `astro_recharge_1000`
- **Name:** ₹1000 Recharge
- **Description:** Recharge your wallet with ₹1000 and get 20% bonus
- **Status:** Active
- **Type:** Consumable
- **Price:** ₹1000.00 INR

### 2. Add License Testers

For testing without real payments:

1. Go to **Setup** → **License testing**
2. Add email addresses of testers
3. Testers will see test payment methods

### 3. Add App Permissions

File: `mobile/app.json`

Add billing permission:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "com.android.vending.BILLING"
      ],
      "package": "com.astrovoice.app"
    }
  }
}
```

---

## Testing Guide

### 1. Test with Sandbox Accounts

#### Setup:
1. Create test Google account
2. Add to license testers in Play Console
3. Install app via internal testing track
4. Purchase products (no real charge)

#### Verify:
- ✅ Google Play payment dialog appears
- ✅ Purchase completes successfully
- ✅ Backend receives purchase token
- ✅ Backend verifies with Google API
- ✅ Wallet credited with correct amount
- ✅ First-time ₹50 bonus applied (first purchase only)
- ✅ Product bonus applied correctly
- ✅ Transaction recorded in history
- ✅ Balance synced across all screens

### 2. Test Cases

#### Test Case 1: First Recharge with ₹100
**Steps:**
1. New user with ₹0 balance
2. Select ₹100 product
3. Complete Google Play purchase
4. Verify backend response

**Expected:**
- Wallet credited: ₹160 (₹100 + ₹10 product bonus + ₹50 first-time bonus)
- Transaction shows all bonuses
- `first_recharge_bonuses` table has record

#### Test Case 2: Second Recharge with ₹200
**Steps:**
1. Same user from Test Case 1
2. Select ₹200 product
3. Complete purchase

**Expected:**
- Wallet credited: ₹225 (₹200 + ₹25 product bonus)
- No first-time bonus
- Balance = ₹385 (₹160 + ₹225)

#### Test Case 3: Duplicate Purchase Prevention
**Steps:**
1. Intercept purchase token from Test Case 1
2. Try to submit same token again

**Expected:**
- Backend rejects with error
- No duplicate credit
- Balance unchanged

#### Test Case 4: Balance Deduction During Chat
**Steps:**
1. Start chat session with ₹100 balance
2. Wait 1 minute
3. Verify deduction

**Expected:**
- Balance deducted by ₹8/minute
- New balance: ₹92
- Transaction recorded with astrologer name and duration

---

## Troubleshooting

### Issue: "Purchase verification failed"

**Possible Causes:**
1. Service account not configured
2. Google Play API not enabled
3. Service account lacks Play Console permissions

**Solution:**
1. Check `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` path
2. Verify API is enabled in Cloud Console
3. Grant service account "View app information" permission

---

### Issue: "Product not found"

**Possible Causes:**
1. Product IDs mismatch
2. Products not created in Play Console
3. Products not active

**Solution:**
1. Verify product IDs in `billing.ts` match Play Console exactly
2. Check all products are created and active
3. Wait 2-3 hours after creating products

---

### Issue: "Purchase token already used"

**Cause:** Purchase already processed

**Solution:** This is expected behavior (prevents duplicates). Use new purchase for testing.

---

### Issue: "First-time bonus not applied"

**Possible Causes:**
1. User already has recharge history
2. Database migration incomplete

**Solution:**
1. Check `first_recharge_bonuses` table for user record
2. Verify database schema applied correctly

---

## Production Checklist

Before going live:

- [ ] Google Play Developer API enabled
- [ ] Service account created with correct permissions
- [ ] All 5 products created and active in Play Console
- [ ] Environment variables configured in production
- [ ] Service account JSON stored securely (not in git)
- [ ] Billing permission added to app manifest
- [ ] App uploaded to internal testing track
- [ ] Tested with sandbox accounts
- [ ] First-time bonus logic verified
- [ ] Product bonuses verified
- [ ] Duplicate purchase prevention tested
- [ ] Balance deduction tested
- [ ] Transaction history verified
- [ ] Error handling tested (user cancellation, network errors)

---

## iOS Future Support

Architecture is iOS-ready:

**Already Implemented:**
- `platform` column in database
- Platform parameter in API endpoints
- `react-native-iap` supports both platforms
- Product configuration separated by platform

**When Adding iOS:**
1. Create iOS products in App Store Connect
2. Add product IDs to `billing.ts` under `ios.productIds`
3. Implement App Store purchase verification (similar to Google Play)
4. Update API to verify with App Store receipt validation
5. No database changes needed!

---

## Security Best Practices

✅ **Implemented:**
- Server-side purchase verification
- Purchase token uniqueness check
- Service account authentication
- No sensitive data in client-side code
- Comprehensive error logging
- Secure credential storage

❌ **Never Do:**
- Trust client-side purchase validation only
- Store Google service account JSON in git
- Hardcode product prices in mobile app
- Skip server-side verification
- Log purchase tokens or credentials

---

## Support & Contact

**For Issues:**
- Check logs: `tail -f backend.log`
- Review transaction history: `python3 view_user_data.py`
- Test API endpoints: `curl localhost:8000/api/wallet/products`

**Documentation:**
- [Google Play Billing Docs](https://developer.android.com/google/play/billing)
- [react-native-iap Docs](https://github.com/dooboolab-community/react-native-iap)
- [Google Play Developer API](https://developers.google.com/android-publisher)

---

**Last Updated:** October 21, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅


