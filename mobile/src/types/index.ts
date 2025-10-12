export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  AstrologerProfile: { astrologer: Astrologer };
  ChatSession: { astrologer: Astrologer };
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

export interface ChatSession {
  astrologer: Astrologer;
  duration: string;
}
