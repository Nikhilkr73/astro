/**
 * Splash Screen
 * 
 * Initial loading screen shown when app launches.
 * Displays app logo and loading animation.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface SplashScreenProps {
  onFinish?: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const bounce1 = React.useRef(new Animated.Value(0)).current;
  const bounce2 = React.useRef(new Animated.Value(0)).current;
  const bounce3 = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate loading dots
    const createBounceAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: -10,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.parallel([
      createBounceAnimation(bounce1, 0),
      createBounceAnimation(bounce2, 100),
      createBounceAnimation(bounce3, 200),
    ]);

    animation.start();

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 3000);

    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <LinearGradient
      colors={[colors.accent, colors.background]}
      style={styles.container}
    >
      {/* Logo and Brand */}
      <View style={styles.content}>
        <View style={[styles.logoContainer, shadows.primary]}>
          <Icon name="star" size={40} color={colors.primaryForeground} />
        </View>
        
        <Text style={styles.title}>Kundli</Text>
        
        <Text style={styles.tagline}>Your Stars. Your Guidance.</Text>
        
        {/* Loading Animation */}
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { transform: [{ translateY: bounce1 }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: bounce2 }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: bounce3 }] }]} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  
  content: {
    alignItems: 'center',
  },
  
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  
  title: {
    fontSize: typography.fontSize['5xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.secondary,
    marginBottom: spacing.base,
  },
  
  tagline: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing['5xl'],
    maxWidth: 300,
  },
  
  dotsContainer: {
    flexDirection: 'row',
  },
  
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xs,
  },
});

