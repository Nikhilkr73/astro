# 🚀 Quick Start - AstroVoice Mobile Testing

## ⚡ Start in 30 Seconds

### 1. Start Backend (Terminal 1)
```bash
cd /Users/nikhil/workplace/voice_v1
python3 main_openai_realtime.py
```
✅ Wait for: `✅ OpenAI connection test successful`

### 2. Start Mobile App (Terminal 2)
```bash
cd /Users/nikhil/workplace/voice_v1/astro-voice-mobile
npm start
```
✅ Wait for: QR code to appear

### 3. Test on Phone
1. Open **Expo Go** app
2. **Scan QR code** from terminal
3. Tap **Voice Chat** → Select astrologer
4. **Press & hold mic** → Speak → Release
5. See response: **"नमस्ते! मैं आपकी बात सुन रहा हूं..."**

---

## 🔄 Reload App
- **Shake phone** → "Reload"
- Or press `r` in terminal

---

## 🛑 Stop Everything
```bash
lsof -ti:8000 | xargs kill -9  # Stop backend
lsof -ti:8081 | xargs kill -9  # Stop Expo
```

---

## ✅ Quick Health Check
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy",...}
```

---

## 📱 Current Status

| Feature | Status |
|---------|--------|
| Voice Recording | ✅ Working |
| Backend Connection | ✅ Working |
| Text Responses | ✅ Working |
| Audio Responses | 🏗️ Coming Soon |

---

**For detailed instructions:** See [MOBILE_APP_TESTING_GUIDE.md](./MOBILE_APP_TESTING_GUIDE.md)


