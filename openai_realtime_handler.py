"""
OpenAI GPT-4o-mini Realtime Voice Handler for Astrology
Fully upgraded version with persona system, dynamic response flow, and memory.
"""

import os
import json
import asyncio
import base64
import aiohttp
from typing import Optional, Dict, Any, Callable
from dotenv import load_dotenv
from astrology_profile import astrology_profile_manager
from astrologer_manager import get_astrologer_config

load_dotenv()

class OpenAIRealtimeHandler:
    """Handles real-time voice conversation with astrologer personas."""

    def __init__(self, astrologer_id: Optional[str] = None):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise Exception("❌ Missing OPENAI_API_KEY in environment variables")

        print("✅ OpenAI API key loaded successfully")

        # Conversation memory and persona
        self.user_states = {}
        self.conversation_history = {}
        self.user_astrologers = {}

        self.current_astrologer_id = astrologer_id
        self.current_astrologer_config = None
        self.system_instructions = self._default_instructions()
        if astrologer_id:
            self._load_astrologer(astrologer_id)

        # Connection + callbacks
        self.openai_ws = None
        self.session = None
        self.is_connected = False
        self.audio_callback = None
        self.audio_done_callback = None
        self.text_callback = None
        self.current_response_text = ""

        self._load_user_states()

    def _default_instructions(self) -> str:
        return """आप एक अनुभवी और सहानुभूतिपूर्ण वैदिक ज्योतिषाचार्य हैं जो प्राकृतिक आवाज़ में लोगों से बातचीत करते हैं।
प्रत्येक उपयोगकर्ता के साथ सहजता से संबंध बनाते हैं, धीरे-धीरे जन्म जानकारी लेते हैं और कुंडली का विश्लेषण करते हैं।
हमेशा हिंदी में बात करें, गर्मजोशी और आध्यात्मिक दृष्टिकोण के साथ।
"""

    def _load_astrologer(self, astrologer_id: str):
        config = get_astrologer_config(astrologer_id)
        if config:
            self.current_astrologer_config = config
            self.system_instructions = config.get("system_prompt", self._default_instructions())
            print(f"🔮 Loaded astrologer persona: {config['name']} ({config['speciality']})")
        else:
            print(f"⚠️ Astrologer ID '{astrologer_id}' not found, using default instructions.")

    def set_astrologer(self, astrologer_id: str, user_id: Optional[str] = None):
        self._load_astrologer(astrologer_id)
        self.current_astrologer_id = astrologer_id
        if user_id:
            self.user_astrologers[user_id] = astrologer_id
            self._save_user_states()

    def _load_user_states(self):
        try:
            if os.path.exists("user_states.json"):
                with open("user_states.json", "r") as f:
                    self.user_states = json.load(f)
        except Exception as e:
            print(f"⚠️ Failed to load user states: {e}")

    def _save_user_states(self):
        try:
            with open("user_states.json", "w") as f:
                json.dump(self.user_states, f, indent=2)
        except Exception as e:
            print(f"⚠️ Failed to save user states: {e}")

    def _get_user_context(self, user_id: str) -> str:
        parts = []

        # Existing profile or partial info
        if user_id in self.user_states:
            state = self.user_states[user_id]
            parts.append(f"Collected details for user {user_id}:")
            for k, v in state.items():
                if v:
                    parts.append(f"- {k}: {v}")

        profile = astrology_profile_manager.get_profile(user_id)
        if profile:
            parts.append("Complete astrology profile:")
            parts.append(profile.get_context_for_ai())

        # Last conversation turns
        if user_id in self.conversation_history:
            parts.append("\nRecent dialogue summary:")
            for msg in self.conversation_history[user_id][-5:]:
                parts.append(f"{msg['role']}: {msg['text']}")

        return "\n".join(parts) if parts else "New user - no previous info"

    async def connect_to_openai(self):
        if self.is_connected:
            return

        print("🔌 Connecting to OpenAI Realtime API...")
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "OpenAI-Beta": "realtime=v1"
        }

        self.session = aiohttp.ClientSession()
        self.openai_ws = await self.session.ws_connect(
            "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
            headers=headers
        )
        self.is_connected = True
        print("✅ Connected to OpenAI Realtime API")

        await self._configure_session()
        asyncio.create_task(self._listen_to_openai())

    async def _configure_session(self):
        voice = self.current_astrologer_config.get("voice_id", "alloy") if self.current_astrologer_config else "alloy"

        payload = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": self.system_instructions,
                "voice": voice,
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {"model": "whisper-1"},
                "turn_detection": {"type": "server_vad", "threshold": 0.5},
                "temperature": 0.8
            }
        }

        await self.openai_ws.send_str(json.dumps(payload))
        print(f"🧠 Session configured with astrologer persona ({voice} voice)")

    async def _listen_to_openai(self):
        try:
            async for msg in self.openai_ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    data = json.loads(msg.data)
                    await self._handle_message(data)
                elif msg.type == aiohttp.WSMsgType.ERROR:
                    print(f"⚠️ WebSocket error: {self.openai_ws.exception()}")
                    break
        except Exception as e:
            print(f"❌ Listening error: {e}")

    async def _handle_message(self, data: Dict[str, Any]):
        msg_type = data.get("type")

        if msg_type == "response.audio.delta" and self.audio_callback:
            await self.audio_callback(data["delta"])
        elif msg_type == "response.audio.done":
            if self.audio_done_callback:
                await self.audio_done_callback()
        elif msg_type == "response.text.delta":
            delta = data.get("delta", "")
            self.current_response_text += delta
        elif msg_type == "response.text.done":
            full_text = self.current_response_text.strip()
            self.current_response_text = ""
            if self.text_callback:
                await self.text_callback(full_text)
            print(f"🪶 Assistant: {full_text}")
        elif msg_type == "conversation.item.input_audio_transcription.completed":
            print(f"🎙️ User said: {data.get('transcript', '')}")
        elif msg_type == "error":
            print(f"❌ OpenAI Error: {data}")

    async def send_greeting(self, user_id: str):
        """Send astrologer's greeting message"""
        if not self.is_connected:
            print("⚠️ Cannot send greeting: Not connected to OpenAI")
            return
        
        if not self.current_astrologer_config:
            print("⚠️ No astrologer configured, skipping greeting")
            return
        
        try:
            greeting = self.current_astrologer_config.get('greeting', '')
            if greeting:
                # Create a conversation item with the greeting
                greeting_msg = {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "message",
                        "role": "assistant",
                        "content": [{
                            "type": "text",
                            "text": greeting
                        }]
                    }
                }
                await self.openai_ws.send_str(json.dumps(greeting_msg))
                
                # Request OpenAI to generate audio for the greeting
                response_msg = {
                    "type": "response.create",
                    "response": {
                        "modalities": ["audio"],
                    }
                }
                await self.openai_ws.send_str(json.dumps(response_msg))
                
                print(f"👋 Sent greeting from {self.current_astrologer_config['name']}: {greeting[:50]}...")
        except Exception as e:
            print(f"❌ Error sending greeting: {e}")

    async def send_audio(self, audio_data: bytes, user_id: str):
        if not self.is_connected:
            await self.connect_to_openai()

        audio_b64 = base64.b64encode(audio_data).decode()

        # Add user context
        context_msg = {
            "type": "conversation.item.create",
            "item": {"type": "message", "role": "system", "content": [{
                "type": "input_text",
                "text": f"User context:\n{self._get_user_context(user_id)}"
            }]}
        }
        await self.openai_ws.send_str(json.dumps(context_msg))

        # Send user audio
        audio_msg = {
            "type": "conversation.item.create",
            "item": {"type": "message", "role": "user", "content": [{
                "type": "input_audio",
                "audio": audio_b64
            }]}
        }
        await self.openai_ws.send_str(json.dumps(audio_msg))

        # Dynamic astrologer behavior
        status = self.get_user_info_status(user_id)
        astrologer_name = self.current_astrologer_config.get('name', 'Astrologer') if self.current_astrologer_config else 'Astrologer'
        if not status["profile_complete"]:
            instruction = f"{astrologer_name} के रूप में बात करें — उपयोगकर्ता से धीरे-धीरे जन्म विवरण पूछें और गर्मजोशी से संवाद करें।"
        else:
            instruction = f"{astrologer_name} अब उपयोगकर्ता की कुंडली का विश्लेषण कर रहे हैं। गहराई और सहानुभूति के साथ बताएं।"

        response_msg = {
            "type": "response.create",
            "response": {"modalities": ["audio", "text"], "instructions": instruction}
        }
        await self.openai_ws.send_str(json.dumps(response_msg))

    def get_user_info_status(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self.user_states:
            return {"profile_complete": False, "missing_info": ["name", "birth_date", "birth_time", "birth_location"]}
        state = self.user_states[user_id]
        missing = [k for k in ["name", "birth_date", "birth_time", "birth_location"] if not state.get(k)]
        return {"profile_complete": not missing, "missing_info": missing, "collected_info": state}

    async def disconnect(self):
        if self.openai_ws:
            await self.openai_ws.close()
        if self.session:
            await self.session.close()
        self.is_connected = False
        print("🔌 Disconnected from OpenAI Realtime API")

    def set_audio_callback(self, callback: Callable):
        """Set callback function for streaming audio responses"""
        self.audio_callback = callback

# NOTE: No global instance!
# Each user gets their own OpenAIRealtimeHandler instance in main_openai_realtime.py
# This ensures proper persona isolation and scalability