# AstroVoice - Project Specification & Context

**Last Updated:** October 18, 2025  
**Status:** Production Ready with Testing Framework

## 🌟 Project Overview

AstroVoice is a comprehensive voice-based astrology consultation platform that combines:
- **Real-time voice AI** using OpenAI Realtime API
- **Mobile app** built with React Native + Expo
- **Backend API** built with FastAPI + PostgreSQL
- **AWS Infrastructure** managed with CDK
- **Comprehensive testing framework** with automated test suites

## 🏗️ Current Architecture (October 2025)

### **Backend Structure**
```
backend/
├── main.py                 # FastAPI server entry point
├── api/
│   ├── mobile_endpoints.py # Mobile app API endpoints
│   └── web_endpoints.py    # Web interface endpoints
├── database/
│   ├── manager.py         # Database operations (PostgreSQL)
│   └── schema.sql         # Database schema
├── handlers/
│   ├── openai_realtime_handler.py  # OpenAI Realtime integration
│   └── chat_handler.py    # Text chat processing
├── services/
│   ├── astrologer_manager.py  # Astrologer persona management
│   └── user_service.py    # User management
└── utils/
    ├── logger_utils.py    # Logging utilities
    └── audio_utils.py     # Audio processing
```

### **Mobile App Structure**
```
mobile/
├── App.tsx               # Main app component
├── src/
│   ├── screens/         # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── ChatHistoryScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── OnboardingFormScreen.tsx
│   │   └── PhoneAuthScreen.tsx
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation setup
│   └── constants/       # App constants and themes
└── package.json         # Dependencies
```

### **Infrastructure**
```
infrastructure/
├── lib/
│   └── astro-voice-stack.ts  # CDK stack definition
├── bin/
│   └── astro-voice.ts        # CDK app entry
└── package.json              # CDK dependencies
```

## 🔧 Key Technologies

### **Backend Stack**
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database (AWS RDS)
- **psycopg2** - PostgreSQL adapter
- **OpenAI Realtime API** - Voice AI integration
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### **Mobile Stack**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **Expo Audio** - Audio recording/playback

### **Infrastructure Stack**
- **AWS CDK** - Infrastructure as Code
- **AWS RDS** - Managed PostgreSQL database
- **AWS Lambda** - Serverless functions
- **AWS Secrets Manager** - Secure credential storage

## 📊 Database Schema

