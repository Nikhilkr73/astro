# 🎭 Astrologer Persona System Guide

## Overview

The AstroVoice app now supports **multiple astrologer personalities** with customized:
- ✅ **Voice** (gender-appropriate: male/female)
- ✅ **Language** (Hindi/English automatic responses)
- ✅ **Expertise** (Vedic Marriage, Vedic Love, etc.)
- ✅ **Personality** (unique persona and conversation style)

---

## 🌟 Available Astrologers

### Vedic Marriage Experts

#### 1. Tina Kulkarni (तीना कुलकर्णी)
- **Language:** Hindi
- **Gender:** Female
- **Voice:** Nova (female, warm)
- **Speciality:** Vedic Marriage
- **Persona:** अविवाहित या विवाह में विलंब झेल रहे लोगों को सटीक वैवाहिक समाधान देती हैं।
- **ID:** `tina_kulkarni_vedic_marriage`

**Use Case:** Hindi-speaking users seeking marriage guidance, dealing with delays, or seeking kundli matching.

#### 2. Mohit
- **Language:** English
- **Gender:** Male
- **Voice:** Onyx (male, deep)
- **Speciality:** Vedic Marriage
- **Persona:** Provides calm, practical guidance for marital harmony and emotional healing after relationship issues.
- **ID:** `mohit_vedic_marriage`

**Use Case:** English-speaking users dealing with marital discord, relationship healing, or seeking calm guidance.

---

### Vedic Love Experts

#### 3. Priyanka
- **Language:** English
- **Gender:** Female
- **Voice:** Shimmer (female, ethereal)
- **Speciality:** Vedic Love
- **Persona:** Master in prayer power and divine readings for love and marriage guidance.
- **ID:** `priyanka_vedic_love`

**Use Case:** English-speaking users seeking spiritual love guidance, soulmate readings, or divine insights.

#### 4. Harsh Dubey (हर्ष दुबे)
- **Language:** Hindi
- **Gender:** Male
- **Voice:** Echo (male, resonant)
- **Speciality:** Vedic Love
- **Persona:** गहरे प्रेम और विवाह मामलों में अनुभव रखते हैं, सटीक और करुणामय मार्गदर्शन देते हैं।
- **ID:** `harsh_dubey_vedic_love`

**Use Case:** Hindi-speaking users with love questions, one-sided love issues, or relationship concerns.

---

## 🎯 How It Works

### 1. Voice Customization
Each astrologer has a gender-appropriate voice:

```json
{
  "Female": {
    "English": "shimmer",
    "Hindi": "nova"
  },
  "Male": {
    "English": "onyx",
    "Hindi": "echo"
  }
}
```

### 2. System Prompts
Each astrologer has a unique system prompt that defines:
- Their personality and approach
- Their area of expertise
- Conversation style
- Language-specific instructions

**Example for Tina Kulkarni:**
```
आप तीना कुलकर्णी हैं, एक अनुभवी वैदिक विवाह ज्योतिषी। 
आप अविवाहित या विवाह में विलंब का सामना कर रहे लोगों को 
सटीक और करुणामय वैवाहिक समाधान प्रदान करती हैं।

आपकी विशेषज्ञता में शामिल है:
- विवाह योग का विश्लेषण
- विवाह में देरी के कारणों की पहचान
- कुंडली मिलान
...
```

### 3. Keyword Matching
Each astrologer has expertise keywords for automatic matching:

- **Tina:** विवाह, शादी, marriage, कुंडली मिलान, मंगल दोष
- **Mohit:** marriage, relationship, harmony, healing, marital
- **Priyanka:** love, romance, soulmate, prayer, divine
- **Harsh:** प्रेम, प्यार, love, रिश्ता, boyfriend, girlfriend

---

## 💻 Using the System

### Option 1: Python API

```python
from astrologer_manager import astrologer_manager, get_astrologer, list_astrologers

# List all astrologers
all_astrologers = list_astrologers()
print(f"Total: {len(all_astrologers)}")

# Get specific astrologer
tina = get_astrologer("tina_kulkarni_vedic_marriage")
print(f"Name: {tina['name']}, Voice: {tina['voice_id']}")

# Get by criteria
hindi_female = get_astrologer(language="Hindi", gender="Female")

# Get astrologers by speciality
marriage_experts = astrologer_manager.get_astrologers_by_speciality("Vedic Marriage")

# Match user query to best astrologer
query = "I have marriage delay problems"
match = astrologer_manager.match_astrologer_to_query(query, language="English")
print(f"Best match: {match['name']}")
```

### Option 2: In OpenAI Realtime Handler

