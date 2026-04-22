import { validateEmail, validatePassword } from './passwordRules';

describe('validatePassword', () => {
  it('rejects passwords with 8 or fewer characters', () => {
    expect(validatePassword('Abcdef1')).toMatch(/más de 8 caracteres/i);
    expect(validatePassword('Abcdef12')).toMatch(/más de 8 caracteres/i);
  });

  it('rejects passwords longer than 20 characters', () => {
    expect(validatePassword('Abcdefghij1234567890Z')).toMatch(/máximo 20 caracteres/i);
  });

  it('requires a digit', () => {
    expect(validatePassword('Abcdefghij')).toMatch(/al menos un número/i);
  });

  it('requires an uppercase letter', () => {
    expect(validatePassword('abcdefghi1')).toMatch(/mayúscula/i);
  });

  it('requires a lowercase letter', () => {
    expect(validatePassword('ABCDEFGHI1')).toMatch(/minúscula/i);
  });

  it('accepts a valid password', () => {
    expect(validatePassword('Abcdefghi1')).toBe(true);
  });
});

describe('validateEmail', () => {
  it.each(['user@example.com', 'john.doe+spam@mail.co', 'a_b-c@sub.domain.io'])(
    'accepts %s',
    (value) => {
      expect(validateEmail(value)).toBe(true);
    },
  );

  it.each(['no-at', 'two@@at.com', 'missing@tld', 'space in@mail.com'])('rejects %s', (value) => {
    expect(validateEmail(value)).toMatch(/correo electrónico válido/i);
  });
});
