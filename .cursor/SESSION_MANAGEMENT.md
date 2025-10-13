# 🎯 Cursor AI Session Management - AstroVoice Project

**Last Updated:** October 13, 2025  
**Project:** Voice-based Vedic Astrology Consultation App  
**Repository:** https://github.com/Nikhilkr73/astro

---

## 📋 Session Start Protocol (READ THIS FIRST!)

When starting a new Cursor session, **ALWAYS** follow this sequence:

### 1. Read Primary Context File
```markdown
📄 Read: PROJECT_STATUS.md
- Current state of all systems
- Recently completed work
- In-progress tasks
- Known issues
```

### 2. Check Git Status
```bash
git status              # Check for uncommitted changes
git log --oneline -5    # Review recent commits
```

### 3. Verify Backend Status
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start it:
python3 main_openai_realtime.py
```

### 4. Summarize Before Proceeding
Before making ANY changes, tell the user:
- What's currently working
- What was last worked on
- What needs to be done next
- Any blockers or issues

---

## 🎯 Current Project State (As of Oct 13, 2025)

### ✅ What's Working
1. **Backend Server** - FastAPI + OpenAI Realtime API ✅
2. **Mobile App** - React Native + Expo (18+ screens) ✅
3. **Voice Chat** - Real-time Hindi/English conversations ✅
4. **Text Chat** - GPT-4o-mini chat mode ✅
5. **Astrologer Personas** - 4 unique AI personalities ✅
6. **AWS Infrastructure** - CDK deployed to ap-south-1 ✅
7. **Session Tracking** - Chat & voice conversations tracked ✅
8. **Dependencies** - OpenAI SDK 1.35.13 (updated) ✅

### 🏗️ In Progress
1. **Mobile-Backend Integration** - Connecting all screens to APIs
2. **Database Integration** - Schema ready, needs initialization
3. **End-to-End Testing** - Verify all features after refactoring

### ⏭️ Next Priorities
1. Comprehensive testing after refactoring
2. Database initialization on AWS RDS
3. Connect voice agent to database
4. Deploy mobile app to TestFlight/Play Store

### ❌ Known Issues
- None currently (Oct 13 fixes deployed)

### 🎉 Recently Fixed (Oct 13, 2025)
- ✅ End conversation 422 error (chat mode)
- ✅ AsyncClient proxies error (OpenAI SDK update)
- ✅ Voice mode session tracking
- ✅ Dependencies compatibility (httpx + OpenAI)

---

## 🗂️ Project Structure

### **Backend (Python + FastAPI)**
```
backend/
├── api/
│   └── mobile_endpoints.py      ← REST API for mobile
├── config/
│   └── settings.py               ← Configuration
├── database/
│   ├── manager.py                ← Database ORM
│   └── schema.sql                ← PostgreSQL schema
├── handlers/
│   ├── openai_chat.py            ← Text chat handler
│   └── openai_realtime.py        ← Voice handler
├── services/
│   ├── astrologer_service.py     ← Persona management
│   └── astrology_service.py      ← Birth chart logic
├── utils/
│   ├── audio.py                  ← Audio processing
│   └── logger.py                 ← Logging utilities
└── main.py                       ← FastAPI application

# Legacy files (still work):
main_openai_realtime.py           ← Main entry point
openai_chat_handler.py            ← Chat handler (root)
openai_realtime_handler.py        ← Voice handler (root)
database_manager.py               ← Database manager (root)
```

### **Mobile App (React Native + TypeScript)**
```
mobile/
├── src/
│   ├── components/
│   │   └── ui/                   ← 5 base UI components
│   ├── screens/                  ← 18+ screens
│   │   ├── ChatSessionScreen.tsx
│   │   ├── VoiceCallScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── ...
│   ├── services/
│   │   ├── apiService.ts         ← Backend API client
│   │   └── wsService.ts          ← WebSocket client
│   ├── navigation/
│   │   └── AppNavigator.tsx      ← Navigation setup
│   └── config/
│       ├── api.ts                ← API endpoints
│       └── designTokens.ts       ← Design system
├── App.tsx                       ← Main app entry
└── package.json
```

### **Infrastructure (AWS CDK + TypeScript)**
```
infrastructure/
├── lib/
│   └── astro-voice-stack.ts      ← AWS resources
├── bin/
│   └── astro-voice-aws-infra.ts  ← CDK app
├── deploy-mumbai.sh              ← Deployment script
└── cdk.json
```

### **Documentation**
```
docs/
├── getting-started/
│   └── QUICK_START.md            ← 30-second start guide
├── guides/
│   ├── LOGGING_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── TESTING_GUIDE.md
├── architecture/
│   └── SYSTEM_DESIGN.md
└── mobile/
    └── NAVIGATION_SETUP.md

