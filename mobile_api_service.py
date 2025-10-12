"""
Mobile API Service for AstroVoice
FastAPI endpoints for React Native mobile application
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from database_manager import db

app = FastAPI(
    title="AstroVoice Mobile API",
    description="REST API for AstroVoice mobile application",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# PYDANTIC MODELS (Request/Response)
# =============================================================================

class UserRegistration(BaseModel):
    phone_number: str
    full_name: str
    date_of_birth: str  # DD/MM/YYYY
    time_of_birth: str  # HH:MM AM/PM  
    place_of_birth: str
    gender: Optional[str] = None

class ChatSessionCreate(BaseModel):
    user_id: str
    astrologer_id: str
    topic: Optional[str] = "general"
    
class ChatMessage(BaseModel):
    conversation_id: str
    sender_type: str  # 'user' or 'astrologer'
    content: str
    message_type: Optional[str] = "text"
    
class SessionReview(BaseModel):
    user_id: str
    astrologer_id: str
    conversation_id: str
    rating: int
    review_text: Optional[str] = None
    session_duration: str

class WalletRecharge(BaseModel):
    user_id: str
    amount: float
    payment_method: str
    payment_reference: Optional[str] = None

class ConversationEnd(BaseModel):
    conversation_id: str
    duration_seconds: int

# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "status": "healthy",
        "service": "AstroVoice Mobile API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# =============================================================================
# USER ENDPOINTS
# =============================================================================

@app.post("/api/users/register")
async def register_user(user_data: UserRegistration):
    """
    Register new user or update existing user
    Creates user profile and wallet automatically
    """
    try:
        # Generate user_id
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        # Parse date and time
        # Expected format: DD/MM/YYYY and HH:MM AM/PM
        from datetime import datetime
        try:
            dob_parts = user_data.date_of_birth.split('/')
            birth_date = f"{dob_parts[2]}-{dob_parts[1]}-{dob_parts[0]}"  # Convert to YYYY-MM-DD
            
            # Parse time (HH:MM AM/PM)
            birth_time = datetime.strptime(user_data.time_of_birth, "%I:%M %p").time()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid date/time format: {str(e)}")
        
        # Create user
        user_create_data = {
            'user_id': user_id,
            'email': None,
            'full_name': user_data.full_name,
            'display_name': user_data.full_name.split()[0],  # First name as display name
            'phone_number': user_data.phone_number,
            'language_preference': 'hi',
            'subscription_type': 'free',
            'metadata': {
                'place_of_birth': user_data.place_of_birth,
                'gender': user_data.gender
            }
        }
        
        created_user_id = db.create_user(user_create_data)
        if not created_user_id:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Update birth info
        birth_info = {
            'birth_date': birth_date,
            'birth_time': birth_time,
            'birth_location': user_data.place_of_birth,
        }
        db.update_user_birth_info(created_user_id, birth_info)
        
        # Create wallet with initial balance of 500
        wallet_id = db.create_wallet(created_user_id, initial_balance=500.00)
        
        # Get complete user profile
        user_profile = db.get_user(created_user_id)
        wallet = db.get_wallet(created_user_id)
        
        return {
            "success": True,
            "user_id": created_user_id,
            "user": user_profile,
            "wallet": wallet,
            "message": "User registered successfully with ₹500 welcome bonus!"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.get("/api/users/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile with birth details"""
    try:
        user = db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        wallet = db.get_wallet(user_id)
        
        return {
            "success": True,
            "user": user,
            "wallet": wallet
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# ASTROLOGER ENDPOINTS
# =============================================================================

@app.get("/api/astrologers")
async def get_all_astrologers(category: Optional[str] = None):
    """
    Get all active astrologers, optionally filtered by category
    Maps database astrologers to mobile app format
    """
    try:
        astrologers = db.get_all_astrologers(active_only=True)
        
        # Map to mobile app format
        mobile_astrologers = []
        for ast in astrologers:
            mobile_astrologers.append({
                "id": ast.get('astrologer_id'),
                "name": ast.get('display_name', ast.get('name')),
                "category": ast.get('specialization', 'Vedic'),
                "rating": float(ast.get('rating', 0)),
                "reviews": ast.get('total_reviews', 0),
                "experience": f"{ast.get('years_of_experience', 0)} years",
                "languages": ast.get('languages', ['Hindi', 'English']),
                "isOnline": ast.get('is_active', True),
                "image": ast.get('profile_picture_url', 'https://via.placeholder.com/150'),
            })
        
        # Filter by category if provided
        if category and category != "All":
            mobile_astrologers = [a for a in mobile_astrologers if a['category'].lower() == category.lower()]
        
        return {
            "success": True,
            "astrologers": mobile_astrologers,
            "count": len(mobile_astrologers)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/astrologers/{astrologer_id}")
async def get_astrologer_details(astrologer_id: str):
    """Get detailed astrologer profile"""
    try:
        astrologer = db.get_astrologer(astrologer_id)
        if not astrologer:
            raise HTTPException(status_code=404, detail="Astrologer not found")
        
        reviews = db.get_astrologer_reviews(astrologer_id, limit=10)
        
        return {
            "success": True,
            "astrologer": astrologer,
            "reviews": reviews
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# CHAT ENDPOINTS
# =============================================================================

@app.post("/api/chat/start")
async def start_chat_session(session: ChatSessionCreate):
    """Create new chat conversation"""
    try:
        # Check if user has sufficient balance
        wallet = db.get_wallet(session.user_id)
        if not wallet or wallet['balance'] <= 0:
            raise HTTPException(
                status_code=402,
                detail="Insufficient wallet balance. Please recharge."
            )
        
        # Create conversation
        conversation_id = db.create_conversation(
            session.user_id,
            session.astrologer_id,
            session.topic
        )
        
        if not conversation_id:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        
        # Get astrologer greeting message
        astrologer = db.get_astrologer(session.astrologer_id)
        greeting = astrologer.get('greeting_message', 'Hello! How can I help you today?')
        
        # Add greeting message
        db.add_message(
            conversation_id,
            'astrologer',
            greeting,
            message_type='text'
        )
        
        return {
            "success": True,
            "conversation_id": conversation_id,
            "greeting": greeting,
            "message": "Chat session started"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/message")
async def send_message(message: ChatMessage):
    """Send message in chat"""
    try:
        message_id = db.add_message(
            message.conversation_id,
            message.sender_type,
            message.content,
            message_type=message.message_type
        )
        
        if not message_id:
            raise HTTPException(status_code=500, detail="Failed to send message")
        
        return {
            "success": True,
            "message_id": message_id,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/history/{conversation_id}")
async def get_chat_history(conversation_id: str, limit: int = 50):
    """Get chat message history"""
    try:
        messages = db.get_conversation_history(conversation_id, limit)
        
        # Map to mobile format
        mobile_messages = []
        for msg in messages:
            mobile_messages.append({
                "id": msg['message_id'],
                "text": msg['content'],
                "sender": msg['sender_type'],
                "timestamp": msg['sent_at'].strftime("%I:%M %p") if msg.get('sent_at') else ""
            })
        
        return {
            "success": True,
            "messages": mobile_messages,
            "count": len(mobile_messages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/end")
async def end_conversation(end_data: ConversationEnd):
    """End chat conversation"""
    try:
        success = db.update_conversation_end(
            end_data.conversation_id,
            end_data.duration_seconds
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to end conversation")
        
        return {
            "success": True,
            "message": "Conversation ended successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# REVIEW ENDPOINTS
# =============================================================================

@app.post("/api/reviews/submit")
async def submit_review(review: SessionReview):
    """Submit chat session review"""
    try:
        if review.rating < 1 or review.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        review_data = {
            'user_id': review.user_id,
            'astrologer_id': review.astrologer_id,
            'conversation_id': review.conversation_id,
            'rating': review.rating,
            'review_text': review.review_text,
            'session_duration': review.session_duration
        }
        
        review_id = db.create_session_review(review_data)
        
        if not review_id:
            raise HTTPException(status_code=500, detail="Failed to submit review")
        
        return {
            "success": True,
            "review_id": review_id,
            "message": "Review submitted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# WALLET ENDPOINTS
# =============================================================================

@app.get("/api/wallet/{user_id}")
async def get_wallet_balance(user_id: str):
    """Get user wallet balance and recent transactions"""
    try:
        wallet = db.get_wallet(user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        transactions = db.get_user_transactions(user_id, limit=10)
        
        return {
            "success": True,
            "wallet": wallet,
            "transactions": transactions,
            "balance": float(wallet['balance'])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/wallet/recharge")
async def recharge_wallet(recharge: WalletRecharge):
    """Add money to user wallet"""
    try:
        if recharge.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        
        # Get wallet
        wallet = db.get_wallet(recharge.user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Create transaction
        transaction_data = {
            'user_id': recharge.user_id,
            'wallet_id': wallet['wallet_id'],
            'transaction_type': 'recharge',
            'amount': recharge.amount,
            'payment_method': recharge.payment_method,
            'payment_status': 'completed',  # In production, this would be pending until payment gateway confirms
            'payment_reference': recharge.payment_reference or f"ref_{uuid.uuid4().hex[:8]}",
            'reference_type': 'recharge',
            'description': f"Wallet recharge of ₹{recharge.amount} via {recharge.payment_method}"
        }
        
        transaction_id = db.add_transaction(transaction_data)
        
        if not transaction_id:
            raise HTTPException(status_code=500, detail="Failed to process recharge")
        
        # Get updated wallet
        updated_wallet = db.get_wallet(recharge.user_id)
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "new_balance": float(updated_wallet['balance']),
            "message": f"₹{recharge.amount} added successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/wallet/transactions/{user_id}")
async def get_transactions(user_id: str, limit: int = 20):
    """Get user transaction history"""
    try:
        transactions = db.get_user_transactions(user_id, limit)
        
        return {
            "success": True,
            "transactions": transactions,
            "count": len(transactions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# MAIN (for local testing)
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

