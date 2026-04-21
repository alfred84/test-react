import { isSessionValid, type Session } from '@domain/entities/Session';

const STORAGE_KEY = 'test-react.session';

export interface ITokenStorage {
  save(session: Session): void;
  load(): Session | null;
  clear(): void;
}

export class LocalStorageTokenStorage implements ITokenStorage {
  public constructor(private readonly storage: Storage = window.localStorage) {}

  public save(session: Session): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  public load(): Session | null {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!this.isSessionShape(parsed)) return null;
      return isSessionValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  public clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }

  private isSessionShape(value: unknown): value is Session {
    if (typeof value !== 'object' || value === null) return false;
    const s = value as Record<string, unknown>;
    return (
      typeof s['token'] === 'string' &&
      typeof s['userId'] === 'string' &&
      typeof s['username'] === 'string' &&
      typeof s['expiresAt'] === 'number'
    );
  }
}

export const tokenStorage: ITokenStorage = new LocalStorageTokenStorage();
