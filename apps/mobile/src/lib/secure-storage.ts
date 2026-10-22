import * as Keychain from 'react-native-keychain';

const SERVICE_KEY = 'miniledger_session_token';

let memoryTokenFallback: string | null = null;

export async function saveAuthToken(token: string): Promise<void> {
  memoryTokenFallback = token;
  try {
    await Keychain.setGenericPassword('auth_token', token, {
      service: SERVICE_KEY,
    });
  } catch (err) {
    // Graceful fallback to in-memory in dev/mock environments if native keychain is not linked
    console.warn('Keychain storage fallback to memory token:', err);
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (memoryTokenFallback) {
    return memoryTokenFallback;
  }

  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_KEY,
    });
    if (credentials && credentials.password) {
      memoryTokenFallback = credentials.password;
      return credentials.password;
    }
  } catch (err) {
    console.warn('Could not read from keychain, using memory fallback:', err);
  }

  return memoryTokenFallback;
}

export async function clearAuthToken(): Promise<void> {
  memoryTokenFallback = null;
  try {
    await Keychain.resetGenericPassword({
      service: SERVICE_KEY,
    });
  } catch (err) {
    console.warn('Could not reset keychain password:', err);
  }
}
