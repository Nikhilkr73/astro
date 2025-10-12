# End-to-End Testing Guide - AstroVoice Mobile App

## **Prerequisites**

### **1. Backend API Must Be Running**
```bash
# Check if running
ps aux | grep mobile_api_service | grep -v grep

# If not running, start it:
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate
python mobile_api_service.py

# Should show: INFO: Uvicorn running on http://0.0.0.0:8001
```

### **2. Database Must Be Initialized**
```bash
# Verify database exists
psql -h localhost -U nikhil -d astrovoice -c "SELECT COUNT(*) FROM astrologers;"

# Should return: 3 astrologers

# If not initialized:
psql -h localhost -U nikhil -d postgres -c "CREATE DATABASE astrovoice;"
psql -h localhost -U nikhil -d astrovoice -f database_schema.sql
```

### **3. Mobile App Must Be Running**
```bash
cd /Users/nikhil/workplace/voice_v1/astro-voice-mobile
npx expo start --web --clear

# Wait for: "Web Bundled" message
# Open browser to: http://localhost:8081
```

## **Complete User Flow Test**

### **Step 1: App Launch**
**Action**: Open http://localhost:8081 in browser

**Expected**:
- ✅ Splash screen shows "Kundli" logo
- ✅ Displays for 3 seconds
- ✅ Auto-navigates to phone auth

**Verify**: Splash screen displays correctly

---

### **Step 2: Phone Authentication**
**Action**: Click "Skip (Testing Mode)" button

**Expected**:
- ✅ Navigates to onboarding form
- ✅ No errors in console

**Verify**: Onboarding form appears

---

### **Step 3: Onboarding - Step 1 (Name)**
**Action**: 
- Enter name: "Test User"
- Click "Continue →"

**Expected**:
- ✅ Name validated (letters and spaces only)
- ✅ Advances to Step 2

**Verify**: Date of birth step appears

---

### **Step 4: Onboarding - Step 2 (Date of Birth)**
**Action**:
- Select date: 15
- Select month: August
- Select year: 1990
- Click "Continue →"

**Expected**:
- ✅ Date saved
- ✅ Advances to Step 3

**Verify**: Birth time question appears

---

### **Step 5: Onboarding - Step 3 (Birth Time)**
**Action**:
- Click "Yes, I know"
- Select hour: 02
- Select minute: 30
- Select period: PM
- Click "Continue →"

**Expected**:
- ✅ Time saved
- ✅ Advances to Step 4

**Verify**: Gender selection appears

---

### **Step 6: Onboarding - Step 4 (Gender)**
**Action**:
- Select "Male" or "Female"
- Click "Continue →"

**Expected**:
- ✅ Gender saved
- ✅ Advances to Step 5

**Verify**: Place of birth step appears

---

### **Step 7: Onboarding - Step 5 (Place of Birth)**
**Action**:
- Enter: "Mumbai, Maharashtra"
- Click "Continue →"

**Expected**:
- ✅ Place saved
- ✅ Advances to Step 6

**Verify**: Language selection appears

---

### **Step 8: Onboarding - Step 6 (Languages)**
**Action**:
- Select "English" and "Hindi"
- Click "Complete Profile"

**Expected**:
- ✅ Loading indicator appears
- ✅ Console log: "📝 Submitting user data..."
- ✅ Console log: "✅ User registered: user_xxxxx"
- ✅ Console log: "💰 Welcome bonus: 500"
- ✅ Success screen shows "Profile Completed!"

**Verify in Database**:
```bash
psql -h localhost -U nikhil -d astrovoice -c "SELECT user_id, full_name, phone_number FROM users ORDER BY created_at DESC LIMIT 1;"
# Should show new user

psql -h localhost -U nikhil -d astrovoice -c "SELECT wallet_id, user_id, balance FROM wallets ORDER BY created_at DESC LIMIT 1;"
# Should show wallet with ₹500
```

