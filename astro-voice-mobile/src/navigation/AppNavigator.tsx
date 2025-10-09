/**
 * App Navigator
 * 
 * Main navigation structure for the app.
 * Handles authentication flow and main app navigation.
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

// Import all screens
import {
  SplashScreen,
  LoginScreen,
  OnboardingFormScreen,
  NewHomeScreen,
  AstrologerProfileScreen,
  ChatScreen,
  ChatHistoryScreen,
  ProfileScreen,
  WalletScreen,
  WalletHistoryScreen,
  TransactionStatusScreen,
} from '../screens';

import { colors } from '../config/designTokens';
import { Astrologer } from '../data/astrologers';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatHistoryTab"
        component={ChatHistoryScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletStackNavigator}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Icon name="credit-card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Home Stack (for astrologer profile navigation)
function HomeStackNavigator() {
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen">
        {(props) => (
          <NewHomeScreen
            {...props}
            onAstrologerClick={(astrologer) => {
              setSelectedAstrologer(astrologer);
              props.navigation.navigate('AstrologerProfile');
            }}
            onNavigate={(screen) => {
              if (screen === 'wallet') {
                props.navigation.navigate('WalletTab');
              }
            }}
            walletBalance={500}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AstrologerProfile">
        {(props) => (
          <AstrologerProfileScreen
            {...props}
            astrologer={selectedAstrologer!}
            onBack={() => props.navigation.goBack()}
            onStartSession={(type) => {
              if (type === 'chat') {
                props.navigation.navigate('Chat');
              }
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Chat">
        {(props) => (
          <ChatScreen
            {...props}
            astrologer={selectedAstrologer!}
            onBack={() => props.navigation.goBack()}
            onEndSession={(duration) => {
              console.log('Session ended:', duration);
              props.navigation.goBack();
            }}
            onRecharge={() => {
              props.navigation.navigate('WalletTab');
            }}
            initialBalance={500}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Wallet Stack (for history navigation)
function WalletStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletScreen">
        {(props) => (
          <WalletScreen
            {...props}
            onNavigate={(screen) => {
              if (screen === 'wallet-history') {
                props.navigation.navigate('WalletHistory');
              } else if (screen === 'payment') {
                props.navigation.navigate('TransactionStatus');
              } else if (screen === 'home') {
                props.navigation.navigate('HomeTab');
              }
            }}
            balance={500}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="WalletHistory">
        {(props) => (
          <WalletHistoryScreen
            {...props}
            onNavigate={(screen) => {
              if (screen === 'wallet') {
                props.navigation.goBack();
              }
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TransactionStatus">
        {(props) => (
          <TransactionStatusScreen
            {...props}
            status="success"
            amount={500}
            transactionId="TXN123456789"
            onNavigate={(screen) => {
              if (screen === 'home') {
                props.navigation.navigate('HomeTab');
              } else if (screen === 'wallet') {
                props.navigation.navigate('WalletScreen');
              }
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Simulate splash screen delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen name="Splash">
            {(props) => (
              <SplashScreen
                {...props}
                onFinish={() => setIsLoading(false)}
              />
            )}
          </Stack.Screen>
        ) : !isAuthenticated ? (
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen
                {...props}
                onLogin={() => {
                  setIsAuthenticated(true);
                  if (!isOnboarded) {
                    props.navigation.navigate('Onboarding');
                  }
                }}
                onSkip={() => {
                  setIsAuthenticated(true);
                  setIsOnboarded(true);
                }}
                onNavigate={(screen) => {
                  console.log('Navigate to:', screen);
                }}
              />
            )}
          </Stack.Screen>
        ) : !isOnboarded ? (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingFormScreen
                {...props}
                onComplete={(data) => {
                  console.log('Onboarding data:', data);
                  setIsOnboarded(true);
                }}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


