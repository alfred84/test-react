import { useCallback, useRef, useState } from 'react';

import {
  rememberedUsernameStorage as defaultStorage,
  type IRememberedUsernameStorage,
} from '@infrastructure/storage/RememberedUsernameStorage';

export interface RememberedUsernameApi {
  /** Username captured from storage on first render (never refreshed). */
  readonly initial: string | null;
  /** Persist the given username so it pre-fills the form next time. */
  readonly remember: (username: string) => void;
  /** Forget any previously-remembered username. */
  readonly forget: () => void;
}

/**
 * Thin wrapper over `IRememberedUsernameStorage` meant for the login
 * form. The `initial` value is captured once so re-renders driven by
 * `remember`/`forget` don't make it flicker.
 */
export const useRememberedUsername = (
  storage: IRememberedUsernameStorage = defaultStorage,
): RememberedUsernameApi => {
  const storageRef = useRef(storage);
  storageRef.current = storage;

  const [initial] = useState<string | null>(() => storageRef.current.load());

  const remember = useCallback((username: string): void => {
    storageRef.current.save(username);
  }, []);

  const forget = useCallback((): void => {
    storageRef.current.clear();
  }, []);

  return { initial, remember, forget };
};
