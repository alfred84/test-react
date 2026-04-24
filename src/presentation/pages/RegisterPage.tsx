import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import MuiAlert from '@material-ui/lab/Alert';
import { useState, type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory, Link as RouterLink } from 'react-router-dom';

import type { DomainError } from '@domain/errors/DomainError';
import { AuthLayout } from '@presentation/layouts/AuthLayout';
import { useAuth } from '@presentation/providers/auth/AuthContext';
import { useFeedback } from '@presentation/providers/feedback/FeedbackContext';
import { ROUTES } from '@presentation/routing/routes';
import { toDomainErrorMessage } from '@presentation/utils/domainErrorMessage';
import { validateEmail, validatePassword } from '@presentation/utils/passwordRules';

interface RegisterFormValues {
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

export const RegisterPage: FC = () => {
  const auth = useAuth();
  const feedback = useFeedback();
  const history = useHistory();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    mode: 'onSubmit',
    defaultValues: { username: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values): Promise<void> => {
    setServerError(null);
    try {
      const result = await auth.register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      feedback.success(result.message || 'Usuario creado correctamente.');
      history.push(ROUTES.login);
    } catch (error) {
      const message = toDomainErrorMessage(error as DomainError);
      setServerError(message);
      feedback.error(message);
    }
  });

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Completa tus datos para empezar"
      footer={
        <Typography variant="body2">
          ¿Ya tienes una cuenta?{' '}
          <Link component={RouterLink} to={ROUTES.login} data-testid="go-to-login">
            Inicia sesión
          </Link>
        </Typography>
      }
    >
      <form
        onSubmit={(event): void => {
          void onSubmit(event);
        }}
        noValidate
        data-testid="register-form"
      >
        {serverError ? (
          <Box mb={2}>
            <MuiAlert severity="error" data-testid="register-error">
              {serverError}
            </MuiAlert>
          </Box>
        ) : null}

        <Controller
          control={control}
          name="username"
          rules={{
            required: 'El usuario es obligatorio.',
            validate: (v: string): true | string =>
              v.trim().length > 0 || 'El usuario es obligatorio.',
          }}
          render={({ field }): JSX.Element => (
            <TextField
              {...field}
              fullWidth
              margin="normal"
              label="Usuario"
              autoComplete="username"
              variant="outlined"
              error={Boolean(errors.username)}
              helperText={errors.username?.message ?? ' '}
              inputProps={{ 'data-testid': 'register-username' }}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'El correo electrónico es obligatorio.',
            validate: validateEmail,
          }}
          render={({ field }): JSX.Element => (
            <TextField
              {...field}
              fullWidth
              margin="normal"
              type="email"
              label="Correo electrónico"
              autoComplete="email"
              variant="outlined"
              error={Boolean(errors.email)}
              helperText={errors.email?.message ?? ' '}
              inputProps={{ 'data-testid': 'register-email' }}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'La contraseña es obligatoria.',
            validate: validatePassword,
          }}
          render={({ field }): JSX.Element => (
            <TextField
              {...field}
              fullWidth
              margin="normal"
              type="password"
              label="Contraseña"
              autoComplete="new-password"
              variant="outlined"
              error={Boolean(errors.password)}
              helperText={
                errors.password?.message ??
                'Más de 8 y hasta 20 caracteres, con números, mayúsculas y minúsculas.'
              }
              inputProps={{ 'data-testid': 'register-password' }}
            />
          )}
        />

        <Box mt={2}>
          <Button
            type="submit"
            fullWidth
            size="large"
            color="primary"
            variant="contained"
            disabled={isSubmitting}
            data-testid="register-submit"
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            Registrarse
          </Button>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
