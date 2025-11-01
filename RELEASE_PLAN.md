# Release Plan - AstroVoice Mobile App

**Last Updated:** November 1, 2025  
**Purpose:** Standardized process for releasing updates to Google Play Console and ensuring production stability

---

## Quick Pre-Release Checklist

Before each Play Store release, verify:

- [ ] **Local testing complete** - All features tested in Android Studio
- [ ] **AWS endpoints tested** - Run `./test_mobile_api_comprehensive.sh`
- [ ] **Database schema verified** - All tables exist (see Database Initialization section)
- [ ] **Version codes incremented** - Update in `app.json` and `mobile/android/app/build.gradle`
- [ ] **Local and production code in sync** - Same versions in `requirements.txt` and `backend-deployment/requirements.txt`
- [ ] **AAB built successfully** - Run `cd mobile/android && ./gradlew bundleRelease`
- [ ] **Signing verified** - Certificate matches `upload_certificate.pem`

---

## Critical Pre-Release Steps

### 1. Database Schema Initialization (CRITICAL)

**When:** First deployment or after schema changes  
**Why:** Database tables must exist before API calls work

**Steps:**
```bash
# Option 1: Via Lambda (recommended for private VPC RDS)
cd infrastructure
npx cdk deploy
# Then invoke CreateAllTablesLambda or CreateOtpTableLambda from AWS Console

# Option 2: Via local script (only if RDS is publicly accessible)
python3 initialize_rds_database.py
```

**Verification:**
- Check CloudWatch logs for Lambda invocations
- Test `/api/auth/send-otp` endpoint (requires `otp_verifications` table)
- Test `/api/users/register` endpoint (requires `users` table)

**Common Issues:**
- `relation "otp_verifications" does not exist` → Run `CreateOtpTableLambda`
- `relation "users" does not exist` → Run `CreateAllTablesLambda`
- Connection timeout → RDS is in private VPC, use Lambda for initialization

### 2. Package Version Synchronization (CRITICAL)

**When:** After any dependency updates  
**Why:** Version mismatches cause runtime errors in production

**Files to sync:**
- `requirements.txt` (local development)
- `backend-deployment/requirements.txt` (Lambda deployment)

**Critical versions (as of Nov 1, 2025):**
```
openai==1.109.1
httpx==0.27.0
```

**⚠️ Known Issue:** `httpx==0.28.1` does NOT support `proxies` parameter required by `openai==1.109.1`. Use `httpx==0.27.0`.

**Sync Process:**
```bash
# 1. Update backend-deployment/requirements.txt
# 2. Install in deployment directory:
cd backend-deployment
pip install -r requirements.txt -t .

# 3. Sync to local requirements.txt
cp backend-deployment/requirements.txt ../requirements.txt

# 4. Commit both files
git add requirements.txt backend-deployment/requirements.txt
```

### 3. Environment Variables Configuration

**Required Lambda Environment Variables:**
- `OPENAI_API_KEY` - For AI chat functionality
- `MESSAGE_CENTRAL_PASSWORD` - For OTP sending
- `MESSAGE_CENTRAL_CUSTOMER_ID` - Message Central API
- `MESSAGE_CENTRAL_COUNTRY` - Country code (e.g., "IN")
- `MESSAGE_CENTRAL_EMAIL` - Message Central account email
- `DB_SECRET_ARN` - AWS Secrets Manager ARN for database credentials

**Verification:**
```bash
MOBILE_LAMBDA=$(aws lambda list-functions --region ap-south-1 --query "Functions[?contains(FunctionName, 'MobileApi')].FunctionName" --output text | awk '{print $1}')
aws lambda get-function-configuration --function-name "$MOBILE_LAMBDA" --region ap-south-1 --query 'Environment.Variables' --output json
```

### 4. Code Synchronization Between Local and Production

**When:** After any backend code changes  
**Why:** Lambda needs all modules from `backend/` directory

**Critical files/directories to sync:**
```
backend-deployment/
├── mobile_lambda_handler.py
├── mobile_api_service.py
├── backend/
│   ├── api/
│   │   └── mobile_endpoints.py
│   ├── handlers/
│   │   ├── openai_chat.py
│   │   └── openai_realtime.py
│   ├── services/
│   │   ├── astrologer_service.py
│   │   ├── google_play_billing.py
│   │   └── astrology_service.py
│   ├── database/
│   │   └── manager.py
│   └── config/
│       └── settings.py
├── astrologer_personas.json
└── requirements.txt
```

**Sync Process:**
```bash
# Copy all backend code to deployment
cp -r backend/ backend-deployment/
cp mobile_lambda_handler.py backend-deployment/
cp mobile_api_service.py backend-deployment/
cp astrologer_personas.json backend-deployment/
```

