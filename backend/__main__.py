"""
Entry point for running backend as a module: python -m backend
"""

if __name__ == "__main__":
    from backend.main import app, HOST, PORT
    import uvicorn
    
    print("🌟 Starting AstroVoice Backend Server (New Structure)")
    print(f"🎯 Server will run on {HOST}:{PORT}")
    print(f"🏠 Homepage: http://localhost:{PORT}/")
    print(f"🎤 Voice interface: http://localhost:{PORT}/voice_realtime")
    print(f"💬 Text Chat interface: http://localhost:{PORT}/text-chat")
    print(f"❤️  Health check: http://localhost:{PORT}/health")
    
    uvicorn.run(
        "backend.main:app",
        host=HOST,
        port=PORT,
        log_level="info",
        reload=False
    )

