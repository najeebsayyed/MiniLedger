import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Receipt,
} from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/navigation-types';
import { useLoan, useRepayLoan } from '../../features/loans/hooks';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { formatCurrency } from '../../utils/currency';
import { formatDisplayDate, formatRelativeDueDate } from '../../utils/dates';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LoanDetails'>;

export function LoanDetailsScreen({ route, navigation }: Props) {
  const { loanId } = route.params;
  const { data: loan, isLoading, isError, refetch } = useLoan(loanId);
  const repayMutation = useRepayLoan();

  const handleMarkRepaid = () => {
    Alert.alert(
      'Confirm Repayment',
      `Mark the ${loan?.amount ? formatCurrency(loan.amount) : 'loan'} to ${loan?.friendName} as fully repaid? This updates your total ledger.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Repaid',
          style: 'default',
          onPress: () => {
            repayMutation.mutate(loanId, {
              onSuccess: () => {
                Alert.alert('Success', 'Loan marked as repaid!');
              },
              onError: (err: any) => {
                Alert.alert('Error', err.message || 'Failed to mark loan as repaid.');
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View className="flex-row items-center justify-between pb-4 border-b border-border">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center bg-surface border border-border"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text className="text-base font-semibold text-text-primary">Loan Details</Text>
          <View className="w-10" />
        </View>
        <View className="mt-8 items-center">
          <View className="w-20 h-20 rounded-full bg-surface-muted animate-pulse mb-4" />
          <View className="w-32 h-6 rounded bg-surface-muted animate-pulse mb-2" />
          <View className="w-48 h-10 rounded bg-surface-muted animate-pulse mb-6" />
        </View>
      </Screen>
    );
  }

  if (isError || !loan) {
    return (
      <Screen scrollable={false}>
        <View className="flex-row items-center justify-between pb-4 border-b border-border">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center bg-surface border border-border"
          >
            <ArrowLeft size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text className="text-base font-semibold text-text-primary">Loan Details</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <AlertTriangle size={48} color={colors.status.overdue} className="mb-4" />
          <Text className="text-lg font-bold text-text-primary text-center">
            Could not load loan details
          </Text>
          <Text className="text-sm text-text-secondary text-center mt-2 mb-6">
            The record might have been removed or you may have lost connection.
          </Text>
          <Button label="Try Again" onPress={() => refetch()} variant="secondary" />
        </View>
      </Screen>
    );
  }

  const isRepaid = loan.status === 'REPAID';
  const isOverdue = loan.isOverdue;

  return (
    <Screen scrollable={true}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between pb-4 border-b border-border mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full items-center justify-center bg-surface border border-border active:opacity-70"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-text-primary">Loan Overview</Text>
        <View className="w-10 items-end">
          <StatusPill status={loan.status} isOverdue={loan.isOverdue} dueDate={loan.dueDate} size="sm" />
        </View>
      </View>

      {/* Hero Display */}
      <View
        className={`rounded-3xl p-6 items-center mb-6 border ${
          isOverdue
            ? 'bg-status-overdue-bg border-status-overdue-border'
            : isRepaid
            ? 'bg-status-repaid-bg border-status-repaid-border'
            : 'bg-surface border-border'
        }`}
      >
        <View
          className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
            isOverdue
              ? 'bg-status-overdue/15'
              : isRepaid
              ? 'bg-status-repaid/15'
              : 'bg-brand/10'
          }`}
        >
          {isRepaid ? (
            <CheckCircle2 size={32} color={colors.status.repaid} />
          ) : isOverdue ? (
            <AlertTriangle size={32} color={colors.status.overdue} />
          ) : (
            <Clock size={32} color={colors.brand.primary} />
          )}
        </View>

        <Text className="text-xs uppercase font-semibold tracking-wider text-text-muted mb-1">
          {isRepaid ? 'Settled Amount' : isOverdue ? 'Overdue Amount' : 'Outstanding Lent'}
        </Text>
        <Text className="text-4xl font-extrabold text-text-primary mb-2 tracking-tight">
          {formatCurrency(loan.amount)}
        </Text>
        <Text className="text-base font-medium text-text-secondary">
          to <Text className="font-bold text-text-primary">{loan.friendName}</Text>
        </Text>

        <View className="mt-4 px-3 py-1.5 rounded-full bg-surface-muted border border-border">
          <Text
            className={`text-xs font-semibold ${
              isOverdue
                ? 'text-status-overdue'
                : isRepaid
                ? 'text-status-repaid'
                : 'text-text-secondary'
            }`}
          >
            {formatRelativeDueDate(loan.dueDate, loan.status, loan.isOverdue)}
          </Text>
        </View>
      </View>

      {/* Detail Breakdown Cards */}
      <View className="bg-surface rounded-2xl p-5 border border-border mb-6">
        <Text className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
          Loan Metadata
        </Text>

        <View className="flex-row items-center justify-between py-2.5 border-b border-border">
          <View className="flex-row items-center">
            <User size={16} color={colors.text.secondary} className="mr-2.5" />
            <Text className="text-sm text-text-secondary">Borrower</Text>
          </View>
          <Text className="text-sm font-semibold text-text-primary">{loan.friendName}</Text>
        </View>

        <View className="flex-row items-center justify-between py-2.5 border-b border-border">
          <View className="flex-row items-center">
            <Calendar size={16} color={colors.text.secondary} className="mr-2.5" />
            <Text className="text-sm text-text-secondary">Agreed Due Date</Text>
          </View>
          <Text className="text-sm font-semibold text-text-primary">
            {formatDisplayDate(loan.dueDate)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between py-2.5 border-b border-border">
          <View className="flex-row items-center">
            <Clock size={16} color={colors.text.secondary} className="mr-2.5" />
            <Text className="text-sm text-text-secondary">Record Created</Text>
          </View>
          <Text className="text-sm font-semibold text-text-primary">
            {formatDisplayDate(loan.createdAt)}
          </Text>
        </View>

        {loan.repaidAt && (
          <View className="flex-row items-center justify-between py-2.5 border-b border-border">
            <View className="flex-row items-center">
              <CheckCircle2 size={16} color={colors.status.repaid} className="mr-2.5" />
              <Text className="text-sm text-text-secondary">Settled On</Text>
            </View>
            <Text className="text-sm font-semibold text-status-repaid">
              {formatDisplayDate(loan.repaidAt)}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between pt-2.5">
          <View className="flex-row items-center">
            <ShieldCheck size={16} color={colors.brand.primary} className="mr-2.5" />
            <Text className="text-sm text-text-secondary">Ledger Status</Text>
          </View>
          <StatusPill status={loan.status} isOverdue={loan.isOverdue} dueDate={loan.dueDate} size="sm" />
        </View>
      </View>

      {/* Action Area */}
      <View className="mt-2 mb-8">
        {!isRepaid ? (
          <Button
            label="Mark as Repaid"
            onPress={handleMarkRepaid}
            loading={repayMutation.isPending}
            variant="primary"
            size="lg"
            icon={<CheckCircle2 size={20} color={colors.brand.citrus} />}
          />
        ) : (
          <View className="bg-status-repaid-bg border border-status-repaid-border rounded-xl p-4 flex-row items-center justify-center">
            <CheckCircle2 size={20} color={colors.status.repaid} className="mr-2" />
            <Text className="text-sm font-bold text-status-repaid">
              This loan is fully settled
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}
