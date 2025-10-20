"""
Mobile App API Endpoints
Provides REST API endpoints for mobile app integration
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
import string
import os
import requests
import json
import base64

# Import services
try:
    from backend.services.astrologer_service import astrologer_manager
    from backend.database.manager import DatabaseManager
except ImportError:
    from astrologer_manager import astrologer_manager
    from database.manager import DatabaseManager

# Initialize database manager
db = DatabaseManager()

# Create router
router = APIRouter(prefix="/api", tags=["mobile"])


# ============================================================================
# Pydantic Models
# ============================================================================

class AstrologerResponse(BaseModel):
    """Astrologer data model for API response"""
    astrologer_id: str
    name: str
    display_name: str
    speciality: str
    language: str
    gender: str
    voice_id: str
    rating: float = 4.8
    total_consultations: int = 0
    total_reviews: int = 0
    experience_years: int = 10
    price_per_minute: float = 20.0
    is_available: bool = True
    greeting: Optional[str] = None
    expertise_keywords: List[str] = []


class WalletResponse(BaseModel):
    """Wallet data model"""
    wallet_id: str
    user_id: str
    balance: float
    currency: str = "INR"
    last_recharge: Optional[str] = None


class UserRegistration(BaseModel):
    """User registration model - CRITICAL: user_id must be provided from OTP verification"""
    user_id: Optional[str] = None  # CRITICAL: Must be provided to prevent duplicate users
    email: Optional[str] = None
    phone_number: Optional[str] = None
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    time_of_birth: Optional[str] = None
    place_of_birth: Optional[str] = None
    gender: Optional[str] = None
    language_preference: Optional[str] = 'hi'  # Default to Hindi instead of None


class OTPRequest(BaseModel):
    """OTP request model"""
    phone_number: str


class OTPVerification(BaseModel):
    """OTP verification model"""
    phone_number: str
    otp_code: str


class OTPResponse(BaseModel):
    """OTP response model"""
    success: bool
    message: str
    expires_in: Optional[int] = None  # seconds
    retry_after: Optional[int] = None  # seconds for rate limiting
    user_id: Optional[str] = None  # User ID after verification
    profile_complete: Optional[bool] = None  # Profile completion status
    missing_fields: Optional[List[str]] = None  # Fields that need to be filled


# ============================================================================
# Astrologer Endpoints
# ============================================================================

@router.get("/astrologers")
async def get_astrologers(
    language: Optional[str] = None,
    speciality: Optional[str] = None,
    active_only: bool = True
):
    """
    Get list of all astrologers - mobile optimized format
    
    Query Parameters:
    - language: Filter by language (Hindi/English)
    - speciality: Filter by speciality
    - active_only: Only return active astrologers (default: True)
    """
    try:
        print("🔮 Fetching astrologers for mobile app...")
        
        # Get astrologers from manager
        astrologers = astrologer_manager.get_all_astrologers()
        
        # Apply filters
        if language:
            astrologers = [a for a in astrologers if a.get('language') == language]
        
        if speciality:
            astrologers = [a for a in astrologers if a.get('speciality') == speciality]
        
        if active_only:
            astrologers = [a for a in astrologers if a.get('status') == 'active']
        
        # Transform to mobile app format
        mobile_astrologers = []
        for i, astrologer in enumerate(astrologers):
            # Map speciality to mobile category
            category_map = {
                "Vedic Marriage & Relationship Remedies": "Love",
                "Career and Growth Astrology": "Career", 
                "Love and Emotional Compatibility": "Love"
            }
            
            mobile_astrologer = {
                "id": i + 1,  # Convert to number for mobile
                "name": astrologer.get('name', 'Unknown'),
                "category": category_map.get(astrologer.get('speciality', ''), "General"),
                "rating": astrologer.get('rating', 4.8),
                "reviews": astrologer.get('total_reviews', 0),  # Map field name
                "experience": f"{astrologer.get('experience_years', 10)} years",  # Convert to string
                "languages": [astrologer.get('language', 'Hindi')],  # Convert to array
                "isOnline": astrologer.get('status') == 'active',  # Map field name
                "image": None  # No image to avoid external URL issues
            }
            mobile_astrologers.append(mobile_astrologer)
        
        response = {
            "success": True,
            "count": len(mobile_astrologers),
            "astrologers": mobile_astrologers
        }
        
        print(f"✅ Returning {response['count']} astrologers in mobile format")
        return response
        
    except Exception as e:
        print(f"❌ Error getting astrologers: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/astrologers/{astrologer_id}", response_model=AstrologerResponse)
async def get_astrologer(astrologer_id: str):
    """Get details of a specific astrologer"""
    try:
        astro = astrologer_manager.get_astrologer_by_id(astrologer_id)
        
        if not astro:
            raise HTTPException(status_code=404, detail="Astrologer not found")
        
        return AstrologerResponse(
            astrologer_id=astro.get('astrologer_id', ''),
            name=astro.get('name', ''),
            display_name=astro.get('name', ''),
            speciality=astro.get('speciality', ''),
            language=astro.get('language', 'English'),
            gender=astro.get('gender', 'Male'),
            voice_id=astro.get('voice_id', 'alloy'),
            rating=astro.get('rating', 4.8),
            total_consultations=astro.get('total_consultations', 0),
            total_reviews=astro.get('total_reviews', 0),
            experience_years=astro.get('experience_years', 10),
            price_per_minute=astro.get('price_per_minute', 20.0),
            is_available=astro.get('status') == 'active',
            greeting=astro.get('greeting'),
            expertise_keywords=astro.get('expertise_keywords', [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting astrologer: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# User Endpoints
# ============================================================================

@router.post("/users/register")
async def register_user(user: UserRegistration):
    """
    Register a new user or update existing.
    Saves user data to database and creates wallet with welcome bonus.
    """
    try:
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            # Fallback to root database_manager
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        # CRITICAL: Use provided user_id from OTP verification to prevent duplicate users
        # If user_id is not provided, it means mobile app didn't send it (regression risk)
        if not user.user_id:
            print("⚠️ CRITICAL: No user_id provided - this will create a duplicate user!")
            print("⚠️ Mobile app must send user_id from OTP verification")
            print("⚠️ Generating new user_id - this creates duplicate user issue")
            user.user_id = db.generate_user_id()
        else:
            print(f"✅ Using provided user_id from OTP verification: {user.user_id}")
        
        print(f"📝 Registering user: {user.user_id}")
        print(f"   Name: {user.full_name}")
        print(f"   Phone: {user.phone_number}")
        print(f"   DOB: {user.date_of_birth}")
        print(f"   Time: {user.time_of_birth}")
        print(f"   Place: {user.place_of_birth}")
        print(f"   Gender: {user.gender}")
        print(f"   Language: {user.language_preference}")
        
        # Parse birth date from DD/MM/YYYY to DATE format
        birth_date = None
        if user.date_of_birth:
            try:
                from datetime import datetime as dt
                birth_date = dt.strptime(user.date_of_birth, '%d/%m/%Y').date()
            except:
                pass
        
        # Parse birth time from HH:MM AM/PM to TIME format
        birth_time = None
        if user.time_of_birth:
            try:
                from datetime import datetime as dt
                time_obj = dt.strptime(user.time_of_birth, '%I:%M %p')
                birth_time = time_obj.time()
            except:
                pass
        
        # Prepare user data for database
        user_data = {
            'user_id': user.user_id,
            'phone_number': user.phone_number,
            'full_name': user.full_name,
            'display_name': user.display_name or user.full_name,
            'email': user.email,
            'birth_date': birth_date,
            'birth_time': birth_time,
            'birth_location': user.place_of_birth,
            'birth_timezone': None,  # Could be added later
            'birth_latitude': None,  # Could be added later
            'birth_longitude': None,  # Could be added later
            'gender': user.gender,
            'language_preference': user.language_preference,  # Use the actual value from request
            'subscription_type': 'free',
            'metadata': {
                'onboarding_completed': True,
                'registration_source': 'mobile_app'
            }
        }
        
        # Save user to database
        saved_user_id = db.create_user(user_data)
        
        if not saved_user_id:
            raise Exception("Failed to save user to database")
        
        # Create wallet for user with welcome bonus
        welcome_bonus = 500.0  # ₹500 welcome bonus
        
        wallet_id = db.create_wallet(saved_user_id, initial_balance=welcome_bonus)
        
        if wallet_id:
            print(f"💰 Wallet created with ₹{welcome_bonus} welcome bonus")
            wallet_data = {
                "wallet_id": wallet_id,
                "balance": welcome_bonus,
                "currency": "INR"
            }
        else:
            # If wallet creation fails, still return success but with 0 balance
            wallet_data = {
                "wallet_id": f"wallet_{saved_user_id}",
                "balance": 0.0,
                "currency": "INR"
            }
        
        print(f"✅ User registered successfully: {saved_user_id}")
        
        return {
            "success": True,
            "user_id": saved_user_id,
            "message": "User registered successfully",
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "date_of_birth": user.date_of_birth,
            "time_of_birth": user.time_of_birth,
            "place_of_birth": user.place_of_birth,
            "gender": user.gender,
            "user": {
                "user_id": saved_user_id,
                "full_name": user.full_name,
                "display_name": user.display_name or user.full_name,
                "phone_number": user.phone_number,
                "birth_info": {
                    "date": user.date_of_birth,
                    "time": user.time_of_birth,
                    "place": user.place_of_birth
                },
                "gender": user.gender
            },
            "wallet": wallet_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error registering user: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user details with profile completion status"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT user_id, email, phone_number, full_name, display_name,
                           date_of_birth, gender, profile_picture_url, language_preference,
                           birth_date, birth_time, birth_location, birth_timezone,
                           birth_latitude, birth_longitude, preferred_astrology_system,
                           notification_preferences, subscription_type, account_status,
                           email_verified, phone_verified, created_at, updated_at, last_login_at,
                           metadata
                    FROM users 
                    WHERE user_id = %s
                """, (user_id,))
                
                result = cursor.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="User not found")
                
                # Unpack all fields
                (user_id_db, email, phone_number, full_name, display_name,
                 date_of_birth, gender, profile_picture_url, language_preference,
                 birth_date, birth_time, birth_location, birth_timezone,
                 birth_latitude, birth_longitude, preferred_astrology_system,
                 notification_preferences, subscription_type, account_status,
                 email_verified, phone_verified, created_at, updated_at, last_login_at,
                 metadata) = result
                
                # Check profile completion
                profile_complete, missing_fields = await check_profile_completion(user_id)
                
                return {
                    "user_id": user_id_db,
                    "email": email,
                    "phone_number": phone_number,
                    "full_name": full_name,
                    "display_name": display_name,
                    "date_of_birth": date_of_birth,
                    "gender": gender,
                    "profile_picture_url": profile_picture_url,
                    "language_preference": language_preference,
                    "birth_date": birth_date,
                    "birth_time": birth_time,
                    "birth_location": birth_location,
                    "birth_timezone": birth_timezone,
                    "birth_latitude": birth_latitude,
                    "birth_longitude": birth_longitude,
                    "preferred_astrology_system": preferred_astrology_system,
                    "notification_preferences": notification_preferences,
                    "subscription_type": subscription_type,
                    "account_status": account_status,
                    "email_verified": email_verified,
                    "phone_verified": phone_verified,
                    "created_at": created_at.isoformat() if created_at else None,
                    "updated_at": updated_at.isoformat() if updated_at else None,
                    "last_login_at": last_login_at.isoformat() if last_login_at else None,
                    "metadata": metadata,
                    "profile_complete": profile_complete,
                    "missing_fields": missing_fields
                }
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class UserUpdateRequest(BaseModel):
    """User profile update request model"""
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    birth_date: Optional[str] = None  # DD/MM/YYYY format
    birth_time: Optional[str] = None  # HH:MM AM/PM format
    birth_location: Optional[str] = None
    gender: Optional[str] = None
    language_preference: Optional[str] = None


