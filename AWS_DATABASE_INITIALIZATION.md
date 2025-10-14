# AWS RDS Database Initialization Guide

**Date:** October 13, 2025  
**Database:** PostgreSQL 14 on AWS RDS  
**Region:** ap-south-1 (Mumbai)  
**Status:** ⏳ Schema initialization needed

---

## Current Situation

✅ **AWS Infrastructure Deployed**
- RDS PostgreSQL database is running
- Database endpoint: `astrovoicestack-astrovoicedb3082c5c1-vbvgo611m0ck.cziyq8g8eewt.ap-south-1.rds.amazonaws.com`
- Credentials stored in AWS Secrets Manager
- Database is in **private VPC** (secure but not directly accessible)

⏳ **Schema Not Initialized**
- Tables don't exist yet
- Need to run `database_schema.sql`
- User registration will fail until schema is initialized

---

## Database Information

```
Host: astrovoicestack-astrovoicedb3082c5c1-vbvgo611m0ck.cziyq8g8eewt.ap-south-1.rds.amazonaws.com
Port: 5432
Database: astrovoice
User: astrovoice_admin
Password: (in AWS Secrets Manager)
Secret Name: AstroVoiceStackAstroVoiceDB-3e032wdi0ISh
```

---

## Initialization Options

### Option 1: Use EC2 Bastion Host (Recommended for Production) 🏆

**Create a bastion host in the same VPC:**

1. **Create EC2 instance:**
   ```bash
   # Via AWS Console:
   # - Launch EC2 instance (t3.micro)
   # - Select same VPC as database
   # - Place in public subnet
   # - Assign Elastic IP
   # - Allow SSH (port 22) in security group
   ```

2. **SSH to bastion:**
   ```bash
   ssh -i your-key.pem ec2-user@<bastion-ip>
   ```

3. **Install PostgreSQL client:**
   ```bash
   sudo yum install postgresql14 -y
   ```

4. **Get credentials and connect:**
   ```bash
   # Get credentials from Secrets Manager
   aws secretsmanager get-secret-value \
     --secret-id AstroVoiceStackAstroVoiceDB-3e032wdi0ISh \
     --region ap-south-1
   
   # Connect
   psql -h astrovoicestack-astrovoicedb3082c5c1-vbvgo611m0ck.cziyq8g8eewt.ap-south-1.rds.amazonaws.com \
        -p 5432 -U astrovoice_admin -d postgres
   ```

5. **Create database and run schema:**
   ```sql
   CREATE DATABASE astrovoice;
   \c astrovoice
   \i database_schema.sql
   ```

---

### Option 2: Temporary Public Access (Quick for Development) ⚡

**Temporarily make database publicly accessible:**

1. **Modify RDS instance security:**
   ```bash
   # Via AWS Console:
   # 1. Go to RDS → Databases → astrovoicestack-astrovoicedb...
   # 2. Click "Modify"
   # 3. Under "Connectivity" → Public access: Yes
   # 4. Under "Security group" → Add rule: PostgreSQL (5432) from My IP
   # 5. Click "Continue" → "Apply immediately"
   ```

2. **Wait for modification to complete** (5-10 minutes)

3. **Run initialization script:**
   ```bash
   cd /Users/nikhil/workplace/voice_v1
   source venv/bin/activate
   python initialize_aws_database.py
   ```

4. **IMPORTANT: Revert to private after initialization**
   ```bash
   # Via AWS Console:
   # 1. RDS → Databases → Modify
   # 2. Public access: No
   # 3. Apply immediately
   ```

---

### Option 3: AWS Systems Manager Session Manager (No Bastion Needed) 🔧

**Use SSM for secure access:**

1. **Create EC2 instance with SSM role:**
   ```bash
   # Via Console: Launch EC2 with AmazonSSMManagedInstanceCore policy
   ```

2. **Connect via Session Manager:**
   ```bash
   aws ssm start-session --target i-<instance-id> --region ap-south-1
   ```

3. **Install PostgreSQL and run schema** (same as Option 1)

---

### Option 4: Lambda Function Initialization (Automated) 🤖

**Use Lambda to initialize from within VPC:**

I've created `lambda_init_db.py` for this purpose.

1. **Package Lambda function:**
   ```bash
   mkdir lambda-init-package
   cd lambda-init-package
   
   # Install dependencies
   pip install psycopg2-binary -t .
   
   # Copy files
   cp ../lambda_init_db.py lambda_function.py
   cp ../database_schema.sql .
   
   # Create deployment package
   zip -r lambda-init.zip .
   ```

