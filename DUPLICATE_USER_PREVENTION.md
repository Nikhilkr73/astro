# Duplicate User Prevention Guide

**CRITICAL ISSUE**: Duplicate user creation when OTP verification creates UUID user but registration creates old format user.

## Root Cause Analysis

### The Problem
1. **OTP Verification** creates user with UUID format (e.g., `4e4deba3-3bf8-4a05-83cd-a0ad7c5a529c`)
2. **Registration** creates new user with old format (e.g., `user_1ac3a526e4bb`) 
3. **Result**: Two users with same phone number in database

### Why This Happens
- Mobile app doesn't send `user_id` from OTP verification to registration API
- Backend generates new `user_id` instead of using existing UUID
- This creates duplicate users with same phone number

## Prevention Measures

### 1. Mobile App (CRITICAL FIXES)

**File: `mobile/src/services/apiService.ts`**
```typescript
export interface UserRegistrationData {
  user_id?: string; // CRITICAL: Must include user_id from OTP verification to prevent duplicate users
  phone_number: string;
  full_name: string;
  date_of_birth: string; // DD/MM/YYYY
  time_of_birth: string; // HH:MM AM/PM
  place_of_birth: string;
  gender?: string;
}
```

**File: `mobile/src/screens/OnboardingFormScreen.tsx`**
```typescript
// CRITICAL: Must pass user_id from OTP verification to prevent duplicate user creation
// The backend expects user_id to link registration with existing OTP-verified user
response = await apiService.registerUser({
  user_id: userId, // CRITICAL: This prevents duplicate user creation
  phone_number: phoneNumber,
  ...userData,
});
```

### 2. Backend API (CRITICAL LOGGING)

**File: `backend/api/mobile_endpoints.py`**
```python
class UserRegistration(BaseModel):
    """User registration model - CRITICAL: user_id must be provided from OTP verification"""
    user_id: Optional[str] = None  # CRITICAL: Must be provided to prevent duplicate users
    # ... other fields
```

```python
# CRITICAL: Use provided user_id from OTP verification to prevent duplicate users
# If user_id is not provided, it means mobile app didn't send it (regression risk)
if not user.user_id:
    print("⚠️ CRITICAL: No user_id provided - this will create a duplicate user!")
    print("⚠️ Mobile app must send user_id from OTP verification")
    print("⚠️ Generating new user_id - this creates duplicate user issue")
    user.user_id = db.generate_user_id()
else:
    print(f"✅ Using provided user_id from OTP verification: {user.user_id}")
```

## Testing Checklist

### Before Deploying Any Changes:
- [ ] Verify `UserRegistrationData` interface includes `user_id?: string`
- [ ] Verify registration call passes `user_id: userId`
- [ ] Test complete OTP → Registration flow
- [ ] Check database for single user per phone number
- [ ] Verify backend logs show "Using provided user_id from OTP verification"

### Database Verification Query:
```sql
SELECT 
    'USER:' as type, u.user_id, u.full_name, u.phone_number, u.birth_date, u.gender, u.created_at
FROM users u
WHERE u.phone_number = 'TEST_PHONE_NUMBER'
```

**Expected Result**: Only ONE user should exist per phone number.

## Regression Prevention Rules

### 1. NEVER Remove user_id from Registration
- The `user_id` field is CRITICAL for linking OTP verification with registration
- Removing it will ALWAYS cause duplicate users

### 2. Always Test Complete Flow
- OTP verification → Registration → Database check
- Don't test components in isolation

### 3. Monitor Backend Logs
- Look for "CRITICAL: No user_id provided" warnings
- These indicate mobile app regression

### 4. Database Validation
- Always run verification query after changes
- Single user per phone number is MANDATORY

## Common Regression Scenarios

### Scenario 1: Interface Update
**Problem**: Updating `UserRegistrationData` interface and forgetting `user_id`
**Prevention**: Always include `user_id?: string` in interface

### Scenario 2: Registration Call Refactor
**Problem**: Refactoring registration call and removing `user_id` parameter
**Prevention**: Always pass `user_id: userId` in registration call

### Scenario 3: Backend Model Changes
**Problem**: Modifying `UserRegistration` model and making `user_id` required
**Prevention**: Keep `user_id: Optional[str] = None` for backward compatibility

## Emergency Fix for Existing Duplicates

If duplicates already exist, use this cleanup script:

```sql
-- Find duplicates
SELECT phone_number, COUNT(*) as count
FROM users 
GROUP BY phone_number 
HAVING COUNT(*) > 1;

-- Keep UUID users, delete old format users
DELETE FROM users 
WHERE user_id LIKE 'user_%' 
AND phone_number IN (
    SELECT phone_number 
    FROM users 
    WHERE user_id LIKE 'user_%'
    AND phone_number IN (
        SELECT phone_number 
        FROM users 
        GROUP BY phone_number 
        HAVING COUNT(*) > 1
    )
);
```

## Last Updated
October 19, 2025 - Fixed duplicate user creation regression

## Status
✅ FIXED - All critical comments and safeguards added
