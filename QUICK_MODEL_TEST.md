# 🚀 Quick Model Testing Guide

**Branch:** `explore/gpt-realtime-mini`  
**Ready to test in:** < 2 minutes

## Instant Test (30 seconds)

```bash
# 1. Switch to new model
./switch_model.sh gpt-realtime-mini

# 2. Start backend
python3 main_openai_realtime.py
```

**Look for these logs:**
```
✅ OpenAI API key loaded successfully
🤖 Using model: gpt-realtime-mini
🔌 Connecting to OpenAI Realtime API with model: gpt-realtime-mini
✅ Connected to OpenAI Realtime API using gpt-realtime-mini
```

## Quick Web Test

```bash
# Open browser
open http://localhost:8000/voice-realtime

# Click microphone and speak in Hindi:
"Namaste, mujhe apne career ke baare mein jaanna hai"

# Check if response comes back
```

## Quick Mobile Test

```bash
# In another terminal
cd astro-voice-mobile
npx expo start

# Scan QR code, select astrologer, record voice
```

## Compare Models

```bash
# Test 1: Current default
./switch_model.sh gpt-4o-mini-realtime-preview
python3 main_openai_realtime.py
# ... test and note latency, quality ...
# Kill: Ctrl+C

# Test 2: New model
./switch_model.sh gpt-realtime-mini
python3 main_openai_realtime.py
# ... test and note latency, quality ...
# Kill: Ctrl+C

# Test 3: Premium model
./switch_model.sh gpt-4o-realtime-preview
python3 main_openai_realtime.py
# ... test and note latency, quality ...
```

## What to Check

✅ Response time (< 500ms is good)  
✅ Hindi pronunciation quality  
✅ Persona adherence (greeting style)  
✅ Context retention  
✅ No errors in logs  

## Quick Metrics

| Test | Response Time | Quality (1-10) | Notes |
|------|--------------|----------------|-------|
| gpt-4o-mini-realtime-preview | ___ ms | ___ | |
| gpt-realtime-mini | ___ ms | ___ | |
| gpt-4o-realtime-preview | ___ ms | ___ | |

## Done!

For detailed testing: See `MODEL_EXPLORATION_GUIDE.md`

---

**Currently on:** `gpt-realtime-mini`

To check: `./switch_model.sh`

