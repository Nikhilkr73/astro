import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainTabParamList} from '../types';

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
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({color}) => (
            <HomeIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatHistoryScreen}
        options={{
          tabBarIcon: ({color}) => (
            <ChatIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{
          tabBarIcon: ({color}) => (
            <WalletIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color}) => (
            <ProfileIcon color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple icon components (you can replace with react-native-vector-icons later)
const HomeIcon = ({color, size}: {color: string; size: number}) => (
  <Text style={{fontSize: size, color}}>🏠</Text>
);

const ChatIcon = ({color, size}: {color: string; size: number}) => (
  <Text style={{fontSize: size, color}}>💬</Text>
);

const WalletIcon = ({color, size}: {color: string; size: number}) => (
  <Text style={{fontSize: size, color}}>💳</Text>
);

const ProfileIcon = ({color, size}: {color: string; size: number}) => (
  <Text style={{fontSize: size, color}}>👤</Text>
);

export default MainTabNavigator;
