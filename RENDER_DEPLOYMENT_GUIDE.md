# 🚀 Render Deployment Guide - 100% Free

## 🎯 **Why Render?**
- ✅ **Completely FREE** tier (no credit card required initially)
- ✅ **WebSocket support** (perfect for voice chat)
- ✅ **Easy GitHub deployment**
- ✅ **Automatic HTTPS**
- ✅ **750 hours/month free**
- ⚠️ Sleeps after 15 min inactivity (wakes up in ~30 seconds)

## 🚀 **Step-by-Step Deployment**

### **Step 1: Create Render Account**
1. Go to [render.com](https://render.com)
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your repositories

### **Step 2: Create New Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: **`Nikhilkr73/astro`**
3. Render will detect your repository

### **Step 3: Configure Service**
Fill in these settings:

**Basic Settings:**
- **Name**: `astrovoice-api`
- **Region**: Choose closest to your users (e.g., Singapore, Mumbai)
- **Branch**: `main`
- **Root Directory**: Leave blank (or `.` if needed)

**Build Settings:**
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python3 main_openai_realtime.py`

**Plan:**
- Select **"Free"** plan

### **Step 4: Set Environment Variables**
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:
```
OPENAI_API_KEY=your_openai_api_key_here
HOST=0.0.0.0
PORT=8000
```

**To get your OpenAI API key:**
- Go to [platform.openai.com](https://platform.openai.com)
- Navigate to API Keys
- Create new key
- Copy and paste

### **Step 5: Deploy**
1. Click **"Create Web Service"**
2. Render will start building (5-10 minutes)
3. Watch build logs in real-time
4. Wait for **"Live"** status

### **Step 6: Get Your URL**
Once deployed, you'll get a URL like:
```
https://astrovoice-api.onrender.com
```

### **Step 7: Test Deployment**
Test these endpoints:

```bash
# Health check
curl https://astrovoice-api.onrender.com/health

# Should return:
{"status":"healthy","service":"astro-voice-api","version":"1.0.0"}
```

## 📱 **Update Mobile App Configuration**

### **Update Production Config:**
In `astro-voice-mobile/src/services/configService.ts`:

```typescript
const productionConfig: ApiConfig = {
  REST_API_URL: 'https://astrovoice-api.onrender.com',
  WEBSOCKET_API_URL: 'wss://astrovoice-api.onrender.com',
  REGION: 'ap-south-1',
};
```

### **Switch to Production:**
```typescript
configService.switchToProduction();
```

## 🔧 **Important: Handling Sleep Mode**

### **What is Sleep Mode?**
Free tier apps sleep after 15 minutes of inactivity. They wake up automatically when accessed (takes ~30 seconds).

### **Solutions:**

1. **For Testing** (Acceptable):
   - First request takes 30 seconds to wake up
   - Subsequent requests are instant
   - Tell testers about initial delay

2. **Keep Alive Service** (Optional):
   ```bash
   # Use a free cron service to ping every 14 minutes
   # UptimeRobot.com (free) or similar
   ```

3. **Upgrade to Paid** (Later):
   - $7/month for always-on service
   - No sleep mode
   - Better for production

## 🚨 **Troubleshooting**

### **Build Fails:**
1. Check build logs in Render dashboard
2. Common issues:
   - Missing dependencies in `requirements.txt`
   - Python version mismatch
   - Environment variables not set

**Fix:**
- Verify `requirements.txt` is complete
- Check Python version (should be 3.10+)
- Ensure all env vars are set

### **Deployment Succeeds but API Doesn't Work:**
1. Check **"Logs"** tab in Render dashboard
2. Look for runtime errors
3. Verify environment variables are correct

### **WebSocket Connection Fails:**
1. Ensure URL uses `wss://` (not `ws://`)
2. Check CORS settings in FastAPI
3. Verify mobile app has internet access
4. First connection after sleep takes 30 seconds

### **App Keeps Sleeping:**
- This is normal on free tier
- Use UptimeRobot to ping every 14 minutes
- Or upgrade to paid plan ($7/month)

## 📊 **Render Dashboard Features**

Once deployed, you can:
- **View logs** in real-time
- **Monitor metrics** (requests, response times)
- **Manage environment variables**
- **View deployment history**
- **Set up custom domains**
- **Configure health checks**

## 💰 **Render Pricing**

### **Free Tier:**
- ✅ 750 hours/month
- ✅ Automatic HTTPS
- ✅ WebSocket support
- ✅ GitHub auto-deploy
- ⚠️ Sleeps after 15 min inactivity

### **Paid Plans:**
- **Starter**: $7/month
  - Always on (no sleep)
  - Better performance
  - Priority support

## 🎯 **Success Checklist**

- ✅ **Render account created**
- ✅ **GitHub repository connected**
- ✅ **Web service configured**
- ✅ **Environment variables set**
- ✅ **Deployment successful**
- ✅ **Health check returns 200 OK**
- ✅ **Mobile app config updated**
- ✅ **WebSocket connects successfully**
- ✅ **Voice chat works end-to-end**

## 🚀 **Next Steps**

1. ✅ **Deploy API to Render**
2. ✅ **Update mobile app config**
3. ✅ **Generate APK** (see APK_DISTRIBUTION_GUIDE.md)
4. ✅ **Set up Firebase App Distribution**
5. ✅ **Invite testers**
6. ✅ **Collect feedback**

## 📞 **Support**

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)
- **Status Page**: [status.render.com](https://status.render.com)

---

## 🎉 **Summary**

**Render gives you:**
- ✅ **100% free hosting** for testing
- ✅ **WebSocket support** for voice chat
- ✅ **Easy deployment** from GitHub
- ✅ **Automatic HTTPS**
- ✅ **Professional URL** for testers

**Perfect for testing phase!** Once you're ready for production, upgrade to paid plan for always-on service.

**Your API will be live and accessible to testers worldwide in about 10 minutes!** 🌍
