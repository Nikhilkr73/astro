# User Data Integration & AI Context

**Date:** October 13, 2025  
**Feature:** User registration data storage and AI context integration  
**Status:** ✅ Implemented

---

## Overview

User registration data (collected during onboarding) is now:
1. **Saved to database** (PostgreSQL)
2. **Fetched automatically** when chat starts
3. **Passed to AI astrologer** as context for personalized readings

---

## Flow Diagram

```
Mobile App Onboarding
        ↓
1. User enters details:
   - Full name
   - Date of birth (DD/MM/YYYY)
   - Time of birth (HH:MM AM/PM)
   - Place of birth
   - Gender
        ↓
2. POST /api/users/register
   - Saves to `users` table
   - Creates wallet with ₹500 welcome bonus
   - Returns user_id and wallet info
        ↓
3. User starts chat
   POST /api/chat/start
   - Fetches user data from database
   - Creates conversation record
   - Returns conversation_id + user_context
        ↓
4. User sends message
   POST /api/chat/send
   - Fetches user birth details
   - Injects into first message as context
   - AI responds with personalized reading
   - Saves messages to database
```

---

## API Endpoints

### 1. User Registration

**Endpoint:** `POST /api/users/register`

**Request:**
```json
{
  "phone_number": "+919876543210",
  "full_name": "Rahul Kumar",
  "date_of_birth": "15/08/1995",
  "time_of_birth": "02:30 PM",
  "place_of_birth": "Mumbai, Maharashtra",
  "gender": "Male"
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "user_919876543210",
  "message": "User registered successfully",
  "full_name": "Rahul Kumar",
  "phone_number": "+919876543210",
  "date_of_birth": "15/08/1995",
  "time_of_birth": "02:30 PM",
  "place_of_birth": "Mumbai, Maharashtra",
  "gender": "Male",
  "user": {
    "user_id": "user_919876543210",
    "full_name": "Rahul Kumar",
    "display_name": "Rahul Kumar",
    "phone_number": "+919876543210",
    "birth_info": {
      "date": "15/08/1995",
      "time": "02:30 PM",
      "place": "Mumbai, Maharashtra"
    },
    "gender": "Male"
  },
  "wallet": {
    "wallet_id": "wallet_user_919876543210",
    "balance": 500.0,
    "currency": "INR"
  },
  "timestamp": "2025-10-13T10:30:00"
}
```

**Database Changes:**
- Inserts/updates record in `users` table
- Parses date from DD/MM/YYYY to DATE format
- Parses time from HH:MM AM/PM to TIME format
- Creates wallet with ₹500 welcome bonus
- Stores metadata: `{"onboarding_completed": true, "registration_source": "mobile_app"}`

---

### 2. Start Chat Session

**Endpoint:** `POST /api/chat/start`

**Request:**
```json
{
  "user_id": "user_919876543210",
  "astrologer_id": "tina_kulkarni_vedic_marriage",
  "topic": "marriage"
}
```

**Response:**
```json
{
  "success": true,
  "conversation_id": "conv_user_919876543210_tina_kulkarni_vedic_marriage_1697212345",
  "user_id": "user_919876543210",
  "astrologer_id": "tina_kulkarni_vedic_marriage",
  "topic": "marriage",
  "user_context": {
    "name": "Rahul Kumar",
    "display_name": "Rahul Kumar",
    "gender": "Male",
    "birth_date": "1995-08-15",
    "birth_time": "14:30:00",
    "birth_location": "Mumbai, Maharashtra",
    "language_preference": "hi"
  },
  "started_at": "2025-10-13T10:31:00"
}
```

**Database Changes:**
- Fetches user data from `users` table
- Creates record in `conversations` table with status='active'
- Returns user_context for mobile app to use

---

### 3. Send AI Chat Message

**Endpoint:** `POST /api/chat/send`

**Request:**
```json
{
  "conversation_id": "conv_user_919876543210_tina_kulkarni_vedic_marriage_1697212345",
  "user_id": "user_919876543210",
  "astrologer_id": "tina_kulkarni_vedic_marriage",
  "message": "Hello, when will I get married?"
}
```

**Response:**
```json
{
  "success": true,
  "conversation_id": "conv_user_919876543210_tina_kulkarni_vedic_marriage_1697212345",
  "user_message": "Hello, when will I get married?",
  "ai_response": "Namaste Rahul! 🙏 Aapki kundli dekh rahi hoon... Aapki birth chart mein saptam bhava (7th house) mein kuch interesting yogas dikh rahe hain 💍 Aapki exact birth time 2:30 PM hai na Mumbai mein? ✨",
  "astrologer_name": "Tina Kulkarni",
  "tokens_used": 145,
  "thinking_phase": 1,
  "timestamp": "2025-10-13T10:31:15"
}
```

