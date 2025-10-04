# Voice Astrology System

A real-time voice-based AI astrology consultation system powered by OpenAI's GPT-4o-mini-realtime-preview. Supports both web and mobile applications with true voice-to-voice interaction in Hindi.

## 🎯 Latest Updates (Current Session)

### WebSocket Migration (TRUE Realtime Voice-to-Voice)
- ✅ **Removed unnecessary transcription/TTS steps** - Now uses direct voice-to-voice via OpenAI Realtime API
- ✅ **Added WebSocket endpoint for mobile** - `/ws-mobile/{user_id}` for true streaming
- ✅ **Created WebSocketService** - Mobile app now uses WebSocket instead of REST for voice
- ✅ **Backed up REST implementation** - Saved to `main_openai_realtime_backup.py` for future use
- ✅ **Updated mobile UI** - Shows realtime connection status
- ✅ **Audio streaming** - Real-time audio chunks from OpenAI to mobile

### Key Architecture Changes
1. **Mobile → WebSocket → OpenAI Realtime API** (voice-to-voice streaming)
2. **No intermediate transcription** (direct audio processing)
3. **No TTS step** (OpenAI generates voice directly)
4. **Real-time bidirectional streaming** (true conversational AI)

## 🚀 Features

- 🎤 **Voice-to-Voice Interaction**: Direct voice conversation using OpenAI Realtime API
- 🌐 **Web Application**: Fully functional web interface with streaming audio
- 📱 **Mobile Application**: React Native + Expo with WebSocket support
- 🔄 **Real-time Streaming**: Bidirectional WebSocket for audio streaming
- 🇮🇳 **Hindi Language**: Native Hindi astrology consultations
- 🎭 **Multiple Astrologers**: Different AI personalities with unique voices
- ☁️ **AWS Ready**: Complete CDK infrastructure for production deployment

## 🏗️ Architecture

### Current Implementation (Voice-to-Voice)

```
Mobile App (React Native)
    ↓ WebSocket (M4A audio)
Backend (FastAPI)
    ↓ Converts M4A → PCM16
OpenAI Realtime API
    ↓ Streams PCM16 audio response
Backend (FastAPI)
    ↓ WebSocket (PCM16 audio)
Mobile App (plays audio)
```

### Web Application
```
Browser → WebSocket → Backend → OpenAI Realtime API
                                        ↓
Browser ← WebSocket ← Backend ← Audio Streaming
```

## 📁 Project Structure

```
voice_v1/
├── main_openai_realtime.py          # FastAPI backend with OpenAI Realtime
├── main_openai_realtime_backup.py   # REST API backup (for reference)
├── openai_realtime_handler.py       # OpenAI Realtime connection manager
├── user_state_manager.py            # User profile and conversation history
├── astro-voice-mobile/              # React Native mobile app
│   ├── src/
│   │   ├── screens/
│   │   │   └── VoiceChatScreen.tsx  # Main voice chat (WebSocket)
│   │   ├── services/
│   │   │   ├── websocketService.ts  # WebSocket client
│   │   │   ├── audioService.ts      # Audio recording
│   │   │   └── apiService.ts        # REST API (fallback)
│   │   └── components/
│   │       ├── VoiceRecorder.tsx    # Voice recording UI
│   │       └── AudioPlayer.tsx      # Audio playback
├── static/                           # Web interface
│   └── voice_realtime_index.html    # Web app (functional)
├── logs/                            # Application logs
├── cdk/                             # AWS CDK infrastructure
└── docs/                            # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+ (for mobile app)
- OpenAI API key
- Expo CLI (for mobile development)

### 1. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env_example.txt .env

# Add your OpenAI API key to .env
echo "OPENAI_API_KEY=your_key_here" >> .env

# Start backend
python3 main_openai_realtime.py
```

Backend will run on `http://localhost:8000`

### 2. Web Application (Already Working)

```bash
# Open browser
open http://localhost:8000/voice-realtime
```

### 3. Mobile Application

**Important**: Mobile devices can't reach `localhost`. You need to use your computer's local IP address.

```bash
# Get your computer's IP address
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
# Example output: 192.168.0.107

# Update IP in these files:
# - astro-voice-mobile/src/services/websocketService.ts (line 41)
# - astro-voice-mobile/src/services/configService.ts (line 32-33)

# Navigate to mobile app
cd astro-voice-mobile

# Install dependencies
npm install

# Start Expo
npx expo start

# Scan QR code with Expo Go app (must be on same WiFi network)
```

## 🔌 API Endpoints

### REST API
- `GET /health` - Health check
- `GET /voice-realtime` - Web interface
- `POST /api/process-text` - Text message processing (legacy)

### WebSocket Endpoints
- `ws://localhost:8000/ws/{user_id}` - Web voice chat
- `ws://localhost:8000/ws-mobile/{user_id}` - Mobile voice chat (TRUE realtime)

## 📱 Mobile WebSocket Protocol

### Client → Server
```json
{
  "type": "audio",
  "audio": "base64_encoded_m4a_audio"
}
```

