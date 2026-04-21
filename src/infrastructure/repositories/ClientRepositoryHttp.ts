import type { AxiosInstance } from 'axios';

import type { Client, ClientDraft, ClientFilters, ClientSummary } from '@domain/entities/Client';
import type { IClientRepository } from '@domain/repositories/IClientRepository';

import type {
  ClientCreateDto,
  ClientDetailDto,
  ClientListItemDto,
  ClientListRequestDto,
  ClientUpdateDto,
} from '../http/dto/ClientDto';
import { ENDPOINTS } from '../http/endpoints';
import { clientMapper } from '../mappers/clientMapper';

export class ClientRepositoryHttp implements IClientRepository {
  public constructor(private readonly http: AxiosInstance) {}

  public async list(filters: ClientFilters, userId: string): Promise<readonly ClientSummary[]> {
    const body: ClientListRequestDto = clientMapper.filtersToDto(filters, userId);
    const { data } = await this.http.post<ClientListItemDto[]>(ENDPOINTS.clients.list, body);
    return data.map((item) => clientMapper.summaryToDomain(item));
  }

  public async getById(id: string): Promise<Client> {
    const { data } = await this.http.get<ClientDetailDto>(ENDPOINTS.clients.get(id));
    return clientMapper.detailToDomain(data);
  }

  public async create(draft: ClientDraft, userId: string): Promise<void> {
    const body: ClientCreateDto = clientMapper.draftToCreateDto(draft, userId);
    await this.http.post(ENDPOINTS.clients.create, body);
  }

  public async update(id: string, changes: ClientDraft, userId: string): Promise<void> {
    const body: ClientUpdateDto = clientMapper.draftToUpdateDto(id, changes, userId);
    await this.http.post(ENDPOINTS.clients.update, body);
  }

  public async delete(id: string): Promise<void> {
    await this.http.delete(ENDPOINTS.clients.delete(id));
  }
}
