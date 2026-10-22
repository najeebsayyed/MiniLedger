import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
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
  Eye,
  Trash2,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/navigation-types';
import { useLoan, useRepayLoan, useAttachReceipt, useRemoveReceipt } from '../../features/loans/hooks';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { formatCurrency } from '../../utils/currency';
import { formatDisplayDate, formatRelativeDueDate } from '../../utils/dates';
import { getApiBaseUrl } from '../../lib/api-client';
import { getAuthToken } from '../../lib/secure-storage';
import { colors } from '../../theme/colors';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'LoanDetails'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function LoanDetailsScreen({ route, navigation }: Props) {
  const { loanId } = route.params;
  const { data: loan, isLoading, isError, refetch } = useLoan(loanId);
  const repayMutation = useRepayLoan();
  const attachReceiptMutation = useAttachReceipt();
  const removeReceiptMutation = useRemoveReceipt();

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadToken() {
      const token = await getAuthToken();
      setAuthToken(token);
    }
    loadToken();
  }, []);

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

  const handlePickNewReceipt = () => {
    Alert.alert(
      'Attach Receipt',
      'Choose source for receipt photo:',
      [
        {
          text: 'Choose from Gallery',
          onPress: () => attachImage('gallery'),
        },
        {
          text: 'Take Photo',
          onPress: () => attachImage('camera'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const attachImage = async (source: 'gallery' | 'camera') => {
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

      const asset = response.assets?.[0];
      if (asset?.base64) {
        const base64Data = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
        await attachReceiptMutation.mutateAsync({
          loanId,
          base64Data,
        });
        setImageError(false);
        setImageLoading(true);
        Alert.alert('Receipt Attached', 'Receipt was successfully added to this loan record.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not attach receipt image.');
    }
  };

  const handleRemoveReceipt = () => {
    Alert.alert(
      'Remove Receipt',
      'Are you sure you want to delete the attached receipt from this loan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeReceiptMutation.mutateAsync(loanId);
              setIsPreviewModalOpen(false);
              Alert.alert('Receipt Removed', 'The receipt attachment has been removed.');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not remove receipt.');
            }
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

  // Build safe receipt URL
  const apiBase = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
  const fullReceiptUri = loan.receiptUrl
    ? loan.receiptUrl.startsWith('http')
      ? loan.receiptUrl
      : `${apiBase}${loan.receiptUrl}`
    : null;

  return (
    <Screen scrollable={true} contentContainerStyle={{ paddingBottom: 60 }}>
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

      {/* Receipt Proof Section */}
      <View style={styles.receiptSection}>
        <View style={styles.receiptSectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Receipt size={16} color="#153E35" style={{ marginRight: 6 }} />
            <Text style={styles.receiptSectionTitle}>Payment Receipt / Proof</Text>
          </View>
          {fullReceiptUri && (
            <TouchableOpacity onPress={handleRemoveReceipt} style={styles.removeLink}>
              <Trash2 size={13} color="#DC2626" />
              <Text style={styles.removeLinkText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {fullReceiptUri ? (
          <TouchableOpacity
            onPress={() => setIsPreviewModalOpen(true)}
            style={styles.receiptCard}
            activeOpacity={0.8}
          >
            <View style={styles.thumbnailWrapper}>
              <Image
                source={{
                  uri: fullReceiptUri,
                  headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
                }}
                style={styles.thumbnailImage}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
              {imageLoading && (
                <View style={styles.thumbnailLoading}>
                  <ActivityIndicator size="small" color="#153E35" />
                </View>
              )}
              {imageError && (
                <View style={styles.thumbnailError}>
                  <AlertTriangle size={18} color="#DC2626" />
                </View>
              )}
            </View>

            <View style={styles.receiptCardInfo}>
              <Text style={styles.receiptCardTitle}>Attached Receipt</Text>
              <Text style={styles.receiptCardSubtitle}>Tap to open full image preview</Text>
              <View style={styles.viewBadge}>
                <Eye size={12} color="#153E35" style={{ marginRight: 4 }} />
                <Text style={styles.viewBadgeText}>View Receipt</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePickNewReceipt}
            style={styles.addReceiptEmptyCard}
            activeOpacity={0.7}
          >
            <Plus size={18} color="#153E35" style={{ marginRight: 6 }} />
            <Text style={styles.addReceiptEmptyText}>Attach a receipt photo or bill</Text>
          </TouchableOpacity>
        )}
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

      {/* FULL RECEIPT PREVIEW MODAL */}
      <Modal
        visible={isPreviewModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsPreviewModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          {/* Header Bar */}
          <View style={styles.modalTopBar}>
            <View>
              <Text style={styles.modalReceiptTitle}>Loan Receipt</Text>
              <Text style={styles.modalReceiptSubtitle}>
                {loan.friendName} • {formatCurrency(loan.amount)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsPreviewModalOpen(false)}
              style={styles.modalCloseBtn}
            >
              <X size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Image Container */}
          <View style={styles.modalImageContainer}>
            {fullReceiptUri && (
              <Image
                source={{
                  uri: fullReceiptUri,
                  headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
                }}
                style={styles.modalFullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  receiptSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  receiptSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#153E35',
  },
  removeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  removeLinkText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 3,
  },
  receiptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF6',
    borderWidth: 1,
    borderColor: '#D8E2D5',
    borderRadius: 14,
    padding: 10,
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E2EBDC',
    position: 'relative',
    marginRight: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  thumbnailError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  receiptCardInfo: {
    flex: 1,
  },
  receiptCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  receiptCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#D8F36A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  viewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#153E35',
  },
  addReceiptEmptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#F8FAF6',
  },
  addReceiptEmptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#153E35',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'space-between',
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  modalReceiptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalReceiptSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalFullImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT - 180,
  },
});
