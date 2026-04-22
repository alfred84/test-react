import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { useHistory } from 'react-router-dom';

import type { ClientFilters, ClientSummary } from '@domain/entities/Client';
import type { DomainError } from '@domain/errors/DomainError';
import { ConfirmDialog } from '@presentation/components/ConfirmDialog';
import { ClientFiltersForm } from '@presentation/features/clients/ClientFiltersForm';
import { ClientsTable } from '@presentation/features/clients/ClientsTable';
import { useClients } from '@presentation/features/clients/useClients';
import { useAuth } from '@presentation/providers/auth/AuthContext';
import { useFeedback } from '@presentation/providers/feedback/FeedbackContext';
import { buildPath, ROUTES } from '@presentation/routing/routes';
import { toDomainErrorMessage } from '@presentation/utils/domainErrorMessage';

const useStyles = makeStyles((theme: Theme) => ({
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
  filtersPaper: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
}));

export const ClientsListPage: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const clients = useClients();
  const auth = useAuth();
  const feedback = useFeedback();
  const initialSearchRef = useRef(false);

  const [targetClient, setTargetClient] = useState<ClientSummary | null>(null);

  const runSearch = useCallback(
    async (filters: ClientFilters): Promise<void> => {
      try {
        await clients.search(filters);
      } catch (error) {
        feedback.error(toDomainErrorMessage(error as DomainError));
      }
    },
    [clients, feedback],
  );

  useEffect(() => {
    if (initialSearchRef.current) return;
    if (!auth.isAuthenticated) return;
    initialSearchRef.current = true;
    void runSearch({});
  }, [auth.isAuthenticated, runSearch]);

  const handleAdd = useCallback((): void => {
    history.push(ROUTES.clients.create);
  }, [history]);

  const handleBack = useCallback((): void => {
    history.push(ROUTES.home);
  }, [history]);

  const handleEdit = useCallback(
    (client: ClientSummary): void => {
      history.push(buildPath.clientEdit(client.id));
    },
    [history],
  );

  const handleAskDelete = useCallback((client: ClientSummary): void => {
    setTargetClient(client);
  }, []);

  const closeDialog = useCallback((): void => {
    setTargetClient(null);
  }, []);

  const handleConfirmDelete = useCallback(async (): Promise<void> => {
    if (!targetClient) return;
    try {
      await clients.remove(targetClient.id);
      feedback.success('Cliente eliminado correctamente.');
      setTargetClient(null);
    } catch (error) {
      feedback.error(toDomainErrorMessage(error as DomainError));
      setTargetClient(null);
    }
  }, [clients, feedback, targetClient]);

  const isLoading = clients.status === 'loading';
  const isDeleting = clients.status === 'deleting';

  return (
    <Box data-testid="clients-list-page">
      <Box className={classes.header}>
        <Box>
          <Typography variant="h5" component="h1">
            Consulta de clientes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Buscá, editá y administrá los clientes registrados.
          </Typography>
        </Box>
        <Box className={classes.toolbar}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            data-testid="clients-back"
          >
            Regresar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            data-testid="clients-add"
          >
            Agregar cliente
          </Button>
        </Box>
      </Box>

      <Box className={classes.filtersPaper}>
        <ClientFiltersForm
          onSearch={(filters): void => {
            void runSearch(filters);
          }}
          disabled={isLoading || isDeleting}
        />
      </Box>

      <ClientsTable
        items={clients.items}
        loading={isLoading}
        deletingId={clients.pendingDeleteId}
        onEdit={handleEdit}
        onDelete={handleAskDelete}
      />

      <ConfirmDialog
        open={Boolean(targetClient)}
        title="Eliminar cliente"
        message={
          targetClient
            ? `¿Está seguro que desea eliminar al cliente ${targetClient.firstName} ${targetClient.lastName}?`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        loading={isDeleting}
        onConfirm={(): void => {
          void handleConfirmDelete();
        }}
        onCancel={closeDialog}
      />
    </Box>
  );
};

export default ClientsListPage;
