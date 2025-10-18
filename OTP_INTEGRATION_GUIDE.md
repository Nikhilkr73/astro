# 🔐 OTP Integration Guide - AstroVoice

**Last Updated:** October 18, 2025  
**Status:** ✅ Complete Implementation Ready for Testing

---

## 📋 Overview

This guide documents the complete OTP (One-Time Password) integration for AstroVoice phone number authentication using Message Central SMS service.

### ✅ What's Implemented

1. **Backend OTP Endpoints** - FastAPI endpoints for sending and verifying OTPs
2. **Database Schema** - PostgreSQL table for OTP storage and verification tracking
3. **Message Central Integration** - SMS delivery via Message Central API
4. **Mobile App Integration** - React Native screens calling real OTP APIs
5. **Security Features** - Rate limiting, expiration, and validation
6. **Error Handling** - Comprehensive error handling and user feedback

---

## 🏗️ Architecture

### Backend Components

```
backend/api/mobile_endpoints.py
├── /api/auth/send-otp     # Send OTP to phone number
├── /api/auth/verify-otp   # Verify OTP code
└── send_otp_via_message_central()  # Message Central integration

backend/database/schema.sql
└── otp_verifications table  # OTP storage and tracking
```

### Mobile Components

```
mobile/src/screens/PhoneAuthScreen.tsx
├── handleMobileSubmit()   # Send OTP API call
├── handleOtpSubmit()       # Verify OTP API call
└── handleResendOtp()       # Resend OTP API call

mobile/src/services/apiService.ts
├── sendOTP()              # OTP sending service
└── verifyOTP()            # OTP verification service
```

---

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Message Central OTP Configuration
MESSAGE_CENTRAL_API_KEY=your_message_central_api_key_here
MESSAGE_CENTRAL_CUSTOMER_ID=C-F9FB8D3FEFDB406
MESSAGE_CENTRAL_COUNTRY=IN
MESSAGE_CENTRAL_EMAIL=your_email@example.com
MESSAGE_CENTRAL_SENDER_ID=ASTROV
```

### Message Central Setup

1. **Sign up** at [Message Central Console](https://console.messagecentral.com/signUp)
2. **Get API Key** from your account dashboard under "API Credentials"
3. **Configure Customer ID** (already set: `C-F9FB8D3FEFDB406`)
4. **Add credentials** to `.env` file

### Message Central API Flow

The integration uses Message Central's two-step authentication:

1. **Generate Auth Token**:
   - GET `auth/v1/authentication/token`
   - Parameters: `customerId`, `country`, `email`, `key` (Base64 encoded API key), `scope`
   - Returns: `authToken` for subsequent requests

2. **Send OTP**:
   - POST `/verification/v2/verification/send`
   - Parameters: `customerId`, `countryCode`, `otpLength`, `mobileNumber`, `flowType`
   - Headers: `Authorization: Bearer {authToken}`
   - Returns: `verificationId` for verification

3. **Verify OTP**:
   - GET `/verification/v2/verification/validateOtp`
   - Parameters: `customerId`, `code`, `verificationId`
   - Headers: `Authorization: Bearer {authToken}`

---

## 📊 Database Schema

### OTP Verifications Table

```sql
CREATE TABLE IF NOT EXISTS otp_verifications (
    verification_id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'sent', -- sent, verified, expired, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    
    -- Rate limiting and security
    attempts INTEGER DEFAULT 0,
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT valid_phone CHECK (phone_number ~ '^[0-9]{10}$'),
    CONSTRAINT valid_otp CHECK (otp_code ~ '^[0-9]{6}$'),
    CONSTRAINT valid_status CHECK (status IN ('sent', 'verified', 'expired', 'failed'))
);
```

### Indexes

```sql
CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX idx_otp_status ON otp_verifications(status);
CREATE INDEX idx_otp_created_at ON otp_verifications(created_at DESC);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);
```

---

## 🚀 API Endpoints

### 1. Send OTP

**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "phone_number": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expires_in": 300
}
```

**Error Responses:**
- `400` - Invalid phone number format
- `429` - Too many OTP requests (rate limited)
- `500` - Server error

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "phone_number": "9876543210",
  "otp_code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone number verified successfully"
}
```

**Error Responses:**
- `400` - Invalid OTP format, OTP expired, OTP already used
- `500` - Server error

---

## 🔒 Security Features

### Rate Limiting
- **Maximum 3 OTPs** per phone number per hour
- **429 status code** when limit exceeded
- **Retry-After header** indicates wait time

### OTP Expiration
- **5 minutes** default expiration time
- **Automatic cleanup** of expired OTPs
- **Status tracking** (sent, verified, expired, failed)

### Validation
- **Phone number format** validation (10 digits)
- **OTP format** validation (6 digits)
- **Status checks** prevent reuse of verified OTPs

### Database Security
- **Constraints** ensure data integrity
- **Indexes** for performance
- **Metadata field** for future extensions

---

## 📱 Mobile App Integration

### PhoneAuthScreen Updates

The `PhoneAuthScreen.tsx` has been updated to:

1. **Call real OTP APIs** instead of simulation
2. **Handle API errors** with user-friendly messages
3. **Show loading states** during API calls
4. **Implement resend functionality** with rate limiting
5. **Display proper error messages** for different scenarios

### API Service Integration

The `apiService.ts` includes:

```typescript
// Send OTP
sendOTP: async (phoneNumber: string): Promise<OTPResponse>

