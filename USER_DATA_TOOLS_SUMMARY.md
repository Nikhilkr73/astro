# 🎯 User Data Management Tools - Complete Guide

## ✅ **What You Now Have**

You now have a complete suite of tools to monitor, view, and export all user data stored in your AWS account and local development environment!

---

## 🛠️ **Tools Created**

### 1. **📊 Data Viewer** (`view_user_data.py`)
View all user data across local and AWS storage in organized tables.

### 2. **📈 Real-time Dashboard** (`dashboard.py`)
Monitor your system in real-time with auto-refreshing statistics.

### 3. **📤 Data Exporter** (`export_user_data.py`)
Export user data to JSON, CSV, or summary reports for analysis.

---

## 🚀 **Quick Start Commands**

### View All User Data
```bash
# View everything (local + AWS)
python3 view_user_data.py

# View local data only
python3 view_user_data.py --source local

# View AWS data only
python3 view_user_data.py --source aws

# View specific user
python3 view_user_data.py --user test_user_voice

# Quick statistics
python3 view_user_data.py --stats
```

### Real-time Dashboard
```bash
# Start monitoring dashboard (refreshes every 5 seconds)
python3 dashboard.py
```

### Export Data
```bash
# Export as JSON
python3 export_user_data.py --format json

# Export as CSV (for Excel)
python3 export_user_data.py --format csv

# Generate summary report
python3 export_user_data.py --format summary

# Export everything
python3 export_user_data.py --format all

# Export specific user
python3 export_user_data.py --user test_user_voice
```

---

## 📊 **What Data You Can See**

### **Local Development Data**

#### 1. User Conversation States (`user_states.json`)
```json
{
  "user_id": "test_user_voice",
  "name": "Sarah",
  "birth_date": "1990-05-15",
  "birth_time": "03:30",
  "birth_location": "New York City, USA",
  "profile_complete": true
}
```

**What it shows:**
- Current conversation progress
- Birth information collected so far
- Profile completion status
- What's still missing

#### 2. Astrology Profiles (`astrology_data/user_profiles.json`)
```json
{
  "user_id": "test_user_voice",
  "name": "Sarah",
  "birth_date": "1990-05-15",
  "subscription_type": "free",
  "total_readings": 0,
  "created_at": "2025-09-29T21:33:27"
}
```

**What it shows:**
- Complete user profiles
- Subscription plans
- Reading history
- Account creation dates

### **AWS Production Data**

#### 1. DynamoDB - WebSocket Connections
- Active real-time connections
- User session information
- Connection timestamps

#### 2. S3 - Audio Storage
- Recorded audio files per user
- Total storage used
- File organization by user_id

#### 3. Cognito - User Authentication
- Registered users
- Email addresses
- Account status (active/inactive)
- Registration dates

#### 4. RDS PostgreSQL - Persistent Data
- User profiles
- Conversation history
- Astrology readings
- System preferences

---

## 📈 **Dashboard Features**

The real-time dashboard shows:

```
🌟 ASTROVOICE REAL-TIME DASHBOARD
2025-10-04 13:23:49
================================================================================

📂 LOCAL DEVELOPMENT DATA
--------------------------------------------------------------------------------
  👥 Total Users:              3
  ✅ Complete Profiles:        1
  ⏳ Incomplete Profiles:      2
  📖 Total Readings:           1

  🆕 Recent Users (Last 24h):
     • Sarah (test_user_voice) - 21:33

☁️  AWS PRODUCTION DATA
--------------------------------------------------------------------------------
  🔌 Active WebSocket Connections: 0
  🎵 Audio Files Stored:           0
  💾 Total Audio Storage:          0.00 B

⚙️  SYSTEM STATUS
--------------------------------------------------------------------------------
  Backend Server (Port 8000):  🟢 RUNNING
  AWS Integration:             🟢 CONFIGURED
  Local Storage:               🟢 AVAILABLE
```

---

## 📤 **Export Examples**

### JSON Export
Perfect for backups and data migration:
```bash
python3 export_user_data.py --format json
# Output: exports/user_data_export_20251004_132349.json
```

### CSV Export
Open in Excel or Google Sheets:
```bash
python3 export_user_data.py --format csv
# Output: exports/user_data_export_20251004_132349.csv
```

### Summary Report
Statistics and insights:
```bash
python3 export_user_data.py --format summary
# Output: exports/user_summary_20251004_132349.txt
```

Example summary output:
```
OVERVIEW
--------------------------------------------------------------------------------
Total Users:              5
Complete Profiles:        1 (20.0%)
Incomplete Profiles:      4
Total Readings:           1
Avg Readings per User:    0.20

SUBSCRIPTION BREAKDOWN
--------------------------------------------------------------------------------
Free                     5 (100.0%)

LANGUAGE PREFERENCES
--------------------------------------------------------------------------------
en                       5 (100.0%)

TOP USERS BY READINGS
--------------------------------------------------------------------------------
 1. Test User             1 readings
 2. Sarah                 0 readings
```

---

## 🔧 **AWS Configuration**

### Setup AWS Access

```bash
# Option 1: AWS CLI
aws configure
# Enter your AWS credentials

# Option 2: Environment Variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=ap-south-1

# Option 3: .env File
echo "AWS_REGION=ap-south-1" >> .env
echo "AWS_ACCESS_KEY_ID=your_key" >> .env
echo "AWS_SECRET_ACCESS_KEY=your_secret" >> .env
```

