import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import './src/i18n'; // side-effect import — initializes i18next before anything renders
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { initAds } from './src/ads/initAds';

export default function App() {
  useEffect(() => {
    initAds().catch((error) => {
      // Ads must never prevent job search, applications, or authentication
      // from loading when a device is offline or the ad SDK is unavailable.
      console.warn('AdMob initialization failed:', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
