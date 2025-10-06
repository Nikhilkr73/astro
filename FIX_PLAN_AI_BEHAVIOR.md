# 🔧 Fix Plan: AI Astrologer Behavior Issues

## 🚨 Current Problems

1. ❌ **AI still suggests consulting external astrologers**
   - Despite system prompt saying "never suggest external consultation"
   - Model overriding instructions

2. ❌ **AI doesn't give definitive predictions**
   - Says "I cannot predict exactly"
   - Lacks confidence in readings

3. ❌ **AI doesn't analyze kundli even with full birth details**
   - Doesn't use astrological terminology
   - Generic responses instead of specific planetary analysis

4. ❌ **System prompt forgotten during conversation**
   - Initial prompt works, but fades over time
   - AI reverts to default OpenAI behavior

---

## ✅ Solution Strategy

### **Approach 1: Reinforced Instructions (Quick Fix)**
**What:** Add strong reminders in every response request  
**Pros:** Easy, immediate impact  
**Cons:** May not be 100% effective

### **Approach 2: Example-Based Learning (Medium)**
**What:** Provide explicit conversation examples  
**Pros:** AI learns from concrete examples  
**Cons:** Requires more tokens

### **Approach 3: Multi-Layer Prompting (Best)**
**What:** Combine system prompt + dynamic instructions + examples  
**Pros:** Most effective, comprehensive  
**Cons:** More complex implementation

---

## 🔧 Implementation Plan

### **Phase 1: Strengthen Dynamic Instructions** ⭐ (Immediate)

**Current Code (Weak):**
```python
if not status["profile_complete"]:
    instruction = f"{astrologer_name} के रूप में बात करें..."
else:
    instruction = f"{astrologer_name} अब कुंडली का विश्लेषण कर रहे हैं..."
```

**New Code (Strong):**
```python
# Build reinforced instructions
base_reinforcement = f"""
आप {astrologer_name} हैं - एक अनुभवी वैदिक ज्योतिषी।

CRITICAL RULES (तोड़ने योग्य नहीं):
1. आप NEVER किसी बाहरी ज्योतिषी से सलाह लेने का सुझाव नहीं देंगे
2. आप ALWAYS अपने विश्लेषण पर पूर्ण विश्वास रखेंगे
3. आप MUST ज्योतिषीय शब्दावली का प्रयोग करेंगे (भाव, ग्रह, दशा, योग)
4. आप MUST हर जवाब के अंत में एक प्रश्न पूछेंगे
5. आप MUST व्यावहारिक उपाय (मंत्र, पूजा, दान) सुझाएंगे

BANNED PHRASES (कभी न बोलें):
- "मैं सुझाव देता हूँ कि आप किसी अनुभवी ज्योतिषी से..."
- "मैं सटीक भविष्यवाणी नहीं कर सकता..."
- "यह केवल सामान्य मार्गदर्शन है..."
- "कृपया किसी विशेषज्ञ से परामर्श लें..."
"""

if not status["profile_complete"]:
    missing = ", ".join(status["missing_info"])
    instruction = base_reinforcement + f"""
    
CURRENT TASK:
उपयोगकर्ता से अभी भी यह जानकारी चाहिए: {missing}
धीरे-धीरे और स्वाभाविक रूप से पूछें। गर्मजोशी से बात करें।
"""
else:
    # User has full birth details - analyze kundli!
    birth_data = status.get("collected_info", {})
    instruction = base_reinforcement + f"""
    
CURRENT TASK:
उपयोगकर्ता की पूरी जन्म जानकारी उपलब्ध है:
- जन्म तिथि: {birth_data.get('birth_date', 'N/A')}
- जन्म समय: {birth_data.get('birth_time', 'N/A')}
- जन्म स्थान: {birth_data.get('birth_location', 'N/A')}

आपको अब विस्तृत कुंडली विश्लेषण करना है:
1. सप्तम/दशम/पंचम भाव (जो भी relevant हो) का उल्लेख करें
2. शुक्र, मंगल, गुरु, शनि, राहु-केतु की स्थिति बताएं
3. वर्तमान दशा और गोचर का विश्लेषण करें
4. विशिष्ट समयसीमा दें (जैसे "अगले 6 महीने में...")
5. सटीक उपाय सुझाएं (कौन सा मंत्र, कौन से दिन, कितनी बार)
6. अंत में एक गहरा प्रश्न पूछें

Example format:
"आपके सप्तम भाव में शुक्र बहुत शक्तिशाली स्थिति में है। मुझे आपकी कुंडली में स्पष्ट विवाह योग दिख रहा है। राहु की महादशा के कारण थोड़ी देरी हो सकती है, पर अगले 8 महीनों में शुभ समाचार मिलने की प्रबल संभावना है। मेरा सुझाव है कि आप प्रत्येक शुक्रवार को 21 बार 'ॐ शुक्राय नमः' मंत्र का जाप करें और सफेद मिठाई का दान करें। क्या आप जानना चाहेंगे कि यह विवाह किस प्रकार के व्यक्ति से होने की संभावना है?"
"""
```