@router.put("/users/{user_id}")
async def update_user_profile(user_id: str, update_data: UserUpdateRequest):
    """Update user profile"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                # Check if user exists
                cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
                if not cursor.fetchone():
                    raise HTTPException(status_code=404, detail="User not found")
                
                # Build update query dynamically based on provided fields
                update_fields = []
                update_values = []
                
                if update_data.full_name is not None:
                    update_fields.append("full_name = %s")
                    update_values.append(update_data.full_name)
                
                if update_data.display_name is not None:
                    update_fields.append("display_name = %s")
                    update_values.append(update_data.display_name)
                
                if update_data.birth_date is not None:
                    update_fields.append("birth_date = %s")
                    update_values.append(update_data.birth_date)
                
                if update_data.birth_time is not None:
                    update_fields.append("birth_time = %s")
                    update_values.append(update_data.birth_time)
                
                if update_data.birth_location is not None:
                    update_fields.append("birth_location = %s")
                    update_values.append(update_data.birth_location)
                
                if update_data.gender is not None:
                    update_fields.append("gender = %s")
                    update_values.append(update_data.gender)
                
                if update_data.language_preference is not None:
                    update_fields.append("language_preference = %s")
                    update_values.append(update_data.language_preference)
                
                if not update_fields:
                    raise HTTPException(status_code=400, detail="No fields to update")
                
                # Add updated_at timestamp
                update_fields.append("updated_at = NOW()")
                
                # Execute update
                update_query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = %s"
                update_values.append(user_id)
                
                cursor.execute(update_query, update_values)
                
                print(f"✅ Updated user profile for {user_id}")
                
                # Return updated user data
                return await get_user(user_id)
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# OTP Authentication Endpoints
# ============================================================================

@router.post("/auth/send-otp", response_model=OTPResponse)
async def send_otp(otp_request: OTPRequest):
    """
    Send OTP to phone number for verification.
    Integrates with Message Central for SMS delivery.
    """
    try:
        phone_number = otp_request.phone_number.strip()
        
        # Validate phone number format (Indian mobile numbers)
        if not phone_number.isdigit() or len(phone_number) != 10:
            raise HTTPException(status_code=400, detail="Invalid phone number format")
        
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        # Check rate limiting (max 3 OTPs per phone per hour)
        try:
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT COUNT(*) FROM otp_verifications 
                        WHERE phone_number = %s 
                        AND created_at > NOW() - INTERVAL '1 hour'
                        AND status = 'sent'
                    """, (phone_number,))
                    recent_otps = cursor.fetchone()[0]
                    
                    if recent_otps >= 3:
                        raise HTTPException(
                            status_code=429, 
                            detail="Too many OTP requests. Please try again later.",
                            headers={"Retry-After": "3600"}
                        )
        except Exception as rate_error:
            print(f"⚠️ Rate limiting check failed: {rate_error}")
            # Continue anyway for now
        
        # Generate 6-digit OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        expires_at = datetime.now() + timedelta(minutes=5)  # 5 minutes expiry
        
        print(f"📱 Sending OTP to {phone_number}: {otp_code}")
        
        # Send OTP via Message Central
        message_result = await send_otp_via_message_central(phone_number, otp_code)
        
        # Store OTP in database (always store for fallback)
        verification_id = None
        message_central_customer_id = 'C-F9FB8D3FEFDB406'  # Your customer ID
        
        if isinstance(message_result, dict) and message_result.get('success'):
            verification_id = message_result.get('verification_id')
            print(f"✅ Message Central OTP sent with verification ID: {verification_id}")
        else:
            print(f"⚠️ Message Central failed, storing OTP for testing: {otp_code}")
        
        try:
            import json  # Local import to ensure it's available
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Prepare metadata with verification_id if available
                    metadata = {}
                    if verification_id:
                        metadata['verification_id'] = verification_id
                        metadata['sent_via'] = 'message_central'
                    else:
                        metadata['sent_via'] = 'fallback'
                    
                    cursor.execute("""
                        INSERT INTO otp_verifications 
                        (phone_number, otp_code, expires_at, status, created_at, metadata, 
                         message_central_customer_id, message_central_verification_id)
                        VALUES (%s, %s, %s, 'sent', NOW(), %s, %s, %s)
                    """, (phone_number, otp_code, expires_at, json.dumps(metadata), 
                          message_central_customer_id, verification_id))
        except Exception as db_error:
            print(f"⚠️ Failed to store OTP: {db_error}")
            # Continue anyway
        
        return OTPResponse(
            success=True,
            message="OTP sent successfully",
            expires_in=30  # 30 seconds for resend timer
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending OTP: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to send OTP")


@router.post("/auth/verify-otp", response_model=OTPResponse)
async def verify_otp(otp_verification: OTPVerification):
    """
    Verify OTP code for phone number.
    Returns success if OTP is valid and not expired.
    """
    try:
        phone_number = otp_verification.phone_number.strip()
        otp_code = otp_verification.otp_code.strip()
        
        # Validate inputs
        if not phone_number.isdigit() or len(phone_number) != 10:
            raise HTTPException(status_code=400, detail="Invalid phone number format")
        
        if not otp_code.isdigit() or len(otp_code) != 6:
            raise HTTPException(status_code=400, detail="Invalid OTP format")
        
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        # Verify OTP
        try:
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT otp_code, expires_at, status, metadata, message_central_verification_id
                        FROM otp_verifications 
                        WHERE phone_number = %s 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    """, (phone_number,))
                    
                    result = cursor.fetchone()
                    
                    if not result:
                        raise HTTPException(status_code=400, detail="No OTP found for this phone number")
                    
                    stored_otp, expires_at, status, metadata, verification_id = result
                    
                    # Check if OTP is already used
                    if status == 'verified':
                        raise HTTPException(status_code=400, detail="OTP already used")
                    
                    # Check if OTP is expired
                    current_time = datetime.now()
                    print(f"🕐 Current time: {current_time}")
                    print(f"🕐 OTP expires at: {expires_at}")
                    print(f"🕐 Time difference: {(current_time - expires_at).total_seconds()} seconds")
                    
                    if current_time > expires_at:
                        print(f"❌ OTP expired! Current: {current_time}, Expires: {expires_at}")
                        raise HTTPException(status_code=400, detail="OTP expired")
                    
                    # Try Message Central verification first (if verification_id exists)
                    # verification_id is now directly from the database field
                    
                    if verification_id:
                        # Verify with Message Central
                        mc_verified = await verify_otp_via_message_central(phone_number, otp_code, verification_id)
                        if mc_verified:
                            print(f"✅ OTP verified via Message Central for {phone_number}")
                        else:
                            # Fallback to local verification
                            if stored_otp != otp_code:
                                raise HTTPException(status_code=400, detail="Invalid OTP")
                    else:
                        # Local verification only
                        if stored_otp != otp_code:
                            raise HTTPException(status_code=400, detail="Invalid OTP")
                    
                    # Create or find user for this phone number
                    cursor.execute("""
                        SELECT user_id FROM users WHERE phone_number = %s
                    """, (phone_number,))
                    
                    user_result = cursor.fetchone()
                    if user_result:
                        user_id = user_result[0]
                        print(f"📱 Found existing user: {user_id}")
                    else:
                        # Create new user
                        import uuid
                        user_id = str(uuid.uuid4())
                        cursor.execute("""
                            INSERT INTO users (user_id, phone_number, phone_verified, account_status, created_at)
                            VALUES (%s, %s, true, 'active', NOW())
                        """, (user_id, phone_number))
                        print(f"👤 Created new user: {user_id}")
                    
                    # Mark OTP as verified and link to user
                    cursor.execute("""
                        UPDATE otp_verifications 
                        SET status = 'verified', verified_at = NOW(), user_id = %s
                        WHERE phone_number = %s AND otp_code = %s
                    """, (user_id, phone_number, otp_code))
                    
                    print(f"✅ OTP verified successfully for {phone_number} and linked to user {user_id}")
                    
                    # Check profile completion status
                    profile_complete, missing_fields = await check_profile_completion(user_id)
                    
                    return OTPResponse(
                        success=True,
                        message="Phone number verified successfully",
                        user_id=user_id,
                        profile_complete=profile_complete,
                        missing_fields=missing_fields
                    )
                    
        except HTTPException:
            raise
        except Exception as db_error:
            print(f"❌ Database error during OTP verification: {db_error}")
            raise HTTPException(status_code=500, detail="Verification failed")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error verifying OTP: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="OTP verification failed")


async def check_profile_completion(user_id: str) -> tuple[bool, List[str]]:
    """
    Check if user profile is complete and return missing fields.
    Returns (is_complete, missing_fields_list)
    """
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT full_name, birth_date, birth_time, birth_location, gender
                    FROM users 
                    WHERE user_id = %s
                """, (user_id,))
                
                result = cursor.fetchone()
                if not result:
                    return False, ['user_not_found']
                
                full_name, birth_date, birth_time, birth_location, gender = result
                
                missing_fields = []
                
                if not full_name or full_name.strip() == '':
                    missing_fields.append('full_name')
                
                if not birth_date:
                    missing_fields.append('birth_date')
                
                if not birth_time:
                    missing_fields.append('birth_time')
                
                if not birth_location or birth_location.strip() == '':
                    missing_fields.append('birth_location')
                
                if not gender:
                    missing_fields.append('gender')
                
                is_complete = len(missing_fields) == 0
                print(f"📋 Profile completion check for {user_id}: complete={is_complete}, missing={missing_fields}")
                
                return is_complete, missing_fields
                
    except Exception as e:
        print(f"❌ Error checking profile completion: {e}")
        return False, ['error_checking_profile']


