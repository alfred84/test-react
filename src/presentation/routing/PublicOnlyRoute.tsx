import type { FC, ReactNode } from 'react';
import { Redirect, Route, useLocation, type RouteProps } from 'react-router-dom';

import { SplashScreen } from '@presentation/components/SplashScreen';
import { useAuth } from '@presentation/providers/auth/AuthContext';

import { ROUTES, type LocationState } from './routes';

export interface PublicOnlyRouteProps extends Omit<
  RouteProps,
  'children' | 'render' | 'component'
> {
  readonly children: ReactNode;
}

/**
 * Renders its children only for unauthenticated users. If an authenticated
 * user hits /login or /register we bounce them to the location they came
 * from (when available) or to /home.
 */
export const PublicOnlyRoute: FC<PublicOnlyRouteProps> = ({ children, ...routeProps }) => {
  const { isHydrated, isAuthenticated } = useAuth();
  const location = useLocation<LocationState | undefined>();

  return (
    <Route
      {...routeProps}
      render={(): ReactNode => {
        if (!isHydrated) return <SplashScreen />;
        if (isAuthenticated) {
          const from = location.state?.from;
          const target = from ? `${from.pathname}${from.search}` : ROUTES.home;
          return <Redirect to={target} />;
        }
        return children;
      }}
    />
  );
};