**API Logs Should Show**:
```
✅ User created/updated: user_xxxxx
✅ Wallet created/updated: wallet_user_xxxxx
INFO: POST /api/users/register HTTP/1.1 200 OK
```

---

### **Step 9: Complete Onboarding**
**Action**: Click "Get Started ✨"

**Expected**:
- ✅ Navigates to Home Screen
- ✅ Loading indicator shows

**Verify**: Home screen appears

---

### **Step 10: Home Screen - Load Astrologers**
**Expected**:
- ✅ Console log: "✅ Loaded 3 astrologers from API"
- ✅ 3 astrologer cards display:
  - AstroGuru (Vedic, 25 years)
  - Mystic Guide (Western, 10 years)
  - Cosmic Sage (Vedic, 30 years)
- ✅ Wallet shows "₹500"
- ✅ Categories show: All, Vedic, Western, etc.

**Verify in Database**:
```bash
psql -h localhost -U nikhil -d astrovoice -c "SELECT display_name, specialization, rating FROM astrologers;"
```

**API Logs Should Show**:
```
INFO: GET /api/astrologers HTTP/1.1 200 OK
INFO: GET /api/wallet/user_xxxxx HTTP/1.1 200 OK
```

**Test Pull-to-Refresh**:
- Pull down on screen
- Should reload astrologers

---

### **Step 11: Start Chat Session**
**Action**: Click "💬 Chat • ₹8/min" on AstroGuru card

**Expected**:
- ✅ Loading screen: "Starting chat session..."
- ✅ Console log: "🚀 Starting chat with AstroGuru"
- ✅ Console log: "✅ Chat session started: conv_xxxxx"
- ✅ Chat screen appears
- ✅ Greeting message in Hindi displays
- ✅ Header shows AstroGuru profile
- ✅ Timer starts at 00:00
- ✅ Wallet shows ₹500

**Verify in Database**:
```bash
psql -h localhost -U nikhil -d astrovoice -c "SELECT conversation_id, user_id, astrologer_id, status FROM conversations ORDER BY started_at DESC LIMIT 1;"
# Should show new conversation with status='active'

psql -h localhost -U nikhil -d astrovoice -c "SELECT sender_type, content FROM messages ORDER BY sent_at DESC LIMIT 1;"
# Should show greeting message from astrologer
```

**API Logs Should Show**:
```
✅ Conversation created: conv_user_xxxxx_yyy
INFO: POST /api/chat/start HTTP/1.1 200 OK
```

---

### **Step 12: Send Chat Message**
**Action**:
- Type: "Can you help me with my career?"
- Click send button (📤)

**Expected**:
- ✅ Message appears in chat (user message, right-aligned, blue)
- ✅ Console log: "✅ Message sent to API"
- ✅ After 1.5 seconds, astrologer response appears
- ✅ Conversation total messages updates

**Verify in Database**:
```bash
psql -h localhost -U nikhil -d astrovoice -c "SELECT sender_type, content FROM messages ORDER BY sent_at DESC LIMIT 5;"
# Should show both user and astrologer messages
```

**API Logs Should Show**:
```
INFO: POST /api/chat/message HTTP/1.1 200 OK
(appears twice - once for user, once for astrologer)
```

---

### **Step 13: Test Message Suggestions**
**Action**: Click any suggestion button (e.g., "What does my birth chart say?")

**Expected**:
- ✅ Message sent immediately
- ✅ Suggestion appears in chat
- ✅ Astrologer responds

---

### **Step 14: Wait for Timer**
**Action**: Watch the timer for 30 seconds

**Expected**:
- ✅ Timer increments: 00:01, 00:02, ...
- ✅ At 00:30 (TEST_MODE), balance deducts: ₹500 → ₹492
- ✅ Wallet balance updates in header

---

### **Step 15: End Chat Session**
**Action**: Click red "End" button (📞 End)

