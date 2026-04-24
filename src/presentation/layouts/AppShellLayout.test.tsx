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
  it('renders the fixed company title, username and children', async () => {
    setup('/');
    expect(await screen.findByTestId('shell-title')).toHaveTextContent('COMPANIA PRUEBA');
    expect(screen.getByTestId('shell-username')).toHaveTextContent('Ana Rivel');
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('highlights the active nav item based on the current route', async () => {
    setup('/clients');
    expect(await screen.findByTestId('nav-clients')).toHaveClass('Mui-selected');
    expect(screen.getByTestId('nav-home')).not.toHaveClass('Mui-selected');
  });

  it('navigates to /clients when the "Consulta clientes" menu item is clicked', async () => {
    setup('/');
    userEvent.click(await screen.findByTestId('nav-clients'));
    expect(await screen.findByTestId('clients-content')).toBeInTheDocument();
  });

  it('toggles the sidebar between full labels and icon-only without a backdrop', async () => {
    setup('/');
    expect(screen.getByText('Consulta clientes')).toBeInTheDocument();
    expect(document.querySelector('.MuiBackdrop-root')).toBeNull();

    userEvent.click(await screen.findByTestId('shell-menu-button'));
    expect(screen.queryByText('Consulta clientes')).toBeNull();
    expect(document.querySelector('.MuiBackdrop-root')).toBeNull();

    userEvent.click(screen.getByTestId('shell-menu-button'));
    expect(await screen.findByText('Consulta clientes')).toBeInTheDocument();
  });

  it('logs out and redirects to /login when the toolbar button is clicked', async () => {
    setup('/');
    userEvent.click(await screen.findByTestId('shell-logout'));
    await waitFor(() => expect(screen.getByTestId('current-location')).toHaveTextContent('/login'));
  });
});
