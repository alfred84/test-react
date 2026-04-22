import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import type { Interest } from '@domain/entities/Interest';
import type { Session } from '@domain/entities/Session';
import { HttpError } from '@infrastructure/http/HttpError';
import { ClientCreatePage } from '@presentation/pages/ClientCreatePage';
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

const INTERESTS: Interest[] = [
  { id: 'i1', description: 'Deportes' },
  { id: 'i2', description: 'Música' },
];

const ListProbe: FC = () => <div data-testid="list-page" />;

const renderPage = (
  configure: (repos: MockRepositories) => void = (repos): void => {
    repos.interests.list.mockResolvedValue(INTERESTS);
  },
): { repositories: MockRepositories } => {
  const repositories = buildMockRepositories();
  configure(repositories);
  const tokenStorage = new InMemoryTokenStorage(SESSION);

  renderWithProviders(
    <Switch>
      <Route exact path={ROUTES.clients.list} component={ListProbe} />
      <Route exact path={ROUTES.clients.create} component={ClientCreatePage} />
    </Switch>,
    {
      repositoriesOverride: repositories,
      tokenStorage,
      initialEntries: [ROUTES.clients.create],
      routePattern: '*',
    },
  );

  return { repositories };
};

const fillMinimalFields = async (): Promise<void> => {
  userEvent.type(screen.getByTestId('form-firstName'), 'Ana');
  userEvent.type(screen.getByTestId('form-lastName'), 'García');
  userEvent.type(screen.getByTestId('form-identification'), 'A-001');
  userEvent.type(screen.getByTestId('form-mobilePhone'), '8888-1111');
  userEvent.type(screen.getByTestId('form-address'), 'Av. Central 123');
  userEvent.type(screen.getByTestId('form-birthDate'), '1990-01-15');
  userEvent.type(screen.getByTestId('form-affiliationDate'), '2024-01-10');
  // MUI v4 Select: options aren't rendered until the select is opened.
  const selectTrigger = screen.getByLabelText('Interés');
  userEvent.click(selectTrigger);
  const option = await screen.findByRole('option', { name: /deportes/i });
  userEvent.click(option);
};

describe('ClientCreatePage', () => {
  it('renders the form and blocks submission when required fields are missing', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: /nuevo cliente/i })).toBeInTheDocument();

    userEvent.click(screen.getByTestId('form-submit'));

    expect(await screen.findByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/los apellidos son obligatorios/i)).toBeInTheDocument();
  });

  it('creates a client and navigates back to the list on success', async () => {
    const { repositories } = renderPage((repos) => {
      repos.interests.list.mockResolvedValue(INTERESTS);
      repos.clients.create.mockResolvedValueOnce(undefined);
    });

    // Wait for interests to finish loading before opening the select.
    await waitFor(() => {
      expect(repositories.interests.list).toHaveBeenCalled();
    });

    await fillMinimalFields();

    userEvent.click(screen.getByTestId('form-submit'));

    await waitFor(() => {
      expect(repositories.clients.create).toHaveBeenCalledTimes(1);
    });

    const [draft, userId] = repositories.clients.create.mock.calls[0]!;
    expect(userId).toBe('user-1');
    expect(draft.firstName).toBe('Ana');
    expect(draft.lastName).toBe('García');
    expect(draft.identification).toBe('A-001');
    expect(draft.interestId).toBe('i1');

    expect(await screen.findByTestId('list-page')).toBeInTheDocument();
    expect(await screen.findByText(/creado correctamente/i)).toBeInTheDocument();
  });

  it('shows an error toast and stays on the page when creation fails', async () => {
    const { repositories } = renderPage((repos) => {
      repos.interests.list.mockResolvedValue(INTERESTS);
      repos.clients.create.mockRejectedValueOnce(new HttpError('boom', 'UNKNOWN', 500));
    });

    await waitFor(() => {
      expect(repositories.interests.list).toHaveBeenCalled();
    });

    await fillMinimalFields();
    userEvent.click(screen.getByTestId('form-submit'));

    expect(await screen.findByText(/problema con la transacción/i)).toBeInTheDocument();
    expect(screen.queryByTestId('list-page')).not.toBeInTheDocument();
  });

  it('navigates back on cancel', async () => {
    renderPage();
    userEvent.click(await screen.findByTestId('form-cancel'));
    expect(await screen.findByTestId('list-page')).toBeInTheDocument();
  });
});
