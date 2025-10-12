import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import apiService from '../services/apiService';
import storage from '../utils/storage';

interface OnboardingFormScreenProps {
  onComplete: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil',
  'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
];

const {width} = Dimensions.get('window');

export function OnboardingFormScreen({onComplete}: OnboardingFormScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [birthDate, setBirthDate] = useState(1);
  const [birthMonth, setBirthMonth] = useState(0); // January
  const [birthYear, setBirthYear] = useState(2000);
  const [knowsTime, setKnowsTime] = useState<boolean | null>(null);
  const [birthHour, setBirthHour] = useState(12);
  const [birthMinute, setBirthMinute] = useState(0);
  const [birthPeriod, setBirthPeriod] = useState<'AM' | 'PM'>('PM');
  const [gender, setGender] = useState<'Male' | 'Female' | null>(null);
  const [birthPlace, setBirthPlace] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 6;

  const handleNameChange = (text: string) => {
    setName(text);

    // Validate name: only letters and spaces, minimum 3 characters
    if (text.length === 0) {
      setNameError('');
    } else if (text.length < 3) {
      setNameError('Name must be at least 3 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(text)) {
      setNameError('Wrong name');
    } else {
      setNameError('');
    }
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(l => l !== language);
      } else {
        return [...prev, language];
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return name.length >= 3 && /^[a-zA-Z\s]+$/.test(name);
      case 2:
        return true; // Date is always valid
      case 3:
        if (knowsTime === null) return false;
        if (knowsTime === false) return true;
        return true; // Time is always valid if they know it
      case 4:
        return gender !== null;
      case 5:
        return birthPlace.trim().length > 0;
      case 6:
        return selectedLanguages.length > 0;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (canProceed()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        // Submit data to backend
        await submitUserData();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitUserData = async () => {
    try {
      setIsSubmitting(true);
      
      // Format date as DD/MM/YYYY
      const dateOfBirth = `${birthDate.toString().padStart(2, '0')}/${(birthMonth + 1).toString().padStart(2, '0')}/${birthYear}`;
      
      // Format time as HH:MM AM/PM
      const timeOfBirth = knowsTime 
        ? `${birthHour.toString().padStart(2, '0')}:${birthMinute.toString().padStart(2, '0')} ${birthPeriod}`
        : '12:00 PM'; // Default time if unknown
      
      // Get phone number from storage (from PhoneAuthScreen)
      const phoneNumber = await storage.getUserId() || '+919999999999'; // Fallback for testing
      
      console.log('📝 Submitting user data:', {
        phone_number: phoneNumber,
        full_name: name,
        date_of_birth: dateOfBirth,
        time_of_birth: timeOfBirth,
        place_of_birth: birthPlace,
        gender: gender || undefined,
      });
      
      // Call registration API
      const response = await apiService.registerUser({
        phone_number: phoneNumber,
        full_name: name,
        date_of_birth: dateOfBirth,
        time_of_birth: timeOfBirth,
        place_of_birth: birthPlace,
        gender: gender || undefined,
      });
      
      if (response.success) {
        console.log('✅ User registered:', response.user_id);
        console.log('💰 Welcome bonus:', response.wallet.balance);
        
        // Save user data to AsyncStorage
        await storage.saveUserId(response.user_id);
        await storage.saveUserData(response.user);
        await storage.setOnboarded(true);
        await storage.saveWalletBalance(response.wallet.balance);
        
        // Show completion screen
        setShowCompletion(true);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.detail || error.message || 'Failed to create profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (showCompletion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContainer}>
          <View style={styles.completionIcon}>
            <Text style={styles.completionIconText}>✅</Text>
          </View>

          <View style={styles.completionTextContainer}>
            <Text style={styles.completionTitle}>Profile Completed!</Text>
            <Text style={styles.completionSubtitle}>
              Great! Your profile is all set. You can now connect with expert astrologers.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleComplete}>
            <Text style={styles.getStartedButtonText}>Get Started ✨</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>{currentStep} of {totalSteps}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: `${(currentStep / totalSteps) * 100}%`}]} />
          </View>
        </View>

        {/* Step Content */}
        <View style={styles.stepContent}>
          {currentStep === 1 && (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>What's your name?</Text>
              <Text style={styles.stepSubtitle}>
                We'll use this to personalize your experience
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={handleNameChange}
                  autoFocus
                />
                {nameError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {nameError}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>When were you born?</Text>
              <Text style={styles.stepSubtitle}>
                Your date of birth for accurate kundli
              </Text>

              <DatePicker
                date={birthDate}
                month={birthMonth}
                year={birthYear}
                onDateChange={setBirthDate}
                onMonthChange={setBirthMonth}
                onYearChange={setBirthYear}
              />

              <View style={styles.selectedDateContainer}>
                <Text style={styles.selectedDateLabel}>Selected Date</Text>
                <Text style={styles.selectedDateText}>
                  {birthDate} {MONTHS[birthMonth]} {birthYear}
                </Text>
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>Do you remember your time of birth?</Text>
              <Text style={styles.stepSubtitle}>
                Time of birth is important for accurate predictions
              </Text>

              {knowsTime === null ? (
                <View style={styles.timeChoiceContainer}>
                  <TouchableOpacity
                    style={styles.timeChoiceButton}
                    onPress={() => setKnowsTime(true)}>
                    <Text style={styles.timeChoiceButtonText}>Yes, I know</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeChoiceButton}
                    onPress={() => setKnowsTime(false)}>
                    <Text style={styles.timeChoiceButtonText}>No, I don't</Text>
                  </TouchableOpacity>
                </View>
              ) : knowsTime ? (
                <View style={styles.timePickerContainer}>
                  <Text style={styles.pickerLabel}>Select your time of birth</Text>
                  <TimePicker
                    hour={birthHour}
                    minute={birthMinute}
                    period={birthPeriod}
                    onHourChange={setBirthHour}
                    onMinuteChange={setBirthMinute}
                    onPeriodChange={setBirthPeriod}
                  />
                  
                  <View style={styles.selectedTimeContainer}>
                    <Text style={styles.selectedTimeLabel}>Selected Time</Text>
                    <Text style={styles.selectedTimeText}>
                      {birthHour.toString().padStart(2, '0')}:{birthMinute.toString().padStart(2, '0')} {birthPeriod}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.dontRememberButton}
                    onPress={() => setKnowsTime(null)}>
                    <Text style={styles.dontRememberButtonText}>I don't remember</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.noTimeContainer}>
                  <Text style={styles.noTimeText}>
                    That's okay! We'll proceed without the time of birth.
                  </Text>
                </View>
              )}
            </View>
          )}

          {currentStep === 4 && (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>What's your gender?</Text>
              <Text style={styles.stepSubtitle}>
                This helps us provide personalized astrological insights
              </Text>

              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'Male' && styles.genderButtonSelected,
                  ]}
                  onPress={() => setGender('Male')}>
                  <View style={[
                    styles.genderIconContainer,
                    gender === 'Male' && styles.genderIconContainerSelected,
                  ]}>
                    <Text style={styles.genderIcon}>👨</Text>
                  </View>
                  <Text style={[
                    styles.genderText,
                    gender === 'Male' && styles.genderTextSelected,
                  ]}>Male</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'Female' && styles.genderButtonSelected,
                  ]}
                  onPress={() => setGender('Female')}>
                  <View style={[
                    styles.genderIconContainer,
                    gender === 'Female' && styles.genderIconContainerSelected,
                  ]}>
                    <Text style={styles.genderIcon}>👩</Text>
                  </View>
                  <Text style={[
                    styles.genderText,
                    gender === 'Female' && styles.genderTextSelected,
                  ]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentStep === 5 && (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>Where were you born?</Text>
              <Text style={styles.stepSubtitle}>
                Your birth place helps us calculate planetary positions
              </Text>

              <TextInput
                style={styles.textInput}
                placeholder="City, State, Country"
                value={birthPlace}
                onChangeText={setBirthPlace}
                autoFocus
              />
            </View>
          )}

          {currentStep === 6 && (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>Preferred Languages</Text>
              <Text style={styles.stepSubtitle}>
                Select languages you're comfortable with
              </Text>

              <View style={styles.languagesContainer}>
                {LANGUAGES.map((language) => (
                  <TouchableOpacity
                    key={language}
                    style={[
                      styles.languageButton,
                      selectedLanguages.includes(language) && styles.languageButtonSelected,
                    ]}
                    onPress={() => handleLanguageToggle(language)}>
                    <Text style={[
                      styles.languageButtonText,
                      selectedLanguages.includes(language) && styles.languageButtonTextSelected,
                    ]}>
                      {language}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedLanguages.length > 0 && (
                <Text style={styles.languageCountText}>
                  {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''} selected
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!canProceed() || isSubmitting) && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!canProceed() || isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.continueButtonText}>
              {currentStep === totalSteps ? 'Complete Profile' : 'Continue'} →
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Date Picker Component
function DatePicker({ 
  date, 
  month, 
  year, 
  onDateChange, 
  onMonthChange, 
  onYearChange 
}: {
  date: number;
  month: number;
  year: number;
  onDateChange: (date: number) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}) {
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => 2024 - i);

  return (
    <View style={styles.datePickerContainer}>
      {/* Date Picker */}
      <View style={styles.pickerColumn}>
        <Text style={styles.pickerLabel}>Date</Text>
        <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
          {dates.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.pickerItem,
                d === date && styles.pickerItemSelected,
              ]}
              onPress={() => onDateChange(d)}>
              <Text style={[
                styles.pickerItemText,
                d === date && styles.pickerItemTextSelected,
              ]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Month Picker */}
      <View style={styles.pickerColumn}>
        <Text style={styles.pickerLabel}>Month</Text>
        <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
          {MONTHS.map((m, idx) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.pickerItem,
                idx === month && styles.pickerItemSelected,
              ]}
              onPress={() => onMonthChange(idx)}>
              <Text style={[
                styles.pickerItemText,
                idx === month && styles.pickerItemTextSelected,
              ]}>{m.slice(0, 3)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Year Picker */}
      <View style={styles.pickerColumn}>
        <Text style={styles.pickerLabel}>Year</Text>
        <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
          {years.map((y) => (
            <TouchableOpacity
              key={y}
              style={[
                styles.pickerItem,
                y === year && styles.pickerItemSelected,
              ]}
              onPress={() => onYearChange(y)}>
              <Text style={[
                styles.pickerItemText,
                y === year && styles.pickerItemTextSelected,
              ]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// Time Picker Component
function TimePicker({
  hour,
  minute,
  period,
  onHourChange,
  onMinuteChange,
  onPeriodChange
}: {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onPeriodChange: (period: 'AM' | 'PM') => void;
}) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15, etc.

  return (
    <View style={styles.timePickerMainContainer}>
      <View style={styles.timePickerRow}>
        {/* Hour Picker */}
        <View style={styles.timePickerColumn}>
          <Text style={styles.pickerLabel}>Hour</Text>
          <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
            {hours.map((h) => (
              <TouchableOpacity
                key={h}
                style={[
                  styles.pickerItem,
                  h === hour && styles.pickerItemSelected,
                ]}
                onPress={() => onHourChange(h)}>
                <Text style={[
                  styles.pickerItemText,
                  h === hour && styles.pickerItemTextSelected,
                ]}>{h.toString().padStart(2, '0')}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Minute Picker */}
        <View style={styles.timePickerColumn}>
          <Text style={styles.pickerLabel}>Minute</Text>
          <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
            {minutes.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.pickerItem,
                  m === minute && styles.pickerItemSelected,
                ]}
                onPress={() => onMinuteChange(m)}>
                <Text style={[
                  styles.pickerItemText,
                  m === minute && styles.pickerItemTextSelected,
                ]}>{m.toString().padStart(2, '0')}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AM/PM Buttons */}
        <View style={styles.timePickerColumn}>
          <Text style={styles.pickerLabel}>Period</Text>
          <View style={styles.periodButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === 'AM' && styles.periodButtonSelected,
              ]}
              onPress={() => onPeriodChange('AM')}>
              <Text style={[
                styles.periodButtonText,
                period === 'AM' && styles.periodButtonTextSelected,
              ]}>AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === 'PM' && styles.periodButtonSelected,
              ]}
              onPress={() => onPeriodChange('PM')}>
              <Text style={[
                styles.periodButtonText,
                period === 'PM' && styles.periodButtonTextSelected,
              ]}>PM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  stepIndicator: {
    flex: 1,
    alignItems: 'flex-end',
  },
  stepText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  step: {
    gap: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  inputContainer: {
    gap: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  pickerColumn: {
    flex: 1,
    maxWidth: 100,
  },
  pickerLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  picker: {
    height: 192,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  pickerItem: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#f3f4f6',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#6b7280',
  },
  pickerItemTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  selectedDateContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedDateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  selectedDateText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
  timeChoiceContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  timeChoiceButton: {
    flex: 1,
    height: 96,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  timeChoiceButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedTimeContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedTimeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  selectedTimeText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
  dontRememberButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dontRememberButtonText: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
  noTimeContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noTimeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  periodContainer: {
    flexDirection: 'column',
    gap: 12,
    paddingTop: 28,
  },
  periodButton: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  periodButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
  },
  periodButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  periodButtonTextSelected: {
    color: 'white',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  genderButton: {
    flex: 1,
    height: 128,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'white',
  },
  genderButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  genderIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderIconContainerSelected: {
    backgroundColor: '#e0e7ff',
  },
  genderIcon: {
    fontSize: 32,
  },
  genderText: {
    fontSize: 16,
    color: '#000000',
  },
  genderTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: 'white',
    minWidth: (width - 72) / 2,
    alignItems: 'center',
  },
  languageButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  languageButtonTextSelected: {
    color: 'white',
  },
  languageCountText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
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
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completionIcon: {
    width: 96,
    height: 96,
    backgroundColor: '#10b981',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completionIconText: {
    fontSize: 48,
    color: 'white',
  },
  completionTextContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  getStartedButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    width: '100%',
    maxWidth: 320,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // New time picker styles
  timePickerMainContainer: {
    alignItems: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  timePickerColumn: {
    flex: 1,
    maxWidth: 80,
    alignItems: 'center',
  },
  timePicker: {
    height: 150,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: 'white',
    width: '100%',
  },
  periodButtonsContainer: {
    gap: 8,
    marginTop: 8,
  },
});
