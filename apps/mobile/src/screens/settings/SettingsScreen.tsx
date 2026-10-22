import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  ShieldCheck,
  Terminal,
  Database,
  Smartphone,
  LogOut,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  RotateCcw,
  Check,
  Server,
  Key,
} from 'lucide-react-native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../features/auth/AuthContext';
import { queryClient } from '../../lib/query-client';
import { colors } from '../../theme/colors';

export function SettingsScreen() {
  const { user, signOut, resetOnboardingState } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of MiniLedger? Your active session token and cached ledger records will be securely cleared.',
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

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding Tour',
      'This will reset your onboarding state. Next time you sign out or restart the app, the 4-slide introductory tour will be shown.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Tour',
          onPress: async () => {
            await resetOnboardingState();
            Alert.alert(
              'Tour Reset',
              'Onboarding flag has been reset. You will see the walkthrough on your next login session.'
            );
          },
        },
      ]
    );
  };

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['summary'] }),
      queryClient.invalidateQueries({ queryKey: ['loans'] }),
    ]);
    setTimeout(() => {
      setIsRefreshing(false);
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2500);
    }, 500);
  };

  // Format phone number nicely (e.g. +91 98765 43210)
  const formatPhone = (rawPhone?: string) => {
    if (!rawPhone) return '+91 ••••• •••••';
    if (rawPhone.startsWith('+91') && rawPhone.length === 13) {
      return `${rawPhone.slice(0, 3)} ${rawPhone.slice(3, 8)} ${rawPhone.slice(8)}`;
    }
    return rawPhone;
  };

  // Get user initials or default ML
  const getInitials = (phone?: string) => {
    if (!phone) return 'ML';
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 2 ? digits.slice(-2) : 'ML';
  };

  return (
    <Screen scrollable={true} contentContainerStyle={styles.container}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Settings</Text>
        <Text style={styles.headerSubtitle}>
          Session management, technical specifications & developer controls
        </Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.phoneNumber)}</Text>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.verifiedRow}>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color="#15803D" />
                <Text style={styles.verifiedText}>Verified Session</Text>
              </View>
            </View>

            <Text style={styles.phoneNumber}>
              {formatPhone(user?.phoneNumber)}
            </Text>

            <Text style={styles.userIdText}>
              ID: {user?.id ? `${user.id.slice(0, 14)}...` : 'demo-user-id'}
            </Text>
          </View>
        </View>

        <View style={styles.profileFooter}>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatLabel}>Auth Method</Text>
            <Text style={styles.profileStatValue}>Phone + Mock OTP</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatLabel}>Security</Text>
            <Text style={styles.profileStatValue}>JWT in Keychain</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatLabel}>Database Scope</Text>
            <Text style={styles.profileStatValue}>User-Isolated</Text>
          </View>
        </View>
      </View>

      {/* Developer & Demo Controls */}
      <Text style={styles.sectionHeading}>DEMO & DEVELOPER ACTIONS</Text>

      <View style={styles.menuContainer}>
        {/* Sync / Invalidate Cache */}
        <TouchableOpacity
          onPress={handleRefreshCache}
          disabled={isRefreshing}
          style={styles.menuItem}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#F0FDF4' }]}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : justRefreshed ? (
              <Check size={18} color="#16A34A" />
            ) : (
              <RefreshCw size={18} color="#16A34A" />
            )}
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Force Invalidate & Sync Data</Text>
            <Text style={styles.menuSubtitle}>
              {justRefreshed
                ? 'All queries re-fetched from server!'
                : 'Re-fetch dashboard summary and loan ledger from PostgreSQL'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Reset Onboarding Walkthrough */}
        <TouchableOpacity
          onPress={handleResetOnboarding}
          style={[styles.menuItem, styles.menuItemBorder]}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#F0F9FF' }]}>
            <RotateCcw size={18} color="#0284C7" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Reset Onboarding Walkthrough</Text>
            <Text style={styles.menuSubtitle}>
              Show the 4-slide introductory product tour on the next app launch
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Mock Authentication Disclosure */}
      <View style={styles.disclosureCard}>
        <View style={styles.disclosureHeader}>
          <View style={styles.disclosureIconWrap}>
            <Terminal size={16} color="#153E35" />
          </View>
          <Text style={styles.disclosureTitle}>Developer Mock OTP Architecture</Text>
        </View>
        <Text style={styles.disclosureBody}>
          As mandated by the internship assignment, MiniLedger uses a server-side mock OTP provider in local development. When you request a login code, a random 6-digit OTP is securely logged directly to your Node.js backend console, bypassing commercial SMS gateway costs while exercising full cryptographic JWT verification.
        </Text>
      </View>

      {/* Technical Specifications */}
      <Text style={styles.sectionHeading}>FULL-STACK ARCHITECTURE</Text>

      <View style={styles.specsCard}>
        <View style={styles.specRow}>
          <View style={styles.specLabelRow}>
            <Smartphone size={16} color="#64748B" />
            <Text style={styles.specLabel}>Mobile App</Text>
          </View>
          <Text style={styles.specValue}>React Native CLI 0.88 (Bare)</Text>
        </View>

        <View style={styles.specDivider} />

        <View style={styles.specRow}>
          <View style={styles.specLabelRow}>
            <Sparkles size={16} color="#64748B" />
            <Text style={styles.specLabel}>Styling & Design</Text>
          </View>
          <Text style={styles.specValue}>NativeWind v4 + Tailwind CSS</Text>
        </View>

        <View style={styles.specDivider} />

        <View style={styles.specRow}>
          <View style={styles.specLabelRow}>
            <Server size={16} color="#64748B" />
            <Text style={styles.specLabel}>API Server</Text>
          </View>
          <Text style={styles.specValue}>Node.js + Express + TypeScript</Text>
        </View>

        <View style={styles.specDivider} />

        <View style={styles.specRow}>
          <View style={styles.specLabelRow}>
            <Database size={16} color="#64748B" />
            <Text style={styles.specLabel}>Database & ORM</Text>
          </View>
          <Text style={styles.specValue}>PostgreSQL 16 + Drizzle ORM</Text>
        </View>

        <View style={styles.specDivider} />

        <View style={styles.specRow}>
          <View style={styles.specLabelRow}>
            <Layers size={16} color="#64748B" />
            <Text style={styles.specLabel}>Shared Contracts</Text>
          </View>
          <Text style={styles.specValue}>Zod Schemas (@miniledger/contracts)</Text>
        </View>

        <View style={styles.specDivider} />

        <View style={styles.specRow}>
          <View style={styles.specLabelRow}>
            <Key size={16} color="#64748B" />
            <Text style={styles.specLabel}>Token Storage</Text>
          </View>
          <Text style={styles.specValue}>react-native-keychain (Encrypted)</Text>
        </View>
      </View>

      {/* App Version Info */}
      <View style={styles.versionContainer}>
        <Info size={14} color="#94A3B8" />
        <Text style={styles.versionText}>
          MiniLedger Build v1.0.0 • Strict TypeScript • Production-Minded
        </Text>
      </View>

      {/* Logout Action */}
      <View style={styles.logoutWrapper}>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#153E35',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D8F36A',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D8F36A',
    letterSpacing: -0.5,
  },
  profileInfo: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 4,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  userIdText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  profileFooter: {
    flexDirection: 'row',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'space-between',
  },
  profileStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    height: '70%',
    alignSelf: 'center',
  },
  profileStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  profileStatValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#153E35',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  disclosureCard: {
    backgroundColor: '#F8FAF6',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2EBDC',
    marginBottom: 24,
  },
  disclosureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  disclosureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#D8F36A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  disclosureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#153E35',
  },
  disclosureBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  specsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  specDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  specLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 8,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 6,
    fontWeight: '500',
  },
  logoutWrapper: {
    marginBottom: 16,
  },
});
