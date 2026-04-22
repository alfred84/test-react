import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Session } from '@domain/entities/Session';
import { InvalidCredentialsError } from '@domain/errors';
import { buildMockRepositories, type MockRepositories } from '@testing/mockRepositories';
import { renderWithProviders } from '@testing/renderWithProviders';

import { LoginPage } from './LoginPage';

const REMEMBERED_KEY = 'test-react.remembered-username';

const buildSession = (): Session => ({
  token: 'jwt',
  userId: 'user-1',
  username: 'arivel',
  expiresAt: Date.now() + 60_000,
});

const typeUsername = (value: string): void =>
  userEvent.type(screen.getByTestId('login-username'), value);
const typePassword = (value: string): void =>
  userEvent.type(screen.getByTestId('login-password'), value);
const submit = (): void => userEvent.click(screen.getByTestId('login-submit'));

interface Harness {
  readonly repositories: MockRepositories;
}

const setup = (): Harness => {
  const repositories = buildMockRepositories();
  renderWithProviders(<LoginPage />, {
    repositoriesOverride: repositories,
    initialEntries: ['/login'],
  });
  return { repositories };
};

describe('LoginPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the login form with branding copy', () => {
    setup();
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByTestId('login-username')).toBeInTheDocument();
    expect(screen.getByTestId('login-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
    expect(screen.getByTestId('go-to-register')).toHaveAttribute('href', '/register');
  });

  it('blocks submission and shows required messages when fields are empty', async () => {
    const { repositories } = setup();
    submit();
    expect(await screen.findByText(/el usuario es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
    expect(repositories.auth.login).not.toHaveBeenCalled();
  });

  it('submits the form and calls the auth repository with the typed credentials', async () => {
    const { repositories } = setup();
    repositories.auth.login.mockResolvedValueOnce(buildSession());

    typeUsername('arivel');
    typePassword('secret123');
    submit();

    await waitFor(() =>
      expect(repositories.auth.login).toHaveBeenCalledWith({
        username: 'arivel',
        password: 'secret123',
      }),
    );
  });

  it('persists the username when "Recuérdame" is checked', async () => {
    const { repositories } = setup();
    repositories.auth.login.mockResolvedValueOnce(buildSession());

    typeUsername('arivel');
    typePassword('secret123');
    userEvent.click(screen.getByTestId('login-remember'));
    submit();

    await waitFor(() => expect(repositories.auth.login).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(window.localStorage.getItem(REMEMBERED_KEY)).toBe('arivel'));
  });

  it('clears the remembered username when the checkbox is unchecked', async () => {
    window.localStorage.setItem(REMEMBERED_KEY, 'arivel');
    const { repositories } = setup();
    repositories.auth.login.mockResolvedValueOnce(buildSession());

    const remember = screen.getByTestId<HTMLInputElement>('login-remember');
    expect(remember.checked).toBe(true);
    userEvent.click(remember);
    typePassword('secret123');
    submit();

    await waitFor(() => expect(repositories.auth.login).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(window.localStorage.getItem(REMEMBERED_KEY)).toBeNull());
  });

  it('pre-fills the username input when a remembered username is persisted', () => {
    window.localStorage.setItem(REMEMBERED_KEY, 'arivel');
    setup();
    expect(screen.getByTestId('login-username')).toHaveValue('arivel');
  });

  it('surfaces a domain-specific error when login fails with invalid credentials', async () => {
    const { repositories } = setup();
    repositories.auth.login.mockRejectedValueOnce(new InvalidCredentialsError());

    typeUsername('arivel');
    typePassword('wrong');
    submit();

    const alert = await screen.findByTestId('login-error');
    expect(alert).toHaveTextContent(/usuario o contraseña incorrectos/i);
  });
});
