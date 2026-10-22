import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/navigation-types';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { useVerifyOtp, useRequestOtp } from '../../features/auth/hooks';
import { useAuth } from '../../features/auth/AuthContext';
import { KeyRound, ArrowLeft, Terminal } from 'lucide-react-native';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

export function OtpScreen({ route, navigation }: Props) {
  const { phoneNumber } = route.params;

  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(60);

  const verifyOtpMutation = useVerifyOtp();
  const requestOtpMutation = useRequestOtp();
  const { signIn } = useAuth();
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (code.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }

    setError(null);
    try {
      const data = await verifyOtpMutation.mutateAsync({
        phoneNumber,
        otp: code,
      });
      await signIn(data.accessToken, data.user);
    } catch (err: any) {
      setError(err?.message || 'That code is incorrect or has expired. Try again.');
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || requestOtpMutation.isPending) return;
    setError(null);
    try {
      await requestOtpMutation.mutateAsync(phoneNumber);
      setResendCountdown(60);
    } catch (err: any) {
      setError(err?.message || 'Could not resend code. Try again.');
    }
  };

  const maskedPhone =
    phoneNumber.slice(0, 3) + ' ••••• ' + phoneNumber.slice(-4);

  return (
    <Screen scrollable contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
      <Pressable
        onPress={() => navigation.goBack()}
        className="flex-row items-center mb-6 self-start"
        accessibilityRole="button"
        accessibilityLabel="Edit phone number"
      >
        <ArrowLeft size={18} color="#153E35" />
        <Text className="text-xs font-semibold text-brand ml-1">
          Edit phone number
        </Text>
      </Pressable>

      <View className="items-center mb-6">
        <View className="w-16 h-16 rounded-3xl bg-surface-muted border border-border items-center justify-center mb-4">
          <KeyRound size={28} color="#153E35" />
        </View>
        <Text className="text-2xl font-bold text-text-primary text-center">
          Verify your phone
        </Text>
        <Text className="text-sm text-text-secondary text-center mt-1">
          Code sent to{' '}
          <Text className="font-semibold text-text-primary">{maskedPhone}</Text>
        </Text>
      </View>

      <View className="bg-surface rounded-card p-6 border border-border shadow-sm mb-6">
        {/* Hidden/Overlayed 6-digit entry input */}
        <TextInput
          ref={inputRef}
          value={otpCode}
          onChangeText={(val) => {
            const cleaned = val.replace(/[^0-9]/g, '').slice(0, 6);
            setOtpCode(cleaned);
            if (error) setError(null);
            if (cleaned.length === 6) {
              handleVerify(cleaned);
            }
          }}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          className="w-0 h-0 opacity-0 absolute"
        />

        {/* 6 Digit display boxes */}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          className="flex-row justify-between mb-4"
        >
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const digit = otpCode[index] || '';
            const isCurrent = otpCode.length === index;
            const borderClass = error
              ? 'border-overdue'
              : isCurrent
              ? 'border-brand bg-emerald-50/40'
              : digit
              ? 'border-brand/40 bg-surface'
              : 'border-border bg-surface-muted/30';

            return (
              <View
                key={index}
                className={`w-12 h-14 rounded-input border items-center justify-center ${borderClass}`}
              >
                <Text className="text-2xl font-extrabold text-brand">
                  {digit}
                </Text>
              </View>
            );
          })}
        </Pressable>

        {error ? (
          <Text className="text-xs font-semibold text-overdue text-center mb-4">
            {error}
          </Text>
        ) : null}

        <Button
          label="Verify & continue"
          onPress={() => handleVerify()}
          variant="primary"
          size="lg"
          loading={verifyOtpMutation.isPending}
          disabled={otpCode.length !== 6}
          className="mb-4"
        />

        {/* Resend Action */}
        <View className="flex-row justify-center items-center">
          {resendCountdown > 0 ? (
            <Text className="text-xs text-text-secondary">
              Resend code in{' '}
              <Text className="font-semibold text-text-primary">
                {resendCountdown}s
              </Text>
            </Text>
          ) : (
            <Pressable
              onPress={handleResend}
              disabled={requestOtpMutation.isPending}
            >
              <Text className="text-xs font-bold text-brand">
                Resend verification code
              </Text>
            </Pressable>
          )}
        </View>

        {/* Development Helper Box */}
        <View className="mt-6 p-3 bg-surface-muted/60 rounded-xl border border-border/80 flex-row items-center">
          <Terminal size={16} color="#153E35" className="mr-2" />
          <Text className="text-[11px] text-text-secondary flex-1 leading-4">
            Enter the 6-digit code printed in the local API server log terminal.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
