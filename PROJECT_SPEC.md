# Voice Astrology System - Project Specification

## 🌟 Project Overview

A real-time voice-based astrology consultation system that uses advanced AI to conduct natural conversations in Hindi, collecting birth information and providing personalized astrological readings through pure voice interaction.

## 🎯 Core Features

### 1. **Voice-to-Voice Conversation**
- **No text interface** - Pure voice experience
- **Real-time AI responses** - Natural conversation flow
- **Hindi language support** - Native multilingual AI
- **Human-like voice synthesis** - Professional audio quality

### 2. **Birth Data Collection**
- **Natural conversation flow** - No forms or rigid structure
- **Smart information extraction** - AI automatically captures:
  - Name/preferred calling name
  - Birth date (month, day, year)
  - Birth time (exact or approximate)
  - Birth location (city, country)
- **Progressive data gathering** - One piece at a time
- **Context persistence** - Remembers previous conversations

### 3. **Astrological Analysis**
- **Personalized readings** - Based on collected birth data
- **Real-time insights** - Career, love, spiritual guidance
- **Zodiac calculations** - Sun sign and house analysis
- **Hindi astrological terminology** - Authentic experience

## 🏗️ Technical Architecture

### **OpenAI Realtime System**
- **AI Engine:** OpenAI GPT-4o-mini-realtime-preview
- **Voice Processing:** Direct voice-to-voice streaming
- **Audio Format:** PCM16, 24kHz sample rate
- **Connection:** WebSocket real-time streaming
- **Advantages:** Natural voice, no truncation, lower latency

## 📁 Project Structure

```
voice_v1/
├── main_openai_realtime.py     # OpenAI realtime server
├── openai_realtime_handler.py  # OpenAI realtime integration
├── astrology_profile.py       # Birth data management
├── user_states.json           # User conversation state
├── .env                       # API keys and configuration
├── logs/                      # System logs directory
└── static/                    # Frontend files
    ├── voice_realtime_index.html  # Realtime interface
    └── voice_realtime_script.js   # Realtime JavaScript
```

## 🔧 Configuration

### **Environment Variables (.env)**
```bash
# OpenAI API Key for realtime system
OPENAI_API_KEY=sk-proj-...

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### **API Keys Required:**
- **OpenAI API Key** - For GPT-4o-mini-realtime-preview

## 🚀 System Endpoints

### **OpenAI Realtime System:**
- **Main Interface:** `http://localhost:8000/voice_realtime`
- **WebSocket:** `ws://localhost:8000/ws/{user_id}`
- **Root:** `http://localhost:8000/` (redirects to realtime)

## 📊 Data Flow

### **OpenAI Realtime Flow:**
1. **User speaks** → Browser captures audio (PCM16)
2. **Audio streaming** → Sent to OpenAI via WebSocket
3. **AI processing** → GPT-4o processes voice directly
4. **Voice response** → OpenAI streams voice back
5. **Audio playback** → Browser plays AI voice response

## 📈 Performance Characteristics

### **OpenAI Realtime:**
- **Latency:** ~500-1000ms (real-time streaming)
- **Voice Quality:** Professional, human-like
- **Language Support:** Native Hindi pronunciation
- **Response Length:** No truncation limits
- **Reliability:** High (direct API integration)

## 🛠️ Dependencies

### **Core Libraries:**
```bash
fastapi              # Web server framework
uvicorn             # ASGI server
websockets          # WebSocket support
openai              # OpenAI API client
aiohttp             # HTTP client for WebSocket
python-dotenv       # Environment variables
```

### **System Requirements:**
- **Python 3.8+**
- **Modern browser** (WebRTC support)

## 📝 User State Management

### **User States (user_states.json):**
```json
{
  "user_001": {
    "name": "Nikhil Kumar",
    "birth_date": "2000-03-04",
    "birth_time": "08:00",
    "birth_location": "Ranchi, Jharkhand",
    "timezone": null,
    "profile_complete": true
  }
}
```

### **Conversation History:**
- **Stored in memory** during session
- **Last 20 exchanges** per user
- **Context sharing** between AI calls

## 🔍 Logging & Debugging

### **Log Directory:** `/logs/`
- **Server logs:** `voice_agent_YYYYMMDD_HHMMSS.log`
- **Audio processing:** `audio_processing_user_XXX.json`
- **AI interactions:** `grok_interactions_user_XXX.json`

### **Debug Information:**
- WebSocket connection status
- Audio processing metrics
- AI response timing
- Error traces and recovery

## 🚨 Known Issues & Solutions

### **Issue 1: WebSocket Connection Failure**
- **Problem:** `extra_headers` compatibility with websockets library
- **Solution:** Use aiohttp WebSocket client instead
- **Status:** Fixed in latest implementation

### **Issue 2: Voice Response Truncation**
- **Problem:** TTS length limits causing cut-off responses
- **Solution:** Migrate to OpenAI realtime for unlimited responses
- **Status:** Resolved with OpenAI implementation

### **Issue 3: Robotic Voice Quality**
- **Problem:** macOS `say` command produces synthetic voice
- **Solution:** Use OpenAI's natural voice synthesis
- **Status:** Resolved with OpenAI implementation

## 🎯 Future Enhancements

### **Phase 1: Core Stability**
- [ ] Fix OpenAI WebSocket connection
- [ ] Implement error recovery mechanisms
- [ ] Add connection health monitoring
- [ ] Optimize audio streaming performance

### **Phase 2: User Experience**
- [ ] Voice emotion detection
- [ ] Multiple Hindi voice options
- [ ] Regional language support
- [ ] Conversation history UI

### **Phase 3: Advanced Features**
- [ ] Multi-user support
- [ ] Voice biometric identification
- [ ] Advanced astrological calculations
- [ ] Mobile app integration

## 🔐 Security Considerations

### **API Key Protection:**
- Environment variables only
- No hardcoded credentials
- Secure file permissions on .env

### **User Data Privacy:**
- Birth information stored locally
- No data transmission to third parties
- User consent for data collection

### **Audio Security:**
- Temporary audio file cleanup
- No permanent audio storage
- Encrypted WebSocket connections

## 📞 Support & Maintenance

### **Monitoring:**
- WebSocket connection health
- API rate limit tracking
- Audio processing success rates
- User session analytics

### **Backup Systems:**
- Graceful degradation of features
- Error message delivery to users

---

## 🏁 Quick Start Guide

### **OpenAI Realtime System**
```bash
# Start the OpenAI realtime server
python3 main_openai_realtime.py

# Access the interface
open http://localhost:8000/voice_realtime
```

### **Environment Setup:**
1. Copy `.env.example` to `.env`
2. Add your OpenAI API key
3. Install dependencies: `pip install -r requirements.txt`
4. Start the server

---

*This specification reflects the current state as of October 2, 2024, using OpenAI realtime implementation only.*