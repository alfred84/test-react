import { createContext, useContext } from 'react';

import type { Session } from '@domain/entities/Session';
import type { DomainError } from '@domain/errors/DomainError';
import type {
  LoginCredentials,
  RegisterCredentials,
  RegistrationResult,
} from '@domain/repositories/IAuthRepository';

import type { AuthStatus } from './authReducer';

export interface AuthContextValue {
  readonly status: AuthStatus;
  readonly session: Session | null;
  readonly error: DomainError | null;
  /** True once the provider has finished checking for a persisted session. */
  readonly isHydrated: boolean;
  readonly isAuthenticated: boolean;
  readonly login: (credentials: LoginCredentials) => Promise<void>;
  readonly register: (credentials: RegisterCredentials) => Promise<RegistrationResult>;
  readonly logout: () => void;
  readonly clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = 'AuthContext';

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider />.');
  }
  return ctx;
};
