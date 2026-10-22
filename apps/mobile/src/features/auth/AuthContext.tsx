import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto } from '@miniledger/contracts';
import {
  getAuthToken,
  saveAuthToken,
  clearAuthToken,
  hasCompletedOnboarding,
  setOnboardingCompleted,
} from '../../lib/secure-storage';
import { getMeApi } from './api';
import { queryClient } from '../../lib/query-client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasOnboarded: boolean;
  user: UserDto | null;
  signIn: (token: string, user: UserDto) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboardingState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  hasOnboarded: false,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  completeOnboarding: async () => {},
  resetOnboardingState: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const onboarded = await hasCompletedOnboarding();
        setHasOnboarded(onboarded);

        const token = await getAuthToken();
        if (token) {
          const profile = await getMeApi();
          setUser(profile);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        // Token invalid or network issue; clear token to force re-login
        await clearAuthToken();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const signIn = async (token: string, newUser: UserDto) => {
    await saveAuthToken(token);
    setUser(newUser);
    setIsAuthenticated(true);
    queryClient.invalidateQueries({ queryKey: ['summary'] });
    queryClient.invalidateQueries({ queryKey: ['loans'] });
  };

  const signOut = async () => {
    await clearAuthToken();
    queryClient.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  const completeOnboarding = async () => {
    await setOnboardingCompleted(true);
    setHasOnboarded(true);
  };

  const resetOnboardingState = async () => {
    await setOnboardingCompleted(false);
    setHasOnboarded(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        hasOnboarded,
        user,
        signIn,
        signOut,
        completeOnboarding,
        resetOnboardingState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
