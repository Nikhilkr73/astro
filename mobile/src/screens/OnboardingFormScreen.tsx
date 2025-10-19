import React, {useState, useEffect, useRef} from 'react';
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
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import apiService from '../services/apiService';
import storage from '../utils/storage';
import {colors, typography, spacing, borderRadius, shadows, touchableOpacity} from '../constants/theme';

// Geoapify API key for location autocomplete (client-side usage is acceptable for geocoding APIs)
const GEOAPIFY_API_KEY = '5a3a573b36774482b168c56af6be0581';

interface OnboardingFormScreenProps {
  onComplete: () => void;
  onNavigate?: (screen: string) => void;
  userId?: string;
  isEditMode?: boolean;
}

interface LocationSuggestion {
  city: string;
  state: string;
  country: string;
  formatted: string;
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

export function OnboardingFormScreen({onComplete, onNavigate, userId, isEditMode = false}: OnboardingFormScreenProps) {
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
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  
  // Location autocomplete states
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = 6;

  // Load user data when in edit mode
  useEffect(() => {
    if (isEditMode && userId) {
      loadUserData();
    }
  }, [isEditMode, userId]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoadingUserData(true);
      console.log('📱 Loading user data for edit mode:', userId);
      
      const userData = await apiService.getUserProfile(userId!);
      console.log('📋 User data loaded:', userData);
      
      // Pre-fill form with existing data
      if (userData.full_name) {
        setName(userData.full_name);
      }
      
      if (userData.birth_date) {
        // Parse birth_date (DD/MM/YYYY format)
        const [day, month, year] = userData.birth_date.split('/');
        setBirthDate(parseInt(day));
        setBirthMonth(parseInt(month) - 1); // Convert to 0-based index
        setBirthYear(parseInt(year));
      }
      
      if (userData.birth_time) {
        // Parse birth_time (HH:MM AM/PM format)
        const [time, period] = userData.birth_time.split(' ');
        const [hour, minute] = time.split(':');
        setBirthHour(parseInt(hour));
        setBirthMinute(parseInt(minute));
        setBirthPeriod(period as 'AM' | 'PM');
        setKnowsTime(true);
      }
      
      if (userData.gender) {
        setGender(userData.gender as 'Male' | 'Female');
      }
      
      if (userData.birth_location) {
        setBirthPlace(userData.birth_location);
      }
      
      if (userData.language_preference) {
        // Convert language preference to array
        const languages = userData.language_preference.split(',').map((lang: string) => lang.trim());
        setSelectedLanguages(languages);
      }
      
      console.log('✅ User data pre-filled successfully');
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
    } finally {
      setIsLoadingUserData(false);
    }
  };

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

