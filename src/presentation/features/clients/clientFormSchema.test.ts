import type { Client } from '@domain/entities/Client';

import {
  clientFieldRules,
  clientToFormValues,
  EMPTY_FORM_VALUES,
  formValuesToDraft,
  isoToDateInput,
} from './clientFormSchema';

describe('clientFormSchema', () => {
  describe('isoToDateInput', () => {
    it('slices ISO strings to YYYY-MM-DD', () => {
      expect(isoToDateInput('1990-05-10T00:00:00.000Z')).toBe('1990-05-10');
      expect(isoToDateInput('1990-05-10')).toBe('1990-05-10');
    });

    it('returns an empty string on empty input', () => {
      expect(isoToDateInput('')).toBe('');
    });
  });

  describe('clientToFormValues / formValuesToDraft', () => {
    const client: Client = {
      id: 'c1',
      firstName: 'Ana',
      lastName: 'García',
      identification: 'A-001',
      mobilePhone: '8888-0000',
      otherPhone: '',
      address: 'Av. Central 123',
      birthDate: '1992-02-01T00:00:00.000Z',
      affiliationDate: '2024-01-10T00:00:00.000Z',
      gender: 'F',
      personalReview: 'VIP',
      image: 'data:image/png;base64,abcd',
      interestId: 'i1',
    };

    it('maps a client to form values slicing dates', () => {
      const values = clientToFormValues(client);
      expect(values.birthDate).toBe('1992-02-01');
      expect(values.affiliationDate).toBe('2024-01-10');
      expect(values.gender).toBe('F');
      expect(values.interestId).toBe('i1');
      expect(values.image).toBe('data:image/png;base64,abcd');
    });

    it('trims strings when projecting form values into a domain draft', () => {
      const draft = formValuesToDraft({
        ...EMPTY_FORM_VALUES,
        firstName: '  Luis ',
        lastName: '  Pérez ',
        identification: ' A-1 ',
        mobilePhone: ' 8888-1111 ',
        otherPhone: '   ',
        address: '  Street 1 ',
        birthDate: '1990-01-01',
        affiliationDate: '2024-01-01',
        gender: 'M',
        personalReview: '  Buen cliente ',
        interestId: 'i1',
      });
      expect(draft).toEqual({
        firstName: 'Luis',
        lastName: 'Pérez',
        identification: 'A-1',
        mobilePhone: '8888-1111',
        otherPhone: '',
        address: 'Street 1',
        birthDate: '1990-01-01',
        affiliationDate: '2024-01-01',
        gender: 'M',
        personalReview: 'Buen cliente',
        image: null,
        interestId: 'i1',
      });
    });
  });

  describe('field validators', () => {
    it('identification: rejects short / long / empty values', () => {
      const v = clientFieldRules.identification.validate;
      expect(v('')).not.toBe(true);
      expect(v('ab')).not.toBe(true);
      expect(v('A-001')).toBe(true);
    });

    it('mobilePhone: rejects letters and accepts common punctuation', () => {
      const v = clientFieldRules.mobilePhone.validate;
      expect(v('abc')).not.toBe(true);
      expect(v('8888-1111')).toBe(true);
      expect(v('+506 8888 1111')).toBe(true);
    });

    it('otherPhone: optional → empty is valid', () => {
      const v = clientFieldRules.otherPhone.validate;
      expect(v('')).toBe(true);
      expect(v('   ')).toBe(true);
      expect(v('bad!')).not.toBe(true);
    });

    it('birthDate: rejects empty, invalid and future dates', () => {
      const v = clientFieldRules.birthDate.validate;
      expect(v('')).not.toBe(true);
      expect(v('not-a-date')).not.toBe(true);
      const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
      expect(v(future)).not.toBe(true);
      expect(v('1990-01-01')).toBe(true);
    });

    it('interestId: requires a non-empty selection', () => {
      const v = clientFieldRules.interestId.validate;
      expect(v('')).not.toBe(true);
      expect(v('i1')).toBe(true);
    });
  });
});