**Common Issues:**
- `ModuleNotFoundError: No module named 'backend.handlers'` → Copy `backend/handlers/` to `backend-deployment/backend/handlers/`
- `ModuleNotFoundError: No module named 'database_manager'` → Use `from backend.database.manager import db`

### 5. Lambda Read-Only Filesystem Handling

**When:** Code creates directories or writes files  
**Why:** Lambda's `/var/task` is read-only

**Fixes Applied:**
- Wrap `os.makedirs()` calls in `try-except (OSError, PermissionError)` blocks
- Locations: `backend/config/settings.py`, `backend/services/astrology_service.py`

**Example:**
```python
try:
    DATA_DIR.mkdir(exist_ok=True)
except (OSError, PermissionError):
    # Lambda read-only filesystem - use /tmp if needed
    pass
```

### 6. Secrets Manager Integration

**When:** Database credentials needed in Lambda  
**Why:** Secure credential storage, no hardcoded passwords

**Implementation:**
- `backend/config/settings.py` reads from AWS Secrets Manager if `DB_SECRET_ARN` is set
- Secrets Manager contains: `host`, `port`, `username`, `password`, `dbname` (optional, defaults to `astrovoice`)

**Verification:**
```bash
# Check if Lambda can read secrets
aws logs tail "/aws/lambda/MobileApiLambda" --region ap-south-1 --since 5m | grep "Database configured"
```

---

## Testing Phases

### Phase 1: Development (Local)
**Environment:** Android Studio with local backend  
**Backend:** `python3 main_openai_realtime.py` (runs on localhost:8000)  
**API Config:** `mobile/src/config/api.ts` uses `__DEV__` flag for local URLs

**Tests:**
- [ ] OTP send/verify
- [ ] User registration
- [ ] Profile fetch
- [ ] Astrologers list
- [ ] Chat functionality
- [ ] Wallet operations

### Phase 2: Pre-Production (AWS)
**Environment:** AWS API Gateway + Lambda  
**Backend:** Deployed via CDK  
**API Config:** Production URLs in `mobile/src/config/api.ts`

**Tests:**
```bash
# Comprehensive API test
./test_mobile_api_comprehensive.sh

# Quick verification
./test_api_optimized.sh
```

**Endpoints to verify:**
- `/health` - Basic connectivity
- `/api/auth/send-otp` - OTP functionality
- `/api/auth/verify-otp` - OTP verification
- `/api/users/register` - User registration
- `/api/users/{userId}` - Profile fetch
- `/api/astrologers` - Astrologer list
- `/api/chat/start` - Chat session start
- `/api/chat/message` - Chat messages
- `/api/wallet/{userId}` - Wallet balance

### Phase 3: Production (Play Store Internal)
**Environment:** Google Play Console Internal Testing  
**Build:** Signed AAB from `mobile/android/app/build/outputs/bundle/release/`

**Tests:**
- [ ] Install app from Play Console
- [ ] OTP functionality (verify Message Central working)
- [ ] All API calls use AWS endpoints
- [ ] Chat works end-to-end
- [ ] No crashes or runtime errors

**Log Access:**
```bash
# View Lambda logs
MOBILE_LAMBDA=$(aws lambda list-functions --region ap-south-1 --query "Functions[?contains(FunctionName, 'MobileApi')].FunctionName" --output text | awk '{print $1}')
aws logs tail "/aws/lambda/$MOBILE_LAMBDA" --region ap-south-1 --follow

# View Android device logs
adb logcat | grep -E "AstroVoice|ReactNativeJS"
```

---

## Version Management

### Version Code Strategy
- Increment `versionCode` in `mobile/app.json` and `mobile/android/app/build.gradle`
- Each upload to Play Console requires a unique, higher version code
- Track published versions in `VERSION_HISTORY.md`

### Current Version (Nov 1, 2025)
- **Version Code:** 5
- **Version Name:** 1.0.4
- **Package:** `com.astrovoice.kundli`

### Version Update Process
```bash
# 1. Update app.json
{
  "version": "1.0.X",
  "android": {
    "versionCode": X,
    "package": "com.astrovoice.kundli"
  }
}

# 2. Update build.gradle (after expo prebuild)
versionCode X
versionName "1.0.X"

# 3. Commit with clear message
git commit -m "chore: bump version to 1.0.X (code: X)"
```

---

## Build Process

### Building Release AAB
```bash
cd mobile
npx expo prebuild --platform android
cd android
./gradlew bundleRelease
```

**Output:** `mobile/android/app/build/outputs/bundle/release/app-release.aab`

