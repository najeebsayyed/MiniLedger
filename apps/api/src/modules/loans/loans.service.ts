import { LoanDto, CreateLoanRequest, LoanFilterQuery } from '@miniledger/contracts';
import { Loan } from '../../db/schema/loans.js';
import { isLoanOverdue, getBusinessDate } from '../../lib/dates.js';
import { toDecimalString } from '../../lib/money.js';
import { AppError } from '../../middleware/error-handler.js';
import * as loansRepo from './loans.repository.js';

export function mapLoanToDto(loan: Loan, businessDate: string = getBusinessDate()): LoanDto {
  return {
    id: loan.id,
    friendName: loan.friendName,
    amount: toDecimalString(loan.amount),
    currency: 'INR' as const,
    dueDate: loan.dueDate,
    status: loan.status as 'ACTIVE' | 'REPAID',
    isOverdue: isLoanOverdue(loan.dueDate, loan.status, businessDate),
    repaidAt: loan.repaidAt ? loan.repaidAt.toISOString() : null,
    receiptUrl: loan.receiptUrl ?? null,
    createdAt: loan.createdAt.toISOString(),
    updatedAt: loan.updatedAt.toISOString(),
  };
}

export async function createLoan(ownerId: string, input: CreateLoanRequest): Promise<LoanDto> {
  const formattedAmount = toDecimalString(input.amount);
  const loanRecord = await loansRepo.createLoan(ownerId, {
    friendName: input.friendName.trim(),
    amount: formattedAmount,
    dueDate: input.dueDate,
  });

  return mapLoanToDto(loanRecord);
}

export async function getLoans(ownerId: string, query: LoanFilterQuery) {
  const businessDate = getBusinessDate();
  const { records, meta } = await loansRepo.listLoans(ownerId, query, businessDate);

  const data = records.map((record) => mapLoanToDto(record, businessDate));

  return {
    data,
    meta,
  };
}

export async function getLoanById(id: string, ownerId: string): Promise<LoanDto> {
  const loan = await loansRepo.findLoanByIdAndOwner(id, ownerId);
  if (!loan) {
    throw new AppError(404, 'LOAN_NOT_FOUND', 'Loan not found.');
  }

  return mapLoanToDto(loan);
}

export async function markLoanAsRepaid(id: string, ownerId: string): Promise<LoanDto> {
  const updatedLoan = await loansRepo.markLoanRepaid(id, ownerId);

  if (updatedLoan) {
    return mapLoanToDto(updatedLoan);
  }

  // If not updated, verify whether loan exists or is already repaid
  const existing = await loansRepo.findLoanByIdAndOwner(id, ownerId);
  if (!existing) {
    throw new AppError(404, 'LOAN_NOT_FOUND', 'Loan not found.');
  }

  if (existing.status === 'REPAID') {
    throw new AppError(409, 'LOAN_ALREADY_REPAID', 'This loan has already been marked as repaid.');
  }

  throw new AppError(500, 'INTERNAL_ERROR', 'Could not update loan status.');
}