### **Users Table**
```sql
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    display_name VARCHAR(50),
    email VARCHAR(100),
    birth_date DATE,
    birth_time TIME,
    birth_location VARCHAR(200),
    birth_timezone VARCHAR(50),
    birth_latitude DECIMAL(10, 8),
    birth_longitude DECIMAL(11, 8),
    gender VARCHAR(20),
    language_preference VARCHAR(10) DEFAULT 'hi',
    subscription_type VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

### **Wallets Table**
```sql
CREATE TABLE wallets (
    wallet_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 API Endpoints

### **Mobile API (`/api/`)**
- `POST /api/users/register` - User registration
- `GET /api/users/{user_id}` - Get user profile
- `POST /api/users/{user_id}/wallet` - Create wallet
- `GET /api/users/{user_id}/wallet` - Get wallet balance
- `POST /api/process-audio` - Process voice input
- `POST /api/chat/send` - Send text message

### **Web Interface**
- `GET /` - Homepage
- `GET /voice_realtime` - Voice interface
- `GET /text-chat` - Text chat interface
- `GET /health` - Health check

## 🧪 Testing Framework

### **Test Structure**
```
tests/
├── unit/                    # Unit tests
│   ├── test_database.py    # Database operations
│   ├── test_database_no_db.py  # Tests without DB
│   └── test_uuid_generation.py  # UUID generation
├── integration/             # Integration tests
│   ├── test_user_registration.py
│   └── test_language_preference.py
├── api/                     # API tests
│   └── test_mobile_endpoints.py
├── database/                # Database tests
│   └── test_data_export.py
├── run_tests.py            # Main test runner
└── TESTING_SOP.md         # Testing documentation
```

### **Test Commands**
```bash
# Run all tests
python3 tests/run_tests.py

# Run specific test types
python3 tests/run_tests.py unit
python3 tests/run_tests.py integration

# Run tests without database
python3 tests/unit/test_database_no_db.py
```

## 🔐 Environment Setup

### **Required Environment Variables**
```bash
# .env file
OPENAI_API_KEY=sk-proj-...
AWS_REGION=ap-south-1
DATABASE_URL=postgresql://...
```

### **Virtual Environment**
```bash
# Always use virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python3 -m backend.main
```

## 🚨 Common Issues & Solutions

### **psycopg2 Error**
**Problem:** `psycopg2 not available - database features disabled`
**Solution:** Always run backend in virtual environment
```bash
source venv/bin/activate
python3 -m backend.main
```

### **User Registration Fails**
**Problem:** Database connection issues
**Solution:** Check psycopg2 installation and virtual environment
```bash
source venv/bin/activate
python3 -c "import psycopg2; print('✅ Ready')"
```

### **Language Preference Not Saved**
**Problem:** All users show 'hi' language preference
**Solution:** Fixed in backend - language preference now properly stored

## 📱 Current Features

### **Voice Interface**
- ✅ Real-time voice conversation
- ✅ Hindi/English language support
- ✅ OpenAI Realtime API integration
- ✅ Natural voice responses

### **User Management**
- ✅ User registration with birth data
- ✅ Language preference storage
- ✅ Wallet system
- ✅ Profile management

### **Mobile App**
- ✅ React Native + Expo
- ✅ Voice recording/playback
- ✅ User onboarding
- ✅ Chat history
- ✅ Profile management

### **Backend API**
- ✅ FastAPI with async support
- ✅ PostgreSQL database
- ✅ UUID-based user IDs
- ✅ Comprehensive error handling

## 🎯 Development Workflow

### **Start Development**
```bash
# Terminal 1: Backend
cd /Users/nikhil/workplace/voice_v1
source venv/bin/activate
python3 -m backend.main

# Terminal 2: Mobile
cd mobile
npm start
```

### **Testing**
```bash
# Run tests
python3 tests/run_tests.py

# Check database
python3 view_user_data.py
```

### **Deployment**
```bash
# Deploy infrastructure
cd infrastructure
cdk deploy

# Build mobile app
cd mobile
npx expo build:android
```

## 📊 Performance Metrics

### **Backend Performance**
- **Response Time:** < 200ms for API calls
- **Database:** PostgreSQL with connection pooling
- **Concurrency:** Async FastAPI with uvicorn

### **Mobile Performance**
- **Voice Latency:** ~500-1000ms (OpenAI Realtime)
- **Audio Quality:** 24kHz PCM16
- **Cross-platform:** iOS and Android support

## 🔄 Data Flow

### **User Registration Flow**
1. Mobile app sends registration data
2. Backend validates with Pydantic models
3. Database manager creates user with UUID
4. Wallet created automatically
5. Response sent to mobile app

### **Voice Conversation Flow**
1. User speaks into mobile app
2. Audio sent to backend via API
3. Backend forwards to OpenAI Realtime
4. AI processes voice and responds
5. Voice response sent back to mobile

## 🛠️ Development Tools

### **Database Management**
- `view_user_data.py` - Database viewer and SQL executor
- `database_manager.py` - Database operations
- `AWS_DATA_VIEWER_GUIDE.md` - Database documentation

### **Testing Tools**
- `tests/run_tests.py` - Main test runner
- `tests/enhanced_test_runner.py` - Detailed test runner
- `tests/debug_test.py` - Debug tools

### **Build Tools**
- `build.sh` - Automated build script
- `clean.sh` - Cleanup script
- `start_backend.sh` - Backend startup script

## 📈 Future Roadmap

### **Phase 1: Stability**
- ✅ Comprehensive testing framework
- ✅ Error handling and logging
- ✅ Database optimization
- ✅ Mobile app polish

### **Phase 2: Features**
- 🔄 Advanced astrological calculations
- 🔄 Multiple language support
- 🔄 Voice emotion detection
- 🔄 Conversation history

### **Phase 3: Scale**
- 🔄 Multi-user support
- 🔄 Advanced analytics
- 🔄 Performance optimization
- 🔄 Enterprise features

---

## 🎯 Quick Reference

### **Essential Commands**
```bash
# Start everything
source venv/bin/activate && python3 -m backend.main &
cd mobile && npm start

# Test everything
python3 tests/run_tests.py

# Check database
python3 view_user_data.py --limit 10

# Clean and rebuild
./clean.sh && ./build.sh
```

### **Key Files**
- `backend/main.py` - Server entry point
- `backend/api/mobile_endpoints.py` - Mobile API
- `backend/database/manager.py` - Database operations
- `mobile/App.tsx` - Mobile app entry
- `tests/run_tests.py` - Test runner
- `view_user_data.py` - Database viewer

---

*This specification reflects the current production-ready state as of October 18, 2025, with comprehensive testing framework and virtual environment setup.*