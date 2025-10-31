# AstroVoice - Complete Project Specification & Context

**Last Updated:** January 2025  
**Status:** Production Ready with Complete OTP Authentication System + Google Play Wallet Integration + Astrologer Database Integration + Chat UX Enhancements + Emulator/Physical Device Testing Setup

## 🌟 Project Overview

AstroVoice is a comprehensive voice-based astrology consultation platform that combines:
- **Real-time voice AI** using OpenAI Realtime API
- **Complete OTP authentication** with Message Central SMS integration
- **Google Play Wallet integration** with in-app purchases and billing
- **Astrologer database integration** with real-time filtering
- **Location autocomplete** with Geoapify API integration
- **Mobile app** built with React Native + Expo
- **Backend API** built with FastAPI + PostgreSQL
- **AWS Infrastructure** managed with CDK
- **Comprehensive testing framework** with automated test suites

## 🏗️ Current Architecture (January 2025)

### **Backend Structure**
```
backend/
├── main.py                 # FastAPI server entry point
├── api/
│   ├── mobile_endpoints.py # Mobile app API endpoints (17 endpoints)
│   └── web_endpoints.py    # Web interface endpoints
├── database/
│   ├── manager.py         # Database operations (PostgreSQL)
│   └── schema.sql         # Database schema (11 tables)
├── handlers/
│   ├── openai_realtime_handler.py  # OpenAI Realtime integration
│   └── chat_handler.py    # Text chat processing
├── services/
│   ├── astrologer_manager.py  # Astrologer persona management
│   ├── google_play_billing.py # Google Play billing integration
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
│   ├── screens/         # 19 app screens
│   │   ├── SplashScreen.tsx
│   │   ├── PhoneAuthScreen.tsx
│   │   ├── OnboardingFormScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ChatHistoryScreen.tsx
│   │   ├── WalletScreen.tsx
│   │   ├── VoiceCallScreen.tsx
│   │   ├── ChatSessionScreen.tsx
│   │   ├── AstrologerProfileScreen.tsx
│   │   ├── ChatReviewScreen.tsx
│   │   ├── TransactionStatusScreen.tsx
│   │   ├── WalletHistoryScreen.tsx
│   │   ├── WebViewScreen.tsx
│   │   └── SimpleChatScreen.tsx
│   ├── navigation/      # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   ├── services/        # API services
│   │   ├── apiService.ts
│   │   └── billingService.ts
│   ├── utils/          # Utilities
│   │   ├── storage.ts
│   │   └── astrologerHelpers.ts
│   ├── components/     # Reusable components
│   └── constants/      # App constants and themes
└── package.json         # Dependencies
```

### **Infrastructure**
```
infrastructure/
├── lib/
│   └── astro-voice-stack.ts  # CDK stack definition
├── bin/
│   └── astro-voice.ts        # CDK app entry
├── deploy-mumbai.sh          # Mumbai deployment script
└── package.json              # CDK dependencies
```

## 🔧 Key Technologies

### **Backend Stack**
- **FastAPI** - Modern Python web framework with async/await
- **PostgreSQL** - Primary database (AWS RDS)
- **psycopg2** - PostgreSQL adapter
- **OpenAI Realtime API** - Voice AI integration
- **Message Central API** - SMS OTP service
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **WebSocket** - Real-time bidirectional communication

### **Mobile Stack**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library (Stack + Tab)
- **Expo Audio** - Audio recording/playback
- **AsyncStorage** - Local data persistence
- **DeviceEventEmitter** - Custom event system
- **react-native-iap** - Google Play in-app purchases
- **Google Play Billing** - Android billing integration

### **Infrastructure Stack**
- **AWS CDK** - Infrastructure as Code with TypeScript
- **AWS RDS** - Managed PostgreSQL database
- **AWS Lambda** - Serverless functions
- **AWS Secrets Manager** - Secure credential storage
- **AWS API Gateway** - API management
- **AWS S3** - Static asset storage

## 📊 Database Schema (13 Tables)

