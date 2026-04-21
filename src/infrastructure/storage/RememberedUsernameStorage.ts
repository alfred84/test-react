const STORAGE_KEY = 'test-react.remembered-username';

export interface IRememberedUsernameStorage {
  save(username: string): void;
  load(): string | null;
  clear(): void;
}

export class LocalStorageRememberedUsername implements IRememberedUsernameStorage {
  public constructor(private readonly storage: Storage = window.localStorage) {}

  public save(username: string): void {
    const trimmed = username.trim();
    if (trimmed.length === 0) {
      this.clear();
      return;
    }
    this.storage.setItem(STORAGE_KEY, trimmed);
  }

  public load(): string | null {
    const value = this.storage.getItem(STORAGE_KEY);
    return value && value.length > 0 ? value : null;
  }

  public clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}

export const rememberedUsernameStorage: IRememberedUsernameStorage =
  new LocalStorageRememberedUsername();
