import { useCallback, useMemo, useReducer } from 'react';

import type { ClientFilters, ClientSummary } from '@domain/entities/Client';
import type { DomainError } from '@domain/errors/DomainError';
import { useAuth } from '@presentation/providers/auth/AuthContext';
import { useClientRepository } from '@presentation/providers/repositories/RepositoriesContext';

import { clientsReducer, initialClientsState, type ClientsStatus } from './clientsReducer';

export interface UseClientsApi {
  readonly status: ClientsStatus;
  readonly items: readonly ClientSummary[];
  readonly error: DomainError | null;
  readonly pendingDeleteId: string | null;
  readonly isBusy: boolean;
  /** Re-runs the list endpoint with the given filters. Throws on failure. */
  readonly search: (filters: ClientFilters) => Promise<void>;
  /** Calls DELETE and locally removes the row on success. Throws on failure. */
  readonly remove: (id: string) => Promise<void>;
  readonly clearError: () => void;
}

/**
 * Top-level hook for the clients list screen. Wraps the client
 * repository in a `useReducer` state machine and injects the session
 * userId automatically for requests that need it.
 *
 * Kept deliberately stateless in its parameters so the list page can
 * own the current filter set via react-hook-form and still get stable
 * `search` / `remove` references across renders.
 */
export const useClients = (): UseClientsApi => {
  const [state, dispatch] = useReducer(clientsReducer, initialClientsState);
  const repository = useClientRepository();
  const auth = useAuth();
  const userId = auth.session?.userId ?? '';

  const search = useCallback(
    async (filters: ClientFilters): Promise<void> => {
      dispatch({ type: 'SEARCH_START' });
      try {
        const items = await repository.list(filters, userId);
        dispatch({ type: 'SEARCH_SUCCESS', payload: { items } });
      } catch (error) {
        dispatch({ type: 'SEARCH_FAILURE', payload: { error: error as DomainError } });
        throw error;
      }
    },
    [repository, userId],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      dispatch({ type: 'DELETE_START', payload: { id } });
      try {
        await repository.delete(id);
        dispatch({ type: 'DELETE_SUCCESS', payload: { id } });
      } catch (error) {
        dispatch({ type: 'DELETE_FAILURE', payload: { error: error as DomainError } });
        throw error;
      }
    },
    [repository],
  );

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return useMemo<UseClientsApi>(
    () => ({
      status: state.status,
      items: state.items,
      error: state.error,
      pendingDeleteId: state.pendingDeleteId,
      isBusy: state.status === 'loading' || state.status === 'deleting',
      search,
      remove,
      clearError,
    }),
    [state, search, remove, clearError],
  );
};
