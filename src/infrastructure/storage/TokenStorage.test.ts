import type { Session } from '@domain/entities/Session';

import { LocalStorageTokenStorage } from './TokenStorage';

const createMemoryStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length(): number {
      return map.size;
    },
    clear(): void {
      map.clear();
    },
    getItem(key: string): string | null {
      return map.get(key) ?? null;
    },
    key(i: number): string | null {
      return Array.from(map.keys())[i] ?? null;
    },
    removeItem(key: string): void {
      map.delete(key);
    },
    setItem(key: string, value: string): void {
      map.set(key, value);
    },
  };
};

describe('LocalStorageTokenStorage', () => {
  const validSession: Session = {
    token: 'jwt',
    userId: 'user-1',
    username: 'arivel',
    expiresAt: Date.now() + 60_000,
  };

  it('persists and retrieves a valid session', () => {
    const storage = new LocalStorageTokenStorage(createMemoryStorage());
    storage.save(validSession);
    expect(storage.load()).toEqual(validSession);
  });

  it('returns null when no session is stored', () => {
    const storage = new LocalStorageTokenStorage(createMemoryStorage());
    expect(storage.load()).toBeNull();
  });

  it('returns null when the stored session has expired', () => {
    const memory = createMemoryStorage();
    const storage = new LocalStorageTokenStorage(memory);
    storage.save({ ...validSession, expiresAt: Date.now() - 1 });
    expect(storage.load()).toBeNull();
  });

  it('returns null when the stored value is malformed json', () => {
    const memory = createMemoryStorage();
    memory.setItem('test-react.session', '{not-json');
    const storage = new LocalStorageTokenStorage(memory);
    expect(storage.load()).toBeNull();
  });

  it('returns null when the stored value is json but not a Session shape', () => {
    const memory = createMemoryStorage();
    memory.setItem('test-react.session', JSON.stringify({ foo: 'bar' }));
    const storage = new LocalStorageTokenStorage(memory);
    expect(storage.load()).toBeNull();
  });

  it('clears the persisted session', () => {
    const storage = new LocalStorageTokenStorage(createMemoryStorage());
    storage.save(validSession);
    storage.clear();
    expect(storage.load()).toBeNull();
  });
});
