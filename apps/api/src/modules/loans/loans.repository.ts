import { db } from '../../db/client.js';
import { loans } from '../../db/schema/loans.js';
import { eq, and, sql, ilike, lt, gte, desc, asc } from 'drizzle-orm';
import { LoanFilterQuery } from '@miniledger/contracts';
import { getBusinessDate } from '../../lib/dates.js';

export async function createLoan(
  ownerId: string,
  data: { friendName: string; amount: string; dueDate: string; receiptUrl?: string | null }
) {
  const [record] = await db
    .insert(loans)
    .values({
      ownerId,
      friendName: data.friendName,
      amount: data.amount,
      dueDate: data.dueDate,
      status: 'ACTIVE',
      repaidAt: null,
      receiptUrl: data.receiptUrl ?? null,
    })
    .returning();

  return record;
}

export async function updateLoanReceipt(id: string, ownerId: string, receiptUrl: string | null) {
  const [record] = await db
    .update(loans)
    .set({
      receiptUrl,
      updatedAt: new Date(),
    })
    .where(and(eq(loans.id, id), eq(loans.ownerId, ownerId)))
    .returning();

  return record || null;
}

export async function findLoanByIdAndOwner(id: string, ownerId: string) {
  const [record] = await db
    .select()
    .from(loans)
    .where(and(eq(loans.id, id), eq(loans.ownerId, ownerId)))
    .limit(1);

  return record || null;
}

export async function markLoanRepaid(id: string, ownerId: string) {
  const now = new Date();
  const [record] = await db
    .update(loans)
    .set({
      status: 'REPAID',
      repaidAt: now,
      updatedAt: now,
    })
    .where(and(eq(loans.id, id), eq(loans.ownerId, ownerId), eq(loans.status, 'ACTIVE')))
    .returning();

  return record || null;
}

export async function listLoans(
  ownerId: string,
  query: LoanFilterQuery,
  businessDate: string = getBusinessDate()
) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(loans.ownerId, ownerId)];

  // Status filter
  if (query.status === 'outstanding') {
    conditions.push(eq(loans.status, 'ACTIVE'));
  } else if (query.status === 'overdue') {
    conditions.push(eq(loans.status, 'ACTIVE'));
    conditions.push(lt(loans.dueDate, businessDate));
  } else if (query.status === 'repaid') {
    conditions.push(eq(loans.status, 'REPAID'));
  }

  // Search filter
  if (query.search && query.search.trim().length > 0) {
    conditions.push(ilike(loans.friendName, `%${query.search.trim()}%`));
  }

  const whereClause = and(...conditions);

  // Count total matching items
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loans)
    .where(whereClause);

  const totalItems = countResult?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Determine sorting
  // Smart sort:
  // Priority 1: Overdue active (status = 'ACTIVE' and due_date < businessDate)
  // Priority 2: Due today active (status = 'ACTIVE' and due_date = businessDate)
  // Priority 3: Upcoming active (status = 'ACTIVE' and due_date > businessDate)
  // Priority 4: Repaid (status = 'REPAID')
  let queryBuilder = db.select().from(loans).where(whereClause);

  if (query.sort === 'dueDateAsc') {
    queryBuilder = queryBuilder.orderBy(
      asc(loans.dueDate),
      desc(loans.createdAt),
      asc(loans.id)
    ) as any;
  } else if (query.sort === 'newest') {
    queryBuilder = queryBuilder.orderBy(
      desc(loans.createdAt),
      asc(loans.id)
    ) as any;
  } else {
    // Smart sort
    const smartOrderSql = sql`
      CASE
        WHEN ${loans.status} = 'ACTIVE' AND ${loans.dueDate} < ${businessDate} THEN 1
        WHEN ${loans.status} = 'ACTIVE' AND ${loans.dueDate} = ${businessDate} THEN 2
        WHEN ${loans.status} = 'ACTIVE' THEN 3
        ELSE 4
      END ASC,
      ${loans.dueDate} ASC,
      ${loans.createdAt} DESC,
      ${loans.id} ASC
    `;
    queryBuilder = queryBuilder.orderBy(smartOrderSql) as any;
  }

  const records = await queryBuilder.limit(pageSize).offset(offset);

  return {
    records,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}
