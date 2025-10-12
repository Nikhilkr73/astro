# 🔮 AstroVoice Backend

**Python FastAPI backend for voice-based AI astrology consultations**

## 📁 Structure

```
backend/
├── api/              # API endpoints (future organization)
├── config/           # Configuration and settings
│   └── settings.py   # Centralized config management
├── database/         # Database layer
│   ├── manager.py    # Database operations
│   └── schema.sql    # PostgreSQL schema
├── handlers/         # External API handlers
│   ├── openai_chat.py      # Text chat handler
│   └── openai_realtime.py  # Voice realtime handler
├── models/           # Pydantic models (future)
├── services/         # Business logic
│   ├── astrologer_service.py  # Persona management
│   └── astrology_service.py   # Birth chart logic
├── utils/            # Utilities
│   ├── audio.py      # Audio conversion
│   └── logger.py     # Logging utilities
├── main.py           # FastAPI application
└── __main__.py       # Module entry point
```

## 🚀 Quick Start

### Run Backend

```bash
# From project root
./start_backend.sh

# Or using Python module
python3 -m backend

# Or old way (still works)
python3 main_openai_realtime.py
```

### Import in Code

```python
# Configuration
from backend.config.settings import OPENAI_API_KEY, validate_config

# Handlers
from backend.handlers.openai_realtime import OpenAIRealtimeHandler
from backend.handlers.openai_chat import OpenAIChatHandler

# Services
from backend.services.astrologer_service import astrologer_manager, get_astrologer_config
from backend.services.astrology_service import astrology_profile_manager

# Database
from backend.database.manager import DatabaseManager, db

# Utils
from backend.utils.logger import voice_logger
from backend.utils.audio import pcm16_to_wav, convert_audio_to_pcm16
```

## 📦 Key Components

### Configuration (`config/settings.py`)
- Centralized environment variable management
- Database configuration
- File paths (data, logs, etc.)
- OpenAI model settings

### Handlers (`handlers/`)
- **OpenAI Realtime**: Voice-to-voice conversations
- **OpenAI Chat**: Text-based conversations
- Persona system integration
- Conversation memory management

### Services (`services/`)
- **Astrologer Service**: Manage AI personas, load from JSON
- **Astrology Service**: Birth chart data, profile management

### Database (`database/`)
- PostgreSQL operations
- 7-table schema (users, astrologers, conversations, messages, etc.)
- Connection pooling
- Optional dependency (psycopg2)

### Utils (`utils/`)
- **Audio**: Format conversion (M4A/WebM → PCM16 → WAV)
- **Logger**: Structured logging with file output

## 🔌 API Endpoints

### Health Check
- `GET /health` - Server health status

### Voice Endpoints
- `WS /ws/{user_id}` - Web voice chat
- `WS /ws-mobile/{user_id}` - Mobile voice chat

### Text Chat Endpoints
- `POST /api/chat/send` - Send text message
- `GET /api/chat/history/{user_id}/{astrologer_id}` - Get chat history
- `DELETE /api/chat/history/{user_id}/{astrologer_id}` - Clear history
- `GET /api/chat/stats/{user_id}/{astrologer_id}` - Get conversation stats

### Web Interface
- `GET /` - Homepage
- `GET /voice_realtime` - Voice chat interface
- `GET /text-chat` - Text chat interface

## ⚙️ Configuration

Environment variables (`.env`):
```bash
# Required
OPENAI_API_KEY=sk-...

# Models
OPENAI_REALTIME_MODEL=gpt-4o-mini-realtime-preview
OPENAI_CHAT_MODEL=gpt-4o-mini

# Server
HOST=0.0.0.0
PORT=8000

# Database (optional)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=astrovoice
DB_USER=postgres
DB_PASSWORD=...
```

## 🧪 Testing

```bash
# Import tests
PYTHONPATH=. python3 tests/backend/test_imports.py

# Run backend
python3 -m backend
```

## 📝 Dependencies

Core:
- FastAPI
- Uvicorn
- OpenAI Python SDK
- WebSockets
- Pydub (audio processing)
- Python-dotenv

Optional:
- psycopg2-binary (database)
- boto3 (AWS)

## 🔄 Backward Compatibility

Old imports still work:
```python
# These still work during transition
from openai_realtime_handler import OpenAIRealtimeHandler
from astrologer_manager import astrologer_manager
```

## 📚 Documentation

- [Migration Guide](../docs/MIGRATION_GUIDE.md)
- [API Reference](../docs/api/)
- [Database Setup](../docs/guides/DATABASE_SETUP_GUIDE.md)
- [Logging Guide](../docs/guides/LOGGING_GUIDE.md)

## 🐛 Troubleshooting

**Import errors:**
```bash
# Set PYTHONPATH
export PYTHONPATH=/path/to/voice_v1:$PYTHONPATH
```

**Database not working:**
- Install psycopg2: `pip install psycopg2-binary`
- Check DB credentials in `.env`

**Audio conversion errors:**
- Ensure ffmpeg is installed (required by pydub)

---

**Last Updated:** October 11, 2025