# Root documentation (quick reference):
README.md                         ← Project overview
PROJECT_STATUS.md                 ← Current state (READ FIRST!)
END_CONVERSATION_FIX.md           ← Recent fix (Oct 13)
OPENAI_PROXIES_FIX.md             ← OpenAI SDK update (Oct 13)
```

### **Data & Scripts**
```
data/
├── astrologer_personas.json      ← AI persona configs
└── user_profiles.json            ← User birth data

scripts/
├── view_user_data.py             ← View all user data
├── dashboard.py                  ← Real-time monitoring
├── export_user_data.py           ← Export to JSON/CSV
└── tail_logs.sh                  ← Monitor logs
```

---

## 🚀 Quick Commands Reference

### Backend Operations
```bash
# Start backend server
python3 main_openai_realtime.py

# Start in background
python3 main_openai_realtime.py > backend.log 2>&1 &

# Check health
curl http://localhost:8000/health

# View logs
tail -f backend.log
./tail_logs.sh

# Kill backend (if port occupied)
lsof -ti:8000 | xargs kill -9
```

### Mobile Development
```bash
# Start mobile app
cd mobile && npm start

# Alternative
cd mobile && ./START_APP.sh

# Install dependencies
cd mobile && npm install

# Clear cache
cd mobile && npm start -- --clear
```

### Data Viewing
```bash
# View all user data
python3 view_user_data.py

# Real-time dashboard
python3 dashboard.py

# Export data
python3 export_user_data.py
```

### Testing
```bash
# Test mobile API
./test_mobile_api.sh

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","astrologer_id":"tina_kulkarni_vedic_marriage","message":"Hi"}'

# Test end conversation
curl -X POST http://localhost:8000/api/chat/end \
  -H "Content-Type: application/json" \
  -d '{"conversation_id":"test_123","duration_seconds":60}'
```

### Git Operations
```bash
# Check status
git status

# View recent commits
git log --oneline -10

# Commit changes
git add .
git commit -m "type(scope): description"
git push origin main

# Branches
git branch                        # List branches
git checkout -b feature/name      # New branch
```

### AWS/Database
```bash
# Get database credentials
./get_aws_db_credentials.sh

# Deploy AWS infrastructure
cd infrastructure && cdk deploy

# Check AWS resources
aws cloudformation describe-stacks --stack-name AstroVoiceStack
```

---

## 📝 Code Style & Conventions

### Python (Backend)
```python
# Type hints required
def process_user_message(user_id: str, message: str) -> Dict[str, Any]:
    """
    Process user message and return AI response.
    
    Args:
        user_id: User identifier
        message: User's text message
        
    Returns:
        Dict with response and metadata
    """
    pass

# Use async for I/O operations
async def call_openai_api(prompt: str) -> str:
    response = await client.chat.completions.create(...)
    return response.choices[0].message.content

# Error handling with logging
try:
    result = await process_message(user_id, message)
except Exception as e:
    print(f"❌ Error processing message: {e}")
    raise
```

### TypeScript (Mobile)
```typescript
// Props interfaces for components
interface ChatScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'ChatSession'>;
}

// Use async/await for API calls
const sendMessage = async (message: string) => {
  try {
    const response = await apiService.sendMessage(conversationId, 'user', message);
    return response;
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    throw error;
  }
};

// Proper state management
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Git Commit Messages
```bash
# Format: type(scope): description

# Types:
feat(chat): add emoji support to messages
fix(api): resolve end conversation 422 error
docs(readme): update installation instructions
refactor(backend): reorganize into modules
test(chat): add unit tests for message handler
chore(deps): update OpenAI SDK to 1.35.13
style(mobile): fix layout spacing issues
perf(api): optimize database queries
```

---

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# .env file (not committed)
OPENAI_API_KEY=sk-...                    # OpenAI API key
OPENAI_CHAT_MODEL=gpt-4o-mini            # Chat model
OPENAI_REALTIME_MODEL=gpt-4o-realtime    # Voice model

# AWS credentials (use AWS CLI or .env)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=ap-south-1
```

### Model Switching
```bash
# Switch chat model
export OPENAI_CHAT_MODEL=gpt-4o          # Premium model
export OPENAI_CHAT_MODEL=gpt-4o-mini     # Cost-effective (default)

# Use script
./switch_chat_model.sh gpt-4o
```

---

## 🎯 Session Workflow

### When Starting a Session
```
1. Read PROJECT_STATUS.md
   ↓
