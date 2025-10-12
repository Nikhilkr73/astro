import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, Message} from '../types';
import apiService from '../services/apiService';
import storage from '../utils/storage';

type ChatSessionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatSession'>;
type ChatSessionScreenRouteProp = RouteProp<RootStackParamList, 'ChatSession'>;

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
  
  const TEST_MODE = true;
  const BALANCE_DEDUCTION_INTERVAL = TEST_MODE ? 30 : 60;
  const CHAT_RATE_PER_MINUTE = 8;

  // Initialize chat session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoadingSession(true);
        
        const userId = await storage.getUserId();
        if (!userId) {
          Alert.alert('Error', 'User not found. Please login again.');
          navigation.goBack();
          return;
        }
        
        const walletResponse = await apiService.getWalletBalance(userId);
        if (walletResponse.success) {
          setWalletBalance(walletResponse.balance);
        }
        
        console.log('🚀 Starting chat with', astrologer.name);
        const sessionResponse = await apiService.startChatSession(
          userId,
          astrologer.id.toString(),
          'general'
        );
        
        if (sessionResponse.success) {
          console.log('✅ Chat session started:', sessionResponse.conversation_id);
          setConversationId(sessionResponse.conversation_id);
          
          setMessages([{
            id: "greeting",
            text: sessionResponse.greeting,
            sender: "astrologer",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          
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
        
        if (sessionTime > 0 && sessionTime % BALANCE_DEDUCTION_INTERVAL === 0) {
          setWalletBalance((prevBalance) => {
            const newBalance = Math.max(0, prevBalance - CHAT_RATE_PER_MINUTE);
            
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

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  }, [messages]);

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

      await apiService.sendMessage(conversationId, 'user', messageText);
      console.log('✅ Message sent to API');

      try {
        console.log('🤖 Getting AI response...');
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
        
        if (conversationId) {
          apiService.sendMessage(conversationId, 'astrologer', astrologerMessage.text)
            .catch(err => console.error('Failed to save astrologer message:', err));
        }
      } catch (error) {
        console.error('❌ Failed to get AI response:', error);
        
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
    <SafeAreaView style={styles.container}>
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

      {/* Messages - SIMPLE SCROLLVIEW */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
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

      {/* Input Area - SIMPLE FIXED BOTTOM */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder={isSessionPaused ? "Recharge to continue..." : "Type your message..."}
          placeholderTextColor="#9ca3af"
          multiline
          editable={!isSessionPaused}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputMessage.trim() || isSessionPaused) && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isSessionPaused}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>{isSendingMessage ? '⏳' : '📤'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingBottom: 100,
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
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
