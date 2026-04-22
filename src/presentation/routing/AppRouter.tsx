import type { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import { ClientCreatePage } from '@presentation/pages/ClientCreatePage';
import { ClientEditPage } from '@presentation/pages/ClientEditPage';
import { ClientsListPage } from '@presentation/pages/ClientsListPage';
import { HomePage } from '@presentation/pages/HomePage';
import { LoginPage } from '@presentation/pages/LoginPage';
import { NotFoundPage } from '@presentation/pages/NotFoundPage';
import { RegisterPage } from '@presentation/pages/RegisterPage';

import { PrivateRoute } from './PrivateRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { ROUTES } from './routes';

export const AppRouter: FC = () => (
  <Switch>
    <PublicOnlyRoute exact path={ROUTES.login}>
      <LoginPage />
    </PublicOnlyRoute>

    <PublicOnlyRoute exact path={ROUTES.register}>
      <RegisterPage />
    </PublicOnlyRoute>

    <PrivateRoute exact path={ROUTES.home}>
      <HomePage />
    </PrivateRoute>

    <PrivateRoute exact path={ROUTES.clients.list}>
      <ClientsListPage />
    </PrivateRoute>

    <PrivateRoute exact path={ROUTES.clients.create}>
      <ClientCreatePage />
    </PrivateRoute>

    <PrivateRoute exact path={ROUTES.clients.edit}>
      <ClientEditPage />
    </PrivateRoute>

    <Route>
      <NotFoundPage />
    </Route>
  </Switch>
);
