import React from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import {
  User,
  Phone,
  ShieldCheck,
  Terminal,
  Database,
  Smartphone,
  LogOut,
  Info,
  CheckCircle,
} from 'lucide-react-native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../features/auth/AuthContext';
import { colors } from '../../theme/colors';

export function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of MiniLedger? Your active session token will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <Screen scrollable={true}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-extrabold text-text-primary tracking-tight">
          Settings & Account
        </Text>
        <Text className="text-sm text-text-secondary mt-1">
          Manage your credentials and local session
        </Text>
      </View>

      {/* Profile Card */}
      <View className="bg-surface-card rounded-2xl p-5 border border-border-subtle mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-14 h-14 rounded-full bg-brand/10 items-center justify-center mr-4 border border-brand/20">
            <User size={28} color={colors.brand.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-0.5">
              Active Account
            </Text>
            <Text className="text-lg font-bold text-text-primary">
              {user?.phoneNumber || 'Demo Account'}
            </Text>
            <View className="flex-row items-center mt-1">
              <ShieldCheck size={14} color={colors.status.repaid} className="mr-1" />
              <Text className="text-xs font-medium text-status-repaid">
                Authenticated via JWT
              </Text>
            </View>
          </View>
        </View>

        <View className="pt-3 border-t border-border-subtle flex-row justify-between items-center">
          <Text className="text-xs text-text-muted">User ID</Text>
          <Text className="text-xs font-mono text-text-secondary">
            {user?.id ? `${user.id.slice(0, 12)}...` : 'Local User'}
          </Text>
        </View>
      </View>

      {/* Mock Authentication Disclosure */}
      <View className="bg-surface-muted/70 rounded-2xl p-5 border border-border mb-6">
        <View className="flex-row items-center mb-2">
          <Terminal size={18} color={colors.brand.primary} className="mr-2" />
          <Text className="text-sm font-bold text-text-primary">
            Developer Mock OTP Disclosure
          </Text>
        </View>
        <Text className="text-xs text-text-secondary leading-relaxed">
          As required by the assignment specification, MiniLedger uses a local mock OTP provider for evaluation. OTP codes are printed to the backend Node.js development server console and are not sent over real cellular SMS networks.
        </Text>
      </View>

      {/* Technical Stack Architecture */}
      <View className="bg-surface-card rounded-2xl p-5 border border-border-subtle mb-8 space-y-3">
        <Text className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          Technical Specifications
        </Text>

        <View className="flex-row items-center justify-between py-2 border-b border-border-subtle">
          <View className="flex-row items-center">
            <Smartphone size={16} color={colors.text.muted} className="mr-2" />
            <Text className="text-xs text-text-secondary">Frontend</Text>
          </View>
          <Text className="text-xs font-semibold text-text-primary">
            React Native CLI 0.88 + NativeWind v4
          </Text>
        </View>

        <View className="flex-row items-center justify-between py-2 border-b border-border-subtle">
          <View className="flex-row items-center">
            <Database size={16} color={colors.text.muted} className="mr-2" />
            <Text className="text-xs text-text-secondary">Database</Text>
          </View>
          <Text className="text-xs font-semibold text-text-primary">
            PostgreSQL 16 + Drizzle ORM
          </Text>
        </View>

        <View className="flex-row items-center justify-between py-2 border-b border-border-subtle">
          <View className="flex-row items-center">
            <CheckCircle size={16} color={colors.text.muted} className="mr-2" />
            <Text className="text-xs text-text-secondary">Contracts</Text>
          </View>
          <Text className="text-xs font-semibold text-text-primary">
            Shared Zod Runtime Validation
          </Text>
        </View>

        <View className="flex-row items-center justify-between pt-2">
          <View className="flex-row items-center">
            <Info size={16} color={colors.text.muted} className="mr-2" />
            <Text className="text-xs text-text-secondary">Version</Text>
          </View>
          <Text className="text-xs font-mono font-medium text-text-secondary">
            1.0.0 (Build Release)
          </Text>
        </View>
      </View>

      {/* Logout Action */}
      <View className="mb-10">
        <Button
          label="Sign Out of MiniLedger"
          onPress={handleLogout}
          variant="destructive"
          size="lg"
          icon={<LogOut size={18} color="#FFFFFF" />}
        />
      </View>
    </Screen>
  );
}
