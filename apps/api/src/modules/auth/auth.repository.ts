import { db } from '../../db/client.js';
import { users, otpChallenges } from '../../db/schema/index.js';
import { eq, desc, and } from 'drizzle-orm';
import crypto from 'crypto';

export function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function maskPhoneNumber(phone: string): string {
  if (phone.length <= 5) return '***';
  return phone.slice(0, 3) + '*****' + phone.slice(-4);
}

export async function createOtpChallenge(phoneNumber: string, code: string, expiresInMinutes: number = 5) {
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const [record] = await db
    .insert(otpChallenges)
    .values({
      phoneNumber,
      codeHash,
      expiresAt,
      attemptCount: 0,
    })
    .returning();

  return record;
}

export async function getLatestOtpChallenge(phoneNumber: string) {
  const [record] = await db
    .select()
    .from(otpChallenges)
    .where(eq(otpChallenges.phoneNumber, phoneNumber))
    .orderBy(desc(otpChallenges.createdAt))
    .limit(1);

  return record || null;
}

export async function incrementOtpAttempt(id: string) {
  await db
    .update(otpChallenges)
    .set({
      attemptCount: db.$count(otpChallenges, eq(otpChallenges.id, id)), // will be incremented
    })
    .where(eq(otpChallenges.id, id));
}

export async function updateOtpChallenge(
  id: string,
  data: { attemptCount?: number; consumedAt?: Date }
) {
  const [record] = await db
    .update(otpChallenges)
    .set(data)
    .where(eq(otpChallenges.id, id))
    .returning();

  return record;
}

export async function findOrCreateUser(phoneNumber: string) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, phoneNumber))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      phoneNumber,
    })
    .returning();

  return newUser;
}

export async function updateUserProfile(
  id: string,
  data: { name?: string; avatarUrl?: string | null }
) {
  const [record] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return record || null;
}

export async function getUserById(id: string) {
  const [record] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return record || null;
}