### Verify AWS Connection
```bash
# Test AWS credentials
aws sts get-caller-identity

# View AWS data
python3 view_user_data.py --source aws
```

---

## 💡 **Common Use Cases**

### 1. **Daily User Monitoring**
```bash
# Run dashboard in morning to see overnight activity
python3 dashboard.py
```

### 2. **Debug User Issues**
```bash
# User reports problem - check their data
python3 view_user_data.py --user user_123

# Export their data for detailed analysis
python3 export_user_data.py --user user_123
```

### 3. **Weekly Reports**
```bash
# Generate weekly summary for stakeholders
python3 export_user_data.py --format summary --output weekly_report.txt
```

### 4. **Data Migration**
```bash
# Export all data before system upgrade
python3 export_user_data.py --format all
```

### 5. **Growth Tracking**
```bash
# Check stats regularly
python3 view_user_data.py --stats

# Compare with previous exports
diff exports/user_summary_old.txt exports/user_summary_new.txt
```

---

## 📁 **File Structure**

```
/Users/nikhil/workplace/voice_v1/
├── view_user_data.py              # Main data viewer
├── dashboard.py                   # Real-time dashboard
├── export_user_data.py            # Data export tool
├── user_states.json               # Conversation states
├── astrology_data/
│   └── user_profiles.json         # User profiles
├── exports/                       # Export output directory
│   ├── user_data_export_*.json
│   ├── user_data_export_*.csv
│   └── user_summary_*.txt
└── AWS_DATA_VIEWER_GUIDE.md      # Detailed documentation
```

---

## 🎯 **Data Flow**

```
┌─────────────────────────────────────────────────────────┐
│                   USER INTERACTION                      │
│              (Mobile App / Web Interface)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                         │
│           (main_openai_realtime.py)                     │
└────┬──────────────────────────────────────────────┬─────┘
     │                                               │
     ▼                                               ▼
┌─────────────────────────────┐    ┌────────────────────────────┐
│   LOCAL STORAGE (DEV)       │    │   AWS STORAGE (PROD)       │
├─────────────────────────────┤    ├────────────────────────────┤
│ • user_states.json          │    │ • DynamoDB (connections)   │
│ • user_profiles.json        │    │ • S3 (audio files)         │
│ • backend.log               │    │ • Cognito (auth)           │
└─────────────────────────────┘    │ • RDS (persistent data)    │
                                   └────────────────────────────┘
                                                │
                                                ▼
                                   ┌────────────────────────────┐
                                   │   DATA VIEWING TOOLS       │
                                   ├────────────────────────────┤
                                   │ • view_user_data.py        │
                                   │ • dashboard.py             │
                                   │ • export_user_data.py      │
                                   └────────────────────────────┘
```

---

## 🔒 **Security Best Practices**

1. **Never commit credentials**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   echo "exports/" >> .gitignore
   ```

2. **Use IAM roles** instead of access keys when possible

3. **Rotate credentials** regularly
   ```bash
   aws iam update-access-key --access-key-id KEY_ID --status Inactive
   ```

4. **Restrict export access** in production
   ```bash
   chmod 700 view_user_data.py export_user_data.py
   ```

5. **Encrypt sensitive exports**
   ```bash
   # Encrypt export file
   gpg -c exports/user_data_export.json
   ```

---

## 🐛 **Troubleshooting**

### AWS Connection Issues
```bash
# Test AWS connection
aws sts get-caller-identity

# Check environment variables
env | grep AWS

# Verify credentials file
cat ~/.aws/credentials
```

### No Data Showing
```bash
# Check if files exist
ls -lh user_states.json astrology_data/user_profiles.json

# Verify backend is running
curl http://localhost:8000/health

# Check backend logs
tail -f backend.log
```

### Export Fails
```bash
# Check exports directory
ls -lh exports/

# Create directory if missing
mkdir -p exports

# Check disk space
df -h
```

---

## 📚 **Related Documentation**

| Document | Description |
|----------|-------------|
| `AWS_DATA_VIEWER_GUIDE.md` | Comprehensive viewer guide |
| `DEPLOYMENT_SUMMARY.md` | System deployment status |
| `AWS_ARCHITECTURE_SPEC.md` | AWS infrastructure details |
| `README.md` | Project overview |

---

## 🎉 **Summary**

You now have **complete visibility** into your user data:

✅ **Local Development**
- View conversation states
- Monitor profile completion
- Track reading history

✅ **AWS Production**
- Monitor active connections
- Track audio storage
- View authenticated users

✅ **Data Export**
- JSON for backups
- CSV for analysis
- Summary reports for stakeholders

✅ **Real-time Monitoring**
- Live dashboard
- Auto-refreshing stats
- System health checks

---

## 🚀 **Next Steps**

1. ✅ View your current data: `python3 view_user_data.py`
2. ✅ Start dashboard: `python3 dashboard.py`
3. ✅ Export data: `python3 export_user_data.py --format all`
4. ⏭️ Configure AWS credentials if needed
5. ⏭️ Set up automated daily reports
6. ⏭️ Create backup schedule

---

**Created**: October 4, 2025  
**Status**: ✅ All tools ready and tested  
**Tools**: 3 Python scripts + comprehensive documentation

**🎯 You're all set to monitor your AWS user data!** 🌟

