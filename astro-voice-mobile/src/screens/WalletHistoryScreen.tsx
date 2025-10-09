/**
 * Wallet History Screen
 * 
 * Display list of all wallet transactions (credits and debits).
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Badge } from '../components/ui';
import { colors, typography, spacing, borderRadius } from '../config/designTokens';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
  transactionId?: string;
}

interface WalletHistoryScreenProps {
  onNavigate: (screen: string) => void;
}

// Sample transaction data
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 500,
    description: 'Wallet Recharge',
    status: 'success',
    timestamp: '2 hours ago',
    transactionId: 'TXN123456789'
  },
  {
    id: '2',
    type: 'debit',
    amount: 96,
    description: 'Chat with Pandit Rajesh Kumar',
    status: 'success',
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    type: 'credit',
    amount: 1000,
    description: 'Wallet Recharge',
    status: 'success',
    timestamp: 'Yesterday',
    transactionId: 'TXN123456788'
  },
  {
    id: '4',
    type: 'debit',
    amount: 144,
    description: 'Chat with Dr. Priya Sharma',
    status: 'success',
    timestamp: '2 days ago'
  },
];

export function WalletHistoryScreen({ onNavigate }: WalletHistoryScreenProps) {
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={[
        styles.iconContainer,
        item.type === 'credit' ? styles.creditIcon : styles.debitIcon
      ]}>
        <Icon
          name={item.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}
          size={20}
          color={item.type === 'credit' ? colors.success : colors.destructive}
        />
      </View>
      
      <View style={styles.transactionContent}>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.transactionFooter}>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
          <Badge
            variant={
              item.status === 'success' ? 'success' :
              item.status === 'pending' ? 'warning' : 'destructive'
            }
            style={styles.statusBadge}
          >
            {item.status}
          </Badge>
        </View>
        {item.transactionId && (
          <Text style={styles.transactionId}>ID: {item.transactionId}</Text>
        )}
      </View>
      
      <Text style={[
        styles.amount,
        item.type === 'credit' ? styles.creditAmount : styles.debitAmount
      ]}>
        {item.type === 'credit' ? '+' : '-'}₹{item.amount}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('wallet')} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <FlatList
        data={sampleTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="file-text" size={64} color={colors.mutedForeground} />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyText}>Your transaction history will appear here</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base
  },
  
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center'
  },
  
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground
  },
  
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl
  },
  
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  creditIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  
  debitIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  },
  
  transactionContent: {
    flex: 1
  },
  
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    marginBottom: spacing.xs
  },
  
  transactionFooter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  timestamp: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  
  transactionId: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    marginTop: spacing.xs
  },
  
  amount: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold
  },
  
  creditAmount: {
    color: colors.success
  },
  
  debitAmount: {
    color: colors.destructive
  },
  
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl']
  },
  
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  
  emptyText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    textAlign: 'center'
  }
});