### **Core Tables**
```sql
-- Users table with complete profile management
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    display_name VARCHAR(50),
    email VARCHAR(100),
    birth_date DATE,
    birth_time TIME,
    birth_location VARCHAR(255),
    birth_timezone VARCHAR(50),
    birth_latitude DECIMAL(10, 8),
    birth_longitude DECIMAL(11, 8),
    gender VARCHAR(20),
    language_preference VARCHAR(255) DEFAULT 'hi',
    preferred_astrology_system VARCHAR(20) DEFAULT 'vedic',
    subscription_type VARCHAR(20) DEFAULT 'free',
    account_status VARCHAR(20) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- OTP verifications with Message Central integration
CREATE TABLE otp_verifications (
    verification_id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
    message_central_customer_id VARCHAR(50),
    message_central_verification_id VARCHAR(50),
    attempts INTEGER DEFAULT 0,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Astrologers with persona management and database integration
CREATE TABLE astrologers (
    astrologer_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    specialization VARCHAR(100),
    gender VARCHAR(20),
    language_preference VARCHAR(20),
    languages TEXT[], -- Array of languages
    system_prompt TEXT,
    voice_settings JSONB,
    profile_picture_url VARCHAR(500),
    bio TEXT,
    experience_years INTEGER DEFAULT 10,
    rating DECIMAL(3,2) DEFAULT 4.8,
    total_reviews INTEGER DEFAULT 0,
    price_per_minute DECIMAL(5,2) DEFAULT 8.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations and messages
CREATE TABLE conversations (
    conversation_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    astrologer_id VARCHAR(50) REFERENCES astrologers(astrologer_id),
    session_type VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE messages (
    message_id VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50) REFERENCES conversations(conversation_id),
    sender_type VARCHAR(20),
    content TEXT,
    audio_url VARCHAR(500),
    message_type VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Wallet and transaction management with Google Play integration
CREATE TABLE wallets (
    wallet_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    balance DECIMAL(10, 2) DEFAULT 50.00, -- Default ₹50 for new users
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    wallet_id VARCHAR(50) REFERENCES wallets(wallet_id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(20), -- 'recharge', 'deduction', 'bonus'
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50), -- 'google_play', 'manual'
    payment_id VARCHAR(100),
    google_play_order_id VARCHAR(100),
    google_play_purchase_token VARCHAR(500),
    google_play_package_name VARCHAR(100),
    google_play_product_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Google Play recharge products
CREATE TABLE recharge_products (
    product_id VARCHAR(100) PRIMARY KEY,
    platform VARCHAR(20) NOT NULL, -- 'android', 'ios'
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    bonus_percentage DECIMAL(5, 2) DEFAULT 0.00,
    bonus_amount DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- First recharge bonuses tracking
CREATE TABLE first_recharge_bonuses (
    bonus_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(50) REFERENCES transactions(transaction_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional tables for comprehensive functionality
CREATE TABLE user_profiles (
    profile_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    profile_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE readings (
    reading_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    reading_type VARCHAR(50),
    reading_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    session_data JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE session_reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50),
    user_id VARCHAR(255) REFERENCES users(user_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 API Endpoints (22 Total)

### **Authentication Endpoints**
- `POST /api/auth/send-otp` - Send OTP via Message Central SMS
- `POST /api/auth/verify-otp` - Verify OTP and create/link user

### **User Management Endpoints**
- `POST /api/users/register` - Register new user with profile data
- `GET /api/users/{user_id}` - Get user profile with completion status
- `PUT /api/users/{user_id}` - Update user profile dynamically

### **Astrologer Endpoints**
- `GET /api/astrologers` - List all available astrologers with database integration and category filtering
- `GET /api/astrologers/{astrologer_id}` - Get specific astrologer details

### **Wallet Endpoints**
- `GET /api/wallet/{user_id}` - Get wallet balance
- `POST /api/wallet/recharge` - Recharge wallet
- `GET /api/wallet/transactions/{user_id}` - Get transaction history
- `GET /api/wallet/products` - Get available recharge products
- `POST /api/wallet/verify-purchase` - Verify Google Play purchase
- `POST /api/wallet/deduct-session` - Deduct session balance

### **Chat Endpoints**
- `POST /api/chat/start` - Start new chat session
- `POST /api/chat/send` - Send message in chat
- `POST /api/chat/message` - Process chat message
- `POST /api/chat/end` - End chat session

### **Review Endpoints**
- `POST /api/reviews/submit` - Submit session review

### **Admin Endpoints**
- `POST /api/admin/init-database` - Initialize database schema
- `GET /api/admin/check-database` - Check database status

## 🔐 OTP Authentication System

### **Message Central Integration**
- **Two-step authentication**: Token generation → OTP send/verify
- **Customer ID**: `C-F9FB8D3FEFDB406`
- **API Endpoints**: `cpaas.messagecentral.com/verification/v3/`
- **Rate limiting**: Max 3 OTPs per hour per phone number
- **OTP expiry**: 60 seconds
- **Resend timer**: 30 seconds

### **User Flow**
1. **Phone Input** → Send OTP via Message Central
2. **OTP Verification** → Create/link user account
3. **Profile Check** → Navigate based on completion status
4. **Complete Profile** → Access main app
5. **Returning User** → Direct access to main app

### **Profile Completion Logic**
- **Complete**: All required fields filled → Home screen
- **Incomplete**: Missing fields → Onboarding screen
- **Required Fields**: `full_name`, `birth_date`, `birth_time`, `birth_location`, `gender`

## 📱 Mobile App Navigation Flow

### **App Initialization**
1. **Splash Screen** (3 seconds) → Always shown
2. **Check Storage** → User ID, profile completion status
3. **Database Verification** → Verify user exists in database (CRITICAL FIX)
4. **Conditional Navigation**:
   - **No User** → Login screen
   - **User Not Found in Database** → Clear cache → Login screen
   - **Incomplete Profile** → Onboarding screen
   - **Complete Profile** → Main app

### **Screen Structure**
```
AppNavigator (Root Stack)
├── SplashScreen (3s delay)
├── PhoneAuthScreen (OTP login)
├── OnboardingFormScreen (Profile completion)
└── MainTabNavigator (Main app)
    ├── HomeScreen
    ├── ChatHistoryScreen
    ├── WalletScreen
    └── ProfileScreen
        └── OnboardingFormScreen (Edit mode)
