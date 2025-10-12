# 🚀 API Deployment Guide for Testers

## Overview
This guide helps you deploy your AstroVoice API to make it accessible to testers via the internet.

## 🎯 Deployment Options

### Option 1: Railway (Recommended)
**Best for:** FastAPI + WebSocket, easy setup, free tier

#### Quick Setup:
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Deploy using our script
./deploy-railway.sh
```

#### Manual Railway Setup:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Connect your GitHub repository
5. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `HOST`: `0.0.0.0`
   - `PORT`: `8000`
6. Deploy!

### Option 2: Render
**Best for:** Free tier, GitHub integration

#### Setup:
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python3 main_openai_realtime.py`
   - **Environment**: `Python 3`
5. Set environment variables
6. Deploy!

### Option 3: Heroku
**Best for:** Established platform, paid plans

#### Setup:
1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy with Git

## 🔧 Environment Variables Required

```bash
OPENAI_API_KEY=your_openai_api_key_here
HOST=0.0.0.0
PORT=8000
```

## 📱 Mobile App Configuration

After deployment, update your mobile app configuration:

### For Railway:
```typescript
// In configService.ts
const productionConfig = {
  REST_API_URL: 'https://your-app-name.railway.app',
  WEBSOCKET_API_URL: 'wss://your-app-name.railway.app',
};
```

### For Render:
```typescript
const productionConfig = {
  REST_API_URL: 'https://your-app-name.onrender.com',
  WEBSOCKET_API_URL: 'wss://your-app-name.onrender.com',
};
```

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-deployed-url.com/health
```

### 2. WebSocket Test
```javascript
const ws = new WebSocket('wss://your-deployed-url.com/ws-mobile/user-123');
ws.onopen = () => console.log('✅ WebSocket connected');
```

### 3. Mobile App Test
1. Update mobile app configuration with production URLs
2. Build and test with Expo Go
3. Verify voice chat functionality

## 🔐 Security Considerations

1. **API Keys**: Never commit API keys to Git
2. **CORS**: Configure CORS for your domain
3. **Rate Limiting**: Consider implementing rate limiting
4. **Authentication**: Add user authentication for production

## 📊 Monitoring

### Railway:
- Built-in metrics dashboard
- Logs available in Railway dashboard

### Render:
- Built-in monitoring
- Logs in Render dashboard

## 🚨 Troubleshooting

### Common Issues:

1. **WebSocket Connection Failed**
   - Check if platform supports WebSockets
   - Verify CORS settings
   - Check firewall/network restrictions

2. **Environment Variables Not Set**
   - Verify all required env vars are set
   - Check variable names (case-sensitive)

3. **Build Failures**
   - Check Python version compatibility
   - Verify all dependencies in requirements.txt
   - Check build logs for specific errors

## 📞 Support

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)
- **Heroku**: [devcenter.heroku.com](https://devcenter.heroku.com)

---

## 🎯 Next Steps

1. Choose your preferred platform
2. Deploy using the instructions above
3. Update mobile app configuration
4. Test with your testers
5. Monitor usage and performance

**Recommended**: Start with Railway for the easiest setup and best WebSocket support!
