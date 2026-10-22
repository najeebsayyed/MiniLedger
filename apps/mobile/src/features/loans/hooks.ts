import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateLoanRequest,
  LoanFilterQuery,
  LoansListResponse,
  LoanDto,
} from '@miniledger/contracts';
import { createLoanApi, getLoansApi, getLoanByIdApi, repayLoanApi, attachReceiptToLoanApi, removeReceiptFromLoanApi } from './api';

export function useLoans(query: LoanFilterQuery = {}) {
  return useQuery<LoansListResponse>({
    queryKey: ['loans', query],
    queryFn: () => getLoansApi(query),
  });
}

export function useLoan(id: string) {
  return useQuery<LoanDto>({
    queryKey: ['loan', id],
    queryFn: () => getLoanByIdApi(id),
    enabled: !!id,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanRequest) => createLoanApi(data),
    onSuccess: () => {
      // Refresh both loan queries and summary
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });
}

export function useRepayLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repayLoanApi(id),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.setQueryData(['loan', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });
}

export function useAttachReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, base64Data }: { loanId: string; base64Data: string }) =>
      attachReceiptToLoanApi(loanId, base64Data),
    onSuccess: (data) => {
      queryClient.setQueryData(['loan', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useRemoveReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: string) => removeReceiptFromLoanApi(loanId),
    onSuccess: (data) => {
      queryClient.setQueryData(['loan', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}
