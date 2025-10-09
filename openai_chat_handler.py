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

        print("✅ OpenAI API key loaded successfully (Chat Mode)")

        # Initialize OpenAI async client
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"

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
        """Default Hinglish astrologer system prompt"""
        return """You are an experienced Vedic astrologer.

Text Chat Rules:
- Respond in Hinglish (Hindi-English mix): 'Aap ka birth date kya hai?'
- Keep responses short (2-3 sentences max)
- Use emojis frequently: 🔮 ✨ ⭐ 🙏 💫
- Use bullet points for clarity
- Ask one follow-up question per response

Core Principles:
- Never suggest external astrologers - you are the expert
- Gradual solution revelation (4-phase approach)
- Use astrological terms naturally
- Practical remedies when appropriate
- Be empathetic but confident"""

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
        Build user context string for system prompt.
        Identical logic to voice handler for consistency.
        """
        parts = []

        # Existing profile or partial info
        if user_id in self.user_states:
            state = self.user_states[user_id]
            parts.append(f"Collected details for user {user_id}:")
            for k, v in state.items():
                if v:
                    parts.append(f"- {k}: {v}")

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
            'content': content[:200],  # Store first 200 chars
            'after_profile': status.get("profile_complete", False),
            'timestamp': datetime.now().isoformat(),
            'mode': 'text'
        })

        # Keep only last 20 turns to save memory
        if len(self.conversation_history[user_id]) > 20:
            self.conversation_history[user_id] = self.conversation_history[user_id][-20:]

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
            
            # Call OpenAI Chat API
            print(f"🤖 Calling OpenAI Chat API (phase {phase})...")
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500,
                top_p=0.9,
                frequency_penalty=0.3,
                presence_penalty=0.3
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
        Includes system prompt, context, and conversation history.
        """
        messages = []
        
        # System prompt with astrologer persona
        system_prompt = self.system_instructions
        if user_context != "New user - no previous info":
            system_prompt += f"\n\nUser Context:\n{user_context}"
        
        # Add phase-specific instructions (gradual solution)
        if phase == 1:
            system_prompt += "\n\n[Phase 1: Only explain the reason/cause. Don't give solutions yet.]"
        elif phase == 2:
            system_prompt += "\n\n[Phase 2: Deepen the explanation. Still no solutions.]"
        elif phase == 3:
            system_prompt += "\n\n[Phase 3: Give ONE simple remedy only.]"
        else:
            system_prompt += "\n\n[Phase 4+: Provide comprehensive guidance.]"
        
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
        Simplified version of voice handler's extraction logic.
        """
        # Initialize user state if needed
        if user_id not in self.user_states:
            self.user_states[user_id] = {}
        
        # Basic extraction (can be enhanced with NLP)
        user_lower = user_message.lower()
        
        # Extract name
        if "मेरा नाम" in user_lower or "my name is" in user_lower or "naam" in user_lower:
            # Simple extraction - in production, use proper NLP
            words = user_message.split()
            for i, word in enumerate(words):
                if word.lower() in ["नाम", "name", "naam"] and i + 1 < len(words):
                    potential_name = words[i + 1].strip(".,")
                    if potential_name and len(potential_name) > 2:
                        self.user_states[user_id]["name"] = potential_name
                        self._save_user_states()
                        print(f"📝 Extracted name: {potential_name}")
                        break

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

