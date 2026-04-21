import { createTestHttpClient, type TestHttpClient } from '../../testing/httpClient';

import { InterestRepositoryHttp } from './InterestRepositoryHttp';

let client: TestHttpClient;
let repo: InterestRepositoryHttp;

beforeEach(() => {
  client = createTestHttpClient();
  repo = new InterestRepositoryHttp(client.instance);
});

afterEach(() => client.restore());

describe('InterestRepositoryHttp.list', () => {
  it('maps each InterestDto into the domain Interest shape', async () => {
    client.mock.onGet('api/Intereses/Listado').reply(200, [
      { id: 'a', descripcion: 'Futbol' },
      { id: 'b', descripcion: 'Lectura' },
    ]);
    await expect(repo.list()).resolves.toEqual([
      { id: 'a', description: 'Futbol' },
      { id: 'b', description: 'Lectura' },
    ]);
  });
});
