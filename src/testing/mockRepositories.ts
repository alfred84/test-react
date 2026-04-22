import type { Session } from '@domain/entities/Session';
import type {
  IAuthRepository,
  LoginCredentials,
  RegisterCredentials,
  RegistrationResult,
} from '@domain/repositories/IAuthRepository';
import type { IClientRepository } from '@domain/repositories/IClientRepository';
import type { IInterestRepository } from '@domain/repositories/IInterestRepository';
import type { Repositories } from '@presentation/providers/repositories/RepositoriesContext';

export interface MockAuthRepository extends IAuthRepository {
  readonly login: jest.MockedFunction<(credentials: LoginCredentials) => Promise<Session>>;
  readonly register: jest.MockedFunction<
    (credentials: RegisterCredentials) => Promise<RegistrationResult>
  >;
  readonly logout: jest.MockedFunction<() => Promise<void>>;
}

export interface MockClientRepository extends IClientRepository {
  readonly list: jest.MockedFunction<IClientRepository['list']>;
  readonly getById: jest.MockedFunction<IClientRepository['getById']>;
  readonly create: jest.MockedFunction<IClientRepository['create']>;
  readonly update: jest.MockedFunction<IClientRepository['update']>;
  readonly delete: jest.MockedFunction<IClientRepository['delete']>;
}

export interface MockInterestRepository extends IInterestRepository {
  readonly list: jest.MockedFunction<IInterestRepository['list']>;
}

export interface MockRepositories extends Repositories {
  readonly auth: MockAuthRepository;
  readonly clients: MockClientRepository;
  readonly interests: MockInterestRepository;
}

export const buildMockRepositories = (): MockRepositories => ({
  auth: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
  clients: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  interests: {
    list: jest.fn(),
  },
});
