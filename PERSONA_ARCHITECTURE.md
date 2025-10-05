# 🎭 Persona-Driven Architecture - Complete Design

## ✅ Architecture Fixed - Now Properly Supports Multiple Astrologer Personas

### 🚨 **Critical Issue That Was Fixed:**

**Before (WRONG):**
```python
# Single global instance shared by ALL users
openai_realtime_handler = OpenAIRealtimeHandler()
```

**Problems:**
- ❌ One handler for ALL users
- ❌ User A's astrologer affects User B
- ❌ Single OpenAI connection shared
- ❌ Not scalable for future persona features

**After (CORRECT):**
```python
# Per-user handlers dictionary
user_handlers = {}

# Each user gets their own handler
if user_id not in user_handlers:
    user_handlers[user_id] = OpenAIRealtimeHandler()
```

**Benefits:**
- ✅ Each user has their own handler
- ✅ Each user has their own astrologer persona
- ✅ Each user has their own OpenAI connection
- ✅ Fully scalable for future features

---

## 🏗️ Current Architecture

### **1. Per-User Handler Model**

```
User A (user-123)
    ↓
    OpenAIRealtimeHandler Instance #1
        ↓
        Astrologer: Tina Kulkarni (Hindi, Marriage)
        ↓
        OpenAI WebSocket Connection #1

User B (user-456)
    ↓
    OpenAIRealtimeHandler Instance #2
        ↓
        Astrologer: Mohit (English, Marriage)
        ↓
        OpenAI WebSocket Connection #2

User C (user-789)
    ↓
    OpenAIRealtimeHandler Instance #3
        ↓
        Astrologer: Priyanka (English, Love)
        ↓
        OpenAI WebSocket Connection #3
```

### **2. Persona Data Flow**

```
astrologer_personas.json
    ↓
astrologer_manager.py (loads personas)
    ↓
OpenAIRealtimeHandler (per user)
    ↓
    - Loads astrologer config
    - Sets system prompt + expertise keywords
    - Configures voice
    - Sends greeting
    ↓
OpenAI Realtime API (per user connection)
    ↓
User hears astrologer's persona
```

---

## 📊 Persona Features - All Integrated

### **From `astrologer_personas.json`:**

```json
{
  "astrologer_id": "tina_kulkarni_vedic_marriage",
  "name": "Tina Kulkarni",
  "speciality": "Vedic Marriage",
  "language": "Hindi",
  "gender": "Female",
  "voice_id": "nova",
  "persona": "Short description",
  "system_prompt": "Full AI instructions",
  "greeting": "Initial greeting message",
  "expertise_keywords": ["विवाह", "शादी", "marriage"],
  "status": "active"
}
```

### **How Each Feature Is Used:**

| Feature | Usage | Location |
|---------|-------|----------|
| `astrologer_id` | User selection, handler mapping | `main_openai_realtime.py` |
| `name` | Logs, greetings, hints | Throughout |
| `speciality` | Logs, expertise hints | `openai_realtime_handler.py` |
| `language` | System prompt, responses | `_configure_session()` |
| `gender` | Voice selection | `voice_id` mapping |
| `voice_id` | OpenAI voice config | `_configure_session()` |
| `persona` | UI display (mobile app) | `astrologers.ts` |
| `system_prompt` | Base AI instructions | `_load_astrologer()` |
| `greeting` | Auto-sent on selection | `send_greeting()` |
| `expertise_keywords` | System prompt enhancement | `_load_astrologer()` |
| `status` | Active/inactive filtering | `astrologer_manager.py` |

---

## 🔄 Complete User Flow

### **Step 1: User Connects**
```python
# Mobile app connects to WebSocket
ws://localhost:8000/ws-mobile/user-123

# Backend creates dedicated handler
user_handlers["user-123"] = OpenAIRealtimeHandler()
```

### **Step 2: User Selects Astrologer**
```python
# Mobile sends config message
{
  "type": "config",
  "astrologer_id": "tina_kulkarni_vedic_marriage"
}

# Backend loads persona
handler.set_astrologer("tina_kulkarni_vedic_marriage", "user-123")

# Backend configures OpenAI session
await handler._configure_session()
# - Sets system prompt (with expertise keywords)
# - Sets voice (nova for Tina)
# - Sets language (Hindi)

# Backend sends greeting
await handler.send_greeting("user-123")
# User hears: "नमस्ते, मैं तीना कुलकर्णी हूं..."
```

### **Step 3: User Speaks**
```python
# Mobile sends audio
{
  "type": "audio",
  "audio": "base64_encoded_m4a"
}

# Backend processes with user's handler
await handler.send_audio(pcm_audio, "user-123")

# OpenAI responds using:
# - Tina's system prompt
# - Tina's expertise keywords
# - Tina's voice (nova)
# - Hindi language
```

