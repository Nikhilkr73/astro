/**
 * API Configuration for AstroVoice Mobile App
 * Handles environment-specific API URLs
 */

import { Platform } from 'react-native';

// Determine if we're in development mode
const isDevelopment = __DEV__;

// API Base URLs
export const API_CONFIG = {
  // For local development:
  // - iOS Simulator: use localhost
  // - Android Emulator: use 10.0.2.2
  // - Physical Device: use your computer's IP address (e.g., 192.168.x.x)
  BASE_URL: isDevelopment
    ? Platform.select({
        ios: 'http://localhost:8000',
        android: 'http://10.0.2.2:8000',
        web: 'http://localhost:8000',
        default: 'http://localhost:8000',
      })
    : 'https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/prod', // Will be updated after CDK deploy
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Users
  USERS_REGISTER: '/api/users/register',
  USERS_GET: (userId: string) => `/api/users/${userId}`,
  USERS_UPDATE: (userId: string) => `/api/users/${userId}`,
  
  // Astrologers
  ASTROLOGERS_LIST: '/api/astrologers',
  ASTROLOGERS_GET: (astrologerId: string) => `/api/astrologers/${astrologerId}`,
  
  // Chat
  CHAT_START: '/api/chat/start',
  CHAT_MESSAGE: '/api/chat/message',
  CHAT_HISTORY: (conversationId: string) => `/api/chat/history/${conversationId}`,
  CHAT_END: '/api/chat/end',
  
  // Reviews
  REVIEWS_SUBMIT: '/api/reviews/submit',
  
  // Wallet
  WALLET_GET: (userId: string) => `/api/wallet/${userId}`,
  WALLET_RECHARGE: '/api/wallet/recharge',
  WALLET_TRANSACTIONS: (userId: string) => `/api/wallet/transactions/${userId}`,
};

export default API_CONFIG;

