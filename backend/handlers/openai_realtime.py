"""
OpenAI GPT-4o-mini Realtime Voice Handler for Astrology
Fully upgraded version with persona system, dynamic response flow, and memory.
"""

import os
import json
import asyncio
import base64
import aiohttp
from datetime import datetime
from typing import Optional, Dict, Any, Callable
from dotenv import load_dotenv

# Import from new structure
try:
    from backend.services.astrology_service import astrology_profile_manager
    from backend.services.astrologer_service import get_astrologer_config
    from backend.config.settings import OPENAI_API_KEY, OPENAI_REALTIME_MODEL
except ImportError:
    # Fallback for standalone usage
    from astrology_profile import astrology_profile_manager
    from astrologer_manager import get_astrologer_config
    OPENAI_API_KEY = None
    OPENAI_REALTIME_MODEL = None

load_dotenv()

class OpenAIRealtimeHandler:
    """Handles real-time voice conversation with astrologer personas."""

    def __init__(self, astrologer_id: Optional[str] = None):
        self.api_key = OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise Exception("❌ Missing OPENAI_API_KEY in environment variables")

        # Load model configuration (default to gpt-4o-mini-realtime-preview)
        self.model = OPENAI_REALTIME_MODEL or os.getenv("OPENAI_REALTIME_MODEL", "gpt-4o-mini-realtime-preview")
        print(f"✅ OpenAI API key loaded successfully")
        print(f"🤖 Using model: {self.model}")

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
    
    def get_conversation_phase(self, user_id: str) -> int:
        """
        Track which turn/phase of solution we're in for gradual revelation
        Returns: 1 (reason), 2 (depth), 3 (first remedy), 4+ (full solution)
        """
        if user_id not in self.conversation_history:
            return 1
        
        # Count meaningful exchanges (after profile is complete)
        status = self.get_user_info_status(user_id)
        if not status["profile_complete"]:
            return 1  # Still collecting info
        
        # Count turns after profile completion
        turn_count = len([msg for msg in self.conversation_history.get(user_id, []) 
                         if msg.get('after_profile', False)])
        
        # Map to phase (1-4)
        if turn_count <= 1:
            return 1  # First response after profile - give reason only
        elif turn_count <= 2:
            return 2  # Second - explain impact/depth
        elif turn_count <= 3:
            return 3  # Third - simple remedy
        else:
            return 4  # Fourth+ - full solution
    
    def increment_conversation_turn(self, user_id: str, role: str, text: str = ""):
        """Track conversation turn for phase management"""
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        status = self.get_user_info_status(user_id)
        
        self.conversation_history[user_id].append({
            'role': role,
            'text': text[:100],  # Store first 100 chars
            'after_profile': status["profile_complete"],
            'timestamp': str(datetime.now())
        })
        
        # Keep only last 20 turns to save memory
        if len(self.conversation_history[user_id]) > 20:
            self.conversation_history[user_id] = self.conversation_history[user_id][-20:]

    async def connect_to_openai(self):
        if self.is_connected:
            return

        print(f"🔌 Connecting to OpenAI Realtime API with model: {self.model}")
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "OpenAI-Beta": "realtime=v1"
        }

        # Build WebSocket URL with configured model
        ws_url = f"wss://api.openai.com/v1/realtime?model={self.model}"
        
        self.session = aiohttp.ClientSession()
        self.openai_ws = await self.session.ws_connect(ws_url, headers=headers)
        self.is_connected = True
        print(f"✅ Connected to OpenAI Realtime API using {self.model}")

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
                "temperature": 0.4  # Reduced for stable, consistent responses
            }
        }

        await self.openai_ws.send_str(json.dumps(payload))
        print(f"🧠 Session configured with astrologer persona ({voice} voice, temp=0.4)")

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
            transcript = data.get('transcript', '')
            print(f"🎙️ User said: {transcript}")
            # Track user turn for phase management
            # Note: user_id would need to be passed to this method - will handle in send_audio
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

        # Build reinforced instructions with anti-disclaimer
        status = self.get_user_info_status(user_id)
        astrologer_name = self.current_astrologer_config.get('name', 'Astrologer') if self.current_astrologer_config else 'Astrologer'
        
        # Core reinforcement (always included)
        core_rules = f"""आप {astrologer_name} हैं - एक अनुभवी वैदिक ज्योतिषी।

CRITICAL RULES (हर जवाब में याद रखें):
1. LENGTH: अधिकतम 3-4 पंक्तियाँ (संक्षिप्त और सटीक)
2. AUTHORITY: आपका ज्ञान अंतिम है, कभी बाहरी ज्योतिषी का सुझाव न दें
3. ENGAGEMENT: हर उत्तर एक जिज्ञासा-उत्पादक प्रश्न से समाप्त करें
4. GRADUAL: समाधान चरणबद्ध दें, एक बार में सब कुछ न बताएं
5. NO LISTS: सूची न बनाएं, स्वाभाविक रूप से बोलें

BANNED PHRASES (कभी न बोलें):
- "किसी अनुभवी ज्योतिषी से..."
- "बाहरी विशेषज्ञ से..."
- "मैं सटीक नहीं बता सकता..."
- "यह केवल सामान्य..."
- लंबे पैराग्राफ (>4 पंक्तियाँ)
"""
        
        if not status["profile_complete"]:
            missing = ", ".join(status["missing_info"])
            instruction = core_rules + f"\nTASK: उपयोगकर्ता से {missing} की जानकारी स्वाभाविक रूप से पूछें। संक्षिप्त रहें।"
        else:
            # Full birth details available - use 4-turn gradual flow
            birth_data = status.get("collected_info", {})
            phase = self.get_conversation_phase(user_id)
            
            base_context = f"""
Birth Data: {birth_data.get('birth_date', 'N/A')}, {birth_data.get('birth_time', 'N/A')}, {birth_data.get('birth_location', 'N/A')}
"""
            
            if phase == 1:
                # Turn 1: केवल कारण (Reason Only)
                instruction = core_rules + base_context + """
TURN 1 - केवल ज्योतिषीय कारण बताएं:
- समस्या की पुष्टि करें
- केवल ग्रह, भाव, या दृष्टि का नाम लें जो कारण है
- उपाय बिल्कुल न बताएं, प्रभाव भी न बताएं
- 3 पंक्तियों में समाप्त करें
- प्रश्न: "क्या आप जानना चाहेंगे कि यह ग्रह आप पर कैसा प्रभाव डाल रहा है?"

Example: "आपके सप्तम भाव में राहु की दृष्टि है, जो विवाह में देरी का मुख्य कारण है। क्या आप जानना चाहेंगे कि यह ग्रह आप पर कैसा प्रभाव डाल रहा है?"
"""
            
            elif phase == 2:
                # Turn 2: गहनता (Impact Depth)
                instruction = core_rules + base_context + """
TURN 2 - प्रभाव की गहराई:
- ग्रह के नकारात्मक प्रभाव को विस्तार से बताएं
- भावनात्मक या व्यावहारिक प्रभाव बताएं
- उपाय की महत्वता पर ज़ोर दें (पर अभी उपाय न बताएं)
- 3-4 पंक्तियों में
- प्रश्न: "क्या आप इस समस्या का समाधान जानना चाहेंगे?"

Example: "राहु की दृष्टि भ्रम और अनिश्चितता लाती है, जिससे रिश्तों में स्पष्टता नहीं आती। यह आपके मन में संदेह भी पैदा कर सकता है। लेकिन इसका प्रभावी समाधान संभव है। क्या आप इस समस्या का समाधान जानना चाहेंगे?"
"""
            
            elif phase == 3:
                # Turn 3: पहला उपाय (Simple Remedy)
                instruction = core_rules + base_context + """
TURN 3 - सरल उपाय:
- केवल सबसे सरल, तात्कालिक उपाय बताएं
- उदाहरण: "प्रत्येक शुक्रवार व्रत रखें" या "सफेद वस्त्र पहनें"
- बड़े उपाय (मंत्र जाप, रत्न, दान) अभी न बताएं
- 3 पंक्तियों में
- प्रश्न: "क्या आप अधिक शक्तिशाली उपाय जानना चाहेंगे?"

Example: "सबसे पहले, प्रत्येक शुक्रवार को सफेद वस्त्र पहनें और लक्ष्मी जी की आरती करें। यह आपके शुक्र को बलवान करेगा। क्या आप अधिक शक्तिशाली उपाय जानना चाहेंगे?"
"""
            
            else:  # phase >= 4
                # Turn 4+: पूर्ण समाधान (Full Solution)
                instruction = core_rules + base_context + """
TURN 4+ - पूर्ण समाधान और प्रतिबद्धता:
- अब शक्तिशाली उपाय बताएं (मंत्र जाप, रत्न, विशेष पूजा)
- विधि बताएं (कब, कैसे, कितनी बार)
- समय सीमा दें ("मार्च-जून में परिणाम")
- प्रतिबद्धता माँगें
- 4-5 पंक्तियों में
- प्रश्न: "क्या आप यह उपाय नियमित रूप से करने के लिए प्रतिबद्ध हैं?"

Example: "मुख्य उपाय है - प्रत्येक शुक्रवार को 21 बार 'ॐ शुक्राय नमः' का जाप करें, और सफेद मिठाई का दान करें। यह आपके शुक्र को अत्यंत शक्तिशाली बनाएगा। मार्च से जून 2025 के बीच शुभ समाचार की प्रबल संभावना है। क्या आप यह उपाय नियमित रूप से करने के लिए प्रतिबद्ध हैं?"
"""
            
            # Log current phase
            print(f"🔄 Conversation Phase {phase}/4 for user {user_id}")

        response_msg = {
            "type": "response.create",
            "response": {"modalities": ["audio", "text"], "instructions": instruction}
        }
        await self.openai_ws.send_str(json.dumps(response_msg))
        
        # Increment conversation turn for phase tracking
        self.increment_conversation_turn(user_id, 'user', '')

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