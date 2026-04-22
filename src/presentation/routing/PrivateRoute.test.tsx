import { render, screen } from '@testing-library/react';
import type { FC } from 'react';
import { MemoryRouter, Route, Switch, useLocation } from 'react-router-dom';

import { MockAuthProvider } from '@testing/mockAuthContext';

import { PrivateRoute } from './PrivateRoute';
import type { LocationState } from './routes';

const ProtectedPage: FC = () => <div data-testid="protected">protected content</div>;

const LocationSpy: FC = () => {
  const location = useLocation<LocationState | undefined>();
  const state = location.state;
  return (
    <div data-testid="login-spy">
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="from-pathname">{state?.from?.pathname ?? ''}</span>
      <span data-testid="from-search">{state?.from?.search ?? ''}</span>
    </div>
  );
};

interface Harness {
  readonly initialEntries: string[];
  readonly isHydrated?: boolean;
  readonly isAuthenticated?: boolean;
}

const renderHarness = ({ initialEntries, isHydrated, isAuthenticated }: Harness): void => {
  render(
    <MockAuthProvider isHydrated={isHydrated} isAuthenticated={isAuthenticated}>
      <MemoryRouter initialEntries={initialEntries}>
        <Switch>
          <PrivateRoute exact path="/protected">
            <ProtectedPage />
          </PrivateRoute>
          <Route path="/login">
            <LocationSpy />
          </Route>
        </Switch>
      </MemoryRouter>
    </MockAuthProvider>,
  );
};

describe('PrivateRoute', () => {
  it('renders a splash while the auth provider is still hydrating', () => {
    renderHarness({ initialEntries: ['/protected'], isHydrated: false });
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('renders its children when the user is authenticated', () => {
    renderHarness({
      initialEntries: ['/protected'],
      isHydrated: true,
      isAuthenticated: true,
    });
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });

  it('redirects to /login and preserves the original location when unauthenticated', () => {
    renderHarness({
      initialEntries: ['/protected?tab=1'],
      isHydrated: true,
      isAuthenticated: false,
    });
    expect(screen.getByTestId('login-spy')).toBeInTheDocument();
    expect(screen.getByTestId('pathname')).toHaveTextContent('/login');
    expect(screen.getByTestId('from-pathname')).toHaveTextContent('/protected');
    expect(screen.getByTestId('from-search')).toHaveTextContent('?tab=1');
  });
});
