import { fromIsoExpiration, isSessionValid } from './Session';

describe('Session.fromIsoExpiration', () => {
  it('parses an ISO 8601 UTC string into epoch milliseconds', () => {
    expect(fromIsoExpiration('2022-04-28T03:39:32Z')).toBe(Date.UTC(2022, 3, 28, 3, 39, 32));
  });

  it('accepts millisecond precision', () => {
    const ms = fromIsoExpiration('2022-04-27T05:27:43.365Z');
    expect(ms).toBe(Date.UTC(2022, 3, 27, 5, 27, 43, 365));
  });

  it('returns null for an invalid date string instead of NaN or throwing', () => {
    expect(fromIsoExpiration('not-a-date')).toBeNull();
    expect(fromIsoExpiration('')).toBeNull();
  });
});

describe('Session.isSessionValid', () => {
  const NOW = 1_700_000_000_000;

  it('is true when expiresAt is strictly greater than the provided clock', () => {
    expect(isSessionValid({ expiresAt: NOW + 1 }, NOW)).toBe(true);
  });

  it('is false when expiresAt equals the clock (strict greater-than)', () => {
    expect(isSessionValid({ expiresAt: NOW }, NOW)).toBe(false);
  });

  it('is false when expiresAt is in the past', () => {
    expect(isSessionValid({ expiresAt: NOW - 1 }, NOW)).toBe(false);
  });

  it('falls back to Date.now() when no clock is supplied', () => {
    const spy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
    try {
      expect(isSessionValid({ expiresAt: NOW + 1 })).toBe(true);
      expect(isSessionValid({ expiresAt: NOW - 1 })).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });
});
