/**
 * No Internet Overlay Component
 * 
 * Full-screen overlay shown when device loses internet connection.
 */

import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from './ui';
import { colors, typography, spacing } from '../config/designTokens';

interface NoInternetOverlayProps {
  isVisible: boolean;
  onRetry: () => void;
}

export function NoInternetOverlay({ isVisible, onRetry }: NoInternetOverlayProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name="wifi-off" size={64} color={colors.mutedForeground} />
          </View>

          {/* Title */}
          <Text style={styles.title}>No Internet Connection</Text>

          {/* Message */}
          <Text style={styles.message}>
            Please check your internet connection and try again.
          </Text>

          {/* Retry Button */}
          <Button onPress={onRetry} fullWidth style={styles.retryButton}>
            <Icon name="refresh-cw" size={20} color={colors.primaryForeground} />
            <Text style={styles.buttonText}>Retry</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  
  iconContainer: {
    marginBottom: spacing.xl,
  },
  
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.card,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  
  message: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['2xl'],
  },
  
  retryButton: {
    width: '100%',
  },
  
  buttonText: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
});


