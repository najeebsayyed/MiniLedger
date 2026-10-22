import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, AppTabsParamList } from '../../navigation/navigation-types';
import { Screen } from '../../components/ui/Screen';
import { FilterChip } from '../../components/ui/FilterChip';
import { LoanCard } from '../../components/ui/LoanCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoanRowSkeleton } from '../../components/ui/LoadingSkeleton';
import { useLoans } from '../../features/loans/hooks';
import { useSummary } from '../../features/summary/hooks';
import { LoanFilterStatus, LoanDto } from '@miniledger/contracts';
import { Search, X, Plus } from 'lucide-react-native';

export function LedgerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<AppTabsParamList, 'Ledger'>>();

  const [activeFilter, setActiveFilter] = useState<LoanFilterStatus>(
    route.params?.initialFilter || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Handle route params updates
  useEffect(() => {
    if (route.params?.initialFilter) {
      setActiveFilter(route.params.initialFilter);
    }
  }, [route.params?.initialFilter]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const {
    data: loansData,
    isLoading,
    refetch,
    isRefetching,
  } = useLoans({
    status: activeFilter,
    search: debouncedSearch,
    sort: 'smart',
  });

  const { data: summary } = useSummary();

  const loans = loansData?.data || [];

  const filterOptions: { label: string; value: LoanFilterStatus; count?: number }[] = [
    { label: 'All', value: 'all', count: (summary?.activeLoansCount ?? 0) + (summary?.repaidLoansCount ?? 0) },
    { label: 'Outstanding', value: 'outstanding', count: summary?.activeLoansCount },
    { label: 'Overdue', value: 'overdue', count: summary?.overdueLoansCount },
    { label: 'Repaid', value: 'repaid', count: summary?.repaidLoansCount },
  ];

  return (
    <Screen contentContainerStyle={{ flex: 1, padding: 20 }}>
      {/* Title & Add CTA */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-extrabold text-text-primary">
            Ledger
          </Text>
          <Text className="text-xs text-text-secondary mt-0.5 font-medium">
            Track and manage money lent to friends
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('AddLoan')}
          className="flex-row items-center bg-brand px-3 py-2 rounded-full active:opacity-85"
        >
          <Plus size={16} color="#D8F36A" />
          <Text className="text-xs font-bold text-white ml-1">New</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View className="flex-row items-center bg-surface border border-border rounded-input px-3.5 py-2.5 mb-3.5 shadow-xs">
        <Search size={16} color="#68756E" className="mr-2" />
        <TextInput
          placeholder="Search by friend name..."
          placeholderTextColor="#A0ABA4"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-sm text-text-primary p-0 leading-4"
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <X size={16} color="#68756E" />
          </Pressable>
        ) : null}
      </View>

      {/* Filter Chips */}
      <View className="flex-row mb-4">
        {filterOptions.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={activeFilter === opt.value}
            count={opt.count}
            onPress={() => setActiveFilter(opt.value)}
          />
        ))}
      </View>

      {/* Loans List */}
      {isLoading && !loans.length ? (
        <View className="flex-1">
          <LoanRowSkeleton />
          <LoanRowSkeleton />
          <LoanRowSkeleton />
          <LoanRowSkeleton />
        </View>
      ) : loans.length === 0 ? (
        <View className="flex-1 justify-center">
          {searchQuery || activeFilter !== 'all' ? (
            <EmptyState
              type="filter"
              onAction={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
            />
          ) : (
            <EmptyState
              type="ledger"
              onAction={() => navigation.navigate('AddLoan')}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LoanCard
              loan={item}
              onPress={() => navigation.navigate('LoanDetails', { loanId: item.id })}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </Screen>
  );
}
