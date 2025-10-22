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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import apiService from '../services/apiService';
import storage from '../utils/storage';
import {colors, typography, spacing, borderRadius, shadows, touchableOpacity} from '../constants/theme';

type WalletHistoryNavigationProp = StackNavigationProp<RootStackParamList>;

interface Transaction {
  transaction_id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
  payment_status: string;
  bonus_amount?: number;
  session_duration?: number;
  astrologer_name?: string;
  google_play_order_id?: string;
}

type TabType = 'wallet' | 'payment';

const WalletHistoryScreen = () => {
  const navigation = useNavigation<WalletHistoryNavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('wallet');
  const [walletHistory, setWalletHistory] = useState<Transaction[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load transaction history
  const loadTransactions = async () => {
    try {
      const userId = await storage.getUserId();
      if (!userId) return;

      // Fetch wallet history (deductions)
      const walletResponse = await apiService.getWalletTransactions(userId, 'deduction', 50);
      if (walletResponse.success) {
        setWalletHistory(walletResponse.transactions || []);
      }

      // Fetch payment logs (recharges)
      const paymentResponse = await apiService.getWalletTransactions(userId, 'recharge', 50);
      if (paymentResponse.success) {
        setPaymentLogs(paymentResponse.transactions || []);
      }
    } catch (error) {
      console.error('❌ Failed to load transaction history:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTransactions();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${day} ${month} ${year}, ${time}`;
  };

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  // Render wallet history item (deductions)
  const renderWalletItem = (transaction: Transaction) => (
    <View key={transaction.transaction_id} style={styles.transactionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>💸</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.transactionTitle}>
            {transaction.astrologer_name || 'Astrology Session'}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.created_at)}
          </Text>
          {transaction.session_duration && (
            <Text style={styles.sessionDuration}>
              Duration: {formatDuration(transaction.session_duration)}
            </Text>
          )}
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.debitAmount}>-₹{transaction.amount}</Text>
        </View>
      </View>
    </View>
  );

  // Render payment log item (recharges)
  const renderPaymentItem = (transaction: Transaction) => (
    <View key={transaction.transaction_id} style={styles.transactionCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.iconSuccess]}>
          <Text style={styles.iconText}>💰</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.transactionTitle}>Wallet Recharge</Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.created_at)}
          </Text>
          {transaction.google_play_order_id && (
            <Text style={styles.orderId}>
              Order: {transaction.google_play_order_id.substring(0, 20)}...
            </Text>
          )}
          {transaction.bonus_amount && transaction.bonus_amount > 0 && (
            <View style={styles.bonusContainer}>
              <Text style={styles.bonusText}>
                Bonus: +₹{transaction.bonus_amount}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.creditAmount}>+₹{transaction.amount}</Text>
          <View style={[
            styles.statusBadge,
            transaction.payment_status === 'completed' ? styles.statusSuccess : styles.statusPending
          ]}>
            <Text style={styles.statusText}>
              {transaction.payment_status === 'completed' ? 'Success' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentTransactions = activeTab === 'wallet' ? walletHistory : paymentLogs;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={touchableOpacity}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'wallet' && styles.tabActive]}
          onPress={() => setActiveTab('wallet')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.tabTextActive]}>
            Wallet History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payment' && styles.tabActive]}
          onPress={() => setActiveTab('payment')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'payment' && styles.tabTextActive]}>
            Payment Logs
          </Text>
        </TouchableOpacity>
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
        {currentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'wallet' ? '💬' : '💳'}
            </Text>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'wallet' 
                ? 'Your consultation history will appear here'
                : 'Your recharge history will appear here'}
            </Text>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {currentTransactions.map(transaction =>
              activeTab === 'wallet'
                ? renderWalletItem(transaction)
                : renderPaymentItem(transaction)
            )}
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: typography.fontSize['2xl'],
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  transactionList: {
    padding: spacing.lg,
  },
  transactionCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconSuccess: {
    backgroundColor: '#E8F5E9',
  },
  iconText: {
    fontSize: typography.fontSize.xl,
  },
  cardContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  transactionDate: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sessionDuration: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textTertiary,
  },
  orderId: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  bonusContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  bonusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#2E7D32',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  debitAmount: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.error,
  },
  creditAmount: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusSuccess: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: '#2E7D32',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default WalletHistoryScreen;
