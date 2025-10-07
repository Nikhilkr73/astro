# 🚀 Railway Deployment Guide - Step by Step

## 🎯 **Quick Deployment via Railway Web Interface**

Since CLI installation had permission issues, we'll use Railway's web interface which is actually easier!

### **Step 1: Create Railway Account**
1. Go to [railway.app](https://railway.app)
2. Click **"Sign Up"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Railway to access your GitHub account

### **Step 2: Create New Project**
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your repository: **`Nikhilkr73/astro`**
4. Click **"Deploy Now"**

### **Step 3: Configure Environment Variables**
Railway will automatically detect your Python app. Now set these environment variables:

1. Go to your project dashboard
2. Click on your service
3. Go to **"Variables"** tab
4. Add these variables:

```
OPENAI_API_KEY=your_openai_api_key_here
HOST=0.0.0.0
PORT=8000
```

**To get your OpenAI API key:**
- Go to [platform.openai.com](https://platform.openai.com)
- Navigate to API Keys section
- Create a new API key
- Copy and paste it into Railway

### **Step 4: Deploy**
1. Railway will automatically start building and deploying
2. You'll see build logs in real-time
3. Wait for deployment to complete (usually 2-3 minutes)

### **Step 5: Get Your Deployment URL**
1. Once deployed, Railway will give you a URL like:
   `https://astrovoice-production-xxxx.up.railway.app`
2. Copy this URL - you'll need it for your mobile app!

### **Step 6: Test Your Deployment**
Open your browser and test these endpoints:

```bash
# Health check
https://your-app-name.up.railway.app/health

# Should return:
{"status":"healthy","service":"astro-voice-api","version":"1.0.0"}
```

## 🔧 **Troubleshooting**

### **If Build Fails:**
1. Check the build logs in Railway dashboard
2. Common issues:
   - Missing dependencies in `requirements.txt`
   - Environment variables not set
   - Python version mismatch

### **If Deployment Succeeds but API Doesn't Work:**
1. Check Railway logs for runtime errors
2. Verify environment variables are set correctly
3. Test the health endpoint first

### **If WebSocket Connection Fails:**
1. Railway supports WebSockets, but check:
   - URL uses `wss://` (not `ws://`)
   - CORS settings in your FastAPI app
   - Network connectivity from mobile device

## 📱 **Update Mobile App Configuration**

After successful deployment, update your mobile app:

### **1. Update Production Config**
In `astro-voice-mobile/src/services/configService.ts`:

```typescript
const productionConfig: ApiConfig = {
  REST_API_URL: 'https://your-actual-url.up.railway.app',
  WEBSOCKET_API_URL: 'wss://your-actual-url.up.railway.app',
  REGION: 'ap-south-1',
};
```

### **2. Switch to Production Mode**
In your mobile app, call:
```typescript
configService.switchToProduction();
```

### **3. Test Mobile App**
1. Restart your Expo app
2. Try connecting to voice chat
3. Check if WebSocket connects successfully

## 🎉 **Success Indicators**

You'll know deployment is successful when:

✅ **Health check returns 200 OK**
✅ **WebSocket connects from mobile app**
✅ **Voice chat works end-to-end**
✅ **No errors in Railway logs**

## 📊 **Railway Dashboard Features**

Once deployed, you can:
- **Monitor logs** in real-time
- **View metrics** (CPU, memory, requests)
- **Manage environment variables**
- **View deployment history**
- **Scale resources** if needed

## 💰 **Railway Pricing**

- **Free tier**: $5 credit monthly (usually enough for testing)
- **Pro plan**: $5/month for production use
- **Pay-as-you-go**: Only pay for what you use

## 🆘 **Need Help?**

1. **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
2. **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
3. **Check build logs** for specific error messages

---

## 🚀 **Next Steps After Deployment**

1. ✅ **Test API endpoints**
2. ✅ **Update mobile app config**
3. ✅ **Test with testers**
4. ✅ **Monitor usage**
5. ✅ **Add Firebase Analytics** (next phase)

**Your API will be live and accessible to testers worldwide!** 🌍