2. Check git status
   ↓
3. Verify backend is running
   ↓
4. Summarize current state to user
   ↓
5. Ask for clarification if needed
   ↓
6. Proceed with task
```

### During Development
```
1. Make changes
   ↓
2. Test locally (curl, mobile app)
   ↓
3. Check logs for errors
   ↓
4. Document as you go
   ↓
5. Update relevant .md files
```

### When Ending a Session
```
1. Update PROJECT_STATUS.md if major changes
   ↓
2. Create/update documentation for new features
   ↓
3. Commit changes with clear messages
   ↓
4. Push to GitHub if ready
   ↓
5. Summarize what was done
```

---

## 💡 Best Practices for This Project

### 1. AWS Resources
- ✅ All AWS resources managed via CDK
- ❌ Never manually create AWS resources
- ✅ Always deploy via: `cd infrastructure && cdk deploy`
- ✅ Resources are in ap-south-1 (Mumbai) region

### 2. Database
- ✅ Use `database_manager.py` for all operations
- ❌ Never write raw SQL in application code
- ✅ Credentials from AWS Secrets Manager only
- ✅ Use JSONB fields for flexible schema

### 3. File Organization
- ✅ Backend files: `backend/` (new) or root (legacy)
- ✅ Mobile app: `mobile/`
- ✅ Infrastructure: `infrastructure/`
- ✅ Keep major docs in root for quick access

### 4. Documentation
- ✅ Update PROJECT_STATUS.md after major changes
- ✅ Create .md files for new features
- ✅ Use markdown code blocks with language tags
- ✅ Include examples in documentation
- ✅ Add "Last Updated" dates to docs

### 5. Git Practices
- ✅ Descriptive commit messages (conventional commits)
- ✅ Update docs in same commit as code changes
- ✅ Check .gitignore before committing sensitive data
- ❌ Never commit: .env, credentials, user_states.json

### 6. Testing
- ✅ Test endpoints with curl before declaring done
- ✅ Check logs after changes: `tail -f backend.log`
- ✅ Use data viewer tools: `python3 view_user_data.py`
- ✅ Mobile testing: Use Expo Go app on physical device

### 7. Security
- ✅ No hardcoded credentials
- ✅ Use environment variables
- ✅ AWS IAM roles for service-to-service auth
- ✅ Validate all user inputs
- ✅ Never log sensitive data (passwords, tokens)

---

## 🔗 Key URLs & Endpoints

### Local Development
- Backend: http://localhost:8000
- Health Check: http://localhost:8000/health
- Voice Interface: http://localhost:8000/voice_realtime
- Text Chat: http://localhost:8000/text-chat
- Mobile API: http://localhost:8000/api/process-audio
- WebSocket: ws://localhost:8000/ws-mobile/{user_id}

### AWS Resources (Production)
- REST API: https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod/
- WebSocket: wss://g3jnrrvfxf.execute-api.ap-south-1.amazonaws.com/prod
- Database: `astrovoicestack-astrovoicedb3082c5c1-vbvgo611m0ck.cziyq8g8eewt.ap-south-1.rds.amazonaws.com`
- S3 Bucket: astro-voice-audio-677502935540-ap-south-1

### External Services
- GitHub Repo: https://github.com/Nikhilkr73/astro
- Render Deploy: (auto-deploys on push to main)

---

## 📚 Documentation Quick Reference

### Must-Read Files (Priority Order)
1. **PROJECT_STATUS.md** - Current state (READ FIRST!)
2. **docs/getting-started/QUICK_START.md** - Fast start guide
3. **README.md** - Project overview
4. **END_CONVERSATION_FIX.md** - Recent API fix
5. **OPENAI_PROXIES_FIX.md** - SDK update details

### Setup Guides
- DATABASE_SETUP_GUIDE.md - Database setup
- AWS_DATA_VIEWER_GUIDE.md - View AWS data
- mobile/EXPO_START_GUIDE.md - Mobile app setup
- EAS_BUILD_SETUP.md - Mobile build config

### Development Guides
- LOGGING_GUIDE.md - Logging best practices
- TESTING_GUIDE.md - How to test features
- USER_DATA_TOOLS_SUMMARY.md - Data tool usage
- DEPLOYMENT_SUMMARY.md - Deployment status

### Feature Documentation
- Astrologer_chat_persona_improvV1.md - Persona system
- RITUAL_SYSTEM_SUMMARY.md - Remedy system
- CHAT_IMPROVEMENTS_SUMMARY.md - Chat enhancements
- MODEL_SWITCHING_SUMMARY.md - Model switching

---

## 🚨 Common Issues & Solutions

### Port 8000 already in use
```bash
lsof -ti:8000 | xargs kill -9
python3 main_openai_realtime.py
```

### Mobile app not connecting
```bash
# Check backend is running
curl localhost:8000/health

