# Test Phone Number System for Beta Testing

This system provides test phone numbers with bypass OTPs to avoid Message Central costs during beta testing.

## 🧪 Test Phone Numbers

### **Primary Test Numbers**
| Phone Number | OTP Code | Purpose | Notes |
|--------------|----------|---------|-------|
| `9999999999` | `112233` | Main test user | Primary testing account |
| `8888888888` | `112233` | Secondary test user | Backup testing account |
| `7777777777` | `112233` | Wallet testing | For wallet feature testing |
| `6666666666` | `112233` | Chat testing | For chat session testing |
| `5555555555` | `112233` | Voice testing | For voice call testing |

### **Special Test Numbers**
| Phone Number | OTP Code | Purpose | Notes |
|--------------|----------|---------|-------|
| `1111111111` | `000000` | Admin test | For admin operations |
| `2222222222` | `999999` | Error testing | For error scenario testing |
| `3333333333` | `123456` | Bonus testing | For first-time bonus testing |

## 🔧 Implementation

The system automatically detects test phone numbers and bypasses Message Central API calls, saving costs during beta testing.

### **Test Number Detection**
- Numbers starting with `9`, `8`, `7`, `6`, `5` (first digit) are treated as test numbers
- Special numbers `1111111111`, `2222222222`, `3333333333` are also test numbers
- All test numbers use the same OTP: `112233` (except special cases)

### **Bypass Logic**
1. **Test Number Detection**: Check if phone number matches test pattern
2. **Skip Message Central**: Don't call expensive Message Central API
3. **Store OTP**: Store OTP in database for verification
4. **Log Test Mode**: Clear logging that test mode is active

## 💰 Cost Savings

- **Message Central Cost**: ~₹0.50-1.00 per OTP
- **Test OTPs per day**: ~50-100 during beta
- **Daily Savings**: ₹25-100
- **Monthly Savings**: ₹750-3000

## 🚀 Usage

### **For Developers**
```bash
# Use any test phone number
Phone: 9999999999
OTP: 112233

# Or use special test numbers
Phone: 1111111111
OTP: 000000
```

### **For QA Testing**
```bash
# Different test accounts for different features
Wallet Testing: 7777777777 (OTP: 112233)
Chat Testing: 6666666666 (OTP: 112233)
Voice Testing: 5555555555 (OTP: 112233)
```

## 🔒 Security Notes

- **Test numbers only work in development/beta environment**
- **Production environment will use real Message Central**
- **Test OTPs are logged for debugging purposes**
- **No real SMS sent for test numbers**

## 📱 Mobile App Integration

The mobile app will work seamlessly with test numbers:
- Enter test phone number
- Enter corresponding OTP
- Complete authentication flow
- Access all app features normally

## 🛠️ Configuration

Test mode is controlled by environment variables:
- `TEST_MODE_ENABLED=true` - Enable test phone numbers
- `MESSAGE_CENTRAL_ENABLED=false` - Disable Message Central for testing
- `BYPASS_OTP_COST=true` - Skip expensive OTP services

---

**Last Updated:** January 21, 2025  
**Status:** ✅ Ready for Implementation
