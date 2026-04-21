import { err, isErr, isOk, ok } from './utility';

describe('Result helpers', () => {
  describe('ok', () => {
    it('wraps a value into a successful Result', () => {
      const result = ok(42);
      expect(result).toEqual({ ok: true, value: 42 });
    });

    it('preserves the generic value type including undefined', () => {
      const result = ok<undefined>(undefined);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeUndefined();
    });
  });

  describe('err', () => {
    it('wraps an error into a failed Result', () => {
      const boom = new Error('boom');
      const result = err(boom);
      expect(result).toEqual({ ok: false, error: boom });
    });
  });

  describe('isOk / isErr', () => {
    it('narrows to the success branch', () => {
      const result = ok('hello');
      if (isOk(result)) {
        const value: string = result.value;
        expect(value).toBe('hello');
      } else {
        throw new Error('expected ok');
      }
    });

    it('narrows to the error branch', () => {
      const result = err('nope' as const);
      if (isErr(result)) {
        const error: 'nope' = result.error;
        expect(error).toBe('nope');
      } else {
        throw new Error('expected err');
      }
    });

    it('isOk and isErr are mutually exclusive', () => {
      const success = ok(1);
      const failure = err(new Error('x'));
      expect(isOk(success)).toBe(true);
      expect(isErr(success)).toBe(false);
      expect(isOk(failure)).toBe(false);
      expect(isErr(failure)).toBe(true);
    });
  });
});
