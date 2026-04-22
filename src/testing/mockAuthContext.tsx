import type { FC, ReactNode } from 'react';

import type { Session } from '@domain/entities/Session';
import type { RegistrationResult } from '@domain/repositories/IAuthRepository';
import { AuthContext, type AuthContextValue } from '@presentation/providers/auth/AuthContext';

export interface MockAuthState {
  readonly isHydrated?: boolean | undefined;
  readonly isAuthenticated?: boolean | undefined;
  readonly session?: Session | null | undefined;
}

/**
 * Builds a fully typed AuthContextValue for route/component tests.
 * Defaults represent a hydrated, unauthenticated visitor.
 */
export const buildAuthContextValue = (overrides: MockAuthState = {}): AuthContextValue => {
  const registrationResult: RegistrationResult = { status: 'ok', message: 'ok' };
  return {
    status: overrides.isAuthenticated ? 'authenticated' : 'unauthenticated',
    session: overrides.session ?? null,
    error: null,
    isHydrated: overrides.isHydrated ?? true,
    isAuthenticated: overrides.isAuthenticated ?? false,
    login: jest.fn(() => Promise.resolve()),
    register: jest.fn(() => Promise.resolve(registrationResult)),
    logout: jest.fn(),
    clearError: jest.fn(),
  };
};

export interface MockAuthProviderProps extends MockAuthState {
  readonly children: ReactNode;
}

export const MockAuthProvider: FC<MockAuthProviderProps> = ({ children, ...state }) => (
  <AuthContext.Provider value={buildAuthContextValue(state)}>{children}</AuthContext.Provider>
);
