import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import storage from '../utils/storage';
import apiService from '../services/apiService';
import { DeviceEventEmitter } from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import {PhoneAuthScreen} from '../screens/PhoneAuthScreen';
import {OnboardingFormScreen} from '../screens/OnboardingFormScreen';
import MainTabNavigator from './MainTabNavigator';
import AstrologerProfileScreen from '../screens/AstrologerProfileScreen';
import ChatSessionScreen from '../screens/ChatSessionScreen';
import VoiceCallScreen from '../screens/VoiceCallScreen';
import SimpleChatScreen from '../screens/SimpleChatScreen';
import ScrollTest from '../components/ScrollTest';
import SimpleScrollTest from '../components/SimpleScrollTest';
import MinimalScrollTest from '../components/MinimalScrollTest';
import ChatReviewScreen from '../screens/ChatReviewScreen';
import WalletScreen from '../screens/WalletScreen';
import WalletHistoryScreen from '../screens/WalletHistoryScreen';
import TransactionStatusScreen from '../screens/TransactionStatusScreen';
import WebViewScreen from '../screens/WebViewScreen';

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app state on startup
  useEffect(() => {
    initializeApp();
  }, []);

  // Listen for logout events
  useEffect(() => {
    const logoutListener = DeviceEventEmitter.addListener('user_logout', () => {
      console.log('📡 Logout event received in AppNavigator');
      handleLogout();
    });

    return () => {
      logoutListener.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Always show splash screen for 3 seconds first
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const userId = await storage.getUserId();
      const profileComplete = await storage.getProfileComplete();
      const lastVisitedScreen = await storage.getLastVisitedScreen();
      
      console.log('🚀 App initialization:', {
        userId,
        profileComplete,
        lastVisitedScreen
      });
      
      if (userId) {
        // User is logged in, check profile status
        setIsLoggedIn(true);
        
        if (profileComplete) {
          // Profile is complete, go to main app
          setIsOnboarded(true);
          
          // Navigate to last visited screen or main
          if (lastVisitedScreen && lastVisitedScreen !== 'login' && lastVisitedScreen !== 'onboarding') {
            setCurrentScreen(lastVisitedScreen);
          } else {
            setCurrentScreen('main');
          }
        } else {
          // Profile incomplete, go to onboarding
          setIsOnboarded(false);
          setCurrentScreen('onboarding');
        }
      } else {
        // No user logged in, go to login
        setCurrentScreen('login');
      }
    } catch (error) {
      console.error('❌ App initialization error:', error);
      setCurrentScreen('login');
    } finally {
      setIsInitialized(true);
    }
  };

  const handleLogin = (userData: {userId: string; profileComplete: boolean; missingFields?: string[]}) => {
    console.log('🔐 Login handler called with:', userData);
    
    setIsLoggedIn(true);
    
    if (userData.profileComplete) {
      // Profile is complete, go directly to main app
      setIsOnboarded(true);
      setCurrentScreen('main');
      storage.setLastVisitedScreen('main');
    } else {
      // Profile incomplete, go to onboarding
      setIsOnboarded(false);
      setCurrentScreen('onboarding');
      storage.setLastVisitedScreen('onboarding');
    }
  };

  const handleSkipLogin = () => {
    // For testing purposes, skip login and onboarding
    setIsLoggedIn(true);
    setIsOnboarded(true);
    setCurrentScreen('main');
  };

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    setCurrentScreen('main');
    storage.setLastVisitedScreen('main');
    storage.setProfileComplete(true);
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
    storage.setLastVisitedScreen(screen);
  };

  const handleLogout = async () => {
    try {
      await storage.clearUserData();
      setIsLoggedIn(false);
      setIsOnboarded(false);
      setCurrentScreen('login');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // Show splash screen while initializing
  if (!isInitialized || currentScreen === 'splash') {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  if (currentScreen === 'login') {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Auth">
          {() => (
            <PhoneAuthScreen
              onLogin={handleLogin}
              onSkip={handleSkipLogin}
              onNavigate={handleNavigate}
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="WebView" 
          component={WebViewScreen}
          options={{presentation: 'modal'}}
        />
      </Stack.Navigator>
    );
  }

  if (currentScreen === 'onboarding') {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Onboarding">
          {() => (
            <OnboardingFormScreen 
              onComplete={handleOnboardingComplete}
              onNavigate={handleNavigate}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  if (currentScreen === 'terms' || currentScreen === 'privacy') {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen 
          name="WebView"
          component={WebViewScreen}
          initialParams={{ type: currentScreen as 'terms' | 'privacy' }}
        />
      </Stack.Navigator>
    );
  }

  // Main app navigation (after login and onboarding)
  return (
    <Stack.Navigator 
      screenOptions={{headerShown: false}}
      initialRouteName="Main"
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen 
        name="AstrologerProfile" 
        component={AstrologerProfileScreen}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen 
        name="ChatSession" 
        component={ChatSessionScreen}
      />
      <Stack.Screen 
        name="VoiceCall" 
        component={VoiceCallScreen}
      />
      <Stack.Screen 
        name="ChatReview" 
        component={ChatReviewScreen}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="WalletHistory" component={WalletHistoryScreen} />
      <Stack.Screen name="TransactionStatus" component={TransactionStatusScreen} />
      <Stack.Screen 
        name="WebView" 
        component={WebViewScreen}
        options={{presentation: 'modal'}}
      />
    </Stack.Navigator>
  );
}
