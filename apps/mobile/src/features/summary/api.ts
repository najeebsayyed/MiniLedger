import { apiClient } from '../../lib/api-client';
import { SummaryDto } from '@miniledger/contracts';

export async function getSummaryApi(): Promise<SummaryDto> {
  return apiClient<SummaryDto>('/summary', {
    method: 'GET',
  });
}
