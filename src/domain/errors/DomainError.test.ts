import {
  DomainError,
  InvalidCredentialsError,
  NotFoundError,
  SessionExpiredError,
  UnauthorizedError,
  ValidationError,
} from './index';

describe('DomainError hierarchy', () => {
  it('InvalidCredentialsError carries the correct code and message', () => {
    const error = new InvalidCredentialsError();
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('AUTH_INVALID_CREDENTIALS');
    expect(error.message).toMatch(/invalid email or password/i);
    expect(error.name).toBe('InvalidCredentialsError');
  });

  it('SessionExpiredError carries the correct code', () => {
    const error = new SessionExpiredError();
    expect(error.code).toBe('AUTH_SESSION_EXPIRED');
    expect(error.name).toBe('SessionExpiredError');
  });

  it('UnauthorizedError accepts a custom message', () => {
    const error = new UnauthorizedError('Nope');
    expect(error.code).toBe('AUTH_UNAUTHORIZED');
    expect(error.message).toBe('Nope');
  });

  it('preserves the underlying cause', () => {
    const cause = new Error('wire error');
    const error = new InvalidCredentialsError(cause);
    expect(error.cause).toBe(cause);
  });
});

describe('ValidationError', () => {
  it('formats field issues into a human-readable message', () => {
    const error = new ValidationError([
      { field: 'email', message: 'required' },
      { field: 'password', message: 'too short' },
    ]);
    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.message).toContain('email - required');
    expect(error.message).toContain('password - too short');
    expect(error.issues).toHaveLength(2);
  });

  it('handles an empty issues array gracefully', () => {
    const error = new ValidationError([]);
    expect(error.message).toBe('Validation failed.');
  });
});

describe('NotFoundError', () => {
  it('includes the resource name and id in the message', () => {
    const error = new NotFoundError('Client', 'abc-123');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Client with id "abc-123" was not found.');
  });
});
