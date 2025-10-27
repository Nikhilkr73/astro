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
  Modal,
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
import TypingIndicator from '../components/chat/TypingIndicator';
import RechargeBar from '../components/chat/RechargeBar';
import { useChatSession } from '../contexts/ChatSessionContext';

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
  const { astrologer: routeAstrologer, astrologerId } = route.params;
  
  // Chat Session Context Integration (for accessing context state)
  const { state: sessionState, actions: sessionActions } = useChatSession();
  
  // If astrologer is missing from route (e.g., when resuming), get it from context
  const astrologer = routeAstrologer || (sessionState.astrologerId && sessionState.astrologerName && sessionState.astrologerImage ? {
    id: parseInt(sessionState.astrologerId),
    name: sessionState.astrologerName,
    category: 'Astrology',
    rating: 4.5,
    reviews: 0,
    experience: 'Expert',
    languages: ['Hindi', 'English'],
    isOnline: true,
    image: sessionState.astrologerImage,
  } : null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [walletBalance, setWalletBalance] = useState(50);
  const [initialWalletBalance, setInitialWalletBalance] = useState(50);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0); // Countdown timer in seconds
  const [astrologerRate, setAstrologerRate] = useState(8); // Per minute rate
  const [showRechargeBar, setShowRechargeBar] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Flag to prevent timer race condition
  const shouldLoadHistory = useRef(true); // Flag to prevent reloading history when returning to active session
  const initialMountRef = useRef(true); // Track if this is the first mount
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Pagination state for loading older messages
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const MESSAGES_PER_PAGE = 50;
  
  // Utility function to calculate remaining time based on wallet balance
  const calculateRemainingTime = (balance: number, ratePerMinute: number): number => {
    if (ratePerMinute === 0) return 0;
    return Math.floor((balance / ratePerMinute) * 60); // Returns seconds
  };
  
  // Load older messages when user scrolls to top
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingMore || !conversationId) {
      return;
    }
    
    try {
      setIsLoadingMore(true);
      console.log('📜 Loading more messages, offset:', currentOffset + MESSAGES_PER_PAGE);
      
      // For unified conversations, use unified history endpoint
      if (conversationId.startsWith('unified_')) {
        const userId = await storage.getUserId() || 'test_user_demo';
        const astrologerBackendId = sessionState.astrologerId || 'tina_kulkarni_vedic_marriage';
        
        console.log('📜 Loading more unified history for astrologer:', astrologerBackendId);
        
        const unifiedHistory = await apiService.getUnifiedChatHistory(
          userId,
          astrologerBackendId,
          MESSAGES_PER_PAGE,
          currentOffset
        );
        
        if (unifiedHistory.success && unifiedHistory.messages) {
          const newMessages = unifiedHistory.messages.map((msg: any) => {
            if (msg.is_separator) {
              return {
                id: `separator_${msg.conversation_id}_${msg.date}`,
                text: msg.separator_text,
                sender: 'separator',
                timestamp: '',
                isSeparator: true
              };
            } else {
              return {
                id: msg.message_id,
                text: msg.content,
                sender: msg.sender_type,
                timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }
          });
          
          // Prepend older messages to the top
          setMessages((prevMessages) => [...newMessages, ...prevMessages]);
          setCurrentOffset(currentOffset + MESSAGES_PER_PAGE);
          
          // Check if we've loaded all messages
          if (newMessages.length < MESSAGES_PER_PAGE) {
            setHasMoreMessages(false);
            console.log('✅ Loaded all unified messages');
          }
          
          console.log('✅ Loaded', newMessages.length, 'more unified messages');
        } else {
          setHasMoreMessages(false);
          console.log('⚠️ No more unified messages to load');
        }
      } else {
        // Regular conversation history pagination
        const historyResponse = await apiService.getChatHistory(
          conversationId, 
          MESSAGES_PER_PAGE, 
          currentOffset  // Load next page
        );
        
        if (historyResponse.success && historyResponse.messages) {
          const newMessages = historyResponse.messages.map((msg: any) => ({
            id: msg.message_id,
            text: msg.content,
            sender: msg.sender_type,
            timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          
          // Prepend older messages to the top
          setMessages((prevMessages) => [...newMessages, ...prevMessages]);
          setCurrentOffset(currentOffset + MESSAGES_PER_PAGE);
          
          // Check if we've loaded all messages
          if (newMessages.length < MESSAGES_PER_PAGE) {
            setHasMoreMessages(false);
            console.log('✅ Loaded all messages');
          }
          
          console.log('✅ Loaded', newMessages.length, 'more messages');
        } else {
          setHasMoreMessages(false);
          console.log('⚠️ No more messages to load');
        }
      }
    } catch (error) {
      console.error('❌ Failed to load more messages:', error);
      setHasMoreMessages(false);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  // Sync local sessionTime with context sessionDuration when resuming
  useEffect(() => {
    if (sessionState.sessionDuration > 0 && sessionTime === 0) {
      console.log('🕐 Syncing sessionTime from context:', sessionState.sessionDuration);
      setSessionTime(sessionState.sessionDuration);
    }
  }, [sessionState.sessionDuration]);
  
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

  // Get route parameters
  const existingConversationId = route.params?.conversationId;
  const unifiedAstrologerId = route.params?.astrologerId;

  // Initialize chat session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('🎯 ChatSessionScreen: Starting initialization...');
        console.log('🎯 Astrologer from route:', routeAstrologer?.name || 'MISSING');
        console.log('🎯 Astrologer from context:', sessionState.astrologerName || 'MISSING');
        
        // Only load history if this is the FIRST mount (not a re-mount after navigation)
        const shouldLoad = initialMountRef.current;
        initialMountRef.current = false; // Mark that we've initialized
        
        console.log('📜 Should load history:', shouldLoad);
        
        // Validate astrologer is available
        if (!astrologer) {
          console.error('❌ Astrologer is missing from both route and context!');
          Alert.alert(
            'Error',
            'Astrologer information is missing. Please go back and try again.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          setIsLoadingSession(false);
          return;
        }
        
        setIsLoadingSession(true);
        
        // Hide the persistent bar when ChatSessionScreen loads
        sessionActions.hideSession();
        
        if (existingConversationId) {
          console.log('🔄 Resuming existing session:', existingConversationId);
          
          // Initialize the session in context first
          // IMPORTANT: Map frontend astrologer ID to backend ID for context
          let astrologerIdForContext: string;
          if ((astrologer as any).astrologer_id) {
            astrologerIdForContext = (astrologer as any).astrologer_id;
          } else {
            const astrologerIdMap: { [key: string]: string } = {
              '1': 'tina_kulkarni_vedic_marriage',
              '2': 'arjun_sharma_career', 
              '3': 'meera_nanda_love'
            };
            astrologerIdForContext = astrologerIdMap[astrologer.id.toString()] || 'tina_kulkarni_vedic_marriage';
          }
          
          sessionActions.updateSessionData({
            conversationId: existingConversationId,
            astrologerId: astrologerIdForContext, // Use backend ID, not frontend
            astrologerName: astrologer?.name || '',
            astrologerImage: astrologer?.image || 'https://via.placeholder.com/50/FF6B35/FFFFFF?text=A',
            sessionType: 'chat',
            sessionStartTime: Date.now()
            // Don't override isVisible - let the context manage it
          });

          // Check if the session is actually paused before trying to resume
          try {
            // Skip status check for temporary unified conversation IDs
            if (existingConversationId.startsWith('unified_')) {
              console.log('⚠️ Skipping status check for temporary unified conversation ID');
              // Just resume the session in context - no API call needed
              await sessionActions.resumeSession();
              console.log('✅ Session resumed successfully (unified - no API call)');
            } else {
              // For real conversation IDs, check status from API
              const statusResponse = await apiService.getSessionStatus(existingConversationId);
              if (statusResponse.success) {
                if (statusResponse.session_status === 'paused') {
                  await sessionActions.resumeSession();
                  console.log('✅ Session resumed successfully');
                } else {
                  console.log('ℹ️ Session is active, no resume needed');
                }
                
                // Update session duration from database if available
                if (statusResponse.session_duration) {
                  sessionActions.updateSessionDuration(statusResponse.session_duration);
                  setSessionTime(statusResponse.session_duration);
                  console.log('🕐 Initialized session time from database:', statusResponse.session_duration);
                }
              }
            }
          } catch (error) {
            console.warn('⚠️ Could not check session status, continuing without resume:', error);
          }
          
          // Load existing conversation history
          // For unified IDs, use unified history endpoint; otherwise use regular history
          if (existingConversationId.startsWith('unified_')) {
            // For unified conversations, only load history if this is the FIRST mount
            // Don't reload if we're returning to an already-active session
            // OR if messages already exist (session is active with messages)
            if (shouldLoad && messages.length === 0) {
              console.log('📜 Loading unified history for conversation (first mount, no messages):', existingConversationId);
              try {
                const userId = await storage.getUserId() || 'test_user_demo';
                
                // Extract astrologer ID from context if astrologer is null
                console.log('🔍 DEBUG - astrologer:', astrologer);
                console.log('🔍 DEBUG - sessionState.astrologerId:', sessionState.astrologerId);
                console.log('🔍 DEBUG - sessionState:', JSON.stringify(sessionState));
                
                let astrologerIdForAPI: string;
                if (astrologer && astrologer.id && !isNaN(astrologer.id)) {
                  // Map frontend ID to backend ID
                  const astrologerIdMap: { [key: string]: string } = {
                    '1': 'tina_kulkarni_vedic_marriage',
                    '2': 'arjun_sharma_career', 
                    '3': 'meera_nanda_love'
                  };
                  astrologerIdForAPI = astrologerIdMap[astrologer.id.toString()] || 'tina_kulkarni_vedic_marriage';
                  console.log('✅ Mapped frontend ID to backend:', astrologerIdForAPI);
                } else if (sessionState.astrologerId && sessionState.astrologerId !== 'NaN' && sessionState.astrologerId.includes('_')) {
                  astrologerIdForAPI = sessionState.astrologerId;
                  console.log('✅ Using astrologer ID from context:', astrologerIdForAPI);
                } else {
                  // Last resort: try to extract from conversation ID
                  // unified_tina_kulkarni_vedic_marriage_1761485576826
                  // Extract everything between unified_ and the last _timestamp
                  const match = existingConversationId.match(/unified_([^_]+(?:_[^_]+)*)_(\d+)$/);
                  if (match && match[1]) {
                    astrologerIdForAPI = match[1];
                    console.log('✅ Extracted astrologer ID from conversation ID:', astrologerIdForAPI);
                  } else {
                    console.error('❌ Cannot find astrologer ID for unified history');
                    setIsLoadingSession(false);
                    return;
                  }
                }
                
                console.log('📜 Using astrologer ID:', astrologerIdForAPI);
                const unifiedHistory = await apiService.getUnifiedChatHistory(userId, astrologerIdForAPI);
                if (unifiedHistory.success && unifiedHistory.messages) {
                  const formattedMessages = unifiedHistory.messages.map((msg: any) => {
                    if (msg.is_separator) {
                      return {
                        id: `separator_${msg.conversation_id}_${msg.date}`,
                        text: msg.separator_text,
                        sender: 'separator',
                        timestamp: '',
                        isSeparator: true
                      };
                    } else {
                      return {
                        id: msg.message_id,
                        text: msg.content,
                        sender: msg.sender_type,
                        timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      };
                    }
                  });
                  
                  // Remove duplicates by creating a Map with the latest message for each ID
                  // Then sort by timestamp to maintain chronological order
                  const messageMap = new Map<string, Message>();
                  formattedMessages.forEach(msg => {
                    // Keep the most recent occurrence of each ID
                    if (!messageMap.has(msg.id)) {
                      messageMap.set(msg.id, msg);
                    }
                  });
                  
                  // Convert to array and sort by timestamp if available
                  const uniqueMessages = Array.from(messageMap.values()).sort((a, b) => {
                    // Try to parse timestamps for proper chronological order
                    const aTime = a.timestamp ? new Date('2000-01-01T' + a.timestamp).getTime() : 0;
                    const bTime = b.timestamp ? new Date('2000-01-01T' + b.timestamp).getTime() : 0;
                    return aTime - bTime;
                  });
                  
                  setMessages(uniqueMessages);
                  console.log('✅ Unified history loaded:', uniqueMessages.length, 'unique messages (deduplicated and sorted)');
                  
                  // Set pagination state
                  if (unifiedHistory.has_more === false || formattedMessages.length < MESSAGES_PER_PAGE) {
                    setHasMoreMessages(false);
                  } else {
                    setHasMoreMessages(true);
                    setCurrentOffset(MESSAGES_PER_PAGE);
                  }
                }
              } catch (error) {
                console.warn('⚠️ Failed to load unified history on resume:', error);
              }
            } else {
              console.log('✅ Not loading history - preserving existing session messages');
            }
          } else {
            console.log('📜 Loading REGULAR conversation history:', existingConversationId);
            
            // FIRST: Try loading unified history for better UX (all messages with astrologer)
            const userId = await storage.getUserId() || 'test_user_demo';
            
            // Determine the backend astrologer ID (not frontend ID)
            // First try to extract from sessionState if available (this is more reliable on resume)
            let astrologerBackendId: string;
            
            if (sessionState.astrologerId && sessionState.astrologerId.includes('_')) {
              // If it's already a backend ID (contains underscore), use it directly
              astrologerBackendId = sessionState.astrologerId;
              console.log('✅ Using backend astrologer ID from context:', astrologerBackendId);
            } else if (sessionState.astrologerId && sessionState.astrologerId !== 'NaN' && !sessionState.astrologerId.includes('_')) {
              // It's a frontend ID, map it to backend ID
              const astrologerIdFromContext = sessionState.astrologerId;
              const astrologerIdMap: { [key: string]: string } = {
                '1': 'tina_kulkarni_vedic_marriage',
                '2': 'arjun_sharma_career', 
                '3': 'meera_nanda_love'
              };
              astrologerBackendId = astrologerIdMap[astrologerIdFromContext] || astrologerIdFromContext;
              console.log('✅ Mapped frontend ID to backend:', astrologerBackendId);
            } else if ((astrologer as any).astrologer_id) {
              astrologerBackendId = (astrologer as any).astrologer_id;
            } else {
              // Use the mapping for frontend astrologers
              const astrologerIdMap: { [key: string]: string } = {
                '1': 'tina_kulkarni_vedic_marriage',
                '2': 'arjun_sharma_career', 
                '3': 'meera_nanda_love'
              };
              astrologerBackendId = astrologerIdMap[astrologer.id.toString()] || 'tina_kulkarni_vedic_marriage';
            }
            
            console.log('📜 Attempting to load unified history for astrologer:', astrologerBackendId);
            console.log('📜 Frontend astrologer ID:', astrologer.id);
            console.log('📜 SessionState astrologer ID:', sessionState.astrologerId);
            try {
              const unifiedHistory = await apiService.getUnifiedChatHistory(userId, astrologerBackendId);
              if (unifiedHistory.success && unifiedHistory.messages && unifiedHistory.messages.length > 0) {
                const formattedMessages = unifiedHistory.messages.map((msg: any) => {
                  if (msg.is_separator) {
                    return {
                      id: `separator_${msg.conversation_id}_${msg.date}`,
                      text: msg.separator_text,
                      sender: 'separator',
                      timestamp: '',
                      isSeparator: true
                    };
                  } else {
                    return {
                      id: msg.message_id,
                      text: msg.content,
                      sender: msg.sender_type,
                      timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                  }
                });
                
                // Remove duplicates by creating a Map with the latest message for each ID
                const messageMap3 = new Map<string, Message>();
                formattedMessages.forEach(msg => {
                  if (!messageMap3.has(msg.id)) {
                    messageMap3.set(msg.id, msg);
                  }
                });
                const uniqueMessages3 = Array.from(messageMap3.values()).sort((a, b) => {
                  const aTime = a.timestamp ? new Date('2000-01-01T' + a.timestamp).getTime() : 0;
                  const bTime = b.timestamp ? new Date('2000-01-01T' + b.timestamp).getTime() : 0;
                  return aTime - bTime;
                });
                
                setMessages(uniqueMessages3);
                console.log('✅ Unified history loaded:', uniqueMessages3.length, 'unique messages (deduplicated and sorted)');
                
                // Set pagination state
                if (unifiedHistory.has_more === false || formattedMessages.length < MESSAGES_PER_PAGE) {
                  setHasMoreMessages(false);
                } else {
                  setHasMoreMessages(true);
                  setCurrentOffset(MESSAGES_PER_PAGE);
                }
                
                // Skip loading regular history if unified worked
                setConversationId(existingConversationId);
                
                // IMPORTANT: Reinitialize wallet and remaining time on resume
                try {
                  const userIdForWallet = await storage.getUserId() || 'test_user_demo';
                  const walletResponse = await apiService.getWalletBalance(userIdForWallet);
                  if (walletResponse.success) {
                    const currentBalance = walletResponse.balance;
                    setWalletBalance(currentBalance);
                    setInitialWalletBalance(currentBalance);
                    
                    // Recalculate remaining time based on current balance
                    const rate = (astrologer as any).price_per_minute || astrologerRate;
                    setAstrologerRate(rate);
                    const remaining = calculateRemainingTime(currentBalance, rate);
                    setRemainingTime(remaining);
                    setShowRechargeBar(false); // Reset recharge bar
                    console.log(`💰 Unified Resume - Wallet: ₹${currentBalance}, Remaining: ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`);
                  }
                } catch (error) {
                  console.warn('⚠️ Could not load wallet on unified resume:', error);
                }
                
                setIsLoadingSession(false);
                return;
              } else {
                console.log('⚠️ Unified history empty, falling back to regular history');
              }
            } catch (error) {
              console.warn('⚠️ Failed to load unified history:', error);
              console.log('📜 Falling back to regular conversation history');
            }
            
            // FALLBACK: Load only this conversation's messages
            const historyResponse = await apiService.getChatHistory(existingConversationId, MESSAGES_PER_PAGE, 0);
            if (historyResponse.success && historyResponse.messages && historyResponse.messages.length > 0) {
              const formattedMessages = historyResponse.messages.map((msg: any) => ({
                id: msg.message_id,
                text: msg.content,
                sender: msg.sender_type,
                timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }));
              setMessages(formattedMessages);
              setCurrentOffset(MESSAGES_PER_PAGE);
              
              // Check if there are more messages to load
              if (historyResponse.has_more === false || formattedMessages.length < MESSAGES_PER_PAGE) {
                setHasMoreMessages(false);
              }
              
              console.log('✅ Regular history loaded:', formattedMessages.length, 'messages');
            } else {
              console.warn('⚠️ Conversation has no messages or failed to load');
              console.warn('⚠️ This might be an empty conversation - starting fresh');
              // For empty conversations, start with a fresh greeting
              setMessages([]);
              setHasMoreMessages(false);
            }
          }
          
          // Session time is now initialized from database status above
          
          // IMPORTANT: Reinitialize wallet and remaining time on resume
          try {
            const userId = await storage.getUserId() || 'test_user_demo';
            const walletResponse = await apiService.getWalletBalance(userId);
            if (walletResponse.success) {
              const currentBalance = walletResponse.balance;
              setWalletBalance(currentBalance);
              setInitialWalletBalance(currentBalance);
              
              // Recalculate remaining time based on current balance
              const rate = (astrologer as any).price_per_minute || astrologerRate;
              setAstrologerRate(rate);
              const remaining = calculateRemainingTime(currentBalance, rate);
              setRemainingTime(remaining);
              setShowRechargeBar(false); // Reset recharge bar
              console.log(`💰 Resume - Wallet: ₹${currentBalance}, Remaining: ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`);
            }
          } catch (error) {
            console.warn('⚠️ Could not load wallet on resume:', error);
          }
          
          setConversationId(existingConversationId);
          setIsLoadingSession(false);
          return;
        }
        
        // Check if we're loading unified chat history
        if (unifiedAstrologerId) {
          console.log('📜 Loading unified chat history for astrologer:', unifiedAstrologerId);
          
          // Get user ID
          let userId = await storage.getUserId();
          if (!userId) {
            console.log('⚠️ No user ID found, using test user for demo');
            userId = 'test_user_demo';
          }
          
          // Determine backend astrologer ID (map if frontend ID)
          let backendAstrologerIdForUnified: string;
          const astrologerIdMap: { [key: string]: string } = {
            '1': 'tina_kulkarni_vedic_marriage',
            '2': 'arjun_sharma_career', 
            '3': 'meera_nanda_love'
          };
          backendAstrologerIdForUnified = astrologerIdMap[unifiedAstrologerId] || unifiedAstrologerId;
          
          console.log('📜 Unified history - Frontend ID:', unifiedAstrologerId);
          console.log('📜 Unified history - Backend ID:', backendAstrologerIdForUnified);
          
          // Load unified chat history
          try {
            const unifiedHistory = await apiService.getUnifiedChatHistory(userId, backendAstrologerIdForUnified);
            if (unifiedHistory.success) {
              console.log('✅ Unified history loaded:', unifiedHistory.messages.length, 'messages');
              
              // Format messages with date separators
              const formattedMessages = unifiedHistory.messages.map((msg: any) => {
                if (msg.is_separator) {
                  return {
                    id: `separator_${msg.conversation_id}_${msg.date}`,
                    text: msg.separator_text,
                    sender: 'separator',
                    timestamp: '',
                    isSeparator: true
                  };
                } else {
                  return {
                    id: msg.message_id,
                    text: msg.content,
                    sender: msg.sender_type,
                    timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  };
                }
              });
              
              // Remove duplicates by creating a Map with the latest message for each ID
              const messageMap4 = new Map<string, Message>();
              formattedMessages.forEach(msg => {
                if (!messageMap4.has(msg.id)) {
                  messageMap4.set(msg.id, msg);
                }
              });
              const uniqueMessages4 = Array.from(messageMap4.values()).sort((a, b) => {
                const aTime = a.timestamp ? new Date('2000-01-01T' + a.timestamp).getTime() : 0;
                const bTime = b.timestamp ? new Date('2000-01-01T' + b.timestamp).getTime() : 0;
                return aTime - bTime;
              });
              
              setMessages(uniqueMessages4);
              
              // Update astrologer info from API response
              if (unifiedHistory.astrologer) {
                const updatedAstrologer = {
                  ...astrologer,
                  name: unifiedHistory.astrologer.display_name,
                  image: unifiedHistory.astrologer.profile_picture_url || astrologer.image
                };
                // Note: We can't update route params, but we can use the updated info for display
              }
              
              // Initialize wallet balance and timer for unified history
              const walletResponse = await apiService.getWalletBalance(userId);
              let currentBalance = 50; // Default fallback
              if (walletResponse.success) {
                currentBalance = walletResponse.balance;
                setWalletBalance(currentBalance);
                setInitialWalletBalance(currentBalance);
              } else {
                console.warn('⚠️ Failed to load wallet balance, using default');
                setWalletBalance(currentBalance);
                setInitialWalletBalance(currentBalance);
              }
              
              // Get astrologer rate (default to 8 if not available)
              const rate = (astrologer as any).price_per_minute || astrologerRate;
              setAstrologerRate(rate);
              
              // Calculate and set remaining time based on balance
              const remaining = calculateRemainingTime(currentBalance, rate);
              setRemainingTime(remaining);
              console.log(`💰 Unified History - Wallet: ₹${currentBalance}, Rate: ₹${rate}/min, Remaining time: ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`);
              console.log(`⏰ Unified History - Remaining time set to: ${remaining} seconds`);
              
              // Start session in context for unified history (this will make isActive=true)
              const tempConversationId = `unified_${backendAstrologerIdForUnified}_${Date.now()}`;
              sessionActions.startSession({
                conversationId: tempConversationId,
                astrologerId: backendAstrologerIdForUnified, // Use backend ID, not frontend
                astrologerName: astrologer?.name || '',
                astrologerImage: astrologer?.image || 'https://via.placeholder.com/50/FF6B35/FFFFFF?text=A',
                sessionType: 'chat',
                sessionStartTime: Date.now(),
                pausedTime: undefined,
                totalPausedDuration: 0,
              });
              
              // Set the conversation ID for message sending
              setConversationId(tempConversationId);
              
              console.log('✅ Unified history session started in context with ID:', tempConversationId);
            } else {
              console.warn('⚠️ Failed to load unified history, starting new session');
            }
          } catch (error) {
            console.warn('⚠️ Error loading unified history:', error);
          }
          
          setIsLoadingSession(false);
          return;
        }
        
        // Get user ID
        let userId = await storage.getUserId();
        if (!userId) {
          console.log('⚠️ No user ID found, using test user for demo');
          userId = 'test_user_demo'; // Use test user for demo
        }
        
        // Get wallet balance
        const walletResponse = await apiService.getWalletBalance(userId);
        let currentBalance = 50; // Default fallback
        if (walletResponse.success) {
          currentBalance = walletResponse.balance;
          setWalletBalance(currentBalance);
          setInitialWalletBalance(currentBalance);
        } else {
          console.warn('⚠️ Failed to load wallet balance, using default');
          setWalletBalance(currentBalance);
          setInitialWalletBalance(currentBalance);
        }
        
        // Get astrologer rate (default to 8 if not available)
        const rate = (astrologer as any).price_per_minute || astrologerRate;
        setAstrologerRate(rate);
        
        // Calculate and set remaining time based on balance
        const remaining = calculateRemainingTime(currentBalance, rate);
        setRemainingTime(remaining);
        console.log(`💰 Wallet: ₹${currentBalance}, Rate: ₹${rate}/min, Remaining time: ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`);
        console.log(`⏰ Remaining time set to: ${remaining} seconds`);
        
        // Start NEW chat session
        console.log('🚀 Starting NEW chat with', astrologer.name);
        
        // Determine the backend astrologer ID
        let backendAstrologerId: string;
        
        // If astrologer has a custom astrologer_id (from database), use it
        if ((astrologer as any).astrologer_id) {
          backendAstrologerId = (astrologer as any).astrologer_id;
        } else {
          // Otherwise, use the mapping for frontend astrologers
          const astrologerIdMap: { [key: string]: string } = {
            '1': 'tina_kulkarni_vedic_marriage',
            '2': 'arjun_sharma_career', 
            '3': 'meera_nanda_love'
          };
          backendAstrologerId = astrologerIdMap[astrologer.id.toString()] || 'tina_kulkarni_vedic_marriage';
        }
        
        console.log('🎯 Using backend astrologer ID:', backendAstrologerId);
        
        const sessionResponse = await apiService.startChatSession(
          userId,
          backendAstrologerId,
          'general'
        );
        
        if (sessionResponse.success) {
          console.log('✅ Chat session started:', sessionResponse.conversation_id);
          setConversationId(sessionResponse.conversation_id);
          
          // Start session in context for persistent management
          sessionActions.startSession({
            conversationId: sessionResponse.conversation_id,
            astrologerId: backendAstrologerId,
            astrologerName: astrologer?.name || '',
            astrologerImage: astrologer?.image || 'https://via.placeholder.com/50/FF6B35/FFFFFF?text=A',
            sessionType: 'chat',
            sessionStartTime: Date.now(),
            pausedTime: undefined,
            totalPausedDuration: 0,
          });
          
          // Initialize session duration in context
          sessionActions.updateSessionDuration(0);
          
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
        setIsInitialized(true); // Mark initialization as complete
      }
    };
    
    initializeSession();
  }, []);

  // Handle navigation events for session pause/resume
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
      console.log('🔙 beforeRemove triggered');
      console.log('🔙 conversationId:', conversationId);
      console.log('🔙 sessionEnded:', sessionEnded);
      console.log('🔙 sessionState:', sessionState);
      
      // Pause session when user navigates away
      if (conversationId && !sessionEnded) {
        console.log('🔙 Attempting to pause session...');
        try {
          // For temporary unified IDs, just show the persistent bar without API call
          if (conversationId.startsWith('unified_')) {
            console.log('⚠️ Temporary unified conversation - showing persistent bar directly');
            sessionActions.showSession(); // Show persistent bar
            return;
          }
          
          // Check if session is actually active before trying to pause
          const statusResponse = await apiService.getSessionStatus(conversationId);
          console.log('🔙 Session status response:', statusResponse);
          if (statusResponse.success && statusResponse.session_status === 'active') {
            await sessionActions.pauseSession();
            sessionActions.showSession(); // Show persistent bar
            console.log('✅ Session paused on navigation');
          } else {
            console.log('ℹ️ Session is not active, skipping pause');
          }
        } catch (error) {
          console.warn('⚠️ Could not pause session on navigation:', error);
        }
      } else {
        console.log('🔙 Skipping pause - conversationId:', conversationId, 'sessionEnded:', sessionEnded);
      }
    });

    return unsubscribe;
  }, [navigation, conversationId, sessionEnded, sessionActions]);

  // Dual timer system: forward counter for session time + countdown for remaining time
  useEffect(() => {
    if (!sessionEnded && sessionState.isActive && !sessionState.isPaused && !showRechargeBar && isInitialized) {
      console.log('⏰ Starting timer...');
      const timer = setInterval(() => {
        // Increment session time (for billing)
        setSessionTime((prev) => prev + 1);
        
        // Decrement remaining time (countdown)
        setRemainingTime((prev) => {
          if (prev <= 0) {
            // Balance exhausted - show recharge bar
            setShowRechargeBar(true);
            console.log('⏸️ Balance exhausted - showing recharge bar');
            return 0;
          }
          
          // Show warning at 1 minute remaining
          if (prev === 60) {
            console.log('⚠️ Warning: Only 1 minute remaining!');
          }
          
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionEnded, sessionState.isActive, sessionState.isPaused, showRechargeBar, isInitialized]);

  // Update session duration in context when sessionTime changes
  useEffect(() => {
    if (sessionTime > 0) {
      sessionActions.updateSessionDuration(sessionTime);
    }
  }, [sessionTime]); // Removed sessionActions from dependencies
  
  // Debug session state changes
  useEffect(() => {
    console.log(`🔄 Session state changed: isActive=${sessionState.isActive}, isPaused=${sessionState.isPaused}, conversationId=${sessionState.conversationId}`);
  }, [sessionState.isActive, sessionState.isPaused, sessionState.conversationId]);

  // Deduplicate messages to prevent React key warnings AND remove excessive logging
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set<string>();
    const unique = new Map<string, Message>();
    
    // Keep the last occurrence of each message ID
    // (This is important for unified history where the same message might appear multiple times)
    messages.forEach(msg => {
      unique.set(msg.id, msg);
    });
    
    return Array.from(unique.values());
  }, [messages]);
  
  // Auto scroll to bottom when new messages arrive
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
    
    // Debug logging to identify blocking condition
    console.log('🔍 Debug - handleSendMessage called with:', {
      messageText: messageText,
      messageTextLength: messageText?.length,
      sessionEnded,
      isSessionPaused,
      conversationId,
      hasMessageText: !!messageText,
      canSend: !!(messageText && !sessionEnded && !isSessionPaused && conversationId),
      unifiedAstrologerId: unifiedAstrologerId
    });
    
    if (!messageText) {
      console.log('❌ Blocked: No message text');
      return;
    }
    if (sessionEnded) {
      console.log('❌ Blocked: Session ended');
      return;
    }
    if (isSessionPaused) {
      console.log('❌ Blocked: Session paused');
      return;
    }
    if (!conversationId) {
      console.log('❌ Blocked: No conversation ID');
      return;
    }

    try {
      setIsSendingMessage(true);
      
      // Record when typing started
      const typingStartTime = Date.now();
      
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newMessage]);
      setInputMessage("");

      // Show typing indicator with delay for realistic feel
      console.log('⌨️ Setting typing indicator to true');
      setIsTyping(true);
      
      // Add 1-2 second delay before getting AI response
      const typingDelay = Math.random() * 1000 + 1000; // 1-2 seconds
      console.log(`⌨️ Typing delay: ${typingDelay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, typingDelay));

      // Get real AI response from OpenAI chat handler (this will also save the user message)
      try {
        console.log('🤖 Getting AI response...');
        
        // Determine backend astrologer ID
        let backendAstrologerId: string;
        if (unifiedAstrologerId) {
          // Use the unified astrologer ID directly
          backendAstrologerId = unifiedAstrologerId;
        } else if ((astrologer as any).astrologer_id) {
          // Use custom astrologer_id from database
          backendAstrologerId = (astrologer as any).astrologer_id;
        } else {
          // Map mobile astrologer ID to backend astrologer ID
          const astrologerIdMap: { [key: string]: string } = {
            '1': 'tina_kulkarni_vedic_marriage',
            '2': 'arjun_sharma_career', 
            '3': 'meera_nanda_love'
          };
          backendAstrologerId = astrologerIdMap[astrologer.id.toString()] || 'tina_kulkarni_vedic_marriage';
        }
        
        // If we have a temporary conversation ID (unified history mode), start a new unified session
        let actualConversationId = conversationId; // Track the actual ID to use
        
        if (conversationId && conversationId.startsWith('unified_') && unifiedAstrologerId) {
          console.log('🚀 Starting new unified session for message');
          const userId = await storage.getUserId() || 'test_user_demo';
          
          // Map frontend astrologer ID to backend ID if needed
          const astrologerIdMap: { [key: string]: string } = {
            '1': 'tina_kulkarni_vedic_marriage',
            '2': 'arjun_sharma_career', 
            '3': 'meera_nanda_love'
          };
          const backendAstrologerIdForSession = astrologerIdMap[unifiedAstrologerId] || unifiedAstrologerId;
          
          console.log('🔍 Creating real conversation ID. Frontend ID:', unifiedAstrologerId, 'Backend ID:', backendAstrologerIdForSession);
          
          const sessionResponse = await apiService.startChatSession(userId, backendAstrologerIdForSession, 'general');
          if (sessionResponse.success) {
            actualConversationId = sessionResponse.conversation_id;
            setConversationId(actualConversationId);
            
            // Update context with real ID
            sessionActions.updateSessionData({
              conversationId: actualConversationId,
            });
            
            // Save real conversation ID to storage
            await storage.saveLastConversation(actualConversationId);
            
            console.log('✅ Unified session started with real conversation ID:', actualConversationId);
          }
        }
        
        console.log('📤 Sending message with conversation ID:', actualConversationId);
        const aiResponse = await apiService.getAIResponse(actualConversationId, messageText, backendAstrologerId);
        
        const astrologerMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.message || aiResponse.ai_response || "I'm sorry, I couldn't process your request right now.",
          sender: "astrologer",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, astrologerMessage]);
        console.log('⌨️ Setting typing indicator to false (AI response received)');
        // Ensure typing indicator is visible for at least 1 second
        const elapsedTime = Date.now() - typingStartTime;
        const minDisplayTime = 1000; // 1 second minimum
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
        
        console.log(`⌨️ Elapsed time: ${elapsedTime}ms, remaining: ${remainingTime}ms`);
        
        setTimeout(() => {
          console.log('⌨️ Actually hiding typing indicator');
          setIsTyping(false);
        }, remainingTime);
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
        console.log('⌨️ Setting typing indicator to false (fallback response)');
        setIsTyping(false); // Hide typing indicator for fallback response too
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      console.log('⌨️ Setting typing indicator to false (error)');
      setIsTyping(false); // Hide typing indicator on error
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleEndSession = async () => {
    console.log('End button pressed!');
    setShowEndSessionModal(true);
  };

  const confirmEndSession = async () => {
    setShowEndSessionModal(false);
    
    if (!conversationId) {
      navigation.goBack();
      return;
    }
    
    try {
      // Calculate total cost based on session duration
      const sessionDurationMinutes = Math.ceil(sessionTime / 60);
      const totalCost = sessionDurationMinutes * astrologerRate;
      const finalBalance = Math.max(0, initialWalletBalance - totalCost);
      
      console.log(`💰 Session End - Duration: ${sessionDurationMinutes}min, Cost: ₹${totalCost}, Final Balance: ₹${finalBalance}`);
      
      // Get user ID for wallet deduction
      const userId = await storage.getUserId();
      if (userId) {
        // Deduct balance from wallet
        try {
          await apiService.deductSessionBalance(
            userId,
            conversationId,
            astrologer.id.toString(),
            astrologer.name,
            astrologerRate,
            sessionDurationMinutes,
            'per_minute'
          );
          console.log('✅ Wallet balance deducted successfully');
        } catch (deductError) {
          console.error('❌ Failed to deduct wallet balance:', deductError);
          // Continue with session end even if deduction fails
        }
      }
      
      // Update local balance for display
      setWalletBalance(finalBalance);
      
      // End session in context (this will also end in database)
      await sessionActions.endSession();
      console.log('✅ Session ended via context');
      
      setSessionEnded(true);
      navigation.navigate('ChatReview', { 
        astrologer, 
        sessionDuration: formatTime(sessionState.sessionDuration || sessionTime),
        conversationId: conversationId 
      });
    } catch (error) {
      console.error('❌ Failed to end session:', error);
      // Fallback to direct API call
      try {
        await apiService.endConversation(conversationId, sessionState.sessionDuration || sessionTime);
        setSessionEnded(true);
        navigation.navigate('ChatReview', { 
          astrologer, 
          sessionDuration: formatTime(sessionState.sessionDuration || sessionTime),
          conversationId: conversationId 
        });
      } catch (fallbackError) {
        console.error('❌ Fallback end session failed:', fallbackError);
        Alert.alert('Error', 'Failed to end session. Please try again.');
      }
    }
  };

  const cancelEndSession = () => {
    setShowEndSessionModal(false);
  };

  const handleMinimize = () => {
    navigation.goBack();
  };

  const handleRecharge = async () => {
    try {
      // Pause the session before navigating to wallet
      await sessionActions.pauseSession();
      sessionActions.showSession(); // Show persistent bar
      console.log('✅ Session paused for recharge');
      
      // Navigate to Wallet screen
      navigation.navigate('Wallet');
    } catch (error) {
      console.error('❌ Failed to pause session for recharge:', error);
      // Navigate anyway
      navigation.navigate('Wallet');
    }
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleMinimize}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: astrologer?.image || 'https://via.placeholder.com/50/FF6B35/FFFFFF?text=A' }}
            style={styles.profileImage}
            onError={(error) => {
              console.warn('⚠️ Failed to load astrologer image:', astrologer?.image);
            }}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.astrologerName} numberOfLines={1}>
              {astrologer?.name || 'Astrologer'}
            </Text>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionIcon}>⏱️</Text>
              <Text style={[
                styles.sessionTime,
                remainingTime <= 60 && remainingTime > 0 && styles.sessionTimeWarning,
                remainingTime === 0 && styles.sessionTimeZero
              ]}>
                {formatTime(remainingTime)}
              </Text>
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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.endIcon}>📞</Text>
          <Text style={styles.endText}>End</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          onLayout={(e) => console.log('📏 ScrollView layout:', e.nativeEvent.layout)}
          onContentSizeChange={(w, h) => console.log('📐 Content size:', w, h)}
          onScroll={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            // When scrolled near the top (within 100px of top), load more messages
            if (contentOffset.y < 100 && hasMoreMessages && !isLoadingMore) {
              console.log('📜 User scrolled to top, loading more messages...');
              loadMoreMessages();
            }
          }}
          scrollEventThrottle={400}
        >
        {/* Loading indicator for older messages */}
        {isLoadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.loadingMoreText}>Loading older messages...</Text>
          </View>
        )}
        
        {uniqueMessages.map((message) => {
          // Handle date separator
          if (message.isSeparator) {
            return (
              <View key={message.id} style={styles.dateSeparatorContainer}>
                <View style={styles.dateSeparatorLine} />
                <Text style={styles.dateSeparatorText}>{message.text}</Text>
                <View style={styles.dateSeparatorLine} />
              </View>
            );
          }
          
          // Regular message
          return (
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
          );
          })}
          
          {/* Typing Indicator */}
          <TypingIndicator 
            astrologerName={astrologer.name}
            isVisible={isTyping}
          />
        </ScrollView>
      </View>

      {/* Input Bar or Recharge Bar - fixed bottom component */}
      {showRechargeBar ? (
        <RechargeBar
          visible={showRechargeBar}
          onRecharge={handleRecharge}
        />
      ) : (
        <ChatInputBar
          value={inputMessage}
          onChangeText={setInputMessage}
          onSend={() => handleSendMessage()}
          disabled={isSessionPaused || sessionEnded || remainingTime === 0}
          placeholder={remainingTime === 0 ? 'Recharge to continue...' : 'Type your message...'}
          sending={isSendingMessage}
        />
      )}
      
      {/* End Session Confirmation Modal */}
      <Modal
        visible={showEndSessionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelEndSession}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>End Chat Session</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to end this chat session? This action cannot be undone.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cancelEndSession}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalEndButton}
                onPress={confirmEndSession}
                activeOpacity={0.8}
              >
                <Text style={styles.modalEndText}>End Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollWrapper: {
    flex: 1,
    overflow: 'hidden', // Prevent wrapper from expanding
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 100, // Space for fixed input
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 12,
    color: '#6b7280',
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
    zIndex: 10, // Ensure header is above ScrollView
    position: 'relative',
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
  sessionTimeWarning: {
    color: '#f59e0b', // Yellow/amber warning color
    fontWeight: 'bold',
  },
  sessionTimeZero: {
    color: '#ef4444', // Red color for zero balance
    fontWeight: 'bold',
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
    backgroundColor: '#FFE4B5', // Light peach/gold from theme
    borderWidth: 1,
    borderColor: '#F7931E', // Orange border
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
    color: '#F7931E', // Orange text instead of white
  },
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginHorizontal: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    shadowColor: '#F7931E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium',
  },
  modalEndButton: {
    flex: 1,
    backgroundColor: '#F7931E',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#F7931E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  modalEndText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium',
  },
});

export default ChatSessionScreen;
