# 🔮 AstroVoice - AI Astrology Consultation Platform

A production-ready voice-based AI astrology consultation system powered by OpenAI's Realtime API. Features personalized AI astrologers with unique personalities, real-time voice conversations in Hindi/English, and a beautiful mobile app.

**Status:** ✅ Fully Operational | **Last Updated:** October 8, 2025

## ✨ Current Features

### 🎤 **Voice Intelligence**
- ✅ **Real-time Voice-to-Voice** - Direct conversation using OpenAI Realtime API (no text intermediary)
- ✅ **Dual Language Support** - Natural conversations in Hindi and English
- ✅ **Low Latency** - <3 second end-to-end response time
- ✅ **Audio Processing** - Automatic M4A/WebM/WAV format handling and PCM16 conversion
- ✅ **WebSocket Streaming** - Bidirectional real-time audio streaming

### 👥 **AI Astrologer Personas** (NEW!)
- ✅ **4 Unique Personalities** - Tina, Mohit, Priyanka, and Harsh
- ✅ **Specialized Expertise** - Love, Marriage, Career consultations
- ✅ **Gender-Based Voices** - Male and female voice options
- ✅ **Language Preferences** - Hindi-first or English-first speaking styles
- ✅ **Custom System Prompts** - Each astrologer has unique personality and approach
- ✅ **Dynamic Selection** - Switch astrologers based on user query keywords

### 📱 **Mobile Application**
- ✅ **React Native + Expo** - Cross-platform iOS/Android support
- ✅ **Beautiful UI** - Kundli-branded design with brown/golden theme
- ✅ **Astrologer Cards** - Browse and select from 4 AI personalities
- ✅ **Category Filters** - All, Love, Marriage, Career tabs
- ✅ **Voice Recording** - Native audio capture with visual feedback
- ✅ **Real-time Status** - Connection indicators and loading states
- ✅ **Complete Design System** - Consistent theme and components

### 🌐 **Web Interface**
- ✅ **Browser-Based Chat** - Full web application with microphone access
- ✅ **Static Hosting Ready** - HTML/CSS/JS with no build step required
- ✅ **WebSocket Support** - Real-time bidirectional communication

### 🗄️ **Database & Data Management**
- ✅ **PostgreSQL Schema** - 7-table scalable design (users, astrologers, conversations, messages, readings, profiles, sessions)
- ✅ **AWS RDS Deployed** - Production database in ap-south-1 (Mumbai)
- ✅ **JSONB Fields** - Flexible schema for future extensions
- ✅ **Data Tools** - View, export, and monitor user data with built-in utilities

### ☁️ **AWS Infrastructure**
- ✅ **CDK Deployment** - Infrastructure as Code with TypeScript
- ✅ **Full Stack Deployed** - Lambda, API Gateway, RDS, S3, DynamoDB, Cognito
- ✅ **Region:** ap-south-1 (Mumbai)
- ✅ **CloudFormation Stack** - AstroVoiceStack with all resources
- ✅ **Secrets Manager** - Secure credential storage

### 🛠️ **Developer Tools**
- ✅ **User Data Viewer** - Interactive CLI tool to view all user data
- ✅ **Real-time Dashboard** - Live monitoring with dashboard.py
- ✅ **Data Export** - JSON/CSV export capabilities
- ✅ **Comprehensive Logging** - Structured logging with emoji indicators
- ✅ **Health Checks** - API health monitoring endpoints

## 🏗️ Technology Stack

### **Backend**
- **Framework:** FastAPI (Python 3.10+) with async/await
- **AI:** OpenAI Realtime API (GPT-4o-mini + native voice)
- **Communication:** WebSocket (real-time bidirectional)
- **Audio:** pydub for format conversion (M4A/WebM → PCM16)
- **Database:** PostgreSQL (AWS RDS) + psycopg2
- **Cloud:** AWS (Lambda, API Gateway, S3, DynamoDB, Cognito)
- **Deployment:** AWS CDK (TypeScript), Uvicorn ASGI server

### **Frontend/Mobile**
- **Mobile:** React Native + Expo Go
- **Language:** TypeScript
- **UI:** Custom Kundli-branded design system
- **Audio:** Expo AV for recording and playback
- **State:** Context API for global state management

