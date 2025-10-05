# 🗄️ Database Setup Guide

## Overview

Scalable PostgreSQL database schema for AstroVoice with support for:
- User management with flexible metadata
- Astrologer profiles with customizable personalities
- Conversation tracking
- Message history
- Reading records
- Analytics and reporting

---

## 📊 Database Schema

### **Tables:**

1. **users** - User accounts and profiles
2. **astrologers** - Astrologer profiles with AI personalities
3. **conversations** - User-astrologer chat sessions
4. **messages** - Individual chat messages
5. **readings** - Completed astrology readings
6. **user_profiles** - Extended astrology data
7. **user_sessions** - Session tracking

### **Key Features:**

✅ **Flexible JSONB fields** for easy extension  
✅ **Auto-updating timestamps**  
✅ **Built-in views** for common queries  
✅ **Sample data** included  
✅ **Indexes** for performance  

---

## 🚀 Quick Setup

### **Option 1: Local PostgreSQL**

```bash
# 1. Install PostgreSQL (if not installed)
brew install postgresql@14  # macOS
# or
sudo apt-get install postgresql-14  # Ubuntu

# 2. Start PostgreSQL
brew services start postgresql@14  # macOS
# or
sudo systemctl start postgresql  # Linux

# 3. Create database
createdb astrovoice

# 4. Set environment variables
cat >> .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=astrovoice
DB_USER=postgres
DB_PASSWORD=your_password
EOF

# 5. Initialize schema
python3 database_manager.py
```

### **Option 2: AWS RDS**

```bash
# 1. Create RDS PostgreSQL instance (via AWS Console or CDK)

# 2. Get connection details from AWS console

# 3. Update .env with AWS RDS details
cat >> .env << EOF
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=astrovoice
DB_USER=admin
DB_PASSWORD=your_secure_password
EOF

# 4. Initialize schema
python3 database_manager.py
```

---

## 📝 Configuration

### **Environment Variables**

Add to `.env`:
```bash
# Database Configuration
DB_HOST=localhost              # or RDS endpoint
DB_PORT=5432
DB_NAME=astrovoice
DB_USER=postgres
DB_PASSWORD=your_password

# Existing OpenAI config
OPENAI_API_KEY=your_key
```

---

## 🔧 Using the Database Manager

### **Import in your code:**

```python
from database_manager import db

# Create user
user_data = {
    'user_id': 'user_123',
    'email': 'user@example.com',
    'full_name': 'John Doe',
    'display_name': 'John',
    'language_preference': 'hi',
    'subscription_type': 'free',
    'metadata': {}
}
db.create_user(user_data)

# Get astrologer
astrologer = db.get_astrologer('ast_guru_001')
print(astrologer['display_name'])  # AstroGuru

# Create conversation
conversation_id = db.create_conversation(
    user_id='user_123',
    astrologer_id='ast_guru_001',
    topic='love'
)

# Add message
db.add_message(
    conversation_id=conversation_id,
    sender_type='user',
    content='Hello, I need guidance',
    message_type='text'
)

# Get conversation history
messages = db.get_conversation_history(conversation_id)
```

---

## 📊 Database Schema Details

### **1. Users Table**

Stores all user information with flexible metadata:

```sql
- user_id (PRIMARY KEY)
- email, phone_number
- full_name, display_name
- birth details (date, time, location, coordinates)
- preferences (language, astrology system)
- subscription info
- metadata (JSONB) ← Add any custom fields here
```

**Scalability:** Use `metadata` JSONB field for new attributes without schema changes.

### **2. Astrologers Table**

Customizable astrologer profiles:

```sql
- astrologer_id (PRIMARY KEY)
- name, display_name, bio
- specialization, expertise_areas[]
- personality_type, speaking_style, voice_tone
- system_prompt ← Custom AI instructions
- rating, total_consultations
- custom_fields (JSONB) ← Add any custom attributes
```

**Key Features:**
- Different AI personalities per astrologer
- Custom system prompts
- Rating and stats tracking

### **3. Conversations & Messages**

Track all user-astrologer interactions:

```sql
conversations:
- conversation_id, user_id, astrologer_id
- topic, status
- total_messages, total_duration
- metadata (JSONB)

messages:
- message_id, conversation_id
- sender_type (user/astrologer/system)
- message_type (text/audio)
- audio_url, transcription
- metadata (JSONB)
```

---

## 🎯 Adding Custom Fields

### **Method 1: Using JSONB metadata**

