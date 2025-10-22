/**
 * Google Play Billing Configuration
 * 
 * Product catalog matching backend database schema.
 * Based on screenshots with percentage-based bonuses.
 */

export interface RechargeProduct {
  productId: string;
  amount: number;
  bonusPercentage: number;
  bonusAmount: number;
  totalAmount: number;
  displayName: string;
  isMostPopular: boolean;
}

export const BILLING_CONFIG = {
  android: {
    productIds: [
      'astro_recharge_1',      // Test product
      'astro_recharge_50',
      'astro_recharge_100',
      'astro_recharge_200',
      'astro_recharge_500',
      'astro_recharge_1000'
    ]
  },
  ios: {
    // Future iOS product IDs (when App Store integration is added)
    productIds: []
  }
};

// Recharge products with bonus structure (matching screenshots)
export const RECHARGE_PRODUCTS: RechargeProduct[] = [
  {
    productId: 'astro_recharge_1',
    amount: 1,
    bonusPercentage: 0,
    bonusAmount: 0,
    totalAmount: 1,
    displayName: '₹1',
    isMostPopular: false
  },
  {
    productId: 'astro_recharge_50',
    amount: 50,
    bonusPercentage: 0,
    bonusAmount: 0,
    totalAmount: 50,
    displayName: '₹50',
    isMostPopular: false
  },
  {
    productId: 'astro_recharge_100',
    amount: 100,
    bonusPercentage: 10,
    bonusAmount: 10,
    totalAmount: 110,
    displayName: '₹100',
    isMostPopular: false
  },
  {
    productId: 'astro_recharge_200',
    amount: 200,
    bonusPercentage: 12.5,
    bonusAmount: 25,
    totalAmount: 225,
    displayName: '₹200',
    isMostPopular: true  // Marked as "Most Popular" in screenshots
  },
  {
    productId: 'astro_recharge_500',
    amount: 500,
    bonusPercentage: 15,
    bonusAmount: 75,
    totalAmount: 575,
    displayName: '₹500',
    isMostPopular: false
  },
  {
    productId: 'astro_recharge_1000',
    amount: 1000,
    bonusPercentage: 20,
    bonusAmount: 200,
    totalAmount: 1200,
    displayName: '₹1000',
    isMostPopular: false
  }
];

// Helper function to get product by ID
export const getProductById = (productId: string): RechargeProduct | undefined => {
  return RECHARGE_PRODUCTS.find(p => p.productId === productId);
};

// Helper function to get product by amount
export const getProductByAmount = (amount: number): RechargeProduct | undefined => {
  return RECHARGE_PRODUCTS.find(p => p.amount === amount);
};


