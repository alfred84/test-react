export type DomainErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_UNAUTHORIZED'
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export abstract class DomainError extends Error {
  public abstract readonly code: DomainErrorCode;

  protected constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
