/**
 * Astrologer Card Component
 * 
 * Displays astrologer information in a card format with action buttons.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Button, Badge } from './ui';
import { Astrologer } from '../data/astrologers';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface AstrologerCardProps {
  astrologer: Astrologer;
  onPress: () => void;
  onChatPress: () => void;
  onCallPress?: () => void;
}

export function AstrologerCard({ astrologer, onPress, onChatPress, onCallPress }: AstrologerCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, shadows.sm]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: astrologer.image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          
          {/* Online Status */}
          <View style={[styles.statusBadge, astrologer.isOnline ? styles.onlineBadge : styles.offlineBadge]}>
            {astrologer.isOnline && <View style={styles.statusDot} />}
            <Text style={styles.statusText}>{astrologer.isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        
        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {astrologer.name}
          </Text>
          
          <Badge variant="primary" style={styles.categoryBadge}>
            {astrologer.category}
          </Badge>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingRow}>
              <Icon name="star" size={16} color={colors.yellow} />
              <Text style={styles.ratingText}>{astrologer.rating}</Text>
            </View>
            <View style={styles.dot} />
            <Text style={styles.reviewText}>{astrologer.reviews} reviews</Text>
          </View>
          
          {/* Experience & Languages */}
          <View style={styles.detailsRow}>
            <Icon name="briefcase" size={12} color={colors.mutedForeground} />
            <Text style={styles.detailText}>{astrologer.experience}</Text>
            <View style={styles.dot} />
            <Text style={styles.detailText} numberOfLines={1}>
              {astrologer.languages.join(', ')}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          size="sm"
          onPress={onChatPress}
          style={styles.chatButton}
          textStyle={styles.buttonText}
        >
          <Icon name="message-circle" size={16} color={colors.primaryForeground} />
          <Text style={styles.buttonText}>Chat • ₹{astrologer.chatRate}/min</Text>
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onPress={onCallPress}
          disabled
          style={styles.callButton}
        >
          <Icon name="phone" size={16} color={colors.mutedForeground} />
          <Text style={styles.callButtonText}>Call • ₹{astrologer.callRate}/min</Text>
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>Soon</Text>
          </View>
        </Button>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  
  content: {
    flexDirection: 'row',
    padding: spacing.base,
  },
  
  imageContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  
  imageWrapper: {
    width: 96,
    height: 96,
    borderRadius: borderRadius['2xl'],
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.1)',
    overflow: 'hidden',
  },
  
  image: {
    width: '100%',
    height: '100%',
  },
  
  statusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  
  onlineBadge: {
    backgroundColor: colors.online,
  },
  
  offlineBadge: {
    backgroundColor: colors.offline,
  },
  
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
  },
  
  infoContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    marginLeft: spacing.md,
  },
  
  name: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    marginBottom: 4,
  },
  
  categoryBadge: {
    marginBottom: 8,
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.foreground,
    marginLeft: spacing.xs,
  },
  
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  
  reviewText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
  },
  
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  detailText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    marginLeft: spacing.xs,
  },
  
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: spacing.base,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  
  chatButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  
  buttonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primaryForeground,
  },
  
  callButton: {
    flex: 1,
    position: 'relative',
  },
  
  callButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.mutedForeground,
  },
  
  soonBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  
  soonText: {
    color: colors.warningForeground,
    fontSize: 9,
    fontFamily: typography.fontFamily.medium,
  },
});
