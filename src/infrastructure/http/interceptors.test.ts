import axios, { type AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { InvalidCredentialsError } from '@domain/errors';

import { attachInterceptors } from './interceptors';

interface TestInstance {
  readonly instance: AxiosInstance;
  readonly mock: MockAdapter;
}

const buildInstance = (token: string | null, onUnauthorized: () => void): TestInstance => {
  const instance = axios.create({ baseURL: 'https://api.test.local/' });
  attachInterceptors(instance, { getToken: () => token, onUnauthorized });
  return { instance, mock: new MockAdapter(instance) };
};

describe('request interceptor', () => {
  it('attaches Authorization: Bearer <token> when a token is available', async () => {
    const { instance, mock } = buildInstance('jwt-token', () => undefined);
    let header: string | undefined;
    mock.onGet('echo').reply((config) => {
      header = config.headers?.['Authorization'] as string | undefined;
      return [200, {}];
    });
    await instance.get('echo');
    expect(header).toBe('Bearer jwt-token');
  });

  it('omits Authorization when no token is available', async () => {
    const { instance, mock } = buildInstance(null, () => undefined);
    let header: string | undefined;
    mock.onGet('echo').reply((config) => {
      header = config.headers?.['Authorization'] as string | undefined;
      return [200, {}];
    });
    await instance.get('echo');
    expect(header).toBeUndefined();
  });
});

describe('response interceptor', () => {
  it('rejects with a DomainError (InvalidCredentialsError) on 401 and triggers onUnauthorized', async () => {
    const onUnauthorized = jest.fn();
    const { instance, mock } = buildInstance('jwt', onUnauthorized);
    mock.onGet('secret').reply(401);
    await expect(instance.get('secret')).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not call onUnauthorized for non-401 errors', async () => {
    const onUnauthorized = jest.fn();
    const { instance, mock } = buildInstance('jwt', onUnauthorized);
    mock.onGet('bad').reply(500);
    await expect(instance.get('bad')).rejects.toBeDefined();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