**What Happens:**
1. Fetches user data from database
2. For **first message only**, builds context:
   ```
   User Information:
   - Name: Rahul Kumar
   - Gender: Male
   - Date of Birth: 1995-08-15
   - Time of Birth: 14:30:00
   - Place of Birth: Mumbai, Maharashtra
   - Preferred Language: Hindi

   User's Question: Hello, when will I get married?
   ```
3. Sends to OpenAI with astrologer persona
4. Saves both messages to `messages` table
5. Updates conversation activity timestamp

---

## Database Schema

### Users Table
```sql
users (
    user_id VARCHAR PRIMARY KEY,           -- "user_919876543210"
    phone_number VARCHAR,                  -- "+919876543210"
    full_name VARCHAR,                     -- "Rahul Kumar"
    display_name VARCHAR,                  -- "Rahul Kumar"
    birth_date DATE,                       -- 1995-08-15
    birth_time TIME,                       -- 14:30:00
    birth_location VARCHAR,                -- "Mumbai, Maharashtra"
    gender VARCHAR,                        -- "Male"
    language_preference VARCHAR,           -- "hi"
    subscription_type VARCHAR,             -- "free"
    metadata JSONB,                        -- {"onboarding_completed": true, ...}
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### Wallets Table
```sql
wallets (
    wallet_id VARCHAR PRIMARY KEY,         -- "wallet_user_919876543210"
    user_id VARCHAR REFERENCES users,      -- Foreign key
    balance DECIMAL(10,2),                 -- 500.00
    currency VARCHAR,                      -- "INR"
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### Conversations Table
```sql
conversations (
    conversation_id VARCHAR PRIMARY KEY,   -- "conv_user_919876543210_tina_..."
    user_id VARCHAR REFERENCES users,
    astrologer_id VARCHAR,
    topic VARCHAR,                         -- "marriage"
    status VARCHAR,                        -- "active"
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    last_message_at TIMESTAMP,
    total_messages INTEGER,
    metadata JSONB
)
```

### Messages Table
```sql
messages (
    message_id VARCHAR PRIMARY KEY,
    conversation_id VARCHAR REFERENCES conversations,
    sender_type VARCHAR,                   -- "user" or "astrologer"
    content TEXT,                          -- Message text
    message_type VARCHAR,                  -- "text"
    ai_model VARCHAR,                      -- "gpt-4o-mini"
    tokens_used INTEGER,                   -- 145
    sent_at TIMESTAMP,
    metadata JSONB
)
```

---

## Mobile App Integration

### Update ChatSessionScreen

The mobile app should use the new `/api/chat/send` endpoint:

```typescript
// Start chat
const sessionResponse = await apiService.startChatSession(
  userId,
  astrologerId,
  topic
);

const conversationId = sessionResponse.conversation_id;
const userContext = sessionResponse.user_context;

// Send message
const response = await fetch('/api/chat/send', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    conversation_id: conversationId,
    user_id: userId,
    astrologer_id: astrologerId,
    message: userMessage
  })
});

const data = await response.json();
console.log('AI Response:', data.ai_response);
```

---

## Key Features

### 1. Automatic Context Injection
✅ User birth details automatically added to **first message only**  
✅ Subsequent messages don't repeat context (keeps token usage low)  
✅ AI remembers context through conversation history

### 2. Personalized Responses
✅ AI knows user's name → "Namaste Rahul!"  
✅ AI knows gender → Uses appropriate language  
✅ AI knows birth details → Can make specific predictions  
✅ AI knows language preference → Responds in Hindi/English

### 3. Database Persistence
✅ All user data stored in PostgreSQL  
✅ All conversations tracked  
✅ All messages saved with metadata  
✅ Token usage logged for analytics

### 4. Welcome Bonus
✅ New users get ₹500 in wallet automatically  
✅ Wallet created on registration  
✅ Ready for future payment integration

---

## Example Conversation

**User Registration:**
- Name: Priya Sharma
- DOB: 10/03/1998
- Time: 08:45 AM
- Place: Delhi
- Gender: Female

**First Message:**
```
User: "Hi, mujhe apne career ke baare mein jaanna hai"
```

**AI Receives (behind the scenes):**
```
User Information:
- Name: Priya Sharma
- Gender: Female
- Date of Birth: 1998-03-10
- Time of Birth: 08:45:00
- Place of Birth: Delhi
- Preferred Language: Hindi

User's Question: Hi, mujhe apne career ke baare mein jaanna hai
```

**AI Response:**
```
"Namaste Priya! 🙏 Aapka career question bahut important hai ✨ Main aapki 
kundli dekh rahi hoon - aap 10th March 1998 ko subah 8:45 baje Delhi mein 
paida hui thi, sahi hai na? Aapke dashmi bhava (10th house) mein kuch bahut 
achhe yogas dikh rahe hain 💼 Bataiye, aap kis field mein interested hain? 🌟"
```

**Second Message (No Context Injection):**
```
User: "Mujhe technology mein interest hai"

AI Response (using conversation history):
"Perfect Priya! 🚀 Technology aapke liye bahut acha hai. Aapki kundli mein 
Budh (Mercury) strong position mein hai jo technology aur communication ke 
liye bahut favorable hai..."
```

---

## Testing

### Test 1: Registration
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919876543210",
    "full_name": "Test User",
    "date_of_birth": "01/01/2000",
    "time_of_birth": "12:00 PM",
    "place_of_birth": "Mumbai",
    "gender": "Male"
  }'
