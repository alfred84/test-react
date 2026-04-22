import { act, renderHook } from '@testing-library/react-hooks';

import type { IRememberedUsernameStorage } from '@infrastructure/storage/RememberedUsernameStorage';

import { useRememberedUsername } from './useRememberedUsername';

interface TrackedStorage extends IRememberedUsernameStorage {
  readonly saveSpy: jest.Mock<void, [string]>;
  readonly clearSpy: jest.Mock<void, []>;
}

const buildStorage = (initial: string | null): TrackedStorage => {
  let value: string | null = initial;
  const saveSpy = jest.fn<void, [string]>((username) => {
    value = username;
  });
  const clearSpy = jest.fn<void, []>(() => {
    value = null;
  });
  return {
    load: () => value,
    save: saveSpy,
    clear: clearSpy,
    saveSpy,
    clearSpy,
  };
};

describe('useRememberedUsername', () => {
  it('captures the persisted username on first render', () => {
    const storage = buildStorage('arivel');
    const { result } = renderHook(() => useRememberedUsername(storage));
    expect(result.current.initial).toBe('arivel');
  });

  it('returns null when no username is persisted', () => {
    const { result } = renderHook(() => useRememberedUsername(buildStorage(null)));
    expect(result.current.initial).toBeNull();
  });

  it('remember() writes through to the injected storage', () => {
    const storage = buildStorage(null);
    const { result } = renderHook(() => useRememberedUsername(storage));
    act(() => result.current.remember('nuevo'));
    expect(storage.saveSpy).toHaveBeenCalledWith('nuevo');
  });

  it('forget() clears the injected storage', () => {
    const storage = buildStorage('arivel');
    const { result } = renderHook(() => useRememberedUsername(storage));
    act(() => result.current.forget());
    expect(storage.clearSpy).toHaveBeenCalledTimes(1);
  });

  it('does not refresh initial when remember() is called later', () => {
    const storage = buildStorage('arivel');
    const { result } = renderHook(() => useRememberedUsername(storage));
    act(() => result.current.remember('otro'));
    expect(result.current.initial).toBe('arivel');
  });
});
