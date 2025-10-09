/**
 * Chat History Screen
 * 
 * List of past chat sessions with astrologers.
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Avatar, Badge } from '../components/ui';
import { Astrologer } from '../data/astrologers';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface ChatSession {
  id: string;
  astrologer: Astrologer;
  lastMessage: string;
  timestamp: string;
  duration: string;
  unread?: number;
}

interface ChatHistoryScreenProps {
  onChatClick: (session: ChatSession) => void;
}

// Sample data
const sampleSessions: ChatSession[] = [
  {
    id: '1',
    astrologer: {
      id: 1,
      name: "Pandit Rajesh Kumar",
      category: "Vedic Astrology",
      rating: 4.8,
      reviews: 1250,
      experience: "15+ years",
      languages: ["Hindi", "English"],
      isOnline: true,
      image: "https://images.unsplash.com/photo-1662302392561-b1deecd3579d?w=400",
      chatRate: 8,
      callRate: 12
    },
    lastMessage: "Thank you for the consultation. May the stars guide you.",
    timestamp: "2 hours ago",
    duration: "12 min",
    unread: 2
  },
  {
    id: '2',
    astrologer: {
      id: 2,
      name: "Dr. Priya Sharma",
      category: "Numerology",
      rating: 4.9,
      reviews: 890,
      experience: "12+ years",
      languages: ["Hindi", "English", "Bengali"],
      isOnline: false,
      image: "https://images.unsplash.com/photo-1731056995482-6def83b56fbf?w=400",
      chatRate: 8,
      callRate: 12
    },
    lastMessage: "Your numbers suggest a positive change coming soon.",
    timestamp: "Yesterday",
    duration: "18 min"
  },
];

export function ChatHistoryScreen({ onChatClick }: ChatHistoryScreenProps) {
  const renderChatSession = ({ item }: { item: ChatSession }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => onChatClick(item)}
      activeOpacity={0.7}
    >
      <Avatar
        source={{ uri: item.astrologer.image }}
        size="lg"
        border
        style={styles.avatar}
      />
      
      <View style={styles.sessionContent}>
        <View style={styles.sessionHeader}>
          <Text style={styles.astrologerName} numberOfLines={1}>
            {item.astrologer.name}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
        <Badge variant="primary" style={styles.categoryBadge}>
          {item.astrologer.category}
        </Badge>
        
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.lastMessage}
        </Text>
        
        <View style={styles.sessionFooter}>
          <View style={styles.durationContainer}>
            <Icon name="clock" size={12} color={colors.mutedForeground} />
            <Text style={styles.duration}>{item.duration}</Text>
          </View>
          {item.unread && item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat History</Text>
      </View>
      
      <FlatList
        data={sampleSessions}
        renderItem={renderChatSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="message-circle" size={64} color={colors.mutedForeground} />
            <Text style={styles.emptyTitle}>No Chat History</Text>
            <Text style={styles.emptyText}>Start a conversation with an astrologer</Text>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base
  },
  
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground
  },
  
  listContent: {
    paddingHorizontal: spacing.xl
  },
  
  sessionCard: {
    flexDirection: 'row',
    paddingVertical: spacing.base
  },
  
  avatar: {
    flexShrink: 0
  },
  
  sessionContent: {
    flex: 1
  },
  
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  
  astrologerName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground
  },
  
  timestamp: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs
  },
  
  lastMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    lineHeight: 18,
    marginBottom: spacing.xs
  },
  
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  duration: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  unreadText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primaryForeground
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
