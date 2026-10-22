import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/navigation-types';
import { Screen } from '../../components/ui/Screen';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useRequestOtp } from '../../features/auth/hooks';
import { MiniLedgerLogo } from '../../components/illustrations/MiniLedgerLogo';
import { ShieldCheck, ArrowRight } from 'lucide-react-native';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const requestOtpMutation = useRequestOtp();

  const handleSendCode = async () => {
    setError(null);
    const cleaned = phoneInput.trim();

    if (!cleaned) {
      setError('Enter a valid phone number.');
      return;
    }

    // Normalize phone number to E.164
    let formatted = cleaned;
    if (!formatted.startsWith('+')) {
      if (formatted.startsWith('91') && formatted.length === 12) {
        formatted = '+' + formatted;
      } else if (formatted.length === 10) {
        formatted = '+91' + formatted;
      } else {
        formatted = '+91' + formatted;
      }
    }

    // Basic regex check before calling API
    if (!/^\+[1-9]\d{7,14}$/.test(formatted)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    try {
      await requestOtpMutation.mutateAsync(formatted);
      navigation.navigate('Otp', { phoneNumber: formatted });
    } catch (err: any) {
      setError(err?.message || 'Could not send verification code. Try again.');
    }
  };

  return (
    <Screen scrollable contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
      <View className="items-center mb-8">
        <View className="mb-4">
          <MiniLedgerLogo size={72} />
        </View>
        <Text className="text-3xl font-extrabold text-brand tracking-tight">
          MiniLedger
        </Text>
        <Text className="text-sm text-text-secondary text-center mt-1 font-medium">
          Money moves. Friendships stay clear.
        </Text>
      </View>

      <View className="bg-surface rounded-card p-6 border border-border shadow-sm mb-6">
        <Text className="text-lg font-bold text-text-primary mb-1">
          Welcome back
        </Text>
        <Text className="text-xs text-text-secondary mb-5">
          Enter your phone number to sign in or create an account.
        </Text>

        <TextField
          label="Phone number"
          placeholder="98765 43210"
          value={phoneInput}
          onChangeText={(val) => {
            setPhoneInput(val);
            if (error) setError(null);
          }}
          keyboardType="phone-pad"
          autoFocus
          error={error || undefined}
          prefix={
            <View className="flex-row items-center pr-2 border-r border-border">
              <Text className="text-base font-bold text-brand mr-1">🇮🇳</Text>
              <Text className="text-base font-semibold text-text-primary">+91</Text>
            </View>
          }
        />

        <Button
          label="Send verification code"
          onPress={handleSendCode}
          variant="primary"
          size="lg"
          loading={requestOtpMutation.isPending}
          icon={<ArrowRight size={18} color="#FFFFFF" />}
          className="mt-2"
        />

        {/* Demo note as required by product spec */}
        <View className="flex-row items-center justify-center mt-5 pt-4 border-t border-border/60">
          <ShieldCheck size={14} color="#68756E" />
          <Text className="text-[11px] text-text-secondary ml-1.5 text-center">
            Demo mode: 6-digit OTP will print in server log
          </Text>
        </View>
      </View>
    </Screen>
  );
}
