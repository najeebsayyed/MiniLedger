import { useQuery } from '@tanstack/react-query';
import { getSummaryApi } from './api';
import { SummaryDto } from '@miniledger/contracts';

export function useSummary() {
  return useQuery<SummaryDto>({
    queryKey: ['summary'],
    queryFn: getSummaryApi,
  });
}
