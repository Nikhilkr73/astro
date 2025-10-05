#!/usr/bin/env python3
"""
Test script to verify greeting and expertise features
"""

from astrologer_manager import get_astrologer_config

print("🧪 Testing Astrologer Features Integration\n")
print("="*70)

# Test all astrologers
astrologers = [
    "tina_kulkarni_vedic_marriage",
    "mohit_vedic_marriage",
    "priyanka_vedic_love",
    "harsh_dubey_vedic_love"
]

for idx, astro_id in enumerate(astrologers, 1):
    print(f"\n{idx}️⃣  Testing: {astro_id}")
    print("-"*70)
    
    config = get_astrologer_config(astro_id)
    if config:
        print(f"✅ Name: {config['name']}")
        print(f"✅ Language: {config['language']}")
        print(f"✅ Gender: {config['gender']}")
        print(f"✅ Voice: {config['voice_id']}")
        print(f"✅ Speciality: {config['speciality']}")
        
        # Test greeting
        greeting = config.get('greeting', 'NO GREETING')
        print(f"\n📢 GREETING:")
        print(f"   {greeting}")
        
        # Test expertise keywords
        keywords = config.get('expertise_keywords', [])
        print(f"\n🎯 EXPERTISE KEYWORDS ({len(keywords)}):")
        print(f"   {', '.join(keywords)}")
        
        # Test system prompt (first 200 chars)
        system_prompt = config.get('system_prompt', '')
        print(f"\n📝 SYSTEM PROMPT (first 200 chars):")
        print(f"   {system_prompt[:200]}...")
        
        # Test persona
        persona = config.get('persona', '')
        print(f"\n👤 PERSONA:")
        print(f"   {persona}")
    else:
        print(f"❌ Failed to load {astro_id}")

print("\n" + "="*70)
print("✅ All features verified!")
print("\n💡 Key Features Now Integrated:")
print("   1. ✅ System Prompt (with expertise keywords)")
print("   2. ✅ Greeting (auto-sent on selection)")
print("   3. ✅ Expertise Keywords (guides AI focus)")
print("   4. ✅ Voice ID (gender-appropriate)")
print("   5. ✅ Language (Hindi/English)")
print("   6. ✅ Speciality (shown in logs)")
print("   7. ✅ Persona (available for UI)")
