import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

import type { Session } from '@domain/entities/Session';
import { InMemoryTokenStorage } from '@testing/inMemoryStorage';
import { buildMockRepositories, type MockRepositories } from '@testing/mockRepositories';
import { renderWithProviders } from '@testing/renderWithProviders';

import { useLogout } from './useLogout';

const buildSession = (): Session => ({
  token: 'jwt',
  userId: 'u-1',
  username: 'arivel',
  expiresAt: Date.now() + 60_000,
});

const LocationProbe: FC = () => {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

const LogoutButton: FC = () => {
  const { logout } = useLogout();
  return (
    <button type="button" onClick={logout} data-testid="logout">
      logout
    </button>
  );
};

interface Harness {
  readonly repositories: MockRepositories;
  readonly tokenStorage: InMemoryTokenStorage;
}

const setup = (): Harness => {
  const repositories = buildMockRepositories();
  const tokenStorage = new InMemoryTokenStorage(buildSession());
  renderWithProviders(
    <Switch>
      <Route exact path="/home">
        <LogoutButton />
      </Route>
      <Route path="*">
        <LocationProbe />
      </Route>
    </Switch>,
    {
      repositoriesOverride: repositories,
      tokenStorage,
      initialEntries: ['/home'],
      routePattern: '/',
    },
  );
  return { repositories, tokenStorage };
};

describe('useLogout', () => {
  it('clears the persisted session, shows feedback and redirects to /login', async () => {
    const { tokenStorage } = setup();
    expect(tokenStorage.current).not.toBeNull();

    userEvent.click(await screen.findByTestId('logout'));

    await waitFor(() => expect(screen.getByTestId('current-location')).toHaveTextContent('/login'));
    expect(tokenStorage.current).toBeNull();
    expect(screen.getByTestId('feedback-alert')).toHaveTextContent(
      /cerraste sesión correctamente/i,
    );
  });
});
