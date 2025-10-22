# ⚡ Quick Start: Real Google Play Testing

**Test Mode:** DISABLED ✅ (Ready for real IAP)

---

## 🎯 Quick Setup (30 min total)

### 1. Google Play Console (15 min)
```
1. Create 6 products with exact IDs:
   - astro_recharge_1 (₹1)
   - astro_recharge_50 (₹50)
   - astro_recharge_100 (₹100)
   - astro_recharge_200 (₹200)
   - astro_recharge_500 (₹500)
   - astro_recharge_1000 (₹1000)

2. Add test account in License testing
```

### 2. Google Cloud (10 min)
```
1. Enable "Google Play Android Developer API"
2. Create service account
3. Download JSON key
4. Grant permissions in Play Console
```

### 3. Backend Config (2 min)
```bash
# Edit .env
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=/path/to/json
GOOGLE_PLAY_PACKAGE_NAME=com.astrovoice.app
GOOGLE_PLAY_ENABLED=true
FIRST_RECHARGE_BONUS_AMOUNT=50.00

# Restart
python3 main_openai_realtime.py
```

### 4. Build & Upload App (40 min) ⚠️ CRITICAL

```bash
# Step 1: Build AAB for Play Console
cd mobile
eas build --profile production --platform android
# Wait ~20 min, download .aab file

# Step 2: Upload to Play Console
# Go to: Play Console → Testing → Internal testing
# Click "Create new release"
# Upload .aab file
# Add testers
# Click "Start rollout"
# Wait ~15-30 min for "Available" status

# Step 3: Install from Play Store
# Open tester opt-in link on device
# Install from Play Store
# ✅ IAP will now work!
```

**Why upload is required:**
- IAP only works with apps uploaded to Play Console
- Direct APK install won't enable IAP
- Internal testing track is sufficient

---

## 🧪 Quick Test

1. Open app on Android device
2. Go to Wallet screen (no test mode badge!)
3. Select ₹1 product
4. Tap "Continue (₹1)"
5. Complete Google Play purchase
6. ✅ Should get ₹51 (₹1 + ₹50 first-time bonus)

---

## 📊 Quick Verification

**Check Balance:**
- Started with: ₹50 (default)
- After ₹1 purchase: ₹101 ✅

**Check Database:**
```sql
SELECT balance FROM wallets WHERE user_id = 'your_id';
-- Should be 101.00
```

**Check Logs:**
```
✅ Google Play verification successful
✅ First-time bonus applied: ₹50
✅ Total credited: ₹51
```

---

## 🐛 Common Issues

| Error | Fix |
|---|---|
| Products not found | Wait 2-3 hours after creating |
| 403 Forbidden | Check service account permissions |
| Not configured for billing | Upload APK to Play Console first |

---

## 📖 Full Guide

See **`REAL_GOOGLE_PLAY_TESTING_GUIDE.md`** for detailed step-by-step instructions.

---

**Current Status:** Test mode OFF, ready for real Google Play! 🚀

