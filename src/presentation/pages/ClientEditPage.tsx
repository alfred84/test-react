import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import type { ClientDraft } from '@domain/entities/Client';
import { NotFoundError } from '@domain/errors';
import type { DomainError } from '@domain/errors/DomainError';
import { ClientForm } from '@presentation/features/clients/ClientForm';
import {
  clientToFormValues,
  type ClientFormValues,
} from '@presentation/features/clients/clientFormSchema';
import { useInterests } from '@presentation/features/clients/useInterests';
import { useAuth } from '@presentation/providers/auth/AuthContext';
import { useFeedback } from '@presentation/providers/feedback/FeedbackContext';
import { useClientRepository } from '@presentation/providers/repositories/RepositoriesContext';
import { ROUTES } from '@presentation/routing/routes';
import { toDomainErrorMessage } from '@presentation/utils/domainErrorMessage';

interface RouteParams {
  readonly id: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(6, 3),
  },
}));

type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

export const ClientEditPage: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const auth = useAuth();
  const feedback = useFeedback();
  const repository = useClientRepository();
  const interests = useInterests();

  const [status, setStatus] = useState<LoadStatus>('loading');
  const [values, setValues] = useState<ClientFormValues | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const mountedRef = useRef(true);
  useEffect(
    () => (): void => {
      mountedRef.current = false;
    },
    [],
  );

  const goBack = useCallback((): void => {
    history.push(ROUTES.clients.list);
  }, [history]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    repository
      .getById(id)
      .then((client) => {
        if (cancelled) return;
        setValues(clientToFormValues(client));
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof NotFoundError) {
          setStatus('not-found');
          return;
        }
        setStatus('error');
        feedback.error(toDomainErrorMessage(error as DomainError));
      });

    return (): void => {
      cancelled = true;
    };
  }, [id, repository, feedback]);

  const handleSubmit = useCallback(
    async (draft: ClientDraft): Promise<void> => {
      if (!auth.session) return;
      setSubmitting(true);
      try {
        await repository.update(id, draft, auth.session.userId);
        feedback.success('Cliente actualizado correctamente.');
        history.push(ROUTES.clients.list);
      } catch (error) {
        feedback.error(toDomainErrorMessage(error as DomainError));
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [auth.session, feedback, history, id, repository],
  );

  if (status === 'loading') {
    return (
      <Box data-testid="client-edit-page">
        <Paper className={classes.paper} elevation={1}>
          <Box className={classes.centered} data-testid="client-edit-loading">
            <CircularProgress />
            <Typography variant="body2" color="textSecondary">
              Cargando cliente…
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (status === 'not-found' || status === 'error') {
    const message =
      status === 'not-found'
        ? 'No encontramos el cliente solicitado.'
        : 'No pudimos cargar el cliente. Intentá nuevamente.';
    return (
      <Box data-testid="client-edit-page">
        <Paper className={classes.paper} elevation={1}>
          <Box className={classes.centered} data-testid="client-edit-error">
            <Typography variant="h6" component="p">
              {message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
              data-testid="client-edit-back"
            >
              Volver al listado
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box data-testid="client-edit-page">
      <Box className={classes.header}>
        <Typography variant="h5" component="h1">
          Editar cliente
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Actualizá la información del cliente.
        </Typography>
      </Box>

      <Paper className={classes.paper} elevation={1}>
        <ClientForm
          mode="edit"
          {...(values ? { initialValues: values } : {})}
          interests={interests.items}
          interestsLoading={interests.isLoading}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={goBack}
          onImageError={(message): void => feedback.warning(message)}
        />
      </Paper>
    </Box>
  );
};

export default ClientEditPage;
