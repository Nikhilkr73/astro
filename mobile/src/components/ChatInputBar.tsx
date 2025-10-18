import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import {colors, typography, spacing, borderRadius, shadows, touchableOpacity} from '../constants/theme';
import LinearGradient from 'expo-linear-gradient';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  sending?: boolean;
};

const ChatInputBar: React.FC<Props> = ({ value, onChangeText, onSend, disabled, placeholder, sending }) => {
  const canSend = !!value.trim() && !disabled && !sending;

  const handleSendPress = () => {
    console.log('🔍 ChatInputBar - Send button pressed:', {
      value: value,
      valueTrimmed: value.trim(),
      disabled,
      sending,
      canSend
    });
    onSend();
  };

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}
      pointerEvents={'auto'}
    >
      <TextInput
        style={[styles.textInput, disabled && styles.textInputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Type your message...'}
        placeholderTextColor={colors.textTertiary}
        multiline
        editable={!disabled}
      />
      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={handleSendPress}
        disabled={!canSend}
        activeOpacity={touchableOpacity}
      >
        <View style={styles.sendButtonGradient}>
          <Text style={styles.sendIcon}>{sending ? '⏳' : '📤'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: Platform.OS === 'web' ? 'fixed' as any : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.md,
    height: 80,
    zIndex: 99999,
    ...shadows.sm,
  },
  containerDisabled: {
    backgroundColor: colors.background,
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundCard,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  textInputDisabled: {
    backgroundColor: colors.borderLight,
    color: colors.textTertiary,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
  },
});

export default ChatInputBar;


