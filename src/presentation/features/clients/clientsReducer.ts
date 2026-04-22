import type { ClientSummary } from '@domain/entities/Client';
import type { DomainError } from '@domain/errors/DomainError';

/**
 * Finite states for the client list screen:
 *
 * - idle:     no search has been issued yet.
 * - loading:  a search request is in flight.
 * - ready:    we own a fresh array of results (may be empty).
 * - deleting: a delete request is in flight. We keep the current items
 *             in state so the table doesn't blink while the server
 *             confirms the operation.
 * - error:    the last operation failed. The previous items are kept
 *             so the UI can surface the error without losing context.
 */
export type ClientsStatus = 'idle' | 'loading' | 'ready' | 'deleting' | 'error';

export interface ClientsState {
  readonly status: ClientsStatus;
  readonly items: readonly ClientSummary[];
  readonly error: DomainError | null;
  /** Id of the row currently being removed. Null outside of 'deleting'. */
  readonly pendingDeleteId: string | null;
}

export const initialClientsState: ClientsState = {
  status: 'idle',
  items: [],
  error: null,
  pendingDeleteId: null,
};

export type ClientsAction =
  | { readonly type: 'SEARCH_START' }
  | {
      readonly type: 'SEARCH_SUCCESS';
      readonly payload: { readonly items: readonly ClientSummary[] };
    }
  | { readonly type: 'SEARCH_FAILURE'; readonly payload: { readonly error: DomainError } }
  | { readonly type: 'DELETE_START'; readonly payload: { readonly id: string } }
  | { readonly type: 'DELETE_SUCCESS'; readonly payload: { readonly id: string } }
  | { readonly type: 'DELETE_FAILURE'; readonly payload: { readonly error: DomainError } }
  | { readonly type: 'CLEAR_ERROR' };

export const clientsReducer = (state: ClientsState, action: ClientsAction): ClientsState => {
  switch (action.type) {
    case 'SEARCH_START':
      return { ...state, status: 'loading', error: null };

    case 'SEARCH_SUCCESS':
      return {
        status: 'ready',
        items: action.payload.items,
        error: null,
        pendingDeleteId: null,
      };

    case 'SEARCH_FAILURE':
      return { ...state, status: 'error', error: action.payload.error };

    case 'DELETE_START':
      return {
        ...state,
        status: 'deleting',
        error: null,
        pendingDeleteId: action.payload.id,
      };

    case 'DELETE_SUCCESS':
      return {
        status: 'ready',
        items: state.items.filter((item) => item.id !== action.payload.id),
        error: null,
        pendingDeleteId: null,
      };

    case 'DELETE_FAILURE':
      return {
        ...state,
        status: 'error',
        error: action.payload.error,
        pendingDeleteId: null,
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null, status: state.items.length > 0 ? 'ready' : 'idle' };
  }
};
