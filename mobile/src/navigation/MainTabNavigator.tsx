import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {MainTabParamList} from '../types';
import {colors, spacing, borderRadius, shadows} from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import ChatHistoryScreen from '../screens/ChatHistoryScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingBottom: spacing.sm,
          paddingTop: spacing.sm,
          height: 80,
          ...shadows.sm,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
            tabBarLabelStyle: {
              fontSize: 12,
              fontFamily: 'Poppins_500Medium',
              marginTop: spacing.xs,
            },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size || 24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatHistoryScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="chat-outline" color={color} size={size || 24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="wallet-outline" color={color} size={size || 24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={size || 24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
