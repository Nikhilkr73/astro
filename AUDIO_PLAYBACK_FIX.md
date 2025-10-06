# 🔧 Audio Playback Cutting Off - Fix Guide

## 🚨 Problem
AI is generating full response (77 chunks = ~38 seconds of audio), but mobile app playback cuts off in the middle.

## 📊 Server Logs Show
```
✅ Server accumulated 77 chunks (912,000 bytes PCM)
✅ Server converted to WAV successfully
✅ Server sent 1,216,060 base64 chars to mobile
```

**Conclusion:** Server is working correctly. Issue is in mobile app playback.

---

## 🎯 Root Causes (Mobile App)

### **Cause 1: Audio Player Timeout** ⭐ Most Likely
React Native Audio players often have default timeouts (10-30 seconds)

### **Cause 2: Base64 Decode Issues**
Very large base64 strings might fail to decode on some devices

### **Cause 3: Memory Issues**
Large audio files might exceed memory limits on mobile

### **Cause 4: WebSocket Message Size**
Some WebSocket implementations limit message size

---

## ✅ Quick Fixes (In Order of Priority)

### **Fix 1: Check Mobile Audio Player Timeout** ⭐

**File:** `astro-voice-mobile/src/services/audioService.ts` (or wherever audio is played)

**Look for:**
```typescript
// Bad - might have timeout
const sound = new Audio.Sound();
await sound.loadAsync({ uri: audioUri });
await sound.playAsync();
```

**Change to:**
```typescript
// Good - no timeout, increase buffer
const sound = new Audio.Sound();
await sound.loadAsync(
  { uri: audioUri },
  {
    shouldPlay: true,
    progressUpdateIntervalMillis: 500,
    // No timeout!
  }
);
```

---

### **Fix 2: Stream Audio Instead of Accumulating** 🚀

**Current Approach (Accumulate):**
```
OpenAI → Chunk 1, 2, 3...77 → Wait for all → Send WAV → Play
Problem: User waits ~5 seconds before hearing anything
```

**Better Approach (Stream):**
```
OpenAI → Chunk 1 → Play immediately
         Chunk 2 → Play next
         Chunk 3 → Play next
         ...
Result: User hears response instantly
```

**Implementation:**

**Backend Change (`main_openai_realtime.py`):**
```python
# Instead of accumulating, send each chunk immediately
async def forward_audio_to_mobile(audio_delta: str):
    """Stream PCM16 audio chunks directly"""
    try:
        # Send each chunk as it arrives
        await websocket.send_json({
            "type": "audio_chunk",  # New type
            "audio": audio_delta,   # PCM16 base64
            "format": "pcm16"
        })
        print(f"📤 Streamed audio chunk: {len(audio_delta)} chars")
    except Exception as e:
        print(f"❌ Error streaming audio: {e}")
```

**Mobile Change:**
```typescript
// In websocketService.ts
if (data.type === 'audio_chunk') {
  // Queue and play immediately
  audioService.queueAndPlay(data.audio);
}
```

---

### **Fix 3: Split Large Audio into Smaller Parts**

If accumulating is required, split into smaller chunks:

```python
async def send_accumulated_audio():
    if pcm_chunks:
        combined_pcm = b''.join(pcm_chunks)
        
        # Split into 15-second segments
        chunk_size = 24000 * 2 * 15  # 15 seconds of PCM16 mono
        
        for i in range(0, len(combined_pcm), chunk_size):
            segment = combined_pcm[i:i+chunk_size]
            wav_audio = pcm16_to_wav(segment)
            wav_base64 = base64.b64encode(wav_audio).decode('utf-8')
            
            await websocket.send_json({
                "type": "audio_segment",
                "audio": wav_base64,
                "segment_index": i // chunk_size,
                "is_last": (i + chunk_size) >= len(combined_pcm)
            })
            
            # Small delay to prevent overwhelming
            await asyncio.sleep(0.1)
        
        pcm_chunks.clear()
```

---

### **Fix 4: Increase WebSocket Max Message Size**

**Backend (`main_openai_realtime.py`):**
```python
@app.websocket("/ws-mobile/{user_id}")
async def mobile_websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    
    # Increase max message size
    websocket.client.max_size = 10 * 1024 * 1024  # 10MB
```

---

### **Fix 5: Debug Mobile App Audio Player**

Add logging in mobile app to see where it fails:

```typescript
// In audioService.ts or wherever audio plays
try {
  console.log('📥 Received audio length:', audioBase64.length);
  
  const audioData = atob(audioBase64);  // Decode base64
  console.log('📦 Decoded audio bytes:', audioData.length);
  
  const sound = await Audio.Sound.createAsync({
    uri: audioUri
  });
  console.log('✅ Sound loaded successfully');
  
  await sound.playAsync();
  console.log('▶️  Playback started');
  
  // Check playback status
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded) {
      console.log(`⏱️  Playback: ${status.positionMillis}ms / ${status.durationMillis}ms`);
      
      if (status.didJustFinish) {
        console.log('✅ Playback completed');
      }
    }
    
    if (status.error) {
      console.error('❌ Playback error:', status.error);
    }
  });
  
} catch (error) {
  console.error('❌ Audio playback failed:', error);
}
```

---

## 🎯 Recommended Solution

### **Option A: Stream Audio (Best UX)** 🚀
- ✅ User hears response immediately
- ✅ No timeout issues
- ✅ Natural conversation flow
- ⚠️ Requires more code changes

### **Option B: Split into Segments (Quick Fix)** ⭐
- ✅ Easy to implement
- ✅ Solves timeout issue
- ✅ Works with existing code
- ⚠️ Slight pause between segments

### **Option C: Increase Timeouts (Easiest)** 
- ✅ Minimal code change
- ⚠️ User still waits for full response
- ⚠️ Might not work on all devices

---

## 🚀 Immediate Action Plan

### **Step 1: Test Mobile App Audio Player**
Add logging to see:
1. How much audio is received
2. How much audio is played
3. Where it stops

### **Step 2: Check for Timeouts**
Look in mobile audio code for:
- Timeout settings
- Buffer limits
- Max duration settings

### **Step 3: Implement Quick Fix**
Based on findings, either:
- Remove timeouts
- Split into segments
- Stream audio

---

## 📝 Files to Check

1. `astro-voice-mobile/src/services/audioService.ts`
2. `astro-voice-mobile/src/screens/VoiceChatScreen.tsx`
3. `astro-voice-mobile/src/components/AudioPlayer.tsx` (if exists)

---

## 🧪 Test Cases

### **Test 1: Short Response**
- Give birth details
- Ask simple question: "हां या ना?"
- **Expected:** Should play completely

### **Test 2: Long Response**  
- Give birth details
- Ask: "मेरी कुंडली का पूरा विश्लेषण करें"
- **Expected:** Currently cuts off, should play completely after fix

---

**Would you like me to check your mobile app audio code and implement the fix?**