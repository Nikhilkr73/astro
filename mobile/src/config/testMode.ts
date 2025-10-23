/**
 * Test Mode Configuration
 * 
 * Enable mock purchases for testing in Expo Go without IAP
 */

export const TEST_MODE = {
  // Enable mock purchases (set to false for real Google Play testing)
  MOCK_PURCHASES: false,  // ← DISABLED for real Google Play testing
  
  // Mock purchase delay (milliseconds) to simulate Google Play
  MOCK_PURCHASE_DELAY: 1500,
  
  // Auto-succeed purchases (set to false to test error handling)
  AUTO_SUCCEED: true,
};

/**
 * Generate mock purchase data
 */
export const generateMockPurchase = (productId: string) => {
  const timestamp = Date.now();
  return {
    productId: productId,
    transactionId: `mock_txn_${timestamp}`,
    purchaseToken: `mock_token_${timestamp}_${Math.random().toString(36).substring(7)}`,
    transactionDate: timestamp,
    transactionReceipt: `mock_receipt_${timestamp}`,
  };
};

