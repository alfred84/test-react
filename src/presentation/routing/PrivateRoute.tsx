import type { FC, ReactNode } from 'react';
import { Redirect, Route, useLocation, type RouteProps } from 'react-router-dom';

import { SplashScreen } from '@presentation/components/SplashScreen';
import { useAuth } from '@presentation/providers/auth/AuthContext';

import { ROUTES, type LocationState } from './routes';

export interface PrivateRouteProps extends Omit<RouteProps, 'children' | 'render' | 'component'> {
  readonly children: ReactNode;
}

/**
 * Only renders its children when the user is authenticated.
 *
 * - While the auth provider is still hydrating the persisted session we
 *   show a splash so we never flash the login screen to returning users.
 * - When the user is unauthenticated we redirect to /login while
 *   preserving the requested location in router state so the login
 *   page can send the user back after authenticating.
 */
export const PrivateRoute: FC<PrivateRouteProps> = ({ children, ...routeProps }) => {
  const { isHydrated, isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <Route
      {...routeProps}
      render={(): ReactNode => {
        if (!isHydrated) return <SplashScreen />;
        if (!isAuthenticated) {
          const state: LocationState = {
            from: { pathname: location.pathname, search: location.search },
          };
          return <Redirect to={{ pathname: ROUTES.login, state }} />;
        }
        return children;
      }}
    />
  );
};
