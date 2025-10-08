# 🤖 OpenAI Realtime Model Exploration Guide

**Branch:** `explore/gpt-realtime-mini`  
**Last Updated:** October 8, 2025

## Overview

This guide explains how to switch between different OpenAI Realtime API models to explore performance, quality, and cost differences.

## Available Models

### 1. **gpt-4o-mini-realtime-preview** (Default)
- ✅ **Status:** Stable, production-ready
- 💰 **Cost:** Lower cost
- ⚡ **Speed:** Fast response times (~200-500ms)
- 🎯 **Use Case:** Production deployment, cost-effective
- 🗣️ **Voice Quality:** Good
- 🧠 **Intelligence:** Good for most astrology consultations

### 2. **gpt-realtime-mini** (New - Exploring)
- 🆕 **Status:** New model for exploration
- 💰 **Cost:** TBD (likely similar to gpt-4o-mini)
- ⚡ **Speed:** TBD (to be measured)
- 🎯 **Use Case:** Testing and comparison
- 🗣️ **Voice Quality:** TBD
- 🧠 **Intelligence:** TBD

### 3. **gpt-4o-realtime-preview** (Full GPT-4)
- 🚀 **Status:** Most capable, higher cost
- 💰 **Cost:** Higher cost
- ⚡ **Speed:** Slower but more intelligent
- 🎯 **Use Case:** Premium consultations
- 🗣️ **Voice Quality:** Excellent
- 🧠 **Intelligence:** Best reasoning and context understanding

## Quick Start

### Method 1: Using the Switch Script (Easiest)

```bash
# View current model
./switch_model.sh

# Switch to new model
./switch_model.sh gpt-realtime-mini

# Switch back to default
./switch_model.sh gpt-4o-mini-realtime-preview

# Try full GPT-4o
./switch_model.sh gpt-4o-realtime-preview
```

### Method 2: Manual Configuration

1. **Edit your `.env` file:**
```bash
# Open .env
nano .env

# Or if .env doesn't exist
cp env_example.txt .env
nano .env
```

2. **Set the model:**
```env
OPENAI_REALTIME_MODEL=gpt-realtime-mini
```

3. **Save and restart backend:**
```bash
lsof -ti:8000 | xargs kill -9
python3 main_openai_realtime.py
```

## Testing & Comparison

### What to Test

When exploring a new model, evaluate these factors:

#### 1. **Response Quality**
- ✅ Does it understand Hindi/English equally well?
- ✅ Does it follow the astrologer persona correctly?
- ✅ Does it avoid disclaimer phrases?
- ✅ Are responses concise (3-4 lines)?

#### 2. **Voice Quality**
- ✅ Natural pronunciation in Hindi
- ✅ Voice consistency with persona
- ✅ Emotional tone appropriate for astrology

#### 3. **Latency**
- ⏱️ Time from user speech end to response start
- ⏱️ Total response generation time
- ⏱️ Audio streaming smoothness

#### 4. **Context Retention**
- 🧠 Does it remember birth details across turns?
- 🧠 Does it maintain conversation flow?
- 🧠 Does it follow the 4-phase gradual revelation?

#### 5. **Cost Efficiency**
- 💰 Check OpenAI usage dashboard
- 💰 Compare token costs per session
- 💰 Calculate cost per minute of conversation

### Testing Script

Use this checklist for each model:

```bash
# 1. Start backend with new model
./switch_model.sh gpt-realtime-mini
python3 main_openai_realtime.py

# 2. Check logs for model confirmation
# You should see: "🤖 Using model: gpt-realtime-mini"

# 3. Test via web interface
open http://localhost:8000/voice-realtime

# 4. Test via mobile app
cd astro-voice-mobile && npx expo start

# 5. Run through test scenarios (see below)
```

## Test Scenarios

### Scenario 1: Profile Collection
**Goal:** Test if model naturally collects birth data

1. Connect and wait for greeting
2. Say: "मुझे अपने करियर के बारे में जानना है"
3. **Expected:** Should ask for name, birth date, time, location naturally
4. Provide details gradually
5. **Measure:** How many turns to complete profile?

### Scenario 2: Astrological Analysis
**Goal:** Test domain knowledge and reasoning

1. Complete profile with test data
2. Ask: "मेरी शादी कब होगी?"
3. **Expected:** 
   - Turn 1: Reason (planetary position)
   - Turn 2: Impact depth
   - Turn 3: Simple remedy
   - Turn 4+: Full solution
4. **Measure:** Does it follow the 4-phase flow?

### Scenario 3: Hindi Language Fluency
**Goal:** Test Hindi pronunciation and understanding

1. Speak entirely in Hindi
2. Use colloquial phrases: "शादी में देरी हो रही है"
3. **Expected:** Natural Hindi responses, no English mixing
4. **Measure:** Pronunciation quality, word choice

