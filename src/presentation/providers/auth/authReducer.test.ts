import type { Session } from '@domain/entities/Session';
import { InvalidCredentialsError } from '@domain/errors';

import { authReducer, initialAuthState, type AuthState } from './authReducer';

const session: Session = {
  token: 'jwt',
  userId: 'user-1',
  username: 'arivel',
  expiresAt: Date.now() + 60_000,
};

describe('authReducer HYDRATE', () => {
  it('transitions to authenticated when a session is found', () => {
    const next = authReducer(initialAuthState, {
      type: 'HYDRATE',
      payload: { session },
    });
    expect(next).toEqual({ status: 'authenticated', session, error: null });
  });

  it('transitions to unauthenticated when no session is found', () => {
    const next = authReducer(initialAuthState, {
      type: 'HYDRATE',
      payload: { session: null },
    });
    expect(next).toEqual({ status: 'unauthenticated', session: null, error: null });
  });

  it('clears any previous error on HYDRATE', () => {
    const dirty: AuthState = {
      status: 'unauthenticated',
      session: null,
      error: new InvalidCredentialsError(),
    };
    const next = authReducer(dirty, { type: 'HYDRATE', payload: { session } });
    expect(next.error).toBeNull();
  });
});

describe('authReducer LOGIN_START', () => {
  it('clears session + error and moves to authenticating', () => {
    const previous: AuthState = {
      status: 'unauthenticated',
      session: null,
      error: new InvalidCredentialsError(),
    };
    const next = authReducer(previous, { type: 'LOGIN_START' });
    expect(next).toEqual({ status: 'authenticating', session: null, error: null });
  });
});

describe('authReducer LOGIN_SUCCESS', () => {
  it('stores the session and marks authenticated', () => {
    const next = authReducer(
      { status: 'authenticating', session: null, error: null },
      { type: 'LOGIN_SUCCESS', payload: { session } },
    );
    expect(next).toEqual({ status: 'authenticated', session, error: null });
  });
});

describe('authReducer LOGIN_FAILURE', () => {
  it('stores the error and moves to unauthenticated with no session', () => {
    const error = new InvalidCredentialsError();
    const next = authReducer(
      { status: 'authenticating', session: null, error: null },
      { type: 'LOGIN_FAILURE', payload: { error } },
    );
    expect(next).toEqual({ status: 'unauthenticated', session: null, error });
  });
});

describe('authReducer LOGOUT', () => {
  it('drops the session and clears error, regardless of previous status', () => {
    const next = authReducer({ status: 'authenticated', session, error: null }, { type: 'LOGOUT' });
    expect(next).toEqual({ status: 'unauthenticated', session: null, error: null });
  });
});

describe('authReducer CLEAR_ERROR', () => {
  it('preserves status and session but clears the error', () => {
    const previous: AuthState = {
      status: 'unauthenticated',
      session: null,
      error: new InvalidCredentialsError(),
    };
    expect(authReducer(previous, { type: 'CLEAR_ERROR' })).toEqual({
      status: 'unauthenticated',
      session: null,
      error: null,
    });
  });
});
