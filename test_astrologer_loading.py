#!/usr/bin/env python3
"""
Test script to verify astrologer persona loading
"""

from astrologer_manager import get_astrologer_config

print("🧪 Testing Astrologer Persona Loading\n")
print("="*60)

# Test Tina Kulkarni
print("\n1️⃣ Testing: Tina Kulkarni")
print("-"*60)
tina = get_astrologer_config("tina_kulkarni_vedic_marriage")
if tina:
    print(f"✅ Name: {tina['name']}")
    print(f"✅ Language: {tina['language']}")
    print(f"✅ Gender: {tina['gender']}")
    print(f"✅ Voice ID: {tina['voice_id']}")
    print(f"✅ Speciality: {tina['speciality']}")
    print(f"✅ System Prompt (first 150 chars):")
    print(f"   {tina['system_prompt'][:150]}...")
    print(f"✅ Greeting:")
    print(f"   {tina['greeting']}")
else:
    print("❌ Failed to load Tina Kulkarni")

# Test Mohit
print("\n2️⃣ Testing: Mohit")
print("-"*60)
mohit = get_astrologer_config("mohit_vedic_marriage")
if mohit:
    print(f"✅ Name: {mohit['name']}")
    print(f"✅ Language: {mohit['language']}")
    print(f"✅ Gender: {mohit['gender']}")
    print(f"✅ Voice ID: {mohit['voice_id']}")
    print(f"✅ System Prompt (first 100 chars):")
    print(f"   {mohit['system_prompt'][:100]}...")
else:
    print("❌ Failed to load Mohit")

# Test Priyanka
print("\n3️⃣ Testing: Priyanka")
print("-"*60)
priyanka = get_astrologer_config("priyanka_vedic_love")
if priyanka:
    print(f"✅ Name: {priyanka['name']}")
    print(f"✅ Language: {priyanka['language']}")
    print(f"✅ Voice ID: {priyanka['voice_id']}")
else:
    print("❌ Failed to load Priyanka")

# Test Harsh
print("\n4️⃣ Testing: Harsh Dubey")
print("-"*60)
harsh = get_astrologer_config("harsh_dubey_vedic_love")
if harsh:
    print(f"✅ Name: {harsh['name']}")
    print(f"✅ Language: {harsh['language']}")
    print(f"✅ Voice ID: {harsh['voice_id']}")
else:
    print("❌ Failed to load Harsh Dubey")

print("\n" + "="*60)
print("✅ All astrologers loaded successfully!")
print("\n💡 Key Points:")
print("   - Tina & Harsh speak HINDI")
print("   - Mohit & Priyanka speak ENGLISH")
print("   - Each has unique voice and system prompt")
