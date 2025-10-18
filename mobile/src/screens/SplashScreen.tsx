import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {colors, typography, spacing, borderRadius, shadows} from '../constants/theme';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const {width, height} = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Auth');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>✨</Text>
        </View>
        <Text style={styles.appName}>Kundli</Text>
        <Text style={styles.tagline}>Your Astrology Companion</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Connecting you with expert astrologers</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    ...shadows.lg,
  },
  logoIcon: {
    fontSize: 48,
    color: colors.white,
  },
  appName: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default SplashScreen;