### Server → Client
```json
{
  "type": "audio_response",
  "audio": "base64_encoded_pcm16_audio"
}
```

```json
{
  "type": "text_response",
  "text": "Transcribed response text"
}
```

## 🔧 Key Technical Details

### Audio Processing
- **Mobile Recording**: M4A format (iOS/Android native)
- **OpenAI Realtime**: PCM16 24kHz mono required
- **Backend Conversion**: M4A → PCM16 using pydub
- **Streaming**: Base64-encoded audio chunks via WebSocket

### OpenAI Realtime API
- **Model**: gpt-4o-mini-realtime-preview
- **Input**: PCM16 audio chunks
- **Output**: PCM16 audio + text transcription
- **Latency**: ~200-500ms for voice responses

### WebSocket Flow
1. Mobile connects to `/ws-mobile/{user_id}`
2. Backend connects to OpenAI Realtime API
3. Mobile sends M4A audio chunks
4. Backend converts to PCM16
5. Backend forwards to OpenAI
6. OpenAI streams PCM16 response
7. Backend forwards to mobile
8. Mobile plays audio in real-time

## 📚 Documentation

- `PROJECT_SPEC.md` - Complete project specification
- `PROJECT_TASKS.md` - Development roadmap (34 tasks, 6 phases)
- `MOBILE_APP_SPEC.md` - Mobile app detailed spec
- `AWS_ARCHITECTURE_SPEC.md` - AWS deployment architecture
- `MOBILE_APP_TESTING_GUIDE.md` - Mobile testing guide
- `LOGGING_GUIDE.md` - Logging and debugging guide
- `QUICK_START.md` - Quick reference guide

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:8000/health
```

### Test Web Interface
1. Navigate to `http://localhost:8000/voice-realtime`
2. Click microphone button
3. Speak in Hindi
4. Listen to voice response

### Test Mobile App
1. Ensure backend is running
2. Start Expo: `npx expo start`
3. Scan QR code with Expo Go
4. Select an astrologer
5. Record voice message
6. Check connection status shows "🔊 Realtime Connected"
7. Receive voice response

## 🔄 Recent Changes Summary

### What Changed (This Session)
1. **Backend Migration**:
   - Changed from REST (Whisper → GPT → TTS) to WebSocket (direct Realtime API)
   - Added `/ws-mobile/{user_id}` endpoint
   - Implemented M4A to PCM16 conversion
   - Audio streaming via WebSocket callbacks

2. **Mobile App Changes**:
   - Created `websocketService.ts` for WebSocket communication
   - Updated `VoiceChatScreen.tsx` to use WebSocket
   - Added real-time connection status UI
   - Removed dependency on REST API for voice

3. **Backup Created**:
   - `main_openai_realtime_backup.py` - Contains REST API implementation for future use

### Why These Changes
- **Original issue**: Backend was doing Whisper transcription + OpenAI TTS unnecessarily
- **Solution**: Use OpenAI Realtime API's native voice-to-voice capability
- **Result**: Lower latency, better voice quality, true real-time experience

## 🐛 Troubleshooting

### Mobile App Issues

**WebSocket not connecting:**
```bash
# 1. Get your computer's IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Update IP in mobile app config files (see above)

# 3. Ensure mobile and computer are on SAME WiFi network

# 4. Check backend is accessible from your IP
curl http://YOUR_IP:8000/health
```

**Audio not playing:**
- Backend now converts PCM16 → WAV automatically
- Check if `isConnected` shows green "🔊 Realtime Connected" status
- Verify audio chunks are being received (check console)
- Ensure AudioPlayer component receives WAV format: `data:audio/wav;base64,...`

**"DOMException: The fetching process was aborted" error:**
- This was fixed by converting PCM16 to WAV format
- Ensure you're running the latest backend version
- Check backend logs for "Converting PCM to WAV" messages

**Backend errors:**
```bash
# Check logs
tail -f /Users/nikhil/workplace/voice_v1/backend.log

# Or use helper script
./tail_logs.sh
```

### IP Address Changed
If you reconnect to WiFi or your IP changes:
```bash
# 1. Get new IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Update in:
# - astro-voice-mobile/src/services/websocketService.ts
# - astro-voice-mobile/src/services/configService.ts

# 3. Restart Expo
lsof -ti:8081 | xargs kill -9
cd astro-voice-mobile && npx expo start --clear
```

### Web App Issues
- Check browser console for errors
- Ensure microphone permissions granted
- Verify OpenAI API key is set

## 🔐 Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
LOG_LEVEL=INFO
PORT=8000
```

## 🎯 Next Steps

1. **Complete Testing**: Verify end-to-end voice flow on mobile
2. **Optimize Audio**: Fine-tune PCM16 conversion and playback
3. **Add Error Handling**: Implement retry logic for WebSocket disconnects
4. **Enhance UI**: Add waveform visualization, speaking indicators
5. **Deploy to AWS**: Use CDK to deploy production infrastructure

## 📝 License

This project is for educational and prototyping purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Status**: ✅ WebSocket migration complete, ready for testing
**Last Updated**: Current session - Migrated to true voice-to-voice via WebSocket
