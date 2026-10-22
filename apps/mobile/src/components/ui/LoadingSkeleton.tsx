import React from 'react';
import { View } from 'react-native';

export function LoanRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between p-4 mb-3 rounded-card border border-border bg-surface opacity-60">
      <View className="flex-1 mr-3">
        <View className="w-32 h-4 bg-surface-muted rounded mb-2" />
        <View className="w-20 h-3 bg-surface-muted rounded" />
      </View>
      <View className="items-end">
        <View className="w-16 h-5 bg-surface-muted rounded mb-2" />
        <View className="w-14 h-4 bg-surface-muted rounded-full" />
      </View>
    </View>
  );
}

export function SummaryCardSkeleton() {
  return (
    <View className="w-full rounded-card bg-brand/90 p-5 mb-6 opacity-75">
      <View className="w-24 h-3 bg-white/20 rounded mb-3" />
      <View className="w-48 h-8 bg-white/30 rounded mb-6" />
      <View className="flex-row items-center justify-between pt-4 border-t border-white/10">
        <View className="w-20 h-6 bg-white/20 rounded" />
        <View className="w-20 h-6 bg-white/20 rounded" />
        <View className="w-20 h-6 bg-white/20 rounded" />
      </View>
    </View>
  );
}
