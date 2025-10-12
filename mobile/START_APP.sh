#!/bin/bash

# Simple Expo Start Script (LAN Mode)

echo "🚀 Starting Expo App..."
echo ""

# Clean up any existing processes
echo "Cleaning up old processes..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:19000 | xargs kill -9 2>/dev/null || true
lsof -ti:19001 | xargs kill -9 2>/dev/null || true

cd "$(dirname "$0")"

# Start with LAN mode (no ngrok needed)
echo "Starting Metro Bundler..."
echo "This will take 30-60 seconds..."
echo ""
npx expo start --lan --clear



