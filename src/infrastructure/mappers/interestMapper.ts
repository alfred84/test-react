import type { Interest } from '@domain/entities/Interest';

import type { InterestDto } from '../http/dto/InterestDto';

export const interestMapper = {
  toDomain(dto: InterestDto): Interest {
    return { id: dto.id, description: dto.descripcion };
  },
};
