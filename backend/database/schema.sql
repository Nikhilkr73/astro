-- AstroVoice Database Schema
-- PostgreSQL Database for Users and Astrologers
-- Designed for scalability and future extensions

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    full_name VARCHAR(255),
    display_name VARCHAR(100),
    
    -- Authentication
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) DEFAULT 'email', -- email, google, apple, phone
    
    -- Profile
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_picture_url TEXT,
    language_preference VARCHAR(10) DEFAULT 'hi', -- hi, en, etc.
    
    -- Birth Details (for astrology)
    birth_date DATE,
    birth_time TIME,
    birth_location VARCHAR(255),
    birth_timezone VARCHAR(100),
    birth_latitude DECIMAL(10, 8),
    birth_longitude DECIMAL(11, 8),
    
    -- Preferences
    preferred_astrology_system VARCHAR(50) DEFAULT 'vedic', -- vedic, western, chinese
    notification_preferences JSONB DEFAULT '{"daily": true, "weekly": true, "transits": true}'::jsonb,
    
    -- Subscription
    subscription_type VARCHAR(50) DEFAULT 'free', -- free, basic, premium, enterprise
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    
    -- Status
    account_status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    -- Additional Data (flexible JSONB for future extensions)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes for performance
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_subscription ON users(subscription_type);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);

-- =============================================================================
-- ASTROLOGERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS astrologers (
    astrologer_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    
    -- Profile
    bio TEXT,
    specialization VARCHAR(255), -- vedic, western, tarot, numerology, etc.
    expertise_areas TEXT[], -- ARRAY: ['love', 'career', 'health', 'finance']
    languages TEXT[], -- ARRAY: ['hindi', 'english', 'tamil']
    
    -- Experience
    years_of_experience INTEGER,
    certifications TEXT[],
    education TEXT,
    
    -- Personality (for voice agent)
    personality_type VARCHAR(100), -- wise_elder, friendly_guide, mystical_sage
    speaking_style VARCHAR(100), -- formal, casual, spiritual, professional
    voice_tone VARCHAR(50), -- warm, authoritative, gentle, energetic
    
    -- AI Configuration
    system_prompt TEXT, -- Custom system prompt for this astrologer
    response_style JSONB DEFAULT '{"length": "medium", "formality": "moderate"}'::jsonb,
    greeting_message TEXT,
    
    -- Media
    profile_picture_url TEXT,
    sample_audio_url TEXT,
    video_intro_url TEXT,
    
    -- Ratings & Stats
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_consultations INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    availability_schedule JSONB, -- Flexible schedule in JSON
    
    -- Pricing
    consultation_rate DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional Data (flexible JSONB for future extensions)
    metadata JSONB DEFAULT '{}'::jsonb,
    custom_fields JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_astrologers_specialization ON astrologers(specialization);
CREATE INDEX idx_astrologers_rating ON astrologers(rating DESC);
CREATE INDEX idx_astrologers_is_active ON astrologers(is_active);
CREATE INDEX idx_astrologers_metadata ON astrologers USING GIN (metadata);
CREATE INDEX idx_astrologers_custom_fields ON astrologers USING GIN (custom_fields);

-- =============================================================================
-- CONVERSATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    astrologer_id VARCHAR(255) NOT NULL REFERENCES astrologers(astrologer_id) ON DELETE CASCADE,
    
    -- Conversation Details
    title VARCHAR(500),
    topic VARCHAR(255), -- love, career, health, general
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, completed, abandoned
    
    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    last_message_at TIMESTAMP,
    
    -- Metrics
    total_messages INTEGER DEFAULT 0,
    total_duration_seconds INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_astrologer FOREIGN KEY (astrologer_id) REFERENCES astrologers(astrologer_id)
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_astrologer ON conversations(astrologer_id);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);
CREATE INDEX idx_conversations_status ON conversations(status);