async def send_otp_via_message_central(phone_number: str, otp_code: str) -> bool:
    """
    Send OTP via Message Central API.
    Returns True if successful, False otherwise.
    """
    try:
        # Message Central API configuration
        message_central_password = os.getenv('MESSAGE_CENTRAL_PASSWORD')
        message_central_customer_id = os.getenv('MESSAGE_CENTRAL_CUSTOMER_ID', 'C-F9FB8D3FEFDB406')
        message_central_country = os.getenv('MESSAGE_CENTRAL_COUNTRY', 'IN')  # India
        message_central_email = os.getenv('MESSAGE_CENTRAL_EMAIL', '')
        
        if not message_central_password:
            print("⚠️ Message Central password not configured")
            return False
        
        # Step 1: Generate authentication token
        auth_url = "https://cpaas.messagecentral.com/auth/v1/authentication/token"
        
        # Encode password in Base64
        import base64
        encoded_password = base64.b64encode(message_central_password.encode()).decode()
        
        auth_params = {
            "customerId": message_central_customer_id,
            "key": encoded_password,
            "scope": "NEW",
            "country": message_central_country,
            "email": message_central_email
        }
        
        print(f"🔐 Getting auth token from Message Central...")
        
        auth_response = requests.get(auth_url, params=auth_params, headers={'accept': '*/*'}, timeout=10)
        
        if auth_response.status_code != 200:
            print(f"❌ Auth token request failed: {auth_response.status_code} - {auth_response.text}")
            return False
        
        auth_data = auth_response.json()
        auth_token = auth_data.get('token')  # Message Central uses 'token' not 'authToken'
        
        if not auth_token:
            print(f"❌ No auth token received: {auth_data}")
            return False
        
        print(f"✅ Auth token received")
        
        # Step 2: Send OTP
        otp_url = "https://cpaas.messagecentral.com/verification/v3/send"
        
        # Use query parameters as per documentation
        otp_params = {
            "countryCode": "91",  # India country code
            "flowType": "SMS",
            "mobileNumber": phone_number,
            "otpLength": 6
        }
        
        headers = {
            "authToken": auth_token,
            "accept": "*/*"
        }
        
        print(f"📤 Sending OTP via Message Central to {phone_number}")
        print(f"   URL: {otp_url}")
        print(f"   Params: {otp_params}")
        print(f"   Headers: authToken={auth_token[:20]}...")
        
        otp_response = requests.post(otp_url, params=otp_params, headers=headers, timeout=10)
        
        if otp_response.status_code == 200:
            print(f"✅ OTP sent successfully via Message Central")
            otp_data = otp_response.json()
            print(f"📋 Full response: {otp_data}")
            
            # Extract verification_id from the correct path
            verification_id = None
            print(f"🔍 Parsing response data: {otp_data}")
            
            if 'data' in otp_data and otp_data['data']:
                verification_id = otp_data['data'].get('verificationId')
                print(f"📋 Found verificationId in data: {verification_id}")
            else:
                print(f"⚠️ No 'data' field found in response")
            
            print(f"📋 Final Verification ID: {verification_id}")
            return {
                'success': True,
                'verification_id': verification_id
            }
        elif otp_response.status_code == 400:
            # Handle REQUEST_ALREADY_EXISTS error
            error_data = otp_response.json()
            if error_data.get('responseCode') == 506:  # REQUEST_ALREADY_EXISTS
                print(f"⚠️ OTP already sent to this number, using existing verification ID")
                verification_id = error_data.get('data', {}).get('verificationId')
                if verification_id:
                    print(f"📋 Using existing verification ID: {verification_id}")
                    return {
                        'success': True,
                        'verification_id': verification_id
                    }
            
            print(f"❌ Message Central OTP API error: {otp_response.status_code} - {otp_response.text}")
            return False
        else:
            print(f"❌ Message Central OTP API error: {otp_response.status_code} - {otp_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending SMS via Message Central: {e}")
        return False


