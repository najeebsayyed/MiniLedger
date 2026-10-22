import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/navigation-types';
import { Screen } from '../../components/ui/Screen';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useCreateLoan } from '../../features/loans/hooks';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatFriendlyDate, getTodayDateString } from '../../utils/dates';
import { ArrowLeft, Calendar as CalendarIcon, Check } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'AddLoan'>;

export function AddLoanScreen({ navigation }: Props) {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  const [errors, setErrors] = useState<{
    friendName?: string;
    amount?: string;
    general?: string;
  }>({});

  const createLoanMutation = useCreateLoan();

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      setDueDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  const setDatePreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDateObj(d);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSave = async () => {
    const newErrors: { friendName?: string; amount?: string; general?: string } = {};

    const trimmedName = friendName.trim();
    if (!trimmedName) {
      newErrors.friendName = 'Add your friend’s name.';
    } else if (trimmedName.length > 80) {
      newErrors.friendName = 'Name must be 80 characters or fewer.';
    }

    const trimmedAmount = amount.trim();
    const numAmount = parseFloat(trimmedAmount);
    if (!trimmedAmount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Enter an amount greater than ₹0.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      await createLoanMutation.mutateAsync({
        friendName: trimmedName,
        amount: numAmount.toFixed(2),
        dueDate,
      });
      navigation.goBack();
    } catch (err: any) {
      setErrors({
        general:
          err?.message ||
          'Couldn’t save this loan. Your details are still here—try again.',
      });
    }
  };

  return (
    <Screen scrollable contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      {/* Back button & Title */}
      <View className="flex-row items-center mb-6">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center mr-3"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={18} color="#153E35" />
        </Pressable>
        <View>
          <Text className="text-2xl font-extrabold text-text-primary">
            Add a loan
          </Text>
          <Text className="text-xs text-text-secondary">
            Keep track of who owes what
          </Text>
        </View>
      </View>

      {/* Form Card */}
      <View className="bg-surface rounded-card p-6 border border-border shadow-sm mb-6">
        {errors.general ? (
          <View className="p-3 mb-4 rounded-xl bg-overdue-surface border border-overdue/20">
            <Text className="text-xs font-semibold text-overdue">
              {errors.general}
            </Text>
          </View>
        ) : null}

        {/* Friend Name */}
        <TextField
          label="Friend's Name"
          placeholder="e.g. Aarav Sharma"
          value={friendName}
          onChangeText={(val) => {
            setFriendName(val);
            if (errors.friendName) setErrors((prev) => ({ ...prev, friendName: undefined }));
          }}
          error={errors.friendName}
          autoCapitalize="words"
          autoFocus
        />

        {/* Amount */}
        <TextField
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChangeText={(val) => {
            setAmount(val);
            if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
          }}
          keyboardType="decimal-pad"
          error={errors.amount}
          prefix={
            <Text className="text-lg font-bold text-brand mr-1">₹</Text>
          }
        />

        {/* Due Date Picker Row */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
            Due Date
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between border border-border rounded-input px-3.5 py-3.5 bg-surface active:bg-surface-muted"
          >
            <View className="flex-row items-center">
              <CalendarIcon size={18} color="#153E35" className="mr-2.5" />
              <Text className="text-base font-bold text-text-primary">
                {formatFriendlyDate(dueDate)}
              </Text>
              <Text className="text-xs text-text-secondary ml-2 font-medium">
                ({dueDate})
              </Text>
            </View>
            <Text className="text-xs font-bold text-brand">Change</Text>
          </Pressable>

          {/* Quick presets */}
          <View className="flex-row mt-2.5 space-x-2">
            <Pressable
              onPress={() => setDatePreset(0)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border mr-2"
            >
              <Text className="text-xs font-medium text-text-secondary">Today</Text>
            </Pressable>
            <Pressable
              onPress={() => setDatePreset(7)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border mr-2"
            >
              <Text className="text-xs font-medium text-text-secondary">In 1 week</Text>
            </Pressable>
            <Pressable
              onPress={() => setDatePreset(30)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-muted border border-border mr-2"
            >
              <Text className="text-xs font-medium text-text-secondary">In 1 month</Text>
            </Pressable>
            <Pressable
              onPress={() => setDatePreset(-7)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200"
            >
              <Text className="text-xs font-semibold text-amber-900">Past (Overdue)</Text>
            </Pressable>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        <Button
          label="Save loan"
          onPress={handleSave}
          variant="primary"
          size="lg"
          loading={createLoanMutation.isPending}
          className="mt-4"
        />
      </View>
    </Screen>
  );
}
