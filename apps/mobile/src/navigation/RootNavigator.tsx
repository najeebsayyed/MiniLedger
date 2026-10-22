import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation-types';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { AddLoanScreen } from '../screens/loans/AddLoanScreen';
import { LoanDetailsScreen } from '../screens/loans/LoanDetailsScreen';
import { useAuth } from '../features/auth/AuthContext';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.brand.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#FFFFFF',
            letterSpacing: -0.5,
            marginBottom: 8,
          }}
        >
          MiniLedger
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: colors.brand.citrus,
            marginBottom: 24,
          }}
        >
          Calm personal loan tracking
        </Text>
        <ActivityIndicator size="small" color={colors.brand.citrus} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
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
