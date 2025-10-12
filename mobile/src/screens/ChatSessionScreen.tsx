import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, Message} from '../types';
import apiService from '../services/apiService';
import storage from '../utils/storage';
import ChatInputBar from '../components/ChatInputBar';

type ChatSessionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatSession'>;
type ChatSessionScreenRouteProp = RouteProp<RootStackParamList, 'ChatSession'>;

const messageSuggestions = [
  "What does my birth chart say?",
  "Tell me about my career",
  "When will I get married?",
  "Any health concerns?"
];

const ChatSessionScreen = () => {
  const navigation = useNavigation<ChatSessionScreenNavigationProp>();
  const route = useRoute<ChatSessionScreenRouteProp>();
  const { astrologer } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [walletBalance, setWalletBalance] = useState(500);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // ============================================
  // TESTING MODE CONFIGURATION
  // ============================================
  // TEST_MODE = true: Deduct ₹8 every 30 seconds (quick testing)
  // TEST_MODE = false: Deduct ₹8 every 60 seconds (production)
  // 
  // FOR TESTING ZERO BALANCE SESSION PAUSE:
  // Current initialBalance: 8
  // Deductions: 8 → 0 (after 30 seconds)
  // Session Paused Bar appears immediately at 0 with recharge button!
  // ============================================
  const TEST_MODE = true;
  const BALANCE_DEDUCTION_INTERVAL = TEST_MODE ? 30 : 60; // seconds
  const CHAT_RATE_PER_MINUTE = 8;

  // Initialize chat session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('🎯 ChatSessionScreen: Starting initialization...');
        setIsLoadingSession(true);
        
        // Get user ID
        let userId = await storage.getUserId();
        if (!userId) {
          console.log('⚠️ No user ID found, using test user for demo');
          userId = 'test_user_demo'; // Use test user for demo
        }
        
        // Get wallet balance
        const walletResponse = await apiService.getWalletBalance(userId);
        if (walletResponse.success) {
          setWalletBalance(walletResponse.balance);
        }
        
        // Start chat session
        console.log('🚀 Starting chat with', astrologer.name);
        const sessionResponse = await apiService.startChatSession(
          userId,
          astrologer.id.toString(),
          'general'
        );
        
        if (sessionResponse.success) {
          console.log('✅ Chat session started:', sessionResponse.conversation_id);
          setConversationId(sessionResponse.conversation_id);
          
          // Set greeting message
          setMessages([{
            id: "greeting",
            text: sessionResponse.greeting,
            sender: "astrologer",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          
          // Save conversation ID
          await storage.saveLastConversation(sessionResponse.conversation_id);
        }
      } catch (error: any) {
        console.error('❌ Failed to start session:', error);
        Alert.alert(
          'Session Start Failed',
          error.response?.data?.detail || 'Failed to start chat session. Please try again.',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } finally {
        setIsLoadingSession(false);
      }
    };
    
    initializeSession();
  }, []);

  // Session timer and balance deduction
  useEffect(() => {
    if (!sessionEnded) {
      const timer = setInterval(() => {
        setSessionTime((prev) => prev + 1);
        
        // Deduct balance at configured interval (30s for testing, 60s for production)
        if (sessionTime > 0 && sessionTime % BALANCE_DEDUCTION_INTERVAL === 0) {
          setWalletBalance((prevBalance) => {
            const newBalance = Math.max(0, prevBalance - CHAT_RATE_PER_MINUTE);
            
            // Pause session if balance hits zero
            if (newBalance === 0) {
              setIsSessionPaused(true);
            }
            
            return newBalance;
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionEnded, sessionTime]);

  // Prevent body scroll on web and auto scroll messages
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Prevent body from scrolling
      document.body.style.overflow = 'hidden';
      
      // Auto scroll to bottom
      setTimeout(() => {
        const messageContainer = document.querySelector('[style*="overflowY: auto"]') as HTMLElement;
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      }, 100);
      
      // Cleanup: restore body scroll when component unmounts
      return () => {
        document.body.style.overflow = 'auto';
      };
    } else {
      // For mobile, use ScrollView
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }
  }, [messages]);

  // Cleanup effect to restore body scroll when component unmounts
  useEffect(() => {
    if (Platform.OS === 'web') {
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText || sessionEnded || isSessionPaused || !conversationId) return;

    try {
      setIsSendingMessage(true);
      
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newMessage]);
      setInputMessage("");

      // Send message to API
      await apiService.sendMessage(conversationId, 'user', messageText);
      console.log('✅ Message sent to API');

      // Get real AI response from OpenAI chat handler
      try {
        console.log('🤖 Getting AI response...');
        // Map mobile astrologer ID to backend astrologer ID
        const astrologerIdMap: { [key: string]: string } = {
          '1': 'tina_kulkarni_vedic_marriage',
          '2': 'arjun_sharma_career', 
          '3': 'meera_nanda_love'
        };
        const backendAstrologerId = astrologerIdMap[astrologer.id.toString()] || 'tina_kulkarni_vedic_marriage';
        
        const aiResponse = await apiService.getAIResponse(conversationId, messageText, backendAstrologerId);
        
        const astrologerMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.message || "I'm sorry, I couldn't process your request right now.",
          sender: "astrologer",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, astrologerMessage]);
        
        // Send astrologer response to API
        if (conversationId) {
          apiService.sendMessage(conversationId, 'astrologer', astrologerMessage.text)
            .catch(err => console.error('Failed to save astrologer message:', err));
        }
      } catch (error) {
        console.error('❌ Failed to get AI response:', error);
        
        // Fallback to a simple response if AI fails
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm experiencing some technical difficulties. Please try again in a moment.",
          sender: "astrologer",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleEndSession = async () => {
    console.log('End button pressed!');
    
    if (!conversationId) {
      navigation.goBack();
      return;
    }
    
    try {
      // End conversation in database
      await apiService.endConversation(conversationId, sessionTime);
      console.log('✅ Conversation ended in database');
      
      setSessionEnded(true);
      navigation.navigate('ChatReview', { 
        astrologer, 
        sessionDuration: formatTime(sessionTime),
        conversationId: conversationId 
      });
    } catch (error) {
      console.error('❌ Failed to end conversation:', error);
      // Still navigate to review even if API fails
      setSessionEnded(true);
      navigation.navigate('ChatReview', { 
        astrologer, 
        sessionDuration: formatTime(sessionTime),
        conversationId: conversationId 
      });
    }
  };

  const handleMinimize = () => {
    navigation.goBack();
  };

  const handleRecharge = () => {
    Alert.alert(
      "Recharge Wallet",
      "This would normally open the wallet recharge screen.",
      [{ text: "OK" }]
    );
  };

  // Show loading screen while initializing session
  if (isLoadingSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Starting chat session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } : {}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleMinimize}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: astrologer.image }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.astrologerName} numberOfLines={1}>
              {astrologer.name}
            </Text>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionIcon}>⏱️</Text>
              <Text style={styles.sessionTime}>{formatTime(sessionTime)}</Text>
              <Text style={styles.sessionDivider}>•</Text>
              <Text style={styles.walletIcon}>💳</Text>
              <Text style={[
                styles.walletBalance,
                walletBalance === 0 && styles.walletBalanceZero
              ]}>
                ₹{walletBalance}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndSession}
          disabled={sessionEnded}
          activeOpacity={0.8}
        >
          <Text style={styles.endIcon}>📞</Text>
          <Text style={styles.endText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Messages - Simple HTML scrolling for web */}
      {Platform.OS === 'web' ? (
        // Web: Use the exact same approach that worked in SimpleChatScreen
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          height: 'calc(100vh - 200px)', // Fixed height to prevent whole window scroll
          maxHeight: 'calc(100vh - 200px)'
        }}>
          {messages.map((message) => (
            <div key={message.id} style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: message.sender === 'user' ? '#007AFF' : '#E5E5EA',
                color: message.sender === 'user' ? 'white' : 'black',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  marginBottom: '4px',
                  fontFamily: 'inherit',
                  lineHeight: '1.4'
                }}>
                  {message.text}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  opacity: 0.7,
                  textAlign: 'right',
                  fontFamily: 'inherit',
                  lineHeight: '1.2'
                }}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Mobile: Use ScrollView with map (simpler than FlatList)
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === "user" ? styles.userMessageContainer : styles.astrologerMessageContainer
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.sender === "user" ? styles.userMessageBubble : styles.astrologerMessageBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.sender === "user" ? styles.userMessageText : styles.astrologerMessageText
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.sender === "user" ? styles.userMessageTime : styles.astrologerMessageTime
                ]}>
                  {message.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input Bar - fixed bottom component */}
      <ChatInputBar
        value={inputMessage}
        onChangeText={setInputMessage}
        onSend={() => handleSendMessage()}
        disabled={isSessionPaused || sessionEnded}
        placeholder={isSessionPaused ? 'Recharge to continue...' : 'Type your message...'}
        sending={isSendingMessage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 100, // Space for fixed input
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // Fixed height to prevent flex issues
    minHeight: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  astrologerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  sessionTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 44,
  },
  sessionDivider: {
    fontSize: 12,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  walletIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  walletBalance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  walletBalanceZero: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  endIcon: {
    fontSize: 14,
  },
  endText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  astrologerMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessageBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  astrologerMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#ffffff',
  },
  astrologerMessageText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 11,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  astrologerMessageTime: {
    color: '#9ca3af',
  },
  sessionPausedBar: {
    backgroundColor: '#fef3c7',
    borderTopWidth: 1,
    borderTopColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sessionPausedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionPausedIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sessionPausedInfo: {
    flex: 1,
  },
  sessionPausedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 2,
  },
  sessionPausedText: {
    fontSize: 12,
    color: '#92400e',
  },
  rechargeButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rechargeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  suggestionsContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
  },
  suggestionButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  // inputContainer removed; now handled by ChatInputBar
  inputContainerDisabled: {
    backgroundColor: '#f9fafb',
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    fontSize: 14,
    maxHeight: 100,
  },
  textInputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendIcon: {
    fontSize: 20,
  },
});

export default ChatSessionScreen;
