"""
Database Manager for AstroVoice
Handles all database operations with PostgreSQL/AWS RDS
"""

import os
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()


class DatabaseManager:
    """
    Manages database connections and operations for AstroVoice
    Supports both local PostgreSQL and AWS RDS
    """
    
    def __init__(self):
        # Database configuration
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
            'database': os.getenv('DB_NAME', 'astrovoice'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', ''),
        }
        
        print(f"✅ Database configured: {self.db_config['host']}:{self.db_config['port']}")
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
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
    
    def execute_schema(self, schema_file: str = 'database_schema.sql'):
        """Execute the database schema file"""
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
                    cursor.execute("""
                        INSERT INTO users (
                            user_id, email, full_name, display_name,
                            language_preference, subscription_type, metadata
                        ) VALUES (
                            %(user_id)s, %(email)s, %(full_name)s, %(display_name)s,
                            %(language_preference)s, %(subscription_type)s, %(metadata)s
                        )
                        ON CONFLICT (user_id) DO UPDATE SET
                            email = EXCLUDED.email,
                            full_name = EXCLUDED.full_name,
                            updated_at = CURRENT_TIMESTAMP
                        RETURNING user_id
                    """, user_data)
                    
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
                    
                    # Update conversation stats
                    cursor.execute("""
                        UPDATE conversations SET
                            total_messages = total_messages + 1,
                            last_message_at = CURRENT_TIMESTAMP
                        WHERE conversation_id = %s
                    """, (conversation_id,))
                    
                    result = cursor.fetchone()
                    return result['message_id']
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

