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
    """Register a new user or update existing"""
    try:
        # Generate user_id if not provided
        if not user.user_id:
            import uuid
            user.user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        print(f"📝 Registering user: {user.user_id}")
        print(f"   Name: {user.full_name}")
        print(f"   Phone: {user.phone_number}")
        print(f"   DOB: {user.date_of_birth}")
        print(f"   Place: {user.place_of_birth}")
        print(f"   Gender: {user.gender}")
        
        # In a real implementation, this would save to database
        # For now, just return success with wallet info
        wallet_data = {
            "wallet_id": f"wallet_{user.user_id}",
            "balance": 500.0,  # Initial balance for new users
            "currency": "INR"
        }
        
        return {
            "success": True,
            "user_id": user.user_id,
            "message": "User registered successfully",
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "date_of_birth": user.date_of_birth,
            "time_of_birth": user.time_of_birth,
            "place_of_birth": user.place_of_birth,
            "gender": user.gender,
            "wallet": wallet_data,  # Include wallet data in response
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
    """Start a new chat session"""
    try:
        user_id = session_data.get('user_id')
        astrologer_id = session_data.get('astrologer_id')
        topic = session_data.get('topic', 'general')
        
        if not user_id or not astrologer_id:
            raise HTTPException(status_code=400, detail="user_id and astrologer_id are required")
        
        conversation_id = f"conv_{user_id}_{astrologer_id}_{int(datetime.now().timestamp())}"
        
        print(f"💬 Starting chat session: {conversation_id}")
        print(f"   User: {user_id}")
        print(f"   Astrologer: {astrologer_id}")
        print(f"   Topic: {topic}")
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "astrologer_id": astrologer_id,
            "topic": topic,
            "started_at": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error starting chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/message")
async def send_chat_message(message_data: dict):
    """Send a message in chat session"""
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
        
        # In a real implementation, this would save to database
        # For now, just return success
        return {
            "success": True,
            "message_id": f"msg_{conversation_id}_{int(datetime.now().timestamp())}",
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


@router.post("/chat/end")
async def end_chat(conversation_id: str):
    """End a chat session"""
    try:
        return {
            "success": True,
            "conversation_id": conversation_id,
            "ended_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error ending chat: {e}")
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

