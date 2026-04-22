import type { Session } from '@domain/entities/Session';
import type { DomainError } from '@domain/errors/DomainError';

/**
 * Finite states of the authentication state machine.
 *
 * - idle:           initial state before hydration completes.
 * - authenticating: a login request is in flight.
 * - authenticated:  a valid Session is present.
 * - unauthenticated: no valid Session (either hydrated empty or logged out).
 */
export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  readonly status: AuthStatus;
  readonly session: Session | null;
  readonly error: DomainError | null;
}

export const initialAuthState: AuthState = {
  status: 'idle',
  session: null,
  error: null,
};

export type AuthAction =
  | { readonly type: 'HYDRATE'; readonly payload: { readonly session: Session | null } }
  | { readonly type: 'LOGIN_START' }
  | { readonly type: 'LOGIN_SUCCESS'; readonly payload: { readonly session: Session } }
  | { readonly type: 'LOGIN_FAILURE'; readonly payload: { readonly error: DomainError } }
  | { readonly type: 'LOGOUT' }
  | { readonly type: 'CLEAR_ERROR' };

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload.session
        ? { status: 'authenticated', session: action.payload.session, error: null }
        : { status: 'unauthenticated', session: null, error: null };

    case 'LOGIN_START':
      return { status: 'authenticating', session: null, error: null };

    case 'LOGIN_SUCCESS':
      return { status: 'authenticated', session: action.payload.session, error: null };

    case 'LOGIN_FAILURE':
      return { status: 'unauthenticated', session: null, error: action.payload.error };

    case 'LOGOUT':
      return { status: 'unauthenticated', session: null, error: null };

    case 'CLEAR_ERROR':
      return { ...state, error: null };
  }
};