### **Step 4: User Disconnects**
```python
# WebSocket disconnects

# Backend cleans up
await user_handlers["user-123"].disconnect()
del user_handlers["user-123"]
```

---

## 🎯 Scalability for Future Features

### **Easy to Add New Persona Features:**

#### **Example 1: Add "tone" to personas**

1. Add to `astrologer_personas.json`:
```json
{
  "astrologer_id": "tina_kulkarni_vedic_marriage",
  "tone": "warm and empathetic",
  ...
}
```

2. Use in `_load_astrologer()`:
```python
tone = config.get('tone', 'professional')
self.system_instructions += f"\n\nTone: {tone}"
```

#### **Example 2: Add "consultation_style"**

```json
{
  "consultation_style": {
    "question_frequency": "one at a time",
    "response_length": "detailed",
    "use_examples": true
  }
}
```

#### **Example 3: Add "pricing" or "availability"**

```json
{
  "pricing": {
    "per_minute": 10,
    "currency": "INR"
  },
  "availability": {
    "timezone": "Asia/Kolkata",
    "hours": "9am-9pm"
  }
}
```

---

## 🧪 Testing Multi-User Scenarios

### **Test 1: Two Users, Different Astrologers**

**User A:**
- Connects as `user-123`
- Selects Tina (Hindi, Marriage)
- Asks: "मेरी शादी कब होगी?"
- Hears: Hindi response about marriage

**User B (simultaneously):**
- Connects as `user-456`
- Selects Mohit (English, Marriage)
- Asks: "When will I get married?"
- Hears: English response about marriage

**Result:** ✅ Both work independently!

### **Test 2: Same User, Switch Astrologers**

**User A:**
1. Selects Tina (Hindi)
2. Hears greeting in Hindi
3. Switches to Priyanka (English)
4. Hears new greeting in English
5. All responses now in English

**Result:** ✅ Persona switches correctly!

---

## 📁 Code Structure

### **Main Files:**

1. **`astrologer_personas.json`**
   - Single source of truth for all persona data
   - Easy to add new astrologers
   - Easy to add new persona features

2. **`astrologer_manager.py`**
   - Loads and validates personas
   - Provides helper functions
   - Filters by language, gender, speciality

3. **`openai_realtime_handler.py`**
   - Per-user handler class
   - Loads astrologer config
   - Manages OpenAI connection
   - Sends greeting, processes audio

4. **`main_openai_realtime.py`**
   - Creates per-user handlers
   - Routes messages to correct handler
   - Cleans up on disconnect

---

## 🎉 Benefits of Current Architecture

### **1. Isolation**
- Each user's conversation is completely separate
- No interference between users
- Each user can have different astrologer

### **2. Scalability**
- Easy to add new persona features to JSON
- No code changes needed for new astrologers
- Just add to `astrologer_personas.json`

### **3. Maintainability**
- Single source of truth (JSON file)
- Clear separation of concerns
- Easy to test individual personas

### **4. Future-Proof**
- Can add any persona feature:
  - Personality traits
  - Consultation styles
  - Pricing models
  - Availability schedules
  - Cultural preferences
  - Response patterns
  - Emotional intelligence settings

### **5. Performance**
- Each user has dedicated OpenAI connection
- No bottlenecks
- Parallel processing

---

## 📝 Adding New Persona Features (Guide)

### **Step 1: Add to JSON**
```json
{
  "astrologer_id": "tina_kulkarni_vedic_marriage",
  "new_feature": "value",
  ...
}
```

### **Step 2: Load in Handler**
```python
def _load_astrologer(self, astrologer_id: str):
    config = get_astrologer_config(astrologer_id)
    new_feature = config.get('new_feature', 'default')
    # Use new_feature as needed
```

### **Step 3: Apply in System Prompt or Logic**
```python
if new_feature == "value":
    self.system_instructions += "\n\nSpecial instruction based on new feature"
```

---

## ✅ Verification Checklist

- [x] Each user gets own handler instance
- [x] Each handler has own OpenAI connection
- [x] Astrologer persona loaded per user
- [x] All persona features integrated
- [x] Greeting sent automatically
- [x] Expertise keywords in system prompt
- [x] Voice, language, gender all working
- [x] Cleanup on disconnect
- [x] Scalable for future features

---

## 🚀 Ready for Future Enhancements

The architecture now supports:
- ✅ Multiple concurrent users
- ✅ Different astrologers per user
- ✅ Easy addition of new persona features
- ✅ No code changes for new astrologers
- ✅ Complete persona isolation
- ✅ Scalable and maintainable

**Just add features to `astrologer_personas.json` and use them in the handler!**
