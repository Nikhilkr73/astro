# 📱 Mobile Voice Astrology App - Complete Specification

## 📋 Project Overview

**App Name:** AstroVoice (tentative)
**Platform:** Android-first, extensible to iOS
**Core Technology:** React Native + Expo
**Backend:** FastAPI + OpenAI Realtime API
**Primary Language:** Hindi (multiple accents/voices)

## 🎯 Vision Statement

Create a voice-first mobile astrology platform where users can have natural conversations with multiple AI astrologers, each with distinct personalities and Hindi voices/accents, providing personalized astrological guidance with persistent user context.

## 🏗️ Technical Architecture

### High-Level System Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   FastAPI       │    │   OpenAI        │
│  (React Native) │◄──►│   Backend       │◄──►│  Realtime API   │
│                 │    │                 │    │                 │
│ • Voice UI      │    │ • Multi-astro   │    │ • Voice Models  │
│ • User Context  │    │ • User Management│   │ • Hindi Support │
│ • Offline Cache │    │ • WebSocket Hub │    │ • Streaming     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │
          │                       ▼
          │            ┌─────────────────┐
          │            │   Database      │
          │            │  (PostgreSQL)   │
          │            │                 │
          └───────────►│ • User Profiles │
                       │ • Conversations │
                       │ • Astro Context │
                       └─────────────────┘
