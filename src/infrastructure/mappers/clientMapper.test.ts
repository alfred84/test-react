import type { ClientDraft } from '@domain/entities/Client';

import type { ClientDetailDto, ClientListItemDto } from '../http/dto/ClientDto';

import { clientMapper } from './clientMapper';

describe('clientMapper.summaryToDomain', () => {
  it('renames spanish dto fields to the english domain fields', () => {
    const dto: ClientListItemDto = {
      id: 'abc',
      identificacion: '504440333',
      nombre: 'Allen',
      apellidos: 'Rivel Villalobos',
    };
    expect(clientMapper.summaryToDomain(dto)).toEqual({
      id: 'abc',
      identification: '504440333',
      firstName: 'Allen',
      lastName: 'Rivel Villalobos',
    });
  });
});

describe('clientMapper.detailToDomain', () => {
  const baseDto: ClientDetailDto = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    nombre: 'Allen',
    apellidos: 'Rivel',
    identificacion: '504440333',
    telefonoCelular: '88887777',
    otroTelefono: '22221111',
    direccion: 'San Jose',
    fNacimiento: '2000-01-15T00:00:00.000Z',
    fAfiliacion: '2022-04-27T00:00:00.000Z',
    sexo: 'M',
    resenaPersonal: 'reseña',
    imagen: 'data:image/png;base64,AAAA',
    interesesId: 'interest-1',
  };

  it('maps the full detail dto to the domain entity', () => {
    expect(clientMapper.detailToDomain(baseDto)).toEqual({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      firstName: 'Allen',
      lastName: 'Rivel',
      identification: '504440333',
      mobilePhone: '88887777',
      otherPhone: '22221111',
      address: 'San Jose',
      birthDate: '2000-01-15T00:00:00.000Z',
      affiliationDate: '2022-04-27T00:00:00.000Z',
      gender: 'M',
      personalReview: 'reseña',
      image: 'data:image/png;base64,AAAA',
      interestId: 'interest-1',
    });
  });

  it('normalises an empty image string into null', () => {
    expect(clientMapper.detailToDomain({ ...baseDto, imagen: '' }).image).toBeNull();
  });

  it('appends time to plain date strings so parsing is timezone-safe', () => {
    const domain = clientMapper.detailToDomain({
      ...baseDto,
      fNacimiento: '2000-01-15',
      fAfiliacion: '2022-04-27',
    });
    expect(domain.birthDate).toBe('2000-01-15T00:00:00.000Z');
    expect(domain.affiliationDate).toBe('2022-04-27T00:00:00.000Z');
  });
});

describe('clientMapper.filtersToDto', () => {
  it('always includes usuarioId and omits empty filter values', () => {
    expect(clientMapper.filtersToDto({}, 'user-1')).toEqual({ usuarioId: 'user-1' });
    expect(clientMapper.filtersToDto({ identification: '', name: '' }, 'user-1')).toEqual({
      usuarioId: 'user-1',
    });
  });

  it('includes filter values when provided', () => {
    expect(clientMapper.filtersToDto({ identification: '123', name: 'Allen' }, 'user-1')).toEqual({
      identificacion: '123',
      nombre: 'Allen',
      usuarioId: 'user-1',
    });
  });
});

describe('clientMapper.draftToCreateDto', () => {
  const draft: ClientDraft = {
    firstName: 'Allen',
    lastName: 'Rivel',
    identification: '504440333',
    mobilePhone: '88887777',
    otherPhone: '22221111',
    address: 'San Jose',
    birthDate: '2000-01-15T05:00:00.000Z',
    affiliationDate: '2022-04-27',
    gender: 'M',
    personalReview: 'reseña',
    image: null,
    interestId: 'interest-1',
  };

  it('maps to the create dto with telefonoCelular and resenaPersonal (single n)', () => {
    const dto = clientMapper.draftToCreateDto(draft, 'user-1');
    expect(dto).toEqual({
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
      interesFK: 'interest-1',
      usuarioId: 'user-1',
    });
  });

  it('forwards image when provided and coerces null to empty string', () => {
    const withImage = clientMapper.draftToCreateDto(
      { ...draft, image: 'data:image/png;base64,AAAA' },
      'user-1',
    );
    expect(withImage.imagen).toBe('data:image/png;base64,AAAA');
    expect(clientMapper.draftToCreateDto(draft, 'user-1').imagen).toBe('');
  });
});

describe('clientMapper.draftToUpdateDto', () => {
  const draft: ClientDraft = {
    firstName: 'Allen',
    lastName: 'Rivel',
    identification: '504440333',
    mobilePhone: '88887777',
    otherPhone: '22221111',
    address: 'San Jose',
    birthDate: '2000-01-15',
    affiliationDate: '2022-04-27',
    gender: 'F',
    personalReview: 'reseña update',
    image: null,
    interestId: 'interest-2',
  };

  it('emits the update dto using celular and resennaPersonal (double n) to match the backend quirks', () => {
    const dto = clientMapper.draftToUpdateDto('client-id', draft, 'user-1');
    expect(dto).toEqual({
      id: 'client-id',
      nombre: 'Allen',
      apellidos: 'Rivel',
      identificacion: '504440333',
      celular: '88887777',
      otroTelefono: '22221111',
      direccion: 'San Jose',
      fNacimiento: '2000-01-15',
      fAfiliacion: '2022-04-27',
      sexo: 'F',
      resennaPersonal: 'reseña update',
      imagen: '',
      interesFK: 'interest-2',
      usuarioId: 'user-1',
    });
  });
});