async def verify_otp_via_message_central(phone_number: str, otp_code: str, verification_id: str) -> bool:
    """
    Verify OTP via Message Central API.
    Returns True if successful, False otherwise.
    """
    try:
        # Message Central API configuration
        message_central_password = os.getenv('MESSAGE_CENTRAL_PASSWORD')
        message_central_customer_id = os.getenv('MESSAGE_CENTRAL_CUSTOMER_ID', 'C-F9FB8D3FEFDB406')
        message_central_country = os.getenv('MESSAGE_CENTRAL_COUNTRY', 'IN')  # India
        message_central_email = os.getenv('MESSAGE_CENTRAL_EMAIL', '')
        
        if not message_central_password:
            print("⚠️ Message Central password not configured")
            return False
        
        # Step 1: Generate authentication token
        auth_url = "https://cpaas.messagecentral.com/auth/v1/authentication/token"
        
        # Encode password in Base64
        import base64
        encoded_password = base64.b64encode(message_central_password.encode()).decode()
        
        auth_params = {
            "customerId": message_central_customer_id,
            "key": encoded_password,
            "scope": "NEW",
            "country": message_central_country,
            "email": message_central_email
        }
        
        print(f"🔐 Getting auth token for verification...")
        
        auth_response = requests.get(auth_url, params=auth_params, headers={'accept': '*/*'}, timeout=10)
        
        if auth_response.status_code != 200:
            print(f"❌ Auth token request failed: {auth_response.status_code} - {auth_response.text}")
            return False
        
        auth_data = auth_response.json()
        auth_token = auth_data.get('token')  # Message Central uses 'token' not 'authToken'
        
        if not auth_token:
            print(f"❌ No auth token received: {auth_data}")
            return False
        
        # Step 2: Verify OTP
        verify_url = "https://cpaas.messagecentral.com/verification/v3/validateOtp"
        
        verify_params = {
            "verificationId": verification_id,
            "code": otp_code
        }
        
        headers = {
            "authToken": auth_token,
            "accept": "*/*"
        }
        
        print(f"🔍 Verifying OTP via Message Central for {phone_number}")
        print(f"   URL: {verify_url}")
        print(f"   Params: {verify_params}")
        print(f"   Headers: authToken={auth_token[:20]}...")
        
        verify_response = requests.get(verify_url, params=verify_params, headers=headers, timeout=10)
        
        if verify_response.status_code == 200:
            print(f"✅ OTP verified successfully via Message Central")
            return True
        else:
            print(f"❌ Message Central verification failed: {verify_response.status_code} - {verify_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error verifying OTP via Message Central: {e}")
        return False


