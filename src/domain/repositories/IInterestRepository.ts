import type { Interest } from '../entities/Interest';

export interface IInterestRepository {
  list(): Promise<readonly Interest[]>;
}
