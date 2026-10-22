import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
} from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function TextField({
  label,
  error,
  helperText,
  prefix,
  suffix,
  className = '',
  containerClassName = '',
  onFocus,
  onBlur,
  editable = true,
  ...rest
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  let borderClass = 'border-border';
  if (error) {
    borderClass = 'border-overdue';
  } else if (isFocused) {
    borderClass = 'border-brand';
  }

  const bgClass = editable ? 'bg-surface' : 'bg-surface-muted/50';

  return (
    <View className={`w-full mb-4 ${containerClassName}`}>
      <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </Text>
      <View
        className={`flex-row items-center border rounded-input px-3.5 py-3 ${borderClass} ${bgClass}`}
      >
        {prefix ? <View className="mr-2.5">{prefix}</View> : null}
        <TextInput
          className={`flex-1 text-base text-text-primary p-0 leading-5 ${className}`}
          placeholderTextColor="#A0ABA4"
          editable={editable}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {suffix ? <View className="ml-2">{suffix}</View> : null}
      </View>
      {error ? (
        <Text className="text-xs font-medium text-overdue mt-1.5 ml-1">
          {error}
        </Text>
      ) : helperText ? (
        <Text className="text-xs text-text-secondary mt-1.5 ml-1">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
