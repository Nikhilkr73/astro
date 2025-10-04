# 🎯 Quick Reference: User Data Tools

## One-Line Commands

### 📊 View Data
```bash
# Everything
python3 view_user_data.py

# Local only
python3 view_user_data.py --source local

# AWS only  
python3 view_user_data.py --source aws

# One user
python3 view_user_data.py --user USER_ID

# Quick stats
python3 view_user_data.py --stats
```

### 📈 Dashboard
```bash
# Start monitoring (press Ctrl+C to stop)
python3 dashboard.py
```

### 📤 Export
```bash
# JSON
python3 export_user_data.py --format json

# CSV
python3 export_user_data.py --format csv

# Summary
python3 export_user_data.py --format summary

# All formats
python3 export_user_data.py --format all

# Single user
python3 export_user_data.py --user USER_ID
```

---

## Current Data Summary

**Local Storage:**
- 3 users in conversation states
- 3 complete astrology profiles
- 1 total reading completed

**AWS Storage:**
- 0 active connections (development mode)
- 0 audio files stored
- 0 authenticated users (Cognito)

---

## Files to Monitor

```bash
# Conversation states
cat user_states.json | jq

# User profiles
cat astrology_data/user_profiles.json | jq

# Backend logs
tail -f backend.log

# Latest export
ls -lt exports/ | head
```

---

## AWS Setup (If Needed)

```bash
# Configure AWS
aws configure

# Test connection
aws sts get-caller-identity

# View AWS data
python3 view_user_data.py --source aws
```

---

## Aliases (Add to ~/.zshrc)

```bash
alias view-users="cd /Users/nikhil/workplace/voice_v1 && python3 view_user_data.py"
alias user-dash="cd /Users/nikhil/workplace/voice_v1 && python3 dashboard.py"
alias export-users="cd /Users/nikhil/workplace/voice_v1 && python3 export_user_data.py"
```

---

**📖 Full Guide:** `USER_DATA_TOOLS_SUMMARY.md`  
**🔧 AWS Details:** `AWS_DATA_VIEWER_GUIDE.md`

