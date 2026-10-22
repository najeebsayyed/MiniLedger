import { Platform } from 'react-native';
import { getAuthToken, clearAuthToken } from './secure-storage';

// Default development base URL
// With 'adb reverse tcp:4000 tcp:4000', localhost:4000 connects directly from both physical Android devices and emulators
export const DEFAULT_API_BASE_URL = 'http://localhost:4000/api/v1';

let currentApiBaseUrl = DEFAULT_API_BASE_URL;

export function setApiBaseUrl(url: string) {
  currentApiBaseUrl = url.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  return currentApiBaseUrl;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorizedCallback(cb: () => void) {
  onUnauthorizedCallback = cb;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const url = `${currentApiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Cannot connect to the server. Check your connection or API server status.'
    );
  }

  if (response.status === 401) {
    await clearAuthToken();
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
  }

  let responseJson: any = null;
  try {
    responseJson = await response.json();
  } catch {
    // Response had no JSON body
  }

  if (!response.ok) {
    const errorData = responseJson?.error as ApiErrorPayload | undefined;
    throw new ApiError(
      response.status,
      errorData?.code || 'API_ERROR',
      errorData?.message || `Request failed with status ${response.status}`,
      errorData?.details
    );
  }

  return responseJson?.data !== undefined ? responseJson.data : responseJson;
}
