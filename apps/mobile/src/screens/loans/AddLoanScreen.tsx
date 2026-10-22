import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/navigation-types';
import { Screen } from '../../components/ui/Screen';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useCreateLoan } from '../../features/loans/hooks';
import { uploadReceiptApi } from '../../features/loans/api';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatFriendlyDate, getTodayDateString } from '../../utils/dates';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Receipt,
  Camera,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Upload,
} from 'lucide-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'AddLoan'>;

export function AddLoanScreen({ navigation }: Props) {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());

  // Receipt state
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [receiptPreviewUri, setReceiptPreviewUri] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Image selection modal action
  const handlePickReceipt = () => {
    Alert.alert(
      'Attach Receipt',
      'Choose how you want to attach your bill or transfer screenshot:',
      [
        {
          text: 'Choose from Gallery',
          onPress: () => openPicker('gallery'),
        },
        {
          text: 'Take Photo',
          onPress: () => openPicker('camera'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openPicker = async (source: 'gallery' | 'camera') => {
    try {
      const options = {
        mediaType: 'photo' as const,
        quality: 0.7 as const,
        maxWidth: 1200,
        maxHeight: 1200,
        includeBase64: true,
      };

      const response =
        source === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (response.didCancel) return;

      if (response.errorCode) {
        if (response.errorCode === 'permission') {
          Alert.alert(
            'Permission Denied',
            'Permission to access your photos/camera was denied. Please update app permissions in device settings.'
          );
        } else {
          Alert.alert('Error', response.errorMessage || 'Failed to capture or select image.');
        }
        return;
      }

      const asset = response.assets?.[0];
      if (asset) {
        const uri = asset.uri || null;
        const base64 = asset.base64
          ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
          : null;

        setReceiptPreviewUri(uri);
        setReceiptBase64(base64);
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred while picking image.');
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptPreviewUri(null);
    setReceiptBase64(null);
  };

  const handleSave = async () => {
    if (isSubmitting || createLoanMutation.isPending) return;

    const newErrors: { friendName?: string; amount?: string; general?: string } = {};

    // 1. Friend Name Validation
    const trimmedName = friendName.trim();
    if (!trimmedName) {
      newErrors.friendName = 'Friend’s name is required.';
    } else if (trimmedName.length > 80) {
      newErrors.friendName = 'Name must be 80 characters or fewer.';
    }

    // 2. Amount Validation (positive decimal, max 2 decimal places)
    const trimmedAmount = amount.trim();
    const decimalAmountRegex = /^(?!0(\.00?)?$)\d+(\.\d{1,2})?$/;
    const numAmount = parseFloat(trimmedAmount);

    if (!trimmedAmount) {
      newErrors.amount = 'Amount is required.';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than ₹0.';
    } else if (!decimalAmountRegex.test(trimmedAmount)) {
      newErrors.amount = 'Enter a valid amount with up to two decimals (e.g. 500 or 500.50).';
    } else if (numAmount > 999999999.99) {
      newErrors.amount = 'Amount exceeds maximum allowable threshold.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let uploadedReceiptUrl: string | null = null;

      // Upload receipt first if one was chosen
      if (receiptBase64) {
        const uploadResult = await uploadReceiptApi(receiptBase64);
        uploadedReceiptUrl = uploadResult.receiptUrl;
      }

      await createLoanMutation.mutateAsync({
        friendName: trimmedName,
        amount: numAmount.toFixed(2),
        dueDate,
        receiptUrl: uploadedReceiptUrl,
      });

      navigation.goBack();
    } catch (err: any) {
      setErrors({
        general:
          err?.message ||
          'Could not save this loan record. Your entered details have been preserved—please try again.',
      });
    } finally {
      setIsSubmitting(false);
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
        <View className="mb-5">
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

        {/* Receipt Attachment Section */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 ml-1">
            Receipt / Proof (Optional)
          </Text>

          {receiptPreviewUri ? (
            /* Selected Receipt Preview Card */
            <View style={styles.receiptPreviewCard}>
              <Image source={{ uri: receiptPreviewUri }} style={styles.receiptThumbnail} />

              <View style={styles.receiptDetails}>
                <View style={styles.attachedPill}>
                  <CheckCircle2 size={12} color="#15803D" />
                  <Text style={styles.attachedPillText}>Receipt Attached</Text>
                </View>
                <Text style={styles.receiptFileName} numberOfLines={1}>
                  Image ready for secure upload
                </Text>

                <View style={styles.receiptActionRow}>
                  <TouchableOpacity
                    onPress={handlePickReceipt}
                    style={styles.receiptSmallButton}
                    activeOpacity={0.7}
                  >
                    <RefreshCw size={12} color="#153E35" />
                    <Text style={styles.receiptSmallButtonText}>Replace</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRemoveReceipt}
                    style={[styles.receiptSmallButton, styles.removeButton]}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={12} color="#DC2626" />
                    <Text style={[styles.receiptSmallButtonText, styles.removeButtonText]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            /* Empty Attachment Placeholder Area */
            <TouchableOpacity
              onPress={handlePickReceipt}
              style={styles.attachmentPlaceholder}
              activeOpacity={0.7}
            >
              <View style={styles.uploadIconCircle}>
                <Receipt size={20} color="#153E35" />
              </View>
              <Text style={styles.uploadPromptTitle}>Attach Receipt or Bill</Text>
              <Text style={styles.uploadPromptSubtitle}>
                Add a payment screenshot, bill, or receipt photo (Max 5MB)
              </Text>
              <View style={styles.addReceiptBadge}>
                <Camera size={13} color="#153E35" style={{ marginRight: 4 }} />
                <Text style={styles.addReceiptBadgeText}>+ Add Receipt</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Button
          label="Save loan"
          onPress={handleSave}
          variant="primary"
          size="lg"
          loading={isSubmitting || createLoanMutation.isPending}
          className="mt-2"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  attachmentPlaceholder: {
    borderWidth: 1.5,
    borderColor: '#D8E2D5',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F8FAF6',
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2EBDC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadPromptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#153E35',
    marginBottom: 2,
  },
  uploadPromptSubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
  },
  addReceiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8F36A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addReceiptBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#153E35',
  },
  receiptPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  receiptThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 14,
  },
  receiptDetails: {
    flex: 1,
  },
  attachedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  attachedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 4,
  },
  receiptFileName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  receiptActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptSmallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
  },
  receiptSmallButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#153E35',
    marginLeft: 4,
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
  },
  removeButtonText: {
    color: '#DC2626',
  },
});
