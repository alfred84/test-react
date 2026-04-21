import { DomainError, type DomainErrorCode } from './DomainError';

export class NotFoundError extends DomainError {
  public readonly code: DomainErrorCode = 'NOT_FOUND';

  public constructor(resource: string, id: string, cause?: unknown) {
    super(`${resource} with id "${id}" was not found.`, cause);
  }
}
