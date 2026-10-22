import { apiClient } from '../../lib/api-client';
import {
  CreateLoanRequest,
  LoanDto,
  LoanFilterQuery,
  LoansListResponse,
} from '@miniledger/contracts';

export async function createLoanApi(data: CreateLoanRequest): Promise<LoanDto> {
  return apiClient<LoanDto>('/loans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getLoansApi(query: LoanFilterQuery = {}): Promise<LoansListResponse> {
  const params = new URLSearchParams();
  if (query.status) params.append('status', query.status);
  if (query.search) params.append('search', query.search);
  if (query.sort) params.append('sort', query.sort);
  if (query.page) params.append('page', String(query.page));
  if (query.pageSize) params.append('pageSize', String(query.pageSize));

  const qs = params.toString();
  const endpoint = qs ? `/loans?${qs}` : '/loans';

  // The API returns { data: LoanDto[], meta: { ... } }
  return apiClient<LoansListResponse>(endpoint, {
    method: 'GET',
  });
}

export async function getLoanByIdApi(id: string): Promise<LoanDto> {
  return apiClient<LoanDto>(`/loans/${id}`, {
    method: 'GET',
  });
}

export async function repayLoanApi(id: string): Promise<LoanDto> {
  return apiClient<LoanDto>(`/loans/${id}/repay`, {
    method: 'PATCH',
  });
}

export async function uploadReceiptApi(base64Data: string): Promise<{ receiptUrl: string; filename: string }> {
  return apiClient<{ receiptUrl: string; filename: string }>('/loans/upload-receipt', {
    method: 'POST',
    body: JSON.stringify({ receiptBase64: base64Data }),
  });
}

export async function attachReceiptToLoanApi(loanId: string, receiptBase64: string): Promise<LoanDto> {
  return apiClient<LoanDto>(`/loans/${loanId}/receipt`, {
    method: 'POST',
    body: JSON.stringify({ receiptBase64 }),
  });
}

export async function removeReceiptFromLoanApi(loanId: string): Promise<LoanDto> {
  return apiClient<LoanDto>(`/loans/${loanId}/receipt`, {
    method: 'DELETE',
  });
}
