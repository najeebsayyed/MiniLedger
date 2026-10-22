import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';
import { SearchX, AlertTriangle } from 'lucide-react-native';
import { EmptyLedgerIllustration } from '../illustrations';

export type EmptyStateType = 'ledger' | 'filter' | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  type = 'ledger',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  let defaultIcon: React.ReactNode = null;
  let defaultTitle = 'Your ledger is clean';
  let defaultDesc =
    'When you lend money to friends or family, add a loan here to remember who owes what.';
  let defaultAction = 'Add your first loan';

  if (type === 'filter') {
    defaultIcon = (
      <View className="w-16 h-16 rounded-full bg-surface-muted items-center justify-center mb-4">
        <SearchX size={36} color="#68756E" strokeWidth={1.5} />
      </View>
    );
    defaultTitle = 'No loans match this view';
    defaultDesc = 'Try changing the filter or clearing the search query.';
    defaultAction = 'Show all loans';
  } else if (type === 'error') {
    defaultIcon = (
      <View className="w-16 h-16 rounded-full bg-overdue-surface items-center justify-center mb-4">
        <AlertTriangle size={36} color="#C94E42" strokeWidth={1.5} />
      </View>
    );
    defaultTitle = 'Couldn’t load data';
    defaultDesc =
      'There was a problem communicating with the server. Check your connection and try again.';
    defaultAction = 'Retry';
  } else {
    defaultIcon = (
      <View className="mb-4">
        <EmptyLedgerIllustration width={180} height={140} />
      </View>
    );
  }

  const finalTitle = title || defaultTitle;
  const finalDesc = description || defaultDesc;
  const finalAction = actionLabel || defaultAction;

  return (
    <View className="items-center justify-center p-6 my-4">
      {defaultIcon}
      <Text className="text-lg font-bold text-text-primary text-center mb-2">
        {finalTitle}
      </Text>
      <Text className="text-sm text-text-secondary text-center max-w-[280px] leading-5 mb-6">
        {finalDesc}
      </Text>
      {onAction ? (
        <Button
          label={finalAction}
          onPress={onAction}
          variant={type === 'error' ? 'outline' : 'primary'}
          size="md"
        />
      ) : null}
    </View>
  );
}