# ============================================================================
# Wallet Endpoints
# ============================================================================

@router.get("/wallet/{user_id}")
async def get_wallet(user_id: str):
    """Get user wallet balance"""
    try:
        print(f"💰 Fetching wallet for user: {user_id}")
        
        # In a real implementation, this would fetch from database
        # For now, return mock data with consistent structure
        wallet_data = {
            "wallet_id": f"wallet_{user_id}",
            "user_id": user_id,
            "balance": 500.0,  # Mock balance
            "currency": "INR",
            "last_recharge": datetime.now().isoformat()
        }
        
        print(f"✅ Returning wallet data: balance={wallet_data['balance']}")
        return wallet_data
        
    except Exception as e:
        print(f"❌ Error getting wallet: {e}")
        import traceback
        traceback.print_exc()
        # Return a valid wallet structure even on error
        return {
            "wallet_id": f"wallet_{user_id}",
            "user_id": user_id,
            "balance": 0.0,
            "currency": "INR",
            "last_recharge": None
        }


@router.post("/wallet/recharge")
async def recharge_wallet(user_id: str, amount: float):
    """Recharge wallet"""
    try:
        # In a real implementation, this would:
        # 1. Process payment
        # 2. Update database
        # 3. Return transaction details
        
        return {
            "success": True,
            "user_id": user_id,
            "amount": amount,
            "new_balance": 500.0 + amount,
            "transaction_id": f"txn_{int(datetime.now().timestamp())}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error recharging wallet: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wallet/transactions/{user_id}")
