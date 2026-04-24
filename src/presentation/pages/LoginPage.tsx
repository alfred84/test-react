import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import MuiAlert from '@material-ui/lab/Alert';
import { useEffect, type FC, type InputHTMLAttributes } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

import { useRememberedUsername } from '@presentation/hooks/useRememberedUsername';
import { AuthLayout } from '@presentation/layouts/AuthLayout';
import { useAuth } from '@presentation/providers/auth/AuthContext';
import { useFeedback } from '@presentation/providers/feedback/FeedbackContext';
import { ROUTES } from '@presentation/routing/routes';
import { toDomainErrorMessage } from '@presentation/utils/domainErrorMessage';

interface LoginFormValues {
  readonly username: string;
  readonly password: string;
  readonly remember: boolean;
}

export const LoginPage: FC = () => {
  const auth = useAuth();
  const feedback = useFeedback();
  const remembered = useRememberedUsername();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      username: remembered.initial ?? '',
      password: '',
      remember: Boolean(remembered.initial),
    },
  });

  useEffect(() => {
    // Clear any stale server error when the user lands on the page.
    if (auth.error) auth.clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = handleSubmit(async (values): Promise<void> => {
    try {
      await auth.login({ username: values.username, password: values.password });
      if (values.remember) {
        remembered.remember(values.username);
      } else {
        remembered.forget();
      }
    } catch (error) {
      feedback.error(toDomainErrorMessage(error as Parameters<typeof toDomainErrorMessage>[0]));
    }
  });

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Administrador de clientes"
      footer={
        <Typography variant="body2">
          ¿No tienes una cuenta?{' '}
          <Link component={RouterLink} to={ROUTES.register} data-testid="go-to-register">
            Registrate
          </Link>
        </Typography>
      }
    >
      <form
        onSubmit={(event): void => {
          void onSubmit(event);
        }}
        noValidate
        data-testid="login-form"
      >
        {auth.error ? (
          <Box mb={2}>
            <MuiAlert severity="error" data-testid="login-error">
              {toDomainErrorMessage(auth.error)}
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
              inputProps={{ 'data-testid': 'login-username' }}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: 'La contraseña es obligatoria.' }}
          render={({ field }): JSX.Element => (
            <TextField
              {...field}
              fullWidth
              margin="normal"
              type="password"
              label="Contraseña"
              autoComplete="current-password"
              variant="outlined"
              error={Boolean(errors.password)}
              helperText={errors.password?.message ?? ' '}
              inputProps={{ 'data-testid': 'login-password' }}
            />
          )}
        />

        <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
          <Controller
            control={control}
            name="remember"
            render={({ field: { value, onChange, ref, ...rest } }): JSX.Element => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...rest}
                    inputRef={ref}
                    checked={value}
                    color="primary"
                    onChange={(e): void => onChange(e.target.checked)}
                    inputProps={
                      { 'data-testid': 'login-remember' } as InputHTMLAttributes<HTMLInputElement>
                    }
                  />
                }
                label="Recuérdame"
              />
            )}
          />
        </Box>

        <Box mt={2}>
          <Button
            type="submit"
            fullWidth
            size="large"
            color="primary"
            variant="contained"
            disabled={isSubmitting || auth.status === 'authenticating'}
            data-testid="login-submit"
            startIcon={
              isSubmitting || auth.status === 'authenticating' ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            Iniciar sesión
          </Button>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
