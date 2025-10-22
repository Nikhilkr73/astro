import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import apiService from '../services/apiService';
import billingService from '../services/billingService';
import storage from '../utils/storage';
import {colors, typography, spacing, borderRadius, shadows, gradients, touchableOpacity} from '../constants/theme';
import {RECHARGE_PRODUCTS, RechargeProduct} from '../config/billing';
import {TEST_MODE} from '../config/testMode';

type WalletScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Transaction {
  transaction_id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
  payment_status: string;
}

const WalletScreen = () => {
  const navigation = useNavigation<WalletScreenNavigationProp>();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RechargeProduct | null>(null);

  // Load wallet data
  const loadWalletData = async () => {
    try {
      const userId = await storage.getUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }
      
      // Get wallet balance and transactions
      const response = await apiService.getWalletBalance(userId);
      if (response.success) {
        setWalletBalance(response.balance);
        setTransactions(response.transactions || []);
        await storage.saveWalletBalance(response.balance);
        console.log(`✅ Wallet loaded: ₹${response.balance}`);
      }
    } catch (error) {
      console.error('❌ Failed to load wallet:', error);
      // Load cached balance
      const cachedBalance = await storage.getWalletBalance();
      setWalletBalance(cachedBalance);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadWalletData();
  }, []);

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadWalletData();
  };

  // Initialize billing service on mount
  useEffect(() => {
    const initBilling = async () => {
      try {
        await billingService.init();
        console.log('✅ Billing service initialized');
      } catch (error) {
        console.error('❌ Billing init failed:', error);
      }
    };
    initBilling();
  }, []);

  const handleProductSelect = (product: RechargeProduct) => {
    setSelectedProduct(product);
  };

  const handleContinue = async () => {
    if (!selectedProduct) {
      Alert.alert('Select Amount', 'Please select a recharge amount to continue');
      return;
    }

    try {
      setIsPurchasing(true);
      
      const userId = await storage.getUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found. Please login again.');
        setIsPurchasing(false);
        return;
      }

      console.log(`🛒 Starting purchase for ${selectedProduct.productId}`);
      
      // Trigger Google Play purchase
      const purchase = await billingService.purchaseProduct(selectedProduct.productId);
      
      if (!purchase || !purchase.purchaseToken) {
        throw new Error('Purchase token not received');
      }

      console.log('✅ Google Play purchase successful, verifying with backend...');

      // Verify purchase with backend
      const response = await apiService.verifyGooglePlayPurchase(
        userId,
        selectedProduct.productId,
        purchase.purchaseToken,
        purchase.transactionId || `android_${Date.now()}`,
        'android'
      );

      if (response.success) {
        // Finalize purchase (mark as consumed)
        await billingService.finalizePurchase(purchase);
        
        console.log(`✅ Purchase complete! Credited: ₹${response.total_credited}`);
        
        // Update local balance
        await storage.saveWalletBalance(response.new_balance);
        setWalletBalance(response.new_balance);
        
        // Show success with bonus details
        let message = `₹${response.amount_paid} added to your wallet`;
        if (response.total_bonus > 0) {
          message += `\n\n🎉 Bonus: ₹${response.total_bonus}`;
          if (response.first_time_bonus > 0) {
            message += `\n• First-time bonus: ₹${response.first_time_bonus}`;
          }
          if (response.product_bonus > 0) {
            message += `\n• Product bonus: ₹${response.product_bonus}`;
          }
          message += `\n\nTotal credited: ₹${response.total_credited}`;
        }
        
        Alert.alert('Recharge Successful! 🎉', message, [
          {
            text: 'OK',
            onPress: () => {
              setSelectedProduct(null);
              loadWalletData();
            }
          }
        ]);
      }
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      
      // Handle user cancellation gracefully
      if (error.code === 'E_USER_CANCELLED') {
        console.log('ℹ️ User cancelled purchase');
        return;
      }
      
      // Handle IAP not available
      if (error.code === 'E_IAP_NOT_AVAILABLE' || error.message?.includes('not available')) {
        Alert.alert(
          'IAP Not Available',
          'In-app purchases are not available in Expo Go or simulator.\n\nPlease:\n1. Build app with EAS: eas build --profile development\n2. Or use physical device with standalone build',
          [{ text: 'OK' }]
        );
        return;
      }
      
      Alert.alert(
        'Purchase Failed',
        error.response?.data?.detail || error.message || 'Failed to complete purchase. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleViewHistory = () => {
    navigation.navigate('WalletHistory');
  };

  // Format transaction date
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <TouchableOpacity 
              onPress={handleViewHistory}
              style={styles.historyButton}
              activeOpacity={touchableOpacity}
            >
              <Text style={styles.historyIcon}>📋</Text>
              <Text style={styles.historyText}>History</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>₹{walletBalance}</Text>
          <Text style={styles.balanceNote}>
            Use your wallet balance for astrology consultations
          </Text>
        </View>

        {/* Recharge Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recharge Amount</Text>
            {TEST_MODE.MOCK_PURCHASES && (
              <View style={styles.testModeBadge}>
                <Text style={styles.testModeText}>🧪 TEST MODE</Text>
              </View>
            )}
          </View>
          
          <View style={styles.rechargeGridContainer}>
            {RECHARGE_PRODUCTS.map((product) => {
              const isSelected = selectedProduct?.productId === product.productId;
              return (
                <View key={product.productId} style={styles.rechargeCardWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.rechargeCard,
                      isSelected && styles.rechargeCardSelected
                    ]}
                    onPress={() => handleProductSelect(product)}
                    activeOpacity={0.7}
                  >
                    {product.isMostPopular && (
                      <View style={styles.mostPopularBadge}>
                        <Text style={styles.mostPopularText}>Most Popular</Text>
                      </View>
                    )}
                    
                    <Text style={styles.rechargeAmount}>₹{product.amount}</Text>
                    
                    {product.bonusPercentage > 0 && (
                      <View style={styles.bonusTag}>
                        <Text style={styles.bonusTagText}>
                          +{product.bonusPercentage}% (₹{product.bonusAmount})
                        </Text>
                      </View>
                    )}
                    
                    <Text style={styles.totalAmount}>
                      You'll get ₹{product.totalAmount}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {selectedProduct && (
            <TouchableOpacity
              style={[styles.continueButton, isPurchasing && styles.continueButtonDisabled]}
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.continueButtonText}>
                  Continue (₹{selectedProduct.amount})
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.transactionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewHistory} activeOpacity={touchableOpacity}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your transaction history will appear here
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View key={transaction.transaction_id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Text style={styles.transactionIconText}>
                    {transaction.transaction_type === 'recharge' ? '💰' : '💸'}
                  </Text>
                </View>
                
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatTransactionDate(transaction.created_at)}
                  </Text>
                </View>
                
                <Text style={[
                  styles.transactionAmount,
                  transaction.transaction_type === 'recharge' ? styles.creditAmount : styles.debitAmount
                ]}>
                  {transaction.transaction_type === 'recharge' ? '+' : '-'}₹{transaction.amount}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  emptyState: {
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    backgroundColor: colors.primary,
    ...shadows.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: spacing.xs,
  },
  historyIcon: {
    fontSize: typography.fontSize.xs,
  },
  historyText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
  },
  balanceAmount: {
    fontSize: typography.fontSize['5xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  balanceNote: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    backgroundColor: colors.backgroundCard,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  testModeBadge: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  testModeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#856404',
  },
  rechargeGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs, // Negative margin to offset wrapper padding
  },
  rechargeCardWrapper: {
    width: '50%', // 2 columns
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  rechargeCard: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    position: 'relative',
    minHeight: 120,
  },
  rechargeCardSelected: {
    borderColor: '#FF6B35',
    borderWidth: 2,
    backgroundColor: '#FFF5F0',
  },
  mostPopularBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#4CAF50',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  mostPopularText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    textTransform: 'uppercase',
  },
  rechargeAmount: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bonusTag: {
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  bonusTagText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: '#2E7D32',
  },
  totalAmount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  continueButton: {
    backgroundColor: '#FF6B35',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.md,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionIconText: {
    fontSize: typography.fontSize.base,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
  },
  transactionAmount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  creditAmount: {
    color: colors.success,
  },
  debitAmount: {
    color: colors.error,
  },
});

export default WalletScreen;
