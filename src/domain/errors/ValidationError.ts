import { DomainError, type DomainErrorCode } from './DomainError';

export interface FieldIssue {
  readonly field: string;
  readonly message: string;
}

export class ValidationError extends DomainError {
  public readonly code: DomainErrorCode = 'VALIDATION_FAILED';

  public constructor(
    public readonly issues: readonly FieldIssue[],
    cause?: unknown,
  ) {
    super(
      issues.length > 0
        ? `Validation failed: ${issues.map((i) => `${i.field} - ${i.message}`).join('; ')}`
        : 'Validation failed.',
      cause,
    );
  }
}
