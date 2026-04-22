import { screen } from '@testing-library/react';

import type { Session } from '@domain/entities/Session';
import { InMemoryTokenStorage } from '@testing/inMemoryStorage';
import { buildMockRepositories } from '@testing/mockRepositories';
import { renderWithProviders } from '@testing/renderWithProviders';

import { HomePage } from './HomePage';

const buildSession = (username: string): Session => ({
  token: 'jwt',
  userId: 'u-1',
  username,
  expiresAt: Date.now() + 60_000,
});

const setup = (username = 'arivel'): void => {
  renderWithProviders(<HomePage />, {
    repositoriesOverride: buildMockRepositories(),
    tokenStorage: new InMemoryTokenStorage(buildSession(username)),
    initialEntries: ['/'],
  });
};

describe('HomePage', () => {
  it('greets the user by their session username', async () => {
    setup('arivel');
    expect(await screen.findByRole('heading', { name: /bienvenido, arivel/i })).toBeInTheDocument();
  });

  it('renders a shortcut to the clients list', async () => {
    setup();
    const button = await screen.findByTestId('home-go-clients');
    expect(button).toHaveAttribute('href', '/clients');
  });
});
