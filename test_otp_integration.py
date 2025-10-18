#!/usr/bin/env python3
"""
OTP Integration Test Script
Tests the OTP endpoints for AstroVoice
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_PHONE = "9876543210"  # Use your test phone number

def test_otp_flow():
    """Test complete OTP flow"""
    print("🧪 Testing OTP Integration for AstroVoice")
    print("=" * 50)
    
    # Test 1: Send OTP
    print("\n1️⃣ Testing Send OTP...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/send-otp",
            json={"phone_number": TEST_PHONE},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ OTP sent successfully!")
            otp_data = response.json()
            expires_in = otp_data.get('expires_in', 300)
            print(f"   ⏰ OTP expires in {expires_in} seconds")
        else:
            print(f"   ❌ Failed to send OTP: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error sending OTP: {e}")
        return False
    
    # Test 2: Verify OTP (with wrong code first)
    print("\n2️⃣ Testing OTP Verification (Wrong Code)...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/verify-otp",
            json={
                "phone_number": TEST_PHONE,
                "otp_code": "000000"  # Wrong OTP
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 400:
            print("   ✅ Correctly rejected wrong OTP!")
        else:
            print(f"   ⚠️ Unexpected response for wrong OTP")
            
    except Exception as e:
        print(f"   ❌ Error verifying wrong OTP: {e}")
    
    # Test 3: Rate Limiting
    print("\n3️⃣ Testing Rate Limiting...")
    try:
        # Send multiple OTPs quickly
        for i in range(4):  # Send 4 OTPs (should trigger rate limit)
            response = requests.post(
                f"{BASE_URL}/api/auth/send-otp",
                json={"phone_number": TEST_PHONE},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"   Request {i+1}: Status {response.status_code}")
            
            if response.status_code == 429:
                print("   ✅ Rate limiting triggered correctly!")
                retry_after = response.headers.get('Retry-After', 'Unknown')
                print(f"   ⏰ Retry after: {retry_after} seconds")
                break
            elif response.status_code == 200:
                print(f"   📱 OTP {i+1} sent successfully")
            else:
                print(f"   ❌ Unexpected status: {response.status_code}")
                
    except Exception as e:
        print(f"   ❌ Error testing rate limiting: {e}")
    
    # Test 4: Health Check
    print("\n4️⃣ Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        
        if response.status_code == 200:
            print("   ✅ Backend is healthy!")
            print(f"   📊 Health data: {response.json()}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error checking health: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 OTP Integration Test Complete!")
    print("\n📋 Next Steps:")
    print("1. Check backend logs for OTP codes")
    print("2. Test with real phone number")
    print("3. Verify SMS delivery via Message Central")
    print("4. Test mobile app integration")

def test_database_connection():
    """Test database connection and OTP table"""
    print("\n🗄️ Testing Database Connection...")
    try:
        # Import database manager
        import sys
        import os
        sys.path.append(os.path.dirname(__file__))
        
        try:
            from backend.database.manager import db
        except ImportError:
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        # Test connection
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM otp_verifications")
                count = cursor.fetchone()[0]
                print(f"   ✅ Database connected! OTP records: {count}")
                
                # Check recent OTPs
                cursor.execute("""
                    SELECT phone_number, status, created_at 
                    FROM otp_verifications 
                    ORDER BY created_at DESC 
                    LIMIT 5
                """)
                recent_otps = cursor.fetchall()
                
                if recent_otps:
                    print("   📱 Recent OTPs:")
                    for otp in recent_otps:
                        phone, status, created = otp
                        print(f"      {phone}: {status} at {created}")
                else:
                    print("   📱 No recent OTPs found")
                    
    except Exception as e:
        print(f"   ❌ Database error: {e}")

def main():
    """Main test function"""
    print(f"🚀 AstroVoice OTP Integration Test")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Backend URL: {BASE_URL}")
    print(f"📱 Test Phone: {TEST_PHONE}")
    
    # Test database first
    test_database_connection()
    
    # Test OTP flow
    test_otp_flow()
    
    print("\n💡 Tips:")
    print("- Check backend logs: tail -f backend.log")
    print("- View OTP in database: python3 view_user_data.py")
    print("- Test mobile app: cd mobile && npm start")

if __name__ == "__main__":
    main()
