#!/bin/bash
# Railway Deployment Script for AstroVoice API

echo "🚀 Deploying AstroVoice API to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "📦 Creating Railway project..."
railway init

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set OPENAI_API_KEY=$OPENAI_API_KEY
railway variables set HOST=0.0.0.0
railway variables set PORT=8000

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "📱 Your API will be available at: https://your-app-name.railway.app"
echo "🔌 WebSocket endpoint: wss://your-app-name.railway.app/ws-mobile/{user_id}"
echo "❤️  Health check: https://your-app-name.railway.app/health"
