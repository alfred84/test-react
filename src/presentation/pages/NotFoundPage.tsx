import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@presentation/routing/routes';

export const NotFoundPage: FC = () => (
  <main data-testid="not-found-page" style={{ padding: 24 }}>
    <h1>404 — Página no encontrada</h1>
    <p>La ruta que buscas no existe o fue movida.</p>
    <Link to={ROUTES.home}>Volver al inicio</Link>
  </main>
);
