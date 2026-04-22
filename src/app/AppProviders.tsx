import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type FC,
  type ReactNode,
} from 'react';

import { ENV } from '@config/env';
import type { Session } from '@domain/entities/Session';
import type { DomainError } from '@domain/errors/DomainError';
import type {
  IAuthRepository,
  LoginCredentials,
  RegisterCredentials,
  RegistrationResult,
} from '@domain/repositories/IAuthRepository';
import type { IClientRepository } from '@domain/repositories/IClientRepository';
import type { IInterestRepository } from '@domain/repositories/IInterestRepository';
import { createHttpClient } from '@infrastructure/http/axiosInstance';
import {
  AuthRepositoryHttp,
  ClientRepositoryHttp,
  InterestRepositoryHttp,
} from '@infrastructure/repositories';
import { LocalStorageTokenStorage, type ITokenStorage } from '@infrastructure/storage/TokenStorage';
import { AuthContext, type AuthContextValue } from '@presentation/providers/auth/AuthContext';
import { authReducer, initialAuthState } from '@presentation/providers/auth/authReducer';
import {
  RepositoriesContext,
  type Repositories,
} from '@presentation/providers/repositories/RepositoriesContext';

export interface AppProvidersProps {
  readonly children: ReactNode;
  /** Override for tests: inject mock repositories instead of creating http-backed ones. */
  readonly repositoriesOverride?: Repositories;
  /** Override for tests: inject a custom token storage (e.g. in-memory). */
  readonly tokenStorage?: ITokenStorage;
  /** Override for tests: base URL for the http client. Defaults to ENV.API_BASE_URL. */
  readonly apiBaseUrl?: string;
}

/**
 * Module-level singleton so the default tokenStorage doesn't change identity on
 * every render. A new instance per render would make the hydration effect loop
 * infinitely and blow up the JS heap.
 */
const defaultTokenStorage: ITokenStorage = new LocalStorageTokenStorage();

/**
 * Composition root. Wires the infrastructure (axios + repositories) and
 * the authentication state machine together.
 *
 * The axios instance reads the current token through a ref so that the
 * interceptors always see the latest session without having to be
 * rebuilt on every state change. The same mechanism lets the 401
 * interceptor call `logout()` without introducing a dependency cycle.
 */
export const AppProviders: FC<AppProvidersProps> = ({
  children,
  repositoriesOverride,
  tokenStorage = defaultTokenStorage,
  apiBaseUrl = ENV.API_BASE_URL,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const sessionRef = useRef<Session | null>(state.session);
  sessionRef.current = state.session;

  const logoutRef = useRef<() => void>(() => undefined);

  const logout = useCallback((): void => {
    tokenStorage.clear();
    dispatch({ type: 'LOGOUT' });
  }, [tokenStorage]);

  logoutRef.current = logout;

  const repositories: Repositories = useMemo(() => {
    if (repositoriesOverride) return repositoriesOverride;
    const http = createHttpClient(apiBaseUrl, {
      getToken: () => sessionRef.current?.token ?? null,
      onUnauthorized: () => logoutRef.current(),
    });
    const auth: IAuthRepository = new AuthRepositoryHttp(http);
    const clients: IClientRepository = new ClientRepositoryHttp(http);
    const interests: IInterestRepository = new InterestRepositoryHttp(http);
    return { auth, clients, interests };
  }, [apiBaseUrl, repositoriesOverride]);

  useEffect(() => {
    const persisted = tokenStorage.load();
    dispatch({ type: 'HYDRATE', payload: { session: persisted } });
  }, [tokenStorage]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      dispatch({ type: 'LOGIN_START' });
      try {
        const session = await repositories.auth.login(credentials);
        tokenStorage.save(session);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { session } });
      } catch (error) {
        dispatch({ type: 'LOGIN_FAILURE', payload: { error: error as DomainError } });
        throw error;
      }
    },
    [repositories.auth, tokenStorage],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<RegistrationResult> =>
      repositories.auth.register(credentials),
    [repositories.auth],
  );

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const authValue: AuthContextValue = useMemo(
    () => ({
      status: state.status,
      session: state.session,
      error: state.error,
      isHydrated: state.status !== 'idle',
      isAuthenticated: state.status === 'authenticated',
      login,
      register,
      logout,
      clearError,
    }),
    [state, login, register, logout, clearError],
  );

  return (
    <RepositoriesContext.Provider value={repositories}>
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    </RepositoriesContext.Provider>
  );
};
