/**
 * Rating Popup Component
 * 
 * Modal for rating astrologer after session ends.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Button, Avatar } from './ui';
import { Astrologer } from '../data/astrologers';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  astrologer: Astrologer;
  sessionType: 'chat' | 'call';
  sessionDuration: string;
  onSubmitRating: (rating: number, feedback: string) => void;
}

export function RatingPopup({
  isOpen,
  onClose,
  astrologer,
  sessionType,
  sessionDuration,
  onSubmitRating
}: RatingPopupProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmitRating(rating, feedback);
      setRating(0);
      setFeedback('');
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, shadows.lg]}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="x" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Avatar source={{ uri: astrologer.image }} size="lg" border />
            <Text style={styles.astrologerName}>{astrologer.name}</Text>
            <Text style={styles.sessionInfo}>
              {sessionType === 'chat' ? 'Chat' : 'Call'} • {sessionDuration}
            </Text>
          </View>

          {/* Rating Stars */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>How was your experience?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="star"
                    size={36}
                    color={star <= rating ? colors.yellow : colors.border}
                    style={star <= rating && styles.starFilled}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Feedback */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackLabel}>Share your feedback (Optional)</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell us about your experience..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            disabled={rating === 0}
            fullWidth
            style={styles.submitButton}
          >
            Submit Rating
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  
  content: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing.xl,
    paddingBottom: spacing['2xl']
  },
  
  closeButton: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  
  astrologerName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginTop: spacing.md,
    marginBottom: spacing.xs
  },
  
  sessionInfo: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  ratingSection: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  
  ratingLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    marginBottom: spacing.base
  },
  
  starsContainer: {
    flexDirection: 'row'
  },
  
  starButton: {
    padding: spacing.xs
  },
  
  starFilled: {
    shadowColor: colors.yellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  
  feedbackSection: {
    marginBottom: spacing.xl
  },
  
  feedbackLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    marginBottom: spacing.sm
  },
  
  feedbackInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.foreground,
    minHeight: 100
  },
  
  submitButton: {
    marginTop: spacing.base
  }
});