2. **Deploy Lambda:**
   ```bash
   aws lambda create-function \
     --function-name InitAstroVoiceDB \
     --runtime python3.10 \
     --role <lambda-execution-role-arn> \
     --handler lambda_function.lambda_handler \
     --zip-file fileb://lambda-init.zip \
     --vpc-config SubnetIds=<private-subnet-ids>,SecurityGroupIds=<lambda-sg-id> \
     --region ap-south-1 \
     --timeout 60
   ```

3. **Invoke Lambda:**
   ```bash
   aws lambda invoke \
     --function-name InitAstroVoiceDB \
     --region ap-south-1 \
     response.json
   ```

---

### Option 5: Use Existing Lambda (Quickest!) ⚡⚡

**Use the already-deployed MobileApiLambda:**

Since your Lambda functions are already in the VPC with database access, we can add an initialization endpoint.

1. **Add init endpoint to mobile_endpoints.py:**
   ```python
   @router.post("/admin/init-database")
   async def init_database():
       """Initialize database schema (admin only)"""
       try:
           from backend.database.manager import db
           success = db.execute_schema('database_schema.sql')
           if success:
               return {"success": True, "message": "Database initialized"}
           return {"success": False, "message": "Initialization failed"}
       except Exception as e:
           raise HTTPException(status_code=500, detail=str(e))
   ```

2. **Deploy updated code to Lambda**

3. **Call via API:**
   ```bash
   curl -X POST https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/api/admin/init-database
   ```

---

## Recommended Approach

**For Development (Quick):**
→ **Option 2** - Temporary public access (fastest, can revert after)

**For Production:**
→ **Option 1** - Bastion host (secure, persistent access for debugging)

**For Automation:**
→ **Option 5** - API endpoint in existing Lambda (easiest integration)

---

## Check If Already Initialized

You can check if the database is initialized by:

### Method 1: Via Lambda (if deployed)
```bash
# This would work if Lambda has database access
curl https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+919999999999","full_name":"Test"}'
  
# If you get database error → Schema not initialized
# If you get success → Schema initialized
```

### Method 2: Check CloudWatch Logs
```bash
aws logs tail /aws/lambda/AstroVoiceStack-MobileApiLambda... --follow --region ap-south-1
```

---

## Current Code Status

✅ **Backend code ready:**
- `/api/users/register` - Saves to database
- `/api/chat/start` - Fetches user data
- `/api/chat/send` - AI with user context
- All database operations implemented

⏳ **Database schema not initialized:**
- Tables don't exist yet
- Need to run initialization
- Code will work once schema is initialized

---

## Quick Test After Initialization

```bash
# 1. Register a user
curl -X POST https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919876543210",
    "full_name": "Test User",
    "date_of_birth": "01/01/2000",
    "time_of_birth": "12:00 PM",
    "place_of_birth": "Mumbai",
    "gender": "Male"
  }'

# 2. Start chat
curl -X POST https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_919876543210",
    "astrologer_id": "tina_kulkarni_vedic_marriage",
    "topic": "general"
  }'

# 3. Send message with AI
curl -X POST https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "conv_...",
    "user_id": "user_919876543210",
    "astrologer_id": "tina_kulkarni_vedic_marriage",
    "message": "Hello"
  }'
```

---

## Files Created

1. `initialize_aws_database.py` - Local initialization script (won't work due to VPC)
2. `lambda_init_db.py` - Lambda function for initialization
3. This guide - AWS_DATABASE_INITIALIZATION.md

---

## Next Steps

**Choose one of the options above and:**

1. Initialize the database schema
2. Verify tables are created
3. Test API endpoints
4. Celebrate! 🎉

**My recommendation:** Use **Option 2** (temporary public access) for quick setup now, then set up **Option 1** (bastion) for ongoing access.

---

## Alternative: Update CDK to Make Database Publicly Accessible

If you want permanent public access for development:

**Edit `infrastructure/lib/astro-voice-stack.ts`:**

```typescript
const database = new rds.DatabaseInstance(this, 'AstroVoiceDB', {
  // ... existing config ...
  vpcSubnets: {
    subnetType: ec2.SubnetType.PUBLIC,  // Add this
  },
  publiclyAccessible: true,  // Add this for dev
  // ... rest of config ...
});
```

Then:
```bash
cd infrastructure
npx cdk deploy
```

⚠️ **Security Note:** Only do this for development. Production should always use private VPC.

---

**Status:** Database deployed but schema needs initialization  
**Action Required:** Choose an option above and initialize the schema  
**Estimated Time:** 5-15 minutes depending on method

