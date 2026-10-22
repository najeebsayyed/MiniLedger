import { createApp } from '../../src/app.js';
import { db, pool } from '../../src/db/client.js';
import { users, loans, otpChallenges } from '../../src/db/schema/index.js';
import { createAccessToken } from '../../src/lib/tokens.js';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';

export const app = createApp();

export async function cleanupDatabase() {
  await db.execute(sql`TRUNCATE TABLE loans, otp_challenges, users CASCADE`);
}

export function generateTestPhone(): string {
  const randomSuffix = crypto.randomInt(1000000, 9999999).toString();
  return `+9198${randomSuffix}`;
}

export async function createTestUser(phoneNumber?: string) {
  const phone = phoneNumber || generateTestPhone();
  const [user] = await db
    .insert(users)
    .values({ phoneNumber: phone })
    .returning();

  const token = await createAccessToken({
    userId: user.id,
    phoneNumber: user.phoneNumber,
  });

  return { user, token };
}

export { pool };