**Expected**:
- ✅ Console log: "End button pressed!"
- ✅ Console log: "✅ Conversation ended in database"
- ✅ Navigates to review screen
- ✅ Shows astrologer profile
- ✅ Shows session duration (e.g., "00:45")

**Verify in Database**:
```bash
psql -h localhost -U nikhil -d astrovoice -c "SELECT conversation_id, status, total_duration_seconds FROM conversations ORDER BY ended_at DESC LIMIT 1;"
# Should show status='completed' and duration in seconds
```

**API Logs Should Show**:
```
✅ Conversation ended: conv_user_xxxxx_yyy
INFO: POST /api/chat/end HTTP/1.1 200 OK
```

---

### **Step 16: Submit Review**
**Action**:
- Click 5th star (5-star rating)
- Optionally type review: "Excellent guidance!"
- Click "Submit Review"

**Expected**:
- ✅ Loading indicator appears on button
- ✅ Console log: "📝 Submitting review..."
- ✅ Console log: "✅ Review submitted: review_xxxxx"
- ✅ Thank you modal appears
- ✅ "🎉 Thank You!" message shows

**Verify in Database**:
```bash
psql -h localhost -U nikhil -d astrovoice -c "SELECT review_id, rating, review_text FROM session_reviews ORDER BY created_at DESC LIMIT 1;"
# Should show 5-star review

psql -h localhost -U nikhil -d astrovoice -c "SELECT display_name, rating, total_reviews FROM astrologers WHERE astrologer_id = 'ast_guru_001';"
# Should show rating updated (average of all reviews)
```

**API Logs Should Show**:
```
✅ Review created: review_user_xxxxx_yyy
INFO: POST /api/reviews/submit HTTP/1.1 200 OK
```

---

### **Step 17: Return to Home**
**Action**: Click "Continue" on thank you modal

**Expected**:
- ✅ Navigates back to Home Screen
- ✅ AstroGuru now shows updated rating
- ✅ Review count incremented

---

### **Step 18: Open Wallet Screen**
**Action**: Click wallet button in header (💳 ₹500) OR navigate to Wallet tab

**Expected**:
- ✅ Loading screen appears
- ✅ Console log: "✅ Wallet loaded: ₹xxx"
- ✅ Current balance displays (should be less than ₹500 if chat deducted)
- ✅ Recent transactions section shows
- ✅ Empty state if no transactions

**Verify in Database**:
```bash
psql -h localhost -U nikhil -d astrovoice -c "SELECT balance FROM wallets WHERE user_id = (SELECT user_id FROM users ORDER BY created_at DESC LIMIT 1);"
```

**API Logs Should Show**:
```
INFO: GET /api/wallet/user_xxxxx HTTP/1.1 200 OK
```

---

### **Step 19: Recharge Wallet**
**Action**:
- Click "₹1,000" recharge button
- (Modal would appear in production)

**Expected**:
- ✅ Loading/processing indicator
- ✅ Console log: "✅ Recharged ₹1000, new balance: ₹xxxx"
- ✅ Balance updates immediately
- ✅ Transaction appears in list
- ✅ Navigates to success screen

**Verify in Database**:
```bash
psql -h localhost -U nikhil -d astrovoice -c "SELECT transaction_type, amount, balance_before, balance_after FROM transactions ORDER BY created_at DESC LIMIT 1;"
# Should show recharge with updated balances

psql -h localhost -U nikhil -d astrovoice -c "SELECT balance FROM wallets WHERE user_id = (SELECT user_id FROM users ORDER BY created_at DESC LIMIT 1);"
# Should show increased balance
```

**API Logs Should Show**:
```
✅ Transaction created: txn_user_xxxxx_yyy
INFO: POST /api/wallet/recharge HTTP/1.1 200 OK
```

---

### **Step 20: Pull to Refresh Wallet**
**Action**: Pull down on wallet screen

**Expected**:
- ✅ Refresh indicator shows
- ✅ Balance reloads from API
- ✅ Transactions reload
- ✅ Data updates