```

### Technology Stack

**Frontend (Mobile App):**
- React Native + Expo SDK 50+
- TypeScript for type safety
- React Navigation 6 for routing
- Expo Audio for voice recording/playback
- AsyncStorage for local data
- React Query for API state management
- Styled Components for UI

**Backend:**
- FastAPI 0.104+ (Python 3.11+)
- WebSocket support for real-time voice
- Pydantic for data validation
- SQLAlchemy 2.0 for database ORM
- Alembic for database migrations
- Redis for session management
- JWT for authentication

**Database:**
- PostgreSQL 15+ for production
- SQLite for development/testing
- Redis for caching and sessions

**AI/Voice:**
- OpenAI GPT-4o-mini-realtime-preview
- Multiple voice personalities (alloy, echo, fable, nova, shimmer)
- Custom Hindi prompts for each astrologer
- WebM to PCM16 audio conversion

**Infrastructure:**
- Docker for containerization
- AWS/GCP for cloud deployment
- CloudFront/CDN for audio caching
- GitHub Actions for CI/CD

## 📱 App Features by Phase

### Phase 1: MVP Foundation (Week 1-2)

#### Core Features
1. **User Onboarding**
   - Simple registration (phone/email)
   - Basic profile setup (name, birth details)
   - Tutorial for voice interaction

2. **Single Astrologer Chat**
   - AstroGuru with current OpenAI voice
   - Voice recording/playback
   - Real-time WebSocket connection
   - Basic conversation flow

3. **User Context Management**
   - Store birth information
   - Conversation history
   - Profile completion tracking

#### Technical Implementation
- React Native Expo app setup
- Basic UI with voice controls
- WebSocket client for real-time communication
- Local SQLite database for user data
- Audio recording/playback with proper permissions

#### Success Metrics
- Voice latency < 2 seconds
- 90% successful voice interactions
- App doesn't crash during voice sessions

### Phase 2: Multi-Astrologer System (Week 3-4)

#### Enhanced Features
1. **Astrologer Selection**
   - 5 different astrologer personalities:
     - **AstroGuru** (Wise elder - alloy voice)
     - **Priya Didi** (Caring sister - nova voice)
     - **Pandit Sharma** (Traditional scholar - fable voice)
     - **Maya Ma** (Spiritual mother - echo voice)
     - **Ravi Bhai** (Friendly brother - shimmer voice)

2. **Voice Personality System**
   - Distinct personalities with unique prompts
   - Different Hindi speaking styles
   - Specialized knowledge areas per astrologer

3. **Enhanced Context**
   - Separate conversation history per astrologer
   - Astrologer-specific user insights
   - Preference tracking

#### Database Schema Updates
```sql
-- Astrologers table
CREATE TABLE astrologers (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    voice_model VARCHAR(50),
    personality_prompt TEXT,
    specialization VARCHAR(200),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User-Astrologer contexts
CREATE TABLE user_astrologer_contexts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    astrologer_id UUID REFERENCES astrologers(id),
    conversation_history JSONB,
    birth_info_collected BOOLEAN DEFAULT FALSE,
    last_interaction TIMESTAMP,
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Success Metrics
- Users try 3+ different astrologers
- 70% user retention after 1 week
- Average session duration > 3 minutes

### Phase 3: Enhanced UX (Week 5-6)

#### Premium Features
1. **Beautiful UI/UX**
   - Animated astrologer avatars
   - Voice waveform visualizations
   - Smooth transitions and micro-interactions
   - Dark/light theme support

2. **Engagement Features**
   - Daily horoscope notifications
   - Conversation summaries
   - Favorite astrologer bookmarking
   - Voice message replay

3. **Offline Support**
   - Cached astrologer responses
   - Offline conversation history
   - Progressive sync when online

4. **Analytics & Insights**
   - Session duration tracking
   - Feature usage analytics
   - User engagement metrics

#### Technical Enhancements
- Lottie animations for avatars
- React Native Reanimated for smooth animations
- Background task handling
- Push notification system
- Analytics SDK integration

#### Success Metrics
- Average session duration > 5 minutes
- 50% daily active users
- Push notification open rate > 30%

### Phase 4: Production Ready (Week 7-8)

#### Enterprise Features
1. **Authentication & Security**
   - Phone number verification
   - JWT token management
   - Secure API endpoints
   - Data encryption

2. **Scalability**
   - Load balancing
   - Database optimization
   - CDN for audio files
   - Rate limiting

3. **Monetization**
   - Subscription tiers (Free/Premium)
   - Payment gateway integration
   - Usage tracking and limits
   - Premium astrologer access

4. **Admin Dashboard**
   - User analytics
   - System monitoring
   - Content management
   - Revenue tracking

#### Subscription Tiers
```typescript
interface SubscriptionTier {
  name: 'Free' | 'Premium' | 'VIP';
  price: number;
  features: {
    dailySessionLimit: number;
    astrologersAccess: string[];
    prioritySupport: boolean;
    horoscopeReports: boolean;
    voiceNoteSharing: boolean;
  };
}
```

#### Success Metrics
- Handle 1000+ concurrent users
- 99.9% uptime
- 10% conversion to paid subscriptions
- Payment success rate > 95%

### Phase 5: Advanced Features (Week 9-12)

#### Premium Features
1. **Regional Hindi Accents**
   - Delhi Hindi (Khadi Boli)
   - Mumbai Hindi (Bambaiya)
   - Kolkata Hindi (Bengali-influenced)
   - South Indian Hindi
   - Punjabi-influenced Hindi

2. **Enhanced Astrology Features**
   - Horoscope chart generation
   - Compatibility analysis
   - Detailed life predictions
   - Festival/muhurat notifications

3. **Social Features**
   - Friend referrals
   - Shared horoscope readings
   - Community features
   - Astrologer ratings

4. **AI Enhancements**
   - Voice emotion detection
   - Personalized astrologer matching
   - Predictive conversation topics
   - Custom voice training for VIP users

#### Success Metrics
- Premium features drive 80% of revenue
- Users actively share and refer (viral coefficient > 0.5)
- User satisfaction score > 4.5/5
- Regional accent accuracy > 90%

## 🗂️ Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(100),
    birth_date DATE,
    birth_time TIME,
    birth_location VARCHAR(200),
    subscription_tier VARCHAR(20) DEFAULT 'Free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    astrologer_id UUID REFERENCES astrologers(id),
    session_start TIMESTAMP DEFAULT NOW(),
    session_end TIMESTAMP,
    total_duration INTEGER, -- seconds
    message_count INTEGER DEFAULT 0,
    audio_data JSONB, -- metadata about audio files
    summary TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    sender_type VARCHAR(20), -- 'user' or 'astrologer'
    content TEXT,
    audio_url VARCHAR(500),
    duration INTEGER, -- seconds
    timestamp TIMESTAMP DEFAULT NOW()
);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token_hash VARCHAR(255),
    device_info JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 📦 API Specification

### Authentication Endpoints

```typescript
// POST /api/auth/register
interface RegisterRequest {
  phoneNumber: string;
  name: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
}

interface RegisterResponse {
  success: boolean;
  userId: string;
  token: string;
  user: UserProfile;
}

// POST /api/auth/login
interface LoginRequest {
  phoneNumber: string;
  otp: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: UserProfile;
}
```

### Astrologer Endpoints

