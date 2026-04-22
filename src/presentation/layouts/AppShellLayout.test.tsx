import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

import type { Session } from '@domain/entities/Session';
import { InMemoryTokenStorage } from '@testing/inMemoryStorage';
import { buildMockRepositories } from '@testing/mockRepositories';
import { renderWithProviders } from '@testing/renderWithProviders';

import { AppShellLayout } from './AppShellLayout';

const buildSession = (username: string): Session => ({
  token: 'jwt',
  userId: 'u-1',
  username,
  expiresAt: Date.now() + 60_000,
});

const LocationProbe: FC = () => {
  const location = useLocation();
  return <span data-testid="current-location">{location.pathname}</span>;
};

const setup = (initialPath = '/'): void => {
  const session = buildSession('Ana Rivel');
  renderWithProviders(
    <Switch>
      <Route exact path="/">
        <AppShellLayout title="Inicio">
          <div data-testid="page-content">Home content</div>
        </AppShellLayout>
      </Route>
      <Route exact path="/clients">
        <AppShellLayout title="Consulta clientes">
          <div data-testid="clients-content">Clients list</div>
        </AppShellLayout>
      </Route>
      <Route path="/login">
        <LocationProbe />
      </Route>
      <Route path="*">
        <LocationProbe />
      </Route>
    </Switch>,
    {
      repositoriesOverride: buildMockRepositories(),
      tokenStorage: new InMemoryTokenStorage(session),
      initialEntries: [initialPath],
      routePattern: '/',
    },
  );
};

describe('AppShellLayout', () => {
  it('renders the current page title, username and children', async () => {
    setup('/');
    expect(await screen.findByTestId('shell-title')).toHaveTextContent('Inicio');
    expect(screen.getByTestId('shell-username')).toHaveTextContent('Ana Rivel');
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('highlights the active nav item based on the current route', async () => {
    setup('/clients');
    const clientsItems = await screen.findAllByTestId('nav-clients');
    const homeItems = screen.getAllByTestId('nav-home');
    // MUI's <Hidden implementation="css" /> keeps both mobile + desktop copies
    // in the DOM, so every testid appears twice. The active state must apply
    // uniformly to all copies.
    clientsItems.forEach((el) => expect(el).toHaveClass('Mui-selected'));
    homeItems.forEach((el) => expect(el).not.toHaveClass('Mui-selected'));
  });

  it('navigates to /clients when the "Consulta clientes" menu item is clicked', async () => {
    setup('/');
    const clientsItems = await screen.findAllByTestId('nav-clients');
    const target = clientsItems[0];
    expect(target).toBeDefined();
    userEvent.click(target as HTMLElement);
    expect(await screen.findByTestId('clients-content')).toBeInTheDocument();
  });

  it('logs out and redirects to /login when the toolbar button is clicked', async () => {
    setup('/');
    userEvent.click(await screen.findByTestId('shell-logout'));
    await waitFor(() => expect(screen.getByTestId('current-location')).toHaveTextContent('/login'));
  });
});
