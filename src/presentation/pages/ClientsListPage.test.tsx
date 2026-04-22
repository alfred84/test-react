import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import type { ClientSummary } from '@domain/entities/Client';
import type { Session } from '@domain/entities/Session';
import { HttpError } from '@infrastructure/http/HttpError';
import { ClientsListPage } from '@presentation/pages/ClientsListPage';
import { ROUTES } from '@presentation/routing/routes';
import { InMemoryTokenStorage } from '@testing/inMemoryStorage';
import { buildMockRepositories, type MockRepositories } from '@testing/mockRepositories';
import { renderWithProviders } from '@testing/renderWithProviders';

const SESSION: Session = {
  token: 'jwt',
  userId: 'user-1',
  username: 'arivel',
  expiresAt: Date.now() + 60_000,
};

const items: ClientSummary[] = [
  { id: '1', identification: 'A-1', firstName: 'Ana', lastName: 'García' },
  { id: '2', identification: 'A-2', firstName: 'Luis', lastName: 'Pérez' },
];

interface RenderResult {
  readonly repositories: MockRepositories;
}

const CreateProbe: FC = () => <div data-testid="create-page" />;
const EditProbe: FC = () => <div data-testid="edit-page" />;
const HomeProbe: FC = () => <div data-testid="home-page" />;

/**
 * Render the page with pre-configured repositories so the initial
 * effect-driven search sees a valid mocked response. Callers pass a
 * configurator that sets up the default resolutions before mount.
 */
const renderPage = (
  configure: (repositories: MockRepositories) => void = (repos): void => {
    repos.clients.list.mockResolvedValue(items);
  },
): RenderResult => {
  const repositories = buildMockRepositories();
  configure(repositories);
  const tokenStorage = new InMemoryTokenStorage(SESSION);

  const ui = (
    <Switch>
      <Route exact path={ROUTES.home} component={HomeProbe} />
      <Route exact path={ROUTES.clients.create} component={CreateProbe} />
      <Route exact path={ROUTES.clients.edit} component={EditProbe} />
      <Route exact path={ROUTES.clients.list} component={ClientsListPage} />
    </Switch>
  );

  renderWithProviders(ui, {
    repositoriesOverride: repositories,
    tokenStorage,
    initialEntries: [ROUTES.clients.list],
    routePattern: '*',
  });

  return { repositories };
};

describe('ClientsListPage', () => {
  it('fetches and renders the initial list on mount', async () => {
    const { repositories } = renderPage();

    expect(
      await screen.findByRole('heading', { name: /consulta de clientes/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(repositories.clients.list).toHaveBeenCalledWith({}, 'user-1');
    });
    expect(await screen.findByTestId('client-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('client-row-2')).toBeInTheDocument();
  });

  it('re-queries the repository with trimmed filters on search', async () => {
    const { repositories } = renderPage((repos) => {
      repos.clients.list.mockResolvedValueOnce(items);
      repos.clients.list.mockResolvedValueOnce([items[0]!]);
    });

    await screen.findByTestId('client-row-1');

    userEvent.type(screen.getByTestId('filter-identification'), '  A-1  ');
    userEvent.type(screen.getByTestId('filter-name'), ' Ana ');
    userEvent.click(screen.getByTestId('filter-submit'));

    await waitFor(() => {
      expect(repositories.clients.list).toHaveBeenLastCalledWith(
        { identification: 'A-1', name: 'Ana' },
        'user-1',
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('client-row-2')).not.toBeInTheDocument();
    });
  });

  it('navigates to the create page via the "Agregar cliente" button', async () => {
    renderPage();

    await screen.findByTestId('client-row-1');

    userEvent.click(screen.getByTestId('clients-add'));
    expect(await screen.findByTestId('create-page')).toBeInTheDocument();
  });

  it('navigates home via the "Regresar" button', async () => {
    renderPage();

    await screen.findByTestId('client-row-1');

    userEvent.click(screen.getByTestId('clients-back'));
    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });

  it('navigates to edit page when clicking the edit action', async () => {
    renderPage();

    await screen.findByTestId('client-row-1');

    userEvent.click(screen.getByTestId('client-edit-1'));
    expect(await screen.findByTestId('edit-page')).toBeInTheDocument();
  });

  it('asks for confirmation before deleting and removes the row on success', async () => {
    const { repositories } = renderPage((repos) => {
      repos.clients.list.mockResolvedValue(items);
      repos.clients.delete.mockResolvedValueOnce(undefined);
    });

    await screen.findByTestId('client-row-1');

    userEvent.click(screen.getByTestId('client-delete-1'));
    const dialog = await screen.findByTestId('confirm-dialog');
    expect(within(dialog).getByText(/ana garcía/i)).toBeInTheDocument();

    userEvent.click(screen.getByTestId('confirm-dialog-confirm'));

    await waitFor(() => {
      expect(repositories.clients.delete).toHaveBeenCalledWith('1');
    });
    await waitFor(() => {
      expect(screen.queryByTestId('client-row-1')).not.toBeInTheDocument();
    });
    expect(await screen.findByText(/eliminado correctamente/i)).toBeInTheDocument();
  });

  it('closes the confirmation dialog without calling delete when cancelled', async () => {
    const { repositories } = renderPage();

    await screen.findByTestId('client-row-1');

    userEvent.click(screen.getByTestId('client-delete-1'));
    await screen.findByTestId('confirm-dialog');
    userEvent.click(screen.getByTestId('confirm-dialog-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
    expect(repositories.clients.delete).not.toHaveBeenCalled();
    expect(screen.getByTestId('client-row-1')).toBeInTheDocument();
  });

  it('surfaces an error toast when the delete fails and keeps the row', async () => {
    renderPage((repos) => {
      repos.clients.list.mockResolvedValue(items);
      repos.clients.delete.mockRejectedValueOnce(new HttpError('boom', 'UNKNOWN', 500));
    });

    await screen.findByTestId('client-row-1');

    userEvent.click(screen.getByTestId('client-delete-1'));
    await screen.findByTestId('confirm-dialog');
    userEvent.click(screen.getByTestId('confirm-dialog-confirm'));

    expect(await screen.findByText(/problema con la transacción/i)).toBeInTheDocument();
    expect(screen.getByTestId('client-row-1')).toBeInTheDocument();
  });
});
