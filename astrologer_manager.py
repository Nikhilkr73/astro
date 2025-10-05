"""
Astrologer Persona Manager
Handles loading, selecting, and customizing astrologer personalities
"""

import json
import os
from typing import Dict, List, Optional, Any

class AstrologerManager:
    """Manages astrologer personas and their configurations"""
    
    def __init__(self, personas_file: str = "astrologer_personas.json"):
        """
        Initialize the astrologer manager
        
        Args:
            personas_file: Path to JSON file containing astrologer personas
        """
        self.personas_file = personas_file
        self.astrologers: List[Dict[str, Any]] = []
        self.voice_mappings: Dict[str, Dict[str, str]] = {}
        self.language_instructions: Dict[str, str] = {}
        self.load_personas()
    
    def load_personas(self) -> None:
        """Load astrologer personas from JSON file"""
        try:
            if not os.path.exists(self.personas_file):
                print(f"⚠️  Personas file not found: {self.personas_file}")
                return
            
            with open(self.personas_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.astrologers = data.get('astrologers', [])
                self.voice_mappings = data.get('voice_mappings', {})
                self.language_instructions = data.get('language_instructions', {})
            
            print(f"✅ Loaded {len(self.astrologers)} astrologer personas")
            
        except Exception as e:
            print(f"❌ Failed to load astrologer personas: {e}")
            self.astrologers = []
    
    def get_astrologer_by_id(self, astrologer_id: str) -> Optional[Dict[str, Any]]:
        """
        Get astrologer by ID
        
        Args:
            astrologer_id: Unique astrologer identifier
            
        Returns:
            Astrologer data or None if not found
        """
        for astrologer in self.astrologers:
            if astrologer.get('astrologer_id') == astrologer_id:
                return astrologer
        return None
    
    def get_astrologers_by_speciality(self, speciality: str) -> List[Dict[str, Any]]:
        """
        Get all astrologers for a specific speciality
        
        Args:
            speciality: Speciality name (e.g., "Vedic Marriage", "Vedic Love")
            
        Returns:
            List of astrologers matching the speciality
        """
        return [a for a in self.astrologers if a.get('speciality') == speciality]
    
    def get_astrologers_by_language(self, language: str) -> List[Dict[str, Any]]:
        """
        Get all astrologers for a specific language
        
        Args:
            language: Language (Hindi/English)
            
        Returns:
            List of astrologers matching the language
        """
        return [a for a in self.astrologers if a.get('language') == language]
    
    def get_astrologer_by_criteria(
        self, 
        speciality: Optional[str] = None,
        language: Optional[str] = None,
        gender: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get astrologer matching specific criteria
        
        Args:
            speciality: Desired speciality
            language: Desired language
            gender: Desired gender
            
        Returns:
            First matching astrologer or None
        """
        matches = self.astrologers
        
        if speciality:
            matches = [a for a in matches if a.get('speciality') == speciality]
        
        if language:
            matches = [a for a in matches if a.get('language') == language]
        
        if gender:
            matches = [a for a in matches if a.get('gender') == gender]
        
        return matches[0] if matches else None
    
    def get_all_astrologers(self) -> List[Dict[str, Any]]:
        """Get all astrologers"""
        return self.astrologers
    
    def get_active_astrologers(self) -> List[Dict[str, Any]]:
        """Get only active astrologers"""
        return [a for a in self.astrologers if a.get('status') == 'active']
    
    def get_voice_id(self, gender: str, language: str) -> str:
        """
        Get appropriate OpenAI voice ID for gender and language
        
        Args:
            gender: Male/Female
            language: Hindi/English
            
        Returns:
            OpenAI voice ID (alloy, echo, nova, shimmer, onyx)
        """
        default_voice = "alloy"
        
        if gender in self.voice_mappings:
            if language in self.voice_mappings[gender]:
                return self.voice_mappings[gender][language]
        
        return default_voice
    
    def build_system_prompt(self, astrologer: Dict[str, Any]) -> str:
        """
        Build complete system prompt for an astrologer
        
        Args:
            astrologer: Astrologer data
            
        Returns:
            Complete system prompt with language instructions
        """
        base_prompt = astrologer.get('system_prompt', '')
        language = astrologer.get('language', 'English')
        
        # Add language-specific instructions
        lang_instruction = self.language_instructions.get(language, '')
        
        if lang_instruction:
            return f"{base_prompt}\n\n{lang_instruction}"
        
        return base_prompt
    
    def get_astrologer_config(self, astrologer_id: str) -> Optional[Dict[str, Any]]:
        """
        Get complete configuration for an astrologer (for OpenAI Realtime API)
        
        Args:
            astrologer_id: Astrologer ID
            
        Returns:
            Configuration dict with voice, system prompt, greeting, etc.
        """
        astrologer = self.get_astrologer_by_id(astrologer_id)
        if not astrologer:
            return None
        
        return {
            'astrologer_id': astrologer.get('astrologer_id'),
            'name': astrologer.get('name'),
            'speciality': astrologer.get('speciality'),
            'language': astrologer.get('language'),
            'gender': astrologer.get('gender'),
            'voice_id': astrologer.get('voice_id'),
            'system_prompt': self.build_system_prompt(astrologer),
            'greeting': astrologer.get('greeting'),
            'persona': astrologer.get('persona'),
            'expertise_keywords': astrologer.get('expertise_keywords', []),
        }
    
    def list_specialities(self) -> List[str]:
        """Get list of all unique specialities"""
        return list(set(a.get('speciality') for a in self.astrologers))
    
    def get_astrologer_summary(self) -> Dict[str, Any]:
        """
        Get summary of all astrologers
        
        Returns:
            Dictionary with statistics and listings
        """
        return {
            'total': len(self.astrologers),
            'active': len(self.get_active_astrologers()),
            'specialities': self.list_specialities(),
            'by_language': {
                'Hindi': len(self.get_astrologers_by_language('Hindi')),
                'English': len(self.get_astrologers_by_language('English'))
            },
            'astrologers': [
                {
                    'id': a.get('astrologer_id'),
                    'name': a.get('name'),
                    'speciality': a.get('speciality'),
                    'language': a.get('language'),
                    'gender': a.get('gender')
                }
                for a in self.astrologers
            ]
        }
    
    def match_astrologer_to_query(self, query: str, language: str = 'English') -> Optional[Dict[str, Any]]:
        """
        Match user query to most appropriate astrologer based on keywords
        
        Args:
            query: User's question or concern
            language: Preferred language
            
        Returns:
            Best matching astrologer or None
        """
        query_lower = query.lower()
        best_match = None
        max_keyword_matches = 0
        
        # Filter by language first
        candidates = self.get_astrologers_by_language(language)
        
        if not candidates:
            candidates = self.astrologers
        
        for astrologer in candidates:
            keywords = astrologer.get('expertise_keywords', [])
            matches = sum(1 for keyword in keywords if keyword.lower() in query_lower)
            
            if matches > max_keyword_matches:
                max_keyword_matches = matches
                best_match = astrologer
        
        return best_match


# Global instance
astrologer_manager = AstrologerManager()


def get_astrologer(astrologer_id: str = None, **criteria) -> Optional[Dict[str, Any]]:
    """
    Convenience function to get astrologer
    
    Args:
        astrologer_id: Specific astrologer ID
        **criteria: speciality, language, gender filters
        
    Returns:
        Astrologer data
    """
    if astrologer_id:
        return astrologer_manager.get_astrologer_by_id(astrologer_id)
    
    return astrologer_manager.get_astrologer_by_criteria(**criteria)


def list_astrologers() -> List[Dict[str, Any]]:
    """Get all astrologers"""
    return astrologer_manager.get_all_astrologers()


def get_astrologer_config(astrologer_id: str) -> Optional[Dict[str, Any]]:
    """Get complete astrologer configuration"""
    return astrologer_manager.get_astrologer_config(astrologer_id)


if __name__ == "__main__":
    # Test the astrologer manager
    print("🌟 Astrologer Manager Test\n")
    
    # Summary
    summary = astrologer_manager.get_astrologer_summary()
    print(f"📊 Total Astrologers: {summary['total']}")
    print(f"✅ Active: {summary['active']}")
    print(f"🎯 Specialities: {', '.join(summary['specialities'])}")
    print(f"🗣️ Languages: Hindi ({summary['by_language']['Hindi']}), English ({summary['by_language']['English']})")
    print("\n" + "="*60 + "\n")
    
    # List all astrologers
    print("📋 All Astrologers:\n")
    for a in summary['astrologers']:
        print(f"  • {a['name']} ({a['gender']}, {a['language']})")
        print(f"    Speciality: {a['speciality']}")
        print(f"    ID: {a['id']}\n")
    
    print("="*60 + "\n")
    
    # Test specific lookups
    print("🔍 Test Queries:\n")
    
    # Get by ID
    tina = astrologer_manager.get_astrologer_by_id("tina_kulkarni_vedic_marriage")
    if tina:
        print(f"✅ Found by ID: {tina['name']}")
        print(f"   Voice: {tina['voice_id']}")
        print(f"   Greeting: {tina['greeting'][:50]}...")
    
    # Get by speciality
    marriage_experts = astrologer_manager.get_astrologers_by_speciality("Vedic Marriage")
    print(f"\n✅ Marriage experts: {len(marriage_experts)}")
    for expert in marriage_experts:
        print(f"   • {expert['name']} ({expert['language']})")
    
    # Get by criteria
    hindi_female = astrologer_manager.get_astrologer_by_criteria(
        language="Hindi",
        gender="Female"
    )
    if hindi_female:
        print(f"\n✅ Hindi Female astrologer: {hindi_female['name']}")
    
    # Match query
    query = "I want to know about marriage delay problems"
    match = astrologer_manager.match_astrologer_to_query(query, language="English")
    if match:
        print(f"\n✅ Best match for '{query}':")
        print(f"   {match['name']} - {match['speciality']}")
    
    print("\n" + "="*60)
    print("✅ Astrologer Manager test complete!")