### Signing Configuration
- Keystore: `credentials/new_keystore.jks`
- Alias: `kundli`
- Password: (stored securely, never committed)
- Upload Certificate: `credentials/upload_certificate.pem`

**⚠️ Critical:** Never commit keystore files. They are git-ignored.

### Build Verification
```bash
# Check AAB package name
unzip -p app-release.aab META-INF/MANIFEST.MF | grep -i package

# Verify signing
jarsigner -verify -verbose -certs app-release.aab
```

---

## Deployment Process

### AWS Infrastructure Deployment
```bash
cd infrastructure
npx cdk deploy --require-approval never
```

**What it deploys:**
- API Gateway (all `/api/*` routes)
- Lambda functions (MobileApiLambda, InitDbLambda, etc.)
- RDS database (PostgreSQL)
- VPC and security groups
- Secrets Manager (database credentials)

### Verification After Deployment
```bash
# 1. Check Lambda deployment
MOBILE_LAMBDA=$(aws lambda list-functions --region ap-south-1 --query "Functions[?contains(FunctionName, 'MobileApi')].FunctionName" --output text | awk '{print $1}')
aws lambda get-function-configuration --function-name "$MOBILE_LAMBDA" --region ap-south-1 --query 'LastModified'

# 2. Test endpoints
./test_mobile_api_comprehensive.sh

# 3. Check logs
aws logs tail "/aws/lambda/$MOBILE_LAMBDA" --region ap-south-1 --since 5m
```

---

## Common Issues and Solutions

### Issue 1: "Version code X has already been used"
**Solution:** Increment version code in both `app.json` and `build.gradle`

### Issue 2: "AsyncClient.__init__() got an unexpected keyword argument 'proxies'"
**Solution:** Use `httpx==0.27.0` (not 0.28.1) with `openai==1.109.1`

### Issue 3: "relation 'otp_verifications' does not exist"
**Solution:** Invoke `CreateOtpTableLambda` from AWS Console

### Issue 4: "fe_sendauth: no password supplied"
**Solution:** Verify `DB_SECRET_ARN` is set in Lambda environment variables

### Issue 5: "Message Central password not configured"
**Solution:** Add `MESSAGE_CENTRAL_*` environment variables to Lambda

### Issue 6: "ModuleNotFoundError: No module named 'backend.handlers'"
**Solution:** Copy `backend/handlers/` to `backend-deployment/backend/handlers/`

### Issue 7: "OSError: [Errno 30] Read-only file system"
**Solution:** Wrap `os.makedirs()` calls in try-except blocks

### Issue 8: Lambda policy size limit exceeded (20KB)
**Solution:** Use API Gateway proxy resources instead of individual method permissions

---

## Post-Release Monitoring

### Log Monitoring
```bash
# Follow Lambda logs
./check_logs.sh

# Search for errors
aws logs filter-log-events \
  --log-group-name "/aws/lambda/MobileApiLambda" \
  --filter-pattern "ERROR" \
  --region ap-south-1
```

### Success Metrics
- OTP delivery rate > 95%
- API response time < 2 seconds
- Error rate < 1%
- Chat completion rate > 80%

### Rollback Procedure
1. Identify issue in CloudWatch logs
2. Revert code changes if needed
3. Redeploy via CDK: `cd infrastructure && npx cdk deploy`
4. Test critical endpoints
5. Notify users if service interruption occurred

---

## Integration Test Pipeline (Future)

**Planned:** Automated CI/CD pipeline for:
- Pre-deployment API tests
- Schema verification
- Version code validation
- AAB build and signing
- Deployment to staging environment
- Production smoke tests

---

## Release Checklist Summary

**Before Release:**
- [ ] All features tested locally
- [ ] AWS endpoints tested and working
- [ ] Database schema initialized
- [ ] Package versions synced (local ↔ production)
- [ ] Environment variables configured
- [ ] Code synced to `backend-deployment/`
- [ ] Version codes incremented
- [ ] AAB built and verified
- [ ] Changes committed to main branch

**After Release:**
- [ ] Monitor CloudWatch logs for errors
- [ ] Test app from Play Console internal testing
- [ ] Verify all critical user flows
- [ ] Document any issues encountered
- [ ] Update `VERSION_HISTORY.md`

---

## Notes

- **Always test locally first** before deploying to AWS
- **Keep local and production in sync** - same package versions
- **Database schema must be initialized** before first API calls
- **Monitor logs immediately after deployment** for any errors
- **Version codes must increment** for each Play Console upload
- **Never commit credentials** - use Secrets Manager and .gitignore

---

**Last Updated:** November 1, 2025  
**Maintainer:** Development Team