# Ensure same network
# Reload Expo app: Shake phone → Reload
```

### OpenAI API errors
```bash
# Check API key is set
echo $OPENAI_API_KEY

# Check model is available
# gpt-4o-mini (default, recommended)
# gpt-4o (premium, better quality)
```

### Database connection timeout
```bash
# Database in private VPC (expected locally)
# Use bastion host or VPN for direct access
# Or use AWS Lambda/API for database operations
```

### Git push rejected
```bash
# Pull latest changes first
git pull origin main --rebase
git push origin main
```

---

## 🎨 Cursor AI Specific Tips

### 1. Attach Context Files
When asking Cursor for help:
```
@PROJECT_STATUS.md what's the current state?
@mobile/src/services/apiService.ts fix the authentication
```

### 2. Reference Documentation
```
Based on @LOGGING_GUIDE.md, add logging to this function
Following @TESTING_GUIDE.md, create tests for this endpoint
```

### 3. Use Chat History
Cursor remembers the conversation within a session:
- Reference previous responses
- Build on earlier explanations
- No need to repeat context

### 4. Multi-file Operations
```
Update both @backend/api/mobile_endpoints.py 
and @mobile/src/services/apiService.ts 
to add the new review endpoint
```

### 5. Clear Instructions
```
❌ Bad: "Fix the chat"
✅ Good: "Fix the end conversation API to accept JSON body 
         instead of query parameters, matching the mobile app's request format"
```

---

## 🎯 Project-Specific Context

### Tech Stack
- **Backend:** Python 3.10+, FastAPI, OpenAI Realtime API
- **Mobile:** React Native, Expo, TypeScript, WebSocket
- **Database:** PostgreSQL on AWS RDS
- **Infrastructure:** AWS CDK, TypeScript
- **Deployment:** Render (backend), TestFlight/Play Store (mobile)

### Key Features
1. Voice-to-voice conversations in Hindi/English
2. Text chat with GPT-4o-mini
3. 4 astrologer personas with unique personalities
4. Birth chart analysis and remedies
5. Session tracking and analytics
6. Wallet system for consultations

### Architecture Decisions
- **Monorepo:** Backend, mobile, infrastructure in one repo
- **Backward Compatible:** New structure (backend/) + legacy files work
- **WebSocket:** For real-time voice communication
- **REST API:** For mobile app text features
- **CDK:** Infrastructure as code for AWS
- **Expo:** For faster mobile development

---

## 🔄 Version Control Strategy

### Branches
- `main` - Production-ready code
- `develop` - Development branch (if needed)
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Frequency
- Commit after completing a logical unit of work
- Push to GitHub when feature is tested and working
- Don't leave uncommitted changes at end of session

### Deployment Flow
```
Local Development
    ↓
Test Locally
    ↓
Commit & Push to GitHub
    ↓
Render Auto-Deploy (Backend)
    ↓
Monitor Logs
    ↓
Test Production
```

---

## ✅ Pre-Task Checklist

Before starting any new feature:
- [ ] Read PROJECT_STATUS.md
- [ ] Check git status (no uncommitted changes blocking)
- [ ] Backend is running and healthy
- [ ] Understand the current architecture
- [ ] Know which files need to be modified
- [ ] Have test plan in mind

---

## ✅ Pre-Commit Checklist

Before committing changes:
- [ ] Code changes tested locally
- [ ] No console.log/print debug statements (or properly logged)
- [ ] Documentation updated (if feature added)
- [ ] PROJECT_STATUS.md updated (if major change)
- [ ] Logs checked for errors
- [ ] Linter/type errors resolved
- [ ] Git commit message is descriptive

---

## 🎯 Summary

**This is a production voice astrology app with:**
- ✅ Working backend (FastAPI + OpenAI)
- ✅ Working mobile app (React Native + Expo)
- ✅ AWS infrastructure (CDK deployed)
- ✅ Professional code structure
- ✅ Comprehensive documentation

**Always start sessions by reading PROJECT_STATUS.md**

**Repository:** https://github.com/Nikhilkr73/astro  
**Last Major Update:** October 13, 2025 (End conversation fix + OpenAI SDK update)

---

**Questions?** Check PROJECT_STATUS.md or ask the AI to read specific documentation files.
