import { interestMapper } from './interestMapper';

describe('interestMapper.toDomain', () => {
  it('maps descripcion to description', () => {
    expect(interestMapper.toDomain({ id: 'a', descripcion: 'Futbol' })).toEqual({
      id: 'a',
      description: 'Futbol',
    });
  });
});
