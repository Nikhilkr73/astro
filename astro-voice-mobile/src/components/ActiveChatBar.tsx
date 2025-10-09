/**
 * Active Chat Bar Component
 * 
 * Floating bar shown when chat is minimized, allowing quick return to chat.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Avatar } from './ui';
import { Astrologer } from '../data/astrologers';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface ActiveChatBarProps {
  astrologer: Astrologer;
  sessionTime: string;
  onResumeChat: () => void;
  onEndChat: () => void;
}

export function ActiveChatBar({
  astrologer,
  sessionTime,
  onResumeChat,
  onEndChat
}: ActiveChatBarProps) {
  return (
    <View style={[styles.container, shadows.lg]}>
      <TouchableOpacity
        style={styles.content}
        onPress={onResumeChat}
        activeOpacity={0.8}
      >
        <Avatar source={{ uri: astrologer.image }} size="sm" border />
        
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              Chat with {astrologer.name}
            </Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <Icon name="clock" size={12} color={colors.mutedForeground} />
            <Text style={styles.timeText}>{sessionTime}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.tapText}>Tap to return</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.endButton}
          onPress={(e) => {
            e.stopPropagation();
            onEndChat();
          }}
          activeOpacity={0.8}
        >
          <Icon name="x" size={20} color={colors.destructive} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md
  },
  
  info: {
    flex: 1
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  
  title: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground
  },
  
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm
  },
  
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.destructive
  },
  
  liveText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    color: colors.destructive
  },
  
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  timeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  dot: {
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground
  },
  
  tapText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary
  },
  
  endButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});


