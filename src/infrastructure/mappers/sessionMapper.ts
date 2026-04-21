import { fromIsoExpiration, type Session } from '@domain/entities/Session';

import type { LoginResponseDto } from '../http/dto/AuthDto';

export const sessionMapper = {
  toDomain(dto: LoginResponseDto): Session {
    const expiresAt = fromIsoExpiration(dto.expiration);
    return {
      token: dto.token,
      userId: dto.userid,
      username: dto.username,
      expiresAt: expiresAt ?? 0,
    };
  },
};
