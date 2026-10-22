import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestOtpApi, verifyOtpApi, getMeApi } from './api';
import { saveAuthToken, clearAuthToken } from '../../lib/secure-storage';
import { UserDto } from '@miniledger/contracts';

export function useRequestOtp() {
  return useMutation({
    mutationFn: (phoneNumber: string) => requestOtpApi(phoneNumber),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
      const data = await verifyOtpApi(phoneNumber, otp);
      await saveAuthToken(data.accessToken);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user);
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useCurrentUser() {
  return useQuery<UserDto>({
    queryKey: ['me'],
    queryFn: getMeApi,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return async () => {
    await clearAuthToken();
    queryClient.clear();
  };
}
