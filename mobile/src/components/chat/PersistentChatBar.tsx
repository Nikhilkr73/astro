import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useChatSession, formatSessionDuration } from '../../contexts/ChatSessionContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { FEATURE_FLAGS } from '../../config/featureFlags';

// =============================================================================
// COMPONENT
// =============================================================================

export function PersistentChatBar() {
  const { state, actions } = useChatSession();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isResuming, setIsResuming] = useState(false);

  // Don't render if no active session or not visible
  if (!state.conversationId || !state.isVisible) {
    return null;
  }

  const handleResume = async () => {
    if (isResuming) {
      console.log('🔄 PersistentChatBar: Resume already in progress, skipping...');
      return;
    }
    
    try {
      setIsResuming(true);
      console.log('🔄 PersistentChatBar: Starting resume...');
      console.log('🔄 PersistentChatBar: Current state - isActive:', state.isActive, 'isPaused:', state.isPaused);
      
      // Always resume the session first
      await actions.resumeSession();
      console.log('🔄 PersistentChatBar: Resume completed, navigating...');
      
      // Navigate back to chat screen
      if (state.sessionType === 'chat') {
        const navigationParams = {
          astrologer: {
            id: parseInt(state.astrologerId || '999'),
            name: state.astrologerName || 'Astrologer',
            category: 'Astrology',
            rating: 4.5,
            reviews: 0,
            experience: 'Expert',
            languages: ['Hindi', 'English'],
            isOnline: true,
            image: state.astrologerImage || 'https://via.placeholder.com/50',
          },
          conversationId: state.conversationId || undefined,
        };
        
        console.log('🔄 PersistentChatBar: Navigation params:', navigationParams);
        console.log('🔄 PersistentChatBar: About to call navigation.navigate...');
        navigation.navigate('ChatSession', navigationParams);
        console.log('🔄 PersistentChatBar: navigation.navigate called successfully');
      } else if (state.sessionType === 'voice') {
        const navigationParams = {
          astrologer: {
            id: parseInt(state.astrologerId || '999'),
            name: state.astrologerName || 'Astrologer',
            category: 'Astrology',
            rating: 4.5,
            reviews: 0,
            experience: 'Expert',
            languages: ['Hindi', 'English'],
            isOnline: true,
            image: state.astrologerImage || 'https://via.placeholder.com/50',
          },
          conversationId: state.conversationId || undefined,
        };
        
        console.log('🔄 PersistentChatBar: Navigation params:', navigationParams);
        // Voice call disabled for testing - no privacy policy required
        if (FEATURE_FLAGS.VOICE_CHAT_ENABLED) {
          navigation.navigate('VoiceCall', navigationParams);
          console.log('🔄 PersistentChatBar: Navigated to VoiceCall');
        } else {
          // Fallback to chat instead
          navigation.navigate('ChatSession', navigationParams);
          console.log('🔄 PersistentChatBar: Navigated to ChatSession (voice disabled)');
        }
      }
      
      // Don't hide the session here - let the target screen handle it
      // This prevents the banner from disappearing before navigation completes
    } catch (error) {
      console.error('❌ Failed to resume session:', error);
    } finally {
      setIsResuming(false);
    }
  };

  const handleEndSession = async () => {
    try {
      console.log('🔴 PersistentChatBar: Ending session...');
      await actions.endSession();
      
      // Navigate to review screen with session details
      const astrologer = {
        id: parseInt(state.astrologerId || '999'),
        name: state.astrologerName || 'Astrologer',
        category: 'Astrology',
        rating: 4.5,
        reviews: 0,
        experience: 'Expert',
        languages: ['Hindi', 'English'],
        isOnline: true,
        image: state.astrologerImage || 'https://via.placeholder.com/50',
      };
      
      navigation.navigate('ChatReview', {
        astrologer,
        sessionDuration: formatSeconds(state.sessionDuration),
        conversationId: state.conversationId || ''
      });
      
      console.log('✅ PersistentChatBar: Session ended and navigated to review');
    } catch (error) {
      console.error('❌ Failed to end session from persistent bar:', error);
    }
  };

  // Simple function to format seconds to MM:SS
  const formatSeconds = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const sessionDuration = state.sessionDuration 
    ? formatSeconds(state.sessionDuration)
    : '00:00';

  return (
    <Animated.View style={styles.container}>
      <View style={styles.content}>
        {/* Astrologer Info */}
        <View style={styles.astrologerInfo}>
          <View style={styles.profileContainer}>
            <Image
              source={{
                uri: state.astrologerImage || 'https://via.placeholder.com/40x40/FF6B35/FFFFFF?text=A',
              }}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </View>
          
          <View style={styles.sessionDetails}>
            <Text style={styles.astrologerName} numberOfLines={1}>
              Chat with {state.astrologerName || 'Astrologer'}
            </Text>
            <View style={styles.sessionStatus}>
              <Text style={styles.sessionTimer}>{sessionDuration}</Text>
              <Text style={styles.sessionStatusText}>
                {state.isPaused ? 'Paused' : 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={handleResume}
            disabled={state.isLoading}
          >
            <Text style={styles.resumeButtonText}>
              {state.isLoading ? '...' : 'Resume'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndSession}
            disabled={state.isLoading}
          >
            <Text style={styles.endButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Position above bottom navigation (80px height)
    left: 0,
    right: 0,
    backgroundColor: '#FFF8F0', // Main Background from design system
    borderTopWidth: 1,
    borderTopColor: '#FFE4B5', // Border Gold from design system
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 12, // Reduced padding since bottom tabs handle safe area
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  astrologerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50', // Green for online
    borderWidth: 2,
    borderColor: '#FFF5F0',
  },
  sessionDetails: {
    flex: 1,
  },
  astrologerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2E2E', // Primary Text from design system
    marginBottom: 2,
    fontFamily: 'Poppins_500Medium',
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTimer: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280', // Secondary Text from design system
    marginRight: 8,
    fontFamily: 'Poppins_400Regular',
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981', // Success color from design system
    fontFamily: 'Poppins_400Regular',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#F7931E', // Primary Orange from design system
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12, // md border radius from design system
    marginRight: 8,
    shadowColor: '#F7931E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium', // Typography from design system
  },
  endButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4B5', // Light peach from theme
    borderWidth: 1,
    borderColor: '#F7931E', // Orange border
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  endButtonText: {
    color: '#F7931E', // Orange text
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersistentChatBar;
