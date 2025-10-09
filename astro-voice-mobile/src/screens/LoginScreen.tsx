/**
 * Login Screen
 * 
 * Email/Phone login with OTP verification.
 * Two-step process: Enter mobile number → Verify OTP
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Button, Input } from '../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../config/designTokens';

interface LoginScreenProps {
  onLogin: () => void;
  onSkip?: () => void;
  onNavigate?: (screen: string) => void;
}

export function LoginScreen({ onLogin, onSkip, onNavigate }: LoginScreenProps) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleMobileSubmit = () => {
    if (mobile && mobile.length === 10) {
      setIsSendingOtp(true);
      // Simulate OTP sending
      setTimeout(() => {
        setIsSendingOtp(false);
        setStep('otp');
        setResendTimer(30);
      }, 1500);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-submit when all 6 digits entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleOtpSubmit = (otpValue?: string) => {
    const otpString = otpValue || otp.join('');
    if (otpString.length === 6) {
      setIsVerifying(true);
      setTimeout(() => {
        if (otpString === '111111') {
          setIsVerifying(false);
          setOtpError('Invalid OTP. Please try again.');
          setOtp(['', '', '', '', '', '']);
        } else {
          setOtpError('');
          onLogin();
        }
      }, 1500);
    }
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
    }
  };

  if (step === 'otp') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => setStep('mobile')} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color={colors.foreground} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, shadows.primary]}>
              <Icon name="star" size={32} color={colors.primaryForeground} />
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}+91 {mobile}
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <View key={index} style={[styles.otpBox, otpError && styles.otpBoxError]}>
                <Text style={styles.otpText}>{digit}</Text>
              </View>
            ))}
          </View>

          {otpError && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color={colors.destructive} />
              <Text style={styles.errorText}>{otpError}</Text>
            </View>
          )}

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            {resendTimer > 0 ? (
              <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <Button
            onPress={() => handleOtpSubmit()}
            loading={isVerifying}
            disabled={otp.some(d => d === '')}
            fullWidth
            style={styles.button}
          >
            Verify & Continue
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo & Branding */}
        <View style={styles.brandingContainer}>
          <View style={[styles.logoContainer, shadows.primary]}>
            <Icon name="star" size={32} color={colors.primaryForeground} />
          </View>
          <View style={styles.brandingText}>
            <Text style={styles.brandTitle}>Kundli</Text>
            <Text style={styles.brandSubtitle}>Connect with expert astrologers</Text>
          </View>
        </View>

        {/* Mobile Number Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <Input
              value={mobile}
              onChangeText={(text) => setMobile(text.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              containerStyle={styles.phoneInput}
            />
          </View>

          <Button
            onPress={handleMobileSubmit}
            loading={isSendingOtp}
            disabled={mobile.length !== 10}
            fullWidth
            style={styles.button}
          >
            <Text>Continue</Text>
            <Icon name="arrow-right" size={20} color={colors.primaryForeground} />
          </Button>
        </View>

        {/* Terms & Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink} onPress={() => onNavigate?.('terms')}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.termsLink} onPress={() => onNavigate?.('privacy')}>
              Privacy Policy
            </Text>
          </Text>
        </View>

        {/* Skip Button */}
        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['5xl'],
  },
  
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  brandingText: {
    alignItems: 'flex-start',
    marginLeft: spacing.md,
  },
  
  brandTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
  },
  
  brandSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  inputSection: {
    marginBottom: spacing['4xl'],
  },
  
  label: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  
  countryCode: {
    height: 48,
    minWidth: 80,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  countryCodeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
  },
  
  phoneInput: {
    flex: 1,
    minWidth: 0, // Important: allows flex item to shrink below content size
    marginLeft: spacing.sm,
  },
  
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  
  otpBoxError: {
    borderColor: colors.destructive,
  },
  
  otpText: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.foreground,
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.destructive,
    marginLeft: spacing.sm,
  },
  
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  
  resendText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
  },
  
  resendTimer: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.mutedForeground,
  },
  
  resendLink: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  
  button: {
    marginBottom: spacing.lg,
  },
  
  termsContainer: {
    marginTop: spacing['2xl'],
  },
  
  termsText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  termsLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  
  skipButton: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  
  skipText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.mutedForeground,
  },
});
