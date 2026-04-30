import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import type { Client } from '@domain/entities/Client';
import type { Interest } from '@domain/entities/Interest';
import type { Session } from '@domain/entities/Session';
import { NotFoundError } from '@domain/errors';
import { ClientDetailPage } from '@presentation/pages/ClientDetailPage';
import { buildPath, ROUTES } from '@presentation/routing/routes';
import { InMemoryTokenStorage } from '@testing/inMemoryStorage';
import { buildMockRepositories, type MockRepositories } from '@testing/mockRepositories';
import { renderWithProviders } from '@testing/renderWithProviders';

const SESSION: Session = {
  token: 'jwt',
  userId: 'user-1',
  username: 'arivel',
  expiresAt: Date.now() + 60_000,
};

const INTERESTS: Interest[] = [{ id: 'i1', description: 'Deportes' }];

const CLIENT: Client = {
  id: 'c1',
  firstName: 'Ana',
  lastName: 'García',
  identification: 'A-001',
  mobilePhone: '8888-0000',
  otherPhone: '',
  address: 'Av. Central 123',
  birthDate: '1992-02-01T00:00:00.000Z',
  affiliationDate: '2024-01-10T00:00:00.000Z',
  gender: 'F',
  personalReview: 'VIP',
  image: null,
  interestId: 'i1',
};

const CLIENT_WITH_IMAGE: Client = {
  ...CLIENT,
  image: 'data:image/png;base64,AAAA',
};

const ListProbe: FC = () => <div data-testid="list-page" />;
const EditProbe: FC = () => <div data-testid="edit-page" />;

const renderPage = (
  configure: (repos: MockRepositories) => void,
): { repositories: MockRepositories } => {
  const repositories = buildMockRepositories();
  repositories.interests.list.mockResolvedValue(INTERESTS);
  configure(repositories);
  const tokenStorage = new InMemoryTokenStorage(SESSION);

  renderWithProviders(
    <Switch>
      <Route exact path={ROUTES.clients.list} component={ListProbe} />
      <Route exact path={ROUTES.clients.edit} component={EditProbe} />
      <Route exact path={ROUTES.clients.detail} component={ClientDetailPage} />
    </Switch>,
    {
      repositoriesOverride: repositories,
      tokenStorage,
      initialEntries: [buildPath.clientDetail(CLIENT.id)],
      routePattern: '*',
    },
  );

  return { repositories };
};

describe('ClientDetailPage', () => {
  it('shows a loader and then renders the loaded client details', async () => {
    const { repositories } = renderPage((repos) => {
      repos.clients.getById.mockResolvedValueOnce(CLIENT);
    });

    expect(screen.getByTestId('client-detail-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(repositories.clients.getById).toHaveBeenCalledWith('c1');
    });

    expect(await screen.findByRole('heading', { name: /detalle de cliente/i })).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('A-001')).toBeInTheDocument();
    expect(screen.getByText('Deportes')).toBeInTheDocument();
    expect(screen.getByTestId('client-detail-image-fallback')).toBeInTheDocument();
  });

  it('renders a not-found message and lets the user return to the list', async () => {
    renderPage((repos) => {
      repos.clients.getById.mockRejectedValueOnce(new NotFoundError('Client', 'c1'));
    });

    const errorBlock = await screen.findByTestId('client-detail-error');
    expect(errorBlock).toHaveTextContent(/no encontramos el cliente/i);

    userEvent.click(screen.getByTestId('client-detail-back'));
    expect(await screen.findByTestId('list-page')).toBeInTheDocument();
  });

  it('navigates to edit page when clicking the Editar button', async () => {
    renderPage((repos) => {
      repos.clients.getById.mockResolvedValueOnce(CLIENT);
    });

    await screen.findByRole('heading', { name: /detalle de cliente/i });
    userEvent.click(screen.getByTestId('client-detail-edit'));
    expect(await screen.findByTestId('edit-page')).toBeInTheDocument();
  });

  it('renders the client image when present', async () => {
    renderPage((repos) => {
      repos.clients.getById.mockResolvedValueOnce(CLIENT_WITH_IMAGE);
    });

    await screen.findByRole('heading', { name: /detalle de cliente/i });
    expect(screen.getByAltText('Foto de Ana')).toBeInTheDocument();
    expect(screen.queryByTestId('client-detail-image-fallback')).not.toBeInTheDocument();
  });
});
