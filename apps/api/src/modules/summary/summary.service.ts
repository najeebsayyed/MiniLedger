import { SummaryDto } from '@miniledger/contracts';
import { toDecimalString } from '../../lib/money.js';
import * as summaryRepo from './summary.repository.js';

export async function getSummary(ownerId: string): Promise<SummaryDto> {
  const data = await summaryRepo.calculateSummaryForOwner(ownerId);

  return {
    currency: 'INR',
    totalLent: toDecimalString(data.totalLent),
    totalRepaid: toDecimalString(data.totalRepaid),
    outstandingAmount: toDecimalString(data.outstandingAmount),
    overdueAmount: toDecimalString(data.overdueAmount),
    activeLoansCount: data.activeLoansCount,
    repaidLoansCount: data.repaidLoansCount,
    overdueLoansCount: data.overdueLoansCount,
  };
}
