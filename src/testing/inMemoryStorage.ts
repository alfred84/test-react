import type { Session } from '@domain/entities/Session';
import type { ITokenStorage } from '@infrastructure/storage/TokenStorage';

/**
 * In-memory ITokenStorage for tests. Exposes a `.current` getter so assertions
 * can verify exactly what was persisted without poking into private state.
 */
export class InMemoryTokenStorage implements ITokenStorage {
  private value: Session | null;

  public constructor(initial: Session | null = null) {
    this.value = initial;
  }

  public save(session: Session): void {
    this.value = session;
  }

  public load(): Session | null {
    return this.value;
  }

  public clear(): void {
    this.value = null;
  }

  public get current(): Session | null {
    return this.value;
  }
}
