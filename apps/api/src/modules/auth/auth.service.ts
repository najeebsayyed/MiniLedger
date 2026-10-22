import crypto from 'crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/error-handler.js';
import { createAccessToken } from '../../lib/tokens.js';
import * as authRepo from './auth.repository.js';

export async function requestOtp(phoneNumber: string) {
  if (env.OTP_MODE === 'mock' && env.NODE_ENV === 'production') {
    throw new AppError(
      503,
      'MOCK_OTP_DISABLED',
      'Mock OTP authentication is disabled in production.'
    );
  }

  // Check recent challenge to enforce 60s throttle
  const latest = await authRepo.getLatestOtpChallenge(phoneNumber);
  if (latest) {
    const elapsedSeconds = (Date.now() - new Date(latest.createdAt).getTime()) / 1000;
    if (elapsedSeconds < 60) {
      const waitTime = Math.ceil(60 - elapsedSeconds);
      throw new AppError(
        429,
        'RATE_LIMITED',
        `Please wait ${waitTime} seconds before requesting another code.`
      );
    }
  }

  // Generate cryptographically secure 6-digit code
  const otpNumber = crypto.randomInt(0, 1000000);
  const otpCode = otpNumber.toString().padStart(6, '0');

  // Store hashed OTP challenge (5 min expiry)
  await authRepo.createOtpChallenge(phoneNumber, otpCode, 5);

  // In mock mode and dev/test, log to server console
  if (env.OTP_MODE === 'mock' && env.NODE_ENV !== 'production') {
    const masked = authRepo.maskPhoneNumber(phoneNumber);
    console.log(
      `\n=======================================================\n` +
      `🔑 [MINILEDGER DEMO OTP]\n` +
      `📱 Phone: ${masked}\n` +
      `👉 Code:  ${otpCode}\n` +
      `⏳ Valid for 5 minutes\n` +
      `=======================================================\n`
    );
  }

  return {
    message: 'A demo verification code was generated. Check the development server log.',
    expiresInSeconds: 300,
    resendAfterSeconds: 60,
  };
}

export async function verifyOtp(phoneNumber: string, otp: string) {
  const challenge = await authRepo.getLatestOtpChallenge(phoneNumber);

  if (!challenge) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'That code is incorrect or has expired. Try again.'
    );
  }

  if (challenge.consumedAt) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'That code has already been used. Please request a new one.'
    );
  }

  const now = new Date();
  if (now > new Date(challenge.expiresAt)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'That code is incorrect or has expired. Try again.'
    );
  }

  if (challenge.attemptCount >= 5) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Too many failed attempts. Please request a new code.'
    );
  }

  const expectedHash = authRepo.hashOtp(otp);
  if (expectedHash !== challenge.codeHash) {
    // Increment attempts
    await authRepo.updateOtpChallenge(challenge.id, {
      attemptCount: challenge.attemptCount + 1,
    });
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'That code is incorrect or has expired. Try again.'
    );
  }

  // Atomically mark challenge consumed
  await authRepo.updateOtpChallenge(challenge.id, {
    consumedAt: now,
  });

  // Find or create user
  const user = await authRepo.findOrCreateUser(phoneNumber);

  // Issue 7-day token
  const expiresInSeconds = 604800; // 7 days
  const accessToken = await createAccessToken(
    {
      userId: user.id,
      phoneNumber: user.phoneNumber,
    },
    expiresInSeconds
  );

  return {
    accessToken,
    tokenType: 'Bearer' as const,
    expiresInSeconds,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name ?? null,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt.toISOString(),
    },
  };
}

export async function updateProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string | null }
) {
  const updated = await authRepo.updateUserProfile(userId, data);
  if (!updated) {
    throw new AppError(404, 'NOT_FOUND', 'User not found.');
  }

  return {
    id: updated.id,
    phoneNumber: updated.phoneNumber,
    name: updated.name ?? null,
    avatarUrl: updated.avatarUrl ?? null,
    createdAt: updated.createdAt.toISOString(),
  };
}
