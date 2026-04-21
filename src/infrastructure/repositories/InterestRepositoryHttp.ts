import type { AxiosInstance } from 'axios';

import type { Interest } from '@domain/entities/Interest';
import type { IInterestRepository } from '@domain/repositories/IInterestRepository';

import type { InterestDto } from '../http/dto/InterestDto';
import { ENDPOINTS } from '../http/endpoints';
import { interestMapper } from '../mappers/interestMapper';

export class InterestRepositoryHttp implements IInterestRepository {
  public constructor(private readonly http: AxiosInstance) {}

  public async list(): Promise<readonly Interest[]> {
    const { data } = await this.http.get<InterestDto[]>(ENDPOINTS.interests.list);
    return data.map((dto) => interestMapper.toDomain(dto));
  }
}