```typescript
// GET /api/astrologers
interface AstrologerResponse {
  id: string;
  name: string;
  description: string;
  specialization: string;
  voiceModel: string;
  avatarUrl: string;
  isAvailable: boolean;
  userStats?: {
    totalSessions: number;
    lastInteraction: string;
  };
}

// POST /api/astrologers/{id}/start-session
interface StartSessionRequest {
  userId: string;
}

interface StartSessionResponse {
  sessionId: string;
  websocketUrl: string;
  astrologerContext: any;
}
```

### WebSocket Events

```typescript
// Client to Server
interface VoiceMessage {
  type: 'voice_input';
  sessionId: string;
  audioData: string; // base64 encoded
  audioFormat: 'webm' | 'mp3';
}

interface TextMessage {
  type: 'text_input';
  sessionId: string;
  message: string;
}

// Server to Client
interface VoiceResponse {
  type: 'voice_response';
  sessionId: string;
  audioData: string; // base64 encoded PCM16
  transcript?: string;
  duration: number;
}

interface SessionUpdate {
  type: 'session_update';
  sessionId: string;
  status: 'active' | 'ended' | 'error';
  metadata?: any;
}
```

## 📱 Mobile App Structure

### Project Structure
```
astro-voice-app/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── voice/
│   │   └── astrologer/
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── chat/
│   │   └── profile/
│   ├── services/
│   │   ├── api.ts
│   │   ├── audio.ts
│   │   ├── websocket.ts
│   │   └── storage.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   └── astrologerStore.ts
│   ├── utils/
│   └── types/
├── assets/
├── app.json
└── package.json
```

### Key Components

```typescript
// Voice Chat Component
interface VoiceChatProps {
  astrologerId: string;
  userId: string;
  onSessionEnd: () => void;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({
  astrologerId,
  userId,
  onSessionEnd
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioQueue, setAudioQueue] = useState<AudioChunk[]>([]);

  // WebSocket connection
  // Audio recording/playback
  // Real-time voice streaming
  // Error handling
};

// Astrologer Selection Component
interface AstrologerCardProps {
  astrologer: Astrologer;
  onSelect: (id: string) => void;
  userStats?: UserAstrologerStats;
}

export const AstrologerCard: React.FC<AstrologerCardProps> = ({
  astrologer,
  onSelect,
  userStats
}) => {
  return (
    <TouchableOpacity
      onPress={() => onSelect(astrologer.id)}
      style={styles.card}
    >
      <Avatar source={{ uri: astrologer.avatarUrl }} />
      <Text style={styles.name}>{astrologer.name}</Text>
      <Text style={styles.specialization}>{astrologer.specialization}</Text>
      {userStats && (
        <Text style={styles.stats}>
          {userStats.totalSessions} sessions
        </Text>
      )}
    </TouchableOpacity>
  );
};
```

## 🚀 Deployment Strategy

### Development Environment
```bash
# Backend setup
cd voice_v1/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main_openai_realtime.py

# Mobile app setup
cd astro-voice-app/
npm install
expo start
```

### Production Deployment

#### Backend (AWS/GCP)
```dockerfile
# Dockerfile for FastAPI backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Mobile App
```bash
# Build for Android
expo build:android --type=apk

# Build for iOS (when ready)
expo build:ios --type=archive
```

### Infrastructure as Code
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/astro
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=astro
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 📊 Monitoring & Analytics

### Key Metrics to Track

**Technical Metrics:**
- API response times
- WebSocket connection stability
- Voice processing latency
- Error rates by endpoint
- Database query performance

**Business Metrics:**
- Daily/Monthly Active Users
- Session duration
- Conversion to paid subscriptions
- Astrologer preference distribution
- User retention rates

**User Experience Metrics:**
- Voice interaction success rate
- App crash rates
- Feature adoption rates
- User satisfaction scores
- Support ticket volume

### Analytics Implementation
```typescript
// Analytics service
interface AnalyticsEvent {
  eventName: string;
  userId: string;
  timestamp: Date;
  properties: Record<string, any>;
}

class AnalyticsService {
  track(event: AnalyticsEvent) {
    // Send to analytics provider (Mixpanel, Amplitude)
  }