### **Infrastructure**
- **IaC:** AWS CDK with TypeScript
- **Region:** ap-south-1 (Mumbai, India)
- **Version Control:** Git + GitHub
- **Secrets:** AWS Secrets Manager

## 🏗️ System Architecture

### **Voice Flow (Mobile)**
```
📱 User speaks
    ↓ Records M4A audio
    ↓ WebSocket connection
🖥️ FastAPI Backend
    ↓ Converts M4A → PCM16 (24kHz mono)
    ↓ Selects astrologer persona
    ↓ Applies custom system prompt
🤖 OpenAI Realtime API
    ↓ Processes voice with GPT-4o-mini
    ↓ Generates voice response (PCM16)
🖥️ FastAPI Backend
    ↓ Converts PCM16 → WAV
    ↓ Streams via WebSocket
📱 User hears response
```

### **Data Persistence**
```
User Interaction
    ↓
Local JSON (user_states.json, user_profiles.json)
    ↓ [Future]
PostgreSQL (AWS RDS)
    ↓
7 Tables: users, astrologers, conversations, 
          messages, readings, profiles, sessions
```

### **Astrologer Selection**
```
User Query → Keyword Analysis → Astrologer Match
     ↓              ↓                    ↓
"marriage"    "love/pyaar"         Tina (Love)
"shaadi"      "marriage"           Priyanka (Marriage)
"career"      "career/job"         Mohit (Career)
Default                            Harsh (General)
```

## 📁 Project Structure

```
voice_v1/
├── 🔧 Core Backend
│   ├── main_openai_realtime.py       # FastAPI server + WebSocket
│   ├── openai_realtime_handler.py    # OpenAI Realtime connection manager
│   ├── astrologer_manager.py         # Persona system (NEW)
│   ├── astrology_profile.py          # Birth data management
│   ├── database_manager.py           # PostgreSQL ORM
│   └── logger_utils.py               # Structured logging
│
├── 📱 Mobile App
│   └── astro-voice-mobile/
│       ├── src/
│       │   ├── screens/              # 6 screens (Home, VoiceChat, etc.)
│       │   ├── components/           # 5 components (VoiceRecorder, etc.)
│       │   ├── services/             # 5 services (WebSocket, Audio, etc.)
│       │   ├── contexts/             # State management
│       │   └── config/               # Theme & configuration
│       └── assets/                   # Images and icons
│
├── 🗄️ Database
│   ├── database_schema.sql           # 7-table PostgreSQL schema
│   ├── astrologer_personas.json      # 4 AI personality configs
│   └── astrology_data/
│       └── user_profiles.json        # Birth chart data
│
├── 🛠️ Data Tools
│   ├── view_user_data.py             # Interactive data viewer
│   ├── dashboard.py                  # Real-time monitoring
│   └── export_user_data.py           # JSON/CSV export
│
├── ☁️ AWS Infrastructure
│   └── astro-voice-aws-infra/
│       └── lib/
│           └── astro-voice-stack.ts  # Complete CDK stack
│
├── 🌐 Web Interface
│   └── static/
│       ├── voice_realtime_index.html
│       └── voice_realtime_script.js
│
└── 📚 Documentation
    ├── README.md                      # This file
    ├── PROJECT_STATUS.md              # Current status (SSOT)
    ├── QUICK_START.md                 # Quick reference
    ├── DATABASE_SETUP_GUIDE.md        # DB setup
    ├── LOGGING_GUIDE.md               # Logging conventions
    └── [12 more guides...]
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+ (for mobile app)
- OpenAI API key
- Expo CLI (for mobile development)

### 1. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env_example.txt .env

# Add your OpenAI API key to .env
echo "OPENAI_API_KEY=your_key_here" >> .env

# Start backend
python3 main_openai_realtime.py
```

Backend will run on `http://localhost:8000`

### 2. Web Application (Already Working)

```bash
# Open browser
open http://localhost:8000/voice-realtime
```

### 3. Mobile Application

**Important**: Mobile devices can't reach `localhost`. You need to use your computer's local IP address.

```bash
# Get your computer's IP address
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
# Example output: 192.168.0.107

# Update IP in these files:
# - astro-voice-mobile/src/services/websocketService.ts (line 41)
# - astro-voice-mobile/src/services/configService.ts (line 32-33)

# Navigate to mobile app
cd astro-voice-mobile

# Install dependencies
npm install

# Start Expo
npx expo start

# Scan QR code with Expo Go app (must be on same WiFi network)
```

