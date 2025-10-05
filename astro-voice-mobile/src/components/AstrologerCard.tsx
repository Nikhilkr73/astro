import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Astrologer } from '../types';
import { Colors, Spacing, BorderRadius, Fonts, Shadows } from '../config/theme';

interface AstrologerCardProps {
  astrologer: Astrologer;
  onSelect: (astrologer: Astrologer) => void;
  onViewDetails: (astrologer: Astrologer) => void;
}

export default function AstrologerCard({
  astrologer,
  onSelect,
  onViewDetails
}: AstrologerCardProps) {
  
  // Placeholder image - can be replaced with actual avatar
  const getPlaceholderGradient = (gender: string) => {
    if (gender === 'Female') {
      return ['#E91E63', '#9C27B0'];
    }
    return ['#2196F3', '#1976D2'];
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={0.95}
      onPress={() => onViewDetails(astrologer)}
    >
      <View style={[styles.card, Shadows.medium]}>
        {/* Background Image / Gradient */}
        <View style={styles.imageContainer}>
          {astrologer.avatar ? (
            <ImageBackground
              source={astrologer.avatar}
              style={styles.imageBackground}
              resizeMode="cover"
            >
              {/* Overlay gradient for better text readability */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
              />
              
              {/* Language Badge */}
              <View style={styles.languageBadge}>
                <Ionicons name="language" size={12} color={Colors.textOnPrimary} />
                <Text style={styles.languageText}>{astrologer.language}</Text>
              </View>

              {/* Bottom Content on Image */}
              <View style={styles.imageContent}>
                <Text style={styles.cardName}>{astrologer.name}</Text>
                <Text style={styles.cardSpeciality} numberOfLines={1}>
                  {astrologer.category === 'Love' ? 'Vedic Love' : 
                   astrologer.category === 'Marriage' ? 'Vedic Marriage' :
                   astrologer.category}
                </Text>
              </View>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={getPlaceholderGradient(astrologer.gender)}
              style={styles.imagePlaceholder}
            >
              {/* Overlay gradient for better text readability */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
              />
              
              {/* Language Badge */}
              <View style={styles.languageBadge}>
                <Ionicons name="language" size={12} color={Colors.textOnPrimary} />
                <Text style={styles.languageText}>{astrologer.language}</Text>
              </View>

              {/* Bottom Content on Image */}
              <View style={styles.imageContent}>
                <Text style={styles.cardName}>{astrologer.name}</Text>
                <Text style={styles.cardSpeciality} numberOfLines={1}>
                  {astrologer.category === 'Love' ? 'Vedic Love' : 
                   astrologer.category === 'Marriage' ? 'Vedic Marriage' :
                   astrologer.category}
                </Text>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* Card Content */}
        <View style={styles.content}>
          {/* Rating and Reviews */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={Colors.warning} />
            <Text style={styles.rating}>
              {astrologer.rating} ({(astrologer.reviews / 1000).toFixed(1)}k+)
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {astrologer.language === 'Hindi' ? astrologer.descriptionHindi : astrologer.description}
          </Text>

          {/* Chat Now Button */}
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => onSelect(astrologer)}
            activeOpacity={0.8}
            disabled={!astrologer.availability}
          >
            <LinearGradient
              colors={Colors.gradientAccent}
              style={styles.chatButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.chatButtonText}>Chat Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  languageBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  languageText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semiBold as any,
    color: Colors.textOnPrimary,
  },
  imageContent: {
    padding: Spacing.md,
    zIndex: 1,
  },
  cardName: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.textOnPrimary,
    marginBottom: 4,
  },
  cardSpeciality: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium as any,
    color: Colors.textOnPrimary,
    opacity: 0.9,
  },
  content: {
    padding: Spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 4,
  },
  rating: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold as any,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  chatButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  chatButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold as any,
    color: Colors.textOnAccent,
    letterSpacing: 0.5,
  },
});
