import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app, cleanupDatabase, generateTestPhone } from './helpers/test-app.js';
import { db } from '../src/db/client.js';
import { otpChallenges } from '../src/db/schema/index.js';
import { eq } from 'drizzle-orm';
import { hashOtp } from '../src/modules/auth/auth.repository.js';

describe('Auth Endpoints & Business Rules', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('generates mock OTP, logs it, and does NOT return code in response', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const phone = generateTestPhone();

    const res = await request(app)
      .post('/api/v1/auth/request-otp')
      .send({ phoneNumber: phone });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.message).toContain('demo verification code was generated');
    expect(res.body.data.otp).toBeUndefined(); // Crucial: never in response!

    // Verify console output contains OTP
    const logCall = consoleSpy.mock.calls.find((call) =>
      call.some((arg) => typeof arg === 'string' && arg.includes('MINILEDGER DEMO OTP'))
    );
    expect(logCall).toBeDefined();
    consoleSpy.mockRestore();

    // Verify challenge in DB
    const [challenge] = await db
      .select()
      .from(otpChallenges)
      .where(eq(otpChallenges.phoneNumber, phone));
    expect(challenge).toBeDefined();
    expect(challenge.codeHash).toBeDefined();
    expect(challenge.attemptCount).toBe(0);
  });

  it('enforces 60-second rate limiting on repeated OTP requests for same phone', async () => {
    const phone = generateTestPhone();

    const firstRes = await request(app)
      .post('/api/v1/auth/request-otp')
      .send({ phoneNumber: phone });
    expect(firstRes.status).toBe(200);

    const secondRes = await request(app)
      .post('/api/v1/auth/request-otp')
      .send({ phoneNumber: phone });
    expect(secondRes.status).toBe(429);
    expect(secondRes.body.error.code).toBe('RATE_LIMITED');
  });

  it('verifies correct OTP, consumes challenge once, and returns bearer access token', async () => {
    const phone = generateTestPhone();
    const otp = '482910';

    // Insert challenge directly
    await db.insert(otpChallenges).values({
      phoneNumber: phone,
      codeHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attemptCount: 0,
    });

    const verifyRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: phone, otp });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.accessToken).toBeDefined();
    expect(verifyRes.body.data.tokenType).toBe('Bearer');
    expect(verifyRes.body.data.user.phoneNumber).toBe(phone);

    // Verify challenge was consumed
    const [challenge] = await db
      .select()
      .from(otpChallenges)
      .where(eq(otpChallenges.phoneNumber, phone));
    expect(challenge.consumedAt).not.toBeNull();

    // Repeated verification with consumed OTP fails
    const reVerifyRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: phone, otp });
    expect(reVerifyRes.status).toBe(400);
    expect(reVerifyRes.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects wrong OTP, increments attempts, and locks after 5 attempts', async () => {
    const phone = generateTestPhone();
    const realOtp = '123456';

    await db.insert(otpChallenges).values({
      phoneNumber: phone,
      codeHash: hashOtp(realOtp),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attemptCount: 4, // 4 failed attempts already
    });

    // 5th attempt with wrong code
    const failRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: phone, otp: '000000' });

    expect(failRes.status).toBe(400);

    // 6th attempt should hit maximum attempts limit
    const lockedRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: phone, otp: realOtp });

    expect(lockedRes.status).toBe(400);
    expect(lockedRes.body.error.message).toContain('Too many failed attempts');
  });

  it('rejects expired OTP', async () => {
    const phone = generateTestPhone();
    const otp = '123456';

    await db.insert(otpChallenges).values({
      phoneNumber: phone,
      codeHash: hashOtp(otp),
      expiresAt: new Date(Date.now() - 1000), // expired 1s ago
      attemptCount: 0,
    });

    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: phone, otp });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('incorrect or has expired');
  });

  it('protects /api/v1/auth/me requiring valid Bearer token', async () => {
    // Missing token
    const unauthRes = await request(app).get('/api/v1/auth/me');
    expect(unauthRes.status).toBe(401);
    expect(unauthRes.body.error.code).toBe('UNAUTHENTICATED');

    // Valid token
    const phone = generateTestPhone();
    const otp = '999999';
    await db.insert(otpChallenges).values({
      phoneNumber: phone,
      codeHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attemptCount: 0,
    });

    const verifyRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: phone, otp });

    const token = verifyRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.phoneNumber).toBe(phone);
  });

  it('updates display name, validates input, and reflects in subsequent /me call', async () => {
    const phone = generateTestPhone();
    const otp = '888888';
    await db.insert(otpChallenges).values({
      phoneNumber: phone,
      codeHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attemptCount: 0,
    });

    const verifyRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: phone, otp });
    const token = verifyRes.body.data.accessToken;

    // Reject empty/whitespace name
    const invalidRes = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '   ' });
    expect(invalidRes.status).toBe(400);

    // Valid name update
    const updateRes = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rahul Sharma' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Rahul Sharma');
    expect(updateRes.body.data.phoneNumber).toBe(phone);

    // Verify /me now returns the updated name
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.name).toBe('Rahul Sharma');
  });

  it('accepts base64 profile pictures larger than 100kb without PayloadTooLargeError', async () => {
    const phone = generateTestPhone();
    const otp = '777777';
    await db.insert(otpChallenges).values({
      phoneNumber: phone,
      codeHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attemptCount: 0,
    });

    const verifyRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: phone, otp });
    const token = verifyRes.body.data.accessToken;

    // Construct a ~250KB base64 avatar string (larger than previous 100kb limit)
    const largeBase64Avatar = 'data:image/jpeg;base64,' + 'A'.repeat(250 * 1024);

    const updateRes = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Priya Patel',
        avatarUrl: largeBase64Avatar,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Priya Patel');
    expect(updateRes.body.data.avatarUrl).toBe(largeBase64Avatar);
  });
});