## 🔌 API Endpoints

### REST API
- `GET /health` - Health check
- `GET /voice-realtime` - Web interface
- `POST /api/process-text` - Text message processing (legacy)

### WebSocket Endpoints
- `ws://localhost:8000/ws/{user_id}` - Web voice chat
- `ws://localhost:8000/ws-mobile/{user_id}` - Mobile voice chat (TRUE realtime)

## 📱 Mobile WebSocket Protocol

### Client → Server
```json
{
  "type": "audio",
  "audio": "base64_encoded_m4a_audio"
}
```

### Server → Client
```json
{
  "type": "audio_response",
  "audio": "base64_encoded_pcm16_audio"
}
```

```json
{
  "type": "text_response",
  "text": "Transcribed response text"
}
```

## 🔧 Key Technical Details

### Audio Processing
- **Mobile Recording**: M4A format (iOS/Android native)
- **OpenAI Realtime**: PCM16 24kHz mono required
- **Backend Conversion**: M4A → PCM16 using pydub
- **Streaming**: Base64-encoded audio chunks via WebSocket

### OpenAI Realtime API
- **Model**: gpt-4o-mini-realtime-preview
- **Input**: PCM16 audio chunks
- **Output**: PCM16 audio + text transcription
- **Latency**: ~200-500ms for voice responses

### WebSocket Flow
1. Mobile connects to `/ws-mobile/{user_id}`
2. Backend connects to OpenAI Realtime API
3. Mobile sends M4A audio chunks
4. Backend converts to PCM16
5. Backend forwards to OpenAI
6. OpenAI streams PCM16 response
7. Backend forwards to mobile
8. Mobile plays audio in real-time

## 📚 Documentation

### **Getting Started** (Read First)
- `README.md` - This file - project overview and quick start
- `QUICK_START.md` - 30-second setup guide
- `PROJECT_STATUS.md` - Single source of truth for project state

### **Development Guides**
- `DATABASE_SETUP_GUIDE.md` - Database initialization and schema
- `LOGGING_GUIDE.md` - Logging conventions and debugging
- `ASTROLOGER_PERSONA_GUIDE.md` - How to create/modify AI personas
- `USER_DATA_TOOLS_SUMMARY.md` - Using data viewer and export tools
- `AWS_DATA_VIEWER_GUIDE.md` - Viewing data in AWS

### **Specifications**
- `PROJECT_SPEC.md` - Complete technical specification
- `MOBILE_APP_SPEC.md` - Mobile app architecture
- `AWS_ARCHITECTURE_SPEC.md` - Cloud infrastructure details
- `CDK_DATABASE_INTEGRATION.md` - AWS CDK setup

### **Deployment**
- `DEPLOYMENT_GUIDE.md` - Production deployment steps
- `DEPLOYMENT_SUMMARY.md` - Current deployment status
- `RENDER_DEPLOYMENT_GUIDE.md` - Render.com deployment
- `APK_DISTRIBUTION_GUIDE.md` - Mobile app distribution

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:8000/health
```

### Test Web Interface
1. Navigate to `http://localhost:8000/voice-realtime`
2. Click microphone button
3. Speak in Hindi
4. Listen to voice response

### Test Mobile App
1. Ensure backend is running
2. Start Expo: `npx expo start`
3. Scan QR code with Expo Go
4. Select an astrologer
5. Record voice message
6. Check connection status shows "🔊 Realtime Connected"
7. Receive voice response

## 🎯 Key Capabilities

### **AI Astrologer Personas**
The system features 4 unique AI personalities, each with:
- Custom voice (male/female via OpenAI voice selection)
- Specialized expertise (Love/Marriage/Career/General)
- Unique greeting style and conversation approach
- Language preference (Hindi-first or English-first)
- Keyword-based automatic selection

**Meet the Astrologers:**
1. **Tina** (Female, Hindi) - Love & Relationships specialist
2. **Mohit** (Male, English) - Career & Finance expert
3. **Priyanka** (Female, Hindi) - Marriage & Family counselor
4. **Harsh** (Male, Hindi) - General astrology consultant

