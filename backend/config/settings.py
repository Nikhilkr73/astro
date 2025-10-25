"""
Configuration and Settings for AstroVoice Backend
Centralized configuration management with environment variables
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"
WEB_DIR = BASE_DIR / "web"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_REALTIME_MODEL = os.getenv("OPENAI_REALTIME_MODEL", "gpt-4o-mini-realtime-preview")
OPENAI_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Database Configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "astrovoice")
DB_USER = os.getenv("DB_USER", "nikhil")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

# Data Files
ASTROLOGER_PERSONAS_FILE = DATA_DIR / "astrologer_personas.json"
USER_PROFILES_FILE = DATA_DIR / "user_profiles.json"
USER_STATES_FILE = DATA_DIR / "user_states.json"

# Application Settings
APP_TITLE = "AstroVoice - AI Astrology Platform"
APP_VERSION = "1.0.0"

# CORS Settings
CORS_ORIGINS = ["*"]  # In production, specify exact origins

# Audio Settings
AUDIO_SAMPLE_RATE = 24000
AUDIO_CHANNELS = 1
AUDIO_SAMPLE_WIDTH = 2  # 16-bit

def get_database_config() -> dict:
    """Get database configuration as dictionary"""
    return {
        'host': DB_HOST,
        'port': DB_PORT,
        'database': DB_NAME,
        'user': DB_USER,
        'password': DB_PASSWORD,
    }

def validate_config() -> bool:
    """Validate required configuration"""
    if not OPENAI_API_KEY:
        print("❌ Missing OPENAI_API_KEY in environment variables")
        return False
    
    print("✅ Configuration validated successfully")
    return True

if __name__ == "__main__":
    print(f"📁 Base Directory: {BASE_DIR}")
    print(f"📁 Data Directory: {DATA_DIR}")
    print(f"📁 Logs Directory: {LOGS_DIR}")
    print(f"🤖 Realtime Model: {OPENAI_REALTIME_MODEL}")
    print(f"💬 Chat Model: {OPENAI_CHAT_MODEL}")
    print(f"🗄️  Database: {DB_HOST}:{DB_PORT}/{DB_NAME}")
    print(f"🎯 Server: {HOST}:{PORT}")
    validate_config()

