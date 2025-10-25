import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// =============================================================================
// COMPONENT
// =============================================================================

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
        <View style={styles.messageContainer}>
          <Text style={styles.icon}>⚠️</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Balance Exhausted</Text>
            <Text style={styles.message}>Recharge to continue chatting</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.rechargeButton}
          onPress={onRecharge}
          activeOpacity={0.8}
        >
          <Text style={styles.rechargeButtonText}>Recharge Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F0', // Main Background from design system
    borderTopWidth: 1,
    borderTopColor: '#FFE4B5', // Border Gold from design system
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
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
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2E2E', // Primary Text from design system
    marginBottom: 2,
    fontFamily: 'Poppins_500Medium',
  },
  message: {
    fontSize: 12,
    color: '#6B7280', // Secondary Text from design system
    fontFamily: 'Poppins_400Regular',
  },
  rechargeButton: {
    backgroundColor: '#F7931E', // Primary Orange from design system
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

