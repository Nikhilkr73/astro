/**
 * Feature Flags Configuration
 * Controls which features are enabled/disabled in the app
 */

export const FEATURE_FLAGS = {
  // Voice chat functionality
  VOICE_CHAT_ENABLED: false, // Disabled for testing - no privacy policy required
  
  // Other features
  WALLET_ENABLED: true,
  CHAT_ENABLED: true,
  PROFILE_ENABLED: true,
  IAP_ENABLED: true,
} as const;

// Type for feature flags
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return FEATURE_FLAGS[flag];
};

// Helper function to get all enabled features
export const getEnabledFeatures = (): string[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature);
};

export default FEATURE_FLAGS;
