import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}

export function FilterChip({ label, active, onPress, count }: FilterChipProps) {
  const containerClass = active
    ? 'bg-brand border-brand'
    : 'bg-surface border-border active:bg-surface-muted';

  const textClass = active ? 'text-white font-bold' : 'text-text-secondary font-medium';

  const badgeBg = active ? 'bg-white/20' : 'bg-surface-muted';
  const badgeText = active ? 'text-white' : 'text-text-secondary';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`flex-row items-center px-3.5 py-2 rounded-full border mr-2 ${containerClass}`}
      style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
    >
      <Text className={`text-xs ${textClass}`}>{label}</Text>
      {count !== undefined ? (
        <View className={`ml-1.5 px-1.5 py-0.2 rounded-full ${badgeBg}`}>
          <Text className={`text-[10px] font-bold ${badgeText}`}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
