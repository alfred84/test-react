import { DomainError, type DomainErrorCode } from './DomainError';

export class InvalidCredentialsError extends DomainError {
  public readonly code: DomainErrorCode = 'AUTH_INVALID_CREDENTIALS';

  public constructor(cause?: unknown) {
    super('Invalid email or password.', cause);
  }
}

export class SessionExpiredError extends DomainError {
  public readonly code: DomainErrorCode = 'AUTH_SESSION_EXPIRED';

  public constructor(cause?: unknown) {
    super('Your session has expired. Please sign in again.', cause);
  }
}

export class UnauthorizedError extends DomainError {
  public readonly code: DomainErrorCode = 'AUTH_UNAUTHORIZED';

  public constructor(message = 'You are not authorized to perform this action.', cause?: unknown) {
    super(message, cause);
  }
}