```

### **Custom Event System**
- **Logout Event**: `DeviceEventEmitter.emit('user_logout')`
- **AppNavigator Listener**: Automatically resets app state
- **State Management**: Proper cleanup and navigation reset

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

## 🔐 Environment Configuration

### **Required Environment Variables**
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_REALTIME_MODEL=gpt-4o-mini-realtime-preview
OPENAI_CHAT_MODEL=gpt-4o-mini

# Message Central OTP Configuration
MESSAGE_CENTRAL_PASSWORD=kundli@123
MESSAGE_CENTRAL_CUSTOMER_ID=C-F9FB8D3FEFDB406
MESSAGE_CENTRAL_COUNTRY=IN
MESSAGE_CENTRAL_EMAIL=kundli.ai30@gmail.com
MESSAGE_CENTRAL_SENDER_ID=ASTROV

# Google Play Billing Configuration
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}
GOOGLE_PLAY_PACKAGE_NAME=com.astrovoice.app
GOOGLE_PLAY_ENABLED=true
FIRST_RECHARGE_BONUS_AMOUNT=50.00

# Geoapify Location Autocomplete Configuration
GEOAPIFY_API_KEY=5a3a573b36774482b168c56af6be0581

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=astrovoice
DB_USER=nikhil
DB_PASSWORD=your_password

# Test Configuration
TEST_MODE_ENABLED=false
MESSAGE_CENTRAL_ENABLED=true
BYPASS_OTP_COST=false

# Server Configuration
HOST=0.0.0.0
PORT=8000

# AWS Configuration
AWS_REGION=ap-south-1
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

### **Google Play Billing Integration**
**Problem:** Wallet integration with Google Play Store for in-app purchases
**Solution:** Complete Google Play billing integration with purchase verification
```bash
# Test Google Play purchases
cd mobile && npx expo build:android
# Upload AAB to Google Play Console for testing
```

### **Astrologer Database Integration**
**Problem:** Astrologer profiles not coming from database, filtering not working
**Solution:** Database integration with real-time filtering and category mapping
```bash
# Test astrologer API
curl "http://localhost:8000/api/astrologers?category=Love"
```

### **Languages Null Error**
**Problem:** `Cannot read properties of null (reading 'join')` error
**Solution:** Comprehensive null safety with helper functions
```typescript
// Helper functions in utils/astrologerHelpers.ts
export const joinAstrologerLanguages = (languages?: string[] | null): string => {
  return getAstrologerLanguages(languages).join(', ');
};
```

### **OTP Not Received**
**Problem:** Message Central API issues
**Solution:** Check credentials and API status
```bash
python3 test_message_central_auth.py
python3 test_complete_otp_flow.py
```

### **Navigation Issues**
**Problem:** Logout not working, screen not changing
**Solution:** Use custom event system
```typescript
DeviceEventEmitter.emit('user_logout');
```

### **Profile Data Loading**
**Problem:** Profile shows "Loading..." indefinitely
**Solution:** Check API endpoints and user ID in storage
```bash
curl http://localhost:8000/api/users/{user_id}
```

### **CRITICAL: Deleted User Shows Onboarding Screen**
**Problem:** User deleted from database but app shows onboarding instead of login
**Root Cause:** AppNavigator only checked cached data, not database
**Solution:** AppNavigator now verifies user exists in database before showing screens
**Status:** ✅ FIXED (October 19, 2025)

### **CRITICAL: Duplicate User Creation**
**Problem:** OTP creates UUID user, registration creates old format user
**Root Cause:** Registration endpoint ignored provided user_id and generated new one
**Solution:** Mobile app now sends user_id from OTP verification
**Status:** ✅ FIXED (October 19, 2025)

### **CRITICAL: Profile Data Not Saving**
**Problem:** DOB, Time, Place showing as None in database
**Root Cause:** Field name mismatch (mobile sent birth_date, backend expected date_of_birth)
**Solution:** Unified field names across mobile and backend
**Status:** ✅ FIXED (October 19, 2025)

### **CRITICAL: Phone Number Bug**
**Problem:** UUID being sent as phone number instead of actual phone
**Root Cause:** Mobile app retrieved wrong value from storage
**Solution:** Fixed storage retrieval logic and added debug logging
**Status:** ✅ FIXED (October 19, 2025)

### **CRITICAL: Duplicate User Creation Regression**
**Problem:** Duplicate users created when OTP verification creates UUID user but registration creates old format user
**Root Cause:** Mobile app not sending user_id from OTP verification to registration API
**Solution:** Added user_id to UserRegistrationData interface and registration call
**Status:** ✅ FIXED (October 19, 2025)

## 📱 Current Features

### **Authentication System**
- ✅ **OTP-based phone authentication** with Message Central SMS
- ✅ **Two-step verification** (token + OTP)
- ✅ **Rate limiting** and security measures
- ✅ **User linking** for data persistence
- ✅ **Profile completion detection**
- ✅ **Conditional navigation** based on user status

### **Voice Interface**
- ✅ **Real-time voice conversation** using OpenAI Realtime API
- ✅ **Hindi/English language support**
- ✅ **Low latency** (<3 second response time)
- ✅ **Audio processing** (M4A/WebM/WAV → PCM16)
- ✅ **WebSocket streaming** for bidirectional communication

### **AI Astrologer Personas**
- ✅ **Multiple personalities** with unique system prompts
- ✅ **Specialized expertise** (Love, Marriage, Career)
- ✅ **Gender-based voices** (Male/Female options)
- ✅ **Language preferences** (Hindi-first/English-first)
- ✅ **Dynamic selection** based on user queries

### **Mobile App**
- ✅ **React Native + Expo** cross-platform support
- ✅ **Beautiful UI** with Kundli-branded design
- ✅ **Complete navigation** with splash, auth, onboarding, main app
- ✅ **Profile management** with edit functionality
- ✅ **Location autocomplete** with Geoapify API integration
- ✅ **Google Play Wallet system** with in-app purchases and transaction history
- ✅ **Chat history** and session management
- ✅ **Custom event system** for state management
- ✅ **Persistent Chat Session Bar** with accurate timer billing
- ✅ **Astrologer filtering** with real-time database integration
- ✅ **Sticky header UI** with proper layout management
- ✅ **Chat UX Enhancements** (January 2025):
  - Continue Chat widget after session ends
  - Unified chat history across multiple conversations
  - Session ended state with proper UI indicators
  - Wallet balance hidden during active chat
  - Skip/Submit review navigation fixes
- ✅ **Development & Testing Setup** (January 2025):
  - Emulator vs Physical Device configuration
  - APK/AAB build guides
  - Network configuration for local testing

### **Location Autocomplete System**
- ✅ **Geoapify API integration** for location suggestions
- ✅ **Debounced API calls** (300ms delay) to reduce API usage
- ✅ **Professional dropdown UI** with app design system
- ✅ **Auto-fill functionality** with "City, State, Country" format
- ✅ **Error handling** with graceful degradation to manual input
- ✅ **Loading states** and "No results" messaging
- ✅ **Minimum 3 characters** trigger for API calls

### **Backend API**
- ✅ **FastAPI** with async support and comprehensive endpoints
- ✅ **PostgreSQL database** with 13 tables and proper relationships
- ✅ **UUID-based user IDs** for scalability
- ✅ **Comprehensive error handling** and logging
- ✅ **Message Central integration** for SMS OTP
- ✅ **Google Play billing integration** with purchase verification
- ✅ **Astrologer database integration** with real-time filtering
- ✅ **Profile completion logic** with missing fields detection
- ✅ **Duplicate user prevention** with critical logging

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
# Run all tests
python3 tests/run_tests.py

# Test OTP flow
python3 test_complete_otp_flow.py

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
- **OTP Delivery:** < 5 seconds via Message Central

### **Mobile Performance**
- **Voice Latency:** ~500-1000ms (OpenAI Realtime)
- **Audio Quality:** 24kHz PCM16
- **Cross-platform:** iOS and Android support
- **Navigation:** < 100ms screen transitions

## 🔄 Data Flow

### **OTP Authentication Flow**
1. **User enters phone** → Mobile app calls `/api/auth/send-otp`
2. **Backend generates OTP** → Calls Message Central API
3. **SMS sent to user** → User receives OTP
4. **User enters OTP** → Mobile app calls `/api/auth/verify-otp`
5. **Backend verifies OTP** → Creates/links user account
6. **Profile check** → Returns completion status
7. **Navigation** → Based on profile completion

### **User Registration Flow**
1. **OTP verification** → User account created/linked (UUID format)
2. **Profile completion check** → Missing fields identified
3. **Onboarding** → User fills missing profile data
4. **Profile update** → `/api/users/{user_id}` endpoint (uses existing user_id)
5. **Main app access** → Complete profile → Home screen

### **CRITICAL: User ID Management (Fixed October 19, 2025)**
- **OTP Verification** → Creates UUID user (e.g., `4d96566e-14dd-4491-8bd3-460aef4d1842`)
- **Registration** → Uses same UUID from OTP verification (no duplicate creation)
- **Database Schema** → All tables use UUID format for user_id
- **Mobile Storage** → Stores UUID and phone number correctly

### **Voice Conversation Flow**
1. **User speaks** → Mobile app records audio
2. **WebSocket connection** → Real-time bidirectional
3. **Audio processing** → M4A → PCM16 conversion
4. **OpenAI Realtime** → Voice AI processing
5. **Response generation** → PCM16 → WAV conversion
6. **Audio playback** → User hears response

## 🛠️ Development Tools

### **Database Management**
- `view_user_data.py` - Interactive database viewer
- `database_manager.py` - Database operations
- `AWS_DATA_VIEWER_GUIDE.md` - Database documentation

### **Testing Tools**
- `tests/run_tests.py` - Main test runner
- `test_complete_otp_flow.py` - OTP integration testing
- `test_message_central_auth.py` - Message Central testing

### **Build Tools**
- `build.sh` - Automated build script
- `clean.sh` - Cleanup script
- `start_backend.sh` - Backend startup script

## 📈 Future Roadmap

### **Phase 1: Stability** ✅
- ✅ Complete OTP authentication system
- ✅ Comprehensive testing framework
- ✅ Error handling and logging
- ✅ Database optimization
- ✅ Mobile app polish
- ✅ CRITICAL BUG FIXES (October 19, 2025):
  - ✅ Fixed duplicate user creation
  - ✅ Fixed field name mismatch
  - ✅ Fixed deleted user navigation
  - ✅ Fixed phone number bug
  - ✅ Fixed AppNavigator database verification
- ✅ PERSISTENT CHAT SESSION BAR (October 2025):
  - ✅ Session persistence across navigation
  - ✅ Accurate timer billing (only active time charged)
  - ✅ Pause/resume functionality with proper state management
  - ✅ Backend API endpoints for session management (pause, resume, status)
  - ✅ Database schema updates for session tracking
  - ✅ React Context for global session state
  - ✅ Orange theme integration for UI components
  - ✅ Single "Resume" button for clean UX (no close button)
  - ✅ Timer synchronization between context and screen state
  - ✅ Fixed sessionType mismatch ('chat' vs 'text')
  - ✅ Second resume navigation bug fixed
- ✅ GOOGLE PLAY WALLET INTEGRATION (October 25, 2025):
  - ✅ Complete Google Play billing integration
  - ✅ In-app purchase verification and acknowledgment
  - ✅ Recharge products with bonus system
  - ✅ First-time user bonus (₹50)
  - ✅ Per-minute session deductions
  - ✅ Transaction history and filtering
  - ✅ Real-time wallet balance synchronization
- ✅ ASTROLOGER DATABASE INTEGRATION (October 25, 2025):
  - ✅ Database-driven astrologer profiles
  - ✅ Real-time category filtering (Love, Career, Education, etc.)
  - ✅ Server-side filtering with specialization mapping
  - ✅ Enhanced astrologer schema with ratings, reviews, pricing
  - ✅ Null-safe language handling with helper functions
  - ✅ Sticky header UI with proper layout management

### **Phase 2: Features** 🔄
- 🔄 Advanced astrological calculations
- 🔄 Multiple language support
- 🔄 Voice emotion detection
- 🔄 Conversation history
- 🔄 Push notifications

### **Phase 3: Scale** 🔄
- 🔄 Multi-user support
- 🔄 Advanced analytics
- 🔄 Performance optimization
- 🔄 Enterprise features
- 🔄 Payment integration

---

## 🎯 Quick Reference

### **Essential Commands**
```bash
# Start everything
source venv/bin/activate && python3 -m backend.main &
cd mobile && npm start

