import { createContext, useContext } from 'react';

import type { IAuthRepository } from '@domain/repositories/IAuthRepository';
import type { IClientRepository } from '@domain/repositories/IClientRepository';
import type { IInterestRepository } from '@domain/repositories/IInterestRepository';

export interface Repositories {
  readonly auth: IAuthRepository;
  readonly clients: IClientRepository;
  readonly interests: IInterestRepository;
}

export const RepositoriesContext = createContext<Repositories | null>(null);
RepositoriesContext.displayName = 'RepositoriesContext';

export const useRepositories = (): Repositories => {
  const ctx = useContext(RepositoriesContext);
  if (!ctx) {
    throw new Error('useRepositories must be used within an <AppProviders />.');
  }
  return ctx;
};

export const useAuthRepository = (): IAuthRepository => useRepositories().auth;
export const useClientRepository = (): IClientRepository => useRepositories().clients;
export const useInterestRepository = (): IInterestRepository => useRepositories().interests;
