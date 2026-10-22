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

const ONBOARDING_SERVICE = 'miniledger_onboarding_state';
let memoryOnboardingFallback: boolean | null = null;

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  memoryOnboardingFallback = completed;
  try {
    if (completed) {
      await Keychain.setGenericPassword('onboarding', 'completed', {
        service: ONBOARDING_SERVICE,
      });
    } else {
      await Keychain.resetGenericPassword({
        service: ONBOARDING_SERVICE,
      });
    }
  } catch (err) {
    console.warn('Keychain onboarding fallback to memory:', err);
  }
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  if (memoryOnboardingFallback !== null) {
    return memoryOnboardingFallback;
  }

  try {
    const creds = await Keychain.getGenericPassword({
      service: ONBOARDING_SERVICE,
    });
    if (creds && creds.password === 'completed') {
      memoryOnboardingFallback = true;
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not read onboarding state, using fallback:', err);
    return false;
  }
}
