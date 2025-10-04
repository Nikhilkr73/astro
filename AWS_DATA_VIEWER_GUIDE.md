# 📊 AWS User Data Viewer Guide

## Overview

The `view_user_data.py` tool helps you monitor and visualize all user data stored across your local and AWS infrastructure.

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
4. **RDS PostgreSQL** - (Coming soon)

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

---

## 📋 **Command Options**

| Option | Description | Example |
|--------|-------------|---------|
| `--source local` | View local files only | `python3 view_user_data.py --source local` |
| `--source aws` | View AWS data only | `python3 view_user_data.py --source aws` |
| `--source all` | View everything (default) | `python3 view_user_data.py` |
| `--user USER_ID` | View detailed data for specific user | `python3 view_user_data.py --user test_user` |
| `--stats` | Show statistics summary | `python3 view_user_data.py --stats` |

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

## 🔍 **Use Cases**

### 1. Monitor Active Users
```bash
# See who's currently using the app
python3 view_user_data.py --source aws
```

### 2. Check User Profile Completion
```bash
# See which users have complete profiles
python3 view_user_data.py --source local
```

### 3. Debug Specific User Issues
```bash
# View all data for a specific user
python3 view_user_data.py --user user_001
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

1. **Regular Monitoring**: Check `--stats` daily to track growth
2. **User Support**: Use `--user` to debug user-reported issues
3. **Data Migration**: Use local data as backup before AWS migration
4. **Cost Tracking**: Monitor S3 audio file counts for storage costs
5. **Performance**: Check DynamoDB connections for scaling needs

---

## 🎯 **Next Steps**

1. ✅ View current local data
2. ✅ Configure AWS credentials
3. ✅ View AWS data
4. ⏭️ Set up automated monitoring
5. ⏭️ Create data export scripts
6. ⏭️ Implement data cleanup policies

---

**Created**: October 4, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready to use

