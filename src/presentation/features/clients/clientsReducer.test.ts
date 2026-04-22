import type { ClientSummary } from '@domain/entities/Client';
import { HttpError } from '@infrastructure/http/HttpError';

import { clientsReducer, initialClientsState, type ClientsState } from './clientsReducer';

const summary = (id: string, identification: string = id): ClientSummary => ({
  id,
  identification,
  firstName: 'John',
  lastName: 'Doe',
});

const ERR = new HttpError('boom', 'UNKNOWN', 500);

describe('clientsReducer', () => {
  it('starts idle with no items, no error and no pending delete', () => {
    expect(initialClientsState).toEqual<ClientsState>({
      status: 'idle',
      items: [],
      error: null,
      pendingDeleteId: null,
    });
  });

  it('SEARCH_START transitions to loading and clears previous error', () => {
    const errored: ClientsState = { ...initialClientsState, status: 'error', error: ERR };
    expect(clientsReducer(errored, { type: 'SEARCH_START' })).toEqual<ClientsState>({
      ...errored,
      status: 'loading',
      error: null,
    });
  });

  it('SEARCH_SUCCESS replaces the items and moves to ready', () => {
    const items = [summary('1'), summary('2')];
    const next = clientsReducer(initialClientsState, {
      type: 'SEARCH_SUCCESS',
      payload: { items },
    });
    expect(next).toEqual<ClientsState>({
      status: 'ready',
      items,
      error: null,
      pendingDeleteId: null,
    });
  });

  it('SEARCH_FAILURE moves to error keeping previous items', () => {
    const ready: ClientsState = {
      ...initialClientsState,
      status: 'ready',
      items: [summary('1')],
    };
    const next = clientsReducer(ready, { type: 'SEARCH_FAILURE', payload: { error: ERR } });
    expect(next.status).toBe('error');
    expect(next.items).toEqual(ready.items);
    expect(next.error).toBe(ERR);
  });

  it('DELETE_START records the pending id and moves to deleting', () => {
    const ready: ClientsState = {
      ...initialClientsState,
      status: 'ready',
      items: [summary('1'), summary('2')],
    };
    const next = clientsReducer(ready, { type: 'DELETE_START', payload: { id: '1' } });
    expect(next.status).toBe('deleting');
    expect(next.pendingDeleteId).toBe('1');
    expect(next.items).toEqual(ready.items);
  });

  it('DELETE_SUCCESS removes the matching item and returns to ready', () => {
    const deleting: ClientsState = {
      status: 'deleting',
      items: [summary('1'), summary('2')],
      error: null,
      pendingDeleteId: '1',
    };
    const next = clientsReducer(deleting, { type: 'DELETE_SUCCESS', payload: { id: '1' } });
    expect(next.status).toBe('ready');
    expect(next.items.map((i) => i.id)).toEqual(['2']);
    expect(next.pendingDeleteId).toBeNull();
  });

  it('DELETE_FAILURE keeps items and clears the pending id', () => {
    const deleting: ClientsState = {
      status: 'deleting',
      items: [summary('1')],
      error: null,
      pendingDeleteId: '1',
    };
    const next = clientsReducer(deleting, { type: 'DELETE_FAILURE', payload: { error: ERR } });
    expect(next.status).toBe('error');
    expect(next.items).toEqual(deleting.items);
    expect(next.pendingDeleteId).toBeNull();
    expect(next.error).toBe(ERR);
  });

  it('CLEAR_ERROR returns to ready when items exist, idle otherwise', () => {
    const withItems: ClientsState = {
      status: 'error',
      items: [summary('1')],
      error: ERR,
      pendingDeleteId: null,
    };
    expect(clientsReducer(withItems, { type: 'CLEAR_ERROR' }).status).toBe('ready');

    const empty: ClientsState = {
      status: 'error',
      items: [],
      error: ERR,
      pendingDeleteId: null,
    };
    expect(clientsReducer(empty, { type: 'CLEAR_ERROR' }).status).toBe('idle');
  });
});
