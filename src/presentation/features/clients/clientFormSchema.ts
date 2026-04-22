import type { Client, ClientDraft, Gender } from '@domain/entities/Client';

export interface ClientFormValues {
  readonly firstName: string;
  readonly lastName: string;
  readonly identification: string;
  readonly mobilePhone: string;
  readonly otherPhone: string;
  readonly address: string;
  /** YYYY-MM-DD (HTML input type="date") */
  readonly birthDate: string;
  /** YYYY-MM-DD (HTML input type="date") */
  readonly affiliationDate: string;
  readonly gender: Gender;
  readonly personalReview: string;
  readonly interestId: string;
  readonly image: string | null;
}

export const EMPTY_FORM_VALUES: ClientFormValues = {
  firstName: '',
  lastName: '',
  identification: '',
  mobilePhone: '',
  otherPhone: '',
  address: '',
  birthDate: '',
  affiliationDate: '',
  gender: 'M',
  personalReview: '',
  interestId: '',
  image: null,
};

/** Slice the first 10 chars of an ISO string to fit `<input type="date">`. */
export const isoToDateInput = (value: string): string => {
  if (!value) return '';
  return value.length >= 10 ? value.slice(0, 10) : value;
};

export const clientToFormValues = (client: Client): ClientFormValues => ({
  firstName: client.firstName,
  lastName: client.lastName,
  identification: client.identification,
  mobilePhone: client.mobilePhone,
  otherPhone: client.otherPhone,
  address: client.address,
  birthDate: isoToDateInput(client.birthDate),
  affiliationDate: isoToDateInput(client.affiliationDate),
  gender: client.gender,
  personalReview: client.personalReview,
  interestId: client.interestId,
  image: client.image,
});

export const formValuesToDraft = (values: ClientFormValues): ClientDraft => ({
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  identification: values.identification.trim(),
  mobilePhone: values.mobilePhone.trim(),
  otherPhone: values.otherPhone.trim(),
  address: values.address.trim(),
  birthDate: values.birthDate,
  affiliationDate: values.affiliationDate,
  gender: values.gender,
  personalReview: values.personalReview.trim(),
  image: values.image,
  interestId: values.interestId,
});

export const PHONE_REGEX = /^[0-9 +()-]{6,20}$/;
export const ID_REGEX = /^[A-Za-z0-9-]{3,30}$/;

export interface FieldRule {
  readonly required?: string;
  readonly maxLength?: { readonly value: number; readonly message: string };
  readonly validate?: (value: string) => string | true;
}

export const clientFieldRules = {
  firstName: {
    required: 'El nombre es obligatorio.',
    maxLength: { value: 60, message: 'Máximo 60 caracteres.' },
    validate: (v: string): string | true => v.trim().length > 0 || 'El nombre es obligatorio.',
  },
  lastName: {
    required: 'Los apellidos son obligatorios.',
    maxLength: { value: 80, message: 'Máximo 80 caracteres.' },
    validate: (v: string): string | true =>
      v.trim().length > 0 || 'Los apellidos son obligatorios.',
  },
  identification: {
    required: 'La identificación es obligatoria.',
    validate: (v: string): string | true =>
      ID_REGEX.test(v.trim()) || 'Identificación inválida (3-30 caracteres).',
  },
  mobilePhone: {
    required: 'El celular es obligatorio.',
    validate: (v: string): string | true => PHONE_REGEX.test(v.trim()) || 'Teléfono inválido.',
  },
  otherPhone: {
    validate: (v: string): string | true => {
      if (v.trim().length === 0) return true;
      return PHONE_REGEX.test(v.trim()) || 'Teléfono inválido.';
    },
  },
  address: {
    required: 'La dirección es obligatoria.',
    maxLength: { value: 200, message: 'Máximo 200 caracteres.' },
  },
  birthDate: {
    required: 'La fecha de nacimiento es obligatoria.',
    validate: (v: string): string | true => {
      if (!v) return 'La fecha de nacimiento es obligatoria.';
      const date = new Date(v);
      if (Number.isNaN(date.getTime())) return 'Fecha inválida.';
      if (date.getTime() > Date.now()) return 'La fecha no puede ser futura.';
      return true;
    },
  },
  affiliationDate: {
    required: 'La fecha de afiliación es obligatoria.',
    validate: (v: string): string | true => {
      if (!v) return 'La fecha de afiliación es obligatoria.';
      const date = new Date(v);
      if (Number.isNaN(date.getTime())) return 'Fecha inválida.';
      return true;
    },
  },
  personalReview: {
    maxLength: { value: 500, message: 'Máximo 500 caracteres.' },
  },
  interestId: {
    required: 'Seleccioná un interés.',
    validate: (v: string): string | true => v.trim().length > 0 || 'Seleccioná un interés.',
  },
} as const;