-- =============================================================================
-- MESSAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS messages (
    message_id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    
    -- Message Details
    sender_type VARCHAR(50) NOT NULL, -- user, astrologer, system
    message_type VARCHAR(50) DEFAULT 'text', -- text, audio, image, video
    content TEXT,
    
    -- Audio Details (if message_type = 'audio')
    audio_url TEXT,
    audio_duration_seconds INTEGER,
    audio_format VARCHAR(20), -- m4a, wav, mp3
    transcription TEXT,
    
    -- AI Details
    ai_model VARCHAR(100), -- gpt-4o-mini, gemini-flash, etc.
    tokens_used INTEGER,
    
    -- Timestamps
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_sender_type ON messages(sender_type);

-- =============================================================================
-- USER_PROFILES TABLE (Astrology-specific data)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Birth Chart Data
    sun_sign VARCHAR(50),
    moon_sign VARCHAR(50),
    rising_sign VARCHAR(50),
    
    -- Vedic Astrology
    rashi VARCHAR(50),
    nakshatra VARCHAR(50),
    
    -- Numerology
    life_path_number INTEGER,
    destiny_number INTEGER,
    
    -- Reading History
    total_readings INTEGER DEFAULT 0,
    last_reading_date TIMESTAMP,
    favorite_topics TEXT[],
    
    -- Preferences
    preferred_reading_style VARCHAR(100), -- detailed, quick, spiritual, practical
    
    -- Metadata
    chart_data JSONB, -- Complete birth chart in JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional flexible data
    additional_data JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT fk_user_profile FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);

