"""
Mobile App API Endpoints
Provides REST API endpoints for mobile app integration
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

# Import services
try:
    from backend.services.astrologer_service import astrologer_manager
except ImportError:
    from astrologer_manager import astrologer_manager

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
    """User registration model"""
    user_id: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    time_of_birth: Optional[str] = None
    place_of_birth: Optional[str] = None
    gender: Optional[str] = None
    language_preference: Optional[str] = None


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
            from database_manager import DatabaseManager
            db = DatabaseManager()
        
        # Generate user_id if not provided
        if not user.user_id:
            # Use phone number as user_id if available, else generate UUID
            if user.phone_number:
                user.user_id = f"user_{user.phone_number.replace('+', '').replace(' ', '')}"
            else:
                import uuid
                user.user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        print(f"📝 Registering user: {user.user_id}")
        print(f"   Name: {user.full_name}")
        print(f"   Phone: {user.phone_number}")
        print(f"   DOB: {user.date_of_birth}")
        print(f"   Time: {user.time_of_birth}")
        print(f"   Place: {user.place_of_birth}")
        print(f"   Gender: {user.gender}")
        
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
            'gender': user.gender,
            'language_preference': user.language_preference or 'hi',
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
        wallet_id = f"wallet_{saved_user_id}"
        welcome_bonus = 500.0  # ₹500 welcome bonus
        
        wallet_created = db.create_wallet(saved_user_id, wallet_id, welcome_bonus)
        
        if wallet_created:
            print(f"💰 Wallet created with ₹{welcome_bonus} welcome bonus")
            wallet_data = {
                "wallet_id": wallet_id,
                "balance": welcome_bonus,
                "currency": "INR"
            }
        else:
            # If wallet creation fails, still return success but with 0 balance
            wallet_data = {
                "wallet_id": wallet_id,
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
    """Get user details"""
    try:
        # In a real implementation, this would fetch from database
        # For now, return mock data
        return {
            "user_id": user_id,
            "display_name": "User",
            "created_at": datetime.now().isoformat(),
            "language_preference": "Hindi"
        }
    except Exception as e:
        print(f"❌ Error getting user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
        
        # Create conversation ID
        conversation_id = f"conv_{user_id}_{astrologer_id}_{int(datetime.now().timestamp())}"
        
        print(f"💬 Starting chat session: {conversation_id}")
        print(f"   User: {user_id} ({user_data.get('full_name', 'Unknown')})")
        print(f"   Astrologer: {astrologer_id}")
        print(f"   Topic: {topic}")
        
        # Save conversation to database
        conversation_data = {
            'conversation_id': conversation_id,
            'user_id': user_id,
            'astrologer_id': astrologer_id,
            'topic': topic,
            'status': 'active'
        }
        
        db.create_conversation(conversation_data)
        
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
                db.save_message({
                    'message_id': user_msg_id,
                    'conversation_id': chat_request.conversation_id,
                    'sender_type': 'user',
                    'content': chat_request.message,
                    'message_type': 'text'
                })
                
                # Save AI response
                ai_msg_id = f"msg_{chat_request.conversation_id}_ai_{int(datetime.now().timestamp())}"
                db.save_message({
                    'message_id': ai_msg_id,
                    'conversation_id': chat_request.conversation_id,
                    'sender_type': 'astrologer',
                    'content': response['message'],
                    'message_type': 'text',
                    'ai_model': response.get('astrologer_name', 'gpt-4o-mini'),
                    'tokens_used': response.get('tokens_used', 0)
                })
                
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
        
        db.save_message({
            'message_id': message_id,
            'conversation_id': conversation_id,
            'sender_type': sender_type,
            'content': content,
            'message_type': message_type
        })
        
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
# Review Endpoints
# ============================================================================

@router.post("/reviews/submit")
async def submit_review(
    user_id: str,
    astrologer_id: str,
    rating: float,
    review_text: Optional[str] = None
):
    """Submit a review for an astrologer"""
    try:
        return {
            "success": True,
            "review_id": f"review_{user_id}_{int(datetime.now().timestamp())}",
            "message": "Review submitted successfully",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error submitting review: {e}")
        raise HTTPException(status_code=500, detail=str(e))

