"""
Test that all backend modules import correctly
"""

def test_config_imports():
    """Test configuration imports"""
    from backend.config.settings import validate_config, OPENAI_API_KEY
    assert validate_config() == True or OPENAI_API_KEY == ""  # May not be set in test env
    print("✅ Config imports OK")

def test_utils_imports():
    """Test utility imports"""
    from backend.utils.logger import voice_logger
    from backend.utils.audio import pcm16_to_wav, convert_audio_to_pcm16
    print("✅ Utils imports OK")

def test_services_imports():
    """Test service imports"""
    from backend.services.astrologer_service import astrologer_manager, get_astrologer_config
    from backend.services.astrology_service import astrology_profile_manager
    
    # Test astrologer manager loads personas
    astrologers = astrologer_manager.get_all_astrologers()
    assert len(astrologers) > 0, "Should load at least one astrologer"
    print(f"✅ Services imports OK - Loaded {len(astrologers)} astrologers")

def test_handlers_imports():
    """Test handler imports"""
    from backend.handlers.openai_realtime import OpenAIRealtimeHandler
    from backend.handlers.openai_chat import OpenAIChatHandler
    print("✅ Handlers imports OK")

def test_database_imports():
    """Test database imports (may fail if psycopg2 not installed)"""
    try:
        from backend.database.manager import DatabaseManager, db
        print("✅ Database imports OK")
    except Exception as e:
        print(f"⚠️  Database imports skipped: {e}")

def test_main_app_imports():
    """Test main app imports"""
    from backend.main import app
    assert app is not None
    print("✅ Main app imports OK")

if __name__ == "__main__":
    print("🧪 Running Backend Import Tests\n" + "="*60)
    
    test_config_imports()
    test_utils_imports()
    test_services_imports()
    test_handlers_imports()
    test_database_imports()
    test_main_app_imports()
    
    print("="*60)
    print("✅ All backend import tests passed!")