```python
# Add custom user data without schema change
user_data = {
    'user_id': 'user_123',
    'email': 'user@example.com',
    # ... other fields ...
    'metadata': {
        'favorite_color': 'blue',
        'lucky_number': 7,
        'custom_preference': 'detailed_readings'
    }
}
db.create_user(user_data)
```

### **Method 2: Add new columns (if needed)**

```sql
-- Add new column to users table
ALTER TABLE users ADD COLUMN vip_member BOOLEAN DEFAULT false;

-- Add new column with default JSON
ALTER TABLE astrologers ADD COLUMN social_media JSONB DEFAULT '{}'::jsonb;
```

---

## 📈 Built-in Views

### **Active Conversations**
```python
# Get active conversations with user and astrologer names
cursor.execute("SELECT * FROM active_conversations")
```

### **Astrologer Statistics**
```python
# Get astrologer performance stats
stats = db.get_astrologer_stats('ast_guru_001')
print(stats['average_user_rating'])
```

### **User Activity**
```python
# Get user engagement metrics
activity = db.get_user_stats('user_123')
print(activity['total_conversations'])
```

---

## 🔄 Migration from Current System

### **Step 1: Migrate Users**

```python
import json
from database_manager import db

# Read existing user_states.json
with open('user_states.json', 'r') as f:
    user_states = json.load(f)

# Migrate to database
for user_id, state in user_states.items():
    user_data = {
        'user_id': user_id,
        'full_name': state.get('name'),
        'display_name': state.get('name'),
        'language_preference': 'hi',
        'subscription_type': 'free',
        'metadata': state
    }
    db.create_user(user_data)
    
    # Update birth info if available
    if state.get('birth_date'):
        db.update_user_birth_info(user_id, {
            'birth_date': state.get('birth_date'),
            'birth_time': state.get('birth_time'),
            'birth_location': state.get('birth_location'),
            'birth_timezone': state.get('timezone')
        })
```

### **Step 2: Keep Both Systems (Hybrid)**

```python
# Save to both database and JSON file
def save_user_state(user_id, state_data):
    # Save to database
    db.create_user({
        'user_id': user_id,
        'metadata': state_data
    })
    
    # Also save to JSON (backup/fallback)
    with open('user_states.json', 'r+') as f:
        states = json.load(f)
        states[user_id] = state_data
        f.seek(0)
        json.dump(states, f, indent=2)
```

---

## 🧪 Testing

```bash
# Test database connection
python3 database_manager.py

# Run sample queries
python3 -c "
from database_manager import db
astrologers = db.get_all_astrologers()
print(f'Found {len(astrologers)} astrologers')
"
```

---

## 📊 Sample Astrologers

The schema includes 3 sample astrologers:

1. **AstroGuru** (`ast_guru_001`)
   - Vedic astrologer
   - Warm, wise personality
   - Hindi-speaking

2. **Mystic Guide** (`ast_mystic_002`)
   - Western astrologer
   - Friendly, modern approach
   - English-speaking

3. **Cosmic Sage** (`ast_cosmic_003`)
   - Traditional Jyotish expert
   - Spiritual, authoritative
   - Multi-lingual

---

## 🔐 Security Best Practices

1. **Never commit database credentials**
   ```bash
   # Already in .gitignore
   .env
   ```

2. **Use environment variables**
   ```python
   # Always use os.getenv()
   DB_PASSWORD = os.getenv('DB_PASSWORD')
   ```

3. **Enable SSL for AWS RDS**
   ```python
   db_config = {
       'sslmode': 'require',
       'sslrootcert': 'rds-ca-2019-root.pem'
   }
   ```

---

## 📝 Next Steps

1. ✅ Set up database (local or AWS)
2. ✅ Run schema initialization
3. ✅ Test connection
4. ⏭️ Integrate with voice agent
5. ⏭️ Migrate existing data
6. ⏭️ Add custom astrologers
7. ⏭️ Enable analytics

---

## 🆘 Troubleshooting

### **Connection refused**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
brew services start postgresql@14  # macOS
```

### **Permission denied**
```bash
# Grant permissions
psql -d astrovoice -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;"
```

### **Schema already exists**
```bash
# Drop and recreate (CAUTION: deletes all data)
dropdb astrovoice
createdb astrovoice
python3 database_manager.py
```

---

**Created:** October 4, 2025  
**Status:** ✅ Ready for use  
**Database:** PostgreSQL 14+  
**Python:** 3.8+

## 🚀 You're Ready!

Your database schema is production-ready and highly scalable!

