# 🎯 Cursor Session Management Guide

## 📋 Your Current Setup (Excellent!)

You're already following good practices:
- ✅ Comprehensive `.md` documentation files
- ✅ Clear file naming (SETUP_COMPLETE.md, DATABASE_SETUP_GUIDE.md, etc.)
- ✅ Step-by-step guides
- ✅ Status tracking

---

## 🎨 Best Practices for Cursor Sessions

### **1. Session Context Files**

Create a main context file that AI can read at session start:

**`PROJECT_CONTEXT.md`** (I'll create this for you)
- Current project state
- What's working
- What's next
- Key decisions made

### **2. Organize Documentation by Type**

```
docs/
├── setup/              # One-time setup guides
│   ├── QUICK_START.md
│   ├── DATABASE_SETUP_GUIDE.md
│   └── AWS_SETUP_GUIDE.md
│
├── development/        # Dev guides
│   ├── LOGGING_GUIDE.md
│   ├── TESTING_GUIDE.md
│   └── API_REFERENCE.md
│
├── status/            # Current state tracking
│   ├── PROJECT_STATUS.md (main)
│   ├── DEPLOYMENT_STATUS.md
│   └── TODO.md
│
└── decisions/         # Architecture decisions
    ├── DATABASE_CHOICE.md
    ├── API_DESIGN.md
    └── MOBILE_ARCHITECTURE.md
```

### **3. Session Start File**

**`START_HERE.md`** - First thing to read in new session:
```markdown
# Session Start Checklist

## Current State
- Backend: Running ✅
- Database: AWS RDS deployed, schema pending
- Mobile: Working ✅
- Last worked on: Database schema design

## Active Tasks
- [ ] Initialize AWS database schema
- [ ] Integrate database with voice agent
- [ ] Add astrologer customization

## Quick Commands
- Start backend: `python3 main_openai_realtime.py`
- View data: `python3 view_user_data.py`
- Check health: `curl localhost:8000/health`
```

### **4. Use .cursor/prompts.md**

Store common prompts for reuse:
```markdown
# Common Development Prompts

## Code Review
"Review this code for security issues and suggest improvements"

## Documentation
"Create API documentation for this module"

## Debugging
"Analyze this error and suggest fixes: [error]"
```

---

## 🎯 Recommended Structure for Your Project

### **Keep These Top-Level** (Quick Access):
```
voice_v1/
├── README.md                  # Main overview
├── QUICK_START.md            # Get started fast
├── PROJECT_STATUS.md         # Current state
└── .cursor/
    └── session_context.md    # For Cursor AI
```

### **Move These to docs/** (Better Organization):
```
voice_v1/docs/
├── setup/
│   ├── DATABASE_SETUP_GUIDE.md
│   ├── AWS_ARCHITECTURE_SPEC.md
│   └── MOBILE_APP_SPEC.md
│
├── guides/
│   ├── LOGGING_GUIDE.md
│   ├── USER_DATA_TOOLS_SUMMARY.md
│   └── DEPLOYMENT_SUMMARY.md
│
└── status/
    ├── WORKSPACE_CLEANED.md
    ├── GIT_COMMIT_SUMMARY.md
    └── FINAL_STATUS.md
```

---

## 💡 Session Management Tips

### **1. Start Each Session**
```markdown
Read these in order:
1. PROJECT_STATUS.md - What's the current state?
2. TODO.md - What needs to be done?
3. RECENT_CHANGES.md - What changed recently?
```

### **2. End Each Session**
Update these files:
- PROJECT_STATUS.md - New state
- TODO.md - Update tasks
- RECENT_CHANGES.md - Log what you did

### **3. Use Comments in Code**
```python
# Session 2024-10-04: Added database schema integration
# TODO: Add migration scripts
# FIXME: Connection timeout handling needed
```

### **4. Leverage .cursorrules**
Create `.cursorrules` file:
```
When starting a session:
1. Read PROJECT_STATUS.md first
2. Check active branch with git status
3. Summarize current state before proceeding

When writing code:
- Follow existing patterns in the codebase
- Add docstrings to all functions
- Update relevant .md files

When ending:
- Update PROJECT_STATUS.md
- Commit with descriptive messages
```

---

## 🔄 Your Current Documentation (Excellent!)

### **Setup & Getting Started:**
- ✅ QUICK_START.md
- ✅ SETUP_COMPLETE.md
- ✅ README.md

### **Development Guides:**
- ✅ DATABASE_SETUP_GUIDE.md
- ✅ LOGGING_GUIDE.md
- ✅ USER_DATA_TOOLS_SUMMARY.md
- ✅ AWS_DATA_VIEWER_GUIDE.md

### **Status & Summary:**
- ✅ PROJECT_STATUS.md
- ✅ DEPLOYMENT_SUMMARY.md
- ✅ WORKSPACE_CLEANED.md
- ✅ GIT_COMMIT_SUMMARY.md

### **Specifications:**
- ✅ PROJECT_SPEC.md
- ✅ MOBILE_APP_SPEC.md
- ✅ AWS_ARCHITECTURE_SPEC.md

**You're doing great!** Just need better organization.

---

## 🎯 Recommended Next Steps

### **1. Create PROJECT_STATUS.md** (Main Context File)
I'll create this as a single source of truth

### **2. Optional: Reorganize**
```bash
mkdir -p docs/{setup,guides,status,specs}
# Move files accordingly
```

### **3. Add .cursorrules**
For consistent AI behavior across sessions

### **4. Use Git Branches**
```bash
git checkout -b feature/database-integration
# Work on feature
git commit -m "feat: add database integration"
```

---

## 📝 Template: PROJECT_STATUS.md

```markdown
# Project Status - AstroVoice

**Last Updated:** [Date]
**Current Sprint:** Database Integration

## 🎯 Current State

### Working ✅
- Backend server (OpenAI Realtime API)
- Mobile app (React Native)
- Voice recording & playback
- Data visibility tools
- AWS infrastructure deployed

### In Progress 🏗️
- Database schema initialization
- Astrologer customization
- User data persistence

### Blocked/Issues ❌
- None currently

## 🚀 Recent Changes
- Created database schema (database_schema.sql)
- Added database manager (database_manager.py)
- Workspace cleaned (62 files archived)
- All code committed to GitHub

## 📋 Next Steps
1. Initialize AWS RDS schema
2. Integrate database with voice agent
3. Add astrologer personality system
4. Implement user session tracking

## 🔗 Key Files
- Backend: `main_openai_realtime.py`
- Database: `database_manager.py`
- Mobile: `astro-voice-mobile/`
- Docs: `DATABASE_SETUP_GUIDE.md`

## 💡 Important Notes
- All AWS resources managed via CDK
- Database credentials in Secrets Manager
- Mobile app using WebSocket connection
```

---

## 🎨 Best Practice: Session Workflow

```
Session Start:
1. Read PROJECT_STATUS.md
2. Check git status
3. Review TODO list
   ↓
Development:
4. Make changes
5. Test frequently
6. Document as you go
   ↓
Session End:
7. Update PROJECT_STATUS.md
8. Commit changes
9. Update TODO list
```

---

## 🚀 Quick Win: Create These Now

1. **PROJECT_STATUS.md** - Main context file
2. **.cursorrules** - AI behavior rules
3. **TODO.md** - Task tracking
4. **RECENT_CHANGES.md** - Change log

I can create these for you!

---

## 💡 Pro Tips

1. **Attach Context Files**
   - In Cursor, explicitly mention: "Read PROJECT_STATUS.md first"
   - Attach relevant .md files to your prompts

2. **Use Markdown Headers**
   - Makes it easy for AI to parse
   - Quick navigation in Cursor

3. **Keep Status Current**
   - Update after major changes
   - Include "last updated" date

4. **Link Between Files**
   - Use relative links: `[Setup Guide](./DATABASE_SETUP_GUIDE.md)`
   - Creates navigable documentation

5. **Version Your Docs**
   - Commit documentation with code
   - Track changes in git

---

**Your current approach is excellent! Just needs a bit more structure for optimal session management.** 🎯