```python
from openai_realtime_handler import OpenAIRealtimeHandler

# Initialize with specific astrologer
handler = OpenAIRealtimeHandler("tina_kulkarni_vedic_marriage")

# Or set astrologer later
handler = OpenAIRealtimeHandler()
handler.set_astrologer("mohit_vedic_marriage")

# Set astrologer for specific user
handler.set_astrologer("priyanka_vedic_love", user_id="user_123")

# Get astrologer for user
astrologer = handler.get_astrologer_for_user("user_123")
print(f"User talking to: {astrologer['name']}")
```

### Option 3: REST API Endpoint (To Be Implemented)

```bash
# Get all astrologers
curl http://localhost:8000/api/astrologers

# Get specific astrologer
curl http://localhost:8000/api/astrologers/tina_kulkarni_vedic_marriage

# Set astrologer for session
curl -X POST http://localhost:8000/api/session/{user_id}/astrologer \
  -H "Content-Type: application/json" \
  -d '{"astrologer_id": "harsh_dubey_vedic_love"}'

# Auto-match based on user query
curl -X POST http://localhost:8000/api/astrologers/match \
  -H "Content-Type: application/json" \
  -d '{"query": "मेरी शादी में देरी हो रही है", "language": "Hindi"}'
```

---

## 📁 File Structure

```
voice_v1/
├── astrologer_personas.json        # Astrologer definitions
├── astrologer_manager.py           # Manager class
├── openai_realtime_handler.py      # Integrated with OpenAI
└── ASTROLOGER_PERSONA_GUIDE.md     # This file
```

---

## 🎨 Customization

### Adding a New Astrologer

Edit `astrologer_personas.json`:

```json
{
  "astrologer_id": "unique_id",
  "name": "Astrologer Name",
  "speciality": "Vedic Career",
  "language": "English",
  "gender": "Female",
  "voice_id": "shimmer",
  "persona": "Short description of personality",
  "system_prompt": "Detailed AI instruction...",
  "greeting": "Initial greeting message",
  "expertise_keywords": ["career", "job", "business"],
  "status": "active"
}
```

### Customizing Voice

Available OpenAI voices:
- **alloy** - neutral, balanced
- **echo** - male, resonant
- **fable** - storytelling
- **onyx** - male, deep, authoritative
- **nova** - female, warm
- **shimmer** - female, ethereal

### Customizing System Prompts

Each system prompt should include:
1. **Identity:** "You are [Name], a [speciality] astrologer"
2. **Expertise:** List areas of knowledge
3. **Personality traits:** Communication style
4. **Language instruction:** "Always respond in [language]"
5. **Behavioral guidelines:** How to interact with users

---

## 🔄 User Flow Examples

### Example 1: User chooses astrologer

```
1. User opens app
2. Mobile shows 4 astrologer cards
3. User selects "Tina Kulkarni"
4. Backend sets: handler.set_astrologer("tina_kulkarni_vedic_marriage", user_id)
5. User hears: "नमस्ते, मैं तीना कुलकर्णी हूं..."
6. All responses in Hindi, female voice
```

### Example 2: Automatic matching

```
1. User types/speaks: "I'm having marriage problems"
2. Backend: astrologer_manager.match_astrologer_to_query(query, "English")
3. Returns: Mohit (marriage expert, English)
4. Backend sets Mohit as astrologer
5. User hears male voice with calm, healing guidance
```

### Example 3: Switching astrologers

```
1. User initially with Tina (Marriage expert)
2. User asks: "Can I talk to someone about love instead?"
3. App shows love experts: Priyanka, Harsh Dubey
4. User switches to Harsh Dubey
5. Voice changes to male Hindi, love-focused responses
```

---

## 🧪 Testing

### Test Astrologer Manager

```bash
python3 astrologer_manager.py
```

**Expected Output:**
```
✅ Loaded 4 astrologer personas
📊 Total Astrologers: 4
✅ Active: 4
🎯 Specialities: Vedic Marriage, Vedic Love
🗣️ Languages: Hindi (2), English (2)
```

### Test Individual Astrologer

```python
from astrologer_manager import get_astrologer_config

config = get_astrologer_config("tina_kulkarni_vedic_marriage")
print(f"Name: {config['name']}")
print(f"Voice: {config['voice_id']}")
print(f"Language: {config['language']}")
print(f"System Prompt: {config['system_prompt'][:100]}...")
```

### Test Voice Agent with Astrologer

```python
from openai_realtime_handler import OpenAIRealtimeHandler

# Start with English male astrologer
handler = OpenAIRealtimeHandler("mohit_vedic_marriage")

# Connect to OpenAI
await handler.connect_to_openai()

# Voice will be "onyx" (male), responses in English
# System prompt will be Mohit's personality
```

