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
              disabled={mobile.length !== 10 || isSendingOtp}>
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
              <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
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
          }}>
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
            disabled={otp.length !== 6 || isVerifying}>
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
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 64,
    gap: 16,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#6366f1',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 32,
    color: 'white',
  },
  brandingText: {
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  tagline: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputSection: {
    gap: 24,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#000000',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000000',
  },
  continueButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  linkText: {
    color: '#6366f1',
  },
  skipButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
  backButton: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  otpSection: {
    gap: 24,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  otpSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  phoneNumber: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  otpInputContainer: {
    paddingVertical: 8,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'white',
    letterSpacing: 4,
  },
  otpInputError: {
    borderColor: '#ef4444',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  verifyButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resendLink: {
    color: '#6366f1',
  },
  disabledLink: {
    color: '#9ca3af',
  },
});
