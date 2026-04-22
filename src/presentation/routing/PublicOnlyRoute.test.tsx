import { render, screen } from '@testing-library/react';
import type { FC } from 'react';
import { MemoryRouter, Route, Switch, useLocation } from 'react-router-dom';

import { MockAuthProvider } from '@testing/mockAuthContext';

import { PublicOnlyRoute } from './PublicOnlyRoute';
import type { LocationState } from './routes';

const LoginMock: FC = () => <div data-testid="login">login page</div>;
const HomeMock: FC = () => {
  const location = useLocation();
  return (
    <div data-testid="home">
      <span data-testid="home-pathname">{location.pathname}</span>
      <span data-testid="home-search">{location.search}</span>
    </div>
  );
};

interface Harness {
  readonly initialEntries: Array<
    string | { pathname: string; search?: string; state?: LocationState }
  >;
  readonly isHydrated?: boolean;
  readonly isAuthenticated?: boolean;
}

const renderHarness = ({ initialEntries, isHydrated, isAuthenticated }: Harness): void => {
  render(
    <MockAuthProvider isHydrated={isHydrated} isAuthenticated={isAuthenticated}>
      <MemoryRouter initialEntries={initialEntries}>
        <Switch>
          <PublicOnlyRoute exact path="/login">
            <LoginMock />
          </PublicOnlyRoute>
          <Route path="*">
            <HomeMock />
          </Route>
        </Switch>
      </MemoryRouter>
    </MockAuthProvider>,
  );
};

describe('PublicOnlyRoute', () => {
  it('renders the splash while hydrating', () => {
    renderHarness({ initialEntries: ['/login'], isHydrated: false });
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });

  it('renders its children when the user is unauthenticated', () => {
    renderHarness({ initialEntries: ['/login'], isAuthenticated: false });
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('redirects authenticated users to the home route by default', () => {
    renderHarness({ initialEntries: ['/login'], isAuthenticated: true });
    expect(screen.getByTestId('home')).toBeInTheDocument();
    expect(screen.getByTestId('home-pathname')).toHaveTextContent('/');
  });

  it('redirects authenticated users back to the "from" location when present', () => {
    renderHarness({
      initialEntries: [
        { pathname: '/login', state: { from: { pathname: '/clients', search: '?page=2' } } },
      ],
      isAuthenticated: true,
    });
    expect(screen.getByTestId('home-pathname')).toHaveTextContent('/clients');
    expect(screen.getByTestId('home-search')).toHaveTextContent('?page=2');
  });
});
