import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '../types';

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

  useEffect(() => {
    // Auto-navigate from splash screen after 3 seconds
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    if (!isOnboarded) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('main');
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
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  // Render based on current screen state
  if (currentScreen === 'splash') {
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
            <OnboardingFormScreen onComplete={handleOnboardingComplete} />
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
