import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label?: string;
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  accessibilityLabel?: string;
}

export function Button({
  label,
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  className = '',
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const buttonText = label || title || '';

  let baseContainerClass =
    'flex-row items-center justify-center rounded-input select-none ';
  let baseTextClass = 'font-semibold text-center ';

  // Size styles
  if (size === 'sm') {
    baseContainerClass += 'px-3 py-2 min-h-[40px] ';
    baseTextClass += 'text-xs ';
  } else if (size === 'lg') {
    baseContainerClass += 'px-6 py-4 min-h-[56px] ';
    baseTextClass += 'text-base ';
  } else {
    // md
    baseContainerClass += 'px-5 py-3.5 min-h-[48px] ';
    baseTextClass += 'text-sm ';
  }

  // Variant styles
  let variantContainerClass = '';
  let variantTextClass = '';
  let spinnerColor = '#FFFFFF';

  switch (variant) {
    case 'primary':
      variantContainerClass = isDisabled
        ? 'bg-brand/60'
        : 'bg-brand active:opacity-90';
      variantTextClass = 'text-white';
      spinnerColor = '#FFFFFF';
      break;
    case 'accent':
      variantContainerClass = isDisabled
        ? 'bg-brand-accent/50'
        : 'bg-brand-accent active:opacity-90';
      variantTextClass = 'text-brand font-bold';
      spinnerColor = '#153E35';
      break;
    case 'secondary':
      variantContainerClass = isDisabled
        ? 'bg-surface-muted/50'
        : 'bg-surface-muted active:opacity-80';
      variantTextClass = 'text-text-primary';
      spinnerColor = '#16231F';
      break;
    case 'outline':
      variantContainerClass = isDisabled
        ? 'border border-border/50 bg-surface/50'
        : 'border border-border bg-surface active:bg-surface-muted';
      variantTextClass = 'text-text-primary';
      spinnerColor = '#16231F';
      break;
    case 'destructive':
      variantContainerClass = isDisabled
        ? 'bg-overdue/50'
        : 'bg-overdue active:opacity-90';
      variantTextClass = 'text-white';
      spinnerColor = '#FFFFFF';
      break;
    case 'ghost':
      variantContainerClass = isDisabled ? 'opacity-40' : 'active:bg-surface-muted';
      variantTextClass = 'text-text-primary';
      spinnerColor = '#16231F';
      break;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || buttonText}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`${baseContainerClass} ${variantContainerClass} ${className}`}
      style={({ pressed }) => [
        pressed && !isDisabled ? { transform: [{ scale: 0.985 }] } : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text className={`${baseTextClass} ${variantTextClass}`}>{buttonText}</Text>
        </View>
      )}
    </Pressable>
  );
}