```

Expected: user_id, wallet with ₹500

### Test 2: Start Chat
```bash
curl -X POST http://localhost:8000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_919876543210",
    "astrologer_id": "tina_kulkarni_vedic_marriage",
    "topic": "general"
  }'
```

Expected: conversation_id, user_context with birth details

### Test 3: Send Message
```bash
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "conv_...",
    "user_id": "user_919876543210",
    "astrologer_id": "tina_kulkarni_vedic_marriage",
    "message": "Hello"
  }'
```

Expected: AI response with personalized greeting using user's name

---

## Implementation Details

### Date/Time Parsing
- Mobile sends: `"15/08/1995"` → Database stores: `DATE '1995-08-15'`
- Mobile sends: `"02:30 PM"` → Database stores: `TIME '14:30:00'`

### User ID Generation
- If phone provided: `user_{phone_without_+_and_spaces}`
- Example: `"+91 98765 43210"` → `"user_919876543210"`
- If no phone: `user_{uuid}`

### Context Injection Logic
```python
# Check if first message in conversation
if conversation.total_messages == 0:
    message_with_context = f"{user_context_text}\n\nUser's Question: {message}"
else:
    message_with_context = message  # No context injection
```

### Error Handling
- If user not found in database → Continue with minimal data
- If database save fails → Still return AI response, log error
- If wallet creation fails → User registered, wallet balance = 0

---

## Future Enhancements

### Phase 2 (Pending)
- [ ] Calculate birth chart (rashis, nakshatras) from birth details
- [ ] Store calculated chart in `user_profiles` table
- [ ] Include chart analysis in AI context

### Phase 3 (Pending)
- [ ] Save AI responses to `readings` table
- [ ] Track consultation history
- [ ] Deduct wallet balance based on chat duration

### Phase 4 (Pending)
- [ ] Add location geocoding (city → lat/long)
- [ ] Store timezone information
- [ ] Calculate planetary positions

---

## Configuration

### Environment Variables
```bash
# Database (required for this feature)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=astrovoice
DB_USER=postgres
DB_PASSWORD=your_password

# OpenAI (required for AI responses)
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4o-mini
```

### Database Setup
```bash
# 1. Create database
createdb astrovoice

# 2. Run schema
psql astrovoice < database_schema.sql

# Or use database manager:
python3 -c "from database_manager import DatabaseManager; db = DatabaseManager(); db.execute_schema()"
```

---

## Files Modified

1. **backend/api/mobile_endpoints.py**
   - Updated `/api/users/register` - saves to database
   - Updated `/api/chat/start` - fetches user data
   - Added `/api/chat/send` - AI chat with context
   - Updated `/api/chat/message` - saves to database

---

## Summary

✅ **User data collected during onboarding is now stored in database**  
✅ **User birth details automatically fetched when chat starts**  
✅ **AI receives user context in first message for personalized responses**  
✅ **All conversations and messages tracked in database**  
✅ **Welcome bonus (₹500) automatically credited on registration**

**The astrologer now knows who they're talking to! 🔮✨**

---

**Status:** ✅ Ready for testing  
**Next:** Test with mobile app and verify AI responses include user's name and birth details

