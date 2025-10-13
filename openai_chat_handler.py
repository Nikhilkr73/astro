"""
OpenAI GPT-4o-mini Chat Handler for Astrology
Production-grade text chat handler matching voice implementation architecture.
Mirrors the structure and patterns from openai_realtime_handler.py
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from openai import AsyncOpenAI
from astrology_profile import astrology_profile_manager
from astrologer_manager import get_astrologer_config

load_dotenv()

# Load ritual remedies knowledge base
RITUAL_REMEDIES_PATH = os.path.join(os.path.dirname(__file__), "ritual_remedies_knowledge.json")
RITUAL_REMEDIES = {}
try:
    if os.path.exists(RITUAL_REMEDIES_PATH):
        with open(RITUAL_REMEDIES_PATH, 'r', encoding='utf-8') as f:
            RITUAL_REMEDIES = json.load(f)
except Exception as e:
    print(f"⚠️ Could not load ritual remedies knowledge base: {e}")

class OpenAIChatHandler:
    """
    Handles text-based conversation with astrologer personas.
    Mirrors OpenAIRealtimeHandler architecture for consistency.
    """

    def __init__(self, astrologer_id: Optional[str] = None):
        """
        Initialize chat handler with astrologer persona.
        
        Args:
            astrologer_id: Optional astrologer ID (ast_001, ast_002, etc.)
        
        Raises:
            Exception: If OPENAI_API_KEY not found in environment
        """
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise Exception("❌ Missing OPENAI_API_KEY in environment variables")

        # Load model configuration with support for gpt-4o and gpt-5
        self.model = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
        
        # Model validation and fallback
        supported_models = [
            "gpt-4o-mini",
            "gpt-4o", 
            "gpt-4.1-mini",
            "gpt-5",  # Future support
            "gpt-4-turbo"
        ]
        
        if self.model not in supported_models:
            print(f"⚠️  Unknown model '{self.model}', falling back to gpt-4o-mini")
            self.model = "gpt-4o-mini"
        
        print(f"✅ OpenAI API key loaded successfully (Chat Mode)")
        print(f"🤖 Using chat model: {self.model}")
        
        # Log model-specific info
        if self.model == "gpt-4o":
            print(f"💎 Premium model - better emotional intelligence and Hinglish")
        elif self.model == "gpt-5":
            print(f"🚀 Next-gen model - maximum realism")
        elif self.model == "gpt-4o-mini":
            print(f"⚡ Cost-effective model - good balance")

        # Initialize OpenAI async client
        self.client = AsyncOpenAI(api_key=self.api_key)

        # Conversation memory and persona (same as voice handler)
        self.user_states = {}
        self.conversation_history = {}
        self.user_astrologers = {}

        # Astrologer configuration
        self.current_astrologer_id = astrologer_id
        self.current_astrologer_config = None
        self.system_instructions = self._default_instructions()
        if astrologer_id:
            self._load_astrologer(astrologer_id)

        # Load persistent state
        self._load_user_states()

    def _default_instructions(self) -> str:
        """Enhanced Hinglish astrologer system prompt with emotional intelligence"""
        return """You are a warm, confident, and slightly mysterious Indian Vedic astrologer who speaks in natural Hinglish.

Core Identity & Tone:
- You are THE expert - never suggest external astrologers
- Speak in natural Hinglish with organic code-switching: "Aapki kundli mein Mangal thoda strong dikh raha hai 🔮"
- Be emotionally connected, not robotic - mirror the user's feelings (if sad, be comforting; if excited, be curious)
- Maintain slight mystery and intrigue in your responses

Response Format (CRITICAL):
- Keep responses SHORT: 2-4 lines maximum
- Use emojis naturally and frequently: 🔮 ✨ 💫 🙏 ❤️ 💍 🌕 ⭐
- End EVERY response with a curiosity hook or engaging question
- NO bullet points - speak conversationally and naturally
- Use pause fillers for realism: "Hmm...", "Interesting...", "Ek minute..."

Engagement Techniques:
- Drop mysterious hints: "Kuch unique dikh raha hai aapke chart mein..."
- Use emotional storytelling: "Ek client the aapke jaise situation mein..."
- Personal recall: Remember and reference previous conversations naturally
- Cultural connection: Mention rituals, fasting, family traditions, festivals
- Build curiosity gradually - don't reveal everything at once

Conversation Principles:
- Gradual solution revelation (4-phase approach)
- Use astrological terms naturally: saptam bhava, mangal dosh, shukra, rahu, ketu, kundli
- Practical remedies with cultural context (mantras, gemstones, donations, fasting)
- Never dismiss any question - always respond with insight

