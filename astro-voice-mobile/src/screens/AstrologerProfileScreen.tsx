/**
 * Astrologer Profile Screen
 * 
 * Detailed profile view of an astrologer with reviews, expertise, and action buttons.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { Button, Badge } from '../components/ui';
import { Astrologer } from '../data/astrologers';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface AstrologerProfileScreenProps {
  astrologer: Astrologer;
  onBack: () => void;
  onStartSession: (type: 'chat' | 'call') => void;
}

export function AstrologerProfileScreen({ astrologer, onBack, onStartSession }: AstrologerProfileScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Astrologer Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, shadows.lg]}>
            <Image source={{ uri: astrologer.image }} style={styles.avatar} />
            {astrologer.isOnline && (
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
              </View>
            )}
          </View>
          
          <Text style={styles.name}>{astrologer.name}</Text>
          <Badge variant="primary" style={styles.categoryBadge}>
            {astrologer.category}
          </Badge>
          
          {/* Rating & Reviews */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color={colors.yellow} />
              <Text style={styles.statValue}>{astrologer.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Icon name="message-square" size={20} color={colors.primary} />
              <Text style={styles.statValue}>{astrologer.reviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Icon name="briefcase" size={20} color={colors.primary} />
              <Text style={styles.statValue}>{astrologer.experience}</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.tagsContainer}>
            {astrologer.languages.map((lang, index) => (
              <View key={index} style={styles.tag}>
                <Icon name="globe" size={14} color={colors.primary} />
                <Text style={styles.tagText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>

        {astrologer.specialties && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.tagsContainer}>
              {astrologer.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" style={styles.specialtyBadge}>
                  {specialty}
                </Badge>
              ))}
            </View>
          </View>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {astrologer.name} is a renowned {astrologer.category} expert with {astrologer.experience} of experience. 
            Known for accurate predictions and compassionate guidance in areas of {astrologer.specialties?.join(', ')}.
          </Text>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Rates</Text>
          <View style={styles.pricingRow}>
            <View style={styles.pricingCard}>
              <Icon name="message-circle" size={24} color={colors.primary} />
              <Text style={styles.pricingLabel}>Chat</Text>
              <Text style={styles.pricingValue}>₹{astrologer.chatRate}/min</Text>
            </View>
            <View style={styles.pricingCard}>
              <Icon name="phone" size={24} color={colors.mutedForeground} />
              <Text style={styles.pricingLabel}>Call</Text>
              <Text style={styles.pricingValue}>₹{astrologer.callRate}/min</Text>
              <Badge variant="warning" style={styles.comingSoonBadge}>
                Coming Soon
              </Badge>
            </View>
          </View>
        </View>

        {/* Spacer for buttons */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={[styles.bottomBar, shadows.lg]}>
        <Button
          onPress={() => onStartSession('chat')}
          disabled={!astrologer.isOnline}
          style={styles.chatButton}
        >
          <Icon name="message-circle" size={20} color={colors.primaryForeground} />
          <Text style={styles.buttonText}>Start Chat</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => onStartSession('call')}
          disabled
          style={styles.callButton}
        >
          <Icon name="phone" size={20} color={colors.mutedForeground} />
          <Text style={styles.callButtonText}>Call</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md
  },
  
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center'
  },
  
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground
  },
  
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl
  },
  
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.base,
    position: 'relative'
  },
  
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60
  },
  
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.online,
    borderWidth: 4,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.background
  },
  
  name: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  
  categoryBadge: {
    marginBottom: spacing.lg
  },
  
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    ...shadows.sm
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  
  statValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground
  },
  
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground
  },
  
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border
  },
  
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginBottom: spacing.md
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderRadius: borderRadius.lg
  },
  
  tagText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary
  },
  
  specialtyBadge: {
    marginBottom: spacing.xs
  },
  
  aboutText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    lineHeight: 24
  },
  
  pricingRow: {
    flexDirection: 'row'
  },
  
  pricingCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative'
  },
  
  pricingLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    marginTop: spacing.sm
  },
  
  pricingValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginTop: spacing.xs
  },
  
  comingSoonBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm
  },
  
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.base,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  
  chatButton: {
    flex: 1
  },
  
  callButton: {
    flex: 1
  },
  
  buttonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.primaryForeground
  },
  
  callButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.mutedForeground
  }
});


