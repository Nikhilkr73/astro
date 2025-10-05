# ✅ AWS Database Status - Already Deployed!

## 🎉 Good News!

**Your AWS RDS PostgreSQL database is already deployed and running!**

---

## 📊 Current AWS Infrastructure

### **CloudFormation Stack:**
- **Stack Name:** AstroVoiceStack
- **Status:** ✅ UPDATE_COMPLETE
- **Region:** ap-south-1 (Mumbai)

### **Deployed Resources:**

#### **1. RDS PostgreSQL Database** ✅
- **Endpoint:** `astrovoicestack-astrovoicedb3082c5c1-vbvgo611m0ck.cziyq8g8eewt.ap-south-1.rds.amazonaws.com`
- **Engine:** PostgreSQL 14
- **Instance:** db.t3.micro
- **Storage:** 20 GB
- **Backup:** 7 days retention
- **Encryption:** ✅ Enabled

#### **2. DynamoDB Table** ✅
- **Table Name:** `astro-voice-websocket-connections`
- **Purpose:** WebSocket connection tracking
- **Billing:** Pay-per-request

#### **3. S3 Bucket** ✅
- **Bucket Name:** `astro-voice-audio-677502935540-ap-south-1`
- **Purpose:** Audio file storage
- **Encryption:** ✅ S3-managed

#### **4. Cognito User Pool** ✅
- **Pool ID:** `ap-south-1_tZUkCIGwk`
- **Client ID:** `44sfdu8765ga836a3ug6mjm6l2`
- **Purpose:** User authentication

#### **5. API Gateway** ✅
- **REST API:** `https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/`
- **WebSocket API:** `wss://g3jnrrvfxf.execute-api.ap-south-1.amazonaws.com/prod`

---

## 🔐 Database Credentials

Your database credentials are stored in **AWS Secrets Manager**:
- **Secret Name:** `AstroVoiceStackAstroVoiceDB-3e032wdi0ISh`
- **Region:** ap-south-1

---

## 🚀 How to Connect to Your AWS Database

### **Option 1: Automatic Setup (Recommended)**

Run this script to automatically get credentials and update your `.env`:

```bash
./get_aws_db_credentials.sh
```

This will:
1. ✅ Fetch credentials from AWS Secrets Manager
2. ✅ Update your `.env` file
3. ✅ Test the database connection
4. ✅ Show you connection status

### **Option 2: Manual Setup**

```bash
# 1. Get database credentials
aws secretsmanager get-secret-value \
  --secret-id AstroVoiceStackAstroVoiceDB-3e032wdi0ISh \
  --region ap-south-1 \
  --query SecretString \
  --output text | jq

# 2. Add to .env file
cat >> .env << EOF
DB_HOST=astrovoicestack-astrovoicedb3082c5c1-vbvgo611m0ck.cziyq8g8eewt.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=astrovoice_admin
DB_PASSWORD=<from secrets manager>
EOF

# 3. Test connection
python3 database_manager.py
```

---

## 📝 Initialize Database Schema

Once connected, initialize your database with the schema:

```bash
# Install required package (if not already installed)
pip install psycopg2-binary

# Initialize schema
python3 database_manager.py

# Or run SQL directly
psql -h <DB_HOST> -U astrovoice_admin -d postgres -f database_schema.sql
```

---

## 🔌 Connection Details

### **From Local Machine:**

If your database is in a **private subnet** (recommended for security), you'll need:

**Option A: Bastion Host**
```bash
# SSH tunnel through bastion
ssh -i key.pem -L 5432:<DB_ENDPOINT>:5432 ec2-user@<bastion-ip>

# Then connect locally
psql -h localhost -p 5432 -U astrovoice_admin -d postgres
```

**Option B: VPN Connection**
- Set up AWS Client VPN
- Connect to VPC
- Access database directly

**Option C: Make Publicly Accessible** (Not recommended for production)
```bash
# Modify DB instance to be publicly accessible
aws rds modify-db-instance \
  --db-instance-identifier <instance-id> \
  --publicly-accessible \
  --region ap-south-1
```

### **From Lambda (Already Configured):**

Your Lambda functions can already access the database:
- ✅ In same VPC
- ✅ Security groups configured
- ✅ Credentials available via environment variable `DB_SECRET_ARN`

---

## 🎯 What You Need to Do

### **Immediate Steps:**

1. **Get Database Credentials:**
   ```bash
   ./get_aws_db_credentials.sh
   ```

