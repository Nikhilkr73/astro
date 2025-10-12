#!/usr/bin/env python3
"""
OpenAI GPT-4o-mini Realtime Voice Astrology Server
Direct voice-to-voice conversation without text conversion
"""

import asyncio
import json
import base64
import os
import tempfile
import struct
import wave
from datetime import datetime
from typing import Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from pydub import AudioSegment
import io

# Load environment variables
load_dotenv()

# Import our OpenAI handler classes
from openai_realtime_handler import OpenAIRealtimeHandler
from openai_chat_handler import OpenAIChatHandler

app = FastAPI(title="OpenAI Realtime Voice Astrology Server")

# Add CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register mobile API endpoints
try:
    from backend.api.mobile_endpoints import router as mobile_router
    app.include_router(mobile_router)
    print("✅ Mobile API endpoints registered")
except ImportError as e:
    print(f"⚠️  Could not import mobile endpoints: {e}")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Store active connections and per-user handlers
active_connections = {}
user_handlers = {}  # Each user gets their own handler with their own astrologer

# Text chat handlers (for text mode)
chat_handlers: Dict[str, OpenAIChatHandler] = {}

# Pydantic models for request validation
class ChatMessageRequest(BaseModel):
    """Request model for text chat message"""
    user_id: str
    astrologer_id: str
    message: str


def get_or_create_chat_handler(user_id: str, astrologer_id: str) -> OpenAIChatHandler:
    """
    Get existing chat handler or create new one.
    Mirrors voice handler management pattern.
    """
    handler_key = f"{user_id}_{astrologer_id}"
    
    if handler_key not in chat_handlers:
        print(f"📝 Creating new chat handler for {user_id} with {astrologer_id}")
        chat_handlers[handler_key] = OpenAIChatHandler(astrologer_id)
    
    return chat_handlers[handler_key]

def pcm16_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1) -> bytes:
    """Convert raw PCM16 audio to WAV format"""
    try:
        # Create WAV file in memory
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(channels)
            wav_file.setsampwidth(2)  # 16-bit = 2 bytes
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(pcm_data)
        
        wav_buffer.seek(0)
        return wav_buffer.read()
    except Exception as e:
        print(f"❌ Error converting PCM to WAV: {e}")
        return pcm_data

def convert_webm_to_pcm16(webm_data: bytes) -> bytes:
    """Convert WebM audio data to PCM16 format for OpenAI"""
    try:
        print(f"🔄 Converting {len(webm_data)} bytes of WebM to PCM16...")

        # Create audio segment from WebM data
        audio_segment = AudioSegment.from_file(io.BytesIO(webm_data), format="webm")

        # Convert to PCM16: 24kHz, 16-bit, mono
        audio_segment = audio_segment.set_frame_rate(24000)
        audio_segment = audio_segment.set_channels(1)
        audio_segment = audio_segment.set_sample_width(2)  # 16-bit

        # Export as raw PCM data
        pcm_data = audio_segment.raw_data
        print(f"✅ Converted to {len(pcm_data)} bytes of PCM16 audio")
        return pcm_data

    except Exception as e:
        print(f"❌ Error converting WebM to PCM16: {e}")
        raise

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"✅ User {user_id} connected")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"❌ User {user_id} disconnected")

    async def send_audio(self, user_id: str, audio_data: str, text: str = ""):
        if user_id in self.active_connections:
            message = {
                "type": "audio_response",
                "audio": audio_data,
                "text": text,
                "mime_type": "audio/pcm"
            }
            await self.active_connections[user_id].send_text(json.dumps(message))

    async def send_error(self, user_id: str, error_message: str):
        if user_id in self.active_connections:
            message = {
                "type": "error",
                "message": error_message
            }
            await self.active_connections[user_id].send_text(json.dumps(message))

manager = ConnectionManager()

