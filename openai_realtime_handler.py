"""
OpenAI GPT-4o-mini Realtime Voice Handler for Astrology
Direct voice-to-voice conversation without text conversion
"""

import os
import json
import asyncio
import base64
import aiohttp
from typing import Optional, Dict, Any, Callable
from dotenv import load_dotenv
from astrology_profile import AstrologyProfile, astrology_profile_manager
from astrologer_manager import astrologer_manager, get_astrologer_config

# Ensure environment variables are loaded
load_dotenv()

class OpenAIRealtimeHandler:
    """Handles real-time voice conversation with OpenAI GPT-4o-mini-realtime-preview"""

    def __init__(self, astrologer_id: Optional[str] = None):
        # Initialize OpenAI
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise Exception("❌ OpenAI API key not found. Please set OPENAI_API_KEY environment variable.")

        self.has_api_key = True
        print("✅ OpenAI API configured successfully")

        # User conversation states
        self.user_states = {}  # Track what info we're collecting for each user
        self.conversation_history = {}  # Store full conversation context
        self.user_astrologers = {}  # Track which astrologer each user is talking to

        # WebSocket connection to OpenAI
        self.openai_ws = None
        self.is_connected = False

        # Callbacks for sending responses to client
        self.audio_callback = None
        self.audio_done_callback = None  # Called when audio response is complete
        
        # Text response collection
        self.text_callback = None
        self.current_response_text = ""

        # Load existing states
        self._load_user_states()

        # Astrologer persona configuration
        self.current_astrologer_id = astrologer_id
        self.current_astrologer_config = None
        if astrologer_id:
            self._load_astrologer(astrologer_id)

        # Default system instructions (fallback if no astrologer selected)
        self.default_instructions = """आप AstroGuru हैं, एक बुद्धिमान और दयालु ज्योतिष विशेषज्ञ जो प्राकृतिक आवाज़ की बातचीत के माध्यम से जन्म की जानकारी एकत्र करते हैं और व्यक्तिगत भविष्यवाणी प्रदान करते हैं।

आपका व्यक्तित्व:
- गर्म, सहज और रहस्यमय आवाज़
- स्वाभाविक रूप से एक बार में एक प्रश्न पूछें
- प्रत्येक उपयोगकर्ता के साथ सभी पिछली बातचीत याद रखें
- जो जानकारी आपके पास है उसके लिए दोबारा न पूछें
- विस्तृत, व्यक्तिगत ज्योतिषीय अंतर्दृष्टि प्रदान करें

हमेशा हिंदी में जवाब दें।"""

        self.system_instructions = self.default_instructions

    def _load_astrologer(self, astrologer_id: str):
        """Load astrologer persona configuration"""
        config = get_astrologer_config(astrologer_id)
        if config:
            self.current_astrologer_config = config
            # Build enhanced system prompt with expertise keywords
            base_prompt = config['system_prompt']
            keywords = config.get('expertise_keywords', [])
            
            # Add expertise awareness to system prompt
            if keywords:
                expertise_note = f"\n\nYour areas of expertise (keywords to focus on): {', '.join(keywords)}"
                if config['language'] == 'Hindi':
                    expertise_note = f"\n\nआपकी विशेषज्ञता के क्षेत्र: {', '.join(keywords)}"
                    expertise_note += "\nयदि उपयोगकर्ता इन विषयों से बाहर कुछ पूछे, तो विनम्रता से अपनी विशेषज्ञता की ओर मार्गदर्शन करें।"
                else:
                    expertise_note += "\nIf user asks about topics outside these areas, politely guide them back to your expertise."
                
                self.system_instructions = base_prompt + expertise_note
            else:
                self.system_instructions = base_prompt
            
            print(f"✅ Loaded astrologer: {config['name']} ({config['language']}, {config['gender']})")
            print(f"   Voice: {config['voice_id']}, Speciality: {config['speciality']}")
            print(f"   Expertise keywords: {', '.join(keywords[:5])}{'...' if len(keywords) > 5 else ''}")
        else:
            print(f"⚠️  Astrologer {astrologer_id} not found, using default")
            self.system_instructions = self.default_instructions

    def set_astrologer(self, astrologer_id: str, user_id: Optional[str] = None):
        """
        Change astrologer persona (can be user-specific)
        
        Args:
            astrologer_id: ID of astrologer to use
            user_id: Optional user ID to assign this astrologer to
        """
        self._load_astrologer(astrologer_id)
        self.current_astrologer_id = astrologer_id
        
        if user_id:
            self.user_astrologers[user_id] = astrologer_id
            self._save_user_states()
    
    def get_astrologer_for_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the astrologer assigned to a user"""
        astrologer_id = self.user_astrologers.get(user_id, self.current_astrologer_id)
        if astrologer_id:
            return get_astrologer_config(astrologer_id)
        return None
    
    def check_expertise_match(self, query: str) -> bool:
        """
        Check if user's query matches current astrologer's expertise
        Returns True if query contains any expertise keywords
        """
        if not self.current_astrologer_config:
            return True  # No astrologer, accept all
        
        keywords = self.current_astrologer_config.get('expertise_keywords', [])
        query_lower = query.lower()
        
        for keyword in keywords:
            if keyword.lower() in query_lower:
                return True
        
        return False
    
    def get_expertise_hint(self) -> str:
        """Get a hint about astrologer's expertise for out-of-scope queries"""
        if not self.current_astrologer_config:
            return ""
        
        name = self.current_astrologer_config.get('name', 'Astrologer')
        speciality = self.current_astrologer_config.get('speciality', 'astrology')
        language = self.current_astrologer_config.get('language', 'Hindi')
        
        if language == 'Hindi':
            return f"मैं {name} हूं और मेरी विशेषज्ञता {speciality} में है। कृपया इससे संबंधित प्रश्न पूछें।"
        else:
            return f"I'm {name} and my expertise is in {speciality}. Please ask questions related to this area."

    def _load_user_states(self):
        """Load user states from storage"""
        try:
            if os.path.exists("user_states.json"):
                with open("user_states.json", "r") as f:
                    self.user_states = json.load(f)
        except Exception as e:
            print(f"Error loading user states: {e}")
            self.user_states = {}

    def _save_user_states(self):
        """Save user states to storage"""
        try:
            with open("user_states.json", "w") as f:
                json.dump(self.user_states, f, indent=2)
        except Exception as e:
            print(f"Error saving user states: {e}")

    def _get_user_context(self, user_id: str) -> str:
        """Build context from user's conversation history and profile"""
        context_parts = []

        # Add user's current state
        if user_id in self.user_states:
            state = self.user_states[user_id]
            context_parts.append(f"User {user_id} information collected so far:")
            for key, value in state.items():
                if value and key != "profile_complete":
                    context_parts.append(f"- {key}: {value}")

        # Check if we have a complete astrology profile
        profile = astrology_profile_manager.get_profile(user_id)
        if profile:
            context_parts.append(f"Complete astrology profile available:")
            context_parts.append(profile.get_context_for_ai())

        return "\\n".join(context_parts) if context_parts else "New user - no previous information"

    async def connect_to_openai(self):
        """Connect to OpenAI Realtime API"""
        try:
            print("🔌 Connecting to OpenAI Realtime API...")

            # Use standard HTTP approach for OpenAI realtime API

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "OpenAI-Beta": "realtime=v1"
            }

            # Connect using aiohttp WebSocket for better compatibility
            session = aiohttp.ClientSession()
            self.openai_ws = await session.ws_connect(
                "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
                headers=headers
            )
            self.session = session

            self.is_connected = True
            print("✅ Connected to OpenAI Realtime API")

            # Send session configuration
            await self._configure_session()

            # Start listening for responses
            asyncio.create_task(self._listen_to_openai())

        except Exception as e:
            print(f"❌ Failed to connect to OpenAI: {e}")
            self.is_connected = False
            raise

    async def _configure_session(self):
        """Configure the OpenAI session with our system instructions"""
        # Get voice and instructions based on current astrologer
        voice = "alloy"  # default
        instructions = self.system_instructions
        
        if self.current_astrologer_config:
            voice = self.current_astrologer_config.get('voice_id', 'alloy')
            instructions = self.current_astrologer_config.get('system_prompt', self.system_instructions)
        
        config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": instructions,  # Use astrologer-specific instructions
                "voice": voice,  # Dynamic based on astrologer persona
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 200
                },
                "tools": [],
                "tool_choice": "auto",
                "temperature": 0.8
            }
        }

        await self.openai_ws.send_str(json.dumps(config))
        
        astrologer_name = self.current_astrologer_config['name'] if self.current_astrologer_config else "AstroGuru"
        language = self.current_astrologer_config['language'] if self.current_astrologer_config else "Hindi"
        print(f"🔧 Session configured with {astrologer_name} persona (voice: {voice}, language: {language})")
        print(f"📝 System instructions: {instructions[:100]}...")

    async def _listen_to_openai(self):
        """Listen for responses from OpenAI"""
        try:
            async for message in self.openai_ws:
                if message.type == aiohttp.WSMsgType.TEXT:
                    data = json.loads(message.data)
                    await self._handle_openai_message(data)
                elif message.type == aiohttp.WSMsgType.ERROR:
                    print(f"❌ WebSocket error: {self.openai_ws.exception()}")
                    break
        except Exception as e:
            print(f"❌ Error listening to OpenAI: {e}")
            self.is_connected = False

    async def _handle_openai_message(self, data: Dict[str, Any]):
        """Handle messages from OpenAI"""
        msg_type = data.get("type")

        if msg_type == "response.audio.delta":
            # Stream audio back to client
            if self.audio_callback and "delta" in data:
                await self.audio_callback(data["delta"])

        elif msg_type == "response.audio.done":
            # Audio response complete - trigger completion callback
            print("🔊 Audio response completed")
            if self.audio_done_callback:
                await self.audio_done_callback()

        elif msg_type == "response.text.delta":
            # Text response (collect it)
            if "delta" in data:
                text_delta = data["delta"]
                self.current_response_text += text_delta
                print(f"📝 Text delta: {text_delta}")

        elif msg_type == "response.text.done":
            # Text response complete
            if self.text_callback:
                await self.text_callback(self.current_response_text)
            print(f"📝 Full response text: {self.current_response_text}")
            self.current_response_text = ""  # Reset for next response

        elif msg_type == "conversation.item.input_audio_transcription.completed":
            # User speech transcription for logging
            transcript = data.get("transcript", "")
            print(f"🎤 User said: {transcript}")

        elif msg_type == "error":
            print(f"❌ OpenAI error: {data}")

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
        """Send audio data to OpenAI for processing"""
        if not self.is_connected:
            print("🔌 OpenAI not connected, attempting to connect...")
            await self.connect_to_openai()

        try:
            # Check if connection is still valid
            if self.openai_ws.closed:
                print("🔌 OpenAI connection closed, reconnecting...")
                await self.connect_to_openai()
            # Add user context if this is the start of conversation
            user_context = self._get_user_context(user_id)
            if user_context != "New user - no previous information":
                # Send context as a system message first
                context_msg = {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "message",
                        "role": "system",
                        "content": [{
                            "type": "input_text",
                            "text": f"User context: {user_context}"
                        }]
                    }
                }
                await self.openai_ws.send_str(json.dumps(context_msg))

            # Send audio data
            audio_b64 = base64.b64encode(audio_data).decode()

            audio_msg = {
                "type": "conversation.item.create",
                "item": {
                    "type": "message",
                    "role": "user",
                    "content": [{
                        "type": "input_audio",
                        "audio": audio_b64
                    }]
                }
            }

            await self.openai_ws.send_str(json.dumps(audio_msg))

            # Request response with astrologer-specific instructions
            astrologer_instruction = "Respond naturally, maintaining character and collecting birth information."
            if self.current_astrologer_config:
                lang = self.current_astrologer_config['language']
                name = self.current_astrologer_config['name']
                astrologer_instruction = f"Respond in {lang} as {name}, staying in character with your unique personality and expertise."
            
            response_msg = {
                "type": "response.create",
                "response": {
                    "modalities": ["audio", "text"],
                    "instructions": astrologer_instruction
                }
            }

            await self.openai_ws.send_str(json.dumps(response_msg))

            astrologer_name = self.current_astrologer_config['name'] if self.current_astrologer_config else "AstroGuru"
            print(f"🎤 Audio sent to OpenAI for user {user_id} (astrologer: {astrologer_name})")

        except Exception as e:
            print(f"❌ Error sending audio to OpenAI: {e}")

    def set_audio_callback(self, callback: Callable):
        """Set callback function for streaming audio responses"""
        self.audio_callback = callback

    async def disconnect(self):
        """Disconnect from OpenAI"""
        if self.openai_ws:
            await self.openai_ws.close()
        if hasattr(self, 'session'):
            await self.session.close()
        self.is_connected = False
        self.openai_ws = None
        print("🔌 Disconnected from OpenAI")

    def get_user_info_status(self, user_id: str) -> Dict[str, Any]:
        """Get current status of user's birth information collection"""
        if user_id not in self.user_states:
            return {"profile_complete": False, "missing_info": ["name", "birth_date", "birth_time", "birth_location"]}

        state = self.user_states[user_id]
        missing = []

        if not state.get("name"):
            missing.append("name")
        if not state.get("birth_date"):
            missing.append("birth_date")
        if not state.get("birth_time"):
            missing.append("birth_time")
        if not state.get("birth_location"):
            missing.append("birth_location")

        return {
            "profile_complete": len(missing) == 0,
            "missing_info": missing,
            "collected_info": {k: v for k, v in state.items() if v}
        }

# NOTE: No global instance!
# Each user gets their own OpenAIRealtimeHandler instance in main_openai_realtime.py
# This ensures proper persona isolation and scalability