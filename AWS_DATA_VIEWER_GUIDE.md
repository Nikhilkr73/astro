# 📊 AWS User Data Viewer Guide

## Overview

The `view_user_data.py` tool helps you monitor and visualize all user data stored across your local and AWS infrastructure, including direct SQL query capabilities for PostgreSQL databases.

---

## 🎯 **What Data Can You View?**

### **Local Storage (Development)**
1. **User Conversation States** (`user_states.json`)
   - Current conversation progress
   - Birth information collection status
   - Incomplete profiles

2. **Astrology Profiles** (`astrology_data/user_profiles.json`)
   - Complete user profiles
   - Birth charts
   - Subscription info
   - Reading history

### **AWS Storage (Production)**
1. **DynamoDB** - WebSocket connections
2. **S3** - Audio recordings
3. **Cognito** - Authenticated users
4. **RDS PostgreSQL** - User profiles, conversations, wallets, transactions

### **SQL Database Queries**
1. **Direct SQL Execution** - Run custom queries on PostgreSQL
2. **Table Analysis** - View schema and data distribution
3. **User Analytics** - Advanced user behavior queries
4. **Performance Monitoring** - Database health and metrics

---

## 🚀 **Quick Start**

### View Everything
```bash
python3 view_user_data.py
```

### View Local Data Only
```bash
python3 view_user_data.py --source local
```

### View AWS Data Only
```bash
python3 view_user_data.py --source aws
```

### View Specific User
```bash
python3 view_user_data.py --user test_user_voice
```

### View Statistics
```bash
python3 view_user_data.py --stats
```

### Run SQL Queries
```bash
# Execute custom SQL query
python3 view_user_data.py --sql "SELECT * FROM users LIMIT 10"

# Analyze user patterns
python3 view_user_data.py --sql "SELECT gender, COUNT(*) FROM users GROUP BY gender"

# Check wallet balances
python3 view_user_data.py --sql "SELECT user_id, balance FROM wallets ORDER BY balance DESC"
```

### Delete Users from Database
```bash
# Delete specific user (CASCADE will remove all related data)
python3 view_user_data.py --sql "DELETE FROM users WHERE user_id = 'user_id_to_delete'"

# Delete users by phone number
python3 view_user_data.py --sql "DELETE FROM users WHERE phone_number = '1234567890'"

# Delete users with incomplete profiles
python3 view_user_data.py --sql "DELETE FROM users WHERE birth_date IS NULL AND birth_time IS NULL"

# Delete users created before a specific date
python3 view_user_data.py --sql "DELETE FROM users WHERE created_at < '2025-01-01'"

# Delete test users (be careful!)
python3 view_user_data.py --sql "DELETE FROM users WHERE user_id LIKE 'test_%'"
```

### Interactive SQL Mode
```bash
# Enter interactive SQL mode
python3 view_user_data.py --sql-interactive
```

---

## 📋 **Command Options**

| Option | Description | Example |
|--------|-------------|---------|
| `--source local` | View local files only | `python3 view_user_data.py --source local` |
| `--source aws` | View AWS data only | `python3 view_user_data.py --source aws` |
| `--source all` | View everything (default) | `python3 view_user_data.py` |
| `--user USER_ID` | View detailed data for specific user | `python3 view_user_data.py --user test_user` |
| `--stats` | Show statistics summary | `python3 view_user_data.py --stats` |
| `--sql "QUERY"` | Execute SQL query on PostgreSQL | `python3 view_user_data.py --sql "SELECT * FROM users"` |
| `--sql-interactive` | Enter interactive SQL mode | `python3 view_user_data.py --sql-interactive` |
| `--sql-file FILE` | Execute SQL from file | `python3 view_user_data.py --sql-file queries.sql` |
| `--tables` | List all database tables | `python3 view_user_data.py --tables` |
| `--schema TABLE` | Show table schema | `python3 view_user_data.py --schema users` |
| `--analyze` | Analyze customer ID patterns | `python3 view_user_data.py --analyze` |
| `--delete-user USER_ID` | Delete specific user (with confirmation) | `python3 view_user_data.py --delete-user test_user` |
| `--soft-delete USER_ID` | Mark user as deleted (recommended) | `python3 view_user_data.py --soft-delete test_user` |

