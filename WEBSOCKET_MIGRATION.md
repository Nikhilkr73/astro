# WebSocket Migration - REST to Realtime Voice-to-Voice

## Overview
Migrated from REST API with intermediate transcription/TTS to true voice-to-voice using OpenAI Realtime API via WebSocket.

## Problem Statement
The initial implementation was doing unnecessary steps:
1. Mobile sends audio (M4A) → Backend
2. Backend transcribes with Whisper (audio → text)
3. Backend sends text to GPT-4o-mini
4. Backend converts response to audio with TTS
5. Backend sends audio back to mobile

**Issue**: OpenAI GPT-4o-mini-realtime-preview is ALREADY voice-to-voice! The transcription and TTS steps were redundant and added latency.

## Solution
Direct voice-to-voice streaming via WebSocket:
1. Mobile sends audio (M4A) via WebSocket → Backend
2. Backend converts M4A → PCM16
3. Backend sends PCM16 to OpenAI Realtime API
4. OpenAI streams PCM16 audio response
5. Backend forwards audio chunks to mobile via WebSocket
6. Mobile plays audio in real-time

## Changes Made

### Backend (`main_openai_realtime.py`)

#### 1. Added Mobile WebSocket Endpoint
```python
@app.websocket("/ws-mobile/{user_id}")
async def mobile_websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for mobile app - direct Realtime API integration"""
    await websocket.accept()
    
    # Connect to OpenAI
    if not openai_realtime_handler.is_connected:
        await openai_realtime_handler.connect_to_openai()
    
    # Set up callbacks to forward audio
    async def forward_audio_to_mobile(audio_delta: str):
        await websocket.send_json({
            "type": "audio_response",
            "audio": audio_delta
        })
    
    openai_realtime_handler.set_audio_callback(forward_audio_to_mobile)
    
    while True:
        message = await websocket.receive_json()
        
        if message["type"] == "audio":
            # Convert M4A to PCM16
            audio_bytes = base64.b64decode(message["audio"])
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="m4a")
            audio_segment = audio_segment.set_frame_rate(24000).set_channels(1).set_sample_width(2)
            pcm_audio = audio_segment.raw_data
            
            # Send to OpenAI Realtime API
            await openai_realtime_handler.send_audio(pcm_audio, user_id)
```

#### 2. Modified REST Endpoint (Fallback Only)
```python
@app.post("/api/process-audio")
async def process_audio_rest(request: Request):
    """REST API fallback - redirects to use WebSocket for true realtime"""
    return {
        "success": False,
        "error": "Please use WebSocket connection for voice chat",
        "websocket_url": f"ws://localhost:8000/ws-mobile/{{user_id}}"
    }
```

### Mobile App Changes

#### 1. Created WebSocket Service (`websocketService.ts`)
```typescript
export class WebSocketService {
  private static ws: WebSocket | null = null;
  
  static connect(userId: string, callbacks: RealtimeCallbacks): Promise<void> {
    const wsUrl = `ws://localhost:8000/ws-mobile/${userId}`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }
  
  static async sendAudio(recording: AudioRecording): Promise<void> {
    const message = {
      type: 'audio',
      audio: base64EncodedAudio,
    };
    this.ws.send(JSON.stringify(message));
  }
}
```

#### 2. Updated VoiceChatScreen (`VoiceChatScreen.tsx`)
```typescript
// Connect on mount
useEffect(() => {
  WebSocketService.connect('user-123', {
    onAudioResponse: (audioBase64) => {
      setAudioResponseChunks(prev => [...prev, audioBase64]);
    },
    onTextResponse: (text) => {
      console.log('Text:', text);
    },
  });
  
  return () => WebSocketService.disconnect();
}, []);

