# 📊 Logging & Debugging Guide

## 🎯 Overview

This guide shows you how to monitor logs and debug the Voice Astrology app.

---

## 📝 Available Logs

### 1. **Backend API Logs** (`backend.log`)
- API requests from mobile app
- OpenAI Whisper transcriptions
- GPT-4 responses
- Error traces

### 2. **Historical Logs** (`logs/` directory)
- Past voice agent sessions
- Audio processing logs
- Grok interactions (if used)

---

## 🔍 How to Tail Logs

### Method 1: Using the Helper Script (Recommended)

```bash
# Tail backend logs
./tail_logs.sh backend

# See all options
./tail_logs.sh
```

### Method 2: Direct Commands

```bash
# Follow backend logs in real-time
tail -f backend.log

# Last 100 lines
tail -100 backend.log

# Watch for errors only
tail -f backend.log | grep -i error

# Watch for OpenAI responses
tail -f backend.log | grep "OpenAI"

# Watch mobile API requests
tail -f backend.log | grep "📱"
```

### Method 3: Search Logs

```bash
# Search for specific text
grep "user-123" backend.log

# Search with context (5 lines before and after)
grep -C 5 "error" backend.log

# Case-insensitive search
grep -i "transcribed" backend.log

# Count occurrences
grep -c "Mobile API request" backend.log
```

---

## 📊 Understanding Log Messages

### Backend API Log Format

| Emoji | Meaning | Example |
|-------|---------|---------|
| 📱 | Mobile API request | `📱 Mobile API request from user user-123` |
| 🔊 | Audio received | `🔊 Received 93819 bytes of audio` |
| 🎤 | Audio transcription | `🎤 Transcribing audio with Whisper...` |
| 📝 | Transcribed text | `📝 Transcribed: मेरा नाम राज है` |
| 🤖 | OpenAI processing | `🤖 Getting response from OpenAI GPT-4...` |
| ✅ | Success | `✅ OpenAI response: नमस्ते राज!...` |
| ❌ | Error | `❌ Error processing audio: ...` |
| 🔌 | Connection status | `🔌 Connected to OpenAI Realtime API` |

### Example Log Flow

```log
INFO: 127.0.0.1:63483 - "POST /api/process-audio HTTP/1.1" 200 OK
📱 Mobile API request from user user-123 for astrologer ast_001
🔊 Received 93819 bytes of audio
🎤 Transcribing audio with Whisper...
📝 Transcribed: मेरा नाम निखिल है
🤖 Getting response from OpenAI GPT-4...
✅ OpenAI response: नमस्ते निखिल! बहुत सुंदर नाम है...
```

---

## 🐛 Debug Mode

### Enable Verbose Logging

Edit `main_openai_realtime.py`:

```python
# Change log level to DEBUG
uvicorn.run(
    app,
    host=host,
    port=port,
    log_level="debug"  # Changed from "info"
)
```

### Add Custom Debug Logs

```python
# Add anywhere in the code
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug(f"🔍 Debug info: {variable}")
```

---

## 🔎 Common Debugging Scenarios

### Scenario 1: Voice Not Transcribing

**Check logs for:**
```bash
grep "Transcribing" backend.log
```

**Possible issues:**
- `❌ Error: Invalid audio format` → Audio format issue
- No transcription message → API key problem
- Timeout → Network or API issue

**Solution:**
```bash
# Check OpenAI API key
grep "OPENAI_API_KEY" .env

# Test Whisper directly
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@test.webm" \
  -F model="whisper-1"
```

### Scenario 2: Getting Default Responses

**Check logs for:**
```bash
grep "OpenAI response" backend.log
```

**If you see:**
- Hardcoded message → Update not applied, restart server
- Error before response → OpenAI API issue

**Solution:**
```bash
# Restart backend
lsof -ti:8000 | xargs kill -9
python3 main_openai_realtime.py > backend.log 2>&1 &

# Verify integration
curl http://localhost:8000/health
```

### Scenario 3: Network Errors from Mobile

**Check logs for:**
```bash
tail -f backend.log | grep "Mobile API"
```

**If no logs appear:**
- Mobile app not reaching backend
- CORS issue
- Wrong API URL

**Solution:**
```bash
# Test API directly
curl -X POST http://localhost:8000/api/process-audio \
  -H "Content-Type: application/json" \
  -d '{"audio_base64":"test","user_id":"test"}'

# Check CORS headers
curl -I -X OPTIONS http://localhost:8000/api/process-audio
```

---

## 📈 Performance Monitoring

### Track Response Times

```bash
# Extract API response times
grep "INFO:" backend.log | awk '{print $NF}' | grep "ms"

# Count requests per minute
grep "Mobile API request" backend.log | awk '{print $1,$2}' | uniq -c
```

### Monitor OpenAI API Usage

