import { renderHook } from '@testing-library/react-hooks';
import type { FC, ReactNode } from 'react';

import { AppProviders } from '@app/AppProviders';
import type { Interest } from '@domain/entities/Interest';
import { HttpError } from '@infrastructure/http/HttpError';
import { InMemoryTokenStorage } from '@testing/inMemoryStorage';
import { buildMockRepositories, type MockRepositories } from '@testing/mockRepositories';

import { useInterests } from './useInterests';

const INTERESTS: Interest[] = [
  { id: '1', description: 'Deportes' },
  { id: '2', description: 'Música' },
];

interface Harness {
  readonly wrapper: FC<{ readonly children: ReactNode }>;
  readonly repositories: MockRepositories;
}

const buildHarness = (): Harness => {
  const repositories = buildMockRepositories();
  const tokenStorage = new InMemoryTokenStorage();
  const wrapper: FC<{ readonly children: ReactNode }> = ({ children }) => (
    <AppProviders tokenStorage={tokenStorage} repositoriesOverride={repositories}>
      {children}
    </AppProviders>
  );
  return { wrapper, repositories };
};

describe('useInterests', () => {
  it('loads the list on mount and exposes ready state', async () => {
    const { wrapper, repositories } = buildHarness();
    repositories.interests.list.mockResolvedValueOnce(INTERESTS);

    const { result, waitForValueToChange } = renderHook(() => useInterests(), { wrapper });
    expect(result.current.status).toBe('loading');

    await waitForValueToChange(() => result.current.status);
    expect(result.current.status).toBe('ready');
    expect(result.current.items).toEqual(INTERESTS);
    expect(repositories.interests.list).toHaveBeenCalledTimes(1);
  });

  it('stores the error when the repository fails', async () => {
    const { wrapper, repositories } = buildHarness();
    const err = new HttpError('boom', 'UNKNOWN', 500);
    repositories.interests.list.mockRejectedValueOnce(err);

    const { result, waitForValueToChange } = renderHook(() => useInterests(), { wrapper });
    await waitForValueToChange(() => result.current.status);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(err);
    expect(result.current.items).toEqual([]);
  });
});