# Test everything
python3 tests/run_tests.py

# Test OTP flow
python3 test_complete_otp_flow.py

# Check database
python3 view_user_data.py --limit 10

# Clean and rebuild
./clean.sh && ./build.sh
```

### **Key Files**
- `backend/main.py` - Server entry point
- `backend/api/mobile_endpoints.py` - Mobile API (22 endpoints) - **GOOGLE PLAY INTEGRATION ADDED**
- `backend/database/schema.sql` - Database schema (13 tables) - **WALLET TABLES ADDED**
- `backend/services/google_play_billing.py` - Google Play billing service
- `mobile/src/navigation/AppNavigator.tsx` - Navigation logic - **DATABASE VERIFICATION ADDED**
- `mobile/src/screens/PhoneAuthScreen.tsx` - OTP authentication - **DEBUG LOGS ADDED**
- `mobile/src/screens/OnboardingFormScreen.tsx` - Profile completion - **FIELD NAMES FIXED**
- `mobile/src/screens/ProfileScreen.tsx` - Profile management - **LOGOUT FIXED**
- `mobile/src/screens/WalletScreen.tsx` - Google Play wallet integration
- `mobile/src/screens/HomeScreen.tsx` - Astrologer filtering with database integration
- `mobile/src/utils/astrologerHelpers.ts` - Null-safe language handling
- `tests/run_tests.py` - Test runner
- `view_user_data.py` - Database viewer

### **Critical Environment Variables**
- `MESSAGE_CENTRAL_CUSTOMER_ID=C-F9FB8D3FEFDB406`
- `MESSAGE_CENTRAL_PASSWORD=kundli@123`
- `MESSAGE_CENTRAL_EMAIL=kundli.ai30@gmail.com`
- `OPENAI_API_KEY=sk-proj-...`
- `OPENAI_REALTIME_MODEL=gpt-4o-mini-realtime-preview`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}`
- `GOOGLE_PLAY_PACKAGE_NAME=com.astrovoice.app`
- `DB_USER=nikhil`