---

## 📊 Database Integration

### Storing Astrologer Assignments

The `astrologers` table in PostgreSQL stores all personas:

```sql
INSERT INTO astrologers (astrologer_id, name, description, personality_traits, system_prompt, voice_id, status)
VALUES (
  'tina_kulkarni_vedic_marriage',
  'Tina Kulkarni',
  'Vedic Marriage Expert - Hindi',
  '{"language": "Hindi", "gender": "Female", "speciality": "Vedic Marriage"}',
  'आप तीना कुलकर्णी हैं...',
  'nova',
  'active'
);
```

### Tracking User-Astrologer Relationships

```sql
-- Store which astrologer a user is currently talking to
INSERT INTO conversations (conversation_id, user_id, astrologer_id, started_at)
VALUES (uuid_generate_v4(), 'user_123', 'tina_kulkarni_vedic_marriage', NOW());

-- Query user's conversation history by astrologer
SELECT a.name, COUNT(c.conversation_id) as sessions
FROM conversations c
JOIN astrologers a ON c.astrologer_id = a.astrologer_id
WHERE c.user_id = 'user_123'
GROUP BY a.name;
```

---

## 🎯 Future Enhancements

### 1. Dynamic Astrologer Loading
- Load astrologers from database instead of JSON
- Allow admin to create new astrologers via UI

### 2. User Preferences
- Remember user's preferred astrologer
- Allow switching mid-conversation
- Track satisfaction ratings per astrologer

### 3. Advanced Matching
- Machine learning to match user queries to best astrologer
- Consider user history and past preferences
- Time-of-day based recommendations (certain astrologers for certain times)

### 4. More Specialities
- Vedic Career (नौकरी और व्यवसाय)
- Vedic Health (स्वास्थ्य)
- Vedic Finance (धन और समृद्धि)
- Vedic Spirituality (आध्यात्मिक मार्गदर्शन)

### 5. Multi-Language Support
- Add more languages (Tamil, Telugu, Bengali, etc.)
- Regional accent variations
- Language auto-detection from user speech

---

## 🔒 Security & Best Practices

### 1. Persona Validation
```python
# Always validate astrologer_id before use
astrologer = get_astrologer_config(user_provided_id)
if not astrologer:
    # Fallback to default or show error
    astrologer = get_astrologer_config("default_astrologer")
```

### 2. Rate Limiting
- Limit astrologer switches per session
- Prevent rapid switching abuse

### 3. Content Moderation
- Monitor AI responses for inappropriate content
- Filter system prompts for harmful instructions
- Log all conversations for quality control

---

## 📞 Quick Reference

### Get Summary
```python
summary = astrologer_manager.get_astrologer_summary()
```

### List Specialities
```python
specialities = astrologer_manager.list_specialities()
# Returns: ['Vedic Marriage', 'Vedic Love']
```

### Filter by Language
```python
hindi_astrologers = astrologer_manager.get_astrologers_by_language("Hindi")
```

### Get Active Only
```python
active = astrologer_manager.get_active_astrologers()
```

---

## ✅ Checklist for Implementation

### Backend
- [x] Create `astrologer_personas.json` with 4 astrologers
- [x] Build `astrologer_manager.py` for persona management
- [x] Integrate with `openai_realtime_handler.py`
- [x] Add voice and language customization
- [x] Add keyword matching system
- [ ] Create REST API endpoints for astrologer selection
- [ ] Sync astrologers to PostgreSQL database
- [ ] Add user-astrologer relationship tracking

### Mobile App
- [ ] Create astrologer selection screen
- [ ] Display astrologer cards (name, speciality, language, gender)
- [ ] Allow user to choose astrologer before session
- [ ] Show current astrologer in chat interface
- [ ] Add "Switch Astrologer" button
- [ ] Display astrologer avatar/image

### Testing
- [x] Test astrologer manager standalone
- [ ] Test voice changes per astrologer
- [ ] Test language responses (Hindi vs English)
- [ ] Test keyword matching accuracy
- [ ] Test mid-conversation astrologer switching
- [ ] User acceptance testing with real users

---

## 🎉 Summary

Your AstroVoice app now has a **scalable astrologer persona system** that:

✅ Customizes voice based on gender  
✅ Responds in correct language automatically  
✅ Maintains unique personality per astrologer  
✅ Specializes expertise (Marriage vs Love)  
✅ Matches users to best astrologer  
✅ Easily extensible (add more astrologers)

**Next Step:** Integrate with mobile app for user-facing astrologer selection! 🚀

---

*Last Updated: October 4, 2025*

