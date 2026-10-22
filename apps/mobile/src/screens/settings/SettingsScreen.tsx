import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  User,
  Camera,
  Trash2,
  Edit3,
  Phone,
  ShieldCheck,
  Check,
  X,
  ChevronRight,
  Info,
  Lock,
  LogOut,
  Coins,
  Globe,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../features/auth/AuthContext';
import { saveUserAvatar, getUserAvatar } from '../../lib/secure-storage';
import { colors } from '../../theme/colors';

export function SettingsScreen() {
  const { user, signOut, updateProfile, resetOnboardingState } = useAuth();

  // Local state
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Profile Edit form state
  const [displayNameInput, setDisplayNameInput] = useState(user?.name || '');
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Sync avatar from local storage or user object on mount
  useEffect(() => {
    async function loadAvatar() {
      if (user?.avatarUrl) {
        setAvatarUri(user.avatarUrl);
      } else {
        const storedAvatar = await getUserAvatar();
        if (storedAvatar) {
          setAvatarUri(storedAvatar);
        }
      }
    }
    loadAvatar();
  }, [user?.avatarUrl]);

  const handleOpenEditModal = () => {
    setDisplayNameInput(user?.name || '');
    setPendingAvatarUri(avatarUri);
    setNameError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setNameError(null);
  };

  // Image picker handler
  const handlePickPhoto = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 400,
        maxHeight: 400,
        includeBase64: true,
      });

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        if (response.errorCode === 'permission') {
          Alert.alert(
            'Permission Denied',
            'MiniLedger needs access to your photo library to set a profile photo. Please enable photo permissions in device settings.'
          );
        } else {
          Alert.alert('Error', response.errorMessage || 'Failed to select image.');
        }
        return;
      }

      const asset = response.assets?.[0];
      if (asset) {
        // Construct durable base64 data URI to prevent temporary file expiry
        const uri = asset.base64
          ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri || null;

        if (uri) {
          setPendingAvatarUri(uri);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred while selecting a photo.');
    }
  };

  const handleRemovePhoto = () => {
    setPendingAvatarUri(null);
  };

  const handleSaveProfile = async () => {
    const trimmedName = displayNameInput.trim();
    if (!trimmedName) {
      setNameError('Please enter a valid display name.');
      return;
    }
    if (trimmedName.length > 50) {
      setNameError('Name must be 50 characters or fewer.');
      return;
    }

    try {
      setIsSaving(true);
      setNameError(null);

      // Persist to backend
      await updateProfile({
        name: trimmedName,
        avatarUrl: pendingAvatarUri,
      });

      // Persist avatar to durable local device storage
      await saveUserAvatar(pendingAvatarUri);
      setAvatarUri(pendingAvatarUri);

      setIsEditModalOpen(false);
      Alert.alert('Profile Updated', 'Your profile details have been saved.');
    } catch (err: any) {
      setNameError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of MiniLedger? Your active session token and cached ledger records will be securely cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Replay Product Tour',
      'This will reset your onboarding state. Next time you sign out or reopen the app, the 4-slide introductory tour will be shown.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Tour',
          onPress: async () => {
            await resetOnboardingState();
            Alert.alert(
              'Tour Reset',
              'Onboarding walkthrough has been reset. You will see it on your next login.'
            );
          },
        },
      ]
    );
  };

  // Format phone number nicely (e.g. +91 98765 43210)
  const formatPhone = (rawPhone?: string) => {
    if (!rawPhone) return '+91 ••••• •••••';
    if (rawPhone.startsWith('+91') && rawPhone.length === 13) {
      return `${rawPhone.slice(0, 3)} ${rawPhone.slice(3, 8)} ${rawPhone.slice(8)}`;
    }
    return rawPhone;
  };

  // Initials generator
  const getInitials = (name?: string | null, phone?: string) => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      return digits.length >= 2 ? digits.slice(-2) : 'ML';
    }
    return 'ML';
  };

  return (
    <Screen scrollable={true} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        <Text style={styles.headerSubtitle}>
          Manage your personal profile and account settings
        </Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileTopRow}>
          {/* Avatar with click-to-edit action */}
          <TouchableOpacity
            onPress={handleOpenEditModal}
            activeOpacity={0.8}
            style={styles.avatarWrapper}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.name, user?.phoneNumber)}
                </Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Camera size={13} color="#153E35" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Personal Account'}
            </Text>

            <View style={styles.phoneRow}>
              <Phone size={13} color="#64748B" />
              <Text style={styles.userPhone}>
                {formatPhone(user?.phoneNumber)}
              </Text>
            </View>

            <View style={styles.verifiedRow}>
              <View style={styles.verifiedPill}>
                <ShieldCheck size={12} color="#15803D" />
                <Text style={styles.verifiedPillText}>Verified Account</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Profile CTA */}
        <TouchableOpacity
          onPress={handleOpenEditModal}
          style={styles.editProfileButton}
          activeOpacity={0.7}
        >
          <Edit3 size={15} color="#153E35" />
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Account Settings Menu */}
      <Text style={styles.sectionTitle}>ACCOUNT & PREFERENCES</Text>
      <View style={styles.menuBox}>
        {/* Edit Profile Row */}
        <TouchableOpacity
          onPress={handleOpenEditModal}
          style={styles.menuRow}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#F0FDF4' }]}>
            <User size={18} color="#15803D" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Personal Information</Text>
            <Text style={styles.menuValue}>
              {user?.name ? user.name : 'Set display name and photo'}
            </Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Currency Row */}
        <View style={[styles.menuRow, styles.rowBorder]}>
          <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Coins size={18} color="#B45309" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Default Currency</Text>
            <Text style={styles.menuValue}>₹ INR — Indian Rupee</Text>
          </View>
          <View style={styles.fixedPill}>
            <Text style={styles.fixedPillText}>Default</Text>
          </View>
        </View>

        {/* Replay Onboarding */}
        <TouchableOpacity
          onPress={handleResetOnboarding}
          style={[styles.menuRow, styles.rowBorder]}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#F0F9FF' }]}>
            <RotateCcw size={18} color="#0284C7" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Replay Product Tour</Text>
            <Text style={styles.menuValue}>View the 4-slide onboarding guide again</Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Security & Privacy */}
      <Text style={styles.sectionTitle}>SECURITY & PRIVACY</Text>
      <View style={styles.menuBox}>
        {/* Security Info */}
        <TouchableOpacity
          onPress={() => setIsSecurityModalOpen(true)}
          style={styles.menuRow}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#F5F3FF' }]}>
            <Lock size={18} color="#7C3AED" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Session & Security</Text>
            <Text style={styles.menuValue}>Encrypted Keychain & Phone Verification</Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* About MiniLedger */}
        <TouchableOpacity
          onPress={() => setIsAboutModalOpen(true)}
          style={[styles.menuRow, styles.rowBorder]}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#F1F5F9' }]}>
            <Info size={18} color="#475569" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>About MiniLedger</Text>
            <Text style={styles.menuValue}>Version 1.0.0 • Calm Loan Tracker</Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutWrapper}>
        <Button
          label="Sign Out"
          onPress={handleLogout}
          variant="destructive"
          size="lg"
          icon={<LogOut size={18} color="#FFFFFF" />}
        />
      </View>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={handleCloseEditModal}
                style={styles.modalCloseButton}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Photo Avatar Preview & Actions */}
              <View style={styles.modalAvatarSection}>
                <View style={styles.modalAvatarContainer}>
                  {pendingAvatarUri ? (
                    <Image
                      source={{ uri: pendingAvatarUri }}
                      style={styles.modalAvatarImage}
                    />
                  ) : (
                    <View style={styles.modalAvatarPlaceholder}>
                      <Text style={styles.modalAvatarText}>
                        {getInitials(displayNameInput || user?.name, user?.phoneNumber)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.photoActionsRow}>
                  <TouchableOpacity
                    onPress={handlePickPhoto}
                    style={styles.photoActionButton}
                    activeOpacity={0.7}
                  >
                    <Camera size={14} color="#153E35" />
                    <Text style={styles.photoActionText}>
                      {pendingAvatarUri ? 'Change Photo' : 'Choose Photo'}
                    </Text>
                  </TouchableOpacity>

                  {pendingAvatarUri && (
                    <TouchableOpacity
                      onPress={handleRemovePhoto}
                      style={[styles.photoActionButton, styles.removePhotoButton]}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color="#DC2626" />
                      <Text style={[styles.photoActionText, styles.removePhotoText]}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Display Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    nameError ? styles.textInputError : undefined,
                  ]}
                  value={displayNameInput}
                  onChangeText={(val) => {
                    setDisplayNameInput(val);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="e.g., Arjun Mehta"
                  placeholderTextColor="#94A3B8"
                  maxLength={50}
                  autoCapitalize="words"
                />
                {nameError ? (
                  <Text style={styles.errorText}>{nameError}</Text>
                ) : (
                  <Text style={styles.helperText}>
                    This name will appear on your financial dashboard and receipts.
                  </Text>
                )}
              </View>

              {/* Read-Only Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.readOnlyPhoneBox}>
                  <Lock size={15} color="#94A3B8" style={{ marginRight: 8 }} />
                  <Text style={styles.readOnlyPhoneText}>
                    {formatPhone(user?.phoneNumber)}
                  </Text>
                  <View style={styles.verifiedSmallBadge}>
                    <Text style={styles.verifiedSmallBadgeText}>Verified</Text>
                  </View>
                </View>
                <Text style={styles.helperText}>
                  Your phone number is cryptographically linked to your session.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  onPress={handleCloseEditModal}
                  disabled={isSaving}
                  style={styles.cancelButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                  style={styles.saveButton}
                  activeOpacity={0.7}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#153E35" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ABOUT MODAL */}
      <Modal
        visible={isAboutModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsAboutModalOpen(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalCard}>
            <View style={styles.infoModalHeader}>
              <Sparkles size={24} color="#153E35" />
              <Text style={styles.infoModalTitle}>About MiniLedger</Text>
            </View>
            <Text style={styles.infoModalBody}>
              MiniLedger is designed for personal peer-to-peer lending with calm clarity. It helps you keep track of money lent to friends, monitor repayment progress, and eliminate awkward conversations about unpaid loans.
            </Text>
            <View style={styles.infoModalDivider} />
            <Text style={styles.infoModalVersion}>Version 1.0.0 (Production Release)</Text>
            <TouchableOpacity
              onPress={() => setIsAboutModalOpen(false)}
              style={styles.infoModalCloseButton}
            >
              <Text style={styles.infoModalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SECURITY MODAL */}
      <Modal
        visible={isSecurityModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSecurityModalOpen(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalCard}>
            <View style={styles.infoModalHeader}>
              <ShieldCheck size={24} color="#15803D" />
              <Text style={styles.infoModalTitle}>Security & Privacy</Text>
            </View>
            <Text style={styles.infoModalBody}>
              • Passwordless phone verification with single-use challenges.{'\n'}
              • Cryptographic JWT access tokens stored in native hardware-backed Keychains.{'\n'}
              • All ledger records and financial totals are strictly user-isolated.{'\n'}
              • Exact decimal calculations ensure financial accounting precision without floating-point drift.
            </Text>
            <TouchableOpacity
              onPress={() => setIsSecurityModalOpen(false)}
              style={styles.infoModalCloseButton}
            >
              <Text style={styles.infoModalCloseText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#D8F36A',
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#153E35',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D8F36A',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D8F36A',
    letterSpacing: -0.5,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D8F36A',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  verifiedRow: {
    marginTop: 6,
    flexDirection: 'row',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 4,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAF6',
    borderWidth: 1,
    borderColor: '#D8E2D5',
    paddingVertical: 10,
    borderRadius: 12,
  },
  editProfileButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#153E35',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuValue: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  fixedPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fixedPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  signOutWrapper: {
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalAvatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalAvatarContainer: {
    marginBottom: 12,
  },
  modalAvatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#D8F36A',
  },
  modalAvatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#153E35',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#D8F36A',
  },
  modalAvatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#D8F36A',
  },
  photoActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  photoActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#153E35',
    marginLeft: 6,
  },
  removePhotoButton: {
    backgroundColor: '#FEE2E2',
  },
  removePhotoText: {
    color: '#DC2626',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAF6',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  readOnlyPhoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readOnlyPhoneText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  verifiedSmallBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedSmallBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '600',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#D8F36A',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#153E35',
  },
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 10,
  },
  infoModalBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoModalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  infoModalVersion: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoModalCloseButton: {
    backgroundColor: '#153E35',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoModalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D8F36A',
  },
});