2. **Initialize Schema:**
   ```bash
   python3 database_manager.py
   ```

3. **Verify Tables Created:**
   ```python
   from database_manager import db
   astrologers = db.get_all_astrologers()
   print(f"Found {len(astrologers)} astrologers")
   ```

### **Optional: Test from AWS Console**

1. Go to AWS RDS Console
2. Select your database
3. Click "Query Editor"
4. Run test queries

---

## 📊 Database Schema Already Created

You have the complete schema ready:
- ✅ `database_schema.sql` - Full schema with 7 tables
- ✅ `database_manager.py` - Python API for operations
- ✅ `DATABASE_SETUP_GUIDE.md` - Complete documentation

**Tables that will be created:**
1. `users` - User accounts and profiles
2. `astrologers` - Astrologer personalities
3. `conversations` - Chat sessions
4. `messages` - Message history
5. `readings` - Astrology readings
6. `user_profiles` - Extended user data
7. `user_sessions` - Session tracking

---

## 🛡️ Security Notes

### **Current Setup:**
- ✅ Database in VPC (private network)
- ✅ Security groups configured
- ✅ Encryption at rest enabled
- ✅ Credentials in Secrets Manager
- ✅ Backup retention 7 days

### **Recommendations:**
1. Don't make database publicly accessible
2. Use bastion host or VPN for access
3. Rotate credentials regularly
4. Enable enhanced monitoring (costs extra)
5. Set up CloudWatch alarms

---

## 💰 Cost Estimate

**Current Resources (ap-south-1):**
- RDS db.t3.micro: ~$15/month
- DynamoDB (pay-per-request): ~$1-5/month
- S3 storage: ~$0.025/GB/month
- API Gateway: First 1M requests free

**Total:** ~$20-30/month (low usage)

---

## 🔄 Migration Path

### **Migrate from Local to AWS Database:**

```python
# 1. Connect to AWS database
from database_manager import db

# 2. Migrate user states
import json
with open('user_states.json', 'r') as f:
    user_states = json.load(f)

for user_id, state in user_states.items():
    db.create_user({
        'user_id': user_id,
        'full_name': state.get('name'),
        'display_name': state.get('name'),
        'metadata': state
    })

# 3. Verify migration
users = db.get_user('test_user_voice')
print(users)
```

---

## 🧪 Testing

### **Test Database Connection:**
```bash
python3 database_manager.py
```

### **Test from Python:**
```python
from database_manager import db

# Test connection
db.test_database_connection()

# Get astrologers (sample data included)
astrologers = db.get_all_astrologers()
for ast in astrologers:
    print(f"{ast['display_name']} - {ast['specialization']}")
```

---

## 📞 Troubleshooting

### **Can't Connect to Database:**

**Error:** "Connection timed out"
- **Cause:** Database in private subnet
- **Solution:** Use bastion host or VPN

**Error:** "Authentication failed"
- **Cause:** Wrong credentials
- **Solution:** Run `./get_aws_db_credentials.sh` again

**Error:** "Could not resolve hostname"
- **Cause:** DNS issue
- **Solution:** Check endpoint URL, verify AWS region

---

## 📖 Quick Reference

### **Get Database Info:**
```bash
aws cloudformation describe-stacks \
  --stack-name AstroVoiceStack \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs'
```

### **Get Credentials:**
```bash
aws secretsmanager get-secret-value \
  --secret-id AstroVoiceStackAstroVoiceDB-3e032wdi0ISh \
  --region ap-south-1
```

### **Check Database Status:**
```bash
aws rds describe-db-instances \
  --region ap-south-1 \
  --query 'DBInstances[?contains(DBInstanceIdentifier, `astrovoice`)].DBInstanceStatus'
```

---

## ✅ Summary

**Status:** ✅ AWS Database is deployed and ready!

**What you have:**
- PostgreSQL RDS database (running)
- Credentials in Secrets Manager
- Complete schema ready to deploy
- Python API for database operations

**Next steps:**
1. Run `./get_aws_db_credentials.sh`
2. Initialize schema with `python3 database_manager.py`
3. Start using the database!

---

**Created:** October 4, 2025  
**Database Endpoint:** astrovoicestack-astrovoicedb3082c5c1-vbvgo611m0ck.cziyq8g8eewt.ap-south-1.rds.amazonaws.com  
**Status:** ✅ Deployed and running

