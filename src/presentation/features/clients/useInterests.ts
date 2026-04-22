import { useEffect, useMemo, useReducer } from 'react';

import type { Interest } from '@domain/entities/Interest';
import type { DomainError } from '@domain/errors/DomainError';
import { useInterestRepository } from '@presentation/providers/repositories/RepositoriesContext';

export type InterestsStatus = 'idle' | 'loading' | 'ready' | 'error';

interface InterestsState {
  readonly status: InterestsStatus;
  readonly items: readonly Interest[];
  readonly error: DomainError | null;
}

type InterestsAction =
  | { readonly type: 'LOAD_START' }
  | { readonly type: 'LOAD_SUCCESS'; readonly payload: { readonly items: readonly Interest[] } }
  | { readonly type: 'LOAD_FAILURE'; readonly payload: { readonly error: DomainError } };

const initialState: InterestsState = { status: 'idle', items: [], error: null };

const reducer = (state: InterestsState, action: InterestsAction): InterestsState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', items: action.payload.items, error: null };
    case 'LOAD_FAILURE':
      return { ...state, status: 'error', error: action.payload.error };
  }
};

export interface UseInterestsApi {
  readonly status: InterestsStatus;
  readonly items: readonly Interest[];
  readonly error: DomainError | null;
  readonly isLoading: boolean;
}

/**
 * Lazy-loads the interests catalog once on mount. The endpoint is
 * cacheable upstream so this hook keeps things simple and does not
 * implement memoization across component instances — page owners
 * typically render a single select per screen.
 */
export const useInterests = (): UseInterestsApi => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const repository = useInterestRepository();

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'LOAD_START' });
    repository
      .list()
      .then((items) => {
        if (!cancelled) dispatch({ type: 'LOAD_SUCCESS', payload: { items } });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          dispatch({
            type: 'LOAD_FAILURE',
            payload: { error: error as DomainError },
          });
        }
      });

    return (): void => {
      cancelled = true;
    };
  }, [repository]);

  return useMemo<UseInterestsApi>(
    () => ({
      status: state.status,
      items: state.items,
      error: state.error,
      isLoading: state.status === 'loading' || state.status === 'idle',
    }),
    [state],
  );
};
