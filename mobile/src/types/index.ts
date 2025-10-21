export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  AstrologerProfile: { astrologer: Astrologer };
  ChatSession: { 
    astrologer: Astrologer; 
    conversationId?: string;  // Add this for continuing chats
  };
  VoiceCall: { astrologer: Astrologer };
  ChatReview: { astrologer: Astrologer; sessionDuration: string; conversationId: string };
  Wallet: undefined;
  WalletHistory: undefined;
  TransactionStatus: { status: 'success' | 'failed' | 'pending' };
  WebView: { type: 'terms' | 'privacy' };
};

export type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export interface Astrologer {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  experience: string;
  languages: string[];
  isOnline: boolean;
  image: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'astrologer';
  timestamp: string;
}

export interface ConversationHistory {
  conversation_id: string;
  astrologer_id: string;
  astrologer_name: string;
  astrologer_image?: string;
  last_message: string;
  last_message_time: string;
  status: string;
  total_messages: number;
  isUnread?: boolean;
}

export interface ChatSession {
  astrologer: Astrologer;
  duration: string;
}
