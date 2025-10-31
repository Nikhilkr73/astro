# OTP Debugging Guide

**Last Updated:** November 1, 2025  
**Purpose:** Debug OTP issues when app is downloaded from Google Play Console

## 🔍 Quick Diagnosis

Run: `./debug_otp.sh`

## 🚨 Main Issue

Your AAB app uses `__DEV__ = false` (production mode), so it tries to hit AWS API Gateway.

The API config had a **placeholder URL** that doesn't exist:
- ❌ `https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/prod`

**Fixed to:**
- ✅ `https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod`

## 📝 Next Steps

1. **Rebuild AAB** with updated config
2. **Test AWS backend** is working
3. **Or use local backend** for testing

See full guide in this file for details.
