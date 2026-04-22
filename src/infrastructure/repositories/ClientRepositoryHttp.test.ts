import type { ClientDraft } from '@domain/entities/Client';

import { createTestHttpClient, type TestHttpClient } from '../../testing/httpClient';

import { ClientRepositoryHttp } from './ClientRepositoryHttp';

const draft: ClientDraft = {
  firstName: 'Allen',
  lastName: 'Rivel',
  identification: '504440333',
  mobilePhone: '88887777',
  otherPhone: '22221111',
  address: 'San Jose',
  birthDate: '2000-01-15',
  affiliationDate: '2022-04-27',
  gender: 'M',
  personalReview: 'reseña',
  image: null,
  interestId: 'interest-1',
};

let client: TestHttpClient;
let repo: ClientRepositoryHttp;

beforeEach(() => {
  client = createTestHttpClient('jwt');
  repo = new ClientRepositoryHttp(client.instance);
});

afterEach(() => client.restore());

describe('ClientRepositoryHttp.list', () => {
  it('posts filters + usuarioId and maps the response array to domain summaries', async () => {
    client.mock.onPost('api/Cliente/Listado').reply((config) => {
      const body = JSON.parse(config.data as string) as Record<string, unknown>;
      expect(body).toEqual({
        identificacion: '504',
        nombre: 'Allen',
        usuarioId: 'user-1',
      });
      return [
        200,
        [{ id: 'c1', identificacion: '504440333', nombre: 'Allen', apellidos: 'Rivel' }],
      ];
    });

    const result = await repo.list({ identification: '504', name: 'Allen' }, 'user-1');
    expect(result).toEqual([
      { id: 'c1', identification: '504440333', firstName: 'Allen', lastName: 'Rivel' },
    ]);
  });

  it('omits empty filter values from the body', async () => {
    client.mock.onPost('api/Cliente/Listado').reply((config) => {
      const body = JSON.parse(config.data as string) as Record<string, unknown>;
      expect(body).toEqual({ usuarioId: 'user-1' });
      return [200, []];
    });
    await expect(repo.list({}, 'user-1')).resolves.toEqual([]);
  });

  it('sends the Bearer token on every request', async () => {
    let received: string | undefined;
    client.mock.onPost('api/Cliente/Listado').reply((config) => {
      received = config.headers?.['Authorization'] as string | undefined;
      return [200, []];
    });
    await repo.list({}, 'user-1');
    expect(received).toBe('Bearer jwt');
  });
});

describe('ClientRepositoryHttp.getById', () => {
  it('maps the full detail dto into the domain Client', async () => {
    client.mock.onGet('api/Cliente/Obtener/c1').reply(200, {
      id: 'c1',
      nombre: 'Allen',
      apellidos: 'Rivel',
      identificacion: '504440333',
      telefonoCelular: '88887777',
      otroTelefono: '22221111',
      direccion: 'San Jose',
      fNacimiento: '2000-01-15',
      fAfiliacion: '2022-04-27',
      sexo: 'M',
      resenaPersonal: 'reseña',
      imagen: '',
      interesesId: 'interest-1',
    });

    const domain = await repo.getById('c1');
    expect(domain.id).toBe('c1');
    expect(domain.mobilePhone).toBe('88887777');
    expect(domain.image).toBeNull();
    expect(domain.interestId).toBe('interest-1');
  });
});

describe('ClientRepositoryHttp.create', () => {
  it('posts the create dto using celular and resennaPersonal (double n)', async () => {
    client.mock.onPost('api/Cliente/Crear').reply((config) => {
      const body = JSON.parse(config.data as string) as Record<string, unknown>;
      expect(body).toMatchObject({
        nombre: 'Allen',
        celular: '88887777',
        resennaPersonal: 'reseña',
        interesFK: 'interest-1',
        usuarioId: 'user-1',
      });
      return [200, {}];
    });
    await expect(repo.create(draft, 'user-1')).resolves.toBeUndefined();
  });
});

describe('ClientRepositoryHttp.update', () => {
  it('posts the update dto using celular and resennaPersonal (double n) to match backend quirks', async () => {
    client.mock.onPost('api/Cliente/Actualizar').reply((config) => {
      const body = JSON.parse(config.data as string) as Record<string, unknown>;
      expect(body).toMatchObject({
        id: 'c1',
        celular: '88887777',
        resennaPersonal: 'reseña',
        interesFK: 'interest-1',
        usuarioId: 'user-1',
      });
      return [200, {}];
    });
    await expect(repo.update('c1', draft, 'user-1')).resolves.toBeUndefined();
  });
});

describe('ClientRepositoryHttp.delete', () => {
  it('issues a DELETE to api/Cliente/Eliminar/{id}', async () => {
    let called = false;
    client.mock.onDelete('api/Cliente/Eliminar/c1').reply(() => {
      called = true;
      return [200, {}];
    });
    await repo.delete('c1');
    expect(called).toBe(true);
  });
});
