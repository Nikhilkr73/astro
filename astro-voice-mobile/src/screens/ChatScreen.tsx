/**
 * Chat Screen
 * 
 * Real-time chat interface with astrologer.
 * Features: Message history, typing indicator, session timer, wallet tracking, session pause on zero balance
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Button, Input, Avatar, Badge } from '../components/ui';
import { Astrologer } from '../data/astrologers';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'astrologer';
  timestamp: string;
}

interface ChatScreenProps {
  astrologer: Astrologer;
  onBack: () => void;
  onEndSession: (duration: string) => void;
  onMinimize?: (duration: string) => void;
  onRecharge?: () => void;
  initialBalance?: number;
}

const messageSuggestions = [
  "What does my birth chart say?",
  "Tell me about my career",
  "When will I get married?",
  "Any health concerns?"
];

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Namaste! I'm here to help you with your queries. How can I assist you today?",
    sender: "astrologer",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

export function ChatScreen({
  astrologer,
  onBack,
  onEndSession,
  onMinimize,
  onRecharge,
  initialBalance = 500
}: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [walletBalance, setWalletBalance] = useState(initialBalance);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Configuration
  const TEST_MODE = false; // Set to true for testing
  const BALANCE_DEDUCTION_INTERVAL = TEST_MODE ? 30 : 60;
  const CHAT_RATE_PER_MINUTE = astrologer.chatRate;

  // Session timer and balance deduction
  useEffect(() => {
    if (!sessionEnded && !isSessionPaused) {
      const timer = setInterval(() => {
        setSessionTime((prev) => {
          const newTime = prev + 1;
          
          // Deduct balance at configured interval
          if (newTime > 0 && newTime % BALANCE_DEDUCTION_INTERVAL === 0) {
            setWalletBalance((prevBalance) => {
              const newBalance = Math.max(0, prevBalance - CHAT_RATE_PER_MINUTE);
              
              if (newBalance === 0) {
                setIsSessionPaused(true);
              }
              
              return newBalance;
            });
          }
          
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionEnded, isSessionPaused, sessionTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText || sessionEnded || isSessionPaused) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    // Simulate astrologer response
    setTimeout(() => {
      const responses = [
        "I understand your concern. Let me analyze your birth chart for this.",
        "Based on your planetary positions, I can provide insights on this matter.",
        "That's an interesting question. The stars indicate...",
        "I see. Let me guide you with the astrological perspective."
      ];
      
      const astrologerMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: "astrologer",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, astrologerMessage]);
    }, 1500);
  };

  const handleEndSession = () => {
    setShowEndDialog(false);
    setSessionEnded(true);
    onEndSession(formatTime(sessionTime));
  };

  const handleMinimize = () => {
    if (onMinimize && !sessionEnded) {
      onMinimize(formatTime(sessionTime));
    }
    onBack();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === 'user' && styles.userMessageContainer]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.astrologerBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' && styles.userMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          item.sender === 'user' && styles.userTimestamp
        ]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, shadows.sm]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleMinimize} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>

          <Avatar source={{ uri: astrologer.image }} size="md" border />
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>{astrologer.name}</Text>
            <View style={styles.headerStats}>
              <Icon name="clock" size={12} color={colors.mutedForeground} />
              <Text style={styles.headerStatsText}>{formatTime(sessionTime)}</Text>
              <Text style={styles.dot}>•</Text>
              <Icon
                name="credit-card"
                size={12}
                color={walletBalance === 0 ? colors.destructive : colors.mutedForeground}
              />
              <Text style={[
                styles.headerStatsText,
                walletBalance === 0 && styles.zeroBalance
              ]}>
                ₹{walletBalance}
              </Text>
            </View>
          </View>
        </View>

        <Button
          onPress={() => setShowEndDialog(true)}
          disabled={sessionEnded}
          variant="destructive"
          size="sm"
          style={styles.endButton}
        >
          <Icon name="phone-off" size={16} color={colors.destructiveForeground} />
          <Text style={styles.endButtonText}>End</Text>
        </Button>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {/* Session Paused Warning */}
      {isSessionPaused && !sessionEnded && (
        <View style={[styles.pausedBar, shadows.lg]}>
          <View style={styles.pausedContent}>
            <Icon name="alert-circle" size={20} color={colors.destructive} />
            <View style={styles.pausedText}>
              <Text style={styles.pausedTitle}>Session Paused</Text>
              <Text style={styles.pausedSubtitle}>Balance: ₹0 • Recharge to continue</Text>
            </View>
          </View>
          <Button size="sm" onPress={onRecharge} style={styles.rechargeButton}>
            Recharge
          </Button>
        </View>
      )}

      {/* Message Suggestions */}
      {!sessionEnded && !isSessionPaused && messages.length <= 2 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            horizontal
            data={messageSuggestions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleSendMessage(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          />
        </View>
      )}

      {/* Input Area */}
      {!sessionEnded && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={[styles.inputContainer, isSessionPaused && styles.inputDisabled]}>
            <Input
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder={isSessionPaused ? "Recharge to continue..." : "Type your message..."}
              editable={!isSessionPaused}
              containerStyle={styles.input}
              style={styles.inputField}
              onSubmitEditing={() => handleSendMessage()}
            />
            <TouchableOpacity
              onPress={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isSessionPaused}
              style={[
                styles.sendButton,
                (!inputMessage.trim() || isSessionPaused) && styles.sendButtonDisabled
              ]}
            >
              <Icon name="send" size={20} color={colors.accentForeground} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* End Session Dialog */}
      <Modal
        visible={showEndDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>End Chat Session?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to end this chat session? The session duration is {formatTime(sessionTime)}.
            </Text>
            <View style={styles.modalButtons}>
              <Button
                variant="outline"
                onPress={() => setShowEndDialog(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onPress={handleEndSession}
                style={styles.modalButton}
              >
                End Session
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center'
  },
  
  headerInfo: {
    flex: 1
  },
  
  headerName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginBottom: 2
  },
  
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  headerStatsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  zeroBalance: {
    color: colors.destructive,
    fontFamily: typography.fontFamily.semiBold
  },
  
  dot: {
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground
  },
  
  endButton: {
    paddingHorizontal: spacing.md
  },
  
  endButtonText: {
    color: colors.destructiveForeground,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium
  },
  
  messagesContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    flexGrow: 1
  },
  
  messageContainer: {
    marginBottom: spacing.md,
    alignItems: 'flex-start'
  },
  
  userMessageContainer: {
    alignItems: 'flex-end'
  },
  
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius['2xl']
  },
  
  astrologerBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
    ...shadows.sm
  },
  
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4
  },
  
  messageText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.foreground,
    lineHeight: 20,
    marginBottom: 4
  },
  
  userMessageText: {
    color: colors.primaryForeground
  },
  
  timestamp: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)'
  },
  
  pausedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderTopWidth: 1,
    borderTopColor: colors.destructive
  },
  
  pausedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  
  pausedText: {
    flex: 1
  },
  
  pausedTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.destructive
  },
  
  pausedSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  rechargeButton: {
    paddingHorizontal: spacing.base
  },
  
  suggestionsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: spacing.sm
  },
  
  suggestionsList: {
    paddingHorizontal: spacing.base
  },
  
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    marginRight: spacing.sm
  },
  
  suggestionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  
  inputDisabled: {
    opacity: 0.6
  },
  
  input: {
    flex: 1,
    marginBottom: 0
  },
  
  inputField: {
    backgroundColor: colors.accent
  },
  
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  sendButtonDisabled: {
    opacity: 0.5
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  
  modalContent: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    ...shadows.lg
  },
  
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginBottom: spacing.md
  },
  
  modalMessage: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    lineHeight: 22,
    marginBottom: spacing.xl
  },
  
  modalButtons: {
    flexDirection: 'row'
  },
  
  modalButton: {
    flex: 1
  }
});