@app.get("/")
async def root():
    """Homepage with links to voice and text interfaces"""
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AstroVoice - AI Astrology Platform</title>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
                padding: 50px;
                text-align: center;
            }
            h1 {
                font-size: 3em;
                margin-bottom: 20px;
                background: linear-gradient(45deg, #FFD700, #FFA500);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .mode-link {
                display: inline-block;
                margin: 20px;
                padding: 30px 50px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                text-decoration: none;
                color: white;
                font-size: 1.5em;
                transition: all 0.3s;
            }
            .mode-link:hover {
                transform: translateY(-5px);
                background: rgba(255, 255, 255, 0.2);
            }
        </style>
    </head>
    <body>
        <h1>🔮 AstroVoice</h1>
        <p style="font-size: 1.2em; color: #a0a0a0;">AI Astrology Consultation Platform</p>
        <div style="margin-top: 50px;">
            <a href="/voice_realtime" class="mode-link">🎤 Voice Mode<br><small style="font-size: 0.6em;">Real-time voice chat</small></a>
            <a href="/text-chat" class="mode-link">💬 Text Mode<br><small style="font-size: 0.6em;">Hinglish text chat</small></a>
        </div>
    </body>
    </html>
    """)

@app.get("/voice_realtime")
async def voice_realtime():
    """OpenAI Realtime voice interface"""
    with open("static/voice_realtime_index.html", "r") as f:
        return HTMLResponse(f.read())

@app.get("/text-chat")
async def text_chat():
    """Text chat interface for testing"""
    with open("static/text_chat_index.html", "r") as f:
        return HTMLResponse(f.read())

@app.websocket("/ws-mobile/{user_id}")
async def mobile_websocket_endpoint(websocket: WebSocket, user_id: str, astrologer_id: str = None):
    """WebSocket endpoint for mobile app - direct Realtime API integration"""
    await websocket.accept()
    print(f"📱 Mobile WebSocket connected: {user_id}")
    
    # Accumulate PCM audio chunks for this connection
    pcm_chunks = []
    
    # Create a dedicated handler for this user
    if user_id not in user_handlers:
        user_handlers[user_id] = OpenAIRealtimeHandler()
        print(f"✨ Created new handler for user {user_id}")
    
    handler = user_handlers[user_id]
    
    try:
        # Connect to OpenAI if not already connected
        if not handler.is_connected:
            await handler.connect_to_openai()
        
        # Set up callback to accumulate PCM audio
        async def forward_audio_to_mobile(audio_delta: str):
            """Accumulate PCM16 audio chunks"""
            try:
                # Decode and accumulate PCM16 audio
                pcm_audio = base64.b64decode(audio_delta)
                pcm_chunks.append(pcm_audio)
                print(f"📦 Accumulated PCM chunk: {len(pcm_audio)} bytes (total chunks: {len(pcm_chunks)})")
            except Exception as e:
                print(f"❌ Error accumulating audio: {e}")
        
        # Set up callback for when audio response completes
        async def send_accumulated_audio():
            """Send accumulated audio when response is complete"""
            try:
                # Combine all PCM chunks and convert to WAV
                if pcm_chunks:
                    combined_pcm = b''.join(pcm_chunks)
                    print(f"🔊 Converting {len(combined_pcm)} bytes of PCM to WAV...")
                    
                    # Convert to WAV format
                    wav_audio = pcm16_to_wav(combined_pcm)
                    
                    # Encode to base64
                    wav_base64 = base64.b64encode(wav_audio).decode('utf-8')
                    
                    # Send complete audio
                    await websocket.send_json({
                        "type": "audio_response",
                        "audio": wav_base64
                    })
                    
                    print(f"✅ Sent WAV audio: {len(wav_base64)} base64 chars")
                    
                    # Clear chunks for next response
                    pcm_chunks.clear()
            except Exception as e:
                print(f"❌ Error sending audio: {e}")
                import traceback
                traceback.print_exc()
        
        # Set up callback for text responses (optional, for display)
        async def forward_text_to_mobile(text: str):
            """Forward text from OpenAI to mobile"""
            try:
                await websocket.send_json({
                    "type": "text_response",
                    "text": text
                })
                print(f"📝 Sent text response: {text[:50]}...")
            except Exception as e:
                print(f"❌ Error forwarding text: {e}")
        
        handler.set_audio_callback(forward_audio_to_mobile)
        handler.audio_done_callback = send_accumulated_audio
        handler.text_callback = forward_text_to_mobile
        
        while True:
            # Receive message from mobile
            message = await websocket.receive_json()
            msg_type = message.get("type")
            
            if msg_type == "config":
                # Mobile sending configuration (astrologer selection)
                astrologer_id = message.get("astrologer_id")
                if astrologer_id:
                    print(f"🎭 Setting astrologer to: {astrologer_id} for user {user_id}")
                    # Set the astrologer (loads persona)
                    handler.set_astrologer(astrologer_id, user_id)
                    # Reconfigure the session with new astrologer
                    if handler.is_connected:
                        await handler._configure_session()
                        # Send greeting from astrologer
                        await handler.send_greeting(user_id)
                    await websocket.send_json({
                        "type": "config_ack",
                        "astrologer_id": astrologer_id,
                        "message": f"Astrologer set to {astrologer_id}"
                    })
            
            elif msg_type == "audio":
                # Mobile sent audio
                audio_base64 = message.get("audio", "")
                audio_bytes = base64.b64decode(audio_base64)
                
                # Convert M4A to PCM16
                try:
                    audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="m4a")
                    audio_segment = audio_segment.set_frame_rate(24000).set_channels(1).set_sample_width(2)
                    pcm_audio = audio_segment.raw_data
                except:
                    pcm_audio = audio_bytes
                
                print(f"📱 Sending {len(pcm_audio)} bytes to Realtime API for user {user_id}")
                await handler.send_audio(pcm_audio, user_id)
            
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                
    except WebSocketDisconnect:
        print(f"📱 Mobile WebSocket disconnected: {user_id}")
        # Cleanup handler
        if user_id in user_handlers:
            await user_handlers[user_id].disconnect()
            del user_handlers[user_id]
            print(f"🧹 Cleaned up handler for user {user_id}")
    except Exception as e:
        print(f"❌ Mobile WebSocket error: {e}")
        await websocket.close()
        # Cleanup handler
        if user_id in user_handlers:
            await user_handlers[user_id].disconnect()
            del user_handlers[user_id]

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for web voice communication"""
    await manager.connect(websocket, user_id)

    # Create a dedicated handler for this user
    if user_id not in user_handlers:
        user_handlers[user_id] = OpenAIRealtimeHandler()
        print(f"✨ Created new handler for web user {user_id}")
    
    handler = user_handlers[user_id]

    # Set up audio callback for OpenAI responses
    async def audio_callback(audio_delta: str):
        """Stream audio from OpenAI to client"""
        await manager.send_audio(user_id, audio_delta)

    handler.set_audio_callback(audio_callback)

    try:
        # Connect to OpenAI if not already connected
        if not handler.is_connected:
            await handler.connect_to_openai()

        while True:
            # Receive message from client
            message = await websocket.receive_text()
            data = json.loads(message)
            print(f"📨 WebSocket message received from {user_id}: {data.get('type', 'unknown')}")

            if data["type"] == "audio":
                # Decode audio and send to OpenAI
                try:
                    print(f"📨 Received audio message from user {user_id}: {data.keys()}")
                    webm_data = base64.b64decode(data["data"])
                    print(f"🎤 Received {len(webm_data)} bytes of WebM audio from user {user_id}")

                    # Convert WebM to PCM16 for OpenAI
                    pcm_data = convert_webm_to_pcm16(webm_data)

                    # Send PCM16 audio to OpenAI realtime API
                    await handler.send_audio(pcm_data, user_id)

                except Exception as e:
                    print(f"❌ Error processing audio: {e}")
                    await manager.send_error(user_id, f"Audio processing error: {str(e)}")

            elif data["type"] == "ping":
                # Keep-alive ping
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        print(f"🔌 User {user_id} disconnected")
        # Cleanup handler
        if user_id in user_handlers:
            await user_handlers[user_id].disconnect()
            del user_handlers[user_id]
    except Exception as e:
        print(f"❌ WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id)
        # Cleanup handler
        if user_id in user_handlers:
            await user_handlers[user_id].disconnect()
            del user_handlers[user_id]

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting OpenAI Realtime Voice Astrology Server...")
    print("✅ Per-user handler architecture ready")
    print("✅ Each user gets their own astrologer persona")

@app.get("/health")
async def health_check():
    """Health check endpoint for mobile app"""
    return {"status": "healthy", "service": "astro-voice-api", "version": "1.0.0"}

@app.post("/api/process-audio")
async def process_audio_rest(request: Request):
    """REST API fallback - redirects to use WebSocket for true realtime"""
    return {
        "success": False,
        "error": "Please use WebSocket connection for voice chat",
        "websocket_url": f"ws://localhost:8000/ws-mobile/{{user_id}}",
        "response_text": "कृपया WebSocket कनेक्शन का उपयोग करें"
    }

@app.post("/api/process-text")
async def process_text(request: Request):
    """REST API endpoint for text messages"""
    try:
        data = await request.json()
        text = data.get("text", "")
        astrologer_id = data.get("astrologer_id", "astro-guru")
        user_id = data.get("user_id", "unknown")
        session_id = data.get("session_id")
        
        print(f"📱 Mobile text request from user {user_id}: {text}")
        
        return {
            "success": True,
            "response_text": f"आपने पूछा: {text}. मैं आपकी कुंडली देख रहा हूं।",
            "astrologer_id": astrologer_id,
            "session_id": session_id or f"session_{user_id}_{datetime.now().timestamp()}",
        }
        
    except Exception as e:
        print(f"❌ Error processing text: {e}")
        return {
            "success": False,
            "error": str(e),
            "response_text": "Sorry, there was an error."
        }

# ==================== TEXT CHAT ENDPOINTS ====================

@app.post("/api/chat/send")
async def send_chat_message(request: ChatMessageRequest):
    """
    Send text message to astrologer and get response.
    Production endpoint with full error handling.
    
    Args:
        request: ChatMessageRequest with user_id, astrologer_id, message
        
    Returns:
        Dict with response, tokens_used, thinking_phase, etc.
    """
    try:
        print(f"💬 Text chat request from {request.user_id} to {request.astrologer_id}")
        
        # Input validation
        if not request.message or len(request.message.strip()) == 0:
            return {
                "success": False,
                "error": "Message cannot be empty",
                "message": ""
            }
        
        if len(request.message) > 1000:
            return {
                "success": False,
                "error": "Message too long (max 1000 characters)",
                "message": ""
            }
        
        # Get or create handler
        handler = get_or_create_chat_handler(request.user_id, request.astrologer_id)
        
        # Send message and get response
        response = await handler.send_message(request.user_id, request.message)
        
        print(f"✅ Text response sent to {request.user_id}")
        return response
        
    except Exception as e:
        print(f"❌ Error in send_chat_message: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "message": "Sorry, I encountered an error. Please try again."
        }

@app.get("/api/chat/history/{user_id}/{astrologer_id}")
async def get_chat_history(
    user_id: str, 
    astrologer_id: str,
    limit: int = 50
):
    """
    Get conversation history for text mode.
    
    Args:
        user_id: User identifier
        astrologer_id: Astrologer identifier
        limit: Maximum messages to return (default 50)
        
    Returns:
        Dict with conversation history
    """
    try:
        print(f"📖 Fetching chat history for {user_id} with {astrologer_id}")
        
        handler = get_or_create_chat_handler(user_id, astrologer_id)
        history = await handler.get_conversation_history(user_id, limit)
        
        return {
            "success": True,
            "history": history,
            "user_id": user_id,
            "astrologer_id": astrologer_id,
            "total_messages": len(history)
        }
        
    except Exception as e:
        print(f"❌ Error in get_chat_history: {e}")
        return {
            "success": False,
            "error": str(e),
            "history": []
        }

@app.delete("/api/chat/history/{user_id}/{astrologer_id}")
async def clear_chat_history(user_id: str, astrologer_id: str):
    """
    Clear conversation history for user and astrologer.
    
    Args:
        user_id: User identifier
        astrologer_id: Astrologer identifier
        
    Returns:
        Dict with success status
    """
    try:
        print(f"🗑️  Clearing chat history for {user_id} with {astrologer_id}")
        
        handler = get_or_create_chat_handler(user_id, astrologer_id)
        success = await handler.clear_conversation_history(user_id)
        
        return {
            "success": success,
            "message": "History cleared successfully" if success else "Failed to clear history"
        }
        
    except Exception as e:
        print(f"❌ Error in clear_chat_history: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/chat/stats/{user_id}/{astrologer_id}")
async def get_chat_stats(user_id: str, astrologer_id: str):
    """
    Get conversation statistics for analytics.
    
    Args:
        user_id: User identifier
        astrologer_id: Astrologer identifier
        
    Returns:
        Dict with conversation stats
    """
    try:
        handler = get_or_create_chat_handler(user_id, astrologer_id)
        stats = handler.get_stats(user_id)
        
        return {
            "success": True,
            **stats
        }
        
    except Exception as e:
        print(f"❌ Error in get_chat_stats: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/health/chat")
async def chat_health_check():
    """Health check endpoint for text chat system"""
    return {
        "status": "healthy",
        "mode": "text_chat",
        "active_handlers": len(chat_handlers),
        "timestamp": datetime.now().isoformat()
    }

# ==================== SHUTDOWN EVENT ====================

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Shutting down server...")
    # Cleanup all user handlers
    for user_id, handler in list(user_handlers.items()):
        await handler.disconnect()
        print(f"🧹 Disconnected handler for user {user_id}")
    user_handlers.clear()

if __name__ == "__main__":
    print("🌟 Starting OpenAI Realtime Voice Astrology Server")

    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    print(f"🎯 Server will run on {host}:{port}")
    print(f"🏠 Homepage: http://localhost:{port}/")
    print(f"🎤 Voice interface: http://localhost:{port}/voice_realtime")
    print(f"💬 Text Chat interface: http://localhost:{port}/text-chat")
    print(f"📱 Mobile API: http://localhost:{port}/api/process-audio")
    print(f"💬 Text Chat API: http://localhost:{port}/api/chat/send")
    print(f"❤️  Health check: http://localhost:{port}/health")
    print(f"❤️  Chat health: http://localhost:{port}/health/chat")
    print(f"🔌 WebSocket: ws://localhost:{port}/ws/{{user_id}}")

    # Start server
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )