import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {allAstrologersData} from '../constants/astrologers';
import {colors, typography, spacing, borderRadius, shadows, touchableOpacity} from '../constants/theme';

type ChatHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ChatHistoryScreen = () => {
  const navigation = useNavigation<ChatHistoryScreenNavigationProp>();

  // Sample chat history data (first 4 astrologers for demo)
  const recentChats = allAstrologersData.slice(0, 4).map(astrologer => ({
    ...astrologer,
    lastMessage: "Thank you for the consultation. May the stars guide you!",
    lastMessageTime: "2 hours ago",
    isUnread: Math.random() > 0.5,
  }));

  const handleChatClick = (astrologer: any) => {
    navigation.navigate('ChatSession', { astrologer });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat History</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {recentChats.length > 0 ? (
          recentChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => handleChatClick(chat)}
              activeOpacity={touchableOpacity}
            >
              <View style={styles.chatContent}>
                <Image source={{ uri: chat.image }} style={styles.avatar} />
                
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.astrologerName} numberOfLines={1}>
                      {chat.name}
                    </Text>
                    <Text style={styles.chatTime}>{chat.lastMessageTime}</Text>
                  </View>
                  
                  <View style={styles.chatMessage}>
                    <Text 
                      style={[
                        styles.lastMessage,
                        chat.isUnread && styles.unreadMessage
                      ]} 
                      numberOfLines={2}
                    >
                      {chat.lastMessage}
                    </Text>
                    {chat.isUnread && <View style={styles.unreadDot} />}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No chat history</Text>
            <Text style={styles.emptyText}>
              Start a conversation with an astrologer to see your chat history here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  chatItem: {
    backgroundColor: colors.backgroundCard,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  chatContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    marginRight: spacing.md,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  astrologerName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  chatTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
  },
  chatMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    flex: 1,
  },
  unreadMessage: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ChatHistoryScreen;