  trackVoiceSession(sessionData: {
    duration: number;
    astrologerId: string;
    messageCount: number;
    successful: boolean;
  }) {
    this.track({
      eventName: 'voice_session_completed',
      userId: sessionData.userId,
      timestamp: new Date(),
      properties: sessionData
    });
  }
}
```

## 🔐 Security Considerations

### Data Protection
- Encrypt sensitive user data (birth details, conversations)
- Audio data temporary storage with auto-deletion
- GDPR compliance for EU users
- Regular security audits

### API Security
- Rate limiting per user/IP
- JWT token expiration and refresh
- Input validation and sanitization
- CORS configuration for mobile apps

### Voice Data Security
- Audio transmission encryption (WSS)
- Temporary audio file storage
- No long-term voice data retention
- User consent for voice processing

## 💰 Monetization Strategy

### Subscription Tiers

**Free Tier:**
- 2 sessions per day (5 minutes each)
- Access to 2 basic astrologers
- Basic daily horoscope

**Premium Tier ($9.99/month):**
- Unlimited sessions
- Access to all 5 astrologers
- Detailed horoscope reports
- Priority voice processing

**VIP Tier ($19.99/month):**
- All Premium features
- Regional accent selection
- Custom voice training
- Personal astrologer assignment
- Advanced compatibility reports

### Revenue Projections

**Year 1 Targets:**
- 10,000 free users
- 1,000 premium subscribers (10% conversion)
- 100 VIP subscribers (1% conversion)
- Monthly Revenue: ~$12,000
- Annual Revenue: ~$144,000

## 🧪 Testing Strategy

### Unit Testing
- Component testing with Jest/React Native Testing Library
- API endpoint testing with pytest
- WebSocket connection testing
- Audio processing unit tests

### Integration Testing
- End-to-end voice conversation flows
- Payment processing flows
- User authentication flows
- Multi-astrologer context switching

### Performance Testing
- Load testing for concurrent users
- Voice latency stress testing
- Database performance under load
- Mobile app memory usage testing

## 📈 Success Metrics by Phase

### Phase 1 (MVP)
- **Technical:** 95% uptime, <2s voice latency
- **User:** 50 active users, 80% completion rate
- **Business:** Proof of concept validation

### Phase 2 (Multi-Astrologer)
- **Technical:** Support 500 concurrent users
- **User:** 500 active users, 70% week-1 retention
- **Business:** Clear user preferences for different astrologers

### Phase 3 (Enhanced UX)
- **Technical:** <1s app load time, offline mode works
- **User:** 2,000 active users, 50% daily active users
- **Business:** 30% push notification engagement

### Phase 4 (Production)
- **Technical:** 99.9% uptime, handle 5,000 concurrent users
- **User:** 10,000 active users, 10% paid conversion
- **Business:** $10,000 MRR

### Phase 5 (Advanced)
- **Technical:** Regional accents with 90% accuracy
- **User:** 50,000 active users, viral coefficient >0.5
- **Business:** $50,000 MRR, expansion to new markets

## 🔄 Continuous Improvement

### A/B Testing Framework
- Astrologer personality variations
- UI/UX improvements
- Pricing strategy optimization
- Feature rollout testing

### User Feedback Loop
- In-app feedback collection
- App store review monitoring
- User interview program
- Feature request tracking

### Technical Debt Management
- Regular code reviews
- Performance optimization sprints
- Security audit schedule
- Dependency updates

---

## 📱 Building & Installing on Physical Android Device

### Quick Start

1. **Enable Developer Mode** on your Android phone (Settings → About Phone → Tap Build Number 7 times)
2. **Enable USB Debugging** (Settings → Developer Options)
3. **Connect phone** to your Mac via USB cable
4. **Open Android Studio** → Open `mobile/android` folder
5. **Select your device** from the dropdown (top toolbar)
6. **Click Play button** (▶️) or press `Cmd+R`

That's it! The app will build and install automatically.

### Verify Connection

```bash
cd mobile
adb devices
# Should show: ABC123XYZ    device
```

### Build APK File

```bash
# Build debug APK
cd mobile/android
./gradlew assembleDebug

# APK location:
# mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

### View Logs on Physical Device

```bash
# Real-time logs
adb logcat -s ReactNativeJS:* ReactNative:*

# Or in Android Studio Logcat, filter by:
package:com.astrovoice.kundli
```

**Important:** ✅ If the app runs on the Android Studio emulator, it will run on a physical device too!

---

## 📝 Next Steps

1. ✅ Create React Native project structure
2. ✅ Set up development environment
3. ✅ Implement Phase 1 MVP features
4. **Test on physical devices**
5. **Establish CI/CD pipeline**
6. **Deploy to staging environment**

This specification serves as the comprehensive guide for developing the Mobile Voice Astrology App from MVP to production-ready application.

---

**Document Version:** 1.0
**Last Updated:** January 28, 2025
**Owner:** Development Team
**Reviewers:** Product, Engineering, Business