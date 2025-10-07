# Quick Reference - WebSocket Voice System

## 🚀 Start Everything

```bash
# 1. Start Backend (in project root)
python3 main_openai_realtime.py > backend.log 2>&1 &

# 2. Check Backend Health
curl http://localhost:8000/health

# 3. Start Mobile App
cd astro-voice-mobile
npx expo start
```

## 📁 Key Files

### Backend (Python)
```
main_openai_realtime.py              # Main backend with WebSocket
  ↳ Line 126: /ws-mobile/{user_id}   # Mobile WebSocket endpoint
  ↳ Line 186: /ws/{user_id}          # Web WebSocket endpoint

main_openai_realtime_backup.py      # OLD REST implementation (backup)

openai_realtime_handler.py           # OpenAI Realtime connection manager
```

### Mobile (TypeScript/React Native)
```
src/services/websocketService.ts     # WebSocket client
  ↳ Line 37: connect()               # Connect to WebSocket
  ↳ Line 71: sendAudio()             # Send audio to server

src/screens/VoiceChatScreen.tsx      # Main voice chat screen
  ↳ Line 44: WebSocket connection    # Connect on mount
  ↳ Line 83: handleRecordingComplete # Send audio via WS
  ↳ Line 131: Audio response handler # Collect chunks
```

### Documentation
```
README.md                            # Project overview
WEBSOCKET_MIGRATION.md              # Migration guide
SESSION_SUMMARY.md                  # What changed this session
PROJECT_SPEC.md                     # Full specification
```

## 🔌 WebSocket Endpoints

| Endpoint | Purpose | Client |
|----------|---------|--------|
| `ws://localhost:8000/ws-mobile/{user_id}` | Mobile voice chat | React Native |
| `ws://localhost:8000/ws/{user_id}` | Web voice chat | Browser |

## 📨 WebSocket Protocol

### Send Audio (Mobile → Server)
```json
{
  "type": "audio",
  "audio": "base64_m4a_audio"
}
```

### Receive Audio (Server → Mobile)
```json
{
  "type": "audio_response",
  "audio": "base64_pcm16_audio"
}
```

### Receive Text (Server → Mobile)
```json
{
  "type": "text_response",
  "text": "Transcribed text"
}
```

## 🎯 Audio Flow

```
📱 Mobile Records (M4A)
    ↓
📤 WebSocket Send
    ↓
🔄 Backend Converts (M4A → PCM16)
    ↓
🤖 OpenAI Realtime API (Voice-to-Voice)
    ↓
📥 Backend Receives PCM16 chunks
    ↓
📤 WebSocket Send (streaming)
    ↓
🔊 Mobile Plays Audio
```

## 🐛 Debug Commands

```bash
# Check backend running
lsof -i:8000

# View logs
tail -f backend.log

# Kill backend
lsof -ti:8000 | xargs kill -9

# Test health
curl http://localhost:8000/health

# Test WebSocket (will fail with curl, use mobile app)
curl http://localhost:8000/ws-mobile/test-user
```

## ✅ Testing Checklist

- [ ] Backend health check returns `{"status":"healthy"}`
- [ ] Mobile app shows "🔊 Realtime Connected"
- [ ] Record voice message successfully
- [ ] Backend logs show "📱 Sending audio to Realtime API"
- [ ] Audio response plays automatically
- [ ] Messages appear in chat

## 🔧 Common Issues

### WebSocket Not Connecting
```bash
# Check backend is running
curl http://localhost:8000/health

# Check logs for errors
tail -f backend.log
```

### No Audio Playing
1. Check connection status (should be green)
2. Check console for "Received audio chunk"
3. Verify AudioPlayer has valid URI

### Backend Crashes
```bash
# Check logs
tail -f backend.log

# Restart backend
lsof -ti:8000 | xargs kill -9
python3 main_openai_realtime.py > backend.log 2>&1 &
```

## 📦 Backup Location

**Old REST implementation**: `main_openai_realtime_backup.py`

Contains:
- Whisper transcription
- GPT-4o-mini text processing  
- OpenAI TTS
- REST API endpoints

Use for:
- Reference
- Future REST projects
- Batch processing

## 🔑 Environment

```bash
# Required in .env
OPENAI_API_KEY=sk-...

# Backend runs on
http://localhost:8000
ws://localhost:8000
```

## 📝 What Changed Today

1. ✅ Migrated REST → WebSocket
2. ✅ Removed Whisper transcription (unnecessary)
3. ✅ Removed TTS (unnecessary)
4. ✅ Direct voice-to-voice via OpenAI Realtime
5. ✅ Added mobile WebSocket support
6. ✅ Backed up old implementation
7. ✅ Updated all documentation

## 🎯 Next Steps

1. Test mobile app with Expo Go
2. Verify audio quality
3. Add error handling
4. Optimize audio buffering
5. Deploy to AWS (when ready)

---

**Quick Test**: 
```bash
curl http://localhost:8000/health && echo "✅ Ready!"
```