---

### **Phase 2: Add Conversation Examples** ⭐ (High Impact)

Add real examples to system prompt:

```python
def _load_astrologer(self, astrologer_id: str):
    config = get_astrologer_config(astrologer_id)
    if config:
        base_prompt = config.get("system_prompt", "")
        
        # Add concrete examples
        examples = """

CONVERSATION EXAMPLES (इसी तरह बात करें):

Example 1 - User asks about marriage:
User: "मेरी शादी कब होगी?"
You: "आपके सप्तम भाव में शुक्र की उत्तम स्थिति है। मुझे आपकी कुंडली में विवाह योग स्पष्ट दिख रहा है। राहु के प्रभाव से मार्च से जून 2025 के बीच विवाह की प्रबल संभावना है। प्रत्येक शुक्रवार को लक्ष्मी जी की पूजा करें। क्या आप जानना चाहेंगे कि आपका जीवनसाथी किस दिशा से आने की संभावना है?"

Example 2 - User asks about career:
User: "मेरा करियर कैसा रहेगा?"
You: "आपके दशम भाव के स्वामी बहुत शक्तिशाली हैं। मुझे आपकी कुंडली में बड़े बदलाव के योग दिख रहे हैं। गुरु की महादशा अगले 3 महीनों में शुरू होगी जो अत्यंत शुभ है। सितंबर-अक्टूबर में प्रमोशन या नई जॉब की पूर्ण संभावना है। हर मंगलवार हनुमान चालीसा का पाठ करें। आपकी वित्तीय स्थिति पर इसका क्या प्रभाव पड़ेगा?"

ANTI-EXAMPLES (कभी ऐसे न बोलें):
❌ "मैं सुझाव देता हूँ कि आप किसी अनुभवी ज्योतिषी से मिलें।"
❌ "मैं सटीक समय नहीं बता सकता।"
❌ "यह केवल सामान्य जानकारी है।"
"""
        
        self.system_instructions = base_prompt + examples
```

---

### **Phase 3: Reduce Temperature** ⭐ (Easy Win)

**Current:** `temperature: 0.8` (creative, unpredictable)  
**Change to:** `temperature: 0.6` (more consistent, follows instructions better)

```python
async def _configure_session(self):
    config = {
        "type": "session.update",
        "session": {
            # ...
            "temperature": 0.6  # Changed from 0.8
        }
    }
```

---

### **Phase 4: Add Response Validation** ⭐ (Advanced)

Catch bad responses before sending to user:

