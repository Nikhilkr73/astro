/**
 * Storage Utility for AstroVoice Mobile App
 * Manages local data persistence using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
export const STORAGE_KEYS = {
  USER_ID: '@astrovoice:user_id',
  USER_DATA: '@astrovoice:user_data',
  AUTH_TOKEN: '@astrovoice:auth_token',
  WALLET_BALANCE: '@astrovoice:wallet_balance',
  IS_ONBOARDED: '@astrovoice:is_onboarded',
  PROFILE_COMPLETE: '@astrovoice:profile_complete',
  LAST_CONVERSATION: '@astrovoice:last_conversation',
  LAST_VISITED_SCREEN: '@astrovoice:last_visited_screen',
};

// =============================================================================
// USER DATA
// =============================================================================

export const storage = {
  /**
   * Save user ID
   */
  saveUserId: async (userId: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      console.log('✅ User ID saved:', userId);
    } catch (error) {
      console.error('❌ Error saving user ID:', error);
      throw error;
    }
  },

  /**
   * Get user ID
   */
  getUserId: async (): Promise<string | null> => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      return userId;
    } catch (error) {
      console.error('❌ Error getting user ID:', error);
      return null;
    }
  },

  /**
   * Save user data
   */
  saveUserData: async (userData: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('✅ User data saved');
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      throw error;
    }
  },

  /**
   * Get user data
   */
  getUserData: async (): Promise<any | null> => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  },

  /**
   * Save onboarding status
   */
  setOnboarded: async (isOnboarded: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, isOnboarded.toString());
      console.log('✅ Onboarding status saved:', isOnboarded);
    } catch (error) {
      console.error('❌ Error saving onboarding status:', error);
      throw error;
    }
  },

  /**
   * Check if user is onboarded
   */
  isOnboarded: async (): Promise<boolean> => {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.IS_ONBOARDED);
      return status === 'true';
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      return false;
    }
  },

  /**
   * Save wallet balance (for offline caching)
   */
  saveWalletBalance: async (balance: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET_BALANCE, balance.toString());
    } catch (error) {
      console.error('❌ Error saving wallet balance:', error);
    }
  },

  /**
   * Get cached wallet balance
   */
  getWalletBalance: async (): Promise<number> => {
    try {
      const balance = await AsyncStorage.getItem(STORAGE_KEYS.WALLET_BALANCE);
      return balance ? parseFloat(balance) : 0;
    } catch (error) {
      console.error('❌ Error getting wallet balance:', error);
      return 0;
    }
  },

  /**
   * Save last conversation ID
   */
  saveLastConversation: async (conversationId: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_CONVERSATION, conversationId);
    } catch (error) {
      console.error('❌ Error saving conversation ID:', error);
    }
  },

  /**
   * Get last conversation ID
   */
  getLastConversation: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_CONVERSATION);
    } catch (error) {
      console.error('❌ Error getting conversation ID:', error);
      return null;
    }
  },

  /**
   * Set user ID (alias for saveUserId for consistency)
   */
  setUserId: async (userId: string): Promise<void> => {
    return storage.saveUserId(userId);
  },

  /**
   * Set profile completion status
   */
  setProfileComplete: async (isComplete: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_COMPLETE, isComplete.toString());
      console.log('✅ Profile completion status saved:', isComplete);
    } catch (error) {
      console.error('❌ Error saving profile completion status:', error);
      throw error;
    }
  },

  /**
   * Get profile completion status
   */
  getProfileComplete: async (): Promise<boolean> => {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE_COMPLETE);
      return status === 'true';
    } catch (error) {
      console.error('❌ Error getting profile completion status:', error);
      return false;
    }
  },

  /**
   * Save last visited screen
   */
  setLastVisitedScreen: async (screen: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_VISITED_SCREEN, screen);
    } catch (error) {
      console.error('❌ Error saving last visited screen:', error);
    }
  },

  /**
   * Get last visited screen
   */
  getLastVisitedScreen: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_VISITED_SCREEN);
    } catch (error) {
      console.error('❌ Error getting last visited screen:', error);
      return null;
    }
  },

  /**
   * Clear user data (for logout)
   */
  clearUserData: async (): Promise<void> => {
    try {
      const keysToRemove = [
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.IS_ONBOARDED,
        STORAGE_KEYS.PROFILE_COMPLETE,
        STORAGE_KEYS.LAST_CONVERSATION,
        STORAGE_KEYS.LAST_VISITED_SCREEN,
      ];
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('✅ User data cleared');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
      throw error;
    }
  },

  /**
   * Clear user session data (keep user ID for re-login)
   */
  clearSession: async (): Promise<void> => {
    try {
      const keysToRemove = [
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.LAST_CONVERSATION,
      ];
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('✅ Session data cleared');
    } catch (error) {
      console.error('❌ Error clearing session:', error);
      throw error;
    }
  },
};

export default storage;

