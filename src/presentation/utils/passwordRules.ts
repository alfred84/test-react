export const PASSWORD_MIN_EXCLUSIVE = 8;
export const PASSWORD_MAX_INCLUSIVE = 20;

export interface PasswordRule {
  readonly test: (value: string) => boolean;
  readonly message: string;
}

/**
 * Rules derived from the spec: strictly greater than 8 and at most 20
 * characters, at least one digit, at least one uppercase letter and at
 * least one lowercase letter.
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    test: (v) => v.length > PASSWORD_MIN_EXCLUSIVE,
    message: `La contraseña debe tener más de ${PASSWORD_MIN_EXCLUSIVE} caracteres.`,
  },
  {
    test: (v) => v.length <= PASSWORD_MAX_INCLUSIVE,
    message: `La contraseña debe tener como máximo ${PASSWORD_MAX_INCLUSIVE} caracteres.`,
  },
  {
    test: (v) => /\d/.test(v),
    message: 'La contraseña debe incluir al menos un número.',
  },
  {
    test: (v) => /[A-Z]/.test(v),
    message: 'La contraseña debe incluir al menos una letra mayúscula.',
  },
  {
    test: (v) => /[a-z]/.test(v),
    message: 'La contraseña debe incluir al menos una letra minúscula.',
  },
];

export const validatePassword = (value: string): string | true => {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(value)) return rule.message;
  }
  return true;
};

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const validateEmail = (value: string): string | true =>
  EMAIL_RE.test(value.trim()) || 'Ingresá un correo electrónico válido.';
