import type { Client, ClientDraft, ClientFilters, ClientSummary } from '../entities/Client';

export interface IClientRepository {
  list(filters: ClientFilters, userId: string): Promise<readonly ClientSummary[]>;
  getById(id: string): Promise<Client>;
  create(draft: ClientDraft, userId: string): Promise<void>;
  update(id: string, changes: ClientDraft, userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
