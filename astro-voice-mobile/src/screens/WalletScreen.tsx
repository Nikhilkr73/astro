/**
 * Wallet Screen
 * 
 * Display wallet balance and recharge options.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Button, Card } from '../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface WalletScreenProps {
  onNavigate: (screen: string) => void;
  balance?: number;
}

const rechargeAmounts = [100, 200, 500, 1000, 2000, 5000];

export function WalletScreen({ onNavigate, balance = 500 }: WalletScreenProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleRecharge = () => {
    if (selectedAmount) {
      // Navigate to payment screen
      onNavigate('payment');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <TouchableOpacity onPress={() => onNavigate('wallet-history')} style={styles.historyButton}>
            <Icon name="clock" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <Card style={[styles.balanceCard, shadows.lg]}>
          <View style={styles.balanceContent}>
            <Icon name="wallet" size={32} color={colors.primary} />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>₹{balance}</Text>
            </View>
          </View>
        </Card>

        {/* Recharge Amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Recharge Amount</Text>
          <View style={styles.amountGrid}>
            {rechargeAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountCard,
                  selectedAmount === amount && styles.amountCardActive
                ]}
                onPress={() => setSelectedAmount(amount)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.amountText,
                  selectedAmount === amount && styles.amountTextActive
                ]}>
                  ₹{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <Card style={styles.offerCard}>
            <Icon name="gift" size={24} color={colors.primary} />
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>Get 10% Extra</Text>
              <Text style={styles.offerText}>On recharge of ₹1000 or more</Text>
            </View>
          </Card>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Recharge?</Text>
          <View style={styles.benefitsList}>
            {[
              { icon: 'shield', text: 'Secure & Safe Payments' },
              { icon: 'zap', text: 'Instant Balance Credit' },
              { icon: 'gift', text: 'Exclusive Offers & Cashback' },
              { icon: 'lock', text: 'No Hidden Charges' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name={benefit.icon} size={20} color={colors.primary} />
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      {selectedAmount && (
        <View style={[styles.bottomBar, shadows.lg]}>
          <View style={styles.bottomContent}>
            <Text style={styles.bottomLabel}>Recharge Amount</Text>
            <Text style={styles.bottomAmount}>₹{selectedAmount}</Text>
          </View>
          <Button onPress={handleRecharge} style={styles.rechargeButton}>
            Proceed to Pay
          </Button>
        </View>
      )}
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
  
  historyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  
  balanceCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.2)'
  },
  
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  balanceInfo: {
    flex: 1
  },
  
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    marginBottom: spacing.xs
  },
  
  balanceAmount: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary
  },
  
  section: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginBottom: spacing.md
  },
  
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  
  amountCard: {
    width: '30%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border
  },
  
  amountCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.md
  },
  
  amountText: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground
  },
  
  amountTextActive: {
    color: colors.primaryForeground
  },
  
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base
  },
  
  offerContent: {
    flex: 1
  },
  
  offerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginBottom: spacing.xs
  },
  
  offerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  benefitsList: {
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  benefitText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.foreground
  },
  
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.base
  },
  
  bottomContent: {
    marginBottom: spacing.md
  },
  
  bottomLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  bottomAmount: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary
  },
  
  rechargeButton: {
    width: '100%'
  }
});


