import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';

import { attachInterceptors, type InterceptorDependencies } from './interceptors';

export interface HttpClientOptions {
  readonly extraConfig?: CreateAxiosDefaults;
}

/**
 * Creates a configured axios instance.
 *
 * The caller injects `getToken` and `onUnauthorized` (typically via
 * closures over the current authentication state), so the http client
 * can be treated as a pure factory with no hidden module-level state.
 */
export const createHttpClient = (
  baseURL: string,
  deps: InterceptorDependencies,
  options: HttpClientOptions = {},
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
    ...options.extraConfig,
  });
  attachInterceptors(instance, deps);
  return instance;
};
