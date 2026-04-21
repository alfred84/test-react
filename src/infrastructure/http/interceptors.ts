import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { HttpError } from './HttpError';

export interface InterceptorDependencies {
  readonly getToken: () => string | null;
  readonly onUnauthorized: () => void;
}

export const attachInterceptors = (
  instance: AxiosInstance,
  deps: InterceptorDependencies,
): void => {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = deps.getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<unknown>) => {
      if (error.response?.status === 401) {
        deps.onUnauthorized();
      }
      return Promise.reject(HttpError.fromAxios(error));
    },
  );
};
