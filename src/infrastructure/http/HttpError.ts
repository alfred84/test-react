import type { AxiosError } from 'axios';

import { InvalidCredentialsError, NotFoundError, UnauthorizedError } from '@domain/errors';
import { DomainError, type DomainErrorCode } from '@domain/errors/DomainError';

/**
 * Serialisable snapshot of the parts of an AxiosError we care about.
 * Storing the raw error as `cause` is unsafe because axios retains
 * circular references (e.g. `_currentRequest` → `_redirectable`) that
 * break Jest worker serialisation and production telemetry alike.
 */
export interface HttpErrorCause {
  readonly status: number | null;
  readonly url: string | null;
  readonly method: string | null;
  readonly message: string;
}

const sanitize = (error: AxiosError<unknown>): HttpErrorCause => ({
  status: error.response?.status ?? null,
  url: error.config?.url ?? null,
  method: error.config?.method?.toUpperCase() ?? null,
  message: error.message,
});

export class HttpError extends DomainError {
  public readonly code: DomainErrorCode;

  public constructor(
    message: string,
    code: DomainErrorCode,
    public readonly status: number | null,
    cause?: HttpErrorCause,
  ) {
    super(message, cause);
    this.code = code;
  }

  public static fromAxios(error: AxiosError<unknown>): DomainError {
    const cause = sanitize(error);
    const data = error.response?.data as { message?: string } | undefined;
    const message = data?.message ?? error.message ?? 'Unexpected network error.';

    if (cause.status === 401) {
      return new InvalidCredentialsError(cause);
    }
    if (cause.status === 403) {
      return new UnauthorizedError(message, cause);
    }
    if (cause.status === 404) {
      return new NotFoundError('Resource', cause.url ?? 'unknown', cause);
    }
    if (cause.status === null) {
      return new HttpError(message, 'NETWORK_ERROR', null, cause);
    }
    return new HttpError(message, 'UNKNOWN', cause.status, cause);
  }
}
