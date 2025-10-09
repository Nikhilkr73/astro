/**
 * Onboarding Form Screen
 * 
 * Collect user's astrological information (name, DOB, birth place, time).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components/ui';
import { colors, typography, spacing, borderRadius } from '../config/designTokens';

interface OnboardingFormScreenProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  gender: 'male' | 'female' | 'other';
}

export function OnboardingFormScreen({ onComplete }: OnboardingFormScreenProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    gender: 'male'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingData, string>>>({});

  const totalSteps = 3;

  const validateStep = () => {
    const newErrors: Partial<Record<keyof OnboardingData, string>> = {};

    if (step === 1 && !formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (step === 2) {
      if (!formData.dateOfBirth?.trim()) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
      if (!formData.timeOfBirth?.trim()) {
        newErrors.timeOfBirth = 'Time of birth is required';
      }
    }

    if (step === 3 && !formData.placeOfBirth?.trim()) {
      newErrors.placeOfBirth = 'Place of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        onComplete(formData as OnboardingData);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your name?</Text>
            <Text style={styles.stepSubtitle}>
              We'll use this to personalize your experience
            </Text>
            
            <Input
              label="Full Name"
              value={formData.name || ''}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your full name"
              error={errors.name}
              autoFocus
            />

            <View style={styles.genderSection}>
              <Text style={styles.genderLabel}>Gender</Text>
              <View style={styles.genderButtons}>
                {(['male', 'female', 'other'] as const).map((gender) => (
                  <Button
                    key={gender}
                    variant={formData.gender === gender ? 'primary' : 'outline'}
                    onPress={() => setFormData({ ...formData, gender })}
                    style={styles.genderButton}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Button>
                ))}
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Birth Details</Text>
            <Text style={styles.stepSubtitle}>
              Required for accurate astrological predictions
            </Text>
            
            <Input
              label="Date of Birth"
              value={formData.dateOfBirth || ''}
              onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
              placeholder="DD/MM/YYYY"
              error={errors.dateOfBirth}
            />

            <Input
              label="Time of Birth"
              value={formData.timeOfBirth || ''}
              onChangeText={(text) => setFormData({ ...formData, timeOfBirth: text })}
              placeholder="HH:MM AM/PM"
              error={errors.timeOfBirth}
              helperText="If you don't know the exact time, you can enter an approximate time"
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Place of Birth</Text>
            <Text style={styles.stepSubtitle}>
              This helps us calculate your birth chart accurately
            </Text>
            
            <Input
              label="City/Town"
              value={formData.placeOfBirth || ''}
              onChangeText={(text) => setFormData({ ...formData, placeOfBirth: text })}
              placeholder="Enter your birth place"
              error={errors.placeOfBirth}
              autoFocus
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress */}
          <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index < step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {renderStep()}
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttons}>
          {step > 1 && (
            <Button
              variant="outline"
              onPress={handleBack}
              style={styles.backButton}
            >
              Back
            </Button>
          )}
          <Button
            onPress={handleNext}
            style={styles.nextButton}
            fullWidth={step === 1}
          >
            {step === totalSteps ? 'Complete' : 'Next'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  
  keyboardView: {
    flex: 1
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl
  },
  
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing['2xl']
  },
  
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border
  },
  
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24
  },
  
  stepContent: {
    marginBottom: spacing.xl
  },
  
  stepTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
    marginBottom: spacing.sm
  },
  
  stepSubtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    lineHeight: 22,
    marginBottom: spacing.xl
  },
  
  genderSection: {
    marginTop: spacing.lg
  },
  
  genderLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
    marginBottom: spacing.md
  },
  
  genderButtons: {
    flexDirection: 'row'
  },
  
  genderButton: {
    flex: 1
  },
  
  buttons: {
    flexDirection: 'row',
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  
  backButton: {
    flex: 1
  },
  
  nextButton: {
    flex: 2
  }
});


