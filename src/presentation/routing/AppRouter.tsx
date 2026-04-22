import type { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import { ClientCreatePage } from '@presentation/pages/ClientCreatePage';
import { ClientEditPage } from '@presentation/pages/ClientEditPage';
import { ClientsListPage } from '@presentation/pages/ClientsListPage';
import { HomePage } from '@presentation/pages/HomePage';
import { LoginPage } from '@presentation/pages/LoginPage';
import { NotFoundPage } from '@presentation/pages/NotFoundPage';
import { RegisterPage } from '@presentation/pages/RegisterPage';

import { AuthenticatedRoute } from './AuthenticatedRoute';
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

    <AuthenticatedRoute exact path={ROUTES.home} title="Inicio">
      <HomePage />
    </AuthenticatedRoute>

    <AuthenticatedRoute exact path={ROUTES.clients.list} title="Cuentas clientes">
      <ClientsListPage />
    </AuthenticatedRoute>

    <AuthenticatedRoute exact path={ROUTES.clients.create} title="Nuevo cliente">
      <ClientCreatePage />
    </AuthenticatedRoute>

    <AuthenticatedRoute exact path={ROUTES.clients.edit} title="Editar cliente">
      <ClientEditPage />
    </AuthenticatedRoute>

    <Route>
      <NotFoundPage />
    </Route>
  </Switch>
);
