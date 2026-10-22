import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation-types';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { AddLoanScreen } from '../screens/loans/AddLoanScreen';
import { LoanDetailsScreen } from '../screens/loans/LoanDetailsScreen';
import { useAuth } from '../features/auth/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, hasOnboarded, isLoading } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);

  if (isLoading || !isSplashDone) {
    return (
      <SplashScreen
        onFinish={() => {
          setIsSplashDone(true);
        }}
      />
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          {!hasOnboarded && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="App" component={AppNavigator} />
          <Stack.Screen
            name="AddLoan"
            component={AddLoanScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="LoanDetails"
            component={LoanDetailsScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
