/**
 * Google Play Billing Service
 * 
 * TEMPORARILY DISABLED FOR APK BUILD
 * TODO: Re-enable after adding react-native-iap properly
 * 
 * Handles all Google Play In-App Purchase operations using react-native-iap.
 * Supports consumable products for wallet recharges.
 * 
 * Usage:
 *   import billingService from './services/billingService';
 *   
 *   await billingService.init();
 *   const purchase = await billingService.purchaseProduct('astro_recharge_100');
 *   await billingService.finalizePurchase(purchase);
 */

// TEMPORARILY COMMENTED OUT FOR BUILD
// import {
//   initConnection,
//   endConnection,
//   getProducts,
//   requestPurchase,
//   finishTransaction,
//   Purchase,
//   Product,
//   ProductPurchase,
//   PurchaseError
// } from 'react-native-iap';
import { Platform } from 'react-native';
// import { BILLING_CONFIG } from '../config/billing';
import { TEST_MODE, generateMockPurchase } from '../config/testMode';

// Mock types for temporary build
type Purchase = any;
type Product = any;
type ProductPurchase = any;

class BillingService {
  private isInitialized = false;
  private products: Product[] = [];

  /**
   * Initialize the billing connection with Google Play
   * TEMPORARILY IN MOCK MODE ONLY
   */
  async init(): Promise<boolean> {
    try {
      console.log('🧪 MOCK MODE: Billing initialized (IAP temporarily disabled for build)');
      this.isInitialized = true;
      return true;
    } catch (error: any) {
      console.error('❌ Billing init failed:', error);
      return false;
    }
  }

  /**
   * Load available products from Google Play
   * TEMPORARILY IN MOCK MODE ONLY
   */
  async loadProducts(): Promise<Product[]> {
    try {
      console.log('🧪 MOCK MODE: Returning empty products (IAP temporarily disabled)');
      return [];
    } catch (error: any) {
      console.error('❌ Failed to get products:', error);
      return [];
    }
  }

  /**
   * Get cached products (call loadProducts first)
   */
  getLoadedProducts(): Product[] {
    return this.products;
  }

  /**
   * Purchase a product by ID
   * Returns the purchase object if successful
   */
  async purchaseProduct(productId: string): Promise<ProductPurchase | null> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ Billing not initialized, initializing now...');
        const initialized = await this.init();
        if (!initialized && !TEST_MODE.MOCK_PURCHASES) {
          throw new Error('Billing service not available. Please build app with EAS or use physical device.');
        }
      }

      // MOCK MODE: Simulate purchase
      if (TEST_MODE.MOCK_PURCHASES) {
        console.log(`🧪 MOCK MODE: Simulating purchase for ${productId}`);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, TEST_MODE.MOCK_PURCHASE_DELAY));
        
        if (TEST_MODE.AUTO_SUCCEED) {
          const mockPurchase = generateMockPurchase(productId);
          console.log('✅ MOCK: Purchase successful');
          console.log('   Transaction ID:', mockPurchase.transactionId);
          console.log('   Purchase Token:', mockPurchase.purchaseToken.substring(0, 20) + '...');
          
          return mockPurchase as any as ProductPurchase;
        } else {
          throw new Error('MOCK: Purchase failed (AUTO_SUCCEED is false)');
        }
      }

      console.log(`🛒 MOCK: Initiating purchase for ${productId}`);
      
      // MOCK MODE ONLY
      const mockPurchase = generateMockPurchase(productId);
      console.log('✅ MOCK: Purchase successful');
      return mockPurchase as any as ProductPurchase;
      
    } catch (error: any) {
      // Handle user cancellation gracefully
      if (error.code === 'E_USER_CANCELLED') {
        console.log('ℹ️ User cancelled purchase');
        throw error; // Re-throw so caller can handle
      }
      
      // Handle IAP not available
      if (error.code === 'E_IAP_NOT_AVAILABLE') {
        throw new Error('In-app purchases not available. Please build app with EAS or use physical device with Google Play.');
      }
      
      // Handle other errors
      console.error('❌ Purchase failed:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      
      throw error;
    }
  }

  /**
   * Finalize a purchase (mark as consumed for consumable products)
   * This allows the product to be purchased again
   */
  async finalizePurchase(purchase: Purchase): Promise<void> {
    try {
      console.log('✅ Finalizing purchase:', purchase.transactionId);
      
      // MOCK MODE: Just log
      if (TEST_MODE.MOCK_PURCHASES) {
        console.log('🧪 MOCK MODE: Purchase finalized (skipped actual finalization)');
        return;
      }
      
      // MOCK MODE ONLY
      console.log('✅ MOCK: Purchase finalized (consumable)');
    } catch (error) {
      console.error('❌ Failed to finalize purchase:', error);
      throw error;
    }
  }

  /**
   * Restore purchases (for non-consumable products)
   * Note: Not typically used for consumable products, but available if needed
   */
  async restorePurchases(): Promise<Purchase[]> {
    try {
      console.log('🔄 Restoring purchases...');
      
      // Note: react-native-iap doesn't have a direct restore method
      // For consumables, this is typically not needed
      // For non-consumables, use getAvailablePurchases()
      
      console.warn('⚠️ Restore purchases not implemented for consumables');
      return [];
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      return [];
    }
  }

  /**
   * Disconnect from billing service
   * TEMPORARILY IN MOCK MODE ONLY
   */
  async disconnect(): Promise<void> {
    try {
      this.isInitialized = false;
      this.products = [];
      console.log('✅ MOCK: Billing connection closed');
    } catch (error) {
      console.error('❌ Failed to disconnect:', error);
    }
  }

  /**
   * Check if billing is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export default new BillingService();

