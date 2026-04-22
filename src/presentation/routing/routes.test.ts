import { buildPath, ROUTES } from './routes';

describe('ROUTES', () => {
  it('exposes stable route patterns', () => {
    expect(ROUTES).toEqual({
      login: '/login',
      register: '/register',
      home: '/',
      clients: {
        list: '/clients',
        create: '/clients/new',
        edit: '/clients/:id/edit',
      },
      notFound: '*',
    });
  });
});

describe('buildPath.clientEdit', () => {
  it('interpolates the id into the edit route', () => {
    expect(buildPath.clientEdit('abc-123')).toBe('/clients/abc-123/edit');
  });

  it('encodes ids that contain URL-unsafe characters', () => {
    expect(buildPath.clientEdit('a b/c')).toBe('/clients/a%20b%2Fc/edit');
  });
});