---

## 🎉 Recent Updates (January 2025)

### **Chat UX Enhancements**
- ✅ **Continue Chat Widget** - Appears after session ends with astrologer info and rate
- ✅ **Unified Chat History** - Shows all messages with astrologer across conversations
- ✅ **Session Ended State** - Proper UI showing "Chat has ended" in green
- ✅ **Wallet Balance Hidden** - Removed during active chat to reduce anxiety
- ✅ **Review Navigation** - Skip button behaves same as Submit
- ✅ **Debug Log Cleanup** - Removed unnecessary console logs

### **Development Infrastructure**
- ✅ **API Configuration** - Easy switching between emulator (`10.0.2.2`) and physical device (Mac IP)
- ✅ **Build Documentation** - Complete guides for APK/AAB builds
- ✅ **Testing Setup** - Clear workflow for emulator vs physical device testing

## 🔥 CRITICAL FIXES SUMMARY

### **Issues Resolved:**
1. **Duplicate User Creation Regression** - Mobile app not sending user_id from OTP verification
2. **Field Name Mismatch** - Mobile sent `birth_date`, backend expected `date_of_birth`
3. **Deleted User Navigation** - App showed onboarding instead of login for deleted users
4. **Phone Number Bug** - UUID sent as phone number instead of actual phone
5. **Database Schema** - Removed duplicate columns and cleaned up structure
6. **Location Input Enhancement** - Added Geoapify autocomplete for better UX

