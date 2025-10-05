# 🔧 Quick Fix - Astrologer Not Working

## ✅ What I Just Fixed:

1. **`openai_realtime_handler.py`**:
   - Now uses astrologer's `system_prompt` (not just default)
   - Properly loads language-specific instructions

2. **`main_openai_realtime.py`**:
   - Reconfigures session when astrologer is set
   - No need to disconnect/reconnect

---

## 🚀 How to Test:

### **Step 1: Restart Backend**
```bash
cd /Users/nikhil/workplace/voice_v1

# Kill existing server
lsof -ti:8000 | xargs kill -9

# Start fresh
python3 main_openai_realtime.py
```

### **Step 2: Test Mobile App**
1. Open mobile app
2. Select **Tina Kulkarni**
3. Start voice chat
4. Speak in Hindi or English

### **Step 3: Check Backend Logs**

You should see:
```
📱 Mobile WebSocket connected: user_123
🎭 Setting astrologer to: tina_kulkarni_vedic_marriage for user user_123
✅ Loaded astrologer: Tina Kulkarni (Hindi, Female)
   Voice: nova, Speciality: Vedic Marriage
🔧 Session configured with Tina Kulkarni persona (voice: nova, language: Hindi)
📝 System instructions: आप तीना कुलकर्णी हैं, एक अनुभवी वैदिक विवाह ज्योतिषी...
```

---

## 🐛 If Still Not Working:

### **Check 1: Mobile sends config?**
Mobile console should show:
```
✅ WebSocket connected for voice chat
🎭 Sent astrologer config: tina_kulkarni_vedic_marriage
```

### **Check 2: Backend receives config?**
Backend should show:
```
🎭 Setting astrologer to: tina_kulkarni_vedic_marriage
```

### **Check 3: Session reconfigured?**
Backend should show:
```
🔧 Session configured with Tina Kulkarni persona (voice: nova, language: Hindi)
```

---

## 💡 Quick Debug:

```bash
# Test astrologer loading
python3 test_astrologer_loading.py

# Should show all 4 astrologers with Hindi/English correctly set
```

---

## 🎯 Expected Behavior:

**Tina Kulkarni:**
- Voice: Female (nova)
- Language: HINDI only
- First words: "नमस्ते, मैं तीना कुलकर्णी हूं..."

**Mohit:**
- Voice: Male (onyx)
- Language: ENGLISH only
- First words: "Hello, I'm Mohit..."

---

## 📋 Checklist:

- [ ] Backend restarted
- [ ] Mobile app restarted
- [ ] Selected Tina Kulkarni
- [ ] Backend logs show "Setting astrologer to: tina_kulkarni_vedic_marriage"
- [ ] Backend logs show "Session configured with Tina Kulkarni"
- [ ] Backend logs show Hindi system instructions
- [ ] Voice response is in HINDI

---

**If all checks pass but still English, check OpenAI API key and quota!**
