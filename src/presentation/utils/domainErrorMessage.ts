import type { DomainError, DomainErrorCode } from '@domain/errors/DomainError';

const MESSAGES: Record<DomainErrorCode, string> = {
  AUTH_INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
  AUTH_SESSION_EXPIRED: 'Tu sesión expiró. Ingresa nuevamente.',
  AUTH_UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  VALIDATION_FAILED: 'Revisa los datos ingresados e intenta de nuevo.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  NETWORK_ERROR: 'No pudimos contactar el servidor. Verifica tu conexión.',
  UNKNOWN: 'Ocurrió un problema con la transacción. Intenta nuevamente.',
};

/**
 * Translates any `DomainError` into a user-facing Spanish message.
 * Falls back to `UNKNOWN` so components never have to guard for missing
 * codes.
 */
export const toDomainErrorMessage = (error: DomainError): string =>
  MESSAGES[error.code] ?? MESSAGES.UNKNOWN;
