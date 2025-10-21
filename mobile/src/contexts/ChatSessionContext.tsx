import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ChatSessionData {
  conversationId: string;
  astrologerId: string;
  astrologerName: string;
  astrologerImage?: string;
  sessionType: 'chat' | 'voice';
  sessionStartTime: number;
  pausedTime?: number;
  totalPausedDuration: number;
}

export interface ChatSessionState {
  // Session data
  conversationId: string | null;
  astrologerId: string | null;
  astrologerName: string | null;
  astrologerImage: string | null;
  sessionType: 'chat' | 'voice' | null;
  
  // Timer data
  sessionStartTime: number | null;
  pausedTime: number | null;
  totalPausedDuration: number;
  sessionDuration: number; // Actual active session time in seconds (for billing)
  
  // Status flags
  isActive: boolean;
  isPaused: boolean;
  isVisible: boolean; // Whether persistent bar should be visible
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

export interface ChatSessionActions {
  startSession: (sessionData: ChatSessionData) => void;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: () => Promise<void>;
  hideSession: () => void;
  showSession: () => void;
  updateSessionData: (updates: Partial<ChatSessionData>) => void;
  updateSessionDuration: (duration: number) => void;
  clearError: () => void;
}

// =============================================================================
// ACTION TYPES
// =============================================================================

type ChatSessionAction =
  | { type: 'START_SESSION'; payload: ChatSessionData }
  | { type: 'PAUSE_SESSION'; payload: { pausedTime: number } }
  | { type: 'RESUME_SESSION' }
  | { type: 'END_SESSION' }
  | { type: 'HIDE_SESSION' }
  | { type: 'SHOW_SESSION' }
  | { type: 'UPDATE_SESSION_DATA'; payload: Partial<ChatSessionData> }
  | { type: 'UPDATE_SESSION_DURATION'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: ChatSessionState };

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: ChatSessionState = {
  conversationId: null,
  astrologerId: null,
  astrologerName: null,
  astrologerImage: null,
  sessionType: null,
  sessionStartTime: null,
  pausedTime: null,
  totalPausedDuration: 0,
  sessionDuration: 0, // Actual active session time
  isActive: false,
  isPaused: false,
  isVisible: false,
  isLoading: false,
  error: null,
};

// =============================================================================
// REDUCER
// =============================================================================

function chatSessionReducer(state: ChatSessionState, action: ChatSessionAction): ChatSessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        conversationId: action.payload.conversationId,
        astrologerId: action.payload.astrologerId,
        astrologerName: action.payload.astrologerName,
        astrologerImage: action.payload.astrologerImage || null,
        sessionType: action.payload.sessionType,
        sessionStartTime: action.payload.sessionStartTime,
        pausedTime: null,
        totalPausedDuration: 0,
        isActive: true,
        isPaused: false,
        isVisible: false, // Initially hidden, will show when user navigates away
        isLoading: false,
        error: null,
      };

    case 'PAUSE_SESSION':
      return {
        ...state,
        pausedTime: action.payload.pausedTime,
        isPaused: true,
        isActive: false,
        isVisible: true, // Show persistent bar when paused
        isLoading: false,
        error: null,
      };

    case 'RESUME_SESSION':
      return {
        ...state,
        pausedTime: null,
        isPaused: false,
        isActive: true,
        // Keep isVisible true until navigation completes
        isLoading: false,
        error: null,
      };

    case 'END_SESSION':
      return {
        ...initialState,
        isLoading: false,
        error: null,
      };

    case 'HIDE_SESSION':
      return {
        ...state,
        isVisible: false,
      };

    case 'SHOW_SESSION':
      return {
        ...state,
        isVisible: true,
      };

    case 'UPDATE_SESSION_DATA':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
      };

    case 'UPDATE_SESSION_DURATION':
      return {
        ...state,
        sessionDuration: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESTORE_SESSION':
      return {
        ...action.payload,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

const ChatSessionContext = createContext<{
  state: ChatSessionState;
  actions: ChatSessionActions;
} | null>(null);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface ChatSessionProviderProps {
  children: ReactNode;
}

export function ChatSessionProvider({ children }: ChatSessionProviderProps) {
  const [state, dispatch] = useReducer(chatSessionReducer, initialState);

  // =============================================================================
  // PERSISTENCE
  // =============================================================================

  // Save session state to AsyncStorage
  const saveSessionState = async (sessionState: ChatSessionState) => {
    try {
      await AsyncStorage.setItem('chat_session_state', JSON.stringify(sessionState));
    } catch (error) {
      console.error('❌ Failed to save session state:', error);
    }
  };

  // Load session state from AsyncStorage
  const loadSessionState = async (): Promise<ChatSessionState | null> => {
    try {
      const savedState = await AsyncStorage.getItem('chat_session_state');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('❌ Failed to load session state:', error);
    }
    return null;
  };

  // Save state whenever it changes
  useEffect(() => {
    if (state.conversationId) {
      saveSessionState(state);
    }
  }, [state]);

  // Load saved state on app start
  useEffect(() => {
    const restoreSession = async () => {
      const savedState = await loadSessionState();
      if (savedState && savedState.conversationId) {
        // Check if session is still valid on server
        try {
          const statusResponse = await apiService.getSessionStatus(savedState.conversationId);
          if (statusResponse.success && statusResponse.is_active) {
            dispatch({ type: 'RESTORE_SESSION', payload: savedState });
            console.log('✅ Restored chat session:', savedState.conversationId);
          } else {
            // Session is no longer valid, clear it
            await AsyncStorage.removeItem('chat_session_state');
            console.log('⚠️ Session no longer valid, cleared');
          }
        } catch (error) {
          console.error('❌ Failed to validate session:', error);
          // Clear invalid session
          await AsyncStorage.removeItem('chat_session_state');
        }
      }
    };

    restoreSession();
  }, []);

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const actions: ChatSessionActions = useMemo(() => ({
    startSession: (sessionData: ChatSessionData) => {
      dispatch({ type: 'START_SESSION', payload: sessionData });
    },

    pauseSession: async () => {
      if (!state.conversationId) return;

      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Check if session is actually active before trying to pause
        const statusResponse = await apiService.getSessionStatus(state.conversationId);
        if (statusResponse.success && statusResponse.session_status === 'active') {
          const response = await apiService.pauseChatSession(state.conversationId);
          if (response.success) {
            dispatch({ 
              type: 'PAUSE_SESSION', 
              payload: { pausedTime: Date.now() } 
            });
            console.log('✅ Session paused successfully');
          } else {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to pause session' });
          }
        } else {
          console.log('ℹ️ Session is not active, skipping pause API call');
          dispatch({ 
            type: 'PAUSE_SESSION', 
            payload: { pausedTime: Date.now() } 
          }); // Update UI state anyway
        }
      } catch (error) {
        console.error('❌ Failed to pause session:', error);
        // If status check fails, still update UI state for better UX
        dispatch({ 
          type: 'PAUSE_SESSION', 
          payload: { pausedTime: Date.now() } 
        });
      }
    },

    resumeSession: async () => {
      if (!state.conversationId) return;
      
      // Prevent multiple simultaneous resume calls
      if (state.isLoading) {
        console.log('🔄 Resume already in progress, skipping...');
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Check if session is actually paused before trying to resume
        const statusResponse = await apiService.getSessionStatus(state.conversationId);
        if (statusResponse.success && statusResponse.session_status === 'paused') {
          const response = await apiService.resumeChatSession(state.conversationId);
          if (response.success) {
            dispatch({ type: 'RESUME_SESSION' });
            console.log('✅ Session resumed successfully');
          } else {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to resume session' });
          }
        } else {
          console.log('ℹ️ Session is not paused, updating UI state anyway');
          dispatch({ type: 'RESUME_SESSION' }); // Update UI state anyway
        }
      } catch (error) {
        console.error('❌ Failed to resume session:', error);
        // If status check fails, still update UI state for better UX
        dispatch({ type: 'RESUME_SESSION' });
      }
    },

    endSession: async () => {
      if (!state.conversationId) return;

      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Use the tracked session duration for accurate billing
        const sessionDuration = state.sessionDuration || 0;

        const response = await apiService.endChatSession(state.conversationId, sessionDuration);
        if (response.success) {
          dispatch({ type: 'END_SESSION' });
          await AsyncStorage.removeItem('chat_session_state');
          console.log('✅ Session ended successfully');
        } else {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to end session' });
        }
      } catch (error) {
        console.error('❌ Failed to end session:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to end session' });
      }
    },

    hideSession: () => {
      dispatch({ type: 'HIDE_SESSION' });
    },

    showSession: () => {
      dispatch({ type: 'SHOW_SESSION' });
    },

    updateSessionData: (updates: Partial<ChatSessionData>) => {
      dispatch({ type: 'UPDATE_SESSION_DATA', payload: updates });
    },

    updateSessionDuration: (duration: number) => {
      dispatch({ type: 'UPDATE_SESSION_DURATION', payload: duration });
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },
  }), [state.conversationId, state.sessionDuration]); // Memoize with dependencies

  return (
    <ChatSessionContext.Provider value={{ state, actions }}>
      {children}
    </ChatSessionContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useChatSession() {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error('useChatSession must be used within a ChatSessionProvider');
  }
  return context;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatSessionDuration(startTime: number, pausedTime?: number, totalPausedDuration: number = 0): string {
  const now = Date.now();
  const currentTime = pausedTime || now;
  const totalDuration = Math.floor((currentTime - startTime) / 1000) - totalPausedDuration;
  
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const seconds = totalDuration % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export function calculateSessionDuration(startTime: number, pausedTime?: number, totalPausedDuration: number = 0): number {
  const now = Date.now();
  const currentTime = pausedTime || now;
  return Math.floor((currentTime - startTime) / 1000) - totalPausedDuration;
}
