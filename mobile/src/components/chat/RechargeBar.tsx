import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface RechargeBarProps {
  visible: boolean;
  onRecharge: () => void;
}

export function RechargeBar({ visible, onRecharge }: RechargeBarProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Warning Icon and Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Balance Exhausted</Text>
            <Text style={styles.message}>Recharge to continue chatting</Text>
          </View>
        </View>
        
        {/* Recharge Button */}
        <TouchableOpacity
          style={styles.rechargeButton}
          onPress={onRecharge}
          activeOpacity={0.8}
        >
          <Text style={styles.rechargeButtonText}>Recharge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F0', // Light orange background
    borderTopWidth: 1,
    borderTopColor: '#FFE4B5', // Light orange border
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F7931E', // Orange text
    fontFamily: 'Poppins_500Medium',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#6B7280', // Secondary text
    fontFamily: 'Poppins_400Regular',
  },
  rechargeButton: {
    backgroundColor: '#F7931E', // Primary orange
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  rechargeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium',
  },
});

export default RechargeBar;