  // Location autocomplete functions
  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoadingLocations(true);
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location suggestions');
      }
      
      const data = await response.json();
      
      if (data.features && Array.isArray(data.features)) {
        const suggestions: LocationSuggestion[] = data.features.map((feature: any) => {
          const props = feature.properties || {};
          const city = props.city || '';
          const state = props.state || '';
          const country = props.country || '';
          
          return {
            city,
            state,
            country,
            formatted: `${city}${state ? `, ${state}` : ''}${country ? `, ${country}` : ''}`.trim()
          };
        }).filter((suggestion: LocationSuggestion) => suggestion.formatted.length > 0);
        
        setLocationSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.warn('Location autocomplete error:', error);
      // Silent fail - allow manual input
      setLocationSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleLocationInputChange = (text: string) => {
    setBirthPlace(text);
    
    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Set new timeout for debounced API call
    debounceTimeout.current = setTimeout(() => {
      fetchLocationSuggestions(text);
    }, 300);
  };

  const handleLocationSuggestionSelect = (suggestion: LocationSuggestion) => {
    setBirthPlace(suggestion.formatted);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleLocationInputFocus = () => {
    if (locationSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleLocationInputBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
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
      
      const userData = {
        full_name: name,
        date_of_birth: dateOfBirth,  // Changed from birth_date
        time_of_birth: timeOfBirth,  // Changed from birth_time
        place_of_birth: birthPlace,  // Changed from birth_location
        gender: gender || undefined,
        language_preference: selectedLanguages.join(', '),
      };
      
      console.log('📝 Submitting user data:', userData);
      
      let response;
      if (isEditMode && userId) {
        // Update existing user
        console.log('🔄 Updating user profile for:', userId);
        response = await apiService.updateUserProfile(userId, userData);
      } else {
        // Create new user
        const userDataFromStorage = await storage.getUserData();
        console.log('🔍 DEBUG: Retrieved user data from storage:');
        console.log('  userDataFromStorage:', userDataFromStorage);
        console.log('  phoneNumber:', userDataFromStorage?.phoneNumber);
        
        const phoneNumber = userDataFromStorage?.phoneNumber || '+919999999999'; // Fallback for testing
        const userId = userDataFromStorage?.userId; // Get user ID from OTP verification
        console.log('👤 Creating new user with phone:', phoneNumber);
        console.log('👤 Using existing user ID:', userId);
        
        // CRITICAL: Must pass user_id from OTP verification to prevent duplicate user creation
        // The backend expects user_id to link registration with existing OTP-verified user
        response = await apiService.registerUser({
          user_id: userId, // CRITICAL: This prevents duplicate user creation
          phone_number: phoneNumber,
          ...userData,
        });
      }
      
      if (response.success || response.user_id) {
        console.log('✅ User data submitted successfully');
        
        // Update profile completion status
        await storage.setProfileComplete(true);
        
        // Show completion screen
        setShowCompletion(true);
        
        // Auto-navigate after 2 seconds
        setTimeout(() => {
          if (isEditMode) {
            // In edit mode, go back to profile screen
            onNavigate?.('profile');
          } else {
            // In create mode, complete onboarding
            onComplete();
          }
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to save user data');
      }
    } catch (error: any) {
      console.error('❌ Error submitting user data:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to save your information. Please try again.'
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
            <Text style={styles.completionTitle}>
              {isEditMode ? 'Profile Updated!' : 'Profile Completed!'}
            </Text>
            <Text style={styles.completionSubtitle}>
              {isEditMode 
                ? 'Your profile has been updated successfully.'
                : 'Great! Your profile is all set. You can now connect with expert astrologers.'
              }
            </Text>
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleComplete}
            activeOpacity={touchableOpacity}>
            <Text style={styles.getStartedButtonText}>
              {isEditMode ? 'Back to Profile' : 'Get Started ✨'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state when loading user data in edit mode
  if (isLoadingUserData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
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
              <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={touchableOpacity}>
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
                <View style={styles.timePickerWrapper}>
                  <Text style={styles.pickerLabel}>Select your time of birth</Text>
                  
                  <View style={styles.timePickerContainer}>
                    <TimePicker
                      hour={birthHour}
                      minute={birthMinute}
                      period={birthPeriod}
                      onHourChange={setBirthHour}
                      onMinuteChange={setBirthMinute}
                      onPeriodChange={setBirthPeriod}
                    />
                  </View>
                  
                  <View style={styles.timePickerBottomSection}>
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

              <View style={styles.locationInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="City, State, Country"
                  value={birthPlace}
                  onChangeText={handleLocationInputChange}
                  onFocus={handleLocationInputFocus}
                  onBlur={handleLocationInputBlur}
                  autoFocus
                />
                
                {/* Location Suggestions Dropdown */}
                {showSuggestions && (
                  <View style={styles.suggestionsContainer}>
                    {isLoadingLocations ? (
                      <View style={styles.suggestionsLoadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.suggestionsLoadingText}>Searching locations...</Text>
                      </View>
                    ) : locationSuggestions.length > 0 ? (
                      <FlatList
                        data={locationSuggestions}
                        keyExtractor={(item, index) => `${item.formatted}-${index}`}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => handleLocationSuggestionSelect(item)}
                            activeOpacity={touchableOpacity}>
                            <Text style={styles.suggestionText}>{item.formatted}</Text>
                          </TouchableOpacity>
                        )}
                        style={styles.suggestionsList}
                        showsVerticalScrollIndicator={false}
                      />
                    ) : (
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>No locations found</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
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
          disabled={!canProceed() || isSubmitting}
          activeOpacity={touchableOpacity}>
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
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
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
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
  timePickerWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  timePickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: spacing.xl,
  },
  timePickerBottomSection: {
    alignItems: 'center',
    width: '100%',
    gap: spacing.lg,
  },
  pickerColumn: {
    flex: 1,
    maxWidth: 100,
  },
  pickerLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
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
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    backgroundColor: colors.accentLight,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  selectedTimeLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  selectedTimeText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  dontRememberButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  dontRememberButtonText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
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
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    ...shadows.sm,
  },
  periodButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },
  periodButtonTextSelected: {
    color: colors.white,
    fontFamily: typography.fontFamily.medium,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.lg,
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
    paddingHorizontal: spacing.lg,
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timePickerColumn: {
    flex: 1,
    maxWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePicker: {
    height: 180,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
    width: '100%',
    ...shadows.sm,
  },
  periodButtonsContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  // Location autocomplete styles
  locationInputContainer: {
    position: 'relative',
    zIndex: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    ...shadows.md,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },
  suggestionsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  suggestionsLoadingText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  noResultsContainer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
