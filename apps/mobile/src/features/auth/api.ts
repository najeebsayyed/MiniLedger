import { apiClient } from '../../lib/api-client';
import {
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  UserDto,
} from '@miniledger/contracts';

export async function requestOtpApi(phoneNumber: string): Promise<RequestOtpResponse['data']> {
  return apiClient<RequestOtpResponse['data']>('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
}

export async function verifyOtpApi(
  phoneNumber: string,
  otp: string
): Promise<VerifyOtpResponse['data']> {
  return apiClient<VerifyOtpResponse['data']>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, otp }),
  });
}

export async function getMeApi(): Promise<UserDto> {
  return apiClient<UserDto>('/auth/me', {
    method: 'GET',
  });
}