async def get_transactions(user_id: str, limit: int = 20):
    """Get wallet transaction history"""
    try:
        # In a real implementation, this would fetch from database
        # For now, return empty list
        return {
            "user_id": user_id,
            "transactions": [],
            "total": 0
        }
    except Exception as e:
        print(f"❌ Error getting transactions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Chat Endpoints
# ============================================================================

@router.post("/chat/start")
async def start_chat(session_data: dict):
    """
    Start a new chat session.
    Fetches user data from database and creates conversation.
    """
    try:
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            # Fallback to root database_manager
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        user_id = session_data.get('user_id')
        astrologer_id = session_data.get('astrologer_id')
        topic = session_data.get('topic', 'general')
        
        if not user_id or not astrologer_id:
            raise HTTPException(status_code=400, detail="user_id and astrologer_id are required")
        
        # Fetch user data from database
        user_data = db.get_user(user_id)
        
        if not user_data:
            print(f"⚠️ User not found in database: {user_id}")
            # Continue anyway with minimal data
            user_data = {'user_id': user_id}
        
        # Create conversation using database manager
        conversation_id = db.create_conversation(user_id, astrologer_id, topic)
        
        if not conversation_id:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        
        print(f"💬 Starting chat session: {conversation_id}")
        print(f"   User: {user_id} ({user_data.get('full_name', 'Unknown')})")
        print(f"   Astrologer: {astrologer_id}")
        print(f"   Topic: {topic}")
        
        # Prepare user context for astrologer
        user_context = {
            'name': user_data.get('full_name', 'User'),
            'display_name': user_data.get('display_name'),
            'gender': user_data.get('gender'),
            'birth_date': str(user_data.get('birth_date')) if user_data.get('birth_date') else None,
            'birth_time': str(user_data.get('birth_time')) if user_data.get('birth_time') else None,
            'birth_location': user_data.get('birth_location'),
            'language_preference': user_data.get('language_preference', 'hi')
        }
        
        print(f"📋 User context prepared: {user_context}")
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "astrologer_id": astrologer_id,
            "topic": topic,
            "user_context": user_context,  # Include user context in response
            "started_at": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error starting chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    """Chat request model with user context"""
    conversation_id: str
    user_id: str
    astrologer_id: str
    message: str
    

@router.post("/chat/send")
async def send_ai_chat_message(chat_request: ChatRequest):
    """
    Send message to AI astrologer with user context.
    Fetches user birth details and includes them in the AI prompt.
    """
    try:
        # Import required modules
        try:
            from backend.database.manager import db
            from backend.handlers.openai_chat import OpenAIChatHandler
        except ImportError:
            from database_manager import DatabaseManager
            from openai_chat_handler import OpenAIChatHandler
            db = DatabaseManager()
        
        print(f"💬 AI Chat request from user {chat_request.user_id}")
        print(f"   Conversation: {chat_request.conversation_id}")
        print(f"   Astrologer: {chat_request.astrologer_id}")
        print(f"   Message: {chat_request.message[:50]}...")
        
        # Fetch user data from database
        user_data = db.get_user(chat_request.user_id)
        
        if not user_data:
            print(f"⚠️ User not found in database: {chat_request.user_id}")
            user_data = {'user_id': chat_request.user_id}
        
        # Build user context for AI
        user_context_text = f"""
User Information:
- Name: {user_data.get('full_name', 'Not provided')}
- Gender: {user_data.get('gender', 'Not provided')}
- Date of Birth: {user_data.get('birth_date', 'Not provided')}
- Time of Birth: {user_data.get('birth_time', 'Not provided')}
- Place of Birth: {user_data.get('birth_location', 'Not provided')}
- Preferred Language: {user_data.get('language_preference', 'Hindi')}
"""
        
        # Create or get chat handler for this astrologer
        chat_handler = OpenAIChatHandler(astrologer_id=chat_request.astrologer_id)
        
        # For first message, inject user context
        message_with_context = chat_request.message
        
        # Check if this is the first user message in conversation
        try:
            conversation = db.get_conversation(chat_request.conversation_id)
            if conversation and conversation.get('total_messages', 0) == 0:
                # First message - add context
                message_with_context = f"{user_context_text}\n\nUser's Question: {chat_request.message}"
                print(f"📋 First message - including user context")
        except:
            pass
        
        # Get AI response
        response = await chat_handler.send_message(
            user_id=chat_request.user_id,
            message=message_with_context
        )
        
        if response.get('success'):
            # Save messages to database
            try:
                # Save user message
                user_msg_id = f"msg_{chat_request.conversation_id}_user_{int(datetime.now().timestamp())}"
                db.add_message(chat_request.conversation_id, 'user', chat_request.message, 'text')
                
                # Save AI response
                ai_msg_id = f"msg_{chat_request.conversation_id}_ai_{int(datetime.now().timestamp())}"
                db.add_message(chat_request.conversation_id, 'astrologer', response['message'], 'text')
                
                # Update conversation
                db.update_conversation_activity(chat_request.conversation_id)
            except Exception as db_error:
                print(f"⚠️ Failed to save to database: {db_error}")
                # Continue anyway
            
            print(f"✅ AI response generated ({response.get('tokens_used', 0)} tokens)")
            
            return {
                "success": True,
                "conversation_id": chat_request.conversation_id,
                "user_message": chat_request.message,
                "ai_response": response['message'],
                "astrologer_name": response.get('astrologer_name', 'Astrologer'),
                "tokens_used": response.get('tokens_used', 0),
                "thinking_phase": response.get('thinking_phase', 1),
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise Exception("Failed to get AI response")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in AI chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/message")
async def send_chat_message(message_data: dict):
    """Send a message in chat session (legacy endpoint)"""
    try:
        conversation_id = message_data.get('conversation_id')
        sender_type = message_data.get('sender_type')  # 'user' or 'astrologer'
        content = message_data.get('content')
        message_type = message_data.get('message_type', 'text')
        
        if not conversation_id or not sender_type or not content:
            raise HTTPException(status_code=400, detail="conversation_id, sender_type, and content are required")
        
        print(f"💬 Received message in {conversation_id}")
        print(f"   Sender: {sender_type}")
        print(f"   Content: {content[:50]}...")
        
        # Save to database
        try:
            from backend.database.manager import db
        except ImportError:
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        message_id = f"msg_{conversation_id}_{int(datetime.now().timestamp())}"
        
        db.add_message(conversation_id, sender_type, content, message_type)
        
        return {
            "success": True,
            "message_id": message_id,
            "conversation_id": conversation_id,
            "sender_type": sender_type,
            "content": content,
            "message_type": message_type,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# PERSISTENT CHAT SESSION MANAGEMENT API ENDPOINTS
# =============================================================================

@router.post("/chat/session/pause")
async def pause_chat_session(session_data: dict):
    """Pause an active chat session"""
    try:
        conversation_id = session_data.get('conversation_id')
        paused_at = session_data.get('paused_at')
        
        if not conversation_id:
            raise HTTPException(status_code=400, detail="conversation_id is required")
        
        # Parse paused_at if provided
        if paused_at:
            try:
                paused_at = datetime.fromisoformat(paused_at.replace('Z', '+00:00'))
            except ValueError:
                paused_at = None
        
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        print(f"⏸️ Pausing chat session: {conversation_id}")
        
        success = db.pause_conversation_session(conversation_id, paused_at)
        
        if success:
            return {
                "success": True,
                "conversation_id": conversation_id,
                "session_status": "paused",
                "paused_at": (paused_at or datetime.now()).isoformat(),
                "message": "Session paused successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to pause session - session not found or not active")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error pausing session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/session/resume")
async def resume_chat_session(session_data: dict):
    """Resume a paused chat session"""
    try:
        conversation_id = session_data.get('conversation_id')
        resumed_at = session_data.get('resumed_at')
        
        if not conversation_id:
            raise HTTPException(status_code=400, detail="conversation_id is required")
        
        # Parse resumed_at if provided
        if resumed_at:
            try:
                resumed_at = datetime.fromisoformat(resumed_at.replace('Z', '+00:00'))
            except ValueError:
                resumed_at = None
        
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        print(f"▶️ Resuming chat session: {conversation_id}")
        
        success = db.resume_conversation_session(conversation_id, resumed_at)
        
        if success:
            return {
                "success": True,
                "conversation_id": conversation_id,
                "session_status": "active",
                "resumed_at": (resumed_at or datetime.now()).isoformat(),
                "message": "Session resumed successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to resume session - session not found or not paused")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error resuming session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/session/end")
async def end_chat_session(session_data: dict):
    """End a chat session"""
    try:
        conversation_id = session_data.get('conversation_id')
        ended_at = session_data.get('ended_at')
        total_duration = session_data.get('total_duration')
        
        if not conversation_id:
            raise HTTPException(status_code=400, detail="conversation_id is required")
        
        # Parse ended_at if provided
        if ended_at:
            try:
                ended_at = datetime.fromisoformat(ended_at.replace('Z', '+00:00'))
            except ValueError:
                ended_at = None
        
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        print(f"🛑 Ending chat session: {conversation_id}")
        
        success = db.end_conversation_session(conversation_id, ended_at, total_duration)
        
        if success:
            return {
                "success": True,
                "conversation_id": conversation_id,
                "session_status": "completed",
                "ended_at": (ended_at or datetime.now()).isoformat(),
                "total_duration": total_duration,
                "message": "Session ended successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to end session - session not found")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error ending session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/session/status/{conversation_id}")
async def get_session_status(conversation_id: str):
    """Get current session status and details"""
    try:
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        print(f"📊 Getting session status: {conversation_id}")
        
        session_data = db.get_conversation_session_status(conversation_id)
        
        if session_data:
            # Calculate current session duration
            started_at = session_data['started_at']
            paused_at = session_data['paused_at']
            total_paused_duration = session_data['total_paused_duration'] or 0
            
            if paused_at:
                # Session is currently paused
                current_duration = int((paused_at - started_at).total_seconds()) - total_paused_duration
                is_paused = True
            else:
                # Session is active
                current_duration = int((datetime.now() - started_at).total_seconds()) - total_paused_duration
                is_paused = False
            
            return {
                "success": True,
                "conversation_id": conversation_id,
                "session_status": session_data['session_status'],
                "session_type": session_data['session_type'],
                "is_active": session_data['session_status'] == 'active',
                "is_paused": is_paused,
                "current_duration": max(0, current_duration),
                "total_paused_duration": total_paused_duration,
                "astrologer_name": session_data['astrologer_name'],
                "astrologer_image": session_data['astrologer_image'],
                "started_at": session_data['started_at'].isoformat(),
                "paused_at": session_data['paused_at'].isoformat() if session_data['paused_at'] else None,
                "resumed_at": session_data['resumed_at'].isoformat() if session_data['resumed_at'] else None
            }
        else:
            raise HTTPException(status_code=404, detail="Session not found")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting session status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/history/{conversation_id}")
async def get_chat_history(conversation_id: str, limit: int = 50):
    """Get chat message history for a conversation"""
    try:
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        print(f"📜 Getting chat history: {conversation_id} (limit: {limit})")
        
        messages = db.get_conversation_history(conversation_id, limit)
        
        if messages is not None:
            return {
                "success": True,
                "conversation_id": conversation_id,
                "messages": messages,
                "total_count": len(messages)
            }
        else:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting chat history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ConversationEndData(BaseModel):
    """Conversation end data model"""
    conversation_id: str
    duration_seconds: int


@router.post("/chat/end")
async def end_chat(end_data: ConversationEndData):
    """End a chat session"""
    try:
        print(f"📞 Ending conversation: {end_data.conversation_id}")
        print(f"   Duration: {end_data.duration_seconds} seconds")
        
        # In a real implementation, this would:
        # 1. Update conversation status in database
        # 2. Calculate final cost based on duration
        # 3. Deduct from wallet
        # 4. Save session summary
        
        return {
            "success": True,
            "conversation_id": end_data.conversation_id,
            "duration_seconds": end_data.duration_seconds,
            "ended_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error ending chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Admin Endpoints
# ============================================================================

@router.post("/admin/init-database")
async def init_database():
    """
    Initialize database schema (admin endpoint).
    WARNING: Only use for first-time setup!
    """
    try:
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            # Fallback to root database_manager
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        print(f"🔧 Attempting to initialize database schema...")
        
        # Execute schema file
        schema_file = 'database_schema.sql'
        
        # Try different paths
        import os
        possible_paths = [
            schema_file,
            f'/var/task/{schema_file}',  # Lambda deployment path
            os.path.join(os.path.dirname(__file__), '..', '..', schema_file),
        ]
        
        schema_path = None
        for path in possible_paths:
            if os.path.exists(path):
                schema_path = path
                break
        
        if not schema_path:
            raise Exception(f"Schema file not found. Tried: {possible_paths}")
        
        print(f"📄 Using schema file: {schema_path}")
        
        success = db.execute_schema(schema_path)
        
        if success:
            # Check what was created
            try:
                with db.get_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("""
                            SELECT table_name 
                            FROM information_schema.tables 
                            WHERE table_schema = 'public'
                            ORDER BY table_name;
                        """)
                        tables = [row[0] for row in cursor.fetchall()]
                        
                        # Count astrologers
                        cursor.execute("SELECT COUNT(*) FROM astrologers")
                        astrologer_count = cursor.fetchone()[0]
                
                print(f"✅ Database initialized successfully!")
                print(f"   Tables created: {len(tables)}")
                print(f"   Sample astrologers: {astrologer_count}")
                
                return {
                    "success": True,
                    "message": "Database schema initialized successfully",
                    "tables_created": tables,
                    "table_count": len(tables),
                    "sample_astrologers": astrologer_count,
                    "timestamp": datetime.now().isoformat()
                }
            except Exception as check_error:
                # Schema created but verification failed
                return {
                    "success": True,
                    "message": "Database schema initialized (verification partial)",
                    "note": str(check_error),
                    "timestamp": datetime.now().isoformat()
                }
        else:
            raise Exception("Schema execution returned False")
            
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/check-database")
async def check_database():
    """Check database status and existing tables"""
    try:
        # Import database manager
        try:
            from backend.database.manager import db
        except ImportError:
            # Fallback to root database_manager
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                # Check tables
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name;
                """)
                tables = [row[0] for row in cursor.fetchall()]
                
                # Check counts
                counts = {}
                for table in tables:
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM {table}")
                        counts[table] = cursor.fetchone()[0]
                    except:
                        counts[table] = "error"
                
                return {
                    "success": True,
                    "database_host": db.db_config['host'],
                    "database_name": db.db_config['database'],
                    "tables": tables,
                    "table_count": len(tables),
                    "row_counts": counts,
                    "initialized": len(tables) > 0,
                    "timestamp": datetime.now().isoformat()
                }
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Review Endpoints
# ============================================================================

@router.post("/reviews/submit")
async def submit_review(review_data: dict):
    """Submit a review for an astrologer"""
    try:
        # Extract data from the request
        user_id = review_data.get('user_id')
        astrologer_id = review_data.get('astrologer_id')
        rating = review_data.get('rating')
        review_text = review_data.get('review_text')
        conversation_id = review_data.get('conversation_id')
        session_duration = review_data.get('session_duration')
        
        # Validate required fields
        if not user_id or not astrologer_id or not rating:
            raise HTTPException(
                status_code=422, 
                detail="Missing required fields: user_id, astrologer_id, and rating are required"
            )
        
        # Validate rating range
        if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
            raise HTTPException(
                status_code=422,
                detail="Rating must be a number between 1 and 5"
            )
        
        print(f"📝 Review submitted by {user_id} for astrologer {astrologer_id}, rating: {rating}")
        
        return {
            "success": True,
            "review_id": f"review_{user_id}_{int(datetime.now().timestamp())}",
            "message": "Review submitted successfully",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error submitting review: {e}")
        raise HTTPException(status_code=500, detail=str(e))

