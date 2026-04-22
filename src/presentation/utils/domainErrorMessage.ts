import type { DomainError, DomainErrorCode } from '@domain/errors/DomainError';

const MESSAGES: Record<DomainErrorCode, string> = {
  AUTH_INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
  AUTH_SESSION_EXPIRED: 'Tu sesión expiró. Ingresá nuevamente.',
  AUTH_UNAUTHORIZED: 'No tenés permisos para realizar esta acción.',
  VALIDATION_FAILED: 'Revisá los datos ingresados e intentá de nuevo.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  NETWORK_ERROR: 'No pudimos contactar el servidor. Verificá tu conexión.',
  UNKNOWN: 'Ocurrió un problema con la transacción. Intentá nuevamente.',
};

/**
 * Translates any `DomainError` into a user-facing Spanish message.
 * Falls back to `UNKNOWN` so components never have to guard for missing
 * codes.
 */
export const toDomainErrorMessage = (error: DomainError): string =>
  MESSAGES[error.code] ?? MESSAGES.UNKNOWN;