```python
async def _handle_message(self, data: Dict[str, Any]):
    msg_type = data.get("type")
    
    if msg_type == "response.text.done":
        full_text = self.current_response_text.strip()
        
        # Check for banned phrases
        banned_phrases = [
            "किसी अनुभवी ज्योतिषी",
            "बाहरी विशेषज्ञ",
            "मैं सटीक नहीं बता सकता",
            "सामान्य मार्गदर्शन",
            "consult an expert",
            "I cannot predict"
        ]
        
        has_banned = any(phrase.lower() in full_text.lower() for phrase in banned_phrases)
        
        if has_banned:
            print(f"⚠️  WARNING: Response contains banned phrase!")
            print(f"Response: {full_text[:100]}...")
            # Could regenerate response here
        
        self.current_response_text = ""
        if self.text_callback:
            await self.text_callback(full_text)
```

---

### **Phase 5: Use Function Calling (Ultimate Solution)** 🚀

Force AI to use structured output:

```python
# Add to session config
"tools": [{
    "type": "function",
    "function": {
        "name": "provide_astrological_reading",
        "description": "Provide detailed Vedic astrological analysis",
        "parameters": {
            "type": "object",
            "properties": {
                "bhava_analysis": {
                    "type": "string",
                    "description": "Which house (bhava) is being analyzed"
                },
                "planetary_positions": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Positions of relevant planets (e.g., 'Shukra in 7th house')"
                },
                "dasha_period": {
                    "type": "string",
                    "description": "Current or upcoming dasha period"
                },
                "prediction": {
                    "type": "string",
                    "description": "Specific prediction with timeframe"
                },
                "remedies": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Practical remedies (mantra, puja, donation)"
                },
                "follow_up_question": {
                    "type": "string",
                    "description": "Engaging follow-up question to continue conversation"
                }
            },
            "required": ["bhava_analysis", "planetary_positions", "prediction", "remedies", "follow_up_question"]
        }
    }
}]
```

---

## 📊 Priority Matrix

| Fix | Impact | Effort | Priority |
|-----|--------|--------|----------|
| Phase 1: Reinforced Instructions | HIGH | LOW | ⭐⭐⭐ DO FIRST |
| Phase 3: Reduce Temperature | MEDIUM | VERY LOW | ⭐⭐⭐ DO FIRST |
| Phase 2: Add Examples | HIGH | MEDIUM | ⭐⭐ DO SECOND |
| Phase 4: Response Validation | MEDIUM | MEDIUM | ⭐ OPTIONAL |
| Phase 5: Function Calling | VERY HIGH | HIGH | 🚀 BEST LONG-TERM |

---

## 🎯 Recommended Immediate Action

### **Step 1: Quick Wins (5 minutes)**
1. ✅ Reduce temperature to 0.6
2. ✅ Add strong reinforced instructions

### **Step 2: Medium Term (15 minutes)**
1. ✅ Add conversation examples to system prompt
2. ✅ Add banned phrase checking

### **Step 3: Long Term (1 hour)**
1. ✅ Implement function calling for structured output
2. ✅ Add kundli calculation logic (optional)

---

## 💡 Alternative Approaches

### **Option A: Use GPT-4 instead of GPT-4o-mini**
- **Pros:** Better instruction following
- **Cons:** More expensive, slower

### **Option B: Post-process responses**
- **Pros:** Can fix bad responses
- **Cons:** Adds latency

### **Option C: Fine-tune model**
- **Pros:** Perfect adherence to style
- **Cons:** Very expensive, complex

---

## 🧪 Testing Plan

After implementing fixes, test with:

1. **Test 1:** Give full birth details, ask "मेरी शादी कब होगी?"
   - ✅ Should mention भाव, ग्रह names
   - ✅ Should give specific timeframe
   - ✅ Should suggest remedy
   - ✅ Should NOT say "consult external astrologer"

2. **Test 2:** Ask "मेरा करियर कैसा है?"
   - ✅ Should analyze दशम भाव
   - ✅ Should mention current दशा
   - ✅ Should give practical advice

3. **Test 3:** Vague question "मेरा भविष्य?"
   - ✅ Should ask for specific area
   - ✅ Should still use astrological language

---

**Let's start with Phase 1 + Phase 3 (Quick Wins) immediately!**
