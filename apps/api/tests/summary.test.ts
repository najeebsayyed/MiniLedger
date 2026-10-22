import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, cleanupDatabase, createTestUser } from './helpers/test-app.js';
import { getBusinessDate } from '../src/lib/dates.js';

describe('Summary Calculations & Business Date Boundaries', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('returns zero values and zero counts for an empty ledger', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .get('/api/v1/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      currency: 'INR',
      totalLent: '0.00',
      totalRepaid: '0.00',
      outstandingAmount: '0.00',
      overdueAmount: '0.00',
      activeLoansCount: 0,
      repaidLoansCount: 0,
      overdueLoansCount: 0,
    });
  });

  it('calculates totals accurately using decimal math and handles repayment transitions', async () => {
    const { token } = await createTestUser();

    // 1. Create Loan 1: Active, ₹1000.50, due tomorrow
    await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Friend 1', amount: '1000.50', dueDate: '2099-12-31' });

    // 2. Create Loan 2: Active, ₹2000.25, due in past (overdue)
    const loan2Res = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Friend 2', amount: '2000.25', dueDate: '2026-01-01' });

    // Verify summary at this point:
    // Total lent: 3000.75
    // Total repaid: 0.00
    // Outstanding: 3000.75
    // Overdue: 2000.25
    let summaryRes = await request(app)
      .get('/api/v1/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(summaryRes.body.data.totalLent).toBe('3000.75');
    expect(summaryRes.body.data.totalRepaid).toBe('0.00');
    expect(summaryRes.body.data.outstandingAmount).toBe('3000.75');
    expect(summaryRes.body.data.overdueAmount).toBe('2000.25');
    expect(summaryRes.body.data.activeLoansCount).toBe(2);
    expect(summaryRes.body.data.overdueLoansCount).toBe(1);

    // Repay the overdue loan
    await request(app)
      .patch(`/api/v1/loans/${loan2Res.body.data.id}/repay`)
      .set('Authorization', `Bearer ${token}`);

    // Verify summary after repayment:
    // Total lent: 3000.75
    // Total repaid: 2000.25
    // Outstanding: 1000.50
    // Overdue: 0.00 (repaid loans do not contribute to overdue)
    summaryRes = await request(app)
      .get('/api/v1/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(summaryRes.body.data.totalLent).toBe('3000.75');
    expect(summaryRes.body.data.totalRepaid).toBe('2000.25');
    expect(summaryRes.body.data.outstandingAmount).toBe('1000.50');
    expect(summaryRes.body.data.overdueAmount).toBe('0.00');
    expect(summaryRes.body.data.activeLoansCount).toBe(1);
    expect(summaryRes.body.data.repaidLoansCount).toBe(1);
    expect(summaryRes.body.data.overdueLoansCount).toBe(0);
  });

  it('tests due date boundaries strictly: due today is NOT overdue, due yesterday is overdue', async () => {
    const { token } = await createTestUser();
    const today = getBusinessDate();

    // Compute yesterday and tomorrow relative to business date
    const todayDate = new Date(today + 'T00:00:00Z');
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setUTCDate(todayDate.getUTCDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setUTCDate(todayDate.getUTCDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];

    // Loan 1: Due yesterday (overdue)
    await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Yesterday', amount: '500.00', dueDate: yesterday });

    // Loan 2: Due today (active, NOT overdue)
    await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Today', amount: '700.00', dueDate: today });

    // Loan 3: Due tomorrow (active, NOT overdue)
    await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Tomorrow', amount: '900.00', dueDate: tomorrow });

    const summaryRes = await request(app)
      .get('/api/v1/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(summaryRes.status).toBe(200);
    // Overdue amount must be ONLY the ₹500 from yesterday!
    expect(summaryRes.body.data.overdueAmount).toBe('500.00');
    expect(summaryRes.body.data.overdueLoansCount).toBe(1);
    // Total lent = 500 + 700 + 900 = 2100.00
    expect(summaryRes.body.data.totalLent).toBe('2100.00');
    expect(summaryRes.body.data.outstandingAmount).toBe('2100.00');
  });

  it('ensures summary isolation across multiple users', async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();

    // User A has ₹5000 lent
    await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ friendName: 'Friend A', amount: '5000.00', dueDate: '2026-01-01' });

    // User B summary must still be 0.00
    const summaryB = await request(app)
      .get('/api/v1/summary')
      .set('Authorization', `Bearer ${userB.token}`);

    expect(summaryB.body.data.totalLent).toBe('0.00');
    expect(summaryB.body.data.activeLoansCount).toBe(0);
  });
});