---

## 🔧 **Setup AWS Access**

### 1. Configure AWS Credentials

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `ap-south-1`
- Default output format: `json`

### 2. Set Environment Variables

Create or update `.env`:
```bash
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

---

## 🗄️ **SQL Query Capabilities**

### **Database Schema Overview**

The PostgreSQL database contains the following main tables:

```sql
-- Users table
users (
    user_id VARCHAR PRIMARY KEY,
    full_name VARCHAR,
    phone_number VARCHAR,
    email VARCHAR,
    birth_date DATE,
    birth_time TIME,
    birth_location VARCHAR,
    gender VARCHAR,
    language_preference VARCHAR,
    subscription_type VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    metadata JSONB
)

-- Wallets table
wallets (
    wallet_id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(user_id),
    balance DECIMAL,
    currency VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- Transactions table
transactions (
    transaction_id VARCHAR PRIMARY KEY,
    user_id VARCHAR,
    wallet_id VARCHAR,
    transaction_type VARCHAR,
    amount DECIMAL,
    balance_before DECIMAL,
    balance_after DECIMAL,
    created_at TIMESTAMP
)

-- Conversations table
conversations (
    conversation_id VARCHAR PRIMARY KEY,
    user_id VARCHAR,
    astrologer_id VARCHAR,
    topic VARCHAR,
    status VARCHAR,
    total_messages INTEGER,
    created_at TIMESTAMP,
    ended_at TIMESTAMP
)

-- Messages table
messages (
    message_id VARCHAR PRIMARY KEY,
    conversation_id VARCHAR,
    sender_type VARCHAR,
    message_type VARCHAR,
    content TEXT,
    sent_at TIMESTAMP
)
```

### **Common SQL Queries**

#### **User Analytics**
```bash
# Top users by wallet balance
python3 view_user_data.py --sql "
SELECT u.full_name, u.phone_number, w.balance 
FROM users u 
JOIN wallets w ON u.user_id = w.user_id 
ORDER BY w.balance DESC 
LIMIT 10"

# Users by gender distribution
python3 view_user_data.py --sql "
SELECT gender, COUNT(*) as count 
FROM users 
WHERE gender IS NOT NULL 
GROUP BY gender 
ORDER BY count DESC"

# Users registered in last 7 days
python3 view_user_data.py --sql "
SELECT user_id, full_name, created_at 
FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days' 
ORDER BY created_at DESC"
```

#### **Financial Analytics**
```bash
# Total wallet balance across all users
python3 view_user_data.py --sql "
SELECT SUM(balance) as total_balance, 
       COUNT(*) as total_wallets,
       AVG(balance) as avg_balance
FROM wallets"

# Transaction summary by type
python3 view_user_data.py --sql "
SELECT transaction_type, 
       COUNT(*) as count,
       SUM(amount) as total_amount
FROM transactions 
GROUP BY transaction_type"

# Users with highest transaction activity
python3 view_user_data.py --sql "
SELECT u.full_name, COUNT(t.transaction_id) as transaction_count
FROM users u
JOIN transactions t ON u.user_id = t.user_id
GROUP BY u.user_id, u.full_name
ORDER BY transaction_count DESC
LIMIT 10"
```

#### **Conversation Analytics**
```bash
# Most active conversations
python3 view_user_data.py --sql "
SELECT c.conversation_id, u.full_name, c.total_messages, c.created_at
FROM conversations c
JOIN users u ON c.user_id = u.user_id
ORDER BY c.total_messages DESC
LIMIT 10"

# Conversation duration analysis
python3 view_user_data.py --sql "
SELECT 
    CASE 
        WHEN total_duration_seconds < 60 THEN '< 1 min'
        WHEN total_duration_seconds < 300 THEN '1-5 min'
        WHEN total_duration_seconds < 900 THEN '5-15 min'
        ELSE '> 15 min'
    END as duration_range,
    COUNT(*) as count
FROM conversations 
WHERE total_duration_seconds IS NOT NULL
GROUP BY duration_range
ORDER BY count DESC"
```

#### **Data Quality Checks**
```bash
# Users with incomplete profiles
python3 view_user_data.py --sql "
SELECT user_id, full_name, 
       CASE WHEN birth_date IS NULL THEN 'Missing DOB' END as missing_data
FROM users 
WHERE birth_date IS NULL OR birth_time IS NULL OR birth_location IS NULL"

# Duplicate phone numbers
python3 view_user_data.py --sql "
SELECT phone_number, COUNT(*) as count
FROM users 
WHERE phone_number IS NOT NULL
GROUP BY phone_number 
HAVING COUNT(*) > 1"

# Users without wallets
python3 view_user_data.py --sql "
SELECT u.user_id, u.full_name
FROM users u
LEFT JOIN wallets w ON u.user_id = w.user_id
WHERE w.user_id IS NULL"
```

### **Interactive SQL Mode**

```bash
# Start interactive mode
python3 view_user_data.py --sql-interactive

# Example session:
SQL> SELECT COUNT(*) FROM users;
SQL> SELECT * FROM users WHERE gender = 'Female' LIMIT 5;
SQL> \tables  # List all tables
SQL> \schema users  # Show table schema
SQL> \quit  # Exit
```

### **SQL File Execution**

Create a file `user_analytics.sql`:
```sql
-- User Analytics Report
SELECT 
    'Total Users' as metric,
    COUNT(*) as value
FROM users

UNION ALL

SELECT 
    'Users with Complete Profiles' as metric,
    COUNT(*) as value
FROM users 
WHERE birth_date IS NOT NULL 
  AND birth_time IS NOT NULL 
  AND birth_location IS NOT NULL

UNION ALL

SELECT 
    'Total Wallet Balance' as metric,
    SUM(balance) as value
FROM wallets;
```

Execute it:
```bash
python3 view_user_data.py --sql-file user_analytics.sql
```

---

## 📊 **Output Examples**

### Local Data View
```
📂 LOCAL DATA STORAGE
================================================================================

🔄 USER CONVERSATION STATES (user_states.json)
--------------------------------------------------------------------------------
╒═══════════════════╤════════╤══════════════╤═════════════╤═══════════════╤══════════╕
│ User ID           │ Name   │ Birth Date   │ Birth Time  │ Location      │ Complete │
╞═══════════════════╪════════╪══════════════╪═════════════╪═══════════════╪══════════╡
│ test_user_voice   │ Sarah  │ 1990-05-15   │ 03:30       │ New York, USA │ ✅        │
│ test_user         │ N/A    │ N/A          │ N/A         │ N/A           │ ❌        │
╘═══════════════════╧════════╧══════════════╧═════════════╧═══════════════╧══════════╛

📊 Total users: 2
```

### User Detail View
```
👤 DETAILED VIEW: test_user_voice
================================================================================

🔄 Conversation State:
--------------------------------------------------------------------------------
{
  "name": "Sarah",
  "birth_date": "1990-05-15",
  "birth_time": "03:30",
  "birth_location": "New York City, USA",
  "timezone": null,
  "profile_complete": true
}

⭐ Astrology Profile:
--------------------------------------------------------------------------------
{
  "user_id": "test_user_voice",
  "name": "Sarah",
  "birth_date": "1990-05-15",
  "birth_time": "03:30",
  "birth_location": "New York City, USA",
  "subscription_type": "free",
  "total_readings": 0,
  "created_at": "2025-09-29T21:33:27.476522"
}
```

### SQL Query Output
```
🔍 SQL QUERY RESULTS
================================================================================

Query: SELECT gender, COUNT(*) as count FROM users WHERE gender IS NOT NULL GROUP BY gender

╒═══════════╤═══════╕
│ Gender    │ Count │
╞═══════════╪═══════╡
│ Male      │ 8     │
│ Female    │ 5     │
╘═══════════╧═══════╛

Query: SELECT u.full_name, w.balance FROM users u JOIN wallets w ON u.user_id = w.user_id ORDER BY w.balance DESC LIMIT 5

╒═══════════════════════╤═══════════╕
│ Full Name             │ Balance   │
╞═══════════════════════╪═══════════╡
│ UUID Test User        │ 500.00    │
│ Final Test User       │ 500.00    │
│ Birth Test User       │ 500.00    │
│ Test User Success     │ 500.00    │
│ Direct Test User      │ 500.00    │
╘═══════════════════════╧═══════════╛
```

### Statistics View
```
📊 OVERALL STATISTICS
================================================================================

📂 Local Storage:
   • User States: 3
   • User Profiles: 3

☁️  AWS Storage:
   • Active WebSocket Connections: 0
   • Authenticated Users (Cognito): 5
   • Audio Files (S3): 127

🗄️  Database Statistics:
   • Total Users: 13
   • UUID-based IDs: 6 (46%)
   • Total Wallet Balance: ₹6,500.00
   • Active Conversations: 0
```

---

## 🗂️ **Data Storage Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                        │
├─────────────────────────────────────────────────────────────┤
│  user_states.json              → Conversation progress       │
│  astrology_data/               → Complete user profiles      │
│    └── user_profiles.json                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      AWS PRODUCTION                          │
├─────────────────────────────────────────────────────────────┤
│  DynamoDB                      → WebSocket connections       │
│    └── astro-voice-websocket-connections                     │
│                                                               │
│  S3                            → Audio recordings            │
│    └── astro-voice-audio-*                                   │
│        └── user_id/                                          │
│            └── audio_files.m4a                               │
│                                                               │
│  Cognito                       → User authentication         │
│    └── AstroVoiceUserPool                                    │
│                                                               │
│  RDS PostgreSQL                → Persistent user data        │
│    └── astrovoice_db                                         │
│        ├── users                                             │
│        ├── profiles                                          │
│        ├── conversations                                     │
│        └── readings                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗑️ **User Deletion Guide**

### **⚠️ IMPORTANT SAFETY WARNINGS**

**Before deleting any user:**
1. **Always backup data** if needed
2. **Test on development environment** first
3. **Verify user ID** is correct
4. **Understand CASCADE behavior** - deleting a user removes ALL related data

### **What Gets Deleted (CASCADE)**

When you delete a user, the following data is **automatically deleted**:

```sql
-- Tables with ON DELETE CASCADE:
conversations        -- All user conversations
messages            -- All messages in those conversations  
user_profiles       -- Astrology profile data
readings            -- All readings/consultations
user_sessions       -- Session tracking data
wallets             -- User wallet and balance
transactions        -- All transaction history
otp_verifications   -- OTP verification records
session_reviews     -- User reviews and ratings
```

### **Safe User Deletion Commands**

```bash
# 1. First, check what will be deleted
python3 view_user_data.py --sql "
SELECT 
    u.user_id, u.full_name, u.phone_number,
    COUNT(c.conversation_id) as conversations,
    COUNT(t.transaction_id) as transactions,
    w.balance
FROM users u
LEFT JOIN conversations c ON u.user_id = c.user_id
LEFT JOIN transactions t ON u.user_id = t.user_id  
LEFT JOIN wallets w ON u.user_id = w.user_id
WHERE u.user_id = 'USER_ID_TO_DELETE'
GROUP BY u.user_id, u.full_name, u.phone_number, w.balance"

# 2. Delete specific user
python3 view_user_data.py --sql "DELETE FROM users WHERE user_id = 'USER_ID_TO_DELETE'"

# 3. Verify deletion
python3 view_user_data.py --sql "SELECT COUNT(*) FROM users WHERE user_id = 'USER_ID_TO_DELETE'"
```

### **Bulk User Deletion**

```bash
# Delete users by phone number pattern
python3 view_user_data.py --sql "DELETE FROM users WHERE phone_number LIKE '999%'"

# Delete test users
python3 view_user_data.py --sql "DELETE FROM users WHERE user_id LIKE 'test_%'"

# Delete users with incomplete profiles (older than 30 days)
python3 view_user_data.py --sql "
DELETE FROM users 
WHERE birth_date IS NULL 
  AND birth_time IS NULL 
  AND created_at < NOW() - INTERVAL '30 days'"

# Delete users created before specific date
python3 view_user_data.py --sql "DELETE FROM users WHERE created_at < '2025-01-01'"
```

### **Recovery Options**

**If you accidentally delete a user:**

1. **Check if you have backups** of the database
2. **Restore from backup** if available
3. **Recreate user manually** if no backup:
   ```bash
   # Recreate user with same data
   python3 view_user_data.py --sql "
   INSERT INTO users (user_id, phone_number, full_name, created_at) 
   VALUES ('recovered_user_id', 'phone_number', 'User Name', NOW())"
   ```

### **Best Practices**

1. **Always use transactions** for critical deletions:
   ```bash
   python3 view_user_data.py --sql "
   BEGIN;
   DELETE FROM users WHERE user_id = 'USER_ID';
   -- Check results before committing
   SELECT COUNT(*) FROM users WHERE user_id = 'USER_ID';
   -- If OK: COMMIT; If not: ROLLBACK;
   COMMIT;"
   ```

2. **Soft delete instead of hard delete** (recommended):
   ```bash
   # Instead of DELETE, mark as inactive
   python3 view_user_data.py --sql "
   UPDATE users 
   SET account_status = 'deleted', updated_at = NOW() 
   WHERE user_id = 'USER_ID'"
   ```

3. **Use LIMIT for bulk operations**:
   ```bash
   # Delete in batches of 10
   python3 view_user_data.py --sql "
   DELETE FROM users 
   WHERE user_id LIKE 'test_%' 
   LIMIT 10"
   ```

---

## 🔍 **Use Cases**

### 1. Monitor Active Users
```bash
# See who's currently using the app
python3 view_user_data.py --source aws

# Check recent user registrations
python3 view_user_data.py --sql "SELECT user_id, full_name, created_at FROM users ORDER BY created_at DESC LIMIT 10"
```

### 2. Check User Profile Completion
```bash
# See which users have complete profiles
python3 view_user_data.py --source local

# SQL version - users with incomplete birth info
python3 view_user_data.py --sql "
SELECT user_id, full_name, 
       CASE WHEN birth_date IS NULL THEN 'Missing DOB' 
            WHEN birth_time IS NULL THEN 'Missing Time'
            WHEN birth_location IS NULL THEN 'Missing Location'
            ELSE 'Complete' END as status
FROM users"
```

### 3. Debug Specific User Issues
```bash
# View all data for a specific user
python3 view_user_data.py --user user_001

# SQL version - comprehensive user data
python3 view_user_data.py --sql "
SELECT u.*, w.balance, COUNT(t.transaction_id) as transaction_count
FROM users u
LEFT JOIN wallets w ON u.user_id = w.user_id
LEFT JOIN transactions t ON u.user_id = t.user_id
WHERE u.user_id = 'user_001'
GROUP BY u.user_id, w.balance"

# View ALL data for user by phone number (comprehensive)
python3 view_user_data.py --sql "
SELECT 
    '=== USER PROFILE ===' as section,
    u.user_id,
    u.full_name,
    u.phone_number,
    u.email,
    u.birth_date,
    u.birth_time,
    u.birth_location,
    u.gender,
    u.language_preference,
    u.subscription_type,
    u.account_status,
    u.created_at,
    u.updated_at,
    u.last_login_at
FROM users u
WHERE u.phone_number = '9602179666'

UNION ALL

SELECT 
    '=== WALLET INFO ===' as section,
    w.wallet_id,
    w.balance::text,
    w.currency,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
FROM wallets w
JOIN users u ON w.user_id = u.user_id
WHERE u.phone_number = '9602179666'

UNION ALL

SELECT 
    '=== TRANSACTIONS ===' as section,
    t.transaction_id,
    t.transaction_type,
    t.amount::text,
    t.balance_before::text,
    t.balance_after::text,
    t.payment_method,
    t.payment_status,
    t.description,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
FROM transactions t
JOIN users u ON t.user_id = u.user_id
WHERE u.phone_number = '9602179666'

UNION ALL

SELECT 
    '=== CONVERSATIONS ===' as section,
    c.conversation_id,
    c.topic,
    c.status,
    c.total_messages::text,
    c.started_at::text,
    c.ended_at::text,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
FROM conversations c
JOIN users u ON c.user_id = u.user_id
WHERE u.phone_number = '9602179666'

UNION ALL

SELECT 
    '=== OTP VERIFICATIONS ===' as section,
    o.verification_id::text,
    o.otp_code,
    o.status,
    o.created_at::text,
    o.verified_at::text,
    o.message_central_verification_id,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
FROM otp_verifications o
WHERE o.phone_number = '9602179666'

ORDER BY section, u.created_at DESC;"

# Quick user data lookup by phone (simpler format)
python3 view_user_data.py --sql "
SELECT 
    'USER:' as type, u.user_id, u.full_name, u.phone_number, u.birth_date, u.gender, u.created_at
FROM users u
WHERE u.phone_number = '9602179666'

UNION ALL

SELECT 
    'WALLET:' as type, w.wallet_id, w.balance::text, w.currency, NULL, NULL, w.created_at
FROM wallets w
JOIN users u ON w.user_id = u.user_id
WHERE u.phone_number = '9602179666'

UNION ALL

SELECT 
    'TRANSACTION:' as type, t.transaction_id, t.transaction_type, t.amount::text, t.payment_status, NULL, t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.user_id
WHERE u.phone_number = '9602179666'

ORDER BY type, created_at DESC;"
```

### 4. Track Audio Storage
```bash
# See audio files stored in S3
python3 view_user_data.py --source aws
```

### 5. Quick Stats Check
```bash
# Get overview of all data
python3 view_user_data.py --stats

# SQL version - detailed analytics
python3 view_user_data.py --sql "
SELECT 
    'Total Users' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 
    'Total Wallet Balance' as metric, SUM(balance) as value FROM wallets
UNION ALL
SELECT 
    'Avg Balance per User' as metric, AVG(balance) as value FROM wallets"
```

### 6. Financial Analysis
```bash
# Top spenders
python3 view_user_data.py --sql "
SELECT u.full_name, SUM(t.amount) as total_spent
FROM users u
JOIN transactions t ON u.user_id = t.user_id
WHERE t.transaction_type = 'deduction'
GROUP BY u.user_id, u.full_name
ORDER BY total_spent DESC
LIMIT 10"

# Revenue analysis
python3 view_user_data.py --sql "
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as transactions,
    SUM(amount) as total_amount
FROM transactions
WHERE transaction_type = 'deduction'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC
LIMIT 30"
```

### 7. User Behavior Analysis
```bash
# Most active users by conversation count
python3 view_user_data.py --sql "
SELECT u.full_name, COUNT(c.conversation_id) as conversation_count
FROM users u
LEFT JOIN conversations c ON u.user_id = c.user_id
GROUP BY u.user_id, u.full_name
ORDER BY conversation_count DESC
LIMIT 10"

# User engagement by language preference
python3 view_user_data.py --sql "
SELECT language_preference, COUNT(*) as user_count,
       AVG(w.balance) as avg_balance
FROM users u
LEFT JOIN wallets w ON u.user_id = w.user_id
GROUP BY language_preference
ORDER BY user_count DESC"
```

---

## 🛠️ **Troubleshooting**

### AWS Credentials Error
```
❌ Error: Unable to locate credentials
```

**Solution:**
```bash
aws configure
# Or
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### Table Not Found Error
```
❌ Error: Requested resource not found (DynamoDB)
```

**Solution:**
- Make sure AWS CDK stack is deployed
- Check table name matches in code
- Verify region is correct

### Permission Denied Error
```
❌ Error: User is not authorized to perform
```

**Solution:**
- Check IAM permissions
- User needs read access to:
  - DynamoDB: Scan
  - S3: ListBucket, GetObject
  - Cognito: ListUsers

### Database Connection Error
```
❌ Error: Database connection failed
```

**Solution:**
- Check PostgreSQL service is running: `brew services list | grep postgresql`
- Verify database credentials in `.env` file
- Test connection: `python3 view_user_data.py --sql "SELECT version()"`

### SQL Syntax Error
```
❌ Error: syntax error at or near "SELECT"
```

**Solution:**
- Check SQL syntax - use proper PostgreSQL syntax
- Escape quotes in queries: `python3 view_user_data.py --sql "SELECT * FROM users WHERE name = 'John'"` 
- Use single quotes for string literals
- Check table and column names exist: `python3 view_user_data.py --tables`

### Query Timeout Error
```
❌ Error: Query execution timeout
```

**Solution:**
- Add LIMIT to large queries: `SELECT * FROM users LIMIT 1000`
- Use indexes for better performance
- Break complex queries into smaller parts

---

## 📈 **Advanced Usage**

### Watch Data in Real-Time
```bash
# Refresh every 5 seconds
watch -n 5 'python3 view_user_data.py --stats'
```

### Export User Data
```bash
# View specific user and save to file
python3 view_user_data.py --user test_user > user_data_export.txt
```

### Count Users by Status
```bash
# Count complete vs incomplete profiles
python3 view_user_data.py --source local | grep "Complete"
```

---

## 🔐 **Security Notes**

1. **Never commit** AWS credentials to Git
2. **Restrict access** to production data
3. **Use IAM roles** instead of access keys when possible
4. **Rotate credentials** regularly
5. **Enable MFA** on AWS account

---

## 📚 **Related Files**

| File | Purpose |
|------|---------|
| `user_states.json` | Local conversation states |
| `astrology_data/user_profiles.json` | Local user profiles |
| `openai_realtime_handler.py` | Manages user state updates |
| `astrology_profile.py` | Manages astrology profiles |
| `astro-voice-aws-infra/` | AWS infrastructure code |

---

## 💡 **Tips**

### **General Monitoring**
1. **Regular Monitoring**: Check `--stats` daily to track growth
2. **User Support**: Use `--user` to debug user-reported issues
3. **Data Migration**: Use local data as backup before AWS migration
4. **Cost Tracking**: Monitor S3 audio file counts for storage costs
5. **Performance**: Check DynamoDB connections for scaling needs

### **SQL Query Tips**
1. **Always Use LIMIT**: Prevent accidental large result sets
   ```bash
   python3 view_user_data.py --sql "SELECT * FROM users LIMIT 100"
   ```

2. **Use Indexes**: Query on indexed columns for better performance
   ```bash
   python3 view_user_data.py --sql "SELECT * FROM users WHERE user_id = 'specific_id'"
   ```

3. **Batch Operations**: Use transactions for multiple related queries
   ```bash
   python3 view_user_data.py --sql "
   BEGIN;
   UPDATE wallets SET balance = balance - 100 WHERE user_id = 'user_123';
   INSERT INTO transactions (user_id, amount, transaction_type) VALUES ('user_123', 100, 'deduction');
   COMMIT;"
   ```

4. **Data Validation**: Always check for NULL values
   ```bash
   python3 view_user_data.py --sql "
   SELECT COUNT(*) FROM users WHERE birth_date IS NULL"
   ```

5. **Performance Monitoring**: Use EXPLAIN for query optimization
   ```bash
   python3 view_user_data.py --sql "EXPLAIN SELECT * FROM users WHERE gender = 'Male'"
   ```

### **Security Best Practices**
1. **Never commit** AWS credentials to Git
2. **Restrict access** to production data
3. **Use IAM roles** instead of access keys when possible
4. **Rotate credentials** regularly
5. **Enable MFA** on AWS account
6. **Validate SQL inputs** to prevent injection attacks
7. **Use parameterized queries** when possible

---

## 🎯 **Next Steps**

1. ✅ View current local data
2. ✅ Configure AWS credentials
3. ✅ View AWS data
4. ✅ SQL query capabilities implemented
5. ✅ UUID-based user IDs implemented
6. ⏭️ Set up automated monitoring
7. ⏭️ Create data export scripts
8. ⏭️ Implement data cleanup policies
9. ⏭️ Add more advanced SQL analytics
10. ⏭️ Create scheduled reports

---

**Created**: October 4, 2025  
**Updated**: October 18, 2025  
**Version**: 2.0.0  
**Status**: ✅ Ready to use with SQL capabilities

