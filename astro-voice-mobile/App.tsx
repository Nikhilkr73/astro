import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/components/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { configureAmplify } from './src/config/aws-config';

export default function App() {
  useEffect(() => {
    configureAmplify();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
