import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';

import { ENV } from '@config/env';

import { attachInterceptors, type InterceptorDependencies } from './interceptors';

export interface HttpClientOptions {
  readonly extraConfig?: CreateAxiosDefaults;
}

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

export const defaultDeps: InterceptorDependencies = {
  getToken: () => null,
  onUnauthorized: () => {
    /* wired by the AuthProvider at runtime */
  },
};

export const httpClient: AxiosInstance = createHttpClient(ENV.API_BASE_URL, defaultDeps);