// Send audio via WebSocket
const handleRecordingComplete = async (recording: AudioRecording) => {
  await WebSocketService.sendAudio(recording);
};
```

#### 3. Updated UI for Connection Status
```typescript
<View style={[styles.connectionStatus, isConnected ? styles.connected : styles.disconnected]}>
  <Text style={styles.connectionText}>
    {isConnected ? '🔊 Realtime Connected' : '⏳ Connecting...'}
  </Text>
</View>
```

## Audio Format Flow

### Before (REST - WRONG)
```
Mobile (M4A) → Backend → Whisper (M4A→Text) → GPT-4o-mini (Text→Text) → TTS (Text→MP3) → Mobile
```

### After (WebSocket - CORRECT)
```
Mobile (M4A) → Backend (M4A→PCM16) → OpenAI Realtime (PCM16→PCM16) → Mobile
```

## Protocol

### Client → Server Messages
```json
{
  "type": "audio",
  "audio": "base64_encoded_m4a_audio"
}
```

```json
{
  "type": "ping"
}
```

### Server → Client Messages
```json
{
  "type": "audio_response",
  "audio": "base64_encoded_pcm16_audio"
}
```

```json
{
  "type": "text_response",
  "text": "Transcribed text from OpenAI"
}
```

```json
{
  "type": "pong"
}
```

```json
{
  "type": "error",
  "error": "Error message"
}
```

## Benefits

1. **Lower Latency**: No intermediate transcription/TTS steps
2. **Better Quality**: Direct voice-to-voice from OpenAI
3. **True Streaming**: Real-time audio chunks, not batch processing
4. **Cost Effective**: Single API call instead of 3 (Whisper + GPT + TTS)
5. **Simpler Architecture**: Direct WebSocket connection

## Backup

The old REST API implementation has been backed up to:
- `main_openai_realtime_backup.py`

This can be used for:
- Reference implementation
- Future projects that need REST-based voice processing
- Fallback if WebSocket isn't suitable

## Testing

### 1. Check Backend Health
```bash
curl http://localhost:8000/health
```

### 2. Test WebSocket Connection
```bash
# Backend should be running
python3 main_openai_realtime.py

# Mobile app should show "🔊 Realtime Connected"
```

### 3. Test Voice Flow
1. Open mobile app
2. Record voice message
3. Check console: "📱 Sending audio to Realtime API"
4. Receive streamed audio response
5. Audio plays automatically

## Troubleshooting

### WebSocket Not Connecting
```bash
# Check backend logs
tail -f backend.log

# Should see: "📱 Mobile WebSocket connected: user-123"
```

### No Audio Response
```bash
# Check OpenAI connection
# Should see: "🎤 Sending audio to OpenAI Realtime API (voice-to-voice)"

# Check audio chunks
# Should see: "🔊 Received audio chunk from Realtime API"
```

### Audio Not Playing
- Verify `isConnected` is true
- Check `audioResponseChunks` has data
- Ensure AudioPlayer receives valid URI

## Next Steps

1. ✅ WebSocket migration complete
2. ⏳ Test end-to-end on mobile
3. ⏳ Optimize audio buffering
4. ⏳ Add retry logic for disconnections
5. ⏳ Implement text response display
6. ⏳ Add speaking indicators/waveforms

## Files Modified

### Backend
- ✅ `main_openai_realtime.py` - Added WebSocket endpoint
- ✅ `main_openai_realtime_backup.py` - Backed up REST implementation

### Mobile
- ✅ `src/services/websocketService.ts` - New WebSocket client
- ✅ `src/screens/VoiceChatScreen.tsx` - Use WebSocket instead of REST
- ✅ UI updates for connection status

### Documentation
- ✅ `README.md` - Updated with WebSocket architecture
- ✅ `WEBSOCKET_MIGRATION.md` - This document

## Conclusion

Successfully migrated from REST API with unnecessary transcription/TTS to true voice-to-voice streaming via WebSocket and OpenAI Realtime API. The system now provides:
- Direct voice-to-voice interaction
- Real-time audio streaming
- Lower latency
- Better user experience

**Status**: ✅ Complete and ready for testing



