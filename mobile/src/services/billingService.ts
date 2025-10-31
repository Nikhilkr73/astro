/**
 * Google Play Billing Service
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

import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  type Purchase,
  type Product,
  type ProductPurchase,
  type PurchaseError
} from 'react-native-iap';
import { Platform } from 'react-native';
import { TEST_MODE, generateMockPurchase } from '../config/testMode';
import { BILLING_CONFIG } from '../config/billing';

class BillingService {
  private isInitialized = false;
  private products: Product[] = [];

  /**
   * Initialize the billing connection with Google Play
   */
  async init(): Promise<boolean> {
    try {
      // Use mock mode if enabled (for testing without Google Play)
      if (TEST_MODE.MOCK_PURCHASES && Platform.OS !== 'android') {
        console.log('🧪 MOCK MODE: Billing initialized (IAP disabled in test mode)');
        this.isInitialized = true;
        return true;
      }

      // Initialize real Google Play billing connection
      await initConnection();
      this.isInitialized = true;
      console.log('✅ Billing connection initialized');
      return true;
    } catch (error: any) {
      console.error('❌ Billing init failed:', error);
      // Fall back to mock mode if real IAP fails
      if (TEST_MODE.MOCK_PURCHASES) {
        console.log('⚠️ Falling back to mock mode');
        this.isInitialized = true;
        return true;
      }
      return false;
    }
  }

  /**
   * Load available products from Google Play
   */
  async loadProducts(): Promise<Product[]> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      // Use mock mode if enabled
      if (TEST_MODE.MOCK_PURCHASES && !this.isInitialized) {
        console.log('🧪 MOCK MODE: Returning empty products');
        return [];
      }

      // Get products from Google Play
      const platform = Platform.OS === 'android' ? 'android' : 'ios';
      const productIds = BILLING_CONFIG[platform]?.productIds || [];
      
      if (productIds.length === 0) {
        console.warn('⚠️ No product IDs configured');
        return [];
      }

      const products = await getProducts({ skus: productIds });
      this.products = products;
      console.log(`✅ Loaded ${products.length} products from ${platform}`);
      return products;
    } catch (error: any) {
      console.error('❌ Failed to get products:', error);
      if (TEST_MODE.MOCK_PURCHASES) {
        console.log('🧪 MOCK MODE: Returning empty products due to error');
        return [];
      }
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

      // MOCK MODE: Simulate purchase (for testing)
      if (TEST_MODE.MOCK_PURCHASES && Platform.OS !== 'android') {
        console.log(`🧪 MOCK MODE: Simulating purchase for ${productId}`);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, TEST_MODE.MOCK_PURCHASE_DELAY));
        
        if (TEST_MODE.AUTO_SUCCEED) {
          const mockPurchase = generateMockPurchase(productId);
          console.log('✅ MOCK: Purchase successful');
          console.log('   Transaction ID:', mockPurchase.transactionId);
          console.log('   Purchase Token:', mockPurchase.purchaseToken.substring(0, 20) + '...');
          
          return mockPurchase as ProductPurchase;
        } else {
          throw new Error('MOCK: Purchase failed (AUTO_SUCCEED is false)');
        }
      }

      // Real Google Play purchase
      console.log(`🛒 Initiating purchase for ${productId}`);
      const purchase = await requestPurchase({ sku: productId });
      
      if (!purchase) {
        throw new Error('Purchase failed: No purchase returned');
      }

      console.log('✅ Purchase successful:', purchase.transactionId);
      return purchase as ProductPurchase;
      
    } catch (error: any) {
      // Handle user cancellation gracefully
      if (error.code === 'E_USER_CANCELLED') {
        console.log('ℹ️ User cancelled purchase');
        throw error; // Re-throw so caller can handle
      }
      
      // Handle IAP not available
      if (error.code === 'E_IAP_NOT_AVAILABLE') {
        // Fall back to mock if enabled
        if (TEST_MODE.MOCK_PURCHASES) {
          console.log('🧪 MOCK MODE: IAP not available, using mock purchase');
          return generateMockPurchase(productId) as ProductPurchase;
        }
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
      if (TEST_MODE.MOCK_PURCHASES && Platform.OS !== 'android') {
        console.log('🧪 MOCK MODE: Purchase finalized (skipped actual finalization)');
        return;
      }
      
      // Finalize purchase with Google Play (mark as consumed)
      await finishTransaction({ purchase, isConsumable: true });
      console.log('✅ Purchase finalized (consumable)');
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
   */
  async disconnect(): Promise<void> {
    try {
      if (this.isInitialized && !TEST_MODE.MOCK_PURCHASES) {
        await endConnection();
      }
      this.isInitialized = false;
      this.products = [];
      console.log('✅ Billing connection closed');
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

