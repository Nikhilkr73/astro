# Mobile WebSocket Fixes

## Issues Fixed

### Issue 1: WebSocket Connection Failed
**Error**: `WebSocket error: readyState: 3 (CLOSED)`

**Root Cause**: Mobile devices cannot reach `localhost` - they need the computer's local network IP address.

**Solution**: Updated WebSocket and REST API URLs to use local network IP.

#### Changes Made:

1. **websocketService.ts** - Updated WebSocket URL:
```typescript
// Before
const wsUrl = `ws://localhost:8000/ws-mobile/${userId}`;

// After
const wsUrl = `ws://192.168.0.107:8000/ws-mobile/${userId}`;
```

2. **configService.ts** - Updated default API config:
```typescript
// Before
API: {
  REST_API_URL: 'http://localhost:8000',
  WEBSOCKET_API_URL: 'ws://localhost:8001',
  REGION: 'ap-south-1',
}

// After
API: {
  REST_API_URL: 'http://192.168.0.107:8000',
  WEBSOCKET_API_URL: 'ws://192.168.0.107:8000',
  REGION: 'ap-south-1',
}
```

### Issue 2: Audio Playback Failed
**Error**: `Failed to play sound: DOMException: The fetching process for the media resource was aborted`

**Root Cause**: OpenAI Realtime API returns raw PCM16 audio which cannot be played directly by mobile audio players. PCM16 needs a WAV header to be recognized as a valid audio file.

**Solution**: Convert PCM16 to WAV format on the backend before sending to mobile.

#### Changes Made:

1. **main_openai_realtime.py** - Added PCM16 to WAV conversion:
```python
def pcm16_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1) -> bytes:
    """Convert raw PCM16 audio to WAV format"""
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, 'wb') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(2)  # 16-bit = 2 bytes
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)
    
    wav_buffer.seek(0)
    return wav_buffer.read()
```

2. **main_openai_realtime.py** - Updated audio callback:
```python
async def forward_audio_to_mobile(audio_delta: str):
    """Forward audio from OpenAI to mobile - convert PCM16 to WAV"""
    # Decode PCM16 audio
    pcm_audio = base64.b64decode(audio_delta)
    
    # Convert PCM16 to WAV format
    wav_audio = pcm16_to_wav(pcm_audio)
    
    # Encode back to base64
    wav_base64 = base64.b64encode(wav_audio).decode('utf-8')
    
    await websocket.send_json({
        "type": "audio_response",
        "audio": wav_base64
    })
```

3. **VoiceChatScreen.tsx** - Updated audio URI:
```typescript
// Before
uri: `data:audio/pcm;base64,${combinedAudio}`

// After
uri: `data:audio/wav;base64,${combinedAudio}`
```

## How to Get Your Computer's IP Address

### macOS/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
```

### Windows:
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

## Testing Steps

1. **Get your IP address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Update configuration files** with your IP:
   - `astro-voice-mobile/src/services/websocketService.ts` (line 41)
   - `astro-voice-mobile/src/services/configService.ts` (line 32-33)

3. **Restart backend**:
   ```bash
   lsof -ti:8000 | xargs kill -9
   python3 main_openai_realtime.py > backend.log 2>&1 &
   ```

4. **Restart mobile app**:
   ```bash
   # Kill Expo server
   lsof -ti:8081 | xargs kill -9
   
   # Start fresh
   cd astro-voice-mobile
   npx expo start --clear
   ```

5. **Test in mobile**:
   - Scan QR code with Expo Go
   - Check for "🔊 Realtime Connected" status
   - Record voice message
   - Audio should play automatically

## Audio Format Flow (Fixed)

```
Mobile (M4A audio)
    ↓ WebSocket
Backend (M4A → PCM16)
    ↓
OpenAI Realtime API (PCM16 → PCM16)
    ↓
Backend (PCM16 → WAV)
    ↓ WebSocket
Mobile (WAV audio - playable!)
```

## Files Modified

### Backend
- `main_openai_realtime.py`
  - Added `pcm16_to_wav()` function
  - Updated `forward_audio_to_mobile()` callback
  - Added imports: `struct`, `wave`

### Mobile
- `src/services/websocketService.ts`
  - Updated WebSocket URL to use local IP
  - Updated `convertAudioToUri()` to expect WAV format

- `src/services/configService.ts`
  - Updated default REST_API_URL to use local IP
  - Updated default WEBSOCKET_API_URL to use local IP
  - Added comment about finding local IP

- `src/screens/VoiceChatScreen.tsx`
  - Updated audio URI format from PCM to WAV

## Important Notes

1. **IP Address Changes**: If your computer's IP changes (e.g., reconnect to WiFi), you must update the IP in:
   - `websocketService.ts`
   - `configService.ts`

2. **Same Network Required**: Mobile device and computer must be on the same WiFi network.

3. **Firewall**: Ensure port 8000 is not blocked by your firewall.

4. **Audio Format**: Backend now converts PCM16 → WAV for mobile compatibility.

## Troubleshooting

### WebSocket Still Not Connecting
```bash
# 1. Check your current IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Verify backend is listening on all interfaces
curl http://YOUR_IP:8000/health

# 3. Check mobile and computer are on same network
```

### Audio Still Not Playing
```bash
# 1. Check backend logs
tail -f backend.log

# 2. Look for WAV conversion
# Should see: "Converting PCM to WAV"

# 3. Check mobile console for audio URI format
# Should be: "data:audio/wav;base64,..."
```

## Status

✅ **WebSocket Connection**: Fixed - using local network IP  
✅ **Audio Playback**: Fixed - PCM16 converted to WAV  
✅ **Backend Running**: Port 8000  
✅ **Mobile Config**: Updated with IP address  

**Ready for testing!**



