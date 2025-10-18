"""
Database Manager for AstroVoice
Handles all database operations with PostgreSQL/AWS RDS
"""

import os
import json
import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime
from contextlib import contextmanager

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor, Json
    PSYCOPG2_AVAILABLE = True
except ImportError:
    print("⚠️  psycopg2 not installed - database features will be disabled")
    PSYCOPG2_AVAILABLE = False

from dotenv import load_dotenv

# Import settings
try:
    from backend.config.settings import get_database_config
except ImportError:
    # Fallback if importing as standalone
    load_dotenv()
    def get_database_config():
        return {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
            'database': os.getenv('DB_NAME', 'astrovoice'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', ''),
        }

load_dotenv()


class DatabaseManager:
    """
    Manages database connections and operations for AstroVoice
    Supports both local PostgreSQL and AWS RDS
    """
    
    def __init__(self):
        if not PSYCOPG2_AVAILABLE:
            print("⚠️  Database manager initialized but psycopg2 not available")
            self.db_config = {}
            return
            
        # Database configuration
        self.db_config = get_database_config()
        
        print(f"✅ Database configured: {self.db_config['host']}:{self.db_config['port']}")
    
    @staticmethod
    def generate_user_id() -> str:
        """Generate a unique UUID-based user ID"""
        return f"user_{uuid.uuid4().hex[:12]}"
    
    @staticmethod
    def generate_conversation_id(user_id: str, astrologer_id: str) -> str:
        """Generate a unique conversation ID"""
        timestamp = int(datetime.now().timestamp())
        return f"conv_{user_id}_{astrologer_id}_{timestamp}"
    
    @staticmethod
    def generate_message_id(conversation_id: str) -> str:
        """Generate a unique message ID"""
        timestamp = int(datetime.now().timestamp() * 1000)
        return f"msg_{conversation_id}_{timestamp}"
    
    @staticmethod
    def generate_wallet_id(user_id: str) -> str:
        """Generate a wallet ID for user"""
        return f"wallet_{user_id}"
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        if not PSYCOPG2_AVAILABLE:
            raise ImportError("psycopg2 not available - database features disabled")
        
        conn = None
        try:
            conn = psycopg2.connect(**self.db_config)
            yield conn
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            print(f"❌ Database error: {e}")
            raise
        finally:
            if conn:
                conn.close()
    
    def execute_schema(self, schema_file: str = None):
        """Execute the database schema file"""
        if not PSYCOPG2_AVAILABLE:
            print("❌ psycopg2 not available - cannot execute schema")
            return False
            
        # Default to schema.sql in same directory
        if schema_file is None:
            from pathlib import Path
            schema_file = Path(__file__).parent / 'schema.sql'
        
        try:
            with open(schema_file, 'r') as f:
                schema_sql = f.read()
            
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(schema_sql)
            
            print(f"✅ Database schema created successfully")
            return True
        except Exception as e:
            print(f"❌ Error creating schema: {e}")
            return False
    
    # =============================================================================
    # USER OPERATIONS
    # =============================================================================
    
    def create_user(self, user_data: Dict[str, Any]) -> Optional[str]:
        """Create a new user"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    # Prepare data with JSON wrapping for metadata
                    prepared_data = {**user_data}
                    if 'metadata' in prepared_data and prepared_data['metadata']:
                        prepared_data['metadata'] = Json(prepared_data['metadata'])
                    
                    cursor.execute("""
                        INSERT INTO users (
                            user_id, email, phone_number, full_name, display_name,
                            language_preference, subscription_type, metadata,
                            birth_date, birth_time, birth_location, birth_timezone,
                            birth_latitude, birth_longitude, gender
                        ) VALUES (
                            %(user_id)s, %(email)s, %(phone_number)s, %(full_name)s, %(display_name)s,
                            %(language_preference)s, %(subscription_type)s, %(metadata)s,
                            %(birth_date)s, %(birth_time)s, %(birth_location)s, %(birth_timezone)s,
                            %(birth_latitude)s, %(birth_longitude)s, %(gender)s
                        )
                        ON CONFLICT (user_id) DO UPDATE SET
                            email = EXCLUDED.email,
                            phone_number = EXCLUDED.phone_number,
                            full_name = EXCLUDED.full_name,
                            birth_date = EXCLUDED.birth_date,
                            birth_time = EXCLUDED.birth_time,
                            birth_location = EXCLUDED.birth_location,
                            birth_timezone = EXCLUDED.birth_timezone,
                            birth_latitude = EXCLUDED.birth_latitude,
                            birth_longitude = EXCLUDED.birth_longitude,
                            gender = EXCLUDED.gender,
                            updated_at = CURRENT_TIMESTAMP
                        RETURNING user_id
                    """, prepared_data)
                    
                    result = cursor.fetchone()
                    print(f"✅ User created/updated: {result['user_id']}")
                    return result['user_id']
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return None
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
                    return dict(cursor.fetchone()) if cursor.rowcount > 0 else None
        except Exception as e:
            print(f"❌ Error getting user: {e}")
            return None
    
    def update_user_birth_info(self, user_id: str, birth_info: Dict[str, Any]) -> bool:
        """Update user's birth information"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        UPDATE users SET
                            birth_date = %(birth_date)s,
                            birth_time = %(birth_time)s,
                            birth_location = %(birth_location)s,
                            birth_timezone = %(birth_timezone)s,
                            birth_latitude = %(birth_latitude)s,
                            birth_longitude = %(birth_longitude)s,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE user_id = %(user_id)s
                    """, {**birth_info, 'user_id': user_id})
                    
                    print(f"✅ Birth info updated for user: {user_id}")
                    return True
        except Exception as e:
            print(f"❌ Error updating birth info: {e}")
            return False
    
    # =============================================================================
    # ASTROLOGER OPERATIONS
    # =============================================================================
    
    def get_astrologer(self, astrologer_id: str) -> Optional[Dict]:
        """Get astrologer by ID"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM astrologers WHERE astrologer_id = %s
                    """, (astrologer_id,))
                    return dict(cursor.fetchone()) if cursor.rowcount > 0 else None
        except Exception as e:
            print(f"❌ Error getting astrologer: {e}")
            return None
    
    def get_all_astrologers(self, active_only: bool = True) -> List[Dict]:
        """Get all astrologers"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    query = "SELECT * FROM astrologers"
                    if active_only:
                        query += " WHERE is_active = true"
                    query += " ORDER BY rating DESC, total_consultations DESC"
                    
                    cursor.execute(query)
                    return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            print(f"❌ Error getting astrologers: {e}")
            return []
    
    def update_astrologer_stats(self, astrologer_id: str, rating: float = None,
                                increment_consultations: bool = False) -> bool:
        """Update astrologer statistics"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    if rating is not None:
                        cursor.execute("""
                            UPDATE astrologers SET
                                rating = %s,
                                total_reviews = total_reviews + 1,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE astrologer_id = %s
                        """, (rating, astrologer_id))
                    
                    if increment_consultations:
                        cursor.execute("""
                            UPDATE astrologers SET
                                total_consultations = total_consultations + 1,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE astrologer_id = %s
                        """, (astrologer_id,))
                    
                    return True
        except Exception as e:
            print(f"❌ Error updating astrologer stats: {e}")
            return False
    
    # =============================================================================
    # CONVERSATION OPERATIONS
    # =============================================================================
    
    def create_conversation(self, user_id: str, astrologer_id: str,
                           topic: str = 'general') -> Optional[str]:
        """Create a new conversation"""
        try:
            conversation_id = f"conv_{user_id}_{int(datetime.now().timestamp())}"
            
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        INSERT INTO conversations (
                            conversation_id, user_id, astrologer_id, topic
                        ) VALUES (%s, %s, %s, %s)
                        RETURNING conversation_id
                    """, (conversation_id, user_id, astrologer_id, topic))
                    
                    result = cursor.fetchone()
                    print(f"✅ Conversation created: {result['conversation_id']}")
                    return result['conversation_id']
        except Exception as e:
            print(f"❌ Error creating conversation: {e}")
            return None
    
    def add_message(self, conversation_id: str, sender_type: str,
                    content: str, message_type: str = 'text',
                    audio_url: str = None, transcription: str = None) -> Optional[str]:
        """Add a message to a conversation"""
        try:
            message_id = f"msg_{conversation_id}_{int(datetime.now().timestamp() * 1000)}"
            
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        INSERT INTO messages (
                            message_id, conversation_id, sender_type,
                            message_type, content, audio_url, transcription
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING message_id
                    """, (message_id, conversation_id, sender_type,
                          message_type, content, audio_url, transcription))
                    
                    result = cursor.fetchone()
                    
                    # Update conversation stats
                    cursor.execute("""
                        UPDATE conversations SET
                            total_messages = total_messages + 1,
                            last_message_at = CURRENT_TIMESTAMP
                        WHERE conversation_id = %s
                    """, (conversation_id,))
                    
                    return result['message_id'] if result else message_id
        except Exception as e:
            print(f"❌ Error adding message: {e}")
            return None
    
    def get_conversation_history(self, conversation_id: str,
                                 limit: int = 50) -> List[Dict]:
        """Get conversation message history"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM messages
                        WHERE conversation_id = %s
                        ORDER BY sent_at DESC
                        LIMIT %s
                    """, (conversation_id, limit))
                    
                    messages = [dict(row) for row in cursor.fetchall()]
                    return list(reversed(messages))  # Return in chronological order
        except Exception as e:
            print(f"❌ Error getting conversation history: {e}")
            return []
    
    def get_user_conversations(self, user_id: str, limit: int = 20) -> List[Dict]:
        """Get user's conversation history"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT c.*, a.display_name as astrologer_name
                        FROM conversations c
                        JOIN astrologers a ON c.astrologer_id = a.astrologer_id
                        WHERE c.user_id = %s
                        ORDER BY c.last_message_at DESC
                        LIMIT %s
                    """, (user_id, limit))
                    
                    return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            print(f"❌ Error getting user conversations: {e}")
            return []
    
    # =============================================================================
    # READING OPERATIONS
    # =============================================================================
    
    def create_reading(self, reading_data: Dict[str, Any]) -> Optional[str]:
        """Create a new reading record"""
        try:
            reading_id = f"read_{reading_data['user_id']}_{int(datetime.now().timestamp())}"
            
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        INSERT INTO readings (
                            reading_id, user_id, astrologer_id, conversation_id,
                            reading_type, topic, reading_text, status
                        ) VALUES (
                            %(reading_id)s, %(user_id)s, %(astrologer_id)s,
                            %(conversation_id)s, %(reading_type)s, %(topic)s,
                            %(reading_text)s, %(status)s
                        )
                        RETURNING reading_id
                    """, {**reading_data, 'reading_id': reading_id})
                    
                    result = cursor.fetchone()
                    print(f"✅ Reading created: {result['reading_id']}")
                    return result['reading_id']
        except Exception as e:
            print(f"❌ Error creating reading: {e}")
            return None
    
    # =============================================================================
    # WALLET OPERATIONS
    # =============================================================================
    
    def create_wallet(self, user_id: str, initial_balance: float = 0.00) -> Optional[str]:
        """Create wallet for new user"""
        try:
            wallet_id = f"wallet_{user_id}"
            
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        INSERT INTO wallets (wallet_id, user_id, balance, currency)
                        VALUES (%s, %s, %s, 'INR')
                        ON CONFLICT (user_id) DO UPDATE SET
                            updated_at = CURRENT_TIMESTAMP
                        RETURNING wallet_id
                    """, (wallet_id, user_id, initial_balance))
                    
                    result = cursor.fetchone()
                    print(f"✅ Wallet created/updated: {result['wallet_id']}")
                    return result['wallet_id']
        except Exception as e:
            print(f"❌ Error creating wallet: {e}")
            return None
    
    def get_wallet(self, user_id: str) -> Optional[Dict]:
        """Get user wallet details"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM wallets WHERE user_id = %s
                    """, (user_id,))
                    return dict(cursor.fetchone()) if cursor.rowcount > 0 else None
        except Exception as e:
            print(f"❌ Error getting wallet: {e}")
            return None
    
    def update_wallet_balance(self, wallet_id: str, new_balance: float) -> bool:
        """Update wallet balance"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        UPDATE wallets SET
                            balance = %s,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE wallet_id = %s
                    """, (new_balance, wallet_id))
                    return True
        except Exception as e:
            print(f"❌ Error updating wallet balance: {e}")
            return False
    
    def add_transaction(self, transaction_data: Dict[str, Any]) -> Optional[str]:
        """Record wallet transaction"""
        try:
            transaction_id = f"txn_{transaction_data['user_id']}_{int(datetime.now().timestamp() * 1000)}"
            
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    # Get current balance
                    cursor.execute("""
                        SELECT balance FROM wallets WHERE wallet_id = %s
                    """, (transaction_data['wallet_id'],))
                    
                    wallet = cursor.fetchone()
                    if not wallet:
                        print(f"❌ Wallet not found: {transaction_data['wallet_id']}")
                        return None
                    
                    current_balance = float(wallet['balance'])
                    amount = float(transaction_data['amount'])
                    transaction_type = transaction_data['transaction_type']
                    
                    # Calculate new balance
                    if transaction_type == 'recharge':
                        new_balance = current_balance + amount
                    elif transaction_type == 'deduction':
                        new_balance = max(0, current_balance - amount)
                    elif transaction_type == 'refund':
                        new_balance = current_balance + amount
                    else:
                        new_balance = current_balance
                    
                    # Insert transaction
                    cursor.execute("""
                        INSERT INTO transactions (
                            transaction_id, user_id, wallet_id, transaction_type,
                            amount, balance_before, balance_after, payment_method,
                            payment_status, payment_reference, reference_type,
                            reference_id, description, metadata
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                        )
                        RETURNING transaction_id
                    """, (
                        transaction_id,
                        transaction_data['user_id'],
                        transaction_data['wallet_id'],
                        transaction_type,
                        amount,
                        current_balance,
                        new_balance,
                        transaction_data.get('payment_method', 'upi'),
                        transaction_data.get('payment_status', 'completed'),
                        transaction_data.get('payment_reference'),
                        transaction_data.get('reference_type', 'recharge'),
                        transaction_data.get('reference_id'),
                        transaction_data.get('description'),
                        Json(transaction_data.get('metadata', {}))
                    ))
                    
                    result = cursor.fetchone()
                    
                    # Update wallet balance
                    cursor.execute("""
                        UPDATE wallets SET
                            balance = %s,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE wallet_id = %s
                    """, (new_balance, transaction_data['wallet_id']))
                    
                    print(f"✅ Transaction created: {result['transaction_id'] if result else transaction_id}")
                    return result['transaction_id'] if result else transaction_id
        except Exception as e:
            print(f"❌ Error adding transaction: {e}")
            return None
    
    def get_user_transactions(self, user_id: str, limit: int = 20) -> List[Dict]:
        """Get user transaction history"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM transactions
                        WHERE user_id = %s
                        ORDER BY created_at DESC
                        LIMIT %s
                    """, (user_id, limit))
                    
                    return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            print(f"❌ Error getting transactions: {e}")
            return []
    
    # =============================================================================
    # SESSION REVIEW OPERATIONS
    # =============================================================================
    
    def create_session_review(self, review_data: Dict[str, Any]) -> Optional[str]:
        """Store chat session review"""
        try:
            review_id = f"review_{review_data['user_id']}_{int(datetime.now().timestamp())}"
            
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        INSERT INTO session_reviews (
                            review_id, user_id, astrologer_id, conversation_id,
                            rating, review_text, session_duration, metadata
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING review_id
                    """, (
                        review_id,
                        review_data['user_id'],
                        review_data['astrologer_id'],
                        review_data.get('conversation_id'),
                        review_data['rating'],
                        review_data.get('review_text'),
                        review_data.get('session_duration'),
                        Json(review_data.get('metadata', {}))
                    ))
                    
                    result = cursor.fetchone()
                    
                    # Update astrologer rating
                    cursor.execute("""
                        UPDATE astrologers SET
                            total_reviews = total_reviews + 1,
                            rating = (
                                SELECT AVG(rating)::DECIMAL(3,2) FROM session_reviews
                                WHERE astrologer_id = %s
                            ),
                            updated_at = CURRENT_TIMESTAMP
                        WHERE astrologer_id = %s
                    """, (review_data['astrologer_id'], review_data['astrologer_id']))
                    
                    print(f"✅ Review created: {result['review_id'] if result else review_id}")
                    return result['review_id'] if result else review_id
        except Exception as e:
            print(f"❌ Error creating review: {e}")
            return None
    
    def get_astrologer_reviews(self, astrologer_id: str, limit: int = 20) -> List[Dict]:
        """Get reviews for an astrologer"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT sr.*, u.display_name as user_name
                        FROM session_reviews sr
                        JOIN users u ON sr.user_id = u.user_id
                        WHERE sr.astrologer_id = %s
                        ORDER BY sr.created_at DESC
                        LIMIT %s
                    """, (astrologer_id, limit))
                    
                    return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            print(f"❌ Error getting reviews: {e}")
            return []
    
    def update_conversation_end(self, conversation_id: str, duration_seconds: int) -> bool:
        """Update conversation when ended"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        UPDATE conversations SET
                            status = 'completed',
                            ended_at = CURRENT_TIMESTAMP,
                            total_duration_seconds = %s
                        WHERE conversation_id = %s
                    """, (duration_seconds, conversation_id))
                    
                    print(f"✅ Conversation ended: {conversation_id}")
                    return True
        except Exception as e:
            print(f"❌ Error ending conversation: {e}")
            return False
    
    # =============================================================================
    # ANALYTICS & REPORTS
    # =============================================================================
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM user_activity WHERE user_id = %s
                    """, (user_id,))
                    
                    result = cursor.fetchone()
                    return dict(result) if result else {}
        except Exception as e:
            print(f"❌ Error getting user stats: {e}")
            return {}
    
    def get_astrologer_stats(self, astrologer_id: str) -> Dict[str, Any]:
        """Get astrologer statistics"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM astrologer_stats WHERE astrologer_id = %s
                    """, (astrologer_id,))
                    
                    result = cursor.fetchone()
                    return dict(result) if result else {}
        except Exception as e:
            print(f"❌ Error getting astrologer stats: {e}")
            return {}


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

# Global instance
db = DatabaseManager()


def init_database():
    """Initialize database with schema"""
    return db.execute_schema()


def test_database_connection():
    """Test database connection"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                print(f"✅ Database connected: {version[0]}")
                return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


if __name__ == "__main__":
    print("🚀 Testing Database Manager...")
    print("-" * 80)
    
    # Test connection
    if test_database_connection():
        print("\n✅ Database connection successful!")
        
        # Initialize schema (if needed)
        # db.execute_schema()
        
        # Get all astrologers
        astrologers = db.get_all_astrologers()
        print(f"\n📊 Found {len(astrologers)} astrologers")
        for ast in astrologers:
            print(f"   • {ast['display_name']} - {ast['specialization']}")
    else:
        print("\n❌ Database connection failed. Check configuration.")

