import { describe, it, expect } from 'vitest';
import {
  createLoanSchema,
  decimalAmountRegex,
  dateOnlyRegex,
  requestOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
  e164Regex,
  otpRegex,
} from '@miniledger/contracts';

describe('Contracts & Input Validation Boundary Tests', () => {
  describe('requestOtpSchema & Phone Validation', () => {
    it('accepts valid E.164 phone numbers', () => {
      expect(requestOtpSchema.safeParse({ phoneNumber: '+919876543210' }).success).toBe(true);
      expect(requestOtpSchema.safeParse({ phoneNumber: '+14155552671' }).success).toBe(true);
    });

    it('rejects invalid or incomplete phone numbers without country code', () => {
      expect(requestOtpSchema.safeParse({ phoneNumber: '9876543210' }).success).toBe(false);
      expect(requestOtpSchema.safeParse({ phoneNumber: '123' }).success).toBe(false);
      expect(requestOtpSchema.safeParse({ phoneNumber: 'abcdefghij' }).success).toBe(false);
      expect(requestOtpSchema.safeParse({ phoneNumber: '' }).success).toBe(false);
    });
  });

  describe('verifyOtpSchema & OTP Code Validation', () => {
    it('accepts valid phone and exactly 6-digit numeric OTP', () => {
      expect(verifyOtpSchema.safeParse({ phoneNumber: '+919876543210', otp: '123456' }).success).toBe(true);
    });

    it('rejects codes that are not 6 digits or contain non-digits', () => {
      expect(verifyOtpSchema.safeParse({ phoneNumber: '+919876543210', otp: '12345' }).success).toBe(false);
      expect(verifyOtpSchema.safeParse({ phoneNumber: '+919876543210', otp: '1234567' }).success).toBe(false);
      expect(verifyOtpSchema.safeParse({ phoneNumber: '+919876543210', otp: '12345a' }).success).toBe(false);
    });
  });

  describe('updateProfileSchema & Profile Validation', () => {
    it('validates name length up to 60 characters', () => {
      expect(updateProfileSchema.safeParse({ name: 'Valid Name' }).success).toBe(true);
      expect(updateProfileSchema.safeParse({ name: '   ' }).success).toBe(false);
      expect(updateProfileSchema.safeParse({ name: 'A'.repeat(61) }).success).toBe(false);
    });

    it('allows valid base64 or url avatarUrl strings', () => {
      expect(updateProfileSchema.safeParse({ avatarUrl: 'data:image/jpeg;base64,abc123==' }).success).toBe(true);
      expect(updateProfileSchema.safeParse({ avatarUrl: null }).success).toBe(true);
    });
  });

  describe('createLoanSchema Validation & Financial Boundaries', () => {
    it('accepts valid loan details with 2 decimal places', () => {
      const result = createLoanSchema.safeParse({
        friendName: 'Aarav Sharma',
        amount: '1250.50',
        dueDate: '2026-11-15',
        receiptUrl: null,
      });
      expect(result.success).toBe(true);
    });

    it('rejects amounts with more than 2 decimal places', () => {
      const result = createLoanSchema.safeParse({
        friendName: 'Aarav Sharma',
        amount: '1250.555',
        dueDate: '2026-11-15',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('up to two decimals');
      }
    });

    it('rejects zero and negative amounts', () => {
      expect(createLoanSchema.safeParse({
        friendName: 'Aarav',
        amount: '0',
        dueDate: '2026-11-15',
      }).success).toBe(false);

      expect(createLoanSchema.safeParse({
        friendName: 'Aarav',
        amount: '0.00',
        dueDate: '2026-11-15',
      }).success).toBe(false);

      expect(createLoanSchema.safeParse({
        friendName: 'Aarav',
        amount: '-500',
        dueDate: '2026-11-15',
      }).success).toBe(false);
    });

    it('rejects empty friend name or whitespace-only name', () => {
      expect(createLoanSchema.safeParse({
        friendName: '   ',
        amount: '500',
        dueDate: '2026-11-15',
      }).success).toBe(false);
    });

    it('rejects names exceeding 80 characters', () => {
      const longName = 'A'.repeat(81);
      const result = createLoanSchema.safeParse({
        friendName: longName,
        amount: '500',
        dueDate: '2026-11-15',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('80 characters or fewer');
      }
    });

    it('rejects invalid date formats', () => {
      expect(createLoanSchema.safeParse({
        friendName: 'Aarav',
        amount: '500',
        dueDate: '15-11-2026',
      }).success).toBe(false);
    });

    it('allows receiptUrl to be null, undefined, or a valid receipt path', () => {
      expect(createLoanSchema.safeParse({
        friendName: 'Aarav',
        amount: '500',
        dueDate: '2026-11-15',
        receiptUrl: '/api/v1/loans/receipts/receipt-123.jpg',
      }).success).toBe(true);
    });
  });

  describe('Regex Boundary Helpers', () => {
    it('validates decimal amount regex correctly', () => {
      expect(decimalAmountRegex.test('100')).toBe(true);
      expect(decimalAmountRegex.test('100.5')).toBe(true);
      expect(decimalAmountRegex.test('100.50')).toBe(true);
      expect(decimalAmountRegex.test('100.505')).toBe(false);
      expect(decimalAmountRegex.test('0')).toBe(false);
      expect(decimalAmountRegex.test('0.00')).toBe(false);
      expect(decimalAmountRegex.test('-10')).toBe(false);
      expect(decimalAmountRegex.test('abc')).toBe(false);
    });

    it('validates YYYY-MM-DD date regex correctly', () => {
      expect(dateOnlyRegex.test('2026-10-22')).toBe(true);
      expect(dateOnlyRegex.test('2026/10/22')).toBe(false);
      expect(dateOnlyRegex.test('22-10-2026')).toBe(false);
    });
  });
});
