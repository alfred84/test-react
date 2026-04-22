import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { FC } from 'react';

import type { Session } from '@domain/entities/Session';
import { InvalidCredentialsError } from '@domain/errors';
import type {
  IAuthRepository,
  LoginCredentials,
  RegisterCredentials,
  RegistrationResult,
} from '@domain/repositories/IAuthRepository';
import type { IClientRepository } from '@domain/repositories/IClientRepository';
import type { IInterestRepository } from '@domain/repositories/IInterestRepository';
import { useAuth } from '@presentation/providers/auth/AuthContext';

import { InMemoryTokenStorage } from '../testing/inMemoryStorage';

import { AppProviders } from './AppProviders';

const validSession: Session = {
  token: 'jwt-token',
  userId: 'user-1',
  username: 'arivel',
  expiresAt: Date.now() + 60_000,
};

interface MockedAuthRepository extends IAuthRepository {
  readonly login: jest.MockedFunction<(credentials: LoginCredentials) => Promise<Session>>;
  readonly register: jest.MockedFunction<
    (credentials: RegisterCredentials) => Promise<RegistrationResult>
  >;
  readonly logout: jest.MockedFunction<() => Promise<void>>;
}

const createMockAuthRepo = (): MockedAuthRepository => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
});

const noopClientRepo: IClientRepository = {
  list: () => Promise.resolve([]),
  getById: () => Promise.reject(new Error('not used')),
  create: () => Promise.resolve(),
  update: () => Promise.resolve(),
  delete: () => Promise.resolve(),
};

const noopInterestRepo: IInterestRepository = {
  list: () => Promise.resolve([]),
};

const Probe: FC = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="status">{auth.status}</div>
      <div data-testid="hydrated">{auth.isHydrated ? 'yes' : 'no'}</div>
      <div data-testid="username">{auth.session?.username ?? ''}</div>
      <div data-testid="error">{auth.error?.message ?? ''}</div>
      <button
        onClick={() => {
          auth.login({ username: 'arivel', password: 'secret' }).catch(() => {
            /* error is surfaced via context.state.error */
          });
        }}
      >
        login
      </button>
      <button onClick={() => auth.logout()}>logout</button>
      <button onClick={() => auth.clearError()}>clear-error</button>
    </div>
  );
};

const renderWithProviders = (
  auth: IAuthRepository,
  storage: InMemoryTokenStorage = new InMemoryTokenStorage(),
): InMemoryTokenStorage => {
  render(
    <AppProviders
      repositoriesOverride={{ auth, clients: noopClientRepo, interests: noopInterestRepo }}
      tokenStorage={storage}
    >
      <Probe />
    </AppProviders>,
  );
  return storage;
};

describe('AppProviders hydration', () => {
  it('transitions to unauthenticated when there is no persisted session', async () => {
    renderWithProviders(createMockAuthRepo());
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    expect(screen.getByTestId('hydrated')).toHaveTextContent('yes');
    expect(screen.getByTestId('username')).toHaveTextContent('');
  });

  it('transitions to authenticated when a valid session is persisted', async () => {
    renderWithProviders(createMockAuthRepo(), new InMemoryTokenStorage(validSession));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('username')).toHaveTextContent('arivel');
  });
});

describe('AppProviders login', () => {
  it('runs login, persists the session and transitions to authenticated', async () => {
    const repo = createMockAuthRepo();
    repo.login.mockResolvedValue(validSession);
    const storage = renderWithProviders(repo);

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('username')).toHaveTextContent('arivel');
    expect(repo.login).toHaveBeenCalledWith({ username: 'arivel', password: 'secret' });
    expect(storage.current).toEqual(validSession);
  });

  it('captures the error and stays unauthenticated when login fails', async () => {
    const repo = createMockAuthRepo();
    repo.login.mockRejectedValue(new InvalidCredentialsError());
    const storage = renderWithProviders(repo);

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('error')).not.toHaveTextContent(''));
    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    expect(storage.current).toBeNull();

    fireEvent.click(screen.getByText('clear-error'));
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent(''));
  });
});

describe('AppProviders logout', () => {
  it('clears the session from state and from storage', async () => {
    const repo = createMockAuthRepo();
    const storage = renderWithProviders(repo, new InMemoryTokenStorage(validSession));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(storage.current).toEqual(validSession);

    act(() => {
      fireEvent.click(screen.getByText('logout'));
    });

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    expect(storage.current).toBeNull();
  });
});
