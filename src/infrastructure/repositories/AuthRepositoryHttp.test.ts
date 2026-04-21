import { InvalidCredentialsError } from '@domain/errors';

import { createTestHttpClient, type TestHttpClient } from '../../testing/httpClient';

import { AuthRepositoryHttp } from './AuthRepositoryHttp';

let client: TestHttpClient;
let repo: AuthRepositoryHttp;

beforeEach(() => {
  client = createTestHttpClient();
  repo = new AuthRepositoryHttp(client.instance);
});

afterEach(() => client.restore());

describe('AuthRepositoryHttp.login', () => {
  it('returns a domain Session when credentials are valid', async () => {
    client.mock.onPost('api/Authenticate/login').reply((config) => {
      const body = JSON.parse(config.data as string) as Record<string, string>;
      expect(body).toEqual({ username: 'arivel', password: 'secret' });
      return [
        200,
        {
          token: 'jwt-token',
          expiration: '2022-04-28T03:39:32Z',
          userid: 'user-1',
          username: 'arivel',
        },
      ];
    });

    const session = await repo.login({ username: 'arivel', password: 'secret' });
    expect(session).toEqual({
      token: 'jwt-token',
      userId: 'user-1',
      username: 'arivel',
      expiresAt: Date.UTC(2022, 3, 28, 3, 39, 32),
    });
  });

  it('throws InvalidCredentialsError when the API responds 401', async () => {
    client.mock.onPost('api/Authenticate/login').reply(401);
    await expect(repo.login({ username: 'a', password: 'b' })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });
});

describe('AuthRepositoryHttp.register', () => {
  it('returns the registration result from the API', async () => {
    client.mock.onPost('api/Authenticate/register').reply((config) => {
      const body = JSON.parse(config.data as string) as Record<string, string>;
      expect(body).toEqual({
        username: 'arivel',
        email: 'a@example.com',
        password: 'Secret12',
      });
      return [200, { status: 'Success', message: 'Usuario creado correctamente' }];
    });
    const result = await repo.register({
      username: 'arivel',
      email: 'a@example.com',
      password: 'Secret12',
    });
    expect(result).toEqual({ status: 'Success', message: 'Usuario creado correctamente' });
  });
});
