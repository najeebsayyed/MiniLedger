import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabsParamList } from './navigation-types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { LedgerScreen } from '../screens/ledger/LedgerScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface.card,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ledger"
        component={LedgerScreen}
        options={{
          tabBarLabel: 'Ledger',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size || 22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
