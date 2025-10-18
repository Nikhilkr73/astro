#!/usr/bin/env python3
"""
Message Central Authentication Test Script
Tests the authentication flow with your credentials
"""

import requests
import base64
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_message_central_auth():
    """Test Message Central authentication"""
    print("🧪 Testing Message Central Authentication")
    print("=" * 50)
    
    # Configuration
    customer_id = os.getenv('MESSAGE_CENTRAL_CUSTOMER_ID', 'C-F9FB8D3FEFDB406')
    password = os.getenv('MESSAGE_CENTRAL_PASSWORD', 'kundli@123')
    country = os.getenv('MESSAGE_CENTRAL_COUNTRY', 'IN')
    email = os.getenv('MESSAGE_CENTRAL_EMAIL', 'kundli.ai30@gmail.com')
    
    if not password:
        print("❌ MESSAGE_CENTRAL_PASSWORD not set in .env file")
        print("Please add your Message Central password to .env file:")
        print("MESSAGE_CENTRAL_PASSWORD=your_password_here")
        return False
    
    print(f"📋 Configuration:")
    print(f"   Customer ID: {customer_id}")
    print(f"   Country: {country}")
    print(f"   Email: {email}")
    print(f"   Password: {'*' * len(password)}")
    
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
        
        if auth_response.status_code == 200:
            auth_data = auth_response.json()
            auth_token = auth_data.get('authToken')
            
            if auth_token:
                print(f"✅ Authentication successful!")
                print(f"   Auth Token: {auth_token[:20]}...")
                
                # Step 2: Test OTP sending
                print(f"\n📤 Step 2: Testing OTP sending...")
                
                test_phone = "9876543210"  # Use your test phone number
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
                
                print(f"   Sending OTP to: +91{test_phone}")
                print(f"   URL: {otp_url}")
                print(f"   Params: {otp_params}")
                
                otp_response = requests.post(otp_url, params=otp_params, headers=headers, timeout=10)
                
                print(f"   Status Code: {otp_response.status_code}")
                print(f"   Response: {otp_response.text}")
                
                if otp_response.status_code == 200:
                    otp_data = otp_response.json()
                    verification_id = otp_data.get('verificationId')
                    print(f"✅ OTP sent successfully!")
                    print(f"   Verification ID: {verification_id}")
                    return True
                else:
                    print(f"❌ OTP sending failed")
                    return False
            else:
                print(f"❌ No auth token in response: {auth_data}")
                return False
        else:
            print(f"❌ Authentication failed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Message Central Authentication Test")
    print("📅 Testing with your credentials...")
    print()
    
    success = test_message_central_auth()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Authentication test successful!")
        print("\n📋 Next steps:")
        print("1. Update your .env file with the correct credentials")
        print("2. Test the full OTP flow: python3 test_otp_integration.py")
        print("3. Start the backend: python3 -m backend.main")
    else:
        print("❌ Authentication test failed!")
        print("\n🔧 Troubleshooting:")
        print("1. Check your password in .env file")
        print("2. Verify your email address")
        print("3. Ensure your Message Central account is active")
        print("4. Contact Message Central support if needed")

if __name__ == "__main__":
    main()
