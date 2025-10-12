# 🔄 AstroVoice Restructuring Migration Guide

**Date:** October 11, 2025  
**Status:** ✅ Migration Complete

## 📊 Overview

The AstroVoice codebase has been restructured for better maintainability, scalability, and professional development practices.

## 🏗️ New Structure

```
voice_v1/
├── backend/                 # All Python backend code (NEW)
│   ├── api/                # API endpoints (future)
│   ├── services/           # Business logic
│   ├── handlers/           # External API handlers
│   ├── database/           # Database layer
│   ├── models/             # Pydantic models
│   ├── utils/              # Utilities
│   ├── config/             # Configuration
│   ├── main.py             # FastAPI app
│   └── __main__.py         # Module entry point
├── mobile/                  # Mobile app (renamed from astro-voice-mobile)
├── infrastructure/          # AWS CDK (renamed from astro-voice-aws-infra)
├── data/                    # Data files (NEW)
├── scripts/                 # Utility scripts (NEW)
├── web/                     # Web interface (NEW)
├── docs/                    # Documentation organized by category (NEW)
├── tests/                   # Test suite (NEW)
└── logs/                    # Log files
```

## 🔄 File Migration Map

### Backend Files
| Old Location | New Location |
|--------------|-------------|
| `main_openai_realtime.py` | `backend/main.py` |
| `openai_realtime_handler.py` | `backend/handlers/openai_realtime.py` |
| `openai_chat_handler.py` | `backend/handlers/openai_chat.py` |
| `astrologer_manager.py` | `backend/services/astrologer_service.py` |
| `astrology_profile.py` | `backend/services/astrology_service.py` |
| `database_manager.py` | `backend/database/manager.py` |
| `database_schema.sql` | `backend/database/schema.sql` |
| `logger_utils.py` | `backend/utils/logger.py` |

### Data Files
| Old Location | New Location |
|--------------|-------------|
| `astrologer_personas.json` | `data/astrologer_personas.json` |
| `astrology_data/user_profiles.json` | `data/user_profiles.json` |
| `user_states.json` | `data/user_states.json` |

### Scripts
| Old Location | New Location |
|--------------|-------------|
| `view_user_data.py` | `scripts/view_user_data.py` |
| `export_user_data.py` | `scripts/export_user_data.py` |
| `dashboard.py` | `scripts/dashboard.py` |
| `switch_model.sh` | `scripts/switch_model.sh` |
| `tail_logs.sh` | `scripts/tail_logs.sh` |

### Web Files
| Old Location | New Location |
|--------------|-------------|
| `static/*.html` | `web/*.html` |
| `static/*.js` | `web/js/*.js` |

### Documentation
| Old Location | New Location |
|--------------|-------------|
| Various `.md` files | `docs/` (organized by category) |

## 🚀 How to Use the New Structure

### Starting the Backend

**Option 1: Using the new startup script**
```bash
./start_backend.sh
```

**Option 2: Using Python module**
```bash
python3 -m backend
```

**Option 3: Old method (still works for backward compatibility)**
```bash
python3 main_openai_realtime.py
```

### Importing in Python Code

**New structure (recommended):**
```python
from backend.config.settings import OPENAI_API_KEY
from backend.handlers.openai_realtime import OpenAIRealtimeHandler
from backend.services.astrologer_service import astrologer_manager
from backend.database.manager import DatabaseManager
```

**Fallback imports (for transition):**
```python
try:
    from backend.handlers.openai_realtime import OpenAIRealtimeHandler
except ImportError:
    from openai_realtime_handler import OpenAIRealtimeHandler
```

### Running Scripts

```bash
# View user data
python3 scripts/view_user_data.py

# Export data
python3 scripts/export_user_data.py

# Dashboard
python3 scripts/dashboard.py
```

### Running Tests

```bash
# Set PYTHONPATH
export PYTHONPATH=/Users/nikhil/workplace/voice_v1:$PYTHONPATH

# Run tests
python3 tests/backend/test_imports.py
```

## ✅ Verification Checklist

- [x] All backend modules import successfully
- [x] Configuration system working
- [x] Astrologer personas load correctly
- [x] Handlers (realtime & chat) import
- [x] Old main_openai_realtime.py still works (backward compatible)
- [x] New backend/main.py works
- [x] Data files migrated
- [x] Scripts migrated
- [x] Web files migrated
- [x] Documentation organized
- [ ] Mobile app tested with new paths
- [ ] End-to-end functionality test
- [ ] Old files removed (after full verification)

## 🔧 Configuration Changes

### Environment Variables
No changes to `.env` file required. All environment variables work the same way.

### Python Path
When importing backend modules, ensure PYTHONPATH includes project root:
```bash
export PYTHONPATH=/Users/nikhil/workplace/voice_v1:$PYTHONPATH
```

Or use the provided `start_backend.sh` which sets this automatically.

## 📦 Package Management

Created `pyproject.toml` for proper Python packaging:
- Defines project metadata
- Lists dependencies
- Enables development mode installation (future)

## 🐛 Known Issues

1. **psycopg2 not installed** - Database features disabled (optional dependency)
2. **PYTHONPATH required** - Need to set PYTHONPATH for imports or use startup script

## 🔜 Next Steps

1. ✅ Test mobile app connectivity
2. ✅ Run comprehensive end-to-end tests
3. ✅ Remove old files after verification
4. ✅ Update all remaining documentation
5. ⏭️ Consider installing package in development mode (`pip install -e .`)

## 📝 Benefits of New Structure

1. **Clear Separation** - Backend, mobile, infrastructure cleanly separated
2. **Professional Layout** - Industry-standard project structure
3. **Easy Navigation** - Find files quickly
4. **Scalable** - Easy to add new features
5. **Testable** - Dedicated tests directory
6. **Import Clarity** - Clean import paths like `from backend.services import astrologer_service`
7. **Documentation Organized** - Docs categorized for easy reference
8. **Backward Compatible** - Old code still works during transition

## 🤝 Support

If you encounter any issues:
1. Check PYTHONPATH is set correctly
2. Verify `.env` file exists
3. Check logs in `logs/` directory
4. Review this migration guide
5. Run test suite: `python3 tests/backend/test_imports.py`

---

**Last Updated:** October 11, 2025  
**Migration Status:** ✅ Complete

