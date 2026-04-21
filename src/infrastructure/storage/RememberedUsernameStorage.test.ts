import { LocalStorageRememberedUsername } from './RememberedUsernameStorage';

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

describe('LocalStorageRememberedUsername', () => {
  it('persists and retrieves a non-empty username', () => {
    const storage = new LocalStorageRememberedUsername(createMemoryStorage());
    storage.save('arivel');
    expect(storage.load()).toBe('arivel');
  });

  it('returns null when nothing is stored', () => {
    const storage = new LocalStorageRememberedUsername(createMemoryStorage());
    expect(storage.load()).toBeNull();
  });

  it('trims surrounding whitespace before storing', () => {
    const storage = new LocalStorageRememberedUsername(createMemoryStorage());
    storage.save('  arivel  ');
    expect(storage.load()).toBe('arivel');
  });

  it('clears the key when saving an empty or whitespace-only string', () => {
    const memory = createMemoryStorage();
    const storage = new LocalStorageRememberedUsername(memory);
    storage.save('arivel');
    storage.save('   ');
    expect(storage.load()).toBeNull();
  });

  it('clear() removes a previously saved username', () => {
    const storage = new LocalStorageRememberedUsername(createMemoryStorage());
    storage.save('arivel');
    storage.clear();
    expect(storage.load()).toBeNull();
  });
});
