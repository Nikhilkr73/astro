/**
 * API Configuration for AstroVoice Mobile App
 * Handles environment-specific API URLs
 * 
 * IMPORTANT: Switch between EMULATOR and PHYSICAL_DEVICE modes:
 * - For Emulator: Set USE_PHYSICAL_DEVICE_IP = false
 * - For APK/AAB on Physical Device: Set USE_PHYSICAL_DEVICE_IP = true
 */

import { Platform } from 'react-native';

// ============================================
// ⚙️ CONFIGURATION - Switch this flag as needed
// ============================================
const USE_PHYSICAL_DEVICE_IP = false; // true = physical device APK/AAB, false = emulator
const MAC_IP_ADDRESS = '192.168.0.105'; // Your Mac's IP address (find with: ifconfig | grep "inet " | grep -v 127.0.0.1)
// ============================================

// Determine if we're in development mode
const isDevelopment = __DEV__;

// Get the appropriate base URL
const getBaseURL = () => {
  if (!isDevelopment) {
    // Production: Use AWS API Gateway
    return 'https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/prod';
  }

  // Development: Choose based on platform and device type
  if (Platform.OS === 'ios') {
    return 'http://localhost:8000'; // iOS Simulator
  }

  if (Platform.OS === 'android') {
    if (USE_PHYSICAL_DEVICE_IP) {
      return `http://${MAC_IP_ADDRESS}:8000`; // Physical device or APK/AAB
    } else {
      return 'http://10.0.2.2:8000'; // Android Emulator (special IP maps to host's localhost)
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

