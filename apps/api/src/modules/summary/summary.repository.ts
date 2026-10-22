import { db } from '../../db/client.js';
import { loans } from '../../db/schema/loans.js';
import { eq, sql } from 'drizzle-orm';
import { getBusinessDate } from '../../lib/dates.js';

export interface SummaryAggregates {
  totalLent: string;
  totalRepaid: string;
  outstandingAmount: string;
  overdueAmount: string;
  activeLoansCount: number;
  repaidLoansCount: number;
  overdueLoansCount: number;
}

export async function calculateSummaryForOwner(
  ownerId: string,
  businessDate: string = getBusinessDate()
): Promise<SummaryAggregates> {
  const [result] = await db
    .select({
      totalLent: sql<string>`COALESCE(SUM(${loans.amount}), 0)::numeric(12,2)::text`,
      totalRepaid: sql<string>`COALESCE(SUM(CASE WHEN ${loans.status} = 'REPAID' THEN ${loans.amount} ELSE 0 END), 0)::numeric(12,2)::text`,
      outstandingAmount: sql<string>`COALESCE(SUM(CASE WHEN ${loans.status} = 'ACTIVE' THEN ${loans.amount} ELSE 0 END), 0)::numeric(12,2)::text`,
      overdueAmount: sql<string>`COALESCE(SUM(CASE WHEN ${loans.status} = 'ACTIVE' AND ${loans.dueDate} < ${businessDate} THEN ${loans.amount} ELSE 0 END), 0)::numeric(12,2)::text`,
      activeLoansCount: sql<number>`COALESCE(COUNT(CASE WHEN ${loans.status} = 'ACTIVE' THEN 1 END), 0)::int`,
      repaidLoansCount: sql<number>`COALESCE(COUNT(CASE WHEN ${loans.status} = 'REPAID' THEN 1 END), 0)::int`,
      overdueLoansCount: sql<number>`COALESCE(COUNT(CASE WHEN ${loans.status} = 'ACTIVE' AND ${loans.dueDate} < ${businessDate} THEN 1 END), 0)::int`,
    })
    .from(loans)
    .where(eq(loans.ownerId, ownerId));

  return {
    totalLent: result?.totalLent ?? '0.00',
    totalRepaid: result?.totalRepaid ?? '0.00',
    outstandingAmount: result?.outstandingAmount ?? '0.00',
    overdueAmount: result?.overdueAmount ?? '0.00',
    activeLoansCount: result?.activeLoansCount ?? 0,
    repaidLoansCount: result?.repaidLoansCount ?? 0,
    overdueLoansCount: result?.overdueLoansCount ?? 0,
  };
}
