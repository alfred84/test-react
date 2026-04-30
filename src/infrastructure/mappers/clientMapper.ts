import type { Client, ClientDraft, ClientFilters, ClientSummary } from '@domain/entities/Client';

import type {
  ClientCreateDto,
  ClientDetailDto,
  ClientListItemDto,
  ClientListRequestDto,
  ClientUpdateDto,
} from '../http/dto/ClientDto';

const toIsoDate = (value: string): string => {
  if (value.includes('T')) return value;
  return `${value}T00:00:00.000Z`;
};

const toPlainDate = (value: string): string => {
  if (value.length >= 10 && !value.includes('T')) return value;
  return value.slice(0, 10);
};

export const clientMapper = {
  summaryToDomain(dto: ClientListItemDto): ClientSummary {
    return {
      id: dto.id,
      identification: dto.identificacion,
      firstName: dto.nombre,
      lastName: dto.apellidos,
    };
  },

  detailToDomain(dto: ClientDetailDto): Client {
    return {
      id: dto.id,
      firstName: dto.nombre,
      lastName: dto.apellidos,
      identification: dto.identificacion,
      mobilePhone: dto.telefonoCelular,
      otherPhone: dto.otroTelefono,
      address: dto.direccion,
      birthDate: toIsoDate(dto.fNacimiento),
      affiliationDate: toIsoDate(dto.fAfiliacion),
      gender: dto.sexo,
      personalReview: dto.resenaPersonal,
      image: dto.imagen && dto.imagen.length > 0 ? dto.imagen : null,
      interestId: dto.interesesId,
    };
  },

  filtersToDto(filters: ClientFilters, userId: string): ClientListRequestDto {
    return {
      usuarioId: userId,
      ...(filters.identification !== undefined && filters.identification !== ''
        ? { identificacion: filters.identification }
        : {}),
      ...(filters.name !== undefined && filters.name !== '' ? { nombre: filters.name } : {}),
    };
  },

  draftToCreateDto(draft: ClientDraft, userId: string): ClientCreateDto {
    return {
      nombre: draft.firstName,
      apellidos: draft.lastName,
      identificacion: draft.identification,
      celular: draft.mobilePhone,
      otroTelefono: draft.otherPhone,
      direccion: draft.address,
      fNacimiento: toPlainDate(draft.birthDate),
      fAfiliacion: toPlainDate(draft.affiliationDate),
      sexo: draft.gender,
      resennaPersonal: draft.personalReview,
      imagen: draft.image ?? '',
      interesFK: draft.interestId,
      usuarioId: userId,
    };
  },

  draftToUpdateDto(id: string, draft: ClientDraft, userId: string): ClientUpdateDto {
    return {
      id,
      nombre: draft.firstName,
      apellidos: draft.lastName,
      identificacion: draft.identification,
      celular: draft.mobilePhone,
      otroTelefono: draft.otherPhone,
      direccion: draft.address,
      fNacimiento: toPlainDate(draft.birthDate),
      fAfiliacion: toPlainDate(draft.affiliationDate),
      sexo: draft.gender,
      resennaPersonal: draft.personalReview,
      imagen: draft.image ?? '',
      interesFK: draft.interestId,
      usuarioId: userId,
    };
  },
};
