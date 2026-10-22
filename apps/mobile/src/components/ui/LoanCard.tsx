import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { LoanDto } from '@miniledger/contracts';
import { StatusPill } from './StatusPill';
import { formatInr } from '../../utils/currency';
import { formatFriendlyDate } from '../../utils/dates';
import { ChevronRight } from 'lucide-react-native';

interface LoanCardProps {
  loan: LoanDto;
  onPress: () => void;
}

export function LoanCard({ loan, onPress }: LoanCardProps) {
  const isOverdue = loan.isOverdue && loan.status === 'ACTIVE';

  const containerBorder = isOverdue
    ? 'border-overdue/40 bg-white'
    : loan.status === 'REPAID'
    ? 'border-border/60 bg-surface/70'
    : 'border-border bg-surface';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Loan to ${loan.friendName}, amount ${formatInr(
        loan.amount
      )}, status ${isOverdue ? 'overdue' : loan.status}`}
      className={`flex-row items-center justify-between p-4 mb-3 rounded-card border ${containerBorder} shadow-sm shadow-black/5`}
      style={({ pressed }) => (pressed ? { opacity: 0.85, transform: [{ scale: 0.99 }] } : undefined)}
    >
      <View className="flex-1 mr-3">
        {/* Friend Name */}
        <Text
          className="text-base font-bold text-text-primary mb-1"
          numberOfLines={1}
        >
          {loan.friendName}
        </Text>

        {/* Due Date Info */}
        <Text className="text-xs text-text-secondary">
          {loan.status === 'REPAID'
            ? `Repaid on ${formatFriendlyDate(loan.repaidAt || loan.updatedAt)}`
            : `Due ${formatFriendlyDate(loan.dueDate)}`}
        </Text>
      </View>

      {/* Right Column: Amount & Status */}
      <View className="items-end">
        <Text
          className={`text-base font-extrabold mb-1.5 ${
            isOverdue
              ? 'text-overdue'
              : loan.status === 'REPAID'
              ? 'text-text-secondary line-through'
              : 'text-text-primary'
          }`}
        >
          {formatInr(loan.amount)}
        </Text>

        <View className="flex-row items-center">
          <StatusPill
            status={loan.status}
            isOverdue={loan.isOverdue}
            dueDate={loan.dueDate}
            size="sm"
          />
          <ChevronRight size={14} color="#A0ABA4" className="ml-1" />
        </View>
      </View>
    </Pressable>
  );
}
