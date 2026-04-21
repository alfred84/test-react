export interface Session {
  readonly token: string;
  readonly userId: string;
  readonly username: string;
  readonly expiresAt: number;
}

/**
 * Parses the ISO 8601 expiration timestamp returned by the API
 * (e.g. "2022-04-28T03:39:32Z") into an epoch milliseconds value.
 *
 * Returns `null` when the input is not a valid date so callers can
 * treat it as an expired/invalid session without throwing.
 */
export const fromIsoExpiration = (iso: string): number | null => {
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
};

export const isSessionValid = (
  session: Pick<Session, 'expiresAt'>,
  now: number = Date.now(),
): boolean => session.expiresAt > now;
