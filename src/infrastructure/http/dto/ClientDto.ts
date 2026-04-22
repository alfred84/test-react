/**
 * DTOs that mirror the exact shape of the backend at
 * https://pruebareactjs.test-class.com/Api/
 *
 * Notes on field names (preserved verbatim to match the wire contract):
 *   - Create and Update both use `celular` and `resennaPersonal` (double n).
 *   - Detail (GET) still returns `telefonoCelular` and `resenaPersonal` (single n).
 *
 * Do NOT rename these fields — that would break the wire contract.
 */

export type GenderDto = 'F' | 'M';

export interface ClientListRequestDto {
  readonly identificacion?: string;
  readonly nombre?: string;
  readonly usuarioId: string;
}

export interface ClientListItemDto {
  readonly id: string;
  readonly identificacion: string;
  readonly nombre: string;
  readonly apellidos: string;
}

export interface ClientDetailDto {
  readonly id: string;
  readonly nombre: string;
  readonly apellidos: string;
  readonly identificacion: string;
  readonly telefonoCelular: string;
  readonly otroTelefono: string;
  readonly direccion: string;
  readonly fNacimiento: string;
  readonly fAfiliacion: string;
  readonly sexo: GenderDto;
  readonly resenaPersonal: string;
  readonly imagen: string;
  readonly interesesId: string;
}

export interface ClientCreateDto {
  readonly nombre: string;
  readonly apellidos: string;
  readonly identificacion: string;
  readonly celular: string;
  readonly otroTelefono: string;
  readonly direccion: string;
  readonly fNacimiento: string;
  readonly fAfiliacion: string;
  readonly sexo: GenderDto;
  readonly resennaPersonal: string;
  readonly imagen: string;
  readonly interesFK: string;
  readonly usuarioId: string;
}

export interface ClientUpdateDto {
  readonly id: string;
  readonly nombre: string;
  readonly apellidos: string;
  readonly identificacion: string;
  readonly celular: string;
  readonly otroTelefono: string;
  readonly direccion: string;
  readonly fNacimiento: string;
  readonly fAfiliacion: string;
  readonly sexo: GenderDto;
  readonly resennaPersonal: string;
  readonly imagen: string;
  readonly interesFK: string;
  readonly usuarioId: string;
}
