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
          <ActivityIndicator size="large" color="#6366f1" />
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
            tintColor="#6366f1"
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
                activeOpacity={0.8}
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
            <TouchableOpacity onPress={handleViewHistory}>
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
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#6366f1',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  historyIcon: {
    fontSize: 12,
  },
  historyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  balanceNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  rechargeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rechargeButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  rechargeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  popularBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  creditAmount: {
    color: '#10b981',
  },
  debitAmount: {
    color: '#ef4444',
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
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
});

export default WalletScreen;
