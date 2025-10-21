import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ConversationHistory } from '../types';
import { allAstrologersData } from '../constants/astrologers';
import { colors, typography, spacing, borderRadius, shadows, touchableOpacity } from '../constants/theme';
import apiService from '../services/apiService';
import storage from '../utils/storage';
import ChatActionModal from '../components/chat/ChatActionModal';

type ChatHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ChatHistoryScreen = () => {
  const navigation = useNavigation<ChatHistoryScreenNavigationProp>();
  
  // State management
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationHistory | null>(null);

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setError(null);
      const userId = await storage.getUserId();
      if (!userId) {
        setError('User not found');
        return;
      }

      const response = await apiService.getUserConversations(userId);
      if (response.success) {
        setConversations(response.conversations);
      } else {
        setError('Failed to load conversations');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  // Handle chat item click
  const handleChatClick = (conversation: ConversationHistory) => {
    setSelectedConversation(conversation);
    setShowActionModal(true);
  };

  // Find astrologer by ID from allAstrologersData
  const findAstrologerById = (astrologerId: string) => {
    // First try exact ID match
    let astrologer = allAstrologersData.find(astrologer => 
      astrologer.id.toString() === astrologerId
    );
    
    // If not found, try name-based matching
    if (!astrologer) {
      astrologer = allAstrologersData.find(astrologer => 
        astrologer.name.toLowerCase().replace(/\s+/g, '_') === astrologerId ||
        astrologer.name.toLowerCase().replace(/\s+/g, '_').includes(astrologerId.split('_')[0])
      );
    }
    
    // If still not found, create a fallback astrologer object
    if (!astrologer) {
      console.warn('Astrologer not found in data, creating fallback:', astrologerId);
      return {
        id: 999, // Fallback ID
        name: astrologerId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: "Astrology",
        rating: 4.5,
        reviews: 0,
        experience: "Expert",
        languages: ["Hindi", "English"],
        isOnline: true,
        image: "https://via.placeholder.com/50"
      };
    }
    
    return astrologer;
  };

  // Handle continue chat
  const handleContinueChat = () => {
    if (!selectedConversation) return;
    
    setShowActionModal(false);
    const astrologer = findAstrologerById(selectedConversation.astrologer_id);
    
    if (astrologer) {
      navigation.navigate('ChatSession', { 
        astrologer, 
        conversationId: selectedConversation.conversation_id 
      });
    } else {
      console.error('Astrologer not found:', selectedConversation.astrologer_id);
    }
  };

  // Handle start new chat
  const handleStartNewChat = () => {
    if (!selectedConversation) return;
    
    setShowActionModal(false);
    const astrologer = findAstrologerById(selectedConversation.astrologer_id);
    
    if (astrologer) {
      navigation.navigate('ChatSession', { astrologer });
    } else {
      console.error('Astrologer not found:', selectedConversation.astrologer_id);
    }
  };

  // Handle modal cancel
  const handleCancelModal = () => {
    setShowActionModal(false);
    setSelectedConversation(null);
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat History</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Unable to load conversations</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadConversations}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat History</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.conversation_id}
              style={styles.chatItem}
              onPress={() => handleChatClick(conversation)}
              activeOpacity={touchableOpacity}
            >
              <View style={styles.chatContent}>
                <Image 
                  source={{ 
                    uri: conversation.astrologer_image || 
                    allAstrologersData.find(a => 
                      a.id.toString() === conversation.astrologer_id ||
                      a.name.toLowerCase().replace(/\s+/g, '_') === conversation.astrologer_id
                    )?.image || 
                    'https://via.placeholder.com/50'
                  }} 
                  style={styles.avatar} 
                />
                
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.astrologerName} numberOfLines={1}>
                      {conversation.astrologer_name}
                    </Text>
                    <Text style={styles.chatTime}>{conversation.last_message_time}</Text>
                  </View>
                  
                  <View style={styles.chatMessage}>
                    <Text 
                      style={[
                        styles.lastMessage,
                        conversation.status === 'active' && styles.unreadMessage
                      ]} 
                      numberOfLines={2}
                    >
                      {conversation.last_message}
                    </Text>
                    {conversation.status === 'active' && <View style={styles.unreadDot} />}
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

      {/* Chat Action Modal */}
      <ChatActionModal
        visible={showActionModal}
        astrologerName={selectedConversation?.astrologer_name || ''}
        onContinue={handleContinueChat}
        onStartNew={handleStartNewChat}
        onCancel={handleCancelModal}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  retryButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#FFFFFF',
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