import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import type { Client } from '@domain/entities/Client';
import type { Interest } from '@domain/entities/Interest';
import type { Session } from '@domain/entities/Session';
import { NotFoundError } from '@domain/errors';
import { ClientEditPage } from '@presentation/pages/ClientEditPage';
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

const INTERESTS: Interest[] = [
  { id: 'i1', description: 'Deportes' },
  { id: 'i2', description: 'Música' },
];

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

const ListProbe: FC = () => <div data-testid="list-page" />;

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
      <Route exact path={ROUTES.clients.edit} component={ClientEditPage} />
    </Switch>,
    {
      repositoriesOverride: repositories,
      tokenStorage,
      initialEntries: [buildPath.clientEdit(CLIENT.id)],
      routePattern: '*',
    },
  );

  return { repositories };
};

describe('ClientEditPage', () => {
  it('shows a loader and then pre-fills the form with the loaded client', async () => {
    const { repositories } = renderPage((repos) => {
      repos.clients.getById.mockResolvedValueOnce(CLIENT);
    });

    expect(screen.getByTestId('client-edit-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(repositories.clients.getById).toHaveBeenCalledWith('c1');
    });

    expect(await screen.findByRole('heading', { name: /editar cliente/i })).toBeInTheDocument();
    expect(screen.getByTestId<HTMLInputElement>('form-firstName').value).toBe('Ana');
    expect(screen.getByTestId<HTMLInputElement>('form-lastName').value).toBe('García');
    expect(screen.getByTestId<HTMLInputElement>('form-identification').value).toBe('A-001');
    expect(screen.getByTestId<HTMLInputElement>('form-birthDate').value).toBe('1992-02-01');
  });

  it('renders a not-found message and lets the user return to the list', async () => {
    renderPage((repos) => {
      repos.clients.getById.mockRejectedValueOnce(new NotFoundError('Client', 'c1'));
    });

    const errorBlock = await screen.findByTestId('client-edit-error');
    expect(errorBlock).toHaveTextContent(/no encontramos el cliente/i);

    userEvent.click(screen.getByTestId('client-edit-back'));
    expect(await screen.findByTestId('list-page')).toBeInTheDocument();
  });

  it('updates the client and navigates back on success', async () => {
    const { repositories } = renderPage((repos) => {
      repos.clients.getById.mockResolvedValueOnce(CLIENT);
      repos.clients.update.mockResolvedValueOnce(undefined);
    });

    await screen.findByRole('heading', { name: /editar cliente/i });

    const firstName = screen.getByTestId<HTMLInputElement>('form-firstName');
    userEvent.clear(firstName);
    userEvent.type(firstName, 'Anita');

    userEvent.click(screen.getByTestId('client-edit-save'));

    await waitFor(() => {
      expect(repositories.clients.update).toHaveBeenCalledTimes(1);
    });
    const [id, draft, userId] = repositories.clients.update.mock.calls[0]!;
    expect(id).toBe('c1');
    expect(userId).toBe('user-1');
    expect(draft.firstName).toBe('Anita');
    expect(draft.lastName).toBe('García');
    expect(draft.interestId).toBe('i1');

    expect(await screen.findByTestId('list-page')).toBeInTheDocument();
    expect(await screen.findByText(/actualizado correctamente/i)).toBeInTheDocument();
  });
});
