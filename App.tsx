import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import Navigation from './src/navigation/Navigation';
import { AuthProvider } from './src/contexts/AuthContext';
import { ColetasProvider } from './src/contexts/ColetasContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { DialogProvider } from './src/contexts/DialogContext';

const App = () => {
  const [fontsLoaded] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <ColetasProvider>
          <ToastProvider>
            <DialogProvider>
              <Navigation />
            </DialogProvider>
          </ToastProvider>
        </ColetasProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