// Verify OTP  
verifyOTP: async (phoneNumber: string, otpCode: string): Promise<OTPResponse>
```

### Error Handling

The mobile app handles these error scenarios:

- **Network errors** - Shows "Please try again" message
- **Rate limiting** - Shows wait time in minutes
- **Invalid OTP** - Shows specific error message
- **Expired OTP** - Prompts to request new OTP
- **Server errors** - Shows generic error message

---

## 🧪 Testing

### Backend Testing

Test the OTP endpoints using curl:

```bash
# Send OTP
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9876543210"}'

# Verify OTP
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9876543210", "otp_code": "123456"}'
```

### Mobile Testing

1. **Start backend server:**
   ```bash
   source venv/bin/activate
   python3 -m backend.main
   ```

2. **Start mobile app:**
   ```bash
   cd mobile
   npm start
   ```

3. **Test flow:**
   - Enter valid 10-digit phone number
   - Tap "Continue" to send OTP
   - Check phone for SMS (or check backend logs for OTP)
   - Enter 6-digit OTP
   - Tap "Verify & Continue"

### Database Testing

Check OTP records in database:

```sql
-- View recent OTPs
SELECT phone_number, otp_code, status, expires_at, created_at 
FROM otp_verifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Check rate limiting
SELECT phone_number, COUNT(*) as otp_count
FROM otp_verifications 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY phone_number;
```

---

## 🔄 Message Central Integration

### API Configuration

The Message Central integration includes:

```python
async def send_otp_via_message_central(phone_number: str, otp_code: str) -> bool:
    """
    Send OTP via Message Central API.
    Returns True if successful, False otherwise.
    """
    # API configuration
    api_url = "https://api.messagecentral.com/sms/send"
    payload = {
        "to": f"+91{phone_number}",
        "message": f"Your AstroVoice verification code is {otp_code}. Valid for 5 minutes. Do not share this code.",
        "sender_id": message_central_sender_id
    }
```

### Fallback Mechanism

If Message Central fails:
1. **OTP is still generated** and stored in database
2. **Backend logs the OTP** for testing purposes
3. **User can still verify** using the logged OTP
4. **No user-facing error** - seamless fallback

### Message Format

The SMS message sent to users:

```
Your AstroVoice verification code is 123456. Valid for 5 minutes. Do not share this code.
```

---

## 📈 Monitoring & Analytics

### Backend Logs

The OTP system logs:

- **OTP generation** with phone number (masked)
- **SMS sending** success/failure
- **OTP verification** attempts and results
- **Rate limiting** triggers
- **Error conditions** with details

### Database Analytics

Track OTP usage:

```sql
-- Daily OTP statistics
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_otps,
    COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_otps,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_otps
FROM otp_verifications 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Success rate
SELECT 
    COUNT(CASE WHEN status = 'verified' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM otp_verifications 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Message Central API Key Not Set**
   - **Error:** "Message Central API key not configured"
   - **Solution:** Add `MESSAGE_CENTRAL_API_KEY` to `.env` file

2. **Rate Limiting Triggered**
   - **Error:** "Too many OTP requests"
   - **Solution:** Wait for the specified time or check rate limiting logic

3. **Database Connection Issues**
   - **Error:** Database connection failures
   - **Solution:** Ensure PostgreSQL is running and accessible

4. **Mobile App Not Connecting**
   - **Error:** Network errors in mobile app
   - **Solution:** Check backend server is running on correct port

### Debug Commands

```bash
# Check backend health
curl http://localhost:8000/health

# View recent logs
tail -f backend.log

# Check database connection
python3 -c "from backend.database.manager import db; print('DB OK' if db else 'DB Error')"

# Test OTP endpoint
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9876543210"}'
```

---

## 🔮 Future Enhancements

### Planned Features

1. **Voice OTP** - Send OTP via voice call
2. **WhatsApp OTP** - Send OTP via WhatsApp
3. **Email OTP** - Send OTP via email
4. **Biometric Authentication** - Fingerprint/face recognition
5. **Social Login** - Google/Apple sign-in integration

### Performance Optimizations

1. **Redis Caching** - Cache OTPs for faster verification
2. **Queue System** - Async SMS sending with Celery
3. **Database Partitioning** - Partition OTP table by date
4. **CDN Integration** - Faster API responses

---

## 📚 Related Documentation

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Overall project status
- [PROJECT_SPEC.md](./docs/architecture/PROJECT_SPEC.md) - Complete project specification
- [QUICK_START.md](./docs/getting-started/QUICK_START.md) - Setup guide
- [API Documentation](./docs/api/) - Complete API documentation

---

## ✅ Implementation Checklist

- [x] Backend OTP endpoints created
- [x] Database schema updated with OTP table
- [x] Message Central API integration
- [x] Mobile app updated to use real APIs
- [x] Security features implemented (rate limiting, expiration)
- [x] Error handling and user feedback
- [x] Documentation created
- [ ] End-to-end testing with real phone numbers
- [ ] Production deployment
- [ ] Monitoring and analytics setup

---

**Next Steps:**
1. Configure Message Central API credentials
2. Test with real phone numbers
3. Deploy to production
4. Monitor OTP success rates
5. Optimize based on usage patterns

---

*This OTP integration provides a secure, scalable, and user-friendly phone number authentication system for AstroVoice.*
