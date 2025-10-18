#!/usr/bin/env python3
"""
Quick OTP Test Script
Tests the backend OTP endpoints directly
"""

import requests
import json

def test_otp_endpoints():
    """Test OTP endpoints"""
    base_url = "http://localhost:8000"
    test_phone = "7667855343"  # Your test phone number
    
    print("🧪 Testing OTP Endpoints")
    print("=" * 40)
    
    # Test 1: Send OTP
    print(f"📤 Test 1: Sending OTP to {test_phone}")
    
    send_url = f"{base_url}/auth/send-otp"
    send_payload = {
        "phone_number": test_phone
    }
    
    try:
        response = requests.post(send_url, json=send_payload, timeout=30)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ OTP sent successfully!")
            
            # Test 2: Verify OTP (with wrong OTP to test API)
            print(f"\n🔍 Test 2: Verifying OTP (with test OTP)")
            
            verify_url = f"{base_url}/auth/verify-otp"
            verify_payload = {
                "phone_number": test_phone,
                "otp_code": "123456"  # Wrong OTP for testing
            }
            
            verify_response = requests.post(verify_url, json=verify_payload, timeout=30)
            print(f"   Status: {verify_response.status_code}")
            print(f"   Response: {verify_response.text}")
            
            if verify_response.status_code in [200, 400]:  # 400 is expected for wrong OTP
                print("✅ OTP verification API working!")
            else:
                print("⚠️ Unexpected response")
        else:
            print("❌ OTP send failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Backend not running! Start it with: python3 -m backend.main")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_otp_endpoints()
