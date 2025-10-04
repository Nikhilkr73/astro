# 📊 Quick Log Reference

## 🔥 Tail Logs (Most Common)

```bash
# Watch backend logs live
tail -f backend.log

# Filter for important events
tail -f backend.log | grep -E "📱|🎤|📝|✅|❌"

# Use helper script
./tail_logs.sh backend
```

## 📝 What You'll See

When you send a voice message from mobile:

```log
📱 Mobile API request from user user-123 for astrologer ast_001
🔊 Received 93819 bytes of audio
🎤 Transcribing audio with Whisper...
📝 Transcribed: मेरा नाम निखिल है
🤖 Getting response from OpenAI GPT-4...
✅ OpenAI response: नमस्ते निखिल! बहुत सुंदर नाम है...
```

## 🔍 Quick Searches

```bash
# Find errors
grep "❌" backend.log

# See all transcriptions  
grep "📝 Transcribed" backend.log

# Count API requests
grep -c "Mobile API request" backend.log

# Last 50 lines
tail -50 backend.log
```

## 📚 Full Guides

- [LOGGING_GUIDE.md](./LOGGING_GUIDE.md) - Complete logging guide
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - What's working now
- [MOBILE_APP_TESTING_GUIDE.md](./MOBILE_APP_TESTING_GUIDE.md) - Testing guide
