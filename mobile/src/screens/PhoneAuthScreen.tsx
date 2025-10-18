import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, typography, spacing, borderRadius, shadows, touchableOpacity} from '../constants/theme';

interface PhoneAuthScreenProps {
  onLogin: () => void;
  onSkip?: () => void;
  onNavigate?: (screen: string) => void;
}

export function PhoneAuthScreen({onLogin, onSkip, onNavigate}: PhoneAuthScreenProps) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
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
      // Simulate OTP sending delay
      setTimeout(() => {
        setIsSendingOtp(false);
        setStep('otp');
        setResendTimer(30); // Start 30 second timer
      }, 1500);
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      setIsVerifying(true);
      // Simulate OTP verification delay
      setTimeout(() => {
        // Check if OTP is wrong (111111 is test wrong OTP)
        if (otp === '111111') {
          setIsVerifying(false);
          setOtpError('Invalid OTP. Please try again.');
          setOtp(''); // Clear OTP input
        } else {
          setOtpError('');
          onLogin();
        }
      }, 1500);
    }
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      setResendTimer(30); // Restart timer
      setOtp(''); // Clear current OTP
      setOtpError(''); // Clear any errors
    }
  };

  const handleMobileChange = (text: string) => {
    const value = text.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (otpError) {
      setOtpError(''); // Clear error when user starts typing again
    }
  };

  if (step === 'mobile') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Logo & Branding */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>✨</Text>
            </View>
            <View style={styles.brandingText}>
              <Text style={styles.appName}>Kundli</Text>
              <Text style={styles.tagline}>Connect with expert astrologers</Text>
            </View>
          </View>

          {/* Mobile Number Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Enter mobile number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Mobile number"
                value={mobile}
                onChangeText={handleMobileChange}
                keyboardType="numeric"
                maxLength={10}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                mobile.length !== 10 && styles.disabledButton,
              ]}
              onPress={handleMobileSubmit}
              disabled={mobile.length !== 10 || isSendingOtp}
              activeOpacity={touchableOpacity}>
              {isSendingOtp ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text
                style={styles.linkText}
                onPress={() => onNavigate?.('terms')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text
                style={styles.linkText}
                onPress={() => onNavigate?.('privacy')}>
                Privacy Policy
              </Text>
            </Text>

            {/* Skip Button for Testing */}
            {onSkip && (
              <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={touchableOpacity}>
                <Text style={styles.skipButtonText}>Skip (Testing Mode)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setStep('mobile');
            setOtp('');
          }}
          activeOpacity={touchableOpacity}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* OTP Verification */}
        <View style={styles.otpSection}>
          <Text style={styles.otpTitle}>Verify OTP</Text>
          <Text style={styles.otpSubtitle}>
            Enter the 6-digit code sent to
          </Text>
          <Text style={styles.phoneNumber}>+91 {mobile}</Text>

          <View style={styles.otpInputContainer}>
            <TextInput
              style={[styles.otpInput, otpError ? styles.otpInputError : null]}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />
          </View>

          {otpError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {otpError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.verifyButton,
              otp.length !== 6 && styles.disabledButton,
            ]}
            onPress={handleOtpSubmit}
            disabled={otp.length !== 6 || isVerifying}
            activeOpacity={touchableOpacity}>
            {isVerifying ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive code?{' '}
              <Text
                style={[
                  styles.resendLink,
                  resendTimer > 0 && styles.disabledLink,
                ]}
                onPress={handleResendOtp}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 64,
    gap: spacing.lg,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: colors.primary,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.orangeLg,
  },
  logoIcon: {
    fontSize: 32,
    color: colors.white,
  },
  brandingText: {
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  tagline: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  inputSection: {
    gap: spacing['2xl'],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundCard,
  },
  countryCode: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  disabledButton: {
    backgroundColor: colors.textTertiary,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  linkText: {
    color: colors.primary,
  },
  skipButton: {
    marginTop: spacing['3xl'],
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  backButton: {
    marginBottom: spacing['2xl'],
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  otpSection: {
    gap: spacing['2xl'],
  },
  otpTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  otpSubtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  phoneNumber: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  otpInputContainer: {
    paddingVertical: spacing.sm,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    backgroundColor: colors.backgroundCard,
    letterSpacing: 4,
  },
  otpInputError: {
    borderColor: colors.error,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.error,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  resendLink: {
    color: colors.primary,
  },
  disabledLink: {
    color: colors.textTertiary,
  },
});