```bash
# Count API calls
grep "Getting response from OpenAI" backend.log | wc -l

# Track transcription calls
grep "Transcribing audio" backend.log | wc -l

# See all user IDs
grep "user user-" backend.log | sed 's/.*user-/user-/' | sort -u
```

---

## 🛠️ Advanced Log Analysis

### Create a Log Dashboard

```bash
# Create a real-time dashboard
watch -n 1 '
echo "=== Backend Status ===" &&
curl -s http://localhost:8000/health | jq . &&
echo "" &&
echo "=== Last 5 Requests ===" &&
tail -5 backend.log | grep "📱" &&
echo "" &&
echo "=== Error Count ===" &&
grep -c "❌" backend.log
'
```

### Export Logs for Analysis

```bash
# Export today's logs
grep "$(date +%Y-%m-%d)" backend.log > logs_today.txt

# Export specific user session
grep "user-123" backend.log > user_123_session.log

# Create summary
echo "Summary for $(date)" > summary.txt
echo "Total requests: $(grep -c 'Mobile API request' backend.log)" >> summary.txt
echo "Errors: $(grep -c '❌' backend.log)" >> summary.txt
echo "OpenAI calls: $(grep -c 'Getting response' backend.log)" >> summary.txt
```

---

## 🚨 Error Patterns & Solutions

### Common Errors

| Error Pattern | Cause | Solution |
|---------------|-------|----------|
| `Connection refused` | Backend not running | `python3 main_openai_realtime.py &` |
| `Invalid audio format` | Wrong audio encoding | Check WebM format, sample rate |
| `API key not found` | Missing .env | Copy `.env.example` to `.env` |
| `Rate limit exceeded` | Too many requests | Wait or upgrade OpenAI plan |
| `Timeout` | Slow network/API | Check internet, retry |
| `CORS error` | Mobile app blocked | Verify CORS middleware added |

### Debug Checklist

When something goes wrong:

1. ✅ **Check backend is running**
   ```bash
   curl http://localhost:8000/health
   ```

2. ✅ **Check logs for errors**
   ```bash
   tail -50 backend.log | grep "❌"
   ```

3. ✅ **Verify API key**
   ```bash
   grep OPENAI_API_KEY .env
   ```

4. ✅ **Test endpoint manually**
   ```bash
   curl -X POST http://localhost:8000/api/process-audio \
     -H "Content-Type: application/json" \
     -d '{"audio_base64":"SGVsbG8=","user_id":"test"}'
   ```

5. ✅ **Check mobile app config**
   ```bash
   grep "REST_API_URL" astro-voice-mobile/src/services/configService.ts
   ```

---

## 📱 Mobile App Logs

### React Native Logs

```bash
# See all console logs
npx react-native log-android  # For Android
npx react-native log-ios      # For iOS
```

### Expo Go Logs

1. **Shake device** → "Show Dev Menu" → "Debug Remote JS"
2. **Open Chrome DevTools** → Console tab
3. Or use Expo CLI logs in terminal

### Enable Debug Logging in Mobile

Add to `App.tsx`:

```typescript
if (__DEV__) {
  console.log('🔍 API Config:', configService.getApiConfig());
  
  // Log all API requests
  const originalFetch = fetch;
  global.fetch = (...args) => {
    console.log('🌐 API Request:', args[0]);
    return originalFetch(...args);
  };
}
```

---

## 📊 Log Rotation

### Prevent Log Files from Growing Too Large

```bash
# Create log rotation config
cat > logrotate.conf << 'EOF'
/Users/nikhil/workplace/voice_v1/backend.log {
    size 100M
    rotate 5
    compress
    missingok
    notifempty
}
EOF

# Manually rotate logs
mv backend.log backend.log.1
touch backend.log
```

---

## 🎯 Quick Reference Commands

```bash
# Start with logging
python3 main_openai_realtime.py > backend.log 2>&1 &

# Tail logs
tail -f backend.log

# Tail with grep
tail -f backend.log | grep "📱\|❌\|✅"

# Last 50 errors
tail -100 backend.log | grep "❌"

# Count requests
grep -c "Mobile API request" backend.log

# Find slow requests (if timing added)
grep "took" backend.log | sort -k 4 -n

# Clear logs
> backend.log

# Stop backend
lsof -ti:8000 | xargs kill -9
```

---

## 📝 Log Formatting Tips

### Make Logs More Readable

```python
# Add timestamps
import datetime
print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] 📱 Request received")

# Add colored output (for terminal)
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

print(f"{Colors.GREEN}✅ Success{Colors.RESET}")
```

---

**Happy Debugging! 🐛✨**

For more help, check:
- [MOBILE_APP_TESTING_GUIDE.md](./MOBILE_APP_TESTING_GUIDE.md)
- [QUICK_START.md](./QUICK_START.md)


