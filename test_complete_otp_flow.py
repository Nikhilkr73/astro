#!/usr/bin/env python3
"""
Complete Message Central OTP Integration Test
Tests authentication, OTP sending, and verification with detailed logging
"""

import requests
import base64
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_complete_otp_flow():
    """Test complete OTP flow with Message Central"""
    print("🚀 Complete Message Central OTP Integration Test")
    print("=" * 60)
    
    # Configuration
    customer_id = os.getenv('MESSAGE_CENTRAL_CUSTOMER_ID', 'C-F9FB8D3FEFDB406')
    password = os.getenv('MESSAGE_CENTRAL_PASSWORD', 'kundli@123')
    country = os.getenv('MESSAGE_CENTRAL_COUNTRY', 'IN')
    email = os.getenv('MESSAGE_CENTRAL_EMAIL', 'kundli.ai30@gmail.com')
    test_phone = "9876543211"  # Change this to your test phone number
    
    print(f"📋 Configuration:")
    print(f"   Customer ID: {customer_id}")
    print(f"   Country: {country}")
    print(f"   Email: {email}")
    print(f"   Password: {'*' * len(password)}")
    print(f"   Test Phone: +91{test_phone}")
    
    # Step 1: Generate authentication token
    print(f"\n🔐 Step 1: Generating authentication token...")
    
    auth_url = "https://cpaas.messagecentral.com/auth/v1/authentication/token"
    
    # Encode password in Base64
    encoded_password = base64.b64encode(password.encode()).decode()
    
    auth_params = {
        "customerId": customer_id,
        "key": encoded_password,
        "scope": "NEW",
        "country": country,
        "email": email
    }
    
    print(f"   URL: {auth_url}")
    print(f"   Params: customerId={customer_id}, country={country}, email={email}")
    
    try:
        auth_response = requests.get(
            auth_url, 
            params=auth_params, 
            headers={'accept': '*/*'}, 
            timeout=10
        )
        
        print(f"   Status Code: {auth_response.status_code}")
        print(f"   Response: {auth_response.text}")
        
        if auth_response.status_code != 200:
            print(f"❌ Authentication failed!")
            return False
        
        auth_data = auth_response.json()
        auth_token = auth_data.get('token')  # Message Central uses 'token' not 'authToken'
        
        if not auth_token:
            print(f"❌ No auth token in response: {auth_data}")
            return False
        
        print(f"✅ Authentication successful!")
        print(f"   Auth Token: {auth_token[:20]}...")
        
        # Step 2: Send OTP
        print(f"\n📤 Step 2: Sending OTP...")
        
        otp_url = "https://cpaas.messagecentral.com/verification/v3/send"
        
        # Use query parameters as per documentation
        otp_params = {
            "countryCode": "91",  # India country code
            "flowType": "SMS",
            "mobileNumber": test_phone,
            "otpLength": 6
        }
        
        headers = {
            "authToken": auth_token,
            "accept": "*/*"
        }
        
        print(f"   URL: {otp_url}")
        print(f"   Params: {otp_params}")
        print(f"   Headers: authToken={auth_token[:20]}...")
        
        otp_response = requests.post(otp_url, params=otp_params, headers=headers, timeout=10)
        
        print(f"   Status Code: {otp_response.status_code}")
        print(f"   Response: {otp_response.text}")
        
        if otp_response.status_code != 200:
            print(f"❌ OTP sending failed!")
            return False
        
        otp_data = otp_response.json()
        verification_id = otp_data.get('data', {}).get('verificationId')
        
        if not verification_id:
            print(f"❌ No verification ID in response: {otp_data}")
            return False
        
        print(f"✅ OTP sent successfully!")
        print(f"   Verification ID: {verification_id}")
        
        # Step 3: Verify OTP (using a test OTP)
        print(f"\n🔍 Step 3: Testing OTP verification...")
        
        test_otp = "123456"  # This will fail, but we can test the API call
        verify_url = "https://cpaas.messagecentral.com/verification/v3/validateOtp"
        
        verify_params = {
            "verificationId": verification_id,
            "code": test_otp
        }
        
        headers = {
            "authToken": auth_token,
            "accept": "*/*"
        }
        
        print(f"   URL: {verify_url}")
        print(f"   Params: {verify_params}")
        print(f"   Headers: authToken={auth_token[:20]}...")
        
        verify_response = requests.get(verify_url, params=verify_params, headers=headers, timeout=10)
        
        print(f"   Status Code: {verify_response.status_code}")
        print(f"   Response: {verify_response.text}")
        
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            response_code = verify_data.get('responseCode')
            message = verify_data.get('message')
            
            if response_code == 200:
                verification_status = verify_data.get('data', {}).get('verificationStatus')
                print(f"✅ OTP verification successful!")
                print(f"   Verification Status: {verification_status}")
            else:
                print(f"⚠️ OTP verification failed (expected with test OTP)")
                print(f"   Response Code: {response_code}")
                print(f"   Message: {message}")
        else:
            print(f"⚠️ OTP verification failed (expected with test OTP)")
        
        print(f"\n🎉 Complete OTP flow test completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_backend_integration():
    """Test the backend OTP endpoints"""
    print(f"\n🔧 Testing Backend Integration")
    print("=" * 40)
    
    backend_url = "http://localhost:8000"
    test_phone = "9876543211"
    
    # Test 1: Send OTP
    print(f"📤 Test 1: Sending OTP via backend...")
    
    send_otp_url = f"{backend_url}/auth/send-otp"
    send_otp_payload = {
        "phone_number": test_phone
    }
    
    try:
        send_response = requests.post(send_otp_url, json=send_otp_payload, timeout=30)
        print(f"   Status Code: {send_response.status_code}")
        print(f"   Response: {send_response.text}")
        
        if send_response.status_code == 200:
            print(f"✅ Backend OTP send successful!")
            
            # Test 2: Verify OTP (with test OTP)
            print(f"\n🔍 Test 2: Verifying OTP via backend...")
            
            verify_otp_url = f"{backend_url}/auth/verify-otp"
            verify_otp_payload = {
                "phone_number": test_phone,
                "otp_code": "123456"  # This will fail, but tests the API
            }
            
            verify_response = requests.post(verify_otp_url, json=verify_otp_payload, timeout=30)
            print(f"   Status Code: {verify_response.status_code}")
            print(f"   Response: {verify_response.text}")
            
            if verify_response.status_code in [200, 400]:  # 400 is expected for wrong OTP
                print(f"✅ Backend OTP verification API working!")
            else:
                print(f"⚠️ Backend OTP verification returned unexpected status")
        else:
            print(f"❌ Backend OTP send failed!")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Backend not running! Start it with: python3 -m backend.main")
    except Exception as e:
        print(f"❌ Backend test error: {e}")

def main():
    """Main function"""
    print("🧪 Message Central OTP Integration Test Suite")
    print("📅 Testing with your credentials...")
    print()
    
    # Test 1: Direct Message Central API
    print("=" * 60)
    print("TEST 1: Direct Message Central API")
    print("=" * 60)
    success1 = test_complete_otp_flow()
    
    # Test 2: Backend Integration
    print("\n" + "=" * 60)
    print("TEST 2: Backend Integration")
    print("=" * 60)
    test_backend_integration()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    if success1:
        print("🎉 Message Central API test successful!")
        print("\n📋 Next steps:")
        print("1. Update your .env file with the credentials:")
        print("   MESSAGE_CENTRAL_PASSWORD=kundli@123")
        print("   MESSAGE_CENTRAL_EMAIL=kundli.ai30@gmail.com")
        print("2. Start the backend: python3 -m backend.main")
        print("3. Test the mobile app OTP flow")
        print("4. Check logs: tail -f backend.log")
    else:
        print("❌ Message Central API test failed!")
        print("\n🔧 Troubleshooting:")
        print("1. Check your password and email")
        print("2. Verify your Message Central account is active")
        print("3. Contact Message Central support if needed")

if __name__ == "__main__":
    main()
