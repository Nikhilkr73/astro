/**
 * Transaction Status Screen
 * 
 * Display transaction result (success, failed, or pending).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../components/ui';
import { colors, typography, spacing, borderRadius } from '../config/designTokens';

export type TransactionStatus = 'success' | 'failed' | 'pending';

interface TransactionStatusScreenProps {
  status: TransactionStatus;
  amount?: number;
  transactionId?: string;
  onNavigate: (screen: string) => void;
}

export function TransactionStatusScreen({
  status,
  amount = 0,
  transactionId,
  onNavigate
}: TransactionStatusScreenProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: 'check-circle',
          color: colors.success,
          title: 'Payment Successful!',
          message: `Your wallet has been recharged with ₹${amount}`,
          buttonText: 'Go to Home',
          buttonAction: () => onNavigate('home')
        };
      case 'failed':
        return {
          icon: 'x-circle',
          color: colors.destructive,
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again.',
          buttonText: 'Try Again',
          buttonAction: () => onNavigate('wallet')
        };
      case 'pending':
        return {
          icon: 'clock',
          color: colors.warning,
          title: 'Payment Pending',
          message: 'Your payment is being processed. This may take a few minutes.',
          buttonText: 'Go to Home',
          buttonAction: () => onNavigate('home')
        };
    }
  };

  const config = getStatusConfig();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Status Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
          <Icon name={config.icon} size={80} color={config.color} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{config.title}</Text>

        {/* Message */}
        <Text style={styles.message}>{config.message}</Text>

        {/* Transaction Details */}
        {transactionId && (
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{transactionId}</Text>
            </View>
            {amount > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={[styles.detailValue, styles.amountText]}>₹{amount}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {new Date().toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button onPress={config.buttonAction} fullWidth>
            {config.buttonText}
          </Button>
          
          {status !== 'success' && (
            <Button
              variant="outline"
              onPress={() => onNavigate('help')}
              fullWidth
              style={styles.secondaryButton}
            >
              Contact Support
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['4xl'],
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl']
  },
  
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.base
  },
  
  message: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.base
  },
  
  detailsCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing['2xl']
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  
  detailLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground
  },
  
  amountText: {
    fontSize: typography.fontSize.lg,
    color: colors.success,
    fontFamily: typography.fontFamily.bold
  },
  
  actions: {
    width: '100%'
  },
  
  secondaryButton: {
    marginTop: spacing.sm
  }
});


