import type { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createHttpClient } from '@infrastructure/http/axiosInstance';

export const TEST_API_BASE_URL = 'https://api.test.local/';

export interface TestHttpClient {
  readonly instance: AxiosInstance;
  readonly mock: MockAdapter;
  readonly restore: () => void;
}

/**
 * Creates an axios instance wired with the real interceptors and plugs an
 * axios-mock-adapter into it so tests can stub responses at the adapter layer.
 */
export const createTestHttpClient = (
  token: string | null = null,
  onUnauthorized: () => void = () => undefined,
): TestHttpClient => {
  const instance = createHttpClient(TEST_API_BASE_URL, {
    getToken: () => token,
    onUnauthorized,
  });
  const mock = new MockAdapter(instance);
  return { instance, mock, restore: () => mock.restore() };
};

export const buildUrl = (path: string): string => `${TEST_API_BASE_URL}${path}`;
