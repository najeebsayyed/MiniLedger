import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle, Clock, CheckCircle, Calendar } from 'lucide-react-native';

export type LoanVisualStatus = 'overdue' | 'dueToday' | 'upcoming' | 'repaid';

interface StatusPillProps {
  status: 'ACTIVE' | 'REPAID';
  isOverdue?: boolean;
  dueDate?: string;
  size?: 'sm' | 'md';
}

export function StatusPill({
  status,
  isOverdue = false,
  dueDate,
  size = 'md',
}: StatusPillProps) {
  let visualStatus: LoanVisualStatus = 'upcoming';

  if (status === 'REPAID') {
    visualStatus = 'repaid';
  } else if (isOverdue) {
    visualStatus = 'overdue';
  } else if (dueDate) {
    const today = new Date().toISOString().split('T')[0];
    if (dueDate === today) {
      visualStatus = 'dueToday';
    }
  }

  const iconSize = size === 'sm' ? 12 : 14;
  const paddingClass = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const textClass = size === 'sm' ? 'text-[11px]' : 'text-xs';

  if (visualStatus === 'repaid') {
    return (
      <View
        className={`flex-row items-center rounded-full bg-emerald-50 border border-emerald-200/60 ${paddingClass}`}
      >
        <CheckCircle size={iconSize} color="#247A57" strokeWidth={2.2} />
        <Text className={`font-semibold text-success ml-1.5 ${textClass}`}>
          Repaid
        </Text>
      </View>
    );
  }

  if (visualStatus === 'overdue') {
    return (
      <View
        className={`flex-row items-center rounded-full bg-overdue-surface border border-overdue/20 ${paddingClass}`}
      >
        <AlertCircle size={iconSize} color="#C94E42" strokeWidth={2.2} />
        <Text className={`font-semibold text-overdue ml-1.5 ${textClass}`}>
          Overdue
        </Text>
      </View>
    );
  }

  if (visualStatus === 'dueToday') {
    return (
      <View
        className={`flex-row items-center rounded-full bg-amber-50 border border-amber-200 ${paddingClass}`}
      >
        <Clock size={iconSize} color="#B45309" strokeWidth={2.2} />
        <Text className={`font-semibold text-amber-800 ml-1.5 ${textClass}`}>
          Due today
        </Text>
      </View>
    );
  }

  // Upcoming
  return (
    <View
      className={`flex-row items-center rounded-full bg-surface-muted border border-border ${paddingClass}`}
    >
      <Calendar size={iconSize} color="#68756E" strokeWidth={2} />
      <Text className={`font-medium text-text-secondary ml-1.5 ${textClass}`}>
        Upcoming
      </Text>
    </View>
  );
}
