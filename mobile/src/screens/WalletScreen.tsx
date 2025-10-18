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
import storage from '../utils/storage';
import {colors, typography, spacing, borderRadius, shadows, gradients, touchableOpacity} from '../constants/theme';
import LinearGradient from 'expo-linear-gradient';

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
  const [isRecharging, setIsRecharging] = useState(false);

  const rechargeAmounts = [100, 250, 500, 1000, 2000, 5000];

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

  const handleRecharge = async (amount: number) => {
    try {
      setIsRecharging(true);
      
      const userId = await storage.getUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }
      
      // Call recharge API
      const response = await apiService.rechargeWallet(
        userId,
        amount,
        'upi',
        `UPI_${Date.now()}`
      );
      
      if (response.success) {
        console.log(`✅ Recharged ₹${amount}, new balance: ₹${response.new_balance}`);
        await storage.saveWalletBalance(response.new_balance);
        
        // Reload wallet data
        await loadWalletData();
        
        // Navigate to success screen
        navigation.navigate('TransactionStatus', { status: 'success' });
      }
    } catch (error: any) {
      console.error('❌ Recharge failed:', error);
      Alert.alert(
        'Recharge Failed',
        error.response?.data?.detail || 'Failed to recharge wallet. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRecharging(false);
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
          <Text style={styles.sectionTitle}>Quick Recharge</Text>
          <View style={styles.rechargeGrid}>
            {rechargeAmounts.map((amount, index) => (
              <TouchableOpacity
                key={index}
                style={styles.rechargeButton}
                onPress={() => handleRecharge(amount)}
                activeOpacity={touchableOpacity}
              >
                <Text style={styles.rechargeAmount}>₹{amount}</Text>
                {amount === 500 && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
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

        {/* Usage Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month's Usage</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Chat Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statValue}>2.5 hrs</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💸</Text>
              <Text style={styles.statValue}>₹240</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
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
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  rechargeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  rechargeButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  rechargeAmount: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  popularBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.success,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  popularText: {
    fontSize: 10,
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
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
});

export default WalletScreen;
