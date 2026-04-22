import type { FC, ReactNode } from 'react';
import type { RouteProps } from 'react-router-dom';

import { AppShellLayout } from '@presentation/layouts/AppShellLayout';

import { PrivateRoute } from './PrivateRoute';

export interface AuthenticatedRouteProps extends Omit<
  RouteProps,
  'children' | 'render' | 'component'
> {
  readonly children: ReactNode;
  /** Rendered in the AppBar title and used as the tab name. */
  readonly title: string;
}

/**
 * Private route that wraps its children with the authenticated
 * application shell (AppBar + Drawer). Using a dedicated component
 * avoids repeating the shell markup inside every protected page.
 */
export const AuthenticatedRoute: FC<AuthenticatedRouteProps> = ({
  children,
  title,
  ...routeProps
}) => (
  <PrivateRoute {...routeProps}>
    <AppShellLayout title={title}>{children}</AppShellLayout>
  </PrivateRoute>
);
