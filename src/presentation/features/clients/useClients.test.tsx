import { act, renderHook } from '@testing-library/react-hooks';
import type { FC, ReactNode } from 'react';

import { AppProviders } from '@app/AppProviders';
import type { ClientSummary } from '@domain/entities/Client';
import type { Session } from '@domain/entities/Session';
import { InvalidCredentialsError } from '@domain/errors';
import { HttpError } from '@infrastructure/http/HttpError';
import { InMemoryTokenStorage } from '@testing/inMemoryStorage';
import { buildMockRepositories, type MockRepositories } from '@testing/mockRepositories';

import { useClients } from './useClients';

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

interface Harness {
  readonly wrapper: FC<{ readonly children: ReactNode }>;
  readonly repositories: MockRepositories;
}

const buildHarness = (): Harness => {
  const repositories = buildMockRepositories();
  const tokenStorage = new InMemoryTokenStorage(SESSION);
  const wrapper: FC<{ readonly children: ReactNode }> = ({ children }) => (
    <AppProviders tokenStorage={tokenStorage} repositoriesOverride={repositories}>
      {children}
    </AppProviders>
  );
  return { wrapper, repositories };
};

describe('useClients', () => {
  it('starts idle with no items', () => {
    const { wrapper } = buildHarness();
    const { result } = renderHook(() => useClients(), { wrapper });
    expect(result.current.status).toBe('idle');
    expect(result.current.items).toEqual([]);
  });

  it('search() forwards filters + session userId to the repository and stores the items', async () => {
    const { wrapper, repositories } = buildHarness();
    repositories.clients.list.mockResolvedValueOnce(items);
    const { result, waitForNextUpdate } = renderHook(() => useClients(), { wrapper });

    await act(async () => {
      await result.current.search({ identification: 'A', name: 'Ana' });
      await waitForNextUpdate().catch(() => undefined);
    });

    expect(repositories.clients.list).toHaveBeenCalledWith(
      { identification: 'A', name: 'Ana' },
      'user-1',
    );
    expect(result.current.status).toBe('ready');
    expect(result.current.items).toEqual(items);
  });

  it('search() surfaces errors through state and rethrows', async () => {
    const { wrapper, repositories } = buildHarness();
    const err = new InvalidCredentialsError();
    repositories.clients.list.mockRejectedValueOnce(err);
    const { result } = renderHook(() => useClients(), { wrapper });

    let captured: unknown;
    await act(async () => {
      await result.current.search({}).catch((e: unknown) => {
        captured = e;
      });
    });

    expect(captured).toBe(err);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(err);
  });

  it('remove() deletes via the repository and drops the row locally', async () => {
    const { wrapper, repositories } = buildHarness();
    repositories.clients.list.mockResolvedValueOnce(items);
    repositories.clients.delete.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useClients(), { wrapper });
    await act(async () => {
      await result.current.search({});
    });

    await act(async () => {
      await result.current.remove('1');
    });

    expect(repositories.clients.delete).toHaveBeenCalledWith('1');
    expect(result.current.items.map((i) => i.id)).toEqual(['2']);
    expect(result.current.status).toBe('ready');
  });

  it('remove() surfaces the error, keeps items and clears the pending id', async () => {
    const { wrapper, repositories } = buildHarness();
    repositories.clients.list.mockResolvedValueOnce(items);
    repositories.clients.delete.mockRejectedValueOnce(new HttpError('boom', 'UNKNOWN', 500));

    const { result } = renderHook(() => useClients(), { wrapper });
    await act(async () => {
      await result.current.search({});
    });

    let captured: unknown;
    await act(async () => {
      await result.current.remove('1').catch((e: unknown) => {
        captured = e;
      });
    });

    expect(captured).toBeInstanceOf(HttpError);
    expect(result.current.status).toBe('error');
    expect(result.current.items).toEqual(items);
    expect(result.current.pendingDeleteId).toBeNull();
  });
});