-- =============================================================================
-- READINGS TABLE (Consultation/Reading Records)
-- =============================================================================
CREATE TABLE IF NOT EXISTS readings (
    reading_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    astrologer_id VARCHAR(255) NOT NULL REFERENCES astrologers(astrologer_id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    
    -- Reading Details
    reading_type VARCHAR(100), -- daily, weekly, compatibility, detailed_chart
    topic VARCHAR(255), -- love, career, health, finance, general
    
    -- Content
    reading_text TEXT,
    reading_audio_url TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed', -- pending, in_progress, completed
    
    -- Payment
    amount_paid DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_status VARCHAR(50) DEFAULT 'free', -- free, paid, pending
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Rating
    user_rating INTEGER, -- 1-5
    user_feedback TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT fk_reading_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_reading_astrologer FOREIGN KEY (astrologer_id) REFERENCES astrologers(astrologer_id),
    CONSTRAINT valid_rating CHECK (user_rating >= 1 AND user_rating <= 5)
);

CREATE INDEX idx_readings_user ON readings(user_id);
CREATE INDEX idx_readings_astrologer ON readings(astrologer_id);
CREATE INDEX idx_readings_requested_at ON readings(requested_at DESC);
CREATE INDEX idx_readings_topic ON readings(topic);

-- =============================================================================
-- USER_SESSIONS TABLE (Track active sessions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Session Details
    device_type VARCHAR(50), -- ios, android, web
    device_info JSONB,
    ip_address VARCHAR(50),
    location VARCHAR(255),
    
    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_sessions_started_at ON user_sessions(started_at DESC);

-- =============================================================================
-- TRIGGERS (Auto-update timestamps)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_astrologers_updated_at BEFORE UPDATE ON astrologers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VIEWS (Convenient queries)
-- =============================================================================

-- Active Conversations View
CREATE OR REPLACE VIEW active_conversations AS
SELECT 
    c.conversation_id,
    c.user_id,
    u.display_name as user_name,
    c.astrologer_id,
    a.display_name as astrologer_name,
    c.topic,
    c.total_messages,
    c.started_at,
    c.last_message_at
FROM conversations c
JOIN users u ON c.user_id = u.user_id
JOIN astrologers a ON c.astrologer_id = a.astrologer_id
WHERE c.status = 'active'
ORDER BY c.last_message_at DESC;

-- Astrologer Statistics View
CREATE OR REPLACE VIEW astrologer_stats AS
SELECT 
    a.astrologer_id,
    a.display_name,
    a.rating,
    a.total_consultations,
    COUNT(DISTINCT c.conversation_id) as active_conversations,
    COUNT(DISTINCT r.reading_id) as total_readings,
    AVG(r.user_rating) as average_user_rating
FROM astrologers a
LEFT JOIN conversations c ON a.astrologer_id = c.astrologer_id AND c.status = 'active'
LEFT JOIN readings r ON a.astrologer_id = r.astrologer_id
GROUP BY a.astrologer_id, a.display_name, a.rating, a.total_consultations;

-- User Activity View
CREATE OR REPLACE VIEW user_activity AS
SELECT 
    u.user_id,
    u.display_name,
    u.email,
    u.subscription_type,
    COUNT(DISTINCT c.conversation_id) as total_conversations,
    COUNT(DISTINCT r.reading_id) as total_readings,
    MAX(c.last_message_at) as last_activity,
    u.created_at as joined_at
FROM users u
LEFT JOIN conversations c ON u.user_id = c.user_id
LEFT JOIN readings r ON u.user_id = r.user_id
GROUP BY u.user_id, u.display_name, u.email, u.subscription_type, u.created_at;

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Insert Sample Astrologers
INSERT INTO astrologers (
    astrologer_id, name, display_name, bio, specialization, 
    expertise_areas, languages, years_of_experience, personality_type,
    speaking_style, voice_tone, system_prompt, greeting_message, is_active, is_featured
) VALUES
('ast_guru_001', 'Pandit Ramesh Sharma', 'AstroGuru', 
 'Experienced Vedic astrologer with 25+ years of practice. Specializes in life guidance and birth chart analysis.',
 'vedic', ARRAY['love', 'career', 'health', 'finance'], ARRAY['hindi', 'english'],
 25, 'wise_elder', 'formal', 'warm',
 'You are AstroGuru, a wise and compassionate Vedic astrologer. Speak in Hindi with warmth and wisdom.',
 'नमस्ते! मैं AstroGuru हूं, आपका व्यक्तिगत ज्योतिष गाइड। मैं आपकी कैसे मदद कर सकता हूं?',
 true, true),

('ast_mystic_002', 'Sanjana Mishra', 'Mystic Guide', 
 'Modern astrologer combining traditional wisdom with contemporary insights.',
 'western', ARRAY['love', 'relationships', 'personal_growth'], ARRAY['english', 'hindi'],
 10, 'friendly_guide', 'casual', 'gentle',
 'You are Mystic Guide, a friendly and approachable astrologer. Mix wisdom with warmth.',
 'Hello! I''m Mystic Guide. Let''s explore your cosmic journey together!',
 true, true),

('ast_cosmic_003', 'Dr. Vikram Rao', 'Cosmic Sage',
 'Ph.D. in Jyotish Shastra. Expert in predictive astrology and remedial measures.',
 'vedic', ARRAY['career', 'business', 'education', 'health'], ARRAY['hindi', 'english', 'tamil'],
 30, 'mystical_sage', 'spiritual', 'authoritative',
 'You are Cosmic Sage, a deeply spiritual and learned astrologer. Share wisdom with authority and grace.',
 'ॐ। मैं Cosmic Sage हूं। आपके जीवन के रहस्यों को समझने में मैं आपकी सहायता करूंगा।',
 true, false);

-- =============================================================================
-- WALLETS TABLE (User wallet for consultations)
-- =============================================================================
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallets_balance ON wallets(balance);

-- =============================================================================
-- TRANSACTIONS TABLE (Wallet transaction history)
-- =============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id VARCHAR(255) NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL, -- recharge, deduction, refund
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2),
    balance_after DECIMAL(10, 2),
    
    -- Payment Details
    payment_method VARCHAR(50), -- upi, card, netbanking, cash
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    payment_reference VARCHAR(255), -- External payment gateway reference
    
    -- Reference
    reference_type VARCHAR(50), -- conversation, reading, recharge
    reference_id VARCHAR(255), -- conversation_id or reading_id
    
    -- Description
    description TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_transaction_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id)
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(payment_status);

-- =============================================================================
-- OTP_VERIFICATIONS TABLE (Phone number verification)
-- =============================================================================
CREATE TABLE IF NOT EXISTS otp_verifications (
    verification_id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'sent', -- sent, verified, expired, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    
    -- User Relationship (for data persistence across sessions)
    user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Message Central Integration
    message_central_customer_id VARCHAR(50), -- C-F9FB8D3FEFDB406
    message_central_verification_id VARCHAR(50), -- From API response
    
    -- Rate limiting and security
    attempts INTEGER DEFAULT 0,
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    -- Metadata (flexible for future extensions)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT valid_phone CHECK (phone_number ~ '^[0-9]{10}$'),
    CONSTRAINT valid_otp CHECK (otp_code ~ '^[0-9]{6}$'),
    CONSTRAINT valid_status CHECK (status IN ('sent', 'verified', 'expired', 'failed')),
    CONSTRAINT valid_customer_id CHECK (message_central_customer_id ~ '^C-[A-F0-9]+$')
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX idx_otp_status ON otp_verifications(status);
CREATE INDEX idx_otp_created_at ON otp_verifications(created_at DESC);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);
CREATE INDEX idx_otp_user_id ON otp_verifications(user_id);
CREATE INDEX idx_otp_customer_id ON otp_verifications(message_central_customer_id);
CREATE INDEX idx_otp_mc_verification_id ON otp_verifications(message_central_verification_id);

-- =============================================================================
-- SESSION_REVIEWS TABLE (Chat session reviews and ratings)
-- =============================================================================
CREATE TABLE IF NOT EXISTS session_reviews (
    review_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    astrologer_id VARCHAR(255) NOT NULL REFERENCES astrologers(astrologer_id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) REFERENCES conversations(conversation_id) ON DELETE SET NULL,
    
    -- Review Details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    session_duration VARCHAR(50), -- "05:23" format
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_review_astrologer FOREIGN KEY (astrologer_id) REFERENCES astrologers(astrologer_id),
    CONSTRAINT fk_review_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
);

CREATE INDEX idx_session_reviews_user ON session_reviews(user_id);
CREATE INDEX idx_session_reviews_astrologer ON session_reviews(astrologer_id);
CREATE INDEX idx_session_reviews_conversation ON session_reviews(conversation_id);
CREATE INDEX idx_session_reviews_rating ON session_reviews(rating);
CREATE INDEX idx_session_reviews_created_at ON session_reviews(created_at DESC);

-- =============================================================================
-- TRIGGERS (Auto-update timestamps for new tables)
-- =============================================================================
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE users IS 'Main users table with all user information';
COMMENT ON TABLE astrologers IS 'Astrologer profiles with customizable personalities';
COMMENT ON TABLE conversations IS 'User-astrologer conversation sessions';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON TABLE readings IS 'Completed astrology readings and consultations';
COMMENT ON TABLE user_profiles IS 'Extended astrology-specific user data';
COMMENT ON TABLE user_sessions IS 'User session tracking for security and analytics';
COMMENT ON TABLE wallets IS 'User wallet for managing consultation credits';
COMMENT ON TABLE transactions IS 'Transaction history for all wallet operations';
COMMENT ON TABLE otp_verifications IS 'OTP verification for phone number authentication with user linking';
COMMENT ON COLUMN otp_verifications.user_id IS 'Links OTP verification to user account for data persistence';
COMMENT ON COLUMN otp_verifications.message_central_customer_id IS 'Message Central customer ID (e.g., C-F9FB8D3FEFDB406)';
COMMENT ON COLUMN otp_verifications.message_central_verification_id IS 'Message Central verification ID from API response';
COMMENT ON TABLE session_reviews IS 'User reviews and ratings for chat sessions';

COMMENT ON COLUMN users.metadata IS 'Flexible JSONB field for future user attributes';
COMMENT ON COLUMN astrologers.custom_fields IS 'Flexible JSONB for astrologer-specific data';
COMMENT ON COLUMN astrologers.system_prompt IS 'Custom AI system prompt for this astrologer personality';
COMMENT ON COLUMN wallets.balance IS 'Current wallet balance in specified currency';
COMMENT ON COLUMN transactions.reference_id IS 'Links transaction to conversation or reading';
COMMENT ON COLUMN session_reviews.session_duration IS 'Duration of chat session in MM:SS format';