---

## **Complete Test Checklist**

### **Backend API** ✅
- [x] Health check: `curl http://localhost:8001/health`
- [x] All 12 endpoints tested: `./test_mobile_api.sh`
- [x] Database tables created
- [x] Sample data loaded (3 astrologers)

### **Mobile App Screens** ⏳
- [ ] Splash screen displays
- [ ] Phone auth skip works
- [ ] Onboarding form submits → User created in DB
- [ ] Home screen loads astrologers from API
- [ ] Chat button opens chat session
- [ ] Chat messages send and store in DB
- [ ] End button works → Conversation marked completed
- [ ] Review screen accepts rating → Rating updates astrologer
- [ ] Wallet shows balance from API
- [ ] Recharge works → Transaction created in DB

### **Data Persistence** ⏳
- [ ] User data in PostgreSQL users table
- [ ] Wallet with ₹500 in wallets table
- [ ] Conversation in conversations table
- [ ] Messages in messages table
- [ ] Review in session_reviews table
- [ ] Astrologer rating updated
- [ ] Transactions in transactions table
- [ ] user_id in AsyncStorage
- [ ] Wallet balance cached in AsyncStorage

### **Error Handling** ⏳
- [ ] API errors show user-friendly messages
- [ ] Retry buttons work
- [ ] Loading states prevent duplicate submissions
- [ ] Offline mode shows cached data

## **Test Results Template**

### **Test Execution Log**

```
Date: _____________
Tester: _____________
Backend API: Running ✅ / Not Running ❌
Database: Initialized ✅ / Not Initialized ❌
Mobile App: Running ✅ / Not Running ❌

Step 1 - Splash Screen: PASS ✅ / FAIL ❌
  Notes: ___________

Step 2 - Phone Auth Skip: PASS ✅ / FAIL ❌
  Notes: ___________

Step 3 - Onboarding Name: PASS ✅ / FAIL ❌
  User ID Created: ___________

Step 4 - Onboarding DOB: PASS ✅ / FAIL ❌

Step 5 - Onboarding Time: PASS ✅ / FAIL ❌

Step 6 - Onboarding Gender: PASS ✅ / FAIL ❌

Step 7 - Onboarding Place: PASS ✅ / FAIL ❌

Step 8 - Onboarding Languages: PASS ✅ / FAIL ❌
  Wallet Created: ₹___________

Step 9 - Home Screen Load: PASS ✅ / FAIL ❌
  Astrologers Count: ___________

Step 10 - Start Chat: PASS ✅ / FAIL ❌
  Conversation ID: ___________

Step 11 - Send Message: PASS ✅ / FAIL ❌
  Messages in DB: ___________

Step 12 - End Chat: PASS ✅ / FAIL ❌
  Status Updated: ___________

Step 13 - Submit Review: PASS ✅ / FAIL ❌
  Review ID: ___________
  Astrologer Rating: ___________

Step 14 - Wallet Screen: PASS ✅ / FAIL ❌
  Balance Shown: ₹___________

Step 15 - Recharge Wallet: PASS ✅ / FAIL ❌
  New Balance: ₹___________
  Transaction ID: ___________

OVERALL RESULT: PASS ✅ / FAIL ❌
```

## **Console Logs to Watch For**

### **Successful Flow Logs**

```javascript
// Onboarding
📝 Submitting user data: {...}
✅ User registered: user_xxxxx
💰 Welcome bonus: 500

// Home Screen
✅ Loaded 3 astrologers from API

// Chat Session
🚀 Starting chat with AstroGuru
✅ Chat session started: conv_xxxxx
✅ Message sent to API

// Review
📝 Submitting review...
✅ Review submitted: review_xxxxx

// Wallet
✅ Wallet loaded: ₹500
✅ Recharged ₹1000, new balance: ₹1500
```

### **Error Logs to Investigate**

