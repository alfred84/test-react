import type { LoginResponseDto } from '../http/dto/AuthDto';

import { sessionMapper } from './sessionMapper';

describe('sessionMapper.toDomain', () => {
  const dto: LoginResponseDto = {
    token: 'jwt-token',
    expiration: '2022-04-28T03:39:32Z',
    userid: 'c8c8b7f9-edd5-4b0b-b488-74d82747ac56',
    username: 'arivel',
  };

  it('maps the flat API response into the Session domain shape', () => {
    const session = sessionMapper.toDomain(dto);
    expect(session).toEqual({
      token: 'jwt-token',
      userId: 'c8c8b7f9-edd5-4b0b-b488-74d82747ac56',
      username: 'arivel',
      expiresAt: Date.UTC(2022, 3, 28, 3, 39, 32),
    });
  });

  it('falls back to expiresAt 0 when the API sends an invalid expiration string', () => {
    const session = sessionMapper.toDomain({ ...dto, expiration: 'garbage' });
    expect(session.expiresAt).toBe(0);
  });
});
