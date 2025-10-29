import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import apiService from '../services/apiService';
import storage from '../utils/storage';
import { useChatSession } from '../contexts/ChatSessionContext';

type ChatReviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatReview'>;
type ChatReviewScreenRouteProp = RouteProp<RootStackParamList, 'ChatReview'>;

const ChatReviewScreen = () => {
  const navigation = useNavigation<ChatReviewScreenNavigationProp>();
  const route = useRoute<ChatReviewScreenRouteProp>();
  const { astrologer, sessionDuration, conversationId } = route.params;
  
  // Import session actions from context to clear session after review
  const { actions: sessionActions } = useChatSession();
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get user ID
      const userId = await storage.getUserId();
      if (!userId) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }
      
      // Submit review to API
      console.log('📝 Submitting review...');
      const response = await apiService.submitReview({
        user_id: userId,
        astrologer_id: astrologer.id.toString(),
        conversation_id: conversationId,
        rating: rating,
        review_text: review || undefined,
        session_duration: sessionDuration,
      });
      
      if (response.success) {
        console.log('✅ Review submitted:', response.review_id);
        
        // CRITICAL: Clear session context BEFORE navigating
        // This prevents PersistentChatBar from showing after chat ends
        await sessionActions.endSession();
        
        // Show thank you modal
        setShowThankYou(true);
      }
    } catch (error: any) {
      console.error('❌ Failed to submit review:', error);
      Alert.alert(
        'Submission Failed',
        error.response?.data?.detail || 'Failed to submit review. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipReview = async () => {
    try {
      // Clear session context BEFORE navigating (same as submit review)
      await sessionActions.endSession();
      
      // Navigate to ended chat session (same as submit review)
      const navParams = {
        astrologer,
        astrologerId: astrologer.id.toString(),
        conversationId: conversationId, // Pass conversationId for loading messages
        sessionEnded: true, // Flag to indicate session has ended
      };
      navigation.navigate('ChatSession', navParams);
    } catch (error) {
      console.error('❌ Failed to skip and navigate:', error);
      // Fallback to Main screen if there's an error
      navigation.navigate('Main');
    }
  };

  const handleThankYouClose = () => {
    setShowThankYou(false);
    // Navigate back to ChatSession with ended flag to show continue widget
    const navParams = {
      astrologer,
      astrologerId: astrologer.id.toString(),
      conversationId: conversationId, // CRITICAL: Pass conversationId for loading messages
      sessionEnded: true, // Flag to indicate session has ended
    };
    navigation.navigate('ChatSession', navParams);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={styles.starButton}
            onPress={() => handleRatingPress(star)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.star,
              star <= rating ? styles.starFilled : styles.starEmpty
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rate Your Experience</Text>
          <Text style={styles.subtitle}>How was your consultation with {astrologer.name}?</Text>
        </View>

        {/* Astrologer Info */}
        <View style={styles.astrologerInfo}>
          <Image 
            source={{ uri: astrologer.image }}
            style={styles.profileImage}
          />
          <View style={styles.astrologerDetails}>
            <Text style={styles.astrologerName}>{astrologer.name}</Text>
            <Text style={styles.astrologerCategory}>{astrologer.category}</Text>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionDuration}>Session Duration: {sessionDuration}</Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate Your Experience</Text>
          <Text style={styles.ratingSubtitle}>Tap a star to rate</Text>
          {renderStars()}
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>
          )}
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Write a Review (Optional)</Text>
          <TouchableOpacity style={styles.reviewInput}>
            <Text style={styles.reviewPlaceholder}>
              Share your experience with other users...
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkipReview}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (rating === 0 || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitReview}
            disabled={rating === 0 || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={[
                styles.submitButtonText,
                rating === 0 && styles.submitButtonTextDisabled
              ]}>
                Submit Review
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Thank You Modal */}
      <Modal
        visible={showThankYou}
        transparent={true}
        animationType="fade"
        onRequestClose={handleThankYouClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.thankYouModal}>
            <Text style={styles.thankYouIcon}>🎉</Text>
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouText}>
              Your review has been submitted successfully. It helps other users make better choices.
            </Text>
            <TouchableOpacity 
              style={styles.thankYouButton}
              onPress={handleThankYouClose}
              activeOpacity={0.8}
            >
              <Text style={styles.thankYouButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0', // Main Background from design system
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E2E2E', // Primary Text from design system
    marginBottom: 8,
    fontFamily: 'Poppins_500Medium',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280', // Secondary Text from design system
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  astrologerInfo: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // Card Background from design system
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#F7931E', // Orange shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFE4B5', // Border Gold from design system
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  astrologerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  astrologerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E', // Primary Text from design system
    marginBottom: 4,
    fontFamily: 'Poppins_500Medium',
  },
  astrologerCategory: {
    fontSize: 14,
    color: '#6B7280', // Secondary Text from design system
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDuration: {
    fontSize: 12,
    color: '#9CA3AF', // Tertiary Text from design system
    fontFamily: 'Poppins_400Regular',
  },
  ratingSection: {
    backgroundColor: '#FFFFFF', // Card Background from design system
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#F7931E', // Orange shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFE4B5', // Border Gold from design system
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E', // Primary Text from design system
    marginBottom: 4,
    fontFamily: 'Poppins_500Medium',
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#6B7280', // Secondary Text from design system
    marginBottom: 20,
    fontFamily: 'Poppins_400Regular',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    marginHorizontal: 8,
  },
  star: {
    fontSize: 32,
    color: '#F7931E', // Primary Orange from design system
  },
  starFilled: {
    opacity: 1,
    color: '#F7931E', // Primary Orange from design system
  },
  starEmpty: {
    opacity: 0.3,
    color: '#FFE4B5', // Border Gold from design system
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F7931E', // Primary Orange from design system
    fontFamily: 'Poppins_500Medium',
  },
  reviewSection: {
    backgroundColor: '#FFFFFF', // Card Background from design system
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#F7931E', // Orange shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFE4B5', // Border Gold from design system
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E2E2E', // Primary Text from design system
    marginBottom: 12,
    fontFamily: 'Poppins_500Medium',
  },
  reviewInput: {
    borderWidth: 2,
    borderColor: '#FFE4B5', // Border Gold from design system
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    backgroundColor: '#FFF8F0', // Main Background from design system
  },
  reviewPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF', // Tertiary Text from design system
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFE4B5', // Border Gold from design system
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280', // Secondary Text from design system
    fontFamily: 'Poppins_500Medium',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#F7931E', // Primary Orange from design system
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#F7931E', // Orange shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB', // Light gray for disabled state
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF', // Tertiary Text from design system
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  thankYouModal: {
    backgroundColor: '#FFFFFF', // Card Background from design system
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
    shadowColor: '#F7931E', // Orange shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  thankYouIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E2E2E', // Primary Text from design system
    marginBottom: 12,
    fontFamily: 'Poppins_500Medium',
  },
  thankYouText: {
    fontSize: 14,
    color: '#6B7280', // Secondary Text from design system
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'Poppins_400Regular',
  },
  thankYouButton: {
    backgroundColor: '#F7931E', // Primary Orange from design system
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    shadowColor: '#F7931E', // Orange shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  thankYouButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
  },
});

export default ChatReviewScreen;