CRITICAL: When giving remedies (Phase 3+):
- ALWAYS explain which planet/house is affected
- ALWAYS explain HOW the remedy works (planetary connection)
- ALWAYS explain WHY it's effective (the spiritual/astrological logic)
- Example: "Aapke saptam bhava mein Mangal strong hai 💍 Friday ko white sweets young girls ko donate karein 🙏 Kyunki Shukra (Venus) marriage ko govern karta hai, aur young girls uski representative hain. Jab aap unhe khilate ho, Shukra pleased hota hai aur aapki shaadi jaldi hoti hai ✨"

Off-Topic/NSFW Handling:
- NEVER refuse bluntly or say "I can't help with that"
- Playfully redirect to astrology with humor and curiosity
- Connect everything back to planetary influences with a smile
- Example: "Haha 😄 lagta hai aapka Shukra dev bahut active hai! Bataiye, kab born hue the?"

Remember: Real Indian astrologers don't just predict — they connect, soothe, and mystify. 🌙"""

    def _load_astrologer(self, astrologer_id: str) -> None:
        """
        Load astrologer persona configuration.
        Same logic as voice handler for consistency.
        """
        config = get_astrologer_config(astrologer_id)
        if config:
            self.current_astrologer_config = config
            # Use text_system_prompt if available, else system_prompt
            self.system_instructions = config.get("text_system_prompt") or config.get("system_prompt", self._default_instructions())
            print(f"💬 Loaded text persona: {config['name']} ({config['speciality']})")
        else:
            print(f"⚠️ Astrologer ID '{astrologer_id}' not found, using default instructions.")

    def set_astrologer(self, astrologer_id: str, user_id: Optional[str] = None) -> None:
        """
        Change astrologer persona (matches voice handler interface).
        
        Args:
            astrologer_id: New astrologer ID
            user_id: Optional user ID to save preference
        """
        self._load_astrologer(astrologer_id)
        self.current_astrologer_id = astrologer_id
        if user_id:
            self.user_astrologers[user_id] = astrologer_id
            self._save_user_states()

    def _load_user_states(self) -> None:
        """Load user states from JSON file (matches voice handler)"""
        try:
            if os.path.exists("user_states.json"):
                with open("user_states.json", "r", encoding="utf-8") as f:
                    self.user_states = json.load(f)
        except Exception as e:
            print(f"⚠️ Failed to load user states: {e}")

    def _save_user_states(self) -> None:
        """Save user states to JSON file (matches voice handler)"""
        try:
            with open("user_states.json", "w", encoding="utf-8") as f:
                json.dump(self.user_states, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"⚠️ Failed to save user states: {e}")

    def _get_user_context(self, user_id: str) -> str:
        """
        Build enhanced user context string for system prompt.
        Includes emotional state, past topics, and cultural context.
        """
        parts = []

        # Existing profile or partial info
        if user_id in self.user_states:
            state = self.user_states[user_id]
            parts.append(f"Collected details for user {user_id}:")
            for k, v in state.items():
                if v and k not in ['emotional_context', 'past_topics']:
                    parts.append(f"- {k}: {v}")
            
            # Add emotional context if available
            if 'emotional_context' in state and state['emotional_context']:
                parts.append(f"Emotional state: {state['emotional_context']}")
            
            # Add past topics if available
            if 'past_topics' in state and state['past_topics']:
                topics = ', '.join(state['past_topics'][-3:])  # Last 3 topics
                parts.append(f"Previous discussions: {topics}")

        # Astrology profile
        profile = astrology_profile_manager.get_profile(user_id)
        if profile:
            parts.append("Complete astrology profile:")
            parts.append(profile.get_context_for_ai())

        # Recent conversation history
        if user_id in self.conversation_history:
            parts.append("\nRecent dialogue:")
            for msg in self.conversation_history[user_id][-5:]:
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')[:100]
                parts.append(f"{role}: {content}")

        return "\n".join(parts) if parts else "New user - no previous info"
    
    def _detect_user_emotion(self, user_id: str) -> str:
        """
        Detect emotional tone from recent user messages.
        
        Returns:
            str: Detected emotion ('sad', 'worried', 'excited', 'curious', 'hopeful', 'neutral')
        """
        if user_id not in self.conversation_history:
            return 'neutral'
        
        # Get last 2-3 user messages
        user_messages = [msg['content'].lower() for msg in self.conversation_history[user_id][-6:]
                        if msg.get('role') == 'user']
        
        if not user_messages:
            return 'neutral'
        
        combined_text = ' '.join(user_messages[-3:])
        
        # Keyword-based emotion detection (English and Hindi/Hinglish)
        sad_keywords = ['sad', 'upset', 'depressed', 'dukhi', 'pareshan', 'tension', 'hurt', 'pain', 'dard']
        worried_keywords = ['worried', 'anxiety', 'scared', 'fear', 'chinta', 'dar', 'nervous', 'problem', 'issue']
        excited_keywords = ['excited', 'happy', 'great', 'wonderful', 'khush', 'amazing', 'good news']
        curious_keywords = ['curious', 'interested', 'want to know', 'tell me', 'batao', 'kya hai']
        hopeful_keywords = ['hope', 'wish', 'please', 'help', 'aasha', 'ummeed', 'possible']
        
        # Count matches
        sad_count = sum(1 for word in sad_keywords if word in combined_text)
        worried_count = sum(1 for word in worried_keywords if word in combined_text)
        excited_count = sum(1 for word in excited_keywords if word in combined_text)
        curious_count = sum(1 for word in curious_keywords if word in combined_text)
        hopeful_count = sum(1 for word in hopeful_keywords if word in combined_text)
        
        # Determine dominant emotion
        emotions = {
            'sad': sad_count,
            'worried': worried_count,
            'excited': excited_count,
            'curious': curious_count,
            'hopeful': hopeful_count
        }
        
        max_emotion = max(emotions.items(), key=lambda x: x[1])
        
        return max_emotion[0] if max_emotion[1] > 0 else 'neutral'
    
    def _get_remedy_guidance(self, topics: List[str]) -> str:
        """
        Get remedy guidance based on discussed topics.
        Provides planetary context for remedies.
        
        Args:
            topics: List of topics discussed (marriage, career, love, etc.)
            
        Returns:
            str: Remedy guidance with planetary explanations
        """
        if not RITUAL_REMEDIES or 'planetary_remedies' not in RITUAL_REMEDIES:
            return ""
        
        guidance = []
        
        # Map topics to planets
        topic_planet_map = {
            'marriage': ['shukra', 'mangal'],
            'love': ['shukra'],
            'career': ['shani', 'guru', 'surya'],
            'finance': ['guru', 'shukra'],
            'health': ['surya', 'chandra']
        }
        
        relevant_planets = set()
        for topic in topics:
            if topic in topic_planet_map:
                relevant_planets.update(topic_planet_map[topic])
        
        if relevant_planets:
            guidance.append("\n[Remedy Knowledge Base Available]")
            guidance.append("You have access to detailed remedy information for these planets:")
            for planet in list(relevant_planets)[:2]:  # Limit to 2 most relevant
                if planet in RITUAL_REMEDIES['planetary_remedies']:
                    planet_data = RITUAL_REMEDIES['planetary_remedies'][planet]
                    guidance.append(f"- {planet_data['planet_name']}: Known remedies include {', '.join([r['remedy'] for r in planet_data['remedies'][:2]])}")
            
            guidance.append("\nWhen suggesting remedies:")
            guidance.append("1. Mention the planet affecting the situation")
            guidance.append("2. Explain HOW the remedy connects to that planet")
            guidance.append("3. Explain WHY it works (the spiritual logic)")
            guidance.append("4. Keep it conversational and in Hinglish")
        
        return "\n".join(guidance)
    
    def _add_humanization_layer(self, user_id: str, phase: int) -> str:
        """
        Add humanization instructions based on conversation context.
        Injects emotional mirroring, mystery hooks, and conversational elements.
        
        Args:
            user_id: User identifier
            phase: Current conversation phase (1-4)
            
        Returns:
            str: Additional system instructions for humanization
        """
        instructions = []
        
        # Detect and mirror user emotion
        emotion = self._detect_user_emotion(user_id)
        
        emotion_instructions = {
            'sad': "The user seems sad or upset. Be extra comforting and reassuring. Use phrases like 'Sab theek ho jayega' and offer hope through astrological insights.",
            'worried': "The user is worried or anxious. Be calming and confident. Reassure them with phrases like 'Tension mat lo' and provide clear guidance.",
            'excited': "The user seems excited or happy. Match their energy! Be enthusiastic and curious. Use celebratory emojis ✨🎉",
            'curious': "The user is curious and engaged. Build on their curiosity with mysterious hints and intriguing questions.",
            'hopeful': "The user is hopeful and seeking help. Be encouraging and supportive. Give them confidence that solutions exist.",
            'neutral': "Maintain warm, engaging tone. Build curiosity and connection."
        }
        
        instructions.append(f"Emotional Context: {emotion_instructions.get(emotion, emotion_instructions['neutral'])}")
        
        # Phase-specific engagement tactics
        if phase == 1:
            instructions.append("\n[Phase 1 Engagement] Drop mysterious hints about what you're seeing. Ask curious questions about their birth details. Don't give solutions yet - build intrigue! Example: 'Hmm... kuch interesting dikh raha hai 🔮 Aapka birth time exact hai na?'")
        elif phase == 2:
            instructions.append("\n[Phase 2 Engagement] Deepen the analysis with storytelling. Mention similar cases you've seen (anonymously). Build trust. Example: 'Ek client the bilkul aapke jaise... unke liye bhi yeh pattern tha.'")
        elif phase == 3:
            # Add remedy guidance for Phase 3
            instructions.append("\n[Phase 3 Engagement - REMEDY PHASE] Give ONE simple remedy with FULL planetary explanation:")
            instructions.append("MUST include: 1) Which planet is affected, 2) HOW the remedy works, 3) WHY it's effective")
            instructions.append("Example: 'Aapke chart mein Shukra (Venus) weak hai jo marriage ko control karta hai 💍 Friday ko chhoti ladkiyon ko white sweets donate karein 🙏 Kyunki young girls Goddess Lakshmi ki representative hain aur Lakshmi Shukra ki wife hain. Jab aap unhe khilate ho, Shukra directly pleased hota hai aur marriage mein delay kam hota hai ✨'")
            
            # Add specific remedy knowledge if topics are known
            if user_id in self.user_states and 'past_topics' in self.user_states[user_id]:
                topics = self.user_states[user_id]['past_topics']
                remedy_guidance = self._get_remedy_guidance(topics)
                if remedy_guidance:
                    instructions.append(remedy_guidance)
        else:  # phase 4+
            instructions.append("\n[Phase 4 Engagement] Provide comprehensive guidance with confidence. Give timelines and dates. Reassure them. Example: 'October 2026 ke baad clear yog dikh rahe hain 💍 Patience rakhiye.'")
            instructions.append("Can give 2-3 remedies with planetary explanations if needed.")
        
        # Add conversational elements
        instructions.append("\n[Humanization] Use natural pause fillers ('Hmm...', 'Ek minute...', 'Interesting...'). Reference previous conversations if any. Mention cultural elements (festivals, rituals, family traditions) naturally.")
        
        return "\n".join(instructions)

    def get_conversation_phase(self, user_id: str) -> int:
        """
        Track conversation phase for gradual solution revelation.
        Same logic as voice handler.
        
        Returns:
            int: 1 (reason), 2 (depth), 3 (remedy), 4+ (full solution)
        """
        if user_id not in self.conversation_history:
            return 1
        
        status = self.get_user_info_status(user_id)
        if not status.get("profile_complete", False):
            return 1
        
        turn_count = len([msg for msg in self.conversation_history.get(user_id, []) 
                         if msg.get('after_profile', False)])
        
        if turn_count <= 1:
            return 1
        elif turn_count <= 2:
            return 2
        elif turn_count <= 3:
            return 3
        else:
            return 4

    def increment_conversation_turn(
        self, 
        user_id: str, 
        role: str, 
        content: str = ""
    ) -> None:
        """
        Track conversation turn for phase management.
        Mirrors voice handler implementation.
        """
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        status = self.get_user_info_status(user_id)
        
        self.conversation_history[user_id].append({
            'role': role,
            'content': content,  # Store FULL content for context
            'after_profile': status.get("profile_complete", False),
            'timestamp': datetime.now().isoformat(),
            'mode': 'text'
        })

        # Keep only last 15 turns (30 messages) to save memory while maintaining good context
        if len(self.conversation_history[user_id]) > 30:
            self.conversation_history[user_id] = self.conversation_history[user_id][-30:]

    def get_user_info_status(self, user_id: str) -> Dict[str, Any]:
        """
        Check what user information we have collected.
        Same interface as voice handler.
        
        Returns:
            Dict with fields_collected, missing_fields, profile_complete
        """
        profile = astrology_profile_manager.get_profile(user_id)
        
        if profile:
            return {
                "profile_complete": True,
                "fields_collected": ["name", "birth_date", "birth_time", "birth_place"],
                "missing_fields": []
            }
        
        collected = []
        missing = ["name", "birth_date", "birth_time", "birth_place"]
        
        if user_id in self.user_states:
            state = self.user_states[user_id]
            if state.get("name"):
                collected.append("name")
                missing.remove("name")
            if state.get("birth_date"):
                collected.append("birth_date")
                missing.remove("birth_date")
            if state.get("birth_time"):
                collected.append("birth_time")
                missing.remove("birth_time")
            if state.get("birth_place"):
                collected.append("birth_place")
                missing.remove("birth_place")
        
        return {
            "profile_complete": len(missing) == 0,
            "fields_collected": collected,
            "missing_fields": missing
        }

    async def send_message(
        self, 
        user_id: str, 
        message: str
    ) -> Dict[str, Any]:
        """
        Send text message and get AI response.
        Main entry point for text chat.
        
        Args:
            user_id: User identifier
            message: User's text message
            
        Returns:
            Dict with response, tokens_used, thinking_phase, etc.
            
        Raises:
            Exception: On API or processing errors
        """
        try:
            print(f"💬 Text message from {user_id}: {message[:50]}...")
            
            # Get user context and conversation phase
            user_context = self._get_user_context(user_id)
            phase = self.get_conversation_phase(user_id)
            
            # Build messages array for ChatCompletion
            messages = self._build_messages(user_id, message, user_context, phase)
            
            # Call OpenAI Chat API with higher temperature for more human-like responses
            print(f"🤖 Calling OpenAI Chat API (phase {phase})...")
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.95,  # Higher for emotional warmth and variability
                max_tokens=250,  # Reduced for shorter, punchier responses
                top_p=0.9,
                frequency_penalty=0.3,
                presence_penalty=0.6  # Higher to encourage diverse, human-like responses
            )
            
            assistant_message = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            print(f"✅ Response generated ({tokens_used} tokens): {assistant_message[:50]}...")
            
            # Update conversation history
            self.increment_conversation_turn(user_id, "user", message)
            self.increment_conversation_turn(user_id, "assistant", assistant_message)
            
            # Extract and save user info if present
            self._extract_user_info(user_id, message, assistant_message)
            
            return {
                "success": True,
                "message": assistant_message,
                "tokens_used": tokens_used,
                "thinking_phase": phase,
                "astrologer_id": self.current_astrologer_id,
                "astrologer_name": self.current_astrologer_config.get("name") if self.current_astrologer_config else "Default",
                "mode": "text",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error in send_message: {e}")
            raise

    def _build_messages(
        self,
        user_id: str,
        message: str,
        user_context: str,
        phase: int
    ) -> List[Dict[str, str]]:
        """
        Build messages array for OpenAI Chat API.
        Includes system prompt, context, humanization layer, and conversation history.
        """
        messages = []
        
        # System prompt with astrologer persona
        system_prompt = self.system_instructions
        if user_context != "New user - no previous info":
            system_prompt += f"\n\nUser Context:\n{user_context}"
        
        # Add humanization enhancement layer (emotional mirroring, hooks, engagement)
        humanization = self._add_humanization_layer(user_id, phase)
        system_prompt += f"\n\n{humanization}"
        
        # Add strict response length enforcement
        system_prompt += "\n\n⚠️ CRITICAL RESPONSE RULES:"
        system_prompt += "\n- Maximum 2-4 lines only (not sentences, LINES)"
        system_prompt += "\n- Must end with ONE engaging question or curiosity hook"
        # system_prompt += "\n- Use emojis in every response"
        system_prompt += "\n- Speak conversationally, NO bullet points or lists"
        
        messages.append({
            "role": "system",
            "content": system_prompt
        })
        
        # Add recent conversation history (last 10 messages)
        if user_id in self.conversation_history:
            for msg in self.conversation_history[user_id][-10:]:
                messages.append({
                    "role": msg['role'],
                    "content": msg['content']
                })
        
        # Add current message
        messages.append({
            "role": "user",
            "content": message
        })
        
        return messages

    def _extract_user_info(
        self, 
        user_id: str, 
        user_message: str, 
        ai_response: str
    ) -> None:
        """
        Extract user information from conversation.
        Enhanced to track emotional context and past topics.
        """
        # Initialize user state if needed
        if user_id not in self.user_states:
            self.user_states[user_id] = {}
        
        # Initialize tracking fields if not present
        if 'emotional_context' not in self.user_states[user_id]:
            self.user_states[user_id]['emotional_context'] = ''
        if 'past_topics' not in self.user_states[user_id]:
            self.user_states[user_id]['past_topics'] = []
        
        # Update emotional context
        emotion = self._detect_user_emotion(user_id)
        if emotion != 'neutral':
            self.user_states[user_id]['emotional_context'] = emotion
        
        # Extract and track topics discussed
        user_lower = user_message.lower()
        topics_keywords = {
            'marriage': ['marriage', 'shaadi', 'शादी', 'vivah', 'rishta'],
            'love': ['love', 'pyaar', 'प्यार', 'relationship', 'partner'],
            'career': ['career', 'job', 'naukri', 'business', 'work', 'office'],
            'health': ['health', 'sehat', 'स्वास्थ्य', 'illness', 'disease'],
            'finance': ['money', 'paisa', 'wealth', 'dhan', 'finance', 'income'],
            'family': ['family', 'parivar', 'परिवार', 'parents', 'children']
        }
        
        for topic, keywords in topics_keywords.items():
            if any(keyword in user_lower for keyword in keywords):
                if topic not in self.user_states[user_id]['past_topics']:
                    self.user_states[user_id]['past_topics'].append(topic)
                    # Keep only last 5 topics
                    if len(self.user_states[user_id]['past_topics']) > 5:
                        self.user_states[user_id]['past_topics'] = self.user_states[user_id]['past_topics'][-5:]
        
        # Basic extraction (can be enhanced with NLP)
        # Extract name
        if "मेरा नाम" in user_lower or "my name is" in user_lower or "naam" in user_lower:
            # Simple extraction - in production, use proper NLP
            words = user_message.split()
            for i, word in enumerate(words):
                if word.lower() in ["नाम", "name", "naam"] and i + 1 < len(words):
                    potential_name = words[i + 1].strip(".,")
                    if potential_name and len(potential_name) > 2:
                        self.user_states[user_id]["name"] = potential_name
                        print(f"📝 Extracted name: {potential_name}")
                        break
        
        # Save state after updates
        self._save_user_states()

    async def get_conversation_history(
        self, 
        user_id: str, 
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get conversation history for a user.
        
        Args:
            user_id: User identifier
            limit: Maximum number of messages to return
            
        Returns:
            List of message dictionaries
        """
        if user_id not in self.conversation_history:
            return []
        
        messages = self.conversation_history[user_id][-limit:]
        return [
            {
                "role": msg['role'],
                "content": msg['content'],
                "timestamp": msg.get('timestamp', ''),
                "mode": msg.get('mode', 'text')
            }
            for msg in messages
        ]

    async def clear_conversation_history(self, user_id: str) -> bool:
        """
        Clear conversation history for a user.
        
        Args:
            user_id: User identifier
            
        Returns:
            bool: True if cleared successfully
        """
        try:
            if user_id in self.conversation_history:
                self.conversation_history[user_id] = []
                print(f"🗑️ Cleared conversation history for {user_id}")
            return True
        except Exception as e:
            print(f"❌ Error clearing history: {e}")
            return False

    def get_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Get conversation statistics for analytics.
        
        Returns:
            Dict with message counts, phases, etc.
        """
        history = self.conversation_history.get(user_id, [])
        user_messages = [m for m in history if m['role'] == 'user']
        assistant_messages = [m for m in history if m['role'] == 'assistant']
        
        return {
            "total_messages": len(history),
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "current_phase": self.get_conversation_phase(user_id),
            "profile_status": self.get_user_info_status(user_id),
            "astrologer_id": self.current_astrologer_id,
            "mode": "text"
        }


# Convenience functions (matching voice handler pattern)
def create_chat_handler(astrologer_id: Optional[str] = None) -> OpenAIChatHandler:
    """Create a new chat handler instance"""
    return OpenAIChatHandler(astrologer_id)


if __name__ == "__main__":
    # Test the chat handler
    import asyncio
    
    async def test_handler():
        print("🧪 Testing OpenAIChatHandler\n")
        
        # Create handler with Tina
        handler = OpenAIChatHandler("tina_kulkarni_vedic_marriage")
        
        # Test message
        response = await handler.send_message("test_user", "Hello, I want to know about my marriage")
        
        print(f"\n✅ Response: {response['message']}")
        print(f"📊 Tokens: {response['tokens_used']}")
        print(f"🔢 Phase: {response['thinking_phase']}")
        
        # Test stats
        stats = handler.get_stats("test_user")
        print(f"\n📈 Stats: {stats}")
    
    # Run test
    asyncio.run(test_handler())