### Scenario 4: Persona Adherence
**Goal:** Test if model maintains astrologer personality

1. Test with different astrologers (Tina, Mohit, Priyanka, Harsh)
2. **Expected:** Each should have distinct personality
3. **Measure:** Voice, greeting style, language preference consistency

## Performance Logging

The system automatically logs model information. Check logs:

```bash
tail -f backend.log | grep "🤖"
```

You'll see:
```
🤖 Using model: gpt-realtime-mini
🔌 Connecting to OpenAI Realtime API with model: gpt-realtime-mini
✅ Connected to OpenAI Realtime API using gpt-realtime-mini
```

## Comparison Metrics

Track these metrics for each model:

| Metric | gpt-4o-mini-realtime | gpt-realtime-mini | gpt-4o-realtime |
|--------|---------------------|-------------------|-----------------|
| **Latency (avg)** | ~300ms | ? | ? |
| **Voice Quality** | 8/10 | ? | ? |
| **Hindi Fluency** | 9/10 | ? | ? |
| **Context Retention** | Good | ? | ? |
| **Cost per min** | $0.06 | ? | ? |
| **Persona Adherence** | Excellent | ? | ? |

## Known Issues & Solutions

### Issue: Model not recognized
```
Error: Invalid model name
```

**Solution:** Check OpenAI documentation for exact model name. Names might change.

### Issue: Connection fails
```
❌ Failed to connect to OpenAI Realtime API
```

**Solution:** 
1. Verify API key has Realtime API access
2. Check if model is available in your region
3. Ensure you have correct API tier/permissions

### Issue: Different response format
```
Audio not streaming correctly
```

**Solution:** Different models might have different audio formats. Check:
- `input_audio_format` in session config
- `output_audio_format` in session config
- May need to adjust in `_configure_session()` method

## Cost Analysis

Track your OpenAI costs during exploration:

1. **Go to:** https://platform.openai.com/usage
2. **Filter by:** Realtime API
3. **Compare:** Daily costs between models
4. **Calculate:** Cost per consultation session

## Rollback Plan

If the new model doesn't work well:

```bash
# Switch back to default
./switch_model.sh gpt-4o-mini-realtime-preview

# Or remove from .env to use default
grep -v "OPENAI_REALTIME_MODEL" .env > .env.tmp && mv .env.tmp .env

# Restart backend
lsof -ti:8000 | xargs kill -9
python3 main_openai_realtime.py
```

## Advanced Configuration

### Environment Variables

Full configuration options in `.env`:

```env
# Required
OPENAI_API_KEY=sk-...

# Model Selection (one of the following)
OPENAI_REALTIME_MODEL=gpt-realtime-mini
# OPENAI_REALTIME_MODEL=gpt-4o-mini-realtime-preview
# OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview

# Optional
LOG_LEVEL=INFO
PORT=8000
```

### Programmatic Model Selection

To switch models programmatically (future enhancement):

```python
# In openai_realtime_handler.py
handler = OpenAIRealtimeHandler(astrologer_id="harsh")
handler.model = "gpt-realtime-mini"  # Override model
await handler.connect_to_openai()
```

## Findings & Recommendations

### Document Your Findings

After testing each model, document:

1. **Strengths:** What did it do better?
2. **Weaknesses:** What needs improvement?
3. **Use Cases:** When to use this model?
4. **Cost Impact:** Is it worth the cost difference?
5. **Recommendation:** Production-ready or not?

### Share Results

Create a summary in this format:

```markdown
## gpt-realtime-mini Test Results

**Tested on:** October 8, 2025
**Test Duration:** 2 hours, 15 sessions

### Findings:
- ✅ Faster response times (avg 250ms vs 300ms)
- ✅ Better Hindi pronunciation
- ⚠️ Slightly less context retention
- ❌ Higher cost (+20%)

### Recommendation:
Use for [specific use case] but not for [other use case]
```

## Next Steps

1. ✅ Switch to new model
2. ⏳ Run test scenarios
3. ⏳ Measure performance metrics
4. ⏳ Document findings
5. ⏳ Decide: Keep, rollback, or use conditionally

## Questions to Answer

- [ ] Is latency better/worse?
- [ ] Is Hindi pronunciation improved?
- [ ] Does it maintain persona adherence?
- [ ] Is cost justified by quality improvement?
- [ ] Should we use different models for different astrologers?
- [ ] Can we use cheaper model for profile collection, expensive for analysis?

## Support

If you encounter issues:

1. Check logs: `tail -f backend.log`
2. Verify model in startup logs
3. Test with web interface first (simpler debugging)
4. Try default model to isolate issue

---

**Happy Exploring! 🚀**

For questions or findings, document in this guide or create a new findings document.