### **Files Modified:**
- `mobile/src/navigation/AppNavigator.tsx` - Added database verification
- `mobile/src/screens/OnboardingFormScreen.tsx` - Fixed field names, user_id sending, added Geoapify autocomplete
- `mobile/src/screens/PhoneAuthScreen.tsx` - Added debug logging
- `mobile/src/services/apiService.ts` - Added user_id to UserRegistrationData interface
- `backend/api/mobile_endpoints.py` - Fixed user_id handling, field mapping, enhanced logging
- `backend/database/schema.sql` - Cleaned up duplicate columns
- `env_example.txt` - Added GEOAPIFY_API_KEY configuration
- `DUPLICATE_USER_PREVENTION.md` - Comprehensive prevention guide

### **Testing Status:**
- ✅ Deleted user flow works correctly
- ✅ User registration saves profile data
- ✅ Phone number correctly stored and retrieved
- ✅ AppNavigator verifies database before showing screens
- ✅ No duplicate users created
- ✅ Field names consistent across mobile and backend
- ✅ Geoapify location autocomplete working
- ✅ Duplicate user prevention safeguards in place

---

*This specification reflects the current production-ready state as of October 19, 2025, with complete OTP authentication system, Geoapify location autocomplete, comprehensive testing framework, full mobile app functionality, duplicate user prevention safeguards, and all critical bugs resolved.*