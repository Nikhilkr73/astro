/**
 * API Service for AstroVoice Mobile App
 * Handles all HTTP requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import type { Astrologer } from '../types';
import storage from '../utils/storage';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface UserRegistrationData {
  user_id?: string; // CRITICAL: Must include user_id from OTP verification to prevent duplicate users
  phone_number: string;
  full_name: string;
  date_of_birth: string; // DD/MM/YYYY
  time_of_birth: string; // HH:MM AM/PM
  place_of_birth: string;
  gender?: string;
}

export interface ChatSessionData {
  user_id: string;
  astrologer_id: string;
  topic?: string;
}

export interface ChatMessageData {
  conversation_id: string;
  sender_type: 'user' | 'astrologer';
  content: string;
  message_type?: string;
}

export interface SessionReviewData {
  user_id: string;
  astrologer_id: string;
  conversation_id: string;
  rating: number;
  review_text?: string;
  session_duration: string;
}

export interface WalletRechargeData {
  user_id: string;
  amount: number;
  payment_method: string;
  payment_reference?: string;
}

export interface ConversationEndData {
  conversation_id: string;
  duration_seconds: number;
}

export interface OTPRequestData {
  phone_number: string;
}

export interface OTPVerificationData {
  phone_number: string;
  otp_code: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expires_in?: number;
  retry_after?: number;
  user_id?: string;
  profile_complete?: boolean;
  missing_fields?: string[];
}

// =============================================================================
// API SERVICE
// =============================================================================

export const apiService = {
  /**
   * Health Check
   */
  healthCheck: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // ===========================================================================
  // AUTHENTICATION APIs
  // ===========================================================================

  /**
   * Send OTP to phone number for verification
   */
  sendOTP: async (phoneNumber: string): Promise<OTPResponse> => {
    try {
      const otpRequest: OTPRequestData = {
        phone_number: phoneNumber,
      };
      const response = await apiClient.post('/api/auth/send-otp', otpRequest);
      return response.data;
    } catch (error) {
      console.error('Send OTP failed:', error);
      throw error;
    }
  },

  /**
   * Verify OTP code for phone number
   */
  verifyOTP: async (phoneNumber: string, otpCode: string): Promise<OTPResponse> => {
    try {
      const otpVerification: OTPVerificationData = {
        phone_number: phoneNumber,
        otp_code: otpCode,
      };
      const response = await apiClient.post('/api/auth/verify-otp', otpVerification);
      return response.data;
    } catch (error) {
      console.error('Verify OTP failed:', error);
      throw error;
    }
  },

  // ===========================================================================
  // USER APIs
  // ===========================================================================

  /**
   * Register new user or update existing
   * Automatically creates wallet with ₹500 welcome bonus
   */
  registerUser: async (userData: UserRegistrationData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USERS_REGISTER, userData);
      return response.data;
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  },

  /**
   * Get user profile with birth details
   */
  getUserProfile: async (userId: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS_GET(userId));
      return response.data;
    } catch (error) {
      console.error('Get user profile failed:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (userId: string, updateData: Partial<UserRegistrationData>) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USERS_UPDATE(userId), updateData);
      return response.data;
    } catch (error) {
      console.error('Update user profile failed:', error);
      throw error;
    }
  },

  // ===========================================================================
  // ASTROLOGER APIs
  // ===========================================================================

  /**
   * Get all active astrologers
   * Optionally filter by category
   */
  getAllAstrologers: async (category?: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ASTROLOGERS_LIST, {
        params: category ? { category } : undefined,
      });
      return response.data;
    } catch (error) {
      console.error('Get astrologers failed:', error);
      throw error;
    }
  },

  /**
   * Get detailed astrologer profile
   */
  getAstrologerDetails: async (astrologerId: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ASTROLOGERS_GET(astrologerId));
      return response.data;
    } catch (error) {
      console.error('Get astrologer details failed:', error);
      throw error;
    }
  },

  // ===========================================================================
  // CHAT APIs
  // ===========================================================================

  /**
   * Start new chat session
   * Checks wallet balance before starting
   */
  startChatSession: async (userId: string, astrologerId: string, topic: string = 'general') => {
    try {
      const sessionData: ChatSessionData = {
        user_id: userId,
        astrologer_id: astrologerId,
        topic,
      };
      const response = await apiClient.post(API_ENDPOINTS.CHAT_START, sessionData);
      return response.data;
    } catch (error) {
      console.error('Start chat session failed:', error);
      throw error;
    }
  },

  /**
   * Send message in chat
   */
  sendMessage: async (conversationId: string, senderType: 'user' | 'astrologer', content: string) => {
    try {
      const messageData: ChatMessageData = {
        conversation_id: conversationId,
        sender_type: senderType,
        content,
        message_type: 'text',
      };
      const response = await apiClient.post(API_ENDPOINTS.CHAT_MESSAGE, messageData);
      return response.data;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  },

  /**
   * Get AI response from OpenAI chat handler
   */
  getAIResponse: async (conversationId: string, message: string, astrologerId: string) => {
    try {
      const userId = await storage.getUserId() || 'mobile_user';
      const aiRequest = {
        conversation_id: conversationId,
        user_id: userId,
        astrologer_id: astrologerId,
        message: message,
      };
      const response = await apiClient.post('/api/chat/send', aiRequest);
      return response.data;
    } catch (error) {
      console.error('Get AI response failed:', error);
      throw error;
    }
  },

  /**
   * Get chat history
   */
  getChatHistory: async (conversationId: string, limit: number = 50) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHAT_HISTORY(conversationId), {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Get chat history failed:', error);
      throw error;
    }
  },

  /**
   * End chat conversation
   */
  endConversation: async (conversationId: string, durationSeconds: number) => {
    try {
      const endData: ConversationEndData = {
        conversation_id: conversationId,
        duration_seconds: durationSeconds,
      };
      const response = await apiClient.post(API_ENDPOINTS.CHAT_END, endData);
      return response.data;
    } catch (error) {
      console.error('End conversation failed:', error);
      throw error;
    }
  },

  // ===========================================================================
  // REVIEW APIs
  // ===========================================================================

  /**
   * Submit chat session review
   */
  submitReview: async (reviewData: SessionReviewData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REVIEWS_SUBMIT, reviewData);
      return response.data;
    } catch (error) {
      console.error('Submit review failed:', error);
      throw error;
    }
  },

  // ===========================================================================
  // WALLET APIs
  // ===========================================================================

  /**
   * Get user wallet balance and recent transactions
   */
  getWalletBalance: async (userId: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALLET_GET(userId));
      return response.data;
    } catch (error) {
      console.error('Get wallet balance failed:', error);
      throw error;
    }
  },

  /**
   * Recharge wallet
   */
  rechargeWallet: async (userId: string, amount: number, paymentMethod: string, paymentReference?: string) => {
    try {
      const rechargeData: WalletRechargeData = {
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
      };
      const response = await apiClient.post(API_ENDPOINTS.WALLET_RECHARGE, rechargeData);
      return response.data;
    } catch (error) {
      console.error('Wallet recharge failed:', error);
      throw error;
    }
  },

  /**
   * Get user transaction history
   */
  getTransactions: async (userId: string, limit: number = 20) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALLET_TRANSACTIONS(userId), {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Get transactions failed:', error);
      throw error;
    }
  },

  /**
   * Get user's conversation history
   */
  getUserConversations: async (userId: string, limit: number = 20) => {
    try {
      const response = await apiClient.get(`/api/chat/conversations/${userId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Get user conversations failed:', error);
      throw error;
    }
  },

  /**
   * Get astrologer details by ID
   */
  getAstrologer: async (astrologerId: string) => {
    try {
      const response = await apiClient.get(`/api/astrologers/${astrologerId}`);
      return response.data;
    } catch (error) {
      console.error('Get astrologer failed:', error);
      throw error;
    }
  },

  /**
   * Get session status
   */
  getSessionStatus: async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/api/chat/session/status/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Get session status failed:', error);
      throw error;
    }
  },

  // =============================================================================
  // PERSISTENT CHAT SESSION MANAGEMENT
  // =============================================================================

  /**
   * Pause an active chat session
   */
  pauseChatSession: async (conversationId: string) => {
    try {
      const sessionData = {
        conversation_id: conversationId,
        paused_at: new Date().toISOString(),
      };
      const response = await apiClient.post('/api/chat/session/pause', sessionData);
      return response.data;
    } catch (error) {
      console.error('Pause chat session failed:', error);
      throw error;
    }
  },

  /**
   * Resume a paused chat session
   */
  resumeChatSession: async (conversationId: string) => {
    try {
      const sessionData = {
        conversation_id: conversationId,
        resumed_at: new Date().toISOString(),
      };
      const response = await apiClient.post('/api/chat/session/resume', sessionData);
      return response.data;
    } catch (error) {
      console.error('Resume chat session failed:', error);
      throw error;
    }
  },

  /**
   * End a chat session
   */
  endChatSession: async (conversationId: string, totalDuration: number) => {
    try {
      const sessionData = {
        conversation_id: conversationId,
        ended_at: new Date().toISOString(),
        total_duration: totalDuration,
      };
      const response = await apiClient.post('/api/chat/session/end', sessionData);
      return response.data;
    } catch (error) {
      console.error('End chat session failed:', error);
      throw error;
    }
  },

  /**
   * Get session status and details
   */
  getSessionStatus: async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/api/chat/session/status/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Get session status failed:', error);
      throw error;
    }
  },
};

export default apiService;

