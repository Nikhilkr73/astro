# 🤖 Switching Models on Render Deployment

## Quick Guide: Change Model on Render

### Method 1: Via Render Dashboard (Recommended)

**Steps:**

1. **Login to Render**
   - Go to [render.com](https://render.com)
   - Click **Dashboard**

2. **Select Your Service**
   - Find **astrovoice-api**
   - Click on it

3. **Go to Environment Tab**
   - Click **"Environment"** in left sidebar
   - Scroll to **Environment Variables** section

4. **Add/Update Model Variable**
   - If `OPENAI_CHAT_MODEL` exists:
     - Click **Edit** button
     - Change value to desired model
   - If it doesn't exist:
     - Click **"Add Environment Variable"**
     - Key: `OPENAI_CHAT_MODEL`
     - Value: `gpt-4o` (or other model)
   - Click **Save Changes**

5. **Wait for Redeploy**
   - Render automatically redeploys (~2 minutes)
   - Watch the **Logs** tab for confirmation
   - Look for: `🤖 Using chat model: gpt-4o`

**Visual Guide:**
```
Dashboard → astrovoice-api → Environment → 
Add/Edit OPENAI_CHAT_MODEL → Save → Auto-redeploy
```

---

### Method 2: Via render.yaml (Automated)

Your `render.yaml` file now includes model configuration:

```yaml
envVars:
  - key: OPENAI_CHAT_MODEL
    value: gpt-4o-mini
  - key: OPENAI_REALTIME_MODEL
    value: gpt-4o-mini-realtime-preview
```

**To Change:**
1. Edit `render.yaml` locally
2. Change the `value` field
3. Commit and push to GitHub
4. Render auto-deploys the change

---

## Available Models

### Chat Models (OPENAI_CHAT_MODEL)

| Model | Value | Use Case | Cost |
|-------|-------|----------|------|
| GPT-4o Mini | `gpt-4o-mini` | Default, cost-effective | $0.15/$0.60 per 1M tokens |
| **GPT-4o** | `gpt-4o` | **Premium, best Hinglish** | $2.50/$10.00 per 1M tokens |
| GPT-4.1 Mini | `gpt-4.1-mini` | Faster alternative | Similar to 4o-mini |
| GPT-5 | `gpt-5` | Future, when available | TBD |
| GPT-4 Turbo | `gpt-4-turbo` | Fast & powerful | $10.00/$30.00 per 1M tokens |

### Voice Models (OPENAI_REALTIME_MODEL)

| Model | Value | Use Case |
|-------|-------|----------|
| GPT-4o Mini Realtime | `gpt-4o-mini-realtime-preview` | Default for voice |
| GPT-4o Realtime | `gpt-4o-realtime-preview` | Premium voice quality |
| GPT Realtime Mini | `gpt-realtime-mini` | Exploration/testing |

---

## Common Scenarios

### Scenario 1: Upgrade to Premium Quality

**Current:** `gpt-4o-mini` (cost-effective)  
**Upgrade to:** `gpt-4o` (best quality)

**Steps:**
1. Login to Render Dashboard
2. Environment → Edit `OPENAI_CHAT_MODEL`
3. Change value to `gpt-4o`
4. Save → Wait 2 mins for redeploy
5. Test improvement in Hinglish quality

**Cost Impact:**
- Before: ~$0.50/day (1000 conversations)
- After: ~$5.00/day (1000 conversations)
- 10x cost, significantly better quality

---

### Scenario 2: Test GPT-5 (When Available)

**Steps:**
1. Set `OPENAI_CHAT_MODEL=gpt-5`
2. System will attempt to use GPT-5
3. If not available, falls back to `gpt-4o-mini`
4. Check logs for fallback message

---

### Scenario 3: A/B Testing

**Option A: Manual Switching**
```
Morning: Set to gpt-4o-mini
Afternoon: Set to gpt-4o
Compare: User feedback & costs
```

**Option B: Split Traffic (Future)**
- Use Render's Blue-Green deployment
- Run two services with different models
- Route 50% traffic to each

---

## Verification

### Check Active Model

**Method 1: View Logs**
1. Render Dashboard → Logs tab
2. Look for startup message:
   ```
   ✅ OpenAI API key loaded successfully (Chat Mode)
   🤖 Using chat model: gpt-4o
   💎 Premium model - better emotional intelligence and Hinglish
   ```

**Method 2: Test API**
```bash
# Health check includes model info
curl https://astrovoice-api.onrender.com/health

# Test actual chat
curl -X POST https://astrovoice-api.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "message": "Hello"}'
```

**Method 3: Check Environment**
1. Render Dashboard → Environment tab
2. Verify `OPENAI_CHAT_MODEL` value

---

## Troubleshooting

### Issue: Model Not Changing

**Check:**
1. Environment variable is saved
2. Redeploy triggered (automatic)
3. Logs show new model name

**Fix:**
```
1. Manual redeploy: Deploy → Manual Deploy → Deploy Latest Commit
2. Clear cache: Settings → Clear Build Cache
3. Restart service: Settings → Suspend Service → Resume
```

---

### Issue: Model Not Available

**Symptoms:**
```
⚠️ Unknown model 'gpt-5', falling back to gpt-4o-mini
```

**Cause:** Model not released by OpenAI yet

**Solution:**
- Use available model: `gpt-4o` or `gpt-4o-mini`
- Check OpenAI announcements for model availability
- System gracefully falls back to default

---

### Issue: High Costs After Switch

**Problem:** Switched to `gpt-4o`, costs increased 10x

**Solutions:**
1. **Mixed Strategy:**
   - Keep `gpt-4o-mini` as default
   - Use `gpt-4o` for premium users only
   - Implement user-tier system

2. **Smart Routing:**
   - Simple queries → `gpt-4o-mini`
   - Complex queries → `gpt-4o`
   - Detect complexity in backend

3. **Hybrid Approach:**
   - First message: `gpt-4o-mini`
   - If user engages: switch to `gpt-4o`

---

## Cost Monitoring

### Daily Usage Estimates

**Low Traffic (100 conversations/day):**
- `gpt-4o-mini`: $0.30/day = $9/month
- `gpt-4o`: $3.00/day = $90/month

**Medium Traffic (500 conversations/day):**
- `gpt-4o-mini`: $1.50/day = $45/month
- `gpt-4o`: $15.00/day = $450/month

**High Traffic (2000 conversations/day):**
- `gpt-4o-mini`: $6.00/day = $180/month
- `gpt-4o`: $60.00/day = $1,800/month

**Monitor Usage:**
1. OpenAI Dashboard → Usage tab
2. Set up billing alerts
3. Track costs vs quality improvement

---

## Best Practices

### 1. Start Conservative
```
Launch: gpt-4o-mini (prove concept)
Week 2: Test gpt-4o with small group
Week 3: Decide based on feedback
```

### 2. Document Changes
```
Create changelog:
- Date: Oct 13, 2025
- Change: Upgraded to gpt-4o
- Reason: User feedback requested better Hinglish
- Impact: 10x cost increase, 40% quality improvement
```

### 3. A/B Test Results
```
Track metrics:
- User satisfaction (before/after)
- Average conversation length
- Repeat usage rate
- Cost per engaged user
```

### 4. Set Budget Alerts
```
OpenAI Dashboard:
- Set alert at $50/month
- Set hard limit at $100/month
- Monitor daily spend
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  RENDER MODEL SWITCHING CHEAT SHEET         │
├─────────────────────────────────────────────┤
│                                             │
│  📍 WHERE: Dashboard → Service → Environment│
│                                             │
│  🔧 VARIABLE: OPENAI_CHAT_MODEL             │
│                                             │
│  💎 PREMIUM: gpt-4o                         │
│  ⚡ DEFAULT: gpt-4o-mini                    │
│  🚀 FUTURE: gpt-5                           │
│                                             │
│  ⏱️  DEPLOY TIME: ~2 minutes                │
│                                             │
│  ✅ VERIFY: Check logs for model name       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Summary

✅ **Two Methods:** Dashboard or render.yaml  
✅ **Easy Switch:** Change env var, auto-redeploy  
✅ **Instant Effect:** 2 minutes deployment  
✅ **Graceful Fallback:** Unknown models default to gpt-4o-mini  
✅ **Cost Control:** Monitor and adjust as needed  

**Recommendation:** Start with `gpt-4o-mini`, upgrade to `gpt-4o` based on user feedback and budget.


