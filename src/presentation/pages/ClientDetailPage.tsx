import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import PhotoOutlinedIcon from '@material-ui/icons/PhotoOutlined';
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import type { Client } from '@domain/entities/Client';
import { NotFoundError } from '@domain/errors';
import type { DomainError } from '@domain/errors/DomainError';
import { useInterests } from '@presentation/features/clients/useInterests';
import { useFeedback } from '@presentation/providers/feedback/FeedbackContext';
import { useClientRepository } from '@presentation/providers/repositories/RepositoriesContext';
import { buildPath, ROUTES } from '@presentation/routing/routes';
import { toDomainErrorMessage } from '@presentation/utils/domainErrorMessage';

interface RouteParams {
  readonly id: string;
}

type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

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
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(6, 3),
  },
  details: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1.5),
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: '1fr 1fr',
      columnGap: theme.spacing(4),
    },
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  imageBlock: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
  imageFrame: {
    width: 150,
    height: 150,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.default,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
    border: `1px dashed ${theme.palette.divider}`,
    backgroundColor: theme.palette.action.hover,
  },
}));

const toDisplayDate = (value: string): string => value.slice(0, 10);

export const ClientDetailPage: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const repository = useClientRepository();
  const feedback = useFeedback();
  const interests = useInterests();

  const [status, setStatus] = useState<LoadStatus>('loading');
  const [client, setClient] = useState<Client | null>(null);

  const goBack = useCallback((): void => {
    history.push(ROUTES.clients.list);
  }, [history]);

  const goToEdit = useCallback((): void => {
    history.push(buildPath.clientEdit(id));
  }, [history, id]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    repository
      .getById(id)
      .then((result) => {
        if (cancelled) return;
        setClient(result);
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
  }, [feedback, id, repository]);

  const interestLabel = useMemo((): string => {
    if (!client) return '';
    const match = interests.items.find((item) => item.id === client.interestId);
    return match?.description ?? client.interestId;
  }, [client, interests.items]);

  if (status === 'loading') {
    return (
      <Box data-testid="client-detail-page">
        <Paper className={classes.paper} elevation={1}>
          <Box className={classes.centered} data-testid="client-detail-loading">
            <CircularProgress />
            <Typography variant="body2" color="textSecondary">
              Cargando cliente...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (status === 'not-found' || status === 'error' || !client) {
    const message =
      status === 'not-found'
        ? 'No encontramos el cliente solicitado.'
        : 'No pudimos cargar el cliente. Intenta nuevamente.';
    return (
      <Box data-testid="client-detail-page">
        <Paper className={classes.paper} elevation={1}>
          <Box className={classes.centered} data-testid="client-detail-error">
            <Typography variant="h6" component="p">
              {message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
              data-testid="client-detail-back"
            >
              Volver al listado
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box data-testid="client-detail-page">
      <Box className={classes.header}>
        <Box>
          <Typography variant="h5" component="h1">
            Detalle de cliente
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Consulta la informaci&oacute;n registrada del cliente.
          </Typography>
        </Box>
        <Box className={classes.toolbar}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={goBack}
            data-testid="client-detail-back"
          >
            Regresar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={goToEdit}
            data-testid="client-detail-edit"
          >
            Editar
          </Button>
        </Box>
      </Box>

      <Paper className={classes.paper} elevation={1}>
        <Box className={classes.imageBlock}>
          <Box className={classes.imageFrame}>
            {client.image ? (
              <img src={client.image} alt={`Foto de ${client.firstName}`} className={classes.image} />
            ) : (
              <Box className={classes.imageFallback} data-testid="client-detail-image-fallback">
                <PhotoOutlinedIcon style={{ fontSize: 56 }} />
                <Typography variant="body2">Sin imagen</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box className={classes.details}>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Nombre
            </Typography>
            <Typography variant="body1">{client.firstName}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Apellidos
            </Typography>
            <Typography variant="body1">{client.lastName}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Identificaci&oacute;n
            </Typography>
            <Typography variant="body1">{client.identification}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Tel&eacute;fono celular
            </Typography>
            <Typography variant="body1">{client.mobilePhone}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Otro tel&eacute;fono
            </Typography>
            <Typography variant="body1">{client.otherPhone || '-'}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Direcci&oacute;n
            </Typography>
            <Typography variant="body1">{client.address}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Fecha de nacimiento
            </Typography>
            <Typography variant="body1">{toDisplayDate(client.birthDate)}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Fecha de afiliaci&oacute;n
            </Typography>
            <Typography variant="body1">{toDisplayDate(client.affiliationDate)}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Sexo
            </Typography>
            <Typography variant="body1">{client.gender}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Inter&eacute;s
            </Typography>
            <Typography variant="body1">{interestLabel}</Typography>
          </Box>
          <Box className={classes.field}>
            <Typography variant="caption" color="textSecondary">
              Rese&ntilde;a personal
            </Typography>
            <Typography variant="body1">{client.personalReview || '-'}</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ClientDetailPage;
