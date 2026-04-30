import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SaveIcon from '@material-ui/icons/Save';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { useHistory } from 'react-router-dom';

import type { ClientDraft } from '@domain/entities/Client';
import type { DomainError } from '@domain/errors/DomainError';
import { ClientForm } from '@presentation/features/clients/ClientForm';
import { useInterests } from '@presentation/features/clients/useInterests';
import { useAuth } from '@presentation/providers/auth/AuthContext';
import { useFeedback } from '@presentation/providers/feedback/FeedbackContext';
import { useClientRepository } from '@presentation/providers/repositories/RepositoriesContext';
import { ROUTES } from '@presentation/routing/routes';
import { toDomainErrorMessage } from '@presentation/utils/domainErrorMessage';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
  },
}));

const CREATE_FORM_ID = 'client-create-form';

export const ClientCreatePage: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const auth = useAuth();
  const feedback = useFeedback();
  const repository = useClientRepository();
  const interests = useInterests();
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

  const handleSubmit = useCallback(
    async (draft: ClientDraft): Promise<void> => {
      if (!auth.session) return;
      setSubmitting(true);
      try {
        await repository.create(draft, auth.session.userId);
        feedback.success('Cliente creado correctamente.');
        history.push(ROUTES.clients.list);
      } catch (error) {
        feedback.error(toDomainErrorMessage(error as DomainError));
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [auth.session, feedback, history, repository],
  );

  return (
    <Box data-testid="client-create-page">
      <Box className={classes.header}>
        <Box>
          <Typography variant="h5" component="h1">
            Nuevo cliente
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Completa la información para registrar un cliente nuevo.
          </Typography>
        </Box>
        <Box className={classes.toolbar}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={goBack}
            disabled={submitting}
            data-testid="client-create-back"
          >
            Regresar
          </Button>
          <Button
            type="submit"
            form={CREATE_FORM_ID}
            variant="contained"
            color="primary"
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            disabled={submitting}
            data-testid="client-create-save"
          >
            Guardar
          </Button>
        </Box>
      </Box>

      <Paper className={classes.paper} elevation={1}>
        <ClientForm
          formId={CREATE_FORM_ID}
          interests={interests.items}
          interestsLoading={interests.isLoading}
          onSubmit={handleSubmit}
          onImageError={(message): void => feedback.warning(message)}
        />
      </Paper>
    </Box>
  );
};

export default ClientCreatePage;
