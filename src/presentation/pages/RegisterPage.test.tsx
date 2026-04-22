import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

import { HttpError } from '@infrastructure/http/HttpError';
import { buildMockRepositories, type MockRepositories } from '@testing/mockRepositories';
import { renderWithProviders } from '@testing/renderWithProviders';

import { RegisterPage } from './RegisterPage';

const CurrentLocation: FC = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

const typeUsername = (value: string): void =>
  userEvent.type(screen.getByTestId('register-username'), value);
const typeEmail = (value: string): void =>
  userEvent.type(screen.getByTestId('register-email'), value);
const typePassword = (value: string): void =>
  userEvent.type(screen.getByTestId('register-password'), value);
const submit = (): void => userEvent.click(screen.getByTestId('register-submit'));

interface Harness {
  readonly repositories: MockRepositories;
}

const setup = (): Harness => {
  const repositories = buildMockRepositories();
  renderWithProviders(
    <Switch>
      <Route exact path="/register">
        <RegisterPage />
      </Route>
      <Route path="*">
        <CurrentLocation />
      </Route>
    </Switch>,
    {
      repositoriesOverride: repositories,
      initialEntries: ['/register'],
      routePattern: '/',
    },
  );
  return { repositories };
};

describe('RegisterPage', () => {
  it('shows required-field errors when submitting an empty form', async () => {
    const { repositories } = setup();
    submit();
    expect(await screen.findByText(/el usuario es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
    expect(repositories.auth.register).not.toHaveBeenCalled();
  });

  it('rejects an invalid email format', async () => {
    const { repositories } = setup();
    typeUsername('arivel');
    typeEmail('not-an-email');
    typePassword('Abcdefghi1');
    submit();
    expect(await screen.findByText(/correo electrónico válido/i)).toBeInTheDocument();
    expect(repositories.auth.register).not.toHaveBeenCalled();
  });

  it('rejects a password that fails the policy', async () => {
    const { repositories } = setup();
    typeUsername('arivel');
    typeEmail('arivel@example.com');
    typePassword('short1');
    submit();
    expect(await screen.findByText(/más de 8 caracteres/i)).toBeInTheDocument();
    expect(repositories.auth.register).not.toHaveBeenCalled();
  });

  it('calls the auth repository and redirects to /login on success', async () => {
    const { repositories } = setup();
    repositories.auth.register.mockResolvedValueOnce({
      status: 'Success',
      message: 'Usuario creado correctamente',
    });

    typeUsername('arivel');
    typeEmail('arivel@example.com');
    typePassword('Abcdefghi1');
    submit();

    await waitFor(() =>
      expect(repositories.auth.register).toHaveBeenCalledWith({
        username: 'arivel',
        email: 'arivel@example.com',
        password: 'Abcdefghi1',
      }),
    );
    await waitFor(() => expect(screen.getByTestId('current-location')).toHaveTextContent('/login'));
  });

  it('surfaces a domain error when the api rejects the registration', async () => {
    const { repositories } = setup();
    repositories.auth.register.mockRejectedValueOnce(new HttpError('server down', 'UNKNOWN', 500));

    typeUsername('arivel');
    typeEmail('arivel@example.com');
    typePassword('Abcdefghi1');
    submit();

    const alert = await screen.findByTestId('register-error');
    expect(alert).toHaveTextContent(/problema con la transacción/i);
  });
});
