import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/navigation-types';
import { Screen } from '../../components/ui/Screen';
import { SummaryCard } from '../../components/ui/SummaryCard';
import { LoanCard } from '../../components/ui/LoanCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoanRowSkeleton, SummaryCardSkeleton } from '../../components/ui/LoadingSkeleton';
import { useSummary } from '../../features/summary/hooks';
import { useLoans } from '../../features/loans/hooks';
import { useCurrentUser } from '../../features/auth/hooks';
import { Plus, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react-native';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
    isRefetching: isSummaryRefetching,
  } = useSummary();

  const {
    data: loansData,
    isLoading: isLoansLoading,
    refetch: refetchLoans,
    isRefetching: isLoansRefetching,
  } = useLoans({ pageSize: 5, sort: 'smart' });

  const { data: user } = useCurrentUser();

  const isRefreshing = isSummaryRefetching || isLoansRefetching;

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchLoans()]);
  };

  const loans = loansData?.data || [];
  const overdueLoans = loans.filter((l) => l.isOverdue && l.status === 'ACTIVE');
  const hasOverdue = (summary?.overdueLoansCount ?? 0) > 0;

  return (
    <Screen
      scrollable
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      {/* 1. Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="text-xs uppercase tracking-widest font-bold text-brand">
            MiniLedger
          </Text>
          <Text className="text-xl font-extrabold text-text-primary tracking-tight">
            Your money, in view
          </Text>
        </View>

        <Pressable
          onPress={() => (navigation as any).navigate('App', { screen: 'Settings' })}
          className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center shadow-xs"
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Text className="text-xs font-bold text-brand">
            {user?.phoneNumber ? user.phoneNumber.slice(-2) : 'ML'}
          </Text>
        </Pressable>
      </View>

      {/* 2. Hero Summary Card */}
      {isSummaryLoading && !summary ? (
        <SummaryCardSkeleton />
      ) : (
        <View className="mb-6">
          <SummaryCard summary={summary} loading={isSummaryLoading} />
        </View>
      )}

      {/* 3. Attention Section (Overdue loans if any exist) */}
      {hasOverdue ? (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-overdue mr-2" />
              <Text className="text-base font-bold text-text-primary">
                Needs attention
              </Text>
              <View className="ml-2 px-2 py-0.5 rounded-full bg-overdue-surface border border-overdue/20">
                <Text className="text-[11px] font-bold text-overdue">
                  {summary?.overdueLoansCount} overdue
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                (navigation as any).navigate('App', {
                  screen: 'Ledger',
                  params: { initialFilter: 'overdue' },
                })
              }
              className="flex-row items-center"
            >
              <Text className="text-xs font-semibold text-overdue mr-0.5">
                View all
              </Text>
              <ArrowRight size={12} color="#C94E42" />
            </Pressable>
          </View>

          {/* Overdue items */}
          {overdueLoans.slice(0, 3).map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => navigation.navigate('LoanDetails', { loanId: loan.id })}
            />
          ))}
        </View>
      ) : (
        /* Quiet positive state when no overdue */
        <View className="flex-row items-center p-3.5 mb-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/50">
          <CheckCircle2 size={16} color="#247A57" className="mr-2.5" />
          <Text className="text-xs font-medium text-emerald-900 flex-1">
            All loans are currently on track. No overdue entries.
          </Text>
        </View>
      )}

      {/* 4. Recent Activity */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-bold text-text-primary">
            Recent activity
          </Text>
          <Pressable
            onPress={() => (navigation as any).navigate('App', { screen: 'Ledger' })}
            className="flex-row items-center"
          >
            <Text className="text-xs font-semibold text-brand mr-0.5">
              View all
            </Text>
            <ArrowRight size={12} color="#153E35" />
          </Pressable>
        </View>

        {isLoansLoading && !loans.length ? (
          <>
            <LoanRowSkeleton />
            <LoanRowSkeleton />
            <LoanRowSkeleton />
          </>
        ) : loans.length === 0 ? (
          <EmptyState
            type="ledger"
            onAction={() => navigation.navigate('AddLoan')}
          />
        ) : (
          loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => navigation.navigate('LoanDetails', { loanId: loan.id })}
            />
          ))
        )}
      </View>

      {/* Persistent Add Loan Action Button */}
      <View className="mt-2 mb-4">
        <Pressable
          onPress={() => navigation.navigate('AddLoan')}
          accessibilityRole="button"
          accessibilityLabel="Add new loan"
          className="flex-row items-center justify-center p-4 rounded-input bg-brand shadow-md active:opacity-90"
        >
          <Plus size={20} color="#D8F36A" className="mr-2" />
          <Text className="text-base font-bold text-white">
            Add a loan
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
