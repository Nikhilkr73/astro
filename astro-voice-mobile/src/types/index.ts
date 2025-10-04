// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  preferences: UserPreferences;
  subscriptionStatus: 'free' | 'premium';
}

export interface UserPreferences {
  language: 'hindi' | 'english';
  preferredAstrologer?: string;
  voiceSpeed: 'slow' | 'normal' | 'fast';
  notifications: boolean;
}

// Astrologer types
export interface Astrologer {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  specialization: string[];
  voiceProfile: VoiceProfile;
  personality: AstrologerPersonality;
  availability: boolean;
  rating: number;
  experience: number; // years
  avatar: string;
}

export interface VoiceProfile {
  accent: 'north_indian' | 'south_indian' | 'western' | 'bengali' | 'punjabi';
  pitch: 'low' | 'medium' | 'high';
  speed: 'slow' | 'medium' | 'fast';
  tone: 'formal' | 'friendly' | 'wise' | 'energetic';
}

export interface AstrologerPersonality {
  greetingStyle: string;
  responseStyle: string;
  specialPhrases: string[];
  culturalReferences: string[];
}

// Voice Chat types
export interface VoiceChatSession {
  id: string;
  userId: string;
  astrologerId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'ended' | 'paused';
  messages: VoiceMessage[];
  summary?: string;
}

export interface VoiceMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'astrologer';
  timestamp: Date;
  audioUrl?: string;
  transcript?: string;
  duration: number; // seconds
  isProcessing: boolean;
}

// Audio types
export interface AudioRecording {
  uri: string;
  duration: number;
  size: number;
  mimeType: string;
}

export interface AudioPlayback {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  position: number;
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VoiceProcessingRequest {
  audioData: string; // base64 encoded
  userId: string;
  astrologerId: string;
  sessionId: string;
  language: 'hindi' | 'english';
}

export interface VoiceProcessingResponse {
  audioResponse: string; // base64 encoded audio
  transcript: string;
  responseText: string;
  metadata: {
    processingTime: number;
    confidence: number;
    astrologerPersonality: string;
  };
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  AstrologerSelection: undefined;
  VoiceChat: {
    astrologerId: string;
    sessionId?: string;
  };
  Profile: undefined;
  Settings: undefined;
  ChatHistory: undefined;
  Premium: undefined;
};

export type TabParamList = {
  Home: undefined;
  Chat: undefined;
  History: undefined;
  Profile: undefined;
};

// App State types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentSession: VoiceChatSession | null;
  selectedAstrologer: Astrologer | null;
  astrologers: Astrologer[];
  chatHistory: VoiceChatSession[];
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// AWS Configuration
export interface AWSConfig {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  apiGatewayUrl: string;
  s3BucketName: string;
}

// WebSocket types
export interface WebSocketMessage {
  type: 'audio' | 'text' | 'control' | 'error';
  data: any;
  sessionId: string;
  timestamp: Date;
}

export interface VoiceStreamConfig {
  sampleRate: number;
  channels: number;
  format: 'pcm' | 'wav' | 'webm';
  bufferSize: number;
}