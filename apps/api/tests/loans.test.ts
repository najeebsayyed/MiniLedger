import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, cleanupDatabase, createTestUser } from './helpers/test-app.js';
import { getBusinessDate } from '../src/lib/dates.js';

describe('Loans Endpoints & Business Rules', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('creates an active loan successfully, allowing past due dates', async () => {
    const { token } = await createTestUser();

    // Past due date
    const res = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        friendName: 'Aarav Sharma',
        amount: '2500.50',
        dueDate: '2026-01-15',
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.friendName).toBe('Aarav Sharma');
    expect(res.body.data.amount).toBe('2500.50');
    expect(res.body.data.currency).toBe('INR');
    expect(res.body.data.dueDate).toBe('2026-01-15');
    expect(res.body.data.status).toBe('ACTIVE');
    expect(res.body.data.isOverdue).toBe(true); // Jan 2026 is past relative to businessDate
    expect(res.body.data.repaidAt).toBeNull();
  });

  it('validates loan creation inputs strictly', async () => {
    const { token } = await createTestUser();

    // Empty name
    const res1 = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: '  ', amount: '100.00', dueDate: '2026-10-30' });
    expect(res1.status).toBe(400);

    // Negative / 0 amount
    const res2 = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Rohan', amount: '0', dueDate: '2026-10-30' });
    expect(res2.status).toBe(400);

    // Invalid date
    const res3 = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Rohan', amount: '500.00', dueDate: 'not-a-date' });
    expect(res3.status).toBe(400);
  });

  it('enforces strict user isolation — User B cannot access or list User A loans', async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();

    // User A creates a loan
    const createRes = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ friendName: 'Priya', amount: '1200.00', dueDate: '2026-12-01' });
    const loanId = createRes.body.data.id;

    // User B lists loans -> empty
    const listResB = await request(app)
      .get('/api/v1/loans')
      .set('Authorization', `Bearer ${userB.token}`);
    expect(listResB.status).toBe(200);
    expect(listResB.body.data).toHaveLength(0);
    expect(listResB.body.meta.totalItems).toBe(0);

    // User B tries to get User A's loan -> 404 LOAN_NOT_FOUND
    const getResB = await request(app)
      .get(`/api/v1/loans/${loanId}`)
      .set('Authorization', `Bearer ${userB.token}`);
    expect(getResB.status).toBe(404);
    expect(getResB.body.error.code).toBe('LOAN_NOT_FOUND');

    // User B tries to repay User A's loan -> 404 LOAN_NOT_FOUND
    const repayResB = await request(app)
      .patch(`/api/v1/loans/${loanId}/repay`)
      .set('Authorization', `Bearer ${userB.token}`);
    expect(repayResB.status).toBe(404);
    expect(repayResB.body.error.code).toBe('LOAN_NOT_FOUND');
  });

  it('marks loan as repaid atomically, sets repaidAt, isOverdue: false, and rejects second repay with 409', async () => {
    const { token } = await createTestUser();

    // Create overdue loan
    const createRes = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Neha', amount: '3500.00', dueDate: '2026-01-01' });
    const loanId = createRes.body.data.id;
    expect(createRes.body.data.isOverdue).toBe(true);

    // Mark as repaid
    const repayRes = await request(app)
      .patch(`/api/v1/loans/${loanId}/repay`)
      .set('Authorization', `Bearer ${token}`);

    expect(repayRes.status).toBe(200);
    expect(repayRes.body.data.status).toBe('REPAID');
    expect(repayRes.body.data.repaidAt).not.toBeNull();
    expect(repayRes.body.data.isOverdue).toBe(false); // Repaid loans are NEVER overdue!

    // Second repay attempt -> 409 LOAN_ALREADY_REPAID
    const secondRepayRes = await request(app)
      .patch(`/api/v1/loans/${loanId}/repay`)
      .set('Authorization', `Bearer ${token}`);

    expect(secondRepayRes.status).toBe(409);
    expect(secondRepayRes.body.error.code).toBe('LOAN_ALREADY_REPAID');
  });

  it('filters loans by status and searches by friend name', async () => {
    const { token } = await createTestUser();

    // 1. Overdue loan (past)
    await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Vikram Overdue', amount: '1000.00', dueDate: '2026-01-01' });

    // 2. Upcoming loan (future)
    await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Ananya Future', amount: '2000.00', dueDate: '2099-12-31' });

    // 3. Repaid loan
    const res3 = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ friendName: 'Karan Repaid', amount: '3000.00', dueDate: '2026-01-01' });
    await request(app)
      .patch(`/api/v1/loans/${res3.body.data.id}/repay`)
      .set('Authorization', `Bearer ${token}`);

    // Test filter: all
    const allRes = await request(app)
      .get('/api/v1/loans?status=all')
      .set('Authorization', `Bearer ${token}`);
    expect(allRes.body.data).toHaveLength(3);

    // Test filter: outstanding (active only)
    const outRes = await request(app)
      .get('/api/v1/loans?status=outstanding')
      .set('Authorization', `Bearer ${token}`);
    expect(outRes.body.data).toHaveLength(2);

    // Test filter: overdue
    const overdueRes = await request(app)
      .get('/api/v1/loans?status=overdue')
      .set('Authorization', `Bearer ${token}`);
    expect(overdueRes.body.data).toHaveLength(1);
    expect(overdueRes.body.data[0].friendName).toBe('Vikram Overdue');

    // Test filter: repaid
    const repaidRes = await request(app)
      .get('/api/v1/loans?status=repaid')
      .set('Authorization', `Bearer ${token}`);
    expect(repaidRes.body.data).toHaveLength(1);
    expect(repaidRes.body.data[0].friendName).toBe('Karan Repaid');

    // Test search
    const searchRes = await request(app)
      .get('/api/v1/loans?search=ananya')
      .set('Authorization', `Bearer ${token}`);
    expect(searchRes.body.data).toHaveLength(1);
    expect(searchRes.body.data[0].friendName).toBe('Ananya Future');
  });
});
