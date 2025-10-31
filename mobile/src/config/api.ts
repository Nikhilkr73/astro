/**
 * API Configuration for AstroVoice Mobile App
 * Handles environment-specific API URLs
 * 
 * AUTOMATIC BEHAVIOR:
 * - Production AAB (Google Play Store): Always uses AWS API Gateway
 * - Development (Android Studio/Emulator): Always uses local backend
 * 
 * No manual switching needed - it's automatic based on __DEV__ flag!
 */

import { Platform } from 'react-native';

// ============================================
// ⚙️ CONFIGURATION - For Development Only
// ============================================
// Only applies when __DEV__ = true (Android Studio, Expo, etc.)
const USE_PHYSICAL_DEVICE_IP = false; // true = physical device testing with local backend, false = emulator
const MAC_IP_ADDRESS = '192.168.0.105'; // Your Mac's IP address (find with: ifconfig | grep "inet " | grep -v 127.0.0.1)
// ============================================

// AWS Production API Gateway URL
const AWS_API_URL = 'https://4rdm6zfg0f.execute-api.ap-south-1.amazonaws.com/prod';

// Determine if we're in development mode
const isDevelopment = __DEV__;

// Get the appropriate base URL
const getBaseURL = () => {
  // Production builds (AAB from Play Store) always use AWS
  if (!isDevelopment) {
    return AWS_API_URL;
  }

  // Development mode: Use local backend for Android Studio/Emulator
  if (Platform.OS === 'ios') {
    return 'http://localhost:8000'; // iOS Simulator
  }

  if (Platform.OS === 'android') {
    if (USE_PHYSICAL_DEVICE_IP) {
      // Physical device with local backend (for testing)
      return `http://${MAC_IP_ADDRESS}:8000`;
    } else {
      // Android Emulator (special IP maps to host's localhost)
      return 'http://10.0.2.2:8000';
    }
  }

  // Web or default
  return 'http://localhost:8000';
};

// API Base URLs
export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  
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

