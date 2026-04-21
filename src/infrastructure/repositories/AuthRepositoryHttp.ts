import type { AxiosInstance } from 'axios';

import type { Session } from '@domain/entities/Session';
import type {
  IAuthRepository,
  LoginCredentials,
  RegisterCredentials,
  RegistrationResult,
} from '@domain/repositories/IAuthRepository';

import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from '../http/dto/AuthDto';
import { ENDPOINTS } from '../http/endpoints';
import { sessionMapper } from '../mappers/sessionMapper';

/**
 * Thin auth repository over the HTTP layer.
 *
 * We intentionally do not re-wrap errors here: the response interceptor
 * installed on the axios instance already promotes AxiosErrors into the
 * right DomainError subclass (InvalidCredentialsError, HttpError, ...),
 * so wrapping again would mask those types.
 */
export class AuthRepositoryHttp implements IAuthRepository {
  public constructor(private readonly http: AxiosInstance) {}

  public async login(credentials: LoginCredentials): Promise<Session> {
    const body: LoginRequestDto = {
      username: credentials.username,
      password: credentials.password,
    };
    const { data } = await this.http.post<LoginResponseDto>(ENDPOINTS.auth.login, body);
    return sessionMapper.toDomain(data);
  }

  public async register(credentials: RegisterCredentials): Promise<RegistrationResult> {
    const body: RegisterRequestDto = {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
    };
    const { data } = await this.http.post<RegisterResponseDto>(ENDPOINTS.auth.register, body);
    return { status: data.status, message: data.message };
  }

  public async logout(): Promise<void> {
    return Promise.resolve();
  }
}