### **Database Schema**
7-table scalable PostgreSQL design:
- **users** - User accounts with JSONB metadata
- **astrologers** - AI personality configurations
- **conversations** - Session tracking
- **messages** - Complete message history
- **readings** - Astrology consultation records
- **user_profiles** - Birth chart data (date/time/place)
- **user_sessions** - Authentication and analytics

### **Production Ready**
- ✅ AWS infrastructure fully deployed
- ✅ CloudFormation stack operational
- ✅ Database schema ready for initialization
- ✅ Mobile app compiled and tested
- ✅ Web interface functional
- ✅ Monitoring and logging in place

## 🐛 Troubleshooting

### Mobile App Issues

**WebSocket not connecting:**
```bash
# 1. Get your computer's IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Update IP in mobile app config files (see above)

# 3. Ensure mobile and computer are on SAME WiFi network

# 4. Check backend is accessible from your IP
curl http://YOUR_IP:8000/health
```

**Audio not playing:**
- Backend now converts PCM16 → WAV automatically
- Check if `isConnected` shows green "🔊 Realtime Connected" status
- Verify audio chunks are being received (check console)
- Ensure AudioPlayer component receives WAV format: `data:audio/wav;base64,...`

**"DOMException: The fetching process was aborted" error:**
- This was fixed by converting PCM16 to WAV format
- Ensure you're running the latest backend version
- Check backend logs for "Converting PCM to WAV" messages

**Backend errors:**
```bash
# Check logs
tail -f /Users/nikhil/workplace/voice_v1/backend.log

# Or use helper script
./tail_logs.sh
```

### IP Address Changed
If you reconnect to WiFi or your IP changes:
```bash
# 1. Get new IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Update in:
# - astro-voice-mobile/src/services/websocketService.ts
# - astro-voice-mobile/src/services/configService.ts

# 3. Restart Expo
lsof -ti:8081 | xargs kill -9
cd astro-voice-mobile && npx expo start --clear
```

### Web App Issues
- Check browser console for errors
- Ensure microphone permissions granted
- Verify OpenAI API key is set

## 🔐 Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
LOG_LEVEL=INFO
PORT=8000
```

## 🚀 Roadmap

### **Immediate Next Steps**
- [ ] Initialize AWS RDS database with schema
- [ ] Connect voice agent to PostgreSQL
- [ ] Implement user authentication (AWS Cognito)
- [ ] Add conversation history persistence

### **Near-Term Features**
- [ ] Audio response optimization and caching
- [ ] Waveform visualization during recording
- [ ] Voice activity detection (VAD)
- [ ] Multi-session support per user

### **Future Enhancements**
- [ ] Payment integration (Stripe/Razorpay)
- [ ] Advanced analytics dashboard
- [ ] Push notifications
- [ ] More astrologer personalities
- [ ] Regional language support (Tamil, Telugu, Bengali, etc.)
- [ ] Birth chart generation and visualization

## 📝 License

This project is for educational and prototyping purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

## 📊 Project Stats

- **Backend Code:** ~2,000 lines (Python)
- **Mobile Code:** ~2,400 lines (TypeScript/TSX)
- **Database:** 900+ lines (SQL + Python ORM)
- **Documentation:** 15,000+ lines across 17 guides
- **Total Lines:** 20,000+
- **Git Commits:** 5+ with full history
- **Active Files:** ~60 source files

---

## 📞 Support & Contact

### **Quick Help Commands**
```bash
# View logs
tail -f backend.log

# Check backend health
curl http://localhost:8000/health

# View user data
python3 view_user_data.py

# Monitor real-time
python3 dashboard.py

# Get AWS DB credentials
./get_aws_db_credentials.sh
```

### **Common Issues**
- **Port in use:** `lsof -ti:8000 | xargs kill -9`
- **Mobile not connecting:** Ensure same WiFi network, update IP in config files
- **Database timeout:** Database is in private VPC (use bastion or VPN)

---

## 🎊 Status

**Development:** ✅ Complete  
**Mobile App:** ✅ Functional  
**AWS Infrastructure:** ✅ Deployed  
**Database Schema:** ✅ Designed  
**Documentation:** ✅ Comprehensive  

**Next Milestone:** Database Integration & Production Launch

---

**Last Updated:** October 8, 2025  
**Repository:** https://github.com/Nikhilkr73/astro  
**Maintained by:** AstroVoice Team
