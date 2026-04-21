import type { Session } from '../entities/Session';

export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

export interface RegisterCredentials {
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

export interface RegistrationResult {
  readonly status: string;
  readonly message: string;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<Session>;
  register(credentials: RegisterCredentials): Promise<RegistrationResult>;
  logout(): Promise<void>;
}