```javascript
❌ Registration error: ...
❌ Failed to load astrologers: ...
❌ Failed to start session: ...
❌ Failed to send message: ...
❌ Failed to submit review: ...
❌ Failed to load wallet: ...
❌ Recharge failed: ...
```

## **Database Verification Queries**

### **After Complete Flow**

```bash
# Count total records
psql -h localhost -U nikhil -d astrovoice << EOF
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM wallets) as wallets,
  (SELECT COUNT(*) FROM conversations) as conversations,
  (SELECT COUNT(*) FROM messages) as messages,
  (SELECT COUNT(*) FROM session_reviews) as reviews,
  (SELECT COUNT(*) FROM transactions) as transactions;
EOF

# View latest user journey
psql -h localhost -U nikhil -d astrovoice << EOF
-- Latest user
SELECT user_id, full_name, phone_number FROM users ORDER BY created_at DESC LIMIT 1;

-- Their wallet
SELECT balance FROM wallets ORDER BY created_at DESC LIMIT 1;

-- Their conversations
SELECT conversation_id, status, total_messages, total_duration_seconds 
FROM conversations ORDER BY started_at DESC LIMIT 1;

-- Their messages
SELECT sender_type, content FROM messages ORDER BY sent_at DESC LIMIT 5;

-- Their reviews
SELECT rating, review_text FROM session_reviews ORDER BY created_at DESC LIMIT 1;

-- Their transactions
SELECT transaction_type, amount, balance_after FROM transactions ORDER BY created_at DESC LIMIT 1;
EOF
```

## **Expected Final State**

### **Database Tables**
- **users**: 1+ records
- **wallets**: 1+ records with ₹500 or more
- **conversations**: 1+ records (status='completed')
- **messages**: 2+ records (greeting + user message + responses)
- **session_reviews**: 1+ records
- **transactions**: 0-1+ records (if recharged)
- **astrologers**: 3 records (1 with updated rating)

### **Mobile App State**
- **AsyncStorage**:
  - user_id: stored
  - user_data: stored
  - is_onboarded: true
  - wallet_balance: cached
- **UI State**:
  - Logged in
  - Onboarded
  - Can navigate all screens
  - Data loading from API

## **Performance Benchmarks**

- ✅ Onboarding submission: < 1 second
- ✅ Home screen load: < 2 seconds
- ✅ Chat session start: < 1 second
- ✅ Message send: < 500ms
- ✅ Review submit: < 1 second
- ✅ Wallet load: < 1 second
- ✅ Recharge: < 1 second

## **Common Issues & Solutions**

### Issue: "User not found" after onboarding
**Solution**: Check AsyncStorage, verify user_id was saved
```javascript
// In browser console
import('@react-native-async-storage/async-storage').then(async (AsyncStorage) => {
  const userId = await AsyncStorage.default.getItem('@astrovoice:user_id');
  console.log('Stored user_id:', userId);
});
```

### Issue: Astrologers not loading
**Solution**: 
1. Check backend API is running: `curl http://localhost:8001/api/astrologers`
2. Check database has astrologers: `psql -h localhost -U nikhil -d astrovoice -c "SELECT COUNT(*) FROM astrologers;"`

### Issue: Chat session won't start
**Solution**: Check wallet balance > 0 in database

### Issue: Review submission fails
**Solution**: Verify conversation_id is being passed correctly

### Issue: Wallet shows ₹0
**Solution**: Check if wallet was created during onboarding

---

## **Success Criteria**

**All systems working if**:
- ✅ User can complete full onboarding
- ✅ User data appears in PostgreSQL
- ✅ Astrologers load from database
- ✅ Chat session creates conversation in DB
- ✅ Messages store in database
- ✅ Review updates astrologer rating
- ✅ Wallet operations work
- ✅ No critical errors in console
- ✅ All database tables populated correctly

**Integration is SUCCESSFUL** when all 20 steps above pass! 🎉

---

**Test Status**: ⏳ Ready to Execute
**Next**: Run through all 20 steps and verify each one

