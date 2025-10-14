# Mobile API Deployment to AWS

**Date:** October 13, 2025  
**Issue:** "Missing authentication token" when calling AWS API Gateway  
**Root Cause:** Mobile API Lambda not deployed yet  
**Status:** Needs deployment

---

## Problem

```bash
curl https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/api/users/register
# Error: {"message":"Missing Authentication Token"}
```

**Why?**
- ✅ CDK defines mobile API routes: `/api/mobile/users/register`
- ❌ MobileApiLambda function **not deployed to AWS**
- ❌ Only VoiceProcessorLambda and WebSocketLambda exist
- ❌ Mobile API endpoints return "Missing Authentication Token"

---

## Current AWS Deployment Status

### ✅ Deployed
```
Lambda Functions:
- VoiceProcessorLambda (voice processing, Gemini)
- WebSocketLambda (real-time voice chat)
- CustomVpcRestrictDefaultSG (VPC management)

API Gateway Routes:
- /api/health
- /api/process-audio
- /api/process-text
- /api/customize
- /api/test_gemini
```

### ❌ Not Deployed
```
Lambda Functions:
- MobileApiLambda ❌ MISSING

API Gateway Routes:
- /api/mobile/users/register ❌ MISSING
- /api/mobile/astrologers ❌ MISSING
- /api/mobile/chat/* ❌ MISSING
- /api/mobile/wallet/* ❌ MISSING
```

---

## Solution: Deploy Mobile API Lambda

### Step 1: Update CDK Stack

The CDK already defines MobileApiLambda (in `infrastructure/lib/astro-voice-stack.ts`), but there's a potential issue with the bundling.

**Check lines 142-165 in CDK:**
```typescript
const mobileApiLambda = new lambda.Function(this, 'MobileApiLambda', {
  runtime: lambda.Runtime.PYTHON_3_10,
  handler: 'mobile_lambda_handler.lambda_handler',
  code: lambda.Code.fromAsset('..', {  // ← Points to parent directory
    bundling: {
      image: lambda.Runtime.PYTHON_3_10.bundlingImage,
      command: [
        'bash', '-c',
        'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'
      ],
    },
  }),
  // ... rest of config
});
```

**Issue:** Bundling might be failing or the Lambda isn't being created.

---

### Step 2: Deploy the Stack

```bash
cd /Users/nikhil/workplace/voice_v1/infrastructure

# Check current stack status
npx cdk diff

# Deploy
npx cdk deploy --require-approval never

# Or use the deploy script
./deploy-mumbai.sh
```

**Expected output:**
```
✅ AstroVoiceStack: creating...
✅ MobileApiLambda created
✅ API Gateway routes updated
✅ Stack deployed successfully
```

---

### Step 3: Verify Deployment

```bash
# Check Lambda functions
aws lambda list-functions --region ap-south-1 \
  --query 'Functions[?contains(FunctionName, `Mobile`)].FunctionName'

# Expected: AstroVoiceStack-MobileApiLambda...

# Test mobile endpoint
curl https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/api/mobile/users/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+919999999999","full_name":"Test","date_of_birth":"01/01/2000","time_of_birth":"12:00 PM","place_of_birth":"Mumbai","gender":"Male"}'

# Should return: {"success": true, "user_id": "...", ...}
```

---

## Alternative: Use Existing Lambda

If you don't want to deploy a new Lambda, you can **add mobile endpoints to the existing VoiceProcessorLambda**.

### Option A: Update VoiceProcessorLambda to include mobile endpoints

**Edit the Lambda handler in backend-deployment:**

```python
# In backend-deployment/lambda_handler.py
from mobile_api_service import app as mobile_app
from main_fastapi_app import app as voice_app

# Combine routes or use path-based routing
# Mount mobile app at /mobile
voice_app.mount("/mobile", mobile_app)
```

Then redeploy voice processor.

---

## Quick Fix: Update API Gateway Paths

The easiest fix is to ensure the paths match:

**CDK defines:** `/api/mobile/users/register`  
**FastAPI has:** `/api/users/register` (in mobile_api_service.py)

**Two options:**

### Option 1: Remove `/api` prefix from FastAPI routes
```python
# mobile_api_service.py
@app.post("/users/register")  # Remove /api prefix
async def register_user(...):
```

Then API Gateway `/api/mobile/users/register` → Lambda `/users/register` ✅

### Option 2: Add `/mobile` to API Gateway base path
```typescript
// CDK: Map directly to /api/* without /mobile
const usersApi = apiResource.addResource('users');  // /api/users
```

---

## Testing After Deployment

### 1. Check Lambda exists
```bash
aws lambda get-function \
  --function-name AstroVoiceStack-MobileApiLambda... \
  --region ap-south-1
```

### 2. Test health endpoint
```bash
curl https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/api/mobile/health
```

### 3. Test user registration
```bash
curl -X POST https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/api/mobile/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919876543210",
    "full_name": "Test User",
    "date_of_birth": "01/01/2000",
    "time_of_birth": "12:00 PM",
    "place_of_birth": "Mumbai",
    "gender": "Male"
  }'
```

---

## Current Workaround: Use Local Backend

While AWS Lambda isn't deployed, your mobile app can use the local backend:

**Mobile app config (mobile/src/config/api.ts):**
```typescript
BASE_URL: 'http://localhost:8000'  // Local backend
// Instead of AWS API Gateway URL
```

**Start local backend:**
```bash
cd /Users/nikhil/workplace/voice_v1
python3 main_openai_realtime.py
```

**Test locally:**
```bash
curl http://localhost:8000/api/users/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+919999999999","full_name":"Test","date_of_birth":"01/01/2000","time_of_birth":"12:00 PM","place_of_birth":"Mumbai","gender":"Male"}'
```

✅ **This works right now!** Your local backend has all the latest updates.

---

## Recommended Action

### For Local Development (Now)
✅ Use local backend: `http://localhost:8000`  
✅ All features working locally  
✅ Database initialized locally  

### For AWS Deployment (Next)
1. **Deploy updated CDK stack:**
   ```bash
   cd infrastructure
   npx cdk deploy
   ```

2. **Fix path mismatch** (choose one):
   - Remove `/api` prefix from mobile_api_service.py routes
   - Or update CDK to route correctly

3. **Package backend code** for Lambda deployment

---

## Files That Need Deployment

```
mobile_api_service.py         → Needs to be in Lambda package
backend/api/mobile_endpoints.py → New endpoints (integrate with mobile_api_service)
database_schema.sql            → Needs to be in Lambda package for init
requirements.txt               → Updated with openai==1.35.13
```

---

## Summary

**Problem:** Mobile API Lambda not deployed to AWS  
**Current State:** Only local backend works  
**Next Steps:** 
1. Deploy CDK stack with mobile API Lambda
2. Fix path mismatch between API Gateway and FastAPI
3. Test AWS endpoints

**Workaround:** Use local backend (`http://localhost:8000`) for development

---

**Status:** ⏳ AWS deployment needed  
**Local:** ✅ Working perfectly